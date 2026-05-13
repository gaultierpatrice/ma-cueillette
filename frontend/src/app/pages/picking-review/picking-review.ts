import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { Review, Picking } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-cueillette-review',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './picking-review.html',
  styleUrls: ['./picking-review.css']
})
export class CueilletteReviewComponent implements OnInit {
  readonly pickingId: number;
  picking: Picking | null = null;
  reviews: Review[] = [];
  loading = true;
  error: string | null = null;
  
  rating = 0;
  comment = '';
  submitting = false;
  successMessage = '';
  errorMessage = '';
  hoveredStar = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pickingService: PickingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.pickingId = idParam ? parseInt(idParam, 10) : 0;
  }

  ngOnInit() {
    if (!this.pickingId) {
      this.error = 'ID de cueillette manquant';
      this.loading = false;
      return;
    }
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadPickingDetails();
    this.loadReviews();
  }

  loadPickingDetails() {
    this.pickingService.getPickingById(this.pickingId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.picking = data;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = getApiErrorMessage(err, 'Erreur lors du chargement de la cueillette');
          this.cdr.detectChanges();
        });
      },
    });
  }

  loadReviews() {
    this.pickingService.getPickingReviews(this.pickingId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.reviews = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  setRating(star: number) {
    this.rating = star;
  }

  setHoveredStar(star: number) {
    this.hoveredStar = star;
  }

  clearHoveredStar() {
    this.hoveredStar = 0;
  }

  isStarFilled(star: number): boolean {
    if (this.hoveredStar > 0) {
      return star <= this.hoveredStar;
    }
    return star <= this.rating;
  }

  submitReview() {
    if (this.rating === 0) {
      this.errorMessage = 'Veuillez sélectionner une note';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pickingService.addReview(this.pickingId, this.rating, this.comment).subscribe({
      next: (review) => {
        this.ngZone.run(() => {
          this.successMessage = 'Votre avis a été publié avec succès !';
          this.rating = 0;
          this.comment = '';
          this.submitting = false;
          this.loadReviews();
          this.cdr.detectChanges();
          
          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 5000);
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorMessage = getApiErrorMessage(
            err,
            "Erreur lors de la publication de l'avis. Veuillez réessayer.",
          );
          this.submitting = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < rating);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}

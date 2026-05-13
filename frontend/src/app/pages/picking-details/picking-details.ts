import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { Picking, Review } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-cueillette-details',
  imports: [RouterModule, CommonModule],
  templateUrl: './picking-details.html',
  styleUrls: ['./picking-details.css'],
})
export class CueilletteDetailsComponent implements OnInit {
  readonly defaultPickingImageUrl = '/assets/images/illustration/strawberry.jpg';
  picking: Picking | null = null;
  reviews: Review[] = [];
  allReviews: Review[] = [];
  loading = true;
  error: string | null = null;
  pickingId: number;
  favoritePickingIds: Set<number> = new Set();
  isLoginModalVisible = false;
  loginModalMessage = '';
  removePickingInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pickingService: PickingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
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
    this.loadPickingDetails();
    this.loadReviews();
    this.loadUserFavorites();
  }

  loadPickingDetails() {
    this.pickingService.getPickingById(this.pickingId).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.picking = data;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.error = getApiErrorMessage(err, 'Erreur lors du chargement de la cueillette');
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  loadReviews() {
    this.pickingService.getPickingReviews(this.pickingId).subscribe({
      next: (data) => {
        this.allReviews = data;
        this.reviews = data.slice(0, 3);
      },
      error: (err) => {
        // Silent fail - reviews are optional
      },
    });
  }

  get vegetables() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter((p) => !p.type || p.type.toUpperCase() === 'VEGETABLE');
  }

  get fruits() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter((p) => p.type?.toUpperCase() === 'FRUIT');
  }

  get averageRating(): number | null {
    if (!this.allReviews || this.allReviews.length === 0) return null;
    const sum = this.allReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.allReviews.length;
  }

  get totalReviews(): number {
    return this.allReviews ? this.allReviews.length : 0;
  }

  getGoogleMapsLink(): string {
    if (!this.picking) return '';
    return `https://www.google.com/maps/dir/?api=1&destination=${this.picking.lat},${this.picking.lng}`;
  }

  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  translateDay(day: string): string {
    const days: { [key: string]: string } = {
      MONDAY: 'Lundi',
      TUESDAY: 'Mardi',
      WEDNESDAY: 'Mercredi',
      THURSDAY: 'Jeudi',
      FRIDAY: 'Vendredi',
      SATURDAY: 'Samedi',
      SUNDAY: 'Dimanche',
    };
    return days[day] || day;
  }

  translateLabel(label: string): string {
    const labels: { [key: string]: string } = {
      ORGANIC: 'Bio',
      LOCAL: 'Local',
      FAIR_TRADE: 'Commerce équitable',
      BIO: 'Bio',
      ZERO_PESTICIDE: 'Zéro pesticide',
    };
    return labels[label] || label;
  }

  isFavorite(pickingId: number): boolean {
    return this.favoritePickingIds.has(pickingId);
  }

  get pickingImageSrc(): string {
    if (!this.picking) {
      return this.defaultPickingImageUrl;
    }
    const u = this.picking.imageUrl?.trim();
    return u ? u : this.defaultPickingImageUrl;
  }

  loadUserFavorites() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.pickingService.getUserFavorites().subscribe({
      next: (favorites) => {
        this.favoritePickingIds = new Set(favorites.map((p) => p.id));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
      },
    });
  }

  toggleFavorite() {
    if (!this.authService.isLoggedIn()) {
      this.loginModalMessage = 'Veuillez vous connecter pour ajouter des favoris';
      this.isLoginModalVisible = true;
      return;
    }

    if (this.favoritePickingIds.has(this.pickingId)) {
      this.pickingService.removeFromFavorites(this.pickingId).subscribe({
        next: () => {
          this.favoritePickingIds.delete(this.pickingId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loginModalMessage = getApiErrorMessage(err, 'Erreur lors de la suppression du favori');
          this.isLoginModalVisible = true;
        },
      });
    } else {
      this.pickingService.addToFavorites(this.pickingId).subscribe({
        next: () => {
          this.favoritePickingIds.add(this.pickingId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loginModalMessage = getApiErrorMessage(err, "Erreur lors de l'ajout du favori");
          this.isLoginModalVisible = true;
        },
      });
    }
  }

  hideLoginModal() {
    this.isLoginModalVisible = false;
  }

  get isAdmin(): boolean {
    return this.authService.getUserRole() === 'ADMIN';
  }

  confirmRemovePicking(): void {
    if (!this.isAdmin || this.removePickingInProgress || !this.pickingId) {
      return;
    }
    const name = this.picking?.name ?? 'cette cueillette';
    if (
      !confirm(
        `Supprimer définitivement « ${name} » ? Cette action est irréversible (avis, favoris, etc.).`,
      )
    ) {
      return;
    }
    this.removePickingInProgress = true;
    this.pickingService.deletePicking(this.pickingId).subscribe({
      next: () => {
        this.router.navigate(['/pickings']);
      },
      error: (err) => {
        this.removePickingInProgress = false;
        this.loginModalMessage = getApiErrorMessage(
          err,
          'Impossible de supprimer la cueillette. Vérifiez vos droits administrateur ou réessayez plus tard.',
        );
        this.isLoginModalVisible = true;
        this.cdr.detectChanges();
      },
    });
  }
}

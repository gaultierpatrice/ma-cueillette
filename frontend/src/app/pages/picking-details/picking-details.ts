import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { Picking, Review } from '../../services/picking.types';

@Component({
  selector: 'app-cueillette-details',
  imports: [RouterModule, CommonModule],
  templateUrl: './picking-details.html',
  styleUrls: ['./picking-details.css']
})
export class CueilletteDetailsComponent implements OnInit {
  picking: Picking | null = null;
  reviews: Review[] = [];
  loading = true;
  error: string | null = null;
  pickingId: string;
  favoritePickingIds: Set<string> = new Set();

  constructor(
    private route: ActivatedRoute,
    private pickingService: PickingService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.pickingId = this.route.snapshot.paramMap.get('id') ?? '';
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
          this.error = 'Erreur lors du chargement de la cueillette';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  loadReviews() {
    this.pickingService.getPickingReviews(this.pickingId).subscribe({
      next: (data) => {
        this.reviews = data.slice(0, 3);
      },
      error: (err) => {
        // Silent fail - reviews are optional
      }
    });
  }

  get vegetables() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter(p => p.type === 'VEGETABLE' || !p.type);
  }

  get fruits() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter(p => p.type === 'FRUIT');
  }

  getGoogleMapsLink(): string {
    if (!this.picking) return '';
    return `https://www.google.com/maps/dir/?api=1&destination=${this.picking.lat},${this.picking.lng}`;
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

  translateDay(day: string): string {
    const days: { [key: string]: string } = {
      'MONDAY': 'Lundi',
      'TUESDAY': 'Mardi',
      'WEDNESDAY': 'Mercredi',
      'THURSDAY': 'Jeudi',
      'FRIDAY': 'Vendredi',
      'SATURDAY': 'Samedi',
      'SUNDAY': 'Dimanche'
    };
    return days[day] || day;
  }

  translateLabel(label: string): string {
    const labels: { [key: string]: string } = {
      'ORGANIC': 'Bio',
      'LOCAL': 'Local',
      'FAIR_TRADE': 'Commerce équitable',
      'BIO': 'Bio',
      'ZERO_PESTICIDE': 'Zéro pesticide'
    };
    return labels[label] || label;
  }

  isFavorite(pickingId: string): boolean {
    return this.favoritePickingIds.has(pickingId);
  }

  loadUserFavorites() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.pickingService.getUserFavorites(token).subscribe({
      next: (favorites) => {
        this.favoritePickingIds = new Set(favorites.map(p => p.id));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
      }
    });
  }

  toggleFavorite() {
    if (!this.authService.isLoggedIn()) {
      alert('Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      alert('Veuillez vous connecter pour ajouter des favoris');
      return;
    }

    if (this.favoritePickingIds.has(this.pickingId)) {
      this.pickingService.removeFromFavorites(this.pickingId, token).subscribe({
        next: () => {
          this.favoritePickingIds.delete(this.pickingId);
          console.log('Removed from favorites:', this.pickingId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error removing favorite:', err);
          alert('Erreur lors de la suppression du favori');
        }
      });
    } else {
      this.pickingService.addToFavorites(this.pickingId, token).subscribe({
        next: () => {
          this.favoritePickingIds.add(this.pickingId);
          console.log('Added to favorites:', this.pickingId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error adding favorite:', err);
          alert('Erreur lors de l\'ajout du favori');
        }
      });
    }
  }
}

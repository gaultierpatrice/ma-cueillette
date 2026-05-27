import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { FavoritesService } from '../../services/favorites.service';
import { Picking, Review } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { translatePickingLabel } from '../../utils/picking-labels';
import { isFruitType, isVegetableType } from '../../utils/product-type';
import { getFavoriteModalMessage } from '../../services/favorites.types';
import { ModalComponent } from '../../shared/modal/modal';
import { PickingActionsComponent } from '../../shared/picking-actions/picking-actions';
import { RatingDisplayComponent } from '../../shared/rating-display/rating-display';
import { AsyncStateComponent } from '../../shared/async-state/async-state';
import { ReviewListComponent } from '../../shared/review-list/review-list';
import { resolvePickingImageUrl } from '../../utils/picking-image';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-cueillette-details',
  imports: [
    RouterModule,
    ModalComponent,
    PickingActionsComponent,
    RatingDisplayComponent,
    AsyncStateComponent,
    ReviewListComponent,
  ],
  templateUrl: './picking-details.html',
  styleUrls: ['./picking-details.css'],
})
export class CueilletteDetailsComponent implements OnInit {
  picking: Picking | null = null;
  reviews: Review[] = [];
  allReviews: Review[] = [];
  loading = true;
  error: string | null = null;
  pickingId: number;
  isLoginModalVisible = false;
  loginModalMessage = '';
  removePickingInProgress = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pickingService: PickingService,
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private seo: SeoService,
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
          this.seo.setPickingPage(data);
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
        this.ngZone.run(() => {
          this.allReviews = [...data];
          this.reviews = [...data.slice(0, 3)];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        // Silent fail - reviews are optional
      },
    });
  }

  get vegetables() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter((p) => isVegetableType(p.type));
  }

  get fruits() {
    if (!this.picking?.products) return [];
    return this.picking.products.filter((p) => isFruitType(p.type));
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
    return translatePickingLabel(label);
  }

  isFavorite(pickingId: number): boolean {
    return this.favoritesService.isFavorite(pickingId);
  }

  get pickingImageSrc(): string {
    return resolvePickingImageUrl(this.picking?.imageUrl);
  }

  loadUserFavorites() {
    this.favoritesService.loadUserFavorites().subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  toggleFavorite() {
    this.favoritesService.toggleFavorite(this.pickingId).subscribe((result) => {
      const message = getFavoriteModalMessage(result);
      if (message) {
        this.loginModalMessage = message;
        this.isLoginModalVisible = true;
      }
      this.cdr.detectChanges();
    });
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

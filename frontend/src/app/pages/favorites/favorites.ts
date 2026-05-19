import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { PickingWithDistance } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalComponent } from '../../shared/modal/modal';
import { PickingCardComponent } from '../../shared/picking-card/picking-card';

@Component({
  selector: 'app-favorites',
  imports: [RouterModule, CommonModule, ModalComponent, PickingCardComponent],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class FavoritesComponent implements OnInit {
  favoritePickings: PickingWithDistance[] = [];
  loading = true;
  error: string | null = null;
  isLoginModalVisible = false;
  loginModalMessage = '';

  constructor(
    private pickingService: PickingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Vous devez être connecté pour voir vos favoris';
      this.loading = false;
      return;
    }

    this.pickingService.getUserFavorites().subscribe({
      next: (data) => {
        this.favoritePickings = data.map((p) => ({ ...p, distance: undefined }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Erreur lors du chargement de vos favoris');
        this.loading = false;
      },
    });
  }

  removeFavorite(event: Event, pickingId: number) {
    event.stopPropagation();
    event.preventDefault();

    this.pickingService.removeFromFavorites(pickingId).subscribe({
      next: () => {
        this.favoritePickings = this.favoritePickings.filter(p => p.id !== pickingId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loginModalMessage = getApiErrorMessage(err, 'Erreur lors de la suppression du favori');
        this.isLoginModalVisible = true;
      }
    });
  }

  hideLoginModal() {
    this.isLoginModalVisible = false;
  }

  getGoogleMapsLink(picking: PickingWithDistance): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${picking.lat},${picking.lng}`;
  }

  openGoogleMaps(event: Event, picking: PickingWithDistance) {
    event.stopPropagation();
    event.preventDefault();
    const url = this.getGoogleMapsLink(picking);
    window.open(url, '_blank');
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { PickingWithDistance } from '../../services/picking.types';

@Component({
  selector: 'app-favorites',
  imports: [RouterModule, CommonModule],
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

    const token = this.authService.getToken();
    
    if (!token) {
      this.error = 'Vous devez être connecté pour voir vos favoris';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    this.pickingService.getUserFavorites(token).subscribe({
      next: (data) => {
        this.favoritePickings = data.map((p) => ({ ...p, distance: undefined }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de vos favoris';
        this.loading = false;
      },
    });
  }

  removeFavorite(event: Event, pickingId: number) {
    event.stopPropagation();
    event.preventDefault();

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.pickingService.removeFromFavorites(pickingId, token).subscribe({
      next: () => {
        this.favoritePickings = this.favoritePickings.filter(p => p.id !== pickingId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loginModalMessage = 'Erreur lors de la suppression du favori';
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

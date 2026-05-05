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
      console.log('User not logged in');
      this.error = 'Vous devez être connecté pour voir vos favoris';
      this.loading = false;
      return;
    }

    const token = this.authService.getToken();
    console.log('Token:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      console.log('No token found in localStorage');
      this.error = 'Vous devez être connecté pour voir vos favoris';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    console.log('Loading favorites with token...');
    this.pickingService.getUserFavorites(token).subscribe({
      next: (data) => {
        console.log('Favorites loaded:', data);
        this.favoritePickings = data.map((p) => ({ ...p, distance: undefined }));
        console.log('Mapped favorites:', this.favoritePickings);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading favorites:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.error = 'Erreur lors du chargement de vos favoris';
        this.loading = false;
      },
    });
  }

  removeFavorite(event: Event, pickingId: string) {
    event.stopPropagation();
    event.preventDefault();

    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.pickingService.removeFromFavorites(pickingId, token).subscribe({
      next: () => {
        console.log('Favorite removed:', pickingId);
        this.favoritePickings = this.favoritePickings.filter(p => p.id !== pickingId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error removing favorite:', err);
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

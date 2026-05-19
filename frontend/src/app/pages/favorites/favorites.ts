import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { FavoritesService } from '../../services/favorites.service';
import { getFavoriteModalMessage } from '../../services/favorites.types';
import { PickingWithDistance } from '../../services/picking.types';
import { ModalButton } from '../../shared/modal/modal.types';
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
  isRemoveConfirmModalVisible = false;
  pendingRemovePicking: PickingWithDistance | null = null;
  removeConfirmMessage = '';
  readonly removeConfirmButtons: ModalButton[] = [
    { label: 'Annuler', variant: 'cancel' },
    { label: 'Retirer', variant: 'primary' },
  ];

  constructor(
    private authService: AuthService,
    private favoritesService: FavoritesService,
    private cdr: ChangeDetectorRef,
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

    this.favoritesService.loadUserFavoritesWithError().subscribe(({ favorites, error }) => {
      this.favoritePickings = favorites.map((p) => ({ ...p, distance: undefined }));
      this.error = error;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  requestRemoveFavorite(_event: Event, picking: PickingWithDistance) {
    this.pendingRemovePicking = picking;
    this.removeConfirmMessage = `Êtes-vous sûr de vouloir retirer « ${picking.name} » de vos favoris ?`;
    this.isRemoveConfirmModalVisible = true;
  }

  hideRemoveConfirmModal() {
    this.isRemoveConfirmModalVisible = false;
    this.pendingRemovePicking = null;
  }

  onRemoveConfirmButton(index: number) {
    if (index === 0) {
      this.hideRemoveConfirmModal();
      return;
    }

    this.confirmRemoveFavorite();
  }

  confirmRemoveFavorite() {
    const pickingId = this.pendingRemovePicking?.id;
    if (pickingId === undefined) {
      return;
    }

    this.hideRemoveConfirmModal();

    this.favoritesService.removeFavorite(pickingId).subscribe((result) => {
      const message = getFavoriteModalMessage(result);
      if (message) {
        this.loginModalMessage = message;
        this.isLoginModalVisible = true;
      } else if (result.status === 'removed') {
        this.favoritePickings = this.favoritePickings.filter((p) => p.id !== pickingId);
      }
      this.cdr.detectChanges();
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

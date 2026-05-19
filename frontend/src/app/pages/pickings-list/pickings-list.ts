import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../services/picking.service';
import { GeolocationService } from '../../services/geolocation.service';
import { AuthService } from '../../services/auth';
import { PickingWithDistance, UserLocation } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalComponent } from '../../shared/modal/modal';

@Component({
  selector: 'app-cueillettes-list',
  imports: [RouterModule, CommonModule, FormsModule, ModalComponent],
  templateUrl: './pickings-list.html',
  styleUrls: ['./pickings-list.css'],
})
export class CueillettesListComponent implements OnInit {
  pickings: PickingWithDistance[] = [];
  loading = true;
  error: string | null = null;
  userLocation: UserLocation | null = null;
  locationMessage = '';
  addressInput = '';
  geolocating = false;
  sortBy: 'distance' | 'alphabetical' | 'postal_code' = 'alphabetical';
  locationSource = '';
  displayedPickingsCount = 10;
  favoritePickingIds: Set<number> = new Set();
  isLoginModalVisible = false;
  loginModalMessage = '';

  constructor(
    private pickingService: PickingService,
    private geolocationService: GeolocationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  get displayedPickings(): PickingWithDistance[] {
    return this.pickings.slice(0, this.displayedPickingsCount);
  }

  get hasMorePickings(): boolean {
    return this.displayedPickingsCount < this.pickings.length;
  }

  get remainingPickingsCount(): number {
    return this.pickings.length - this.displayedPickingsCount;
  }

  ngOnInit() {
    this.sortBy = 'alphabetical';
    this.loadPickings();
    this.loadUserFavorites();
  }

  loadPickings() {
    this.loading = true;
    this.error = null;

    this.pickingService.getAllPickings().subscribe({
      next: (data) => {
        this.pickings = data.map((p) => ({ ...p, distance: undefined }));
        this.sortPickings();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = getApiErrorMessage(err, 'Erreur lors du chargement des cueillettes');
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  useCurrentLocation() {
    this.geolocating = true;
    this.locationMessage = 'Récupération de votre position...';

    this.geolocationService.getCurrentPosition().subscribe({
      next: (location) => {
        this.userLocation = location;
        this.locationMessage = '';
        this.locationSource = 'votre position actuelle';
        this.calculateDistances();
        this.geolocating = false;
      },
      error: (err) => {
        this.locationMessage =
          err.message ||
          'Impossible de récupérer votre position. Veuillez entrer une adresse ou autoriser la géolocalisation.';
        this.geolocating = false;
      },
    });
  }

  async searchByAddress() {
    if (!this.addressInput.trim()) {
      return;
    }

    this.geolocating = true;
    this.locationMessage = "Recherche de l'adresse...";

    const location = await this.geolocationService.geocodeAddress(this.addressInput);

    if (location) {
      this.userLocation = location;
      this.locationMessage = '';
      this.locationSource = this.addressInput;
      this.calculateDistances();
    } else {
      this.locationMessage = 'Adresse introuvable. Veuillez réessayer.';
    }

    this.geolocating = false;
  }

  showMorePickings() {
    this.displayedPickingsCount += 10;
  }

  resetDisplayCount() {
    this.displayedPickingsCount = 10;
  }

  calculateDistances() {
    if (!this.userLocation) {
      return;
    }

    this.pickings = this.pickings.map((picking) => {
      const distance = this.geolocationService.calculateDistance(
        this.userLocation!.lat,
        this.userLocation!.lng,
        picking.lat,
        picking.lng,
      );
      return {
        ...picking,
        distance,
      };
    });

    this.sortBy = 'distance';
    this.resetDisplayCount();
    this.sortPickings();
    this.cdr.detectChanges();
  }

  sortPickings() {
    if (
      this.sortBy === 'distance' &&
      this.userLocation &&
      this.pickings.some((p) => p.distance !== undefined)
    ) {
      this.pickings.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (this.sortBy === 'postal_code') {
      this.pickings.sort((a, b) => {
        const postalA = a.postalCode || '';
        const postalB = b.postalCode || '';
        return postalA.localeCompare(postalB, undefined, { numeric: true });
      });
    } else {
      this.pickings.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  setSortBy(sortType: 'distance' | 'alphabetical' | 'postal_code') {
    this.sortBy = sortType;
    this.resetDisplayCount();
    this.sortPickings();
  }

  clearLocation() {
    this.userLocation = null;
    this.addressInput = '';
    this.locationMessage = '';
    this.locationSource = '';
    this.sortBy = 'alphabetical';
    this.resetDisplayCount();
    this.pickings = this.pickings.map((p) => ({ ...p, distance: undefined }));
    this.sortPickings();
  }

  isFavorite(pickingId: number): boolean {
    return this.favoritePickingIds.has(pickingId);
  }

  loadUserFavorites() {
    if (!this.authService.isLoggedIn()) {
      return;
    }

    this.pickingService.getUserFavorites().subscribe({
      next: (favorites) => {
        this.favoritePickingIds = new Set(favorites.map(p => p.id));
      },
      error: (err) => {
      }
    });
  }

  toggleFavorite(event: Event, pickingId: number) {
    event.stopPropagation();
    event.preventDefault();

    if (!this.authService.isLoggedIn()) {
      this.loginModalMessage = 'Veuillez vous connecter pour ajouter des favoris';
      this.isLoginModalVisible = true;
      return;
    }

    if (this.favoritePickingIds.has(pickingId)) {
      this.pickingService.removeFromFavorites(pickingId).subscribe({
        next: () => {
          this.favoritePickingIds.delete(pickingId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loginModalMessage = getApiErrorMessage(err, 'Erreur lors de la suppression du favori');
          this.isLoginModalVisible = true;
        },
      });
    } else {
      this.pickingService.addToFavorites(pickingId).subscribe({
        next: () => {
          this.favoritePickingIds.add(pickingId);
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

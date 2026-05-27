import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { GeolocationService } from '../../services/geolocation.service';
import { FavoritesService } from '../../services/favorites.service';
import { getFavoriteModalMessage } from '../../services/favorites.types';
import { PickingWithDistance, UserLocation } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { matchesProductTypeFilter, type ProductTypeFilter } from '../../utils/product-type';
import { PickingService } from '../../services/picking.service';
import { ModalComponent } from '../../shared/modal/modal';
import { PickingCardComponent } from '../../shared/picking-card/picking-card';
import { AsyncStateComponent } from '../../shared/async-state/async-state';

@Component({
  selector: 'app-cueillettes-list',
  imports: [RouterModule, FormsModule, ModalComponent, PickingCardComponent, AsyncStateComponent],
  templateUrl: './pickings-list.html',
  styleUrls: ['./pickings-list.css'],
})
export class CueillettesListComponent implements OnInit {
  private allPickings: PickingWithDistance[] = [];
  pickings: PickingWithDistance[] = [];
  loading = true;
  error: string | null = null;
  userLocation: UserLocation | null = null;
  locationMessage = '';
  addressInput = '';
  geolocating = false;
  sortBy: 'distance' | 'alphabetical' | 'postal_code' = 'alphabetical';
  productTypeFilter: ProductTypeFilter = 'all';
  locationSource = '';
  displayedPickingsCount = 10;
  isLoginModalVisible = false;
  loginModalMessage = '';

  constructor(
    private pickingService: PickingService,
    private geolocationService: GeolocationService,
    private favoritesService: FavoritesService,
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
        this.allPickings = data.map((p) => ({ ...p, distance: undefined }));
        this.applyFiltersAndSort();
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

    this.allPickings = this.allPickings.map((picking) => {
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
    this.applyFiltersAndSort();
    this.cdr.detectChanges();
  }

  setProductTypeFilter(filter: ProductTypeFilter) {
    this.productTypeFilter = filter;
    this.resetDisplayCount();
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    this.pickings = this.allPickings.filter((p) =>
      matchesProductTypeFilter(p, this.productTypeFilter),
    );
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
    this.applyFiltersAndSort();
  }

  clearLocation() {
    this.userLocation = null;
    this.addressInput = '';
    this.locationMessage = '';
    this.locationSource = '';
    this.sortBy = 'alphabetical';
    this.resetDisplayCount();
    this.allPickings = this.allPickings.map((p) => ({ ...p, distance: undefined }));
    this.applyFiltersAndSort();
  }

  isFavorite(pickingId: number): boolean {
    return this.favoritesService.isFavorite(pickingId);
  }

  loadUserFavorites() {
    this.favoritesService.loadUserFavorites().subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  toggleFavorite(_event: Event, pickingId: number) {
    this.favoritesService.toggleFavorite(pickingId).subscribe((result) => {
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

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../services/picking.service';
import { GeolocationService } from '../../services/geolocation.service';
import { PickingWithDistance, UserLocation } from '../../services/picking.types';

@Component({
  selector: 'app-cueillettes-list',
  imports: [RouterModule, CommonModule, FormsModule],
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
  sortBy: 'distance' | 'alphabetical' | 'postal_code' = 'distance';
  showPickings = false;
  locationSource = '';
  displayedPickingsCount = 10;

  constructor(
    private pickingService: PickingService,
    private geolocationService: GeolocationService,
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
  }

  loadPickings() {
    this.loading = true;
    this.error = null;

    this.pickingService.getAllPickings().subscribe({
      next: (data) => {
        this.pickings = data.map((p) => ({ ...p, distance: undefined }));
        this.sortPickings();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des cueillettes';
        this.loading = false;
        console.error(err);
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
        this.showPickings = true;
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
      this.showPickings = true;
      this.locationSource = this.addressInput;
      this.calculateDistances();
    } else {
      this.locationMessage = 'Adresse introuvable. Veuillez réessayer.';
    }

    this.geolocating = false;
  }

  viewAllPickings() {
    this.showPickings = true;
    this.sortBy = 'alphabetical';
    this.resetDisplayCount();
    this.sortPickings();
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
    this.showPickings = false;
    this.sortBy = 'alphabetical';
    this.resetDisplayCount();
    this.pickings = this.pickings.map((p) => ({ ...p, distance: undefined }));
    this.sortPickings();
  }
}

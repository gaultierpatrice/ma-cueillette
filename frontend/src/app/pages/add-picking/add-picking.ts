import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PickingService } from '../../services/picking.service';
import { GeolocationService } from '../../services/geolocation.service';
import { CommonModule } from '@angular/common';

interface ProductForm {
  name: string;
  type: string;
  harvestSeason: string;
}

@Component({
  selector: 'app-add-cueillette',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './add-picking.html',
  styleUrls: ['./add-picking.css'],
})
export class AddCueilletteComponent implements OnInit {
  form = {
    name: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    openingHours: '',
    description: ''
  };

  categories = {
    fruits: false,
    vegetables: false
  };

  products: ProductForm[] = [];

  newProduct: ProductForm = {
    name: '',
    type: '',
    harvestSeason: ''
  };

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  
  addressValidated = false;
  isValidatingAddress = false;
  addressValidationMessage = '';
  coordinates: { lat: number; lng: number } | null = null;
  private addressValidationTimeout: any = null;

  constructor(
    private authService: AuthService,
    private pickingService: PickingService,
    private geolocationService: GeolocationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const farmName = this.authService.getFarmName();
    if (farmName) {
      this.form.name = farmName;
    }
  }

  autoResize(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  addProduct(): void {
    if (this.newProduct.name.trim() && this.newProduct.type) {
      this.products.push({
        name: this.newProduct.name.trim(),
        type: this.newProduct.type,
        harvestSeason: this.newProduct.harvestSeason.trim()
      });
      this.newProduct = {
        name: '',
        type: '',
        harvestSeason: ''
      };
    }
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
  }

  onAddressFieldChange(): void {
    this.addressValidated = false;
    this.addressValidationMessage = '';
    this.coordinates = null;

    if (this.addressValidationTimeout) {
      clearTimeout(this.addressValidationTimeout);
    }

    if (!this.form.address || !this.form.postalCode || !this.form.city) {
      return;
    }

    this.addressValidationTimeout = setTimeout(() => {
      this.validateAddress();
    }, 1500);
  }

  private async validateAddress(): Promise<void> {
    if (!this.form.address || !this.form.postalCode || !this.form.city) {
      return;
    }

    this.isValidatingAddress = true;
    this.addressValidationMessage = '🔍 Vérification de l\'adresse...';

    const fullAddress = `${this.form.address}, ${this.form.postalCode} ${this.form.city}, France`;
    const location = await this.geolocationService.geocodeAddress(fullAddress);

    this.isValidatingAddress = false;

    if (location) {
      this.coordinates = location;
      this.addressValidated = true;
      this.addressValidationMessage = `✓ Adresse valide`;
    } else {
      this.addressValidationMessage = '⚠ Adresse introuvable. Vérifiez votre saisie.';
      this.addressValidated = false;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.addressValidated || !this.coordinates) {
      this.errorMessage = 'Veuillez d\'abord vérifier l\'adresse avant de soumettre le formulaire.';
      return;
    }

    this.isSubmitting = true;

    const token = this.authService.getToken();
    if (!token) {
      this.errorMessage = 'Vous devez être connecté pour ajouter une cueillette.';
      this.isSubmitting = false;
      return;
    }

    const submissionData = {
      ...this.form,
      lat: this.coordinates.lat,
      lng: this.coordinates.lng,
      categories: this.categories,
      products: this.products
    };

    this.pickingService.createPicking(submissionData, token).subscribe({
      next: (response) => {
        this.successMessage = 'Votre cueillette a été ajoutée avec succès!';
        this.isSubmitting = false;
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating picking:', error);
        this.errorMessage = 'Une erreur est survenue lors de l\'ajout de votre cueillette. Veuillez réessayer.';
        this.isSubmitting = false;
      }
    });
  }
}

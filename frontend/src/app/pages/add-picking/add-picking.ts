import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
    phoneSecondary: '',
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
  isSuccessModalVisible = false;
  
  addressValidated = false;
  isValidatingAddress = false;
  addressValidationMessage = '';
  coordinates: { lat: number; lng: number } | null = null;

  constructor(
    private authService: AuthService,
    private pickingService: PickingService,
    private geolocationService: GeolocationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const farmName = this.authService.getFarmName();
    if (farmName) {
      this.form.name = farmName;
    }
  }

  /**
   * Prevents implicit HTML form submission on Enter while typing in inputs (checkboxes, text…).
   * Textareas, selects, and buttons keep normal Enter behavior (new line, choose option, activate button).
   */
  onFormKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== 'NumpadEnter') {
      return;
    }
    const t = event.target;
    if (
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLButtonElement ||
      t instanceof HTMLSelectElement
    ) {
      return;
    }
    if (t instanceof HTMLInputElement) {
      event.preventDefault();
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
  }

  onAddressBlur(): void {
    const prevAddress = this.form.address;
    const prevPostal = this.form.postalCode;
    const prevCity = this.form.city;
    this.sanitizeAddressInputs();
    if (
      prevAddress !== this.form.address ||
      prevPostal !== this.form.postalCode ||
      prevCity !== this.form.city
    ) {
      this.addressValidated = false;
      this.addressValidationMessage = '';
      this.coordinates = null;
    }
    this.cdr.markForCheck();
  }

  /** Trim, collapse spaces; normalize postal (FR 5 digits); title-case ville (fr-FR). */
  sanitizeAddressInputs(): void {
    this.form.address = this.normalizeWhitespace(this.form.address ?? '');
    this.form.postalCode = this.normalizeFrenchPostalCode(this.form.postalCode ?? '');
    const cityWs = this.normalizeWhitespace(this.form.city ?? '');
    this.form.city = cityWs ? this.capitalizeFrenchPlaceWords(cityWs) : '';
  }

  private normalizeWhitespace(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /** Keeps digits only and caps length at 5 ( métropolitain / DOM métropolitain-like ). */
  private normalizeFrenchPostalCode(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 5);
  }

  /**
   * Words separated by spaces or hyphens: first letter upper, rest lower (locale fr).
   * Heuristic only — no garantee pour les noms officiels complexes (Saint-Jean-d’Angély, etc.).
   */
  private capitalizeFrenchPlaceWords(value: string): string {
    return value
      .split(/\s+/)
      .filter(Boolean)
      .map((word) =>
        word
          .split('-')
          .map((part) => {
            if (!part.length) {
              return part;
            }
            const lower = part.toLocaleLowerCase('fr-FR');
            return lower.charAt(0).toLocaleUpperCase('fr-FR') + lower.slice(1);
          })
          .join('-')
      )
      .join(' ');
  }

  verifyAddress(): void {
    if (this.isValidatingAddress) {
      return;
    }
    if (!this.hasCompleteAddressInput()) {
      this.addressValidationMessage =
        'Veuillez compléter l’adresse, le code postal et la ville avant de vérifier.';
      this.cdr.markForCheck();
      return;
    }
    // Zoneless Angular: defer one tick so ngModel catches the last keystroke before validate.
    void Promise.resolve().then(() => void this.validateAddress());
  }

  private hasCompleteAddressInput(): boolean {
    return !!(
      this.form.address?.trim() &&
      this.form.postalCode?.trim() &&
      this.form.city?.trim()
    );
  }

  private async validateAddress(): Promise<void> {
    if (!this.hasCompleteAddressInput() || this.isValidatingAddress) {
      return;
    }

    this.sanitizeAddressInputs();
    this.cdr.markForCheck();

    if (!this.hasCompleteAddressInput()) {
      this.addressValidationMessage =
        'Veuillez vérifier l’adresse : champs remplis et code postal à 5 chiffres.';
      this.addressValidated = false;
      this.coordinates = null;
      this.cdr.detectChanges();
      return;
    }

    this.isValidatingAddress = true;
    this.cdr.markForCheck();

    const addr = this.form.address;
    const postal = this.form.postalCode;
    const city = this.form.city;
    const fullAddress = `${addr}, ${postal} ${city}, France`;

    try {
      const location = await this.geolocationService.geocodeAddress(fullAddress);

      if (location) {
        this.coordinates = location;
        this.addressValidated = true;
        this.addressValidationMessage = 'Adresse valide.';
      } else {
        this.addressValidationMessage = 'Adresse introuvable. Vérifiez votre saisie.';
        this.addressValidated = false;
      }
    } finally {
      this.isValidatingAddress = false;
      // fetch()/Promise continuations run outside Angular’s zoneless CD — refresh the view here.
      this.cdr.detectChanges();
    }
  }

  onSubmit(): void {
    this.errorMessage = '';

    this.sanitizeAddressInputs();
    this.cdr.markForCheck();

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
      next: () => {
        this.isSubmitting = false;
        this.isSuccessModalVisible = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating picking:', error);
        this.errorMessage = 'Une erreur est survenue lors de l\'ajout de votre cueillette. Veuillez réessayer.';
        this.isSubmitting = false;
        this.cdr.detectChanges();
      }
    });
  }

  dismissSuccessModal(): void {
    if (!this.isSuccessModalVisible) {
      return;
    }
    this.isSuccessModalVisible = false;
    void this.router.navigate(['/dashboard']);
  }
}

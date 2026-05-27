import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PickingService } from '../../services/picking.service';
import { Picking, Product } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalComponent } from '../../shared/modal/modal';
import {
  LABEL_OPTIONS,
  translatePickingLabel,
  type PickingLabelValue,
} from '../../utils/picking-labels';
import { resolvePickingImageUrl, validatePickingImageFile } from '../../utils/picking-image';
import { concatMap } from 'rxjs';

interface ProductForm {
  name: string;
  type: string;
  harvestSeason: string;
}

@Component({
  selector: 'app-modify-picking',
  imports: [RouterModule, FormsModule, ModalComponent],
  templateUrl: './modify-picking.html',
  styleUrls: ['../add-picking/add-picking.css'],
})
export class ModifyPickingComponent implements OnInit {
  pickingId: number | null = null;
  isLoading = true;
  loadError = '';

  form = {
    /** Avoid `form.name` + input name="name" — breaks ngModel in template-driven forms */
    exploitationName: '',
    phone: '',
    phoneSecondary: '',
    email: '',
    website: '',
    openingHours: '',
    description: '',
  };

  categories = {
    fruits: false,
    vegetables: false,
  };

  readonly labelOptions = LABEL_OPTIONS;
  selectedLabels: PickingLabelValue[] = [];
  pendingLabel: PickingLabelValue | '' = '';

  products: ProductForm[] = [];
  newProduct: ProductForm = { name: '', type: '', harvestSeason: '' };

  isSubmitting = false;
  errorMessage = '';
  isSuccessModalVisible = false;

  currentImageUrl = '';
  imagePreviewUrl = '';
  pendingImageFile: File | null = null;
  imageError = '';

  constructor(
    private pickingService: PickingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.pickingService.getMyPicking().subscribe({
      next: (picking) => {
        if (!picking) {
          void this.router.navigate(['/add-picking']);
          return;
        }
        this.populateForm(picking);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'Impossible de charger votre cueillette. Veuillez réessayer.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private populateForm(picking: Picking): void {
    this.pickingId = picking.id;
    this.form.exploitationName = picking.name;
    this.form.phone = picking.phone ?? '';
    this.form.phoneSecondary = picking.phoneSecondary ?? '';
    this.form.email = picking.email ?? '';
    this.form.website = picking.website ?? '';
    this.form.openingHours = picking.openingHours ?? '';
    this.form.description = picking.description ?? '';
    this.categories.fruits = picking.hasFruits ?? false;
    this.categories.vegetables = picking.hasVegetables ?? false;
    this.selectedLabels = (picking.labels ?? []) as PickingLabelValue[];
    this.products = (picking.products ?? []).map((product) => this.toProductForm(product));
    this.currentImageUrl = picking.imageUrl ?? '';
    this.imagePreviewUrl = resolvePickingImageUrl(this.currentImageUrl);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.imageError = '';

    if (!file) {
      return;
    }

    const validationError = validatePickingImageFile(file);
    if (validationError) {
      this.imageError = validationError;
      input.value = '';
      return;
    }

    if (this.imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.pendingImageFile = file;
    this.imagePreviewUrl = URL.createObjectURL(file);
    this.cdr.markForCheck();
  }

  private toProductForm(product: Product): ProductForm {
    return {
      name: product.name,
      type: product.type ?? '',
      harvestSeason: product.harvestSeason ?? '',
    };
  }

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
        harvestSeason: this.newProduct.harvestSeason.trim(),
      });
      this.newProduct = { name: '', type: '', harvestSeason: '' };
    }
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
  }

  get availableLabelOptions() {
    const selected = new Set(this.selectedLabels);
    return this.labelOptions.filter((option) => !selected.has(option.value));
  }

  translateLabel(value: PickingLabelValue): string {
    return translatePickingLabel(value);
  }

  addLabel(): void {
    if (!this.pendingLabel || this.selectedLabels.includes(this.pendingLabel)) {
      return;
    }
    this.selectedLabels.push(this.pendingLabel);
    this.pendingLabel = '';
  }

  removeLabel(index: number): void {
    this.selectedLabels.splice(index, 1);
  }

  onSubmit(): void {
    if (this.pickingId == null) {
      return;
    }

    this.errorMessage = '';

    if (!this.form.exploitationName.trim()) {
      this.errorMessage = "Le nom de l'exploitation est obligatoire.";
      return;
    }

    this.isSubmitting = true;

    const submissionData = {
      name: this.form.exploitationName.trim(),
      phone: this.form.phone,
      phoneSecondary: this.form.phoneSecondary,
      email: this.form.email,
      website: this.form.website,
      openingHours: this.form.openingHours,
      description: this.form.description,
      categories: this.categories,
      products: this.products,
      labels: [...this.selectedLabels],
    };

    const save$ = this.pendingImageFile
      ? this.pickingService
          .uploadPickingImage(this.pickingId, this.pendingImageFile)
          .pipe(concatMap(() => this.pickingService.updatePicking(this.pickingId!, submissionData)))
      : this.pickingService.updatePicking(this.pickingId, submissionData);

    save$.subscribe({
      next: (picking) => {
        this.isSubmitting = false;
        this.pendingImageFile = null;
        this.form.exploitationName = picking.name;
        if (picking.imageUrl) {
          this.currentImageUrl = picking.imageUrl;
          this.imagePreviewUrl = resolvePickingImageUrl(picking.imageUrl, Date.now());
        }
        this.isSuccessModalVisible = true;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = getApiErrorMessage(
          error,
          'Une erreur est survenue lors de la mise à jour. Veuillez réessayer.',
        );
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
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

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickingService } from '../../services/picking.service';
import { AuthService } from '../../services/auth';
import { Review } from '../../services/picking.types';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalButton } from '../modal/modal.types';
import { ModalComponent } from '../modal/modal';

@Component({
  selector: 'app-review-list',
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './review-list.html',
  styleUrl: './review-list.css',
})
export class ReviewListComponent implements OnChanges {
  @Input({ required: true }) reviews: Review[] = [];
  @Input({ required: true }) pickingId!: number;

  @Output() reviewsChanged = new EventEmitter<void>();

  displayReviews: Review[] = [];
  successMessage = '';
  errorMessage = '';
  editingReviewId: number | null = null;
  editRating = 0;
  editComment = '';
  editHoveredStar = 0;
  editSubmitting = false;
  deletingReviewId: number | null = null;
  isDeleteConfirmModalVisible = false;
  pendingDeleteReview: Review | null = null;
  deleteConfirmMessage = '';
  readonly deleteConfirmButtons: ModalButton[] = [
    { label: 'Annuler', variant: 'cancel' },
    { label: 'Supprimer', variant: 'primary' },
  ];

  constructor(
    private pickingService: PickingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reviews']) {
      this.displayReviews = [...this.reviews];
      this.cdr.markForCheck();
    }
  }

  isOwnReview(review: Review): boolean {
    return this.authService.isLoggedIn() && review.user.name === this.authService.getUsername();
  }

  setEditRating(star: number) {
    this.editRating = star;
  }

  setEditHoveredStar(star: number) {
    this.editHoveredStar = star;
  }

  clearEditHoveredStar() {
    this.editHoveredStar = 0;
  }

  isEditStarFilled(star: number): boolean {
    if (this.editHoveredStar > 0) {
      return star <= this.editHoveredStar;
    }
    return star <= this.editRating;
  }

  startEdit(review: Review) {
    this.editingReviewId = review.id;
    this.editRating = review.rating;
    this.editComment = review.comment ?? '';
    this.editHoveredStar = 0;
    this.errorMessage = '';
  }

  cancelEdit() {
    this.editingReviewId = null;
    this.editRating = 0;
    this.editComment = '';
    this.editHoveredStar = 0;
  }

  saveEdit(reviewId: number) {
    if (this.editRating === 0) {
      this.errorMessage = 'Veuillez sélectionner une note';
      return;
    }

    this.editSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.pickingService
      .updateReview(this.pickingId, reviewId, this.editRating, this.editComment)
      .subscribe({
        next: (updated) => {
          this.successMessage = 'Votre avis a été modifié avec succès !';
          this.cancelEdit();
          this.editSubmitting = false;
          this.displayReviews = this.displayReviews.map((r) =>
            r.id === reviewId ? updated : r,
          );
          this.reviewsChanged.emit();
          this.cdr.markForCheck();
          this.clearSuccessMessageLater();
        },
        error: (err) => {
          this.errorMessage = getApiErrorMessage(
            err,
            "Erreur lors de la modification de l'avis. Veuillez réessayer.",
          );
          this.editSubmitting = false;
          this.cdr.markForCheck();
        },
      });
  }

  requestDeleteReview(review: Review) {
    this.pendingDeleteReview = review;
    this.deleteConfirmMessage = 'Supprimer cet avis ? Cette action est irréversible.';
    this.isDeleteConfirmModalVisible = true;
  }

  hideDeleteConfirmModal() {
    this.isDeleteConfirmModalVisible = false;
    this.pendingDeleteReview = null;
  }

  onDeleteConfirmButton(index: number) {
    if (index === 0) {
      this.hideDeleteConfirmModal();
      return;
    }
    this.confirmDeleteReview();
  }

  confirmDeleteReview() {
    const review = this.pendingDeleteReview;
    if (!review) {
      return;
    }

    this.hideDeleteConfirmModal();
    this.deletingReviewId = review.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.pickingService.deleteReview(this.pickingId, review.id).subscribe({
      next: () => {
        if (this.editingReviewId === review.id) {
          this.cancelEdit();
        }
        this.deletingReviewId = null;
        this.displayReviews = this.displayReviews.filter((r) => r.id !== review.id);
        this.successMessage = 'Votre avis a été supprimé.';
        this.reviewsChanged.emit();
        this.cdr.markForCheck();
        this.clearSuccessMessageLater();
      },
      error: (err) => {
        this.errorMessage = getApiErrorMessage(
          err,
          "Erreur lors de la suppression de l'avis. Veuillez réessayer.",
        );
        this.deletingReviewId = null;
        this.cdr.markForCheck();
      },
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private clearSuccessMessageLater() {
    setTimeout(() => {
      this.successMessage = '';
      this.cdr.markForCheck();
    }, 5000);
  }
}

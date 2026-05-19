import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PickingWithDistance } from '../../services/picking.types';
import { PickingCardFavoriteMode } from './picking-card.types';

@Component({
  selector: 'app-picking-card',
  imports: [RouterModule, DecimalPipe],
  templateUrl: './picking-card.html',
  styleUrl: './picking-card.css',
})
export class PickingCardComponent {
  @Input({ required: true }) picking!: PickingWithDistance;
  @Input() isFavorite = false;
  @Input() showDistance = false;
  @Input() favoriteMode: PickingCardFavoriteMode = 'toggle';

  @Output() favoriteClick = new EventEmitter<Event>();
  @Output() gpsClick = new EventEmitter<Event>();

  get hasRating(): boolean {
    return (
      this.picking.averageRating !== null &&
      this.picking.averageRating !== undefined &&
      !!this.picking.reviewCount &&
      this.picking.reviewCount > 0
    );
  }

  get favoriteTitle(): string {
    if (this.favoriteMode === 'remove') {
      return 'Retirer des favoris';
    }

    return this.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris';
  }

  get favoriteIconSrc(): string {
    if (this.favoriteMode === 'remove' || this.isFavorite) {
      return 'assets/images/icons/heart-solid.png';
    }

    return 'assets/images/icons/heart-regular.png';
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteClick.emit(event);
  }

  onGpsClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.gpsClick.emit(event);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PickingWithDistance } from '../../services/picking.types';
import { PickingCardFavoriteMode } from './picking-card.types';
import { PickingActionsComponent } from '../picking-actions/picking-actions';

@Component({
  selector: 'app-picking-card',
  imports: [RouterModule, DecimalPipe, PickingActionsComponent],
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

  get gpsLink(): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${this.picking.lat},${this.picking.lng}`;
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PickingWithDistance } from '../../services/picking.types';
import { PickingCardFavoriteMode } from './picking-card.types';
import { PickingActionsComponent } from '../picking-actions/picking-actions';
import { RatingDisplayComponent } from '../rating-display/rating-display';

@Component({
  selector: 'app-picking-card',
  imports: [RouterModule, PickingActionsComponent, RatingDisplayComponent],
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

  get gpsLink(): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${this.picking.lat},${this.picking.lng}`;
  }
}

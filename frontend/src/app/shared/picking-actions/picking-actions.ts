import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  PickingActionsFavoriteMode,
  PickingActionsLayout,
} from './picking-actions.types';

@Component({
  selector: 'app-picking-actions',
  templateUrl: './picking-actions.html',
  styleUrl: './picking-actions.css',
})
export class PickingActionsComponent {
  @Input() layout: PickingActionsLayout = 'card';
  @Input() isFavorite = false;
  @Input() favoriteMode: PickingActionsFavoriteMode = 'toggle';
  @Input() gpsLink = '';
  @Input() showAdminRemove = false;
  @Input() removeInProgress = false;

  @Output() favoriteClick = new EventEmitter<Event>();
  @Output() gpsClick = new EventEmitter<Event>();
  @Output() adminRemoveClick = new EventEmitter<Event>();

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
    if (this.layout === 'card') {
      event.stopPropagation();
      event.preventDefault();
    }

    this.favoriteClick.emit(event);
  }

  onGpsClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.gpsClick.emit(event);
  }

  onAdminRemoveClick(event: Event): void {
    this.adminRemoveClick.emit(event);
  }
}

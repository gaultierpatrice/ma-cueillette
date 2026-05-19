import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RatingDisplaySize } from './rating-display.types';

@Component({
  selector: 'app-rating-display',
  imports: [DecimalPipe],
  templateUrl: './rating-display.html',
  styleUrl: './rating-display.css',
})
export class RatingDisplayComponent {
  @Input() rating: number | null | undefined = null;
  @Input() reviewCount: number | null | undefined = 0;
  @Input() size: RatingDisplaySize = 'sm';

  get shouldDisplay(): boolean {
    return (
      this.rating !== null &&
      this.rating !== undefined &&
      !!this.reviewCount &&
      this.reviewCount > 0
    );
  }
}

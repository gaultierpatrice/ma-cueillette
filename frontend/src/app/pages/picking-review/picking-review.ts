import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cueillette-review',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './picking-review.html',
})
export class CueilletteReviewComponent {
  readonly cueilletteId: string;

  constructor(private route: ActivatedRoute) {
    this.cueilletteId = this.route.snapshot.paramMap.get('id') ?? '';
  }
}


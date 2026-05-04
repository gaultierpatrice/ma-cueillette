import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cueillette-review',
  imports: [RouterModule],
  templateUrl: './picking-review.html',
})
export class CueilletteReviewComponent {
  readonly cueilletteId: string;

  constructor(private route: ActivatedRoute) {
    this.cueilletteId = this.route.snapshot.paramMap.get('id') ?? '';
  }
}

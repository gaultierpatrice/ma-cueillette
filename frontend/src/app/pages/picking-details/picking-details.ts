import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cueillette-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './picking-details.html',
})
export class CueilletteDetailsComponent {
  readonly id: string;

  constructor(private route: ActivatedRoute) {
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
  }
}


import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  imports: [RouterModule],
  templateUrl: './favorites.html',
})
export class FavoritesComponent {
  readonly exampleId = 12;
}

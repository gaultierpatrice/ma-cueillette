import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cueillettes-list',
  imports: [RouterModule],
  templateUrl: './pickings-list.html',
})
export class CueillettesListComponent {
  readonly exampleId = 12;
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cueillettes-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pickings-list.html',
})
export class CueillettesListComponent {
  readonly exampleId = 12;
}


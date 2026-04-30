import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-cueillette',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './add-picking.html',
})
export class AddCueilletteComponent {
}


import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './delete-account.html',
})
export class DeleteAccountComponent {}


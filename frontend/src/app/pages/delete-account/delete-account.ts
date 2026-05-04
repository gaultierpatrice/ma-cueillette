import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-delete-account',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './delete-account.html',
  styleUrl: './delete-account.css',
})
export class DeleteAccountComponent {
  showConfirmation = false;
  isDeleting = false;
  error = '';
  confirmationText = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  showConfirmDialog() {
    this.showConfirmation = true;
  }

  cancelDelete() {
    this.showConfirmation = false;
    this.confirmationText = '';
  }

  confirmDelete() {
    if (this.confirmationText !== 'SUPPRIMER') {
      this.error = 'Veuillez taper "SUPPRIMER" pour confirmer.';
      return;
    }

    this.isDeleting = true;
    this.error = '';

    this.userService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/']);
      },
      error: () => {
        this.error =
          'Une erreur est survenue lors de la suppression du compte.';
        this.isDeleting = false;
      },
    });
  }
}

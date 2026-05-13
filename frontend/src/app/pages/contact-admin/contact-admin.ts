import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactApiService } from '../../services/contact-api.service';

@Component({
  selector: 'app-contact-admin',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './contact-admin.html',
  styleUrl: './contact-admin.css',
})
export class ContactAdminComponent {
  form = {
    name: '',
    email: '',
    message: '',
  };

  submitting = false;
  sent = false;
  errorMessage = '';

  constructor(private contactApi: ContactApiService) {}

  onSubmit(): void {
    if (this.submitting) {
      return;
    }
    this.errorMessage = '';
    this.sent = false;
    this.submitting = true;

    this.contactApi.send({ ...this.form }).subscribe({
      next: () => {
        this.submitting = false;
        this.sent = true;
        this.form = { name: '', email: '', message: '' };
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        if (err.status === 400) {
          this.errorMessage =
            'Certains champs sont invalides. Vérifiez votre nom, e-mail et message.';
        } else if (err.status === 502) {
          this.errorMessage =
            "L'envoi a échoué côté serveur (e-mail). Réessayez dans quelques minutes.";
        } else {
          this.errorMessage =
            'Impossible d\'envoyer le message pour le moment. Réessayez plus tard.';
        }
      },
    });
  }
}

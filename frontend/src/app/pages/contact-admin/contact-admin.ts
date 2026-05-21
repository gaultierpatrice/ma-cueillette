import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ContactApiService } from '../../services/contact-api.service';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalButton } from '../../shared/modal/modal.types';
import { ModalComponent } from '../../shared/modal/modal';

@Component({
  selector: 'app-contact-admin',
  imports: [RouterModule, CommonModule, FormsModule, ModalComponent],
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
  isSuccessModalVisible = false;
  errorMessage = '';

  readonly successModalButtons: ModalButton[] = [
    { label: "Page d'accueil", variant: 'secondary' },
    { label: 'Liste des cueillettes', variant: 'primary' },
  ];

  constructor(
    private contactApi: ContactApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(): void {
    if (this.submitting) {
      return;
    }
    this.errorMessage = '';
    this.isSuccessModalVisible = false;
    this.submitting = true;

    this.contactApi.send({ ...this.form }).subscribe({
      next: () => {
        this.submitting = false;
        this.form = { name: '', email: '', message: '' };
        this.isSuccessModalVisible = true;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.submitting = false;
        const fromApi = getApiErrorMessage(err, '');
        if (fromApi) {
          this.errorMessage = fromApi;
        } else if (err.status === 400) {
          this.errorMessage =
            'Certains champs sont invalides. Vérifiez votre nom, e-mail et message.';
        } else if (err.status === 502) {
          this.errorMessage =
            "L'envoi a échoué côté serveur (e-mail). Réessayez dans quelques minutes.";
        } else {
          this.errorMessage =
            "Impossible d'envoyer le message pour le moment. Réessayez plus tard.";
        }
        this.cdr.detectChanges();
      },
    });
  }

  onSuccessModalButton(index: number): void {
    this.isSuccessModalVisible = false;
    if (index === 0) {
      void this.router.navigate(['/']);
      return;
    }
    void this.router.navigate(['/pickings']);
  }
}

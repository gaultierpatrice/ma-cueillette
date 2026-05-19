import { ApplicationRef, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user';
import { getApiErrorMessage } from '../../utils/api-error';
import { ModalButton } from '../../shared/modal/modal.types';
import { ModalComponent } from '../../shared/modal/modal';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule, ModalComponent],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly appRef = inject(ApplicationRef);

  form = { name: '', email: '', password: '', role: 'USER' as 'USER' | 'PRODUCER', farmName: '' };
  error = '';
  readonly isErrorModalVisible = signal(false);
  readonly isSuccessModalVisible = signal(false);
  readonly errorMessage = signal('');
  readonly registerSuccessButtons: ModalButton[] = [
    { label: "Page d'accueil", variant: 'secondary' },
    { label: 'Se connecter', variant: 'primary' },
  ];

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(registerForm: NgForm) {
    if (registerForm.invalid) {
      return;
    }

    if (!this.validateEmail(this.form.email)) {
      this.errorMessage.set(
        'Veuillez entrer une adresse email valide (exemple: nom@domaine.com)',
      );
      this.showErrorModal();
      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage.set(
        'Le mot de passe doit contenir au moins 8 caractères pour assurer la sécurité de votre compte.',
      );
      this.showErrorModal();
      return;
    }

    if (this.form.role === 'PRODUCER' && !this.form.farmName.trim()) {
      this.errorMessage.set('Veuillez entrer le nom de votre exploitation agricole.');
      this.showErrorModal();
      return;
    }

    this.error = '';
    this.isErrorModalVisible.set(false);
    this.isSuccessModalVisible.set(false);
    
    const payload = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role,
      ...(this.form.role === 'PRODUCER' && { farmName: this.form.farmName })
    };
    
    this.userService.register(payload).subscribe({
      next: () => {
        this.isSuccessModalVisible.set(true);
        this.appRef.tick();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(
          getApiErrorMessage(
            err,
            "Échec de l'inscription. Cet email est peut-être déjà utilisé.",
          ),
        );
        this.showErrorModal();
      },
    });
  }

  showErrorModal(): void {
    this.isErrorModalVisible.set(true);
    this.appRef.tick();
  }

  hideErrorModal(): void {
    this.isErrorModalVisible.set(false);
  }

  onRegisterSuccessButton(index: number): void {
    if (index === 0) {
      this.goToLandingAfterRegister();
      return;
    }

    this.goToLoginAfterRegister();
  }

  goToLoginAfterRegister(): void {
    this.isSuccessModalVisible.set(false);
    void this.router.navigate(['/login']);
  }

  goToLandingAfterRegister(): void {
    this.isSuccessModalVisible.set(false);
    void this.router.navigate(['/']);
  }
}

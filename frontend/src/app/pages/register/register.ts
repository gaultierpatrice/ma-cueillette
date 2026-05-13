import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  form = { name: '', email: '', password: '', role: 'USER' as 'USER' | 'PRODUCER', farmName: '' };
  error = '';
  success = '';
  isErrorModalVisible: boolean = false;
  errorMessage: string = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit(registerForm: NgForm) {
    if (registerForm.invalid) {
      return;
    }

    if (!this.validateEmail(this.form.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide (exemple: nom@domaine.com)';
      this.showErrorModal();
      return;
    }

    if (this.form.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères pour assurer la sécurité de votre compte.';
      this.showErrorModal();
      return;
    }

    if (this.form.role === 'PRODUCER' && !this.form.farmName.trim()) {
      this.errorMessage = 'Veuillez entrer le nom de votre exploitation agricole.';
      this.showErrorModal();
      return;
    }

    this.error = '';
    this.success = '';
    this.isErrorModalVisible = false;
    
    const payload = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role,
      ...(this.form.role === 'PRODUCER' && { farmName: this.form.farmName })
    };
    
    this.userService.register(payload).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = getApiErrorMessage(
          err,
          "Échec de l'inscription. Cet email est peut-être déjà utilisé.",
        );
        this.showErrorModal();
      },
    });
  }

  showErrorModal(): void {
    this.isErrorModalVisible = true;
    this.cdr.detectChanges();
  }

  hideErrorModal(): void {
    this.isErrorModalVisible = false;
  }
}

import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { getApiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  form = { email: '', password: '' };
  /** Shown in the modal; server message when available (e.g. English API text). */
  loginErrorMessage = '';
  isErrorModalVisible: boolean = false;

  private readonly defaultLoginError =
    "L'email ou le mot de passe que vous avez saisi est incorrect. Veuillez réessayer.";

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit(loginForm: NgForm) {
    if (loginForm.invalid) {
      return;
    }

    this.loginErrorMessage = this.defaultLoginError;
    this.isErrorModalVisible = false;
    this.userService.login(this.form).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loginErrorMessage = getApiErrorMessage(err, this.defaultLoginError);
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

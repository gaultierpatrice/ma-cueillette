import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  form = { email: '', password: '' };
  error = '';
  isErrorModalVisible: boolean = false;

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

    this.error = '';
    this.isErrorModalVisible = false;
    this.userService.login(this.form).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
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

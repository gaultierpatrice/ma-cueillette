import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  form = { email: '', password: '' };
  error = '';

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error = '';
    this.userService.login(this.form).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Invalid email or password.';
      },
    });
  }
}

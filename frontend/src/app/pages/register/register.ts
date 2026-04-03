import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
})
export class RegisterComponent {
  form = { name: '', email: '', password: '', role: 'USER' as const };
  error = '';
  success = '';

  constructor(
    private userService: UserService,
    private router: Router,
  ) {}

  onSubmit() {
    this.error = '';
    this.success = '';
    this.userService.register(this.form).subscribe({
      next: () => {
        this.success = 'Account created! Redirecting...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {
        this.error = 'Registration failed. Email may already be in use.';
      },
    });
  }
}

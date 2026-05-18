import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
  isAuthenticated: boolean = false;
  isProducer: boolean = false;
  isLogoutModalVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
    this.isProducer = this.authService.isProducer();
  }

  showLogoutModal(): void {
    this.isLogoutModalVisible = true;
  }

  hideLogoutModal(): void {
    this.isLogoutModalVisible = false;
  }

  confirmLogout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.isProducer = false;
    this.username = '';
    this.isLogoutModalVisible = false;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}

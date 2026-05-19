import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ModalButton } from '../../shared/modal/modal.types';
import { ModalComponent } from '../../shared/modal/modal';

@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, ModalComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  username: string = '';
  isAuthenticated: boolean = false;
  isProducer: boolean = false;
  isLogoutModalVisible: boolean = false;
  readonly logoutModalButtons: ModalButton[] = [
    { label: 'Annuler', variant: 'cancel' },
    { label: 'OK', variant: 'primary' },
  ];

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

  onLogoutModalButton(index: number): void {
    if (index === 0) {
      this.hideLogoutModal();
      return;
    }

    this.confirmLogout();
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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PickingService } from '../../services/picking.service';
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
  /** null = still loading (producers only) */
  hasPicking: boolean | null = null;
  isLogoutModalVisible: boolean = false;
  readonly logoutModalButtons: ModalButton[] = [
    { label: 'Annuler', variant: 'cancel' },
    { label: 'OK', variant: 'primary' },
  ];

  constructor(
    private authService: AuthService,
    private pickingService: PickingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    this.username = this.authService.getUsername();
    this.isProducer = this.authService.isProducer();
    if (this.isProducer) {
      this.pickingService.getMyPicking().subscribe({
        next: (picking) => {
          this.hasPicking = picking != null;
          this.cdr.markForCheck();
        },
        error: () => {
          this.hasPicking = false;
          this.cdr.markForCheck();
        },
      });
    }
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

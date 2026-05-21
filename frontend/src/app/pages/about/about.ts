import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PickingService } from '../../services/picking.service';

@Component({
  selector: 'app-about',
  imports: [RouterModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class AboutComponent implements OnInit {
  isProducer = false;
  hasPicking: boolean | null = null;

  constructor(
    private authService: AuthService,
    private pickingService: PickingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
}

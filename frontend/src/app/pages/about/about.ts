import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-about',
  imports: [RouterModule],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class AboutComponent implements OnInit {
  isProducer = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isProducer = this.authService.isProducer();
  }
}

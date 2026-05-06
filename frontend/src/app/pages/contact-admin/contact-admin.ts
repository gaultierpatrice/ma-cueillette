import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact-admin',
  imports: [RouterModule],
  templateUrl: './contact-admin.html',
  styles: [`
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      flex: 1;
      background-image: url('/assets/images/illustration/vegetables.jpg');
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
    }
  `]
})
export class ContactAdminComponent {}

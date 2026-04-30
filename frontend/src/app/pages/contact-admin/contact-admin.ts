import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contact-admin.html',
})
export class ContactAdminComponent {
}


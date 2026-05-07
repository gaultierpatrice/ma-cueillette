import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-add-cueillette',
  imports: [RouterModule, FormsModule],
  templateUrl: './add-picking.html',
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
export class AddCueilletteComponent implements OnInit {
  form = {
    name: '',
    address: '',
    postalCode: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    openingHours: '',
    description: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const farmName = this.authService.getFarmName();
    if (farmName) {
      this.form.name = farmName;
    }
  }

  onSubmit(): void {
    console.log('Form submitted (backend endpoint to be implemented):', this.form);
  }
}

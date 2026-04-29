import { Component } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  pageTitle = '';

  private titles: Record<string, string> = {
    '': 'Accueil',
    register: 'Inscription',
    login: 'Connexion',
    dashboard: 'Tableau de bord',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects.replace('/', '');
        this.pageTitle = this.titles[path] ?? '';
      });
  }
}

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
    pickings: 'Liste des cueillettes',
    favorites: 'Mes favoris',
    'contact-admin': 'Contacter Admin',
    'add-picking': 'Proposer ma Cueillette',
    legal: 'Mentions légales',
    about: 'A propos',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects.replace(/^\//, '').split('?')[0];
        const firstSegment = path.split('/')[0];
        this.pageTitle = this.titles[firstSegment] ?? '';
      });
  }
}

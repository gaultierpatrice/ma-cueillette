import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Picking } from './picking.types';

const SITE_NAME = 'Ma Cueillette';
const META_DESCRIPTION_MAX = 160;

type PageSeo = {
  title: string;
  description: string;
  noindex?: boolean;
};

const ROUTE_SEO: Record<string, PageSeo> = {
  '': {
    title: `${SITE_NAME} — Auto-cueillette près de chez vous`,
    description:
      'Trouvez des exploitations en auto-cueillette près de chez vous. Cueillez fruits et légumes directement dans les champs des producteurs.',
  },
  pickings: {
    title: `Cueillettes — ${SITE_NAME}`,
    description:
      'Parcourez les exploitations en auto-cueillette. Localisez une cueillette, consultez horaires, produits et avis.',
  },
  about: {
    title: `À propos — ${SITE_NAME}`,
    description:
      "Ma Cueillette, la plateforme dédiée à l'auto-cueillette : cueillez vos fruits et légumes vous-même chez les producteurs locaux.",
  },
  legal: {
    title: `Mentions légales — ${SITE_NAME}`,
    description: 'Mentions légales et informations juridiques du site Ma Cueillette.',
  },
  register: {
    title: `Inscription — ${SITE_NAME}`,
    description:
      'Créez votre compte Ma Cueillette pour gérer vos favoris ou référencer votre exploitation.',
    noindex: true,
  },
  login: {
    title: `Connexion — ${SITE_NAME}`,
    description: 'Connectez-vous à votre compte Ma Cueillette.',
    noindex: true,
  },
  dashboard: {
    title: `Tableau de bord — ${SITE_NAME}`,
    description: 'Gérez votre compte et votre exploitation sur Ma Cueillette.',
    noindex: true,
  },
  favorites: {
    title: `Mes favoris — ${SITE_NAME}`,
    description: 'Retrouvez vos cueillettes favorites enregistrées sur Ma Cueillette.',
    noindex: true,
  },
  'contact-admin': {
    title: `Contacter l'administrateur — ${SITE_NAME}`,
    description: "Contactez l'équipe Ma Cueillette pour toute question sur la plateforme.",
  },
  'add-picking': {
    title: `Proposer ma cueillette — ${SITE_NAME}`,
    description: 'Référencez votre exploitation en auto-cueillette sur Ma Cueillette.',
    noindex: true,
  },
  'modify-picking': {
    title: `Modifier ma cueillette — ${SITE_NAME}`,
    description: 'Mettez à jour les informations de votre exploitation sur Ma Cueillette.',
    noindex: true,
  },
  'delete-account': {
    title: `Supprimer mon compte — ${SITE_NAME}`,
    description: 'Suppression définitive de votre compte Ma Cueillette.',
    noindex: true,
  },
};

const PICKING_DETAIL_FALLBACK: PageSeo = {
  title: `Cueillette — ${SITE_NAME}`,
  description:
    "Détails d'une exploitation en auto-cueillette : horaires, produits, avis et itinéraire sur Ma Cueillette.",
};

const PICKING_REVIEW_FALLBACK: PageSeo = {
  title: `Avis — ${SITE_NAME}`,
  description: 'Donnez votre avis sur une exploitation en auto-cueillette référencée sur Ma Cueillette.',
  noindex: true,
};

function truncateMetaDescription(text: string, max = META_DESCRIPTION_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) {
    return trimmed;
  }
  const slice = trimmed.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > max * 0.6) {
    return `${slice.slice(0, lastSpace).trimEnd()}…`;
  }
  return `${slice.trimEnd()}…`;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => this.updateFromUrl(event.urlAfterRedirects));

    this.updateFromUrl(this.router.url);
  }

  setPickingPage(picking: Picking, mode: 'detail' | 'review' = 'detail'): void {
    const location = picking.city ? ` à ${picking.city}` : '';
    const page: PageSeo =
      mode === 'review'
        ? {
            title: `Avis — ${picking.name} — ${SITE_NAME}`,
            description: `Donnez votre avis sur ${picking.name}${location}, exploitation en auto-cueillette sur Ma Cueillette.`,
            noindex: true,
          }
        : {
            title: `${picking.name}${location} — ${SITE_NAME}`,
            description: `${picking.name}${location} : auto-cueillette sur place. Horaires, produits, avis et itinéraire sur Ma Cueillette.`,
          };
    this.apply(page);
  }

  private updateFromUrl(url: string): void {
    const path = url.split('?')[0].replace(/^\//, '');
    const segments = path.split('/').filter(Boolean);

    if (segments[0] === 'pickings' && segments[1] && /^\d+$/.test(segments[1])) {
      if (segments[2] === 'review') {
        this.apply(PICKING_REVIEW_FALLBACK);
        return;
      }
      this.apply(PICKING_DETAIL_FALLBACK);
      return;
    }

    const routeKey = segments[0] ?? '';
    this.apply(ROUTE_SEO[routeKey] ?? ROUTE_SEO['']);
  }

  private apply(page: PageSeo): void {
    this.title.setTitle(page.title);
    this.meta.updateTag({
      name: 'description',
      content: truncateMetaDescription(page.description),
    });
    if (page.noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.removeTag('name="robots"');
    }
  }
}

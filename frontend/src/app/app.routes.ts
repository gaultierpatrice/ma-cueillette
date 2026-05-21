import { Routes } from '@angular/router';
import { producerGuard } from './guards/producer.guard';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { LandingComponent } from './pages/landing/landing';
import { CueillettesListComponent } from './pages/pickings-list/pickings-list';
import { CueilletteDetailsComponent } from './pages/picking-details/picking-details';
import { CueilletteReviewComponent } from './pages/picking-review/picking-review';
import { FavoritesComponent } from './pages/favorites/favorites';
import { ContactAdminComponent } from './pages/contact-admin/contact-admin';
import { AddCueilletteComponent } from './pages/add-picking/add-picking';
import { ModifyPickingComponent } from './pages/modify-picking/modify-picking';
import { modifyPickingGuard } from './guards/modify-picking.guard';
import { LegalComponent } from './pages/legal/legal';
import { AboutComponent } from './pages/about/about';
import { DeleteAccountComponent } from './pages/delete-account/delete-account';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'pickings', component: CueillettesListComponent },
  { path: 'pickings/:id', component: CueilletteDetailsComponent },
  { path: 'pickings/:id/review', component: CueilletteReviewComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: 'contact-admin', component: ContactAdminComponent },
  { path: 'add-picking', component: AddCueilletteComponent, canActivate: [producerGuard] },
  {
    path: 'modify-picking',
    component: ModifyPickingComponent,
    canActivate: [producerGuard, modifyPickingGuard],
  },
  { path: 'legal', component: LegalComponent },
  { path: 'about', component: AboutComponent },
  { path: 'delete-account', component: DeleteAccountComponent },
  { path: 'search', redirectTo: 'pickings', pathMatch: 'full' },
  { path: '', component: LandingComponent },
  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'post/:slug',
    loadComponent: () => import('./pages/post-detail/post-detail.component').then(m => m.PostDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/admin/post-form/post-form.component').then(m => m.PostFormComponent),
      },
      {
        path: 'edit/:slug',
        loadComponent: () => import('./pages/admin/post-form/post-form.component').then(m => m.PostFormComponent),
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/admin/profile-edit/profile-edit.component').then(m => m.ProfileEditComponent),
      },
    ]
  },
  { path: '**', redirectTo: '' },
];

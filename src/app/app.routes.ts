import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth').then((m) => m.AuthComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'signup',
        loadComponent: () => import('./auth/signup/signup').then((m) => m.SignupComponent),
      },
      {
        path: 'verify',
        loadComponent: () => import('./auth/verify/verify').then((m) => m.VerifyComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'home/:id',
    loadComponent: () => import('./home/home').then((m) => m.HomeComponent),
  },
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
];

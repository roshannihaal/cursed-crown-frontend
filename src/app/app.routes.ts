import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
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
        // children: [
        //   {
        //     path: 'verify',
        //     loadComponent: () => import('./auth/verify/verify').then((m) => m.VerifyComponent),
        //   },
        // ],
      },
      {
        path: 'signup/verify',
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
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./shared/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];

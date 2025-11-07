import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./features/quiz/quiz.component').then(m => m.QuizComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./features/results/results.component').then(m => m.ResultsComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  }
];

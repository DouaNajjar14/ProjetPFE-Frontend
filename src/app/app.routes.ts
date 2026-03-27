import { Routes } from '@angular/router';
import { guestGuard, authGuard, adminGuard, agentRhGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public Routes with Public Layout
  {
    path: '',
    loadComponent: () => import('./shared/components/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/public/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'stages',
        loadComponent: () => import('./features/public/stages/stages.component').then(m => m.StagesComponent)
      },
      {
        path: 'pfe-book',
        loadComponent: () => import('./features/public/pfe-book/pfe-book.component').then(m => m.PfeBookComponent)
      },
      {
        path: 'postuler',
        loadComponent: () => import('./features/public/postuler/postuler.component').then(m => m.PostulerComponent)
      },
      {
        path: 'postuler-pfe',
        redirectTo: 'postuler',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'change-password-first-login',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/change-password-first-login/change-password-first-login.component').then(m => m.ChangePasswordFirstLoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'departements',
        loadComponent: () => import('./features/admin/departements/departement-list/departement-list.component').then(m => m.DepartementListComponent)
      },
      {
        path: 'departements/:id/specialites',
        loadComponent: () => import('./features/admin/departements/specialite-list/specialite-list.component').then(m => m.SpecialiteListComponent)
      },
      {
        path: 'departements/:deptId/specialites/:specId/competences',
        loadComponent: () => import('./features/admin/departements/competence-list/competence-list.component').then(m => m.CompetenceListComponent)
      },
      {
        path: 'agents-rh',
        loadComponent: () => import('./features/admin/utilisateurs/agents-rh-list/agent-rh-list.component').then(m => m.AgentRhListComponent)
      },
      {
        path: 'encadrants',
        loadComponent: () => import('./features/admin/utilisateurs/encadrants-list/encadrant-list.component').then(m => m.EncadrantListComponent)
      },
      {
        path: 'stagiaires',
        loadComponent: () => import('./features/admin/stagiaires/stagiaire-list/stagiaire-list.component').then(m => m.StagiaireListComponent)
      },
      {
        path: 'create-account',
        loadComponent: () => import('./features/admin/create-account/admin-create-account.component').then(m => m.AdminCreateAccountComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/admin/profil/profil.component').then(m => m.ProfilComponent)
      }
    ]
  },
  {
    path: 'agent-rh',
    loadComponent: () => import('./shared/components/agent-rh-layout/agent-rh-layout.component').then(m => m.AgentRhLayoutComponent),
    canActivate: [authGuard, agentRhGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/rh/dashboard/agent-rh-dashboard.component').then(m => m.AgentRhDashboardComponent)
      },
      {
        path: 'departements',
        loadComponent: () => import('./features/rh/departements/rh-departement-list.component').then(m => m.RhDepartementListComponent)
      },
      {
        path: 'sujets-pfe',
        loadComponent: () => import('./features/rh/sujets-pfe/agent-rh-sujet-pfe.component').then(m => m.AgentRhSujetPfeComponent)
      },
      {
        path: 'sujets-pfe/:id',
        loadComponent: () => import('./features/rh/sujets-pfe/agent-rh-sujet-pfe.component').then(m => m.AgentRhSujetPfeComponent)
      },
      {
        path: 'encadrants',
        loadComponent: () => import('./features/rh/encadrants/rh-encadrant-list.component').then(m => m.RhEncadrantListComponent)
      },
      {
        path: 'candidatures',
        redirectTo: 'candidatures/tous',
        pathMatch: 'full'
      },
      {
        path: 'candidatures/:type',
        loadComponent: () => import('./features/rh/candidatures/rh-candidatures.component').then(m => m.RhCandidaturesListComponent)
      },
      {
        path: 'profil',
        loadComponent: () => import('./features/admin/profil/profil.component').then(m => m.ProfilComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: ''
  }
];

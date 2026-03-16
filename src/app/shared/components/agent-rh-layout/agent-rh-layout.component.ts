import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-agent-rh-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-rh-layout.component.html',
  styleUrls: ['./agent-rh-layout.component.css']
})
export class AgentRhLayoutComponent {
  sidebarCollapsed = signal(false);
  currentYear = new Date().getFullYear();
  expandedMenu = signal<string | null>(null);

  navItems: NavItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'dashboard',
      route: '/agent-rh/dashboard'
    },
    {
      label: 'Départements',
      icon: 'building',
      route: '/agent-rh/departements'
    },
    {
      label: 'Sujets PFE',
      icon: 'briefcase',
      route: '/agent-rh/sujets-pfe'
    },
    {
      label: 'Encadrants',
      icon: 'users',
      route: '/agent-rh/encadrants'
    },
    {
      label: 'Candidatures',
      icon: 'file-text',
      children: [
        { label: 'Toutes les candidatures', icon: 'file-text', route: '/agent-rh/candidatures/tous' },
        { label: 'Initiation', icon: 'file-text', route: '/agent-rh/candidatures/initiation' },
        { label: 'Perfectionnement', icon: 'file-text', route: '/agent-rh/candidatures/perfectionnement' },
        { label: 'PFE', icon: 'file-text', route: '/agent-rh/candidatures/pfe' },
        { label: 'Été', icon: 'file-text', route: '/agent-rh/candidatures/ete' }
      ]
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  toggleMenu(label: string): void {
    this.expandedMenu.update(current => current === label ? null : label);
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenu() === label;
  }

  isChildActive(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => this.isActive(child.route!));
  }
}

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  children?: NavItem[];
}


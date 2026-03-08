import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);
  currentYear = new Date().getFullYear();
  expandedMenu = signal<string | null>(null);

  navItems: NavItem[] = [
    {
      label: 'Tableau de Bord',
      icon: 'dashboard',
      route: '/admin/dashboard'
    },
    {
      label: 'Départements',
      icon: 'building',
      route: '/admin/departements'
    },
    {
      label: 'Utilisateurs',
      icon: 'users-group',
      children: [
        {
          label: 'Agents RH',
          icon: 'users',
          route: '/admin/agents-rh'
        },
        {
          label: 'Encadrants',
          icon: 'encadrant',
          route: '/admin/encadrants'
        }
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
    return this.router.url === route;
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

import { Component, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-public-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="header" [class.scrolled]="isScrolled()">
      <div class="header-container">
        <!-- Logo Ooredoo -->
        <a routerLink="/" class="logo-link">
          <div class="logo">
            <img src="ooredoo-logo.jpg" alt="Ooredoo" class="logo-img" [class.scrolled]="isScrolled()">
            <div class="logo-divider" [class.dark]="isScrolled()"></div>
            <div class="logo-text">
              <span class="logo-sub" [class.dark]="isScrolled()">Portail Stages & PFE</span>
            </div>
          </div>
        </a>

        <!-- Navigation -->
        <div class="nav-menu">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: link.exact}"
               class="nav-item"
               [class.dark]="isScrolled()">
              {{ link.label }}
            </a>
          }
        </div>

        <!-- CTA Buttons -->
        <div class="cta-group">
          <a routerLink="/postuler" class="btn-candidater">
            <span>Candidater</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-toggle" (click)="toggleMobile()" [class.dark]="isScrolled()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            @if (mobileOpen()) {
              <path d="M18 6L6 18M6 6l12 12"/>
            } @else {
              <path d="M4 6h16M4 12h16M4 18h16"/>
            }
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileOpen()) {
        <div class="mobile-menu">
          @for (link of navLinks; track link.path) {
            <a [routerLink]="link.path"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{exact: link.exact}"
               class="mobile-link"
               (click)="closeMobile()">
              {{ link.label }}
            </a>
          }
          <div class="mobile-cta">
            <a routerLink="/postuler" class="mobile-btn-candidater" (click)="closeMobile()">
              Candidater
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      }
    </nav>
  `,
  styles: [`
    :host {
      --ooredoo-red: #ED1C24;
      --ooredoo-red-dark: #ED1C24;
    }

    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      transition: all 0.3s ease;
      background: transparent;
    }
    .header.scrolled {
      background: rgba(255,255,255,0.98);
      backdrop-filter: blur(20px);
      box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
    }

    /* Logo */
    .logo-link {
      text-decoration: none;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      height: 36px;
      width: auto;
      object-fit: contain;
      filter: brightness(0) invert(1);
      transition: filter 0.3s ease;
    }
    .logo-img.scrolled {
      filter: none;
    }
    .logo-divider {
      width: 1.5px;
      height: 28px;
      background: rgba(255,255,255,0.3);
      border-radius: 1px;
      transition: background 0.3s ease;
    }
    .logo-divider.dark {
      background: rgba(0,0,0,0.15);
    }
    .logo-text {
      display: flex;
      flex-direction: column;
    }
    .logo-sub {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: rgba(255,255,255,0.85);
      line-height: 1.3;
    }
    .logo-sub.dark { color: #555; }

    /* Navigation */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    @media (max-width: 900px) {
      .nav-menu { display: none; }
    }
    .nav-item {
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.25s;
    }
    .nav-item:hover {
      color: white;
      background: rgba(255,255,255,0.12);
    }
    .nav-item.dark {
      color: #333;
    }
    .nav-item.dark:hover {
      color: var(--ooredoo-red);
      background: rgba(237,28,36,0.06);
    }
    .nav-item.active {
      color: var(--ooredoo-red) !important;
      font-weight: 600;
    }

    /* CTA Buttons */
    .cta-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    @media (max-width: 900px) {
      .cta-group { display: none; }
    }
    .btn-candidater {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 700;
      color: white;
      text-decoration: none;
      background: linear-gradient(135deg, var(--ooredoo-red) 0%, var(--ooredoo-red-dark) 100%);
      border-radius: 25px;
      box-shadow: 0 4px 20px rgba(237,28,36,0.4);
      transition: all 0.3s;
    }
    .btn-candidater svg {
      width: 18px;
      height: 18px;
    }
    .btn-candidater:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(237,28,36,0.5);
    }

    /* Mobile Toggle */
    .mobile-toggle {
      display: none;
      width: 44px;
      height: 44px;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.25s;
    }
    .mobile-toggle svg {
      width: 24px;
      height: 24px;
    }
    .mobile-toggle.dark { color: #333; }
    .mobile-toggle:hover { background: rgba(255,255,255,0.1); }
    .mobile-toggle.dark:hover { background: rgba(0,0,0,0.05); }
    @media (max-width: 900px) {
      .mobile-toggle { display: flex; align-items: center; justify-content: center; }
    }

    /* Mobile Menu */
    .mobile-menu {
      position: absolute;
      top: 72px;
      left: 0;
      right: 0;
      background: white;
      padding: 16px 24px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
    }
    .mobile-link {
      display: block;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 500;
      color: #333;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.25s;
    }
    .mobile-link:hover {
      background: #f5f5f5;
    }
    .mobile-link.active {
      color: var(--ooredoo-red);
      background: rgba(237,28,36,0.06);
      font-weight: 600;
    }
    .mobile-cta {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid #eee;
    }
    .mobile-btn-candidater {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      font-size: 15px;
      font-weight: 700;
      color: white;
      text-decoration: none;
      background: linear-gradient(135deg, var(--ooredoo-red) 0%, var(--ooredoo-red-dark) 100%);
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(237,28,36,0.3);
    }
    .mobile-btn-candidater svg {
      width: 20px;
      height: 20px;
    }
  `]
})
export class PublicHeaderComponent {
  isScrolled = signal(false);
  mobileOpen = signal(false);

  navLinks = [
    { path: '/', label: 'Accueil', exact: true },
    { path: '/stages', label: 'Stages', exact: false },
    { path: '/pfe-book', label: 'PFE Book', exact: false }
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  toggleMobile() {
    this.mobileOpen.update(v => !v);
  }

  closeMobile() {
    this.mobileOpen.set(false);
  }
}

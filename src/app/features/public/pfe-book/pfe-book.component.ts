import { Component, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicService } from '../../../core/services/public.service';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';
import { Departement } from '../../../core/models/departement.model';

@Component({
  selector: 'app-pfe-book',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <!-- HEADER SECTION -->
    <section class="hero-header">
      <div class="container">
        <h1 class="main-title">Catalogue des Sujets <span class="red">PFE</span></h1>
        <p class="subtitle">{{ filteredSujets().length }} sujets disponibles — Postulez directement pour un sujet</p>
      </div>
    </section>

    <!-- FILTERS BAR -->
    <section class="filters-section">
      <div class="container">
        <div class="filters-row">
          <div class="search-box">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text"
                   [(ngModel)]="searchQuery"
                   (ngModelChange)="onSearchChange()"
                   placeholder="Rechercher par titre, département, technologie...">
          </div>
          <div class="filter-group">
            <svg class="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
            <select [(ngModel)]="selectedDepartement" (ngModelChange)="onFilterChange()">
              <option value="">Tous les...</option>
              @for (dept of departements(); track dept.id) {
                <option [value]="dept.id">{{ dept.nom }}</option>
              }
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- MAIN CONTENT -->
    <section class="content-section">
      <div class="container">
        @if (loading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des sujets...</p>
          </div>
        } @else if (filteredSujets().length === 0) {
          <div class="empty-state">
            <h3>Aucun sujet trouvé</h3>
            <p>Essayez de modifier vos critères de recherche</p>
            <button (click)="resetFilters()" class="btn-reset">Réinitialiser</button>
          </div>
        } @else {
          <!-- CAROUSEL CARD -->
          <div class="carousel-card">
            <div class="red-accent-line"></div>
            
            <div class="card-content">
              <!-- LEFT SIDE - Subject Info -->
              <div class="left-panel">
                <div class="page-indicator">
                  <span class="current">{{ currentIndex() + 1 }}</span>
                  <span class="separator">/</span>
                  <span class="total">{{ filteredSujets().length }}</span>
                </div>

                <span class="status-badge available">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  {{ getStatusLabel(currentSubject()?.statut || '') }}
                </span>

                <h2 class="subject-title">{{ currentSubject()?.titre }}</h2>

                <div class="tags-row">
                  <span class="tag dept-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {{ currentSubject()?.departementNom }}
                  </span>
                  <span class="tag duration-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18"/>
                    </svg>
                    {{ currentSubject()?.dureeEnMois }} mois
                  </span>
                  <span class="tag stagiaires-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {{ currentSubject()?.nombreStagiaires }} stagiaire(s)
                  </span>
                  <span class="tag niveau-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    {{ currentSubject()?.niveauAcademique }}
                  </span>
                </div>

                <div class="info-cards">
                  <div class="info-card">
                    <div class="info-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                    </div>
                    <div class="info-content">
                      <span class="info-label">SPÉCIALITÉ</span>
                      <span class="info-value">{{ currentSubject()?.specialitesUniversitaires?.[0]?.nom || 'Non spécifiée' }}</span>
                    </div>
                  </div>
                  <div class="info-card">
                    <div class="info-icon encadrant">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="info-content">
                      <span class="info-label">DÉPARTEMENT</span>
                      <span class="info-value">{{ currentSubject()?.departementNom || 'Non défini' }}</span>
                    </div>
                  </div>
                </div>

                <div class="mission-section">
                  <h4>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                    Mission & Description
                  </h4>
                  <p>{{ currentSubject()?.mission }}</p>
                </div>

                <div class="technologies-section">
                  <h4>Technologies</h4>
                  <div class="tech-tags">
                    @for (comp of currentSubject()?.competences || []; track comp.id) {
                      <span class="tech-tag">{{ comp.nom }}</span>
                    }
                  </div>
                </div>

                @if (currentSubject()?.statut === 'OUVERT') {
                  <a [routerLink]="['/postuler-pfe']" 
                     [queryParams]="{ sujet: currentSubject()?.id }" 
                     class="btn-postuler">
                    Postuler pour ce sujet
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15,3 21,3 21,9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                }
              </div>

              <!-- RIGHT SIDE - Requirements & Objectives -->
              <div class="right-panel">
                <div class="sidebar-section prerequisites">
                  <div class="section-header">
                    <span class="section-number">01</span>
                    <h3>Prérequis</h3>
                    <div class="bookmark-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                  </div>
                  <ul class="requirement-list">
                    <li>
                      <span class="bullet"></span>
                      Connaissances en développement web
                    </li>
                    <li>
                      <span class="bullet"></span>
                      Maîtrise des technologies requises
                    </li>
                    <li>
                      <span class="bullet"></span>
                      Capacité de travail en équipe
                    </li>
                  </ul>
                </div>

                <div class="sidebar-section objectives">
                  <div class="section-header">
                    <span class="section-number green">02</span>
                    <h3>Objectifs</h3>
                  </div>
                  <ul class="objectives-list">
                    <li>
                      <span class="obj-number">1</span>
                      Développer une solution complète
                    </li>
                    <li>
                      <span class="obj-number">2</span>
                      Implémenter les fonctionnalités clés
                    </li>
                    <li>
                      <span class="obj-number">3</span>
                      Assurer la qualité du code
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- NAVIGATION -->
            <div class="carousel-nav">
              <button class="nav-btn prev" (click)="previousSubject()" [disabled]="currentIndex() === 0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
                Précédent
              </button>

              <div class="dots">
                @for (sujet of filteredSujets(); track sujet.id; let i = $index) {
                  @if (i < 10) {
                    <button class="dot" 
                            [class.active]="i === currentIndex()"
                            (click)="goToSubject(i)">
                    </button>
                  }
                }
                @if (filteredSujets().length > 10) {
                  <span class="more-dots">...</span>
                }
              </div>

              <button class="nav-btn next" (click)="nextSubject()" [disabled]="currentIndex() === filteredSujets().length - 1">
                Suivant
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: [`
    :host {
      --red: #E30613;
      --red-dark: #C00510;
      --red-light: #FF3D4A;
      --green: #10B981;
      --orange: #F59E0B;
      --gray-50: #F9FAFB;
      --gray-100: #F3F4F6;
      --gray-200: #E5E7EB;
      --gray-300: #D1D5DB;
      --gray-400: #9CA3AF;
      --gray-500: #6B7280;
      --gray-600: #4B5563;
      --gray-700: #374151;
      --gray-800: #1F2937;
      --gray-900: #111827;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .red { color: var(--red); }

    /* HERO HEADER */
    .hero-header {
      background: white;
      padding: 100px 0 40px;
      text-align: center;
      border-bottom: 1px solid var(--gray-200);
    }
    .main-title {
      font-size: 42px;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 16px;
      color: var(--gray-500);
    }

    /* FILTERS */
    .filters-section {
      background: white;
      padding: 24px 0;
      border-bottom: 1px solid var(--gray-200);
      position: sticky;
      top: 72px;
      z-index: 40;
    }
    .filters-row {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .search-box {
      flex: 1;
      position: relative;
      max-width: 500px;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      color: var(--gray-400);
    }
    .search-box input {
      width: 100%;
      padding: 14px 16px 14px 48px;
      font-size: 14px;
      border: 1px solid var(--gray-300);
      border-radius: 10px;
      background: white;
      transition: all 0.2s;
    }
    .search-box input:focus {
      outline: none;
      border-color: var(--red);
      box-shadow: 0 0 0 3px rgba(227,6,19,0.1);
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border: 1px solid var(--gray-300);
      border-radius: 10px;
      background: white;
    }
    .filter-icon {
      width: 18px;
      height: 18px;
      color: var(--gray-400);
    }
    .filter-group select {
      border: none;
      background: transparent;
      font-size: 14px;
      color: var(--gray-700);
      cursor: pointer;
      padding-right: 8px;
    }
    .filter-group select:focus {
      outline: none;
    }

    /* CONTENT */
    .content-section {
      background: var(--gray-50);
      padding: 40px 0 60px;
      min-height: calc(100vh - 300px);
    }

    /* LOADING & EMPTY */
    .loading-state, .empty-state {
      text-align: center;
      padding: 80px 20px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--gray-200);
      border-top-color: var(--red);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state h3 {
      font-size: 20px;
      color: var(--gray-800);
      margin-bottom: 8px;
    }
    .empty-state p {
      color: var(--gray-500);
      margin-bottom: 20px;
    }
    .btn-reset {
      padding: 10px 24px;
      background: var(--red);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }

    /* CAROUSEL CARD */
    .carousel-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
      position: relative;
    }
    .red-accent-line {
      height: 4px;
      background: linear-gradient(90deg, var(--red) 0%, var(--red-light) 100%);
    }
    .card-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      min-height: 550px;
    }
    @media (max-width: 1024px) {
      .card-content {
        grid-template-columns: 1fr;
      }
      .right-panel {
        border-left: none;
        border-top: 1px solid var(--gray-200);
      }
    }

    /* LEFT PANEL */
    .left-panel {
      padding: 32px;
    }
    .page-indicator {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      background: var(--gray-100);
      border-radius: 20px;
      font-size: 13px;
      margin-bottom: 16px;
    }
    .page-indicator .current {
      font-weight: 700;
      color: var(--gray-900);
    }
    .page-indicator .separator {
      color: var(--gray-400);
    }
    .page-indicator .total {
      color: var(--gray-500);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-left: 12px;
    }
    .status-badge svg {
      width: 16px;
      height: 16px;
    }
    .status-badge.available {
      background: #D1FAE5;
      color: #059669;
    }
    .subject-title {
      font-size: 28px;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.3;
      margin: 20px 0;
    }
    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 24px;
    }
    .tag {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
    }
    .tag svg {
      width: 16px;
      height: 16px;
    }
    .dept-tag {
      background: #FEE2E2;
      color: var(--red);
    }
    .duration-tag {
      background: #E0E7FF;
      color: #4F46E5;
    }
    .stagiaires-tag {
      background: #FEF3C7;
      color: #D97706;
    }
    .niveau-tag {
      background: #D1FAE5;
      color: #059669;
    }
    .info-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--gray-50);
      border-radius: 12px;
    }
    .info-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: #E0E7FF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .info-icon svg {
      width: 22px;
      height: 22px;
      color: #4F46E5;
    }
    .info-icon.encadrant {
      background: #FEE2E2;
    }
    .info-icon.encadrant svg {
      color: var(--red);
    }
    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-800);
    }
    .mission-section {
      margin-bottom: 24px;
    }
    .mission-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: 12px;
    }
    .mission-section h4 svg {
      width: 18px;
      height: 18px;
      color: var(--red);
    }
    .mission-section p {
      font-size: 14px;
      color: var(--gray-600);
      line-height: 1.7;
    }
    .technologies-section h4 {
      font-size: 14px;
      font-weight: 700;
      color: var(--gray-800);
      margin-bottom: 12px;
    }
    .tech-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 24px;
    }
    .tech-tag {
      padding: 8px 16px;
      background: var(--red);
      color: white;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
    }
    .btn-postuler {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      background: var(--red);
      color: white;
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s;
    }
    .btn-postuler svg {
      width: 18px;
      height: 18px;
    }
    .btn-postuler:hover {
      background: var(--red-dark);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(227,6,19,0.3);
    }

    /* RIGHT PANEL */
    .right-panel {
      background: var(--gray-50);
      padding: 32px;
      border-left: 1px solid var(--gray-200);
    }
    .sidebar-section {
      margin-bottom: 32px;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      position: relative;
    }
    .section-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--red);
      color: white;
      font-size: 13px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-number.green {
      background: var(--green);
    }
    .section-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: var(--gray-800);
    }
    .bookmark-icon {
      position: absolute;
      right: 0;
      top: 0;
      width: 36px;
      height: 36px;
      background: #FEE2E2;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .bookmark-icon svg {
      width: 18px;
      height: 18px;
      color: var(--red);
    }
    .requirement-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .requirement-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 10px 0;
      font-size: 14px;
      color: var(--gray-700);
      border-bottom: 1px solid var(--gray-200);
    }
    .requirement-list li:last-child {
      border-bottom: none;
    }
    .bullet {
      width: 8px;
      height: 8px;
      background: var(--red);
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }
    .objectives-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .objectives-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 0;
      font-size: 14px;
      color: var(--gray-700);
    }
    .obj-number {
      width: 24px;
      height: 24px;
      background: #D1FAE5;
      color: var(--green);
      font-size: 12px;
      font-weight: 700;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    /* NAVIGATION */
    .carousel-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 32px;
      border-top: 1px solid var(--gray-200);
      background: white;
    }
    .nav-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: white;
      border: 1px solid var(--gray-300);
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: var(--gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-btn svg {
      width: 18px;
      height: 18px;
    }
    .nav-btn:hover:not(:disabled) {
      border-color: var(--red);
      color: var(--red);
    }
    .nav-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .dots {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--gray-300);
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dot:first-child {
      width: 32px;
      border-radius: 6px;
    }
    .dot.active {
      background: var(--red);
    }
    .dot:hover:not(.active) {
      background: var(--gray-400);
    }
    .more-dots {
      color: var(--gray-400);
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .main-title { font-size: 28px; }
      .filters-row { flex-direction: column; }
      .search-box { max-width: none; }
      .left-panel, .right-panel { padding: 20px; }
      .subject-title { font-size: 22px; }
      .info-cards { grid-template-columns: 1fr; }
      .carousel-nav { flex-direction: column; gap: 16px; }
      .nav-btn { width: 100%; justify-content: center; }
    }
  `]
})
export class PfeBookComponent implements OnInit {
  sujets = signal<SujetPfe[]>([]);
  departements = signal<Departement[]>([]);
  loading = signal(true);
  currentIndex = signal(0);

  searchQuery = '';
  selectedDepartement = '';

  filteredSujets = computed(() => {
    let result = this.sujets();

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(s =>
        s.titre.toLowerCase().includes(query) ||
        s.mission.toLowerCase().includes(query) ||
        s.departementNom?.toLowerCase().includes(query) ||
        s.competences?.some(c => c.nom.toLowerCase().includes(query))
      );
    }

    if (this.selectedDepartement) {
      result = result.filter(s => s.departementId === this.selectedDepartement);
    }

    return result;
  });

  currentSubject = computed((): SujetPfe | null => {
    return this.filteredSujets()[this.currentIndex()] ?? null;
  });

  constructor(private publicService: PublicService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    this.publicService.listerDepartements().subscribe({
      next: (depts) => this.departements.set(depts),
      error: (err) => console.error('Erreur chargement départements:', err)
    });

    this.publicService.listerSujetsPfe().subscribe({
      next: (sujets) => {
        this.sujets.set(sujets);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement sujets:', err);
        this.loading.set(false);
      }
    });
  }

  onSearchChange() {
    this.currentIndex.set(0);
  }

  onFilterChange() {
    this.currentIndex.set(0);
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedDepartement = '';
    this.currentIndex.set(0);
  }

  previousSubject() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  nextSubject() {
    if (this.currentIndex() < this.filteredSujets().length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  goToSubject(index: number) {
    if (index >= 0 && index < this.filteredSujets().length) {
      this.currentIndex.set(index);
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'Disponible';
      case 'POURVU': return 'Pourvu';
      case 'FERME': return 'Fermé';
      default: return statut || 'Disponible';
    }
  }
}

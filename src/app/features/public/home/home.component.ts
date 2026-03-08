import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';
import { TYPE_STAGE_INFO } from '../../../core/models/candidature.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <!-- HERO SECTION - RED THEME -->
    <section class="hero">
      <div class="hero-pattern"></div>
      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse-dot"></span>
            <span>Candidatures 2026 ouvertes</span>
          </div>
          
          <h1 class="hero-title">
            Lancez votre<br>
            <span class="highlight-white">carrière</span> avec Ooredoo
          </h1>
          
          <p class="hero-desc">
            Rejoignez le leader tunisien des télécommunications. Stages d'initiation, 
            perfectionnement, été ou PFE — trouvez l'opportunité qui vous correspond.
          </p>
          
          <div class="hero-buttons">
            <a routerLink="/postuler" class="btn-white">
              <span>Postuler maintenant</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a routerLink="/pfe-book" class="btn-outline">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>PFE Book 2026</span>
            </a>
          </div>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-value">150+</span>
              <span class="stat-label">Stages / an</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">12</span>
              <span class="stat-label">Départements</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">95%</span>
              <span class="stat-label">Satisfaction</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card">
            <div class="card-glow"></div>
            <div class="ooredoo-logo-display">
              <svg viewBox="0 0 200 80" class="ooredoo-text">
                <text x="50%" y="55" text-anchor="middle" fill="white" font-size="48" font-weight="bold">ooredoo</text>
              </svg>
              <p class="logo-tagline">Enriching people's digital lives</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STAGES SECTION -->
    <section class="stages-section">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span>Nos Opportunités</span>
          </div>
          <h2 class="section-title">Types de <span class="red">stages</span> proposés</h2>
          <p class="section-desc">Choisissez le parcours qui correspond à vos objectifs professionnels</p>
        </div>

        <div class="stages-grid">
          @for (stage of typeStages; track stage.type) {
            <div class="stage-card">
              <div class="stage-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  @switch (stage.icone) {
                    @case ('academic-cap') {
                      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                      <path d="M12 14v7"/>
                      <path d="M5 9v7"/>
                    }
                    @case ('building-office') {
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    }
                    @case ('sun') {
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2m0 16v2m-8-10H2m20 0h-2m-2.93-5.66l-1.41 1.41m-9.9 9.9l-1.41 1.41m0-12.72l1.41 1.41m9.9 9.9l1.41 1.41"/>
                    }
                    @case ('rocket-launch') {
                      <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8"/>
                    }
                  }
                </svg>
              </div>
              <h3 class="stage-title">{{ stage.titre }}</h3>
              <p class="stage-desc">{{ stage.description }}</p>
              <div class="stage-meta">
                <span class="meta-label">Durée</span>
                <span class="meta-value">{{ stage.duree }}</span>
              </div>
            </div>
          }
        </div>

        <div class="section-cta">
          <a routerLink="/stages" class="btn-red">
            <span>Voir tous les détails</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- PROCESS SECTION -->
    <section class="process-section">
      <div class="container">
        <div class="section-header">
          <div class="section-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
            <span>Comment postuler</span>
          </div>
          <h2 class="section-title">Un processus <span class="red">simple</span></h2>
        </div>

        <div class="process-track">
          <div class="track-line"></div>
          <div class="process-steps">
            @for (step of processSteps; track step.num) {
              <div class="process-step">
                <div class="step-circle">
                  <span>{{ step.num }}</span>
                </div>
                <h4 class="step-title">{{ step.title }}</h4>
                <p class="step-desc">{{ step.desc }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- PFE SECTION -->
    <section class="pfe-section">
      <div class="container">
        <div class="pfe-wrapper">
          <div class="pfe-content">
            <div class="section-badge white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>PFE Book 2026</span>
            </div>
            <h2 class="pfe-title">Catalogue des Projets de Fin d'Études</h2>
            <p class="pfe-desc">
              Découvrez nos {{ totalSujets() }} sujets disponibles et trouvez celui qui correspond 
              à vos compétences et aspirations professionnelles.
            </p>
            
            <ul class="pfe-features">
              <li>
                <span class="check-circle">✓</span>
                <span>Sujets innovants & technologies modernes</span>
              </li>
              <li>
                <span class="check-circle">✓</span>
                <span>Encadrement par des experts du domaine</span>
              </li>
              <li>
                <span class="check-circle">✓</span>
                <span>Possibilité de travail en binôme</span>
              </li>
            </ul>
            
            <a routerLink="/pfe-book" class="btn-white">
              <span>Explorer le catalogue</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          <div class="pfe-preview">
            @if (featuredSujets().length > 0) {
              <div class="preview-cards">
                @for (sujet of featuredSujets().slice(0, 3); track sujet.id) {
                  <div class="preview-card">
                    <div class="card-header">
                      <span class="dept-badge">{{ sujet.departementNom }}</span>
                      <span class="duration">{{ sujet.dureeEnMois }} mois</span>
                    </div>
                    <h4 class="card-title">{{ sujet.titre }}</h4>
                    <div class="card-arrow">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                }
              </div>
              <div class="preview-count">
                <span class="pulse-dot green"></span>
                <span>{{ totalSujets() }} sujets disponibles</span>
              </div>
            } @else {
              <div class="preview-loading">
                <div class="loader"></div>
                <p>Chargement des sujets...</p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Prêt à rejoindre<br><span class="highlight-white">l'aventure</span> ?</h2>
          <p class="cta-desc">
            Déposez votre candidature dès maintenant et faites le premier pas 
            vers une carrière enrichissante chez Ooredoo Tunisie.
          </p>
          <a routerLink="/postuler" class="btn-white large">
            <span>Déposer ma candidature</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      --red: #E30613;
      --red-dark: #B8000F;
      --red-light: #FF3D4A;
      --white: #FFFFFF;
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
    .highlight-white { 
      color: white;
      position: relative;
    }
    .highlight-white::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: white;
      opacity: 0.3;
    }

    /* ===== HERO SECTION - RED THEME ===== */
    .hero {
      position: relative;
      min-height: 100vh;
      background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%);
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .hero-pattern {
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .hero .container {
      position: relative;
      z-index: 10;
      padding: 120px 24px 80px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }
    @media (max-width: 1024px) {
      .hero .container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-visual { display: none; }
    }

    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      margin-bottom: 32px;
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      background: #4ADE80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    .pulse-dot.green { background: #4ADE80; }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(74,222,128,0); }
    }

    .hero-title {
      font-size: 64px;
      font-weight: 800;
      color: white;
      line-height: 1.1;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) {
      .hero-title { font-size: 42px; }
    }
    .hero-desc {
      font-size: 18px;
      color: rgba(255,255,255,0.85);
      line-height: 1.7;
      margin-bottom: 40px;
      max-width: 520px;
    }
    @media (max-width: 1024px) {
      .hero-desc { margin: 0 auto 40px; }
    }

    .hero-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    @media (max-width: 1024px) {
      .hero-buttons { justify-content: center; }
    }

    .btn-white {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      background: white;
      color: var(--red);
      font-size: 15px;
      font-weight: 700;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .btn-white svg { width: 20px; height: 20px; }
    .btn-white:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    }
    .btn-white.large {
      padding: 18px 40px;
      font-size: 16px;
    }

    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      background: transparent;
      color: white;
      font-size: 15px;
      font-weight: 600;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.3s;
    }
    .btn-outline svg { width: 20px; height: 20px; }
    .btn-outline:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.5);
    }

    .btn-red {
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
      box-shadow: 0 4px 20px rgba(227,6,19,0.3);
    }
    .btn-red svg { width: 20px; height: 20px; }
    .btn-red:hover {
      background: var(--red-dark);
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(227,6,19,0.4);
    }

    .hero-stats {
      display: inline-flex;
      align-items: center;
      gap: 32px;
      padding: 24px 40px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    @media (max-width: 1024px) {
      .hero-stats { justify-content: center; }
    }
    @media (max-width: 640px) {
      .hero-stats { 
        flex-direction: column;
        gap: 20px;
        padding: 24px;
      }
      .stat-divider { display: none; }
    }
    .stat-item { text-align: center; }
    .stat-value {
      display: block;
      font-size: 36px;
      font-weight: 800;
      color: white;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-divider {
      width: 1px;
      height: 48px;
      background: rgba(255,255,255,0.2);
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .visual-card {
      position: relative;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 60px;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .card-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      filter: blur(60px);
      transform: translate(-50%, -50%);
    }
    .ooredoo-logo-display {
      position: relative;
      text-align: center;
    }
    .ooredoo-text {
      width: 200px;
      height: 80px;
    }
    .logo-tagline {
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      margin-top: 8px;
    }

    /* ===== SECTION HEADER ===== */
    .section-header {
      text-align: center;
      margin-bottom: 56px;
    }
    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(227,6,19,0.08);
      border-radius: 50px;
      font-size: 13px;
      font-weight: 600;
      color: var(--red);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
    }
    .section-badge svg {
      width: 16px;
      height: 16px;
    }
    .section-badge.white {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .section-title {
      font-size: 42px;
      font-weight: 800;
      color: var(--gray-900);
      margin-bottom: 12px;
    }
    @media (max-width: 768px) {
      .section-title { font-size: 32px; }
    }
    .section-desc {
      font-size: 18px;
      color: var(--gray-500);
    }

    /* ===== STAGES SECTION ===== */
    .stages-section {
      padding: 100px 0;
      background: var(--gray-50);
    }
    .stages-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
    }
    @media (max-width: 1024px) {
      .stages-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .stages-grid { grid-template-columns: 1fr; }
    }
    .stage-card {
      background: white;
      border-radius: 20px;
      padding: 28px;
      border: 1px solid var(--gray-200);
      transition: all 0.3s;
    }
    .stage-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 50px rgba(227,6,19,0.12);
      border-color: rgba(227,6,19,0.2);
    }
    .stage-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--red), var(--red-light));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .stage-icon svg {
      width: 28px;
      height: 28px;
      stroke: white;
    }
    .stage-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 10px;
    }
    .stage-desc {
      font-size: 14px;
      color: var(--gray-500);
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .stage-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid var(--gray-100);
    }
    .meta-label {
      font-size: 12px;
      color: var(--gray-400);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-value {
      font-size: 14px;
      font-weight: 700;
      color: var(--red);
    }
    .section-cta {
      text-align: center;
      margin-top: 48px;
    }

    /* ===== PROCESS SECTION ===== */
    .process-section {
      padding: 100px 0;
      background: white;
    }
    .process-track {
      position: relative;
    }
    .track-line {
      position: absolute;
      top: 40px;
      left: 10%;
      right: 10%;
      height: 2px;
      background: linear-gradient(90deg, var(--red), var(--red-light));
    }
    @media (max-width: 768px) {
      .track-line { display: none; }
    }
    .process-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
      position: relative;
    }
    @media (max-width: 768px) {
      .process-steps { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .process-steps { grid-template-columns: 1fr; }
    }
    .process-step {
      text-align: center;
    }
    .step-circle {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: white;
      border: 3px solid var(--red);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      color: var(--red);
      transition: all 0.3s;
      position: relative;
      z-index: 1;
    }
    .process-step:hover .step-circle {
      background: var(--red);
      color: white;
      transform: scale(1.1);
    }
    .step-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 8px;
    }
    .step-desc {
      font-size: 14px;
      color: var(--gray-500);
    }

    /* ===== PFE SECTION (RED BACKGROUND) ===== */
    .pfe-section {
      padding: 100px 0;
      background: linear-gradient(135deg, var(--red) 0%, var(--red-dark) 100%);
      position: relative;
      overflow: hidden;
    }
    .pfe-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .pfe-wrapper {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
      position: relative;
    }
    @media (max-width: 1024px) {
      .pfe-wrapper { grid-template-columns: 1fr; }
    }
    .pfe-title {
      font-size: 42px;
      font-weight: 800;
      color: white;
      line-height: 1.2;
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .pfe-title { font-size: 32px; }
    }
    .pfe-desc {
      font-size: 18px;
      color: rgba(255,255,255,0.85);
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .pfe-features {
      list-style: none;
      padding: 0;
      margin: 0 0 40px 0;
    }
    .pfe-features li {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 0;
      font-size: 16px;
      font-weight: 500;
      color: white;
    }
    .check-circle {
      width: 32px;
      height: 32px;
      background: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
    }

    .pfe-preview {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 24px;
      border: 1px solid rgba(255,255,255,0.15);
    }
    .preview-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .preview-card {
      background: white;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      transition: all 0.3s;
    }
    .preview-card:hover {
      transform: translateX(8px);
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .dept-badge {
      padding: 5px 12px;
      background: rgba(227,6,19,0.1);
      color: var(--red);
      font-size: 12px;
      font-weight: 600;
      border-radius: 20px;
    }
    .duration {
      font-size: 12px;
      color: var(--gray-400);
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--gray-900);
      line-height: 1.4;
    }
    .card-arrow {
      width: 36px;
      height: 36px;
      background: var(--gray-100);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .card-arrow svg {
      width: 18px;
      height: 18px;
      stroke: var(--red);
    }
    .preview-count {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 14px;
      color: white;
      font-weight: 600;
    }
    .preview-loading {
      text-align: center;
      padding: 60px 20px;
      color: white;
    }
    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.2);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ===== CTA SECTION ===== */
    .cta-section {
      padding: 100px 0;
      background: var(--gray-900);
      text-align: center;
    }
    .cta-content {
      max-width: 700px;
      margin: 0 auto;
    }
    .cta-title {
      font-size: 48px;
      font-weight: 800;
      color: white;
      line-height: 1.2;
      margin-bottom: 24px;
    }
    @media (max-width: 768px) {
      .cta-title { font-size: 36px; }
    }
    .cta-desc {
      font-size: 18px;
      color: rgba(255,255,255,0.6);
      line-height: 1.7;
      margin-bottom: 40px;
    }
  `]
})
export class HomeComponent implements OnInit {
  typeStages = TYPE_STAGE_INFO;
  featuredSujets = signal<SujetPfe[]>([]);
  totalSujets = signal(0);

  processSteps = [
    { num: '01', title: 'Choisir', desc: 'Sélectionnez le type de stage' },
    { num: '02', title: 'Postuler', desc: 'Remplissez le formulaire' },
    { num: '03', title: 'Entretien', desc: 'Passez l\'entretien' },
    { num: '04', title: 'Intégrer', desc: 'Rejoignez nos équipes' }
  ];

  constructor(private publicService: PublicService) { }

  ngOnInit() {
    this.loadSujets();
  }

  loadSujets() {
    this.publicService.listerSujetsPfe().subscribe({
      next: (sujets) => {
        this.featuredSujets.set(sujets);
        this.totalSujets.set(sujets.length);
      },
      error: (err) => console.error('Erreur chargement sujets:', err)
    });
  }
}

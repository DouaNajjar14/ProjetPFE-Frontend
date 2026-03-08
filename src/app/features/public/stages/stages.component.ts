import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TYPE_STAGE_INFO } from '../../../core/models/candidature.model';

@Component({
  selector: 'app-stages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="container">
        <span class="badge">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Opportunités
        </span>
        <h1>Nos types de <span class="highlight">stages</span></h1>
        <p>Choisissez le stage qui correspond à votre niveau académique et vos objectifs professionnels</p>
      </div>
    </section>

    <!-- STAGES LIST -->
    <section class="stages-section">
      <div class="container">
        @for (stage of typeStages; track stage.type) {
          <div class="stage-card">
            <div class="stage-bar" [style.background]="getBarColor(stage.couleur)"></div>
            
            <div class="stage-content">
              <div class="stage-header">
                <div class="stage-icon" [style.background]="getIconBg(stage.couleur)">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" [attr.stroke]="getIconColor(stage.couleur)" stroke-width="2">
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
                        <path d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58"/>
                      }
                    }
                  </svg>
                </div>
                <div class="stage-info">
                  <div class="stage-title-row">
                    <h2>{{ stage.titre }}</h2>
                    <span class="level-badge" [style.background]="getIconBg(stage.couleur)" [style.color]="getIconColor(stage.couleur)">
                      Niveau {{ stage.niveau }}
                    </span>
                  </div>
                  <p class="stage-desc">{{ stage.description }}</p>
                  <div class="stage-duration">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E30613" stroke-width="2">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ stage.duree }}
                  </div>
                </div>
              </div>

              <div class="stage-details">
                <div class="details-col">
                  <h3>
                    <span class="icon-box green">✓</span>
                    Objectifs
                  </h3>
                  <ul>
                    @for (objectif of stage.objectifs; track objectif) {
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
                          <path d="M5 13l4 4L19 7"/>
                        </svg>
                        {{ objectif }}
                      </li>
                    }
                  </ul>
                </div>
                <div class="details-col">
                  <h3>
                    <span class="icon-box red">→</span>
                    Prérequis
                  </h3>
                  <ul>
                    @for (prerequis of stage.prerequis; track prerequis) {
                      <li>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E30613" stroke-width="2">
                          <path d="M9 5l7 7-7 7"/>
                        </svg>
                        {{ prerequis }}
                      </li>
                    }
                  </ul>
                </div>
              </div>

              <div class="stage-cta">
                @if (stage.type === 'PFE') {
                  <a routerLink="/pfe-book" class="btn-primary">
                    Consulter le PFE Book
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                } @else {
                  <a [routerLink]="['/postuler']" [queryParams]="{type: stage.type}" class="btn-primary">
                    Postuler maintenant
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- HELP CTA -->
    <section class="help-section">
      <div class="container">
        <div class="help-icon">?</div>
        <h2>Besoin d'aide pour <span class="highlight">choisir</span> ?</h2>
        <p>Notre équipe RH est disponible pour vous guider et vous aider à trouver le stage qui correspond le mieux à votre profil.</p>
        <a href="mailto:stages@ooredoo.tn" class="btn-secondary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Nous contacter
        </a>
      </div>
    </section>
  `,
  styles: [`
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .highlight { color: #E30613; }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, #E30613 0%, #B8000F 100%);
      padding: 120px 0 80px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .hero .container { position: relative; z-index: 1; }
    .hero .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      font-size: 14px;
      color: white;
      margin-bottom: 24px;
    }
    .hero h1 {
      font-size: 42px;
      font-weight: 800;
      color: white;
      margin-bottom: 16px;
    }
    .hero p {
      font-size: 18px;
      color: rgba(255,255,255,0.85);
      max-width: 600px;
      margin: 0 auto;
    }

    /* Stages Section */
    .stages-section {
      background: #F5F2F0;
      padding: 80px 0;
    }
    .stage-card {
      background: white;
      border-radius: 22px;
      overflow: hidden;
      margin-bottom: 32px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .stage-bar {
      height: 6px;
    }
    .stage-content {
      padding: 32px;
    }
    .stage-header {
      display: flex;
      gap: 24px;
      margin-bottom: 32px;
    }
    @media (max-width: 640px) {
      .stage-header { flex-direction: column; }
    }
    .stage-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stage-info { flex: 1; }
    .stage-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }
    .stage-title-row h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0A0A0A;
      margin: 0;
    }
    .level-badge {
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
    }
    .stage-desc {
      font-size: 15px;
      color: #6E6E6E;
      line-height: 1.6;
      margin-bottom: 12px;
    }
    .stage-duration {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #A0A0A0;
    }

    /* Details */
    .stage-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding-top: 32px;
      border-top: 1px solid #E8E0DF;
    }
    @media (max-width: 640px) {
      .stage-details { grid-template-columns: 1fr; }
    }
    .details-col h3 {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0A0A0A;
      margin-bottom: 16px;
    }
    .icon-box {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .icon-box.green { background: #D1FAE5; color: #059669; }
    .icon-box.red { background: #FFF7F6; color: #E30613; }
    .details-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .details-col li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 14px;
      color: #6E6E6E;
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .details-col li svg {
      flex-shrink: 0;
      margin-top: 2px;
    }

    /* CTA */
    .stage-cta {
      padding-top: 24px;
      margin-top: 24px;
      border-top: 1px solid #E8E0DF;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #E30613, #B8000F);
      border-radius: 22px;
      box-shadow: 0 4px 16px rgba(227,6,19,0.38);
      text-decoration: none;
      transition: all 0.3s;
    }
    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 28px rgba(227,6,19,0.5);
    }

    /* Help Section */
    .help-section {
      background: white;
      padding: 80px 0;
      text-align: center;
    }
    .help-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      background: #FFF7F6;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 700;
      color: #E30613;
    }
    .help-section h2 {
      font-size: 28px;
      font-weight: 700;
      color: #0A0A0A;
      margin-bottom: 16px;
    }
    .help-section p {
      font-size: 16px;
      color: #6E6E6E;
      max-width: 500px;
      margin: 0 auto 32px;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 28px;
      font-size: 14px;
      font-weight: 600;
      color: #0A0A0A;
      background: white;
      border: 1px solid #E8E0DF;
      border-radius: 22px;
      text-decoration: none;
      transition: all 0.3s;
    }
    .btn-secondary:hover {
      border-color: #E30613;
      color: #E30613;
    }
  `]
})
export class StagesComponent {
  typeStages = TYPE_STAGE_INFO;

  getBarColor(couleur: string): string {
    const colors: { [key: string]: string } = {
      'blue': '#2563EB',
      'amber': '#D97706',
      'green': '#059669',
      'red': '#E30613'
    };
    return colors[couleur] || '#6B7280';
  }

  getIconBg(couleur: string): string {
    const colors: { [key: string]: string } = {
      'blue': '#DBEAFE',
      'amber': '#FEF3C7',
      'green': '#D1FAE5',
      'red': '#FFF7F6'
    };
    return colors[couleur] || '#F3F4F6';
  }

  getIconColor(couleur: string): string {
    const colors: { [key: string]: string } = {
      'blue': '#2563EB',
      'amber': '#D97706',
      'green': '#059669',
      'red': '#E30613'
    };
    return colors[couleur] || '#6B7280';
  }
}

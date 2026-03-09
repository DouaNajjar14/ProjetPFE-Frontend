import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-public-footer',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <footer class="footer">
      <div class="footer-container">
        <!-- Main Grid -->
        <div class="footer-grid">
          <!-- Brand Column -->
          <div class="footer-brand">
            <div class="brand-logo">
              <div class="logo-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <span class="logo-text">ooredoo</span>
            </div>
            <p class="brand-desc">
              Rejoignez l'aventure Ooredoo et développez vos compétences au sein du leader tunisien des télécommunications.
            </p>
            <div class="social-links">
              <a href="#" class="social-link">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" class="social-link">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" class="social-link">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>

          <!-- Navigation Column -->
          <div class="footer-col">
            <h4 class="col-title">Navigation</h4>
            <ul class="col-links">
              <li><a routerLink="/">Accueil</a></li>
              <li><a routerLink="/stages">Nos Stages</a></li>
              <li><a routerLink="/pfe-book">PFE Book 2026</a></li>
              <li><a routerLink="/postuler">Candidater</a></li>
              <li><a routerLink="/login">Espace Candidat</a></li>
            </ul>
          </div>

          <!-- Types de stages Column -->
          <div class="footer-col">
            <h4 class="col-title">Types de Stages</h4>
            <ul class="col-links">
              <li><a routerLink="/postuler"><span class="dot"></span>Stage d'Initiation</a></li>
              <li><a routerLink="/postuler"><span class="dot"></span>Stage de Perfectionnement</a></li>
              <li><a routerLink="/postuler"><span class="dot"></span>Stage d'Été</a></li>
              <li><a routerLink="/pfe-book"><span class="dot"></span>Projet de Fin d'Études</a></li>
            </ul>
          </div>

          <!-- Contact Column -->
          <div class="footer-col">
            <h4 class="col-title">Contact</h4>
            <ul class="contact-list">
              <li>
                <div class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ED1C24" stroke-width="2">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <span>Immeuble Ooredoo,<br>Lac 3, Tunis 1053</span>
              </li>
              <li>
                <div class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ED1C24" stroke-width="2">
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <span>+216 22 123 456</span>
              </li>
              <li>
                <div class="contact-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ED1C24" stroke-width="2">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <span>stages&#64;ooredoo.tn</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
          <p>© 2026 Ooredoo Tunisia. Tous droits réservés.</p>
          <div class="footer-legal">
            <a href="#">Politique de confidentialité</a>
            <span>|</span>
            <a href="#">Conditions d'utilisation</a>
          </div>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    .footer {
      background: #0A0A0A;
      color: white;
      padding-top: 64px;
    }
    .footer-container {
      max-width: 1152px;
      margin: 0 auto;
      padding: 0 20px;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
      gap: 48px;
      padding-bottom: 48px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    @media (max-width: 1023px) {
      .footer-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 639px) {
      .footer-grid { grid-template-columns: 1fr; }
    }
    
    /* Brand */
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
    .logo-icon {
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(135deg, #ED1C24, #ED1C24);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    .brand-desc {
      font-size: 14px;
      color: #A0A0A0;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .social-links {
      display: flex;
      gap: 12px;
    }
    .social-link {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #A0A0A0;
      transition: all 0.3s;
    }
    .social-link:hover {
      background: #ED1C24;
      color: white;
    }
    
    /* Columns */
    .col-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: white;
      margin-bottom: 20px;
    }
    .col-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .col-links li {
      margin-bottom: 12px;
    }
    .col-links a {
      font-size: 14px;
      color: #A0A0A0;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: color 0.3s;
    }
    .col-links a:hover {
      color: white;
    }
    .dot {
      width: 6px;
      height: 6px;
      background: #ED1C24;
      border-radius: 50%;
    }
    
    /* Contact */
    .contact-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .contact-list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 16px;
    }
    .contact-icon {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .contact-list span {
      font-size: 14px;
      color: #A0A0A0;
      line-height: 1.5;
    }
    
    /* Bottom */
    .footer-bottom {
      padding: 24px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    @media (max-width: 639px) {
      .footer-bottom {
        flex-direction: column;
        text-align: center;
      }
    }
    .footer-bottom p {
      font-size: 14px;
      color: #A0A0A0;
      margin: 0;
    }
    .footer-legal {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .footer-legal a {
      font-size: 12px;
      color: #A0A0A0;
      text-decoration: none;
      transition: color 0.3s;
    }
    .footer-legal a:hover {
      color: white;
    }
    .footer-legal span {
      color: rgba(255,255,255,0.2);
    }
  `]
})
export class PublicFooterComponent { }

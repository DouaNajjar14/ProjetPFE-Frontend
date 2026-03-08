import { Component, OnInit, signal, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { PublicService } from '../../../core/services/public.service';
import { Universite } from '../../../core/models/universite.model';
import { CandidatureRequest } from '../../../core/models/candidature.model';
import { Niveau } from '../../../core/models/candidat.model';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';

@Component({
  selector: 'app-postuler-pfe',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <!-- Hero Header -->
    <section class="hero-section">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>

      <div class="hero-content">
        <div class="badge">
          <svg class="badge-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
          <span>Projet de Fin d'Études</span>
        </div>
        <h1 class="hero-title reveal">
          Candidature <span class="text-red">PFE</span>
        </h1>
        <p class="hero-subtitle reveal">
          Postulez pour un sujet de Projet de Fin d'Études et lancez votre carrière.
        </p>
      </div>
    </section>

    <!-- Main Form Section -->
    <section class="form-section">
      <div class="container">
        <!-- Back Link -->
        <a routerLink="/pfe-book" class="back-link">
          <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au catalogue PFE
        </a>

        @if (loading()) {
          <div class="loading-state">
            <svg class="spinner" fill="none" viewBox="0 0 24 24">
              <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Chargement des sujets PFE...</p>
          </div>
        } @else {
          <!-- Step Indicator -->
          <div class="step-indicator">
            @for (step of steps; track step.number; let i = $index) {
              <div class="step-dot" 
                   [class.active]="currentStep() === step.number"
                   [class.completed]="currentStep() > step.number">
                @if (currentStep() > step.number) {
                  <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  {{ step.number }}
                }
              </div>
              @if (i < steps.length - 1) {
                <div class="step-line" [class.active]="currentStep() > step.number"></div>
              }
            }
          </div>

          <!-- Step Labels -->
          <div class="step-labels">
            @for (step of steps; track step.number) {
              <span class="step-label" [class.active]="currentStep() >= step.number">{{ step.label }}</span>
            }
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Step 1: Subject Selection -->
            @if (currentStep() === 1) {
              <div class="card reveal">
                <div class="card-header">
                  <div class="header-icon">
                    <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 class="card-title">Choisissez vos sujets PFE</h2>
                  <p class="card-subtitle">Sélectionnez un premier choix obligatoire et un second choix optionnel.</p>
                </div>

                <!-- Selected Subject Preview -->
                @if (selectedSujet()) {
                  <div class="selected-preview">
                    <div class="preview-icon">
                      <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="preview-info">
                      <p class="preview-label">SUJET PRÉ-SÉLECTIONNÉ</p>
                      <h4 class="preview-title">{{ selectedSujet()?.titre }}</h4>
                      <p class="preview-dept">{{ selectedSujet()?.departementNom }}</p>
                    </div>
                  </div>
                }

                <div class="subjects-form">
                  <div class="form-group">
                    <label class="form-label">
                      Premier choix <span class="required">*</span>
                    </label>
                    <select formControlName="sujetChoix1Id" class="form-input">
                      <option value="">Sélectionnez votre premier choix</option>
                      @for (sujet of sujets(); track sujet.id) {
                        <option [value]="sujet.id">{{ sujet.titre }} — {{ sujet.departementNom }}</option>
                      }
                    </select>
                    @if (form.get('sujetChoix1Id')?.value) {
                      <div class="subject-description">
                        <p>{{ getSujetDescription(form.get('sujetChoix1Id')?.value) }}</p>
                      </div>
                    }
                  </div>

                  <div class="form-group">
                    <label class="form-label">
                      Deuxième choix <span class="optional">(optionnel)</span>
                    </label>
                    <select formControlName="sujetChoix2Id" class="form-input">
                      <option value="">Sélectionnez votre deuxième choix</option>
                      @for (sujet of sujets(); track sujet.id) {
                        @if (sujet.id !== form.get('sujetChoix1Id')?.value) {
                          <option [value]="sujet.id">{{ sujet.titre }} — {{ sujet.departementNom }}</option>
                        }
                      }
                    </select>
                  </div>
                </div>

                <div class="card-actions">
                  <button type="button" 
                          (click)="nextStep()" 
                          [disabled]="!form.get('sujetChoix1Id')?.value"
                          class="btn-primary"
                          [class.disabled]="!form.get('sujetChoix1Id')?.value">
                    Continuer
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 2: Personal Information -->
            @if (currentStep() === 2) {
              <div class="card reveal">
                <div class="card-header">
                  <div class="header-icon">
                    <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 class="card-title">Vos informations personnelles</h2>
                  <p class="card-subtitle">Renseignez vos coordonnées et informations académiques.</p>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label class="form-label">Nom <span class="required">*</span></label>
                    <input type="text" formControlName="nom" placeholder="Votre nom" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Prénom <span class="required">*</span></label>
                    <input type="text" formControlName="prenom" placeholder="Votre prénom" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email <span class="required">*</span></label>
                    <input type="email" formControlName="email" placeholder="votre@email.com" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Téléphone <span class="required">*</span></label>
                    <input type="tel" formControlName="tel" placeholder="+216 XX XXX XXX" class="form-input">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Université / École <span class="required">*</span></label>
                    <select formControlName="universiteId" class="form-input">
                      <option value="">Sélectionnez votre établissement</option>
                      @for (univ of universites(); track univ.id) {
                        <option [value]="univ.id">{{ univ.nom }}</option>
                      }
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Niveau académique <span class="required">*</span></label>
                    <select formControlName="niveauAcademique" class="form-input">
                      <option value="">Sélectionnez votre niveau</option>
                      <option value="BAC_PLUS_3">Licence 3 (L3)</option>
                      <option value="BAC_PLUS_5">Master 2 (M2)</option>
                      <option value="BAC_PLUS_5">Cycle Ingénieur 3 (CY3)</option>
                    </select>
                  </div>
                </div>

                <!-- Dates Section -->
                <div class="dates-section">
                  <h3 class="section-title">Période de stage souhaitée</h3>
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">Date de début <span class="required">*</span></label>
                      <input type="date" formControlName="dateDebut" class="form-input">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Date de fin <span class="required">*</span></label>
                      <input type="date" formControlName="dateFin" class="form-input">
                    </div>
                  </div>
                </div>

                <div class="card-actions-between">
                  <button type="button" (click)="prevStep()" class="btn-secondary">
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                  </button>
                  <button type="button" 
                          (click)="nextStep()" 
                          [disabled]="!isStep2Valid()"
                          class="btn-primary"
                          [class.disabled]="!isStep2Valid()">
                    Continuer
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 3: Binome -->
            @if (currentStep() === 3) {
              <div class="card reveal">
                <div class="card-header">
                  <div class="header-icon">
                    <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 class="card-title">Travail en binôme</h2>
                  <p class="card-subtitle">Indiquez si vous travaillez avec un partenaire sur ce PFE.</p>
                </div>

                <div class="binome-toggle">
                  <div class="toggle-info">
                    <p class="toggle-title">Travaillez-vous en binôme ?</p>
                    <p class="toggle-desc">Recommandé pour les projets complexes</p>
                  </div>
                  <label class="switch">
                    <input type="checkbox" formControlName="estBinome">
                    <span class="slider"></span>
                  </label>
                </div>

                @if (form.get('estBinome')?.value) {
                  <div class="binome-form">
                    <h4 class="binome-heading">
                      <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Informations du binôme
                    </h4>
                    <div class="form-grid">
                      <div class="form-group">
                        <label class="form-label">Nom <span class="required">*</span></label>
                        <input type="text" formControlName="binomeNom" placeholder="Nom du binôme" class="form-input">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Prénom <span class="required">*</span></label>
                        <input type="text" formControlName="binomePrenom" placeholder="Prénom du binôme" class="form-input">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Email <span class="required">*</span></label>
                        <input type="email" formControlName="binomeEmail" placeholder="email@binome.com" class="form-input">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Téléphone <span class="required">*</span></label>
                        <input type="tel" formControlName="binomeTel" placeholder="+216 XX XXX XXX" class="form-input">
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="solo-message">
                    <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p>Vous travaillerez seul sur ce projet.</p>
                  </div>
                }

                <div class="card-actions-between">
                  <button type="button" (click)="prevStep()" class="btn-secondary">
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                  </button>
                  <button type="button" 
                          (click)="nextStep()" 
                          [disabled]="form.get('estBinome')?.value && !isBinomeValid()"
                          class="btn-primary"
                          [class.disabled]="form.get('estBinome')?.value && !isBinomeValid()">
                    Continuer
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 4: Documents Upload -->
            @if (currentStep() === 4) {
              <div class="card reveal">
                <div class="card-header">
                  <div class="header-icon">
                    <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 class="card-title">Vos documents</h2>
                  <p class="card-subtitle">Téléchargez votre CV et lettre de motivation.</p>
                </div>

                <!-- CV Upload -->
                <div class="upload-section">
                  <label class="form-label">
                    Curriculum Vitae (CV) <span class="required">*</span>
                  </label>
                  <div class="upload-zone" 
                       [class.has-file]="cv1File()"
                       [class.drag-over]="isDragging()"
                       (dragover)="onDragOver($event)" 
                       (dragleave)="onDragLeave($event)"
                       (drop)="onDrop($event, 'cv1')">
                    @if (cv1File()) {
                      <div class="file-preview">
                        <div class="file-icon success">
                          <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="file-info">
                          <p class="file-name">{{ cv1File()?.name }}</p>
                          <p class="file-size">{{ formatFileSize(cv1File()?.size || 0) }}</p>
                        </div>
                        <button type="button" (click)="removeFile('cv1')" class="file-remove">
                          <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    } @else {
                      <div class="upload-icon">
                        <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p class="upload-text">Glissez-déposez votre CV ici</p>
                      <p class="upload-or">ou</p>
                      <label class="upload-btn">
                        Parcourir les fichiers
                        <input type="file" class="hidden" accept=".pdf" (change)="onFileSelect($event, 'cv1')">
                      </label>
                      <p class="upload-hint">Format: PDF • Taille max: 5 Mo</p>
                    }
                  </div>
                </div>

                <!-- Lettre de motivation Upload -->
                <div class="upload-section">
                  <label class="form-label">
                    Lettre de motivation <span class="optional">(optionnel)</span>
                  </label>
                  <div class="upload-zone small" 
                       [class.has-file]="lettreFile()"
                       (dragover)="onDragOver($event)" 
                       (dragleave)="onDragLeave($event)"
                       (drop)="onDrop($event, 'lettre')">
                    @if (lettreFile()) {
                      <div class="file-preview">
                        <div class="file-icon success">
                          <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div class="file-info">
                          <p class="file-name">{{ lettreFile()?.name }}</p>
                          <p class="file-size">{{ formatFileSize(lettreFile()?.size || 0) }}</p>
                        </div>
                        <button type="button" (click)="removeFile('lettre')" class="file-remove">
                          <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    } @else {
                      <label class="upload-btn-secondary">
                        Parcourir
                        <input type="file" class="hidden" accept=".pdf" (change)="onFileSelect($event, 'lettre')">
                      </label>
                    }
                  </div>
                </div>

                <!-- Binome CV Upload -->
                @if (form.get('estBinome')?.value) {
                  <div class="upload-section">
                    <label class="form-label">
                      CV du binôme <span class="required">*</span>
                    </label>
                    <div class="upload-zone small" 
                         [class.has-file]="cv2File()"
                         (dragover)="onDragOver($event)" 
                         (dragleave)="onDragLeave($event)"
                         (drop)="onDrop($event, 'cv2')">
                      @if (cv2File()) {
                        <div class="file-preview">
                          <div class="file-icon success">
                            <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div class="file-info">
                            <p class="file-name">{{ cv2File()?.name }}</p>
                            <p class="file-size">{{ formatFileSize(cv2File()?.size || 0) }}</p>
                          </div>
                          <button type="button" (click)="removeFile('cv2')" class="file-remove">
                            <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      } @else {
                        <label class="upload-btn">
                          Parcourir
                          <input type="file" class="hidden" accept=".pdf" (change)="onFileSelect($event, 'cv2')">
                        </label>
                      }
                    </div>
                  </div>
                }

                <div class="card-actions-between">
                  <button type="button" (click)="prevStep()" class="btn-secondary">
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                  </button>
                  <button type="button" 
                          (click)="nextStep()" 
                          [disabled]="!isStep4Valid()"
                          class="btn-primary"
                          [class.disabled]="!isStep4Valid()">
                    Réviser et envoyer
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            }

            <!-- Step 5: Review -->
            @if (currentStep() === 5) {
              <div class="card reveal">
                <div class="card-header">
                  <div class="header-icon">
                    <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 class="card-title">Récapitulatif</h2>
                  <p class="card-subtitle">Vérifiez vos informations avant d'envoyer votre candidature PFE.</p>
                </div>

                <!-- Review Sections -->
                <div class="review-sections">
                  <!-- Sujets -->
                  <div class="review-card">
                    <div class="review-header">
                      <h4 class="review-title">
                        <span class="review-number">1</span>
                        Sujets PFE
                      </h4>
                      <button type="button" (click)="goToStep(1)" class="review-edit">Modifier</button>
                    </div>
                    <p class="review-value">{{ getSujetTitre(form.get('sujetChoix1Id')?.value) }}</p>
                    @if (form.get('sujetChoix2Id')?.value) {
                      <p class="review-meta">2e choix: {{ getSujetTitre(form.get('sujetChoix2Id')?.value) }}</p>
                    }
                  </div>

                  <!-- Informations personnelles -->
                  <div class="review-card">
                    <div class="review-header">
                      <h4 class="review-title">
                        <span class="review-number">2</span>
                        Informations personnelles
                      </h4>
                      <button type="button" (click)="goToStep(2)" class="review-edit">Modifier</button>
                    </div>
                    <div class="review-grid">
                      <div class="review-item">
                        <span class="review-label">Nom:</span> 
                        <span class="review-value">{{ form.get('prenom')?.value }} {{ form.get('nom')?.value }}</span>
                      </div>
                      <div class="review-item">
                        <span class="review-label">Email:</span> 
                        <span class="review-value">{{ form.get('email')?.value }}</span>
                      </div>
                      <div class="review-item">
                        <span class="review-label">Téléphone:</span> 
                        <span class="review-value">{{ form.get('tel')?.value }}</span>
                      </div>
                      <div class="review-item">
                        <span class="review-label">Niveau:</span> 
                        <span class="review-value">{{ form.get('niveauAcademique')?.value }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Binome -->
                  @if (form.get('estBinome')?.value) {
                    <div class="review-card">
                      <div class="review-header">
                        <h4 class="review-title">
                          <span class="review-number">3</span>
                          Binôme
                        </h4>
                        <button type="button" (click)="goToStep(3)" class="review-edit">Modifier</button>
                      </div>
                      <p class="review-value">{{ form.get('binomePrenom')?.value }} {{ form.get('binomeNom')?.value }}</p>
                      <p class="review-meta">{{ form.get('binomeEmail')?.value }}</p>
                    </div>
                  }

                  <!-- Documents -->
                  <div class="review-card">
                    <div class="review-header">
                      <h4 class="review-title">
                        <span class="review-number">4</span>
                        Documents
                      </h4>
                      <button type="button" (click)="goToStep(4)" class="review-edit">Modifier</button>
                    </div>
                    <div class="documents-list">
                      <div class="document-item">
                        <svg class="icon-small success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ cv1File()?.name }}</span>
                      </div>
                      @if (lettreFile()) {
                        <div class="document-item">
                          <svg class="icon-small success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ lettreFile()?.name }} (Lettre)</span>
                        </div>
                      }
                      @if (cv2File()) {
                        <div class="document-item">
                          <svg class="icon-small success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{{ cv2File()?.name }} (Binôme)</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Terms -->
                <div class="terms-section">
                  <input type="checkbox" id="terms" [(ngModel)]="acceptTerms" [ngModelOptions]="{standalone: true}" class="checkbox">
                  <label for="terms" class="terms-label">
                    J'atteste que les informations fournies sont exactes et j'accepte les 
                    <a href="#" class="terms-link">conditions générales</a>.
                  </label>
                </div>

                <div class="card-actions-between">
                  <button type="button" (click)="prevStep()" class="btn-secondary">
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour
                  </button>
                  <button type="submit"
                          [disabled]="!acceptTerms || submitting()"
                          class="btn-primary"
                          [class.disabled]="!acceptTerms || submitting()">
                    @if (submitting()) {
                      <svg class="spinner-btn" fill="none" viewBox="0 0 24 24">
                        <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    } @else {
                      <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Soumettre ma candidature PFE
                    }
                  </button>
                </div>
              </div>
            }
          </form>
        }
      </div>
    </section>

    <!-- Success Modal -->
    @if (showSuccess()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="success-icon">
            <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="modal-title">Candidature PFE envoyée !</h3>
          <p class="modal-text">
            Votre candidature a été soumise avec succès pour le sujet <strong>{{ getSujetTitre(form.get('sujetChoix1Id')?.value) }}</strong>.
          </p>
          <div class="modal-actions">
            <a routerLink="/" class="btn-primary full-width">Retour à l'accueil</a>
            <a routerLink="/pfe-book" class="btn-secondary full-width">Voir d'autres sujets</a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== Variables ===== */
    :host {
      --primary: #e30613;
      --primary-dark: #c20510;
      --primary-light: #fee2e2;
      --ink: #1a1a2e;
      --muted: #64748b;
      --light: #94a3b8;
      --bg: #f8fafc;
      --white: #ffffff;
      --border: #e2e8f0;
      --success: #10b981;
      --success-light: #d1fae5;
      --radius: 16px;
      --radius-sm: 12px;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    /* ===== Hero Section ===== */
    .hero-section {
      min-height: 40vh;
      background: linear-gradient(135deg, #E30613 0%, #B8000F 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 60px 20px;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.8;
    }

    .floating-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 15s ease-in-out infinite;
    }

    .circle-1 {
      width: 400px;
      height: 400px;
      top: -200px;
      left: -200px;
      opacity: 1;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      top: 80px;
      right: 40px;
      opacity: 0.5;
      animation-delay: -3s;
    }

    .circle-3 {
      width: 200px;
      height: 200px;
      bottom: 40px;
      left: 25%;
      opacity: 0.5;
      animation-delay: -5s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-30px) rotate(5deg); }
    }

    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      max-width: 800px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(8px);
      border-radius: 50px;
      margin-bottom: 24px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .badge-icon {
      width: 20px;
      height: 20px;
      color: var(--primary);
    }

    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      color: var(--white);
      margin-bottom: 16px;
      line-height: 1.2;
    }

    .text-red {
      color: var(--primary);
    }

    .hero-subtitle {
      color: #cbd5e1;
      font-size: 1.125rem;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (min-width: 768px) {
      .hero-title { font-size: 3.5rem; }
      .hero-subtitle { font-size: 1.25rem; }
    }

    /* ===== Reveal Animation ===== */
    .reveal {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }

    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }

    /* ===== Form Section ===== */
    .form-section {
      padding: 64px 0;
      background: var(--bg);
      min-height: 100vh;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 0 16px;
    }

    /* ===== Loading State ===== */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
      color: var(--muted);
    }

    .loading-state .spinner {
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: var(--primary);
    }

    /* ===== Back Link ===== */
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--muted);
      text-decoration: none;
      margin-bottom: 32px;
      transition: color 0.3s;
    }

    .back-link:hover {
      color: var(--primary);
    }

    .back-link:hover svg {
      transform: translateX(-4px);
    }

    .back-link svg {
      transition: transform 0.3s;
    }

    /* ===== Step Indicator ===== */
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      margin-bottom: 16px;
    }

    .step-dot {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      background: var(--white);
      color: var(--muted);
      border: 2px solid var(--border);
      transition: all 0.3s;
      flex-shrink: 0;
    }

    .step-dot.active {
      background: var(--primary);
      color: var(--white);
      border-color: var(--primary);
      transform: scale(1.1);
      box-shadow: 0 0 0 4px rgba(227, 6, 19, 0.2);
    }

    .step-dot.completed {
      background: var(--success);
      color: var(--white);
      border-color: var(--success);
    }

    .step-line {
      width: 60px;
      height: 3px;
      background: var(--border);
      transition: background 0.3s;
    }

    .step-line.active {
      background: var(--success);
    }

    .step-labels {
      display: flex;
      justify-content: space-between;
      margin-bottom: 32px;
      padding: 0 10px;
    }

    .step-label {
      font-size: 0.75rem;
      color: var(--light);
      text-align: center;
      flex: 1;
      transition: color 0.3s;
    }

    .step-label.active {
      color: var(--ink);
      font-weight: 500;
    }

    /* ===== Card ===== */
    .card {
      background: var(--white);
      border-radius: var(--radius);
      padding: 40px;
      box-shadow: var(--shadow);
    }

    .card-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .header-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: var(--radius);
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--white);
    }

    .card-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: var(--muted);
      font-size: 0.9375rem;
    }

    /* ===== Icons ===== */
    .icon-small { width: 20px; height: 20px; }
    .icon-medium { width: 32px; height: 32px; }
    .icon-large { width: 40px; height: 40px; }
    .hidden { display: none; }

    /* ===== Selected Preview ===== */
    .selected-preview {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 20px;
      background: var(--primary-light);
      border: 1px solid rgba(227, 6, 19, 0.2);
      border-radius: var(--radius);
      margin-bottom: 24px;
    }

    .preview-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      background: var(--primary);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .preview-info {
      flex: 1;
    }

    .preview-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-title {
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .preview-dept {
      font-size: 0.875rem;
      color: var(--muted);
    }

    /* ===== Subjects Form ===== */
    .subjects-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .subject-description {
      margin-top: 8px;
      padding: 12px;
      background: var(--bg);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      color: var(--muted);
    }

    /* ===== Buttons ===== */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: var(--white);
      font-weight: 600;
      font-size: 0.9375rem;
      border: none;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
    }

    .btn-primary:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(227, 6, 19, 0.3);
    }

    .btn-primary.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 28px;
      background: var(--white);
      color: var(--ink);
      font-weight: 600;
      font-size: 0.9375rem;
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
    }

    .btn-secondary:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
    }

    .card-actions-between {
      display: flex;
      justify-content: space-between;
      margin-top: 32px;
    }

    /* ===== Form Styles ===== */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }

    .required {
      color: var(--primary);
    }

    .optional {
      color: var(--light);
      font-weight: 400;
    }

    .form-input {
      padding: 14px 16px;
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      font-size: 0.9375rem;
      color: var(--ink);
      background: var(--white);
      transition: all 0.3s;
      outline: none;
    }

    .form-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(227, 6, 19, 0.1);
    }

    .form-input::placeholder {
      color: var(--light);
    }

    /* ===== Dates Section ===== */
    .dates-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .section-title {
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--ink);
      margin-bottom: 20px;
    }

    /* ===== Binome Toggle ===== */
    .binome-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: var(--bg);
      border-radius: var(--radius);
      margin-bottom: 24px;
    }

    .toggle-info {
      flex: 1;
    }

    .toggle-title {
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .toggle-desc {
      font-size: 0.875rem;
      color: var(--muted);
    }

    /* Switch Toggle */
    .switch {
      position: relative;
      display: inline-block;
      width: 56px;
      height: 28px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: 0.4s;
      border-radius: 28px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 24px;
      width: 24px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: var(--primary);
    }

    input:checked + .slider:before {
      transform: translateX(28px);
    }

    /* ===== Binome Form ===== */
    .binome-form {
      background: rgba(227, 6, 19, 0.05);
      border: 1px solid rgba(227, 6, 19, 0.1);
      border-radius: var(--radius);
      padding: 24px;
    }

    .binome-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 20px;
    }

    .binome-heading svg {
      color: var(--primary);
    }

    /* ===== Solo Message ===== */
    .solo-message {
      text-align: center;
      padding: 40px;
      color: var(--muted);
    }

    .solo-message svg {
      color: var(--light);
      margin-bottom: 16px;
    }

    /* ===== Upload Section ===== */
    .upload-section {
      margin-bottom: 24px;
    }

    .upload-zone {
      border: 2px dashed var(--border);
      border-radius: var(--radius);
      padding: 40px;
      text-align: center;
      transition: all 0.3s;
      background: var(--bg);
    }

    .upload-zone.small {
      padding: 20px;
    }

    .upload-zone:hover,
    .upload-zone.drag-over {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .upload-zone.has-file {
      border-style: solid;
      border-color: var(--success);
      background: var(--success-light);
    }

    .upload-icon {
      color: var(--light);
      margin-bottom: 16px;
    }

    .upload-text {
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 8px;
    }

    .upload-or {
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 12px;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      background: var(--primary);
      color: var(--white);
      font-weight: 500;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s;
    }

    .upload-btn:hover {
      background: var(--primary-dark);
    }

    .upload-btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--white);
      color: var(--ink);
      font-weight: 500;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s;
    }

    .upload-btn-secondary:hover {
      background: var(--bg);
    }

    .upload-hint {
      font-size: 0.75rem;
      color: var(--light);
      margin-top: 12px;
    }

    /* ===== File Preview ===== */
    .file-preview {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .file-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .file-icon.success {
      background: var(--success-light);
      color: var(--success);
    }

    .file-info {
      flex: 1;
      text-align: left;
    }

    .file-name {
      font-weight: 600;
      color: var(--ink);
    }

    .file-size {
      font-size: 0.875rem;
      color: var(--muted);
    }

    .file-remove {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fef2f2;
      color: #ef4444;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    }

    .file-remove:hover {
      background: #fee2e2;
    }

    /* ===== Review Section ===== */
    .review-sections {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .review-card {
      background: var(--bg);
      border-radius: var(--radius-sm);
      padding: 20px;
    }

    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .review-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      color: var(--ink);
    }

    .review-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--primary-light);
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .review-edit {
      font-size: 0.875rem;
      color: var(--primary);
      background: none;
      border: none;
      cursor: pointer;
    }

    .review-edit:hover {
      text-decoration: underline;
    }

    .review-value {
      font-weight: 500;
      color: var(--ink);
    }

    .review-meta {
      font-size: 0.875rem;
      color: var(--muted);
      margin-top: 4px;
    }

    .review-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      font-size: 0.875rem;
    }

    @media (max-width: 640px) {
      .review-grid { grid-template-columns: 1fr; }
    }

    .review-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .review-label {
      color: var(--muted);
    }

    /* ===== Documents List ===== */
    .documents-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .document-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--ink);
    }

    .success-icon {
      color: var(--success);
    }

    /* ===== Terms Section ===== */
    .terms-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 32px;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .terms-label {
      font-size: 0.875rem;
      color: var(--muted);
      line-height: 1.5;
    }

    .terms-link {
      color: var(--primary);
      text-decoration: none;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    /* ===== Spinner ===== */
    .spinner {
      animation: spin 1s linear infinite;
    }

    .spinner-btn {
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
    }

    .spinner-track {
      opacity: 0.25;
    }

    .spinner-fill {
      opacity: 0.75;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* ===== Modal ===== */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      padding: 16px;
    }

    .modal-content {
      background: var(--white);
      border-radius: 24px;
      padding: 48px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: var(--shadow-lg);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--success), #059669);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 12px;
    }

    .modal-text {
      color: var(--muted);
      margin-bottom: 32px;
      line-height: 1.6;
    }

    .modal-text strong {
      color: var(--ink);
    }

    .modal-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class PostulerPfeComponent implements OnInit {
  universites = signal<Universite[]>([]);
  sujets = signal<SujetPfe[]>([]);
  selectedSujet = signal<SujetPfe | null>(null);
  loading = signal(true);
  submitting = signal(false);
  showSuccess = signal(false);
  currentStep = signal(1);
  isDragging = signal(false);
  acceptTerms = false;

  cv1File = signal<File | null>(null);
  cv2File = signal<File | null>(null);
  lettreFile = signal<File | null>(null);

  steps = [
    { number: 1, label: 'Sujets' },
    { number: 2, label: 'Informations' },
    { number: 3, label: 'Binôme' },
    { number: 4, label: 'Documents' },
    { number: 5, label: 'Confirmation' }
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private universiteService: UniversiteService,
    private candidatureService: CandidatureService,
    private publicService: PublicService
  ) {
    this.form = this.fb.group({
      sujetChoix1Id: ['', Validators.required],
      sujetChoix2Id: [''],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', Validators.required],
      universiteId: ['', Validators.required],
      niveauAcademique: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      estBinome: [false],
      binomeNom: [''],
      binomePrenom: [''],
      binomeEmail: [''],
      binomeTel: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.initScrollReveal();
  }

  @HostListener('window:scroll')
  onScroll() {
    this.initScrollReveal();
  }

  initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('active');
      }
    });
  }

  loadData() {
    this.universiteService.listerTous().subscribe({
      next: (unis) => this.universites.set(unis)
    });

    this.publicService.listerSujetsPfe().subscribe({
      next: (sujets) => {
        this.sujets.set(sujets);

        this.route.queryParams.subscribe(params => {
          if (params['sujet']) {
            const sujet = sujets.find(s => s.id === params['sujet']);
            if (sujet) {
              this.selectedSujet.set(sujet);
              this.form.patchValue({ sujetChoix1Id: sujet.id });
            }
          }
        });

        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  nextStep() {
    if (this.currentStep() < 5) {
      this.currentStep.update(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isStep2Valid(): boolean {
    const controls = ['nom', 'prenom', 'email', 'tel', 'universiteId', 'niveauAcademique', 'dateDebut', 'dateFin'];
    return controls.every(c => this.form.get(c)?.valid);
  }

  isBinomeValid(): boolean {
    const binomeControls = ['binomeNom', 'binomePrenom', 'binomeEmail', 'binomeTel'];
    return binomeControls.every(c => this.form.get(c)?.value);
  }

  isStep4Valid(): boolean {
    if (!this.cv1File()) return false;
    if (this.form.get('estBinome')?.value && !this.cv2File()) return false;
    return true;
  }

  getSujetTitre(id: string): string {
    const sujet = this.sujets().find(s => s.id === id);
    return sujet?.titre || '';
  }

  getSujetDescription(id: string): string {
    const sujet = this.sujets().find(s => s.id === id);
    return sujet?.mission || '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent, field: string) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.setFile(field, file);
      }
    }
  }

  onFileSelect(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.setFile(field, input.files[0]);
    }
  }

  private setFile(field: string, file: File) {
    switch (field) {
      case 'cv1':
        this.cv1File.set(file);
        break;
      case 'cv2':
        this.cv2File.set(file);
        break;
      case 'lettre':
        this.lettreFile.set(file);
        break;
    }
  }

  removeFile(field: string) {
    switch (field) {
      case 'cv1':
        this.cv1File.set(null);
        break;
      case 'cv2':
        this.cv2File.set(null);
        break;
      case 'lettre':
        this.lettreFile.set(null);
        break;
    }
  }

  onSubmit() {
    if (this.form.invalid || !this.cv1File() || !this.acceptTerms) return;
    if (this.form.value.estBinome && !this.cv2File()) return;

    this.submitting.set(true);

    const formValue = this.form.value;
    const request: CandidatureRequest = {
      typeStage: 'PFE',
      estBinome: formValue.estBinome,
      candidat1: {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        tel: formValue.tel,
        niveauAcademique: formValue.niveauAcademique as Niveau,
        universiteId: formValue.universiteId
      },
      sujetChoix1Id: formValue.sujetChoix1Id,
      sujetChoix2Id: formValue.sujetChoix2Id || undefined,
      dateDebut: new Date(formValue.dateDebut).toISOString(),
      dateFin: new Date(formValue.dateFin).toISOString()
    };

    if (formValue.estBinome) {
      request.candidat2 = {
        nom: formValue.binomeNom,
        prenom: formValue.binomePrenom,
        email: formValue.binomeEmail,
        tel: formValue.binomeTel,
        niveauAcademique: formValue.niveauAcademique as Niveau,
        universiteId: formValue.universiteId
      };
    }

    this.candidatureService.creer(
      request,
      this.cv1File()!,
      this.lettreFile() || undefined,
      this.cv2File() || undefined
    ).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showSuccess.set(true);
      },
      error: (err) => {
        console.error('Erreur soumission:', err);
        this.submitting.set(false);
        alert('Une erreur est survenue. Veuillez réessayer.');
      }
    });
  }
}

import { Component, OnInit, signal, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { Universite } from '../../../core/models/universite.model';
import { TypeStage, TYPE_STAGE_INFO, CandidatureRequest } from '../../../core/models/candidature.model';
import { Niveau } from '../../../core/models/candidat.model';

@Component({
  selector: 'app-postuler',
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
        <h1 class="hero-title reveal">
          Postuler à un <span class="text-red">Stage</span>
        </h1>
        <p class="hero-subtitle reveal">
          Remplissez le formulaire étape par étape pour soumettre votre candidature.
        </p>
      </div>
    </section>

    <!-- Main Form Section -->
    <section class="form-section">
      <div class="container">
        <!-- Back Link -->
        <a routerLink="/stages" class="back-link">
          <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour aux stages
        </a>

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

        <!-- Form -->
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <!-- Step 1: Type Selection -->
          @if (currentStep() === 1) {
            <div class="card reveal">
              <div class="card-header">
                <div class="header-icon">
                  <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 class="card-title">Choisissez votre type de stage</h2>
                <p class="card-subtitle">Sélectionnez le type de stage qui correspond à votre niveau d'études.</p>
              </div>

              <div class="type-grid">
                @for (type of stageTypes; track type.type) {
                  <button type="button" 
                          (click)="selectTypeStage(type.type)"
                          class="type-card"
                          [class.selected]="selectedType() === type.type">
                    <div class="type-icon" [attr.data-color]="type.couleur">
                      <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="getIconPath(type.icone)" />
                      </svg>
                    </div>
                    <div class="type-info">
                      <h3 class="type-title">{{ type.titre }}</h3>
                      <p class="type-meta">{{ type.niveau }} — {{ type.duree }}</p>
                    </div>
                    @if (selectedType() === type.type) {
                      <div class="type-check">
                        <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    }
                  </button>
                }
              </div>

              <div class="card-actions">
                <button type="button" 
                        (click)="nextStep()" 
                        [disabled]="!selectedType()"
                        class="btn-primary"
                        [class.disabled]="!selectedType()">
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
                <h2 class="card-title">Informations personnelles</h2>
                <p class="card-subtitle">Renseignez vos coordonnées et votre parcours académique.</p>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    Prénom <span class="required">*</span>
                  </label>
                  <input type="text" formControlName="prenom" class="form-input" placeholder="Ex: Ahmed">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Nom <span class="required">*</span>
                  </label>
                  <input type="text" formControlName="nom" class="form-input" placeholder="Ex: Ben Ali">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Email <span class="required">*</span>
                  </label>
                  <input type="email" formControlName="email" class="form-input" placeholder="Ex: ahmed@email.com">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Téléphone <span class="required">*</span>
                  </label>
                  <input type="tel" formControlName="tel" class="form-input" placeholder="Ex: +216 XX XXX XXX">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Université <span class="required">*</span>
                  </label>
                  <select formControlName="universiteId" class="form-input">
                    <option value="">Sélectionnez votre université</option>
                    @for (uni of universites(); track uni.id) {
                      <option [value]="uni.id">{{ uni.nom }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Niveau académique <span class="required">*</span>
                  </label>
                  <select formControlName="niveauAcademique" class="form-input">
                    <option value="">Sélectionnez votre niveau</option>
                    <option value="BAC_PLUS_2">Bac+2</option>
                    <option value="BAC_PLUS_3">Bac+3 (Licence)</option>
                    <option value="BAC_PLUS_4">Bac+4 (Master 1)</option>
                    <option value="BAC_PLUS_5">Bac+5 (Ingénieur/Master 2)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Date de début <span class="required">*</span>
                  </label>
                  <input type="date" formControlName="dateDebut" class="form-input">
                </div>

                <div class="form-group">
                  <label class="form-label">
                    Date de fin <span class="required">*</span>
                  </label>
                  <input type="date" formControlName="dateFin" class="form-input">
                </div>
              </div>

              <!-- Binome Section (for PFE) -->
              @if (selectedType() === 'PFE') {
                <div class="binome-section">
                  <div class="binome-toggle">
                    <input type="checkbox" id="estBinome" formControlName="estBinome" class="checkbox">
                    <label for="estBinome" class="binome-label">
                      <span class="binome-title">Candidature en binôme</span>
                      <span class="binome-desc">Cochez si vous postulez avec un partenaire</span>
                    </label>
                  </div>

                  @if (form.get('estBinome')?.value) {
                    <div class="binome-form">
                      <h4 class="binome-heading">Informations du binôme</h4>
                      <div class="form-grid">
                        <div class="form-group">
                          <label class="form-label">Prénom du binôme <span class="required">*</span></label>
                          <input type="text" formControlName="binomePrenom" class="form-input" placeholder="Prénom">
                        </div>
                        <div class="form-group">
                          <label class="form-label">Nom du binôme <span class="required">*</span></label>
                          <input type="text" formControlName="binomeNom" class="form-input" placeholder="Nom">
                        </div>
                        <div class="form-group">
                          <label class="form-label">Email du binôme <span class="required">*</span></label>
                          <input type="email" formControlName="binomeEmail" class="form-input" placeholder="email@exemple.com">
                        </div>
                        <div class="form-group">
                          <label class="form-label">Téléphone du binôme <span class="required">*</span></label>
                          <input type="tel" formControlName="binomeTel" class="form-input" placeholder="+216 XX XXX XXX">
                        </div>
                      </div>
                    </div>
                  }
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

          <!-- Step 3: Documents Upload -->
          @if (currentStep() === 3) {
            <div class="card reveal">
              <div class="card-header">
                <div class="header-icon">
                  <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 class="card-title">Vos documents</h2>
                <p class="card-subtitle">Téléchargez votre CV et autres documents requis.</p>
              </div>

              <!-- CV Upload Zone -->
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

              <!-- Binome CV Upload (for PFE with binome) -->
              @if (selectedType() === 'PFE' && form.get('estBinome')?.value) {
                <div class="upload-section">
                  <label class="form-label">
                    CV du binôme <span class="required">*</span>
                  </label>
                  <div class="upload-zone" 
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
                      <div class="upload-icon">
                        <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p class="upload-text">CV du binôme (PDF)</p>
                      <label class="upload-btn-secondary">
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
                        [disabled]="!isStep3Valid()"
                        class="btn-primary"
                        [class.disabled]="!isStep3Valid()">
                  Réviser et envoyer
                  <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          }

          <!-- Step 4: Review -->
          @if (currentStep() === 4) {
            <div class="card reveal">
              <div class="card-header">
                <div class="header-icon">
                  <svg class="icon-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 class="card-title">Récapitulatif</h2>
                <p class="card-subtitle">Vérifiez vos informations avant d'envoyer votre candidature.</p>
              </div>

              <!-- Review Sections -->
              <div class="review-sections">
                <!-- Type de Stage -->
                <div class="review-card">
                  <div class="review-header">
                    <h4 class="review-title">
                      <span class="review-number">1</span>
                      Type de stage
                    </h4>
                    <button type="button" (click)="goToStep(1)" class="review-edit">Modifier</button>
                  </div>
                  <p class="review-value">{{ getSelectedTypeInfo()?.titre }}</p>
                  <p class="review-meta">{{ getSelectedTypeInfo()?.niveau }} — {{ getSelectedTypeInfo()?.duree }}</p>
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
                      <span class="review-label">Nom complet:</span>
                      <p class="review-value">{{ form.get('prenom')?.value }} {{ form.get('nom')?.value }}</p>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Email:</span>
                      <p class="review-value">{{ form.get('email')?.value }}</p>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Téléphone:</span>
                      <p class="review-value">{{ form.get('tel')?.value }}</p>
                    </div>
                    <div class="review-item">
                      <span class="review-label">Niveau:</span>
                      <p class="review-value">{{ form.get('niveauAcademique')?.value }}</p>
                    </div>
                    <div class="review-item full-width">
                      <span class="review-label">Période:</span>
                      <p class="review-value">{{ formatDate(form.get('dateDebut')?.value) }} — {{ formatDate(form.get('dateFin')?.value) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Documents -->
                <div class="review-card">
                  <div class="review-header">
                    <h4 class="review-title">
                      <span class="review-number">3</span>
                      Documents
                    </h4>
                    <button type="button" (click)="goToStep(3)" class="review-edit">Modifier</button>
                  </div>
                  <div class="document-preview">
                    <div class="document-icon">
                      <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="document-info">
                      <p class="document-name">{{ cv1File()?.name }}</p>
                      <p class="document-size">{{ formatFileSize(cv1File()?.size || 0) }}</p>
                    </div>
                  </div>
                  @if (cv2File()) {
                    <div class="document-preview with-border">
                      <div class="document-icon">
                        <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div class="document-info">
                        <p class="document-name">{{ cv2File()?.name }} <span class="binome-tag">(Binôme)</span></p>
                        <p class="document-size">{{ formatFileSize(cv2File()?.size || 0) }}</p>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Terms Checkbox -->
              <div class="terms-section">
                <input type="checkbox" id="terms" [(ngModel)]="acceptTerms" [ngModelOptions]="{standalone: true}" class="checkbox">
                <label for="terms" class="terms-label">
                  J'atteste que les informations fournies sont exactes et j'accepte les 
                  <a href="#" class="terms-link">conditions générales</a> de la plateforme.
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
                    <svg class="spinner" fill="none" viewBox="0 0 24 24">
                      <circle class="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="spinner-fill" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoi en cours...
                  } @else {
                    <svg class="icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Envoyer ma candidature
                  }
                </button>
              </div>
            </div>
          }
        </form>
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
          <h3 class="modal-title">Candidature envoyée !</h3>
          <p class="modal-text">
            Votre candidature a été soumise avec succès. Vous recevrez un email de confirmation à l'adresse <strong>{{ form.get('email')?.value }}</strong>.
          </p>
          <div class="modal-actions">
            <a routerLink="/" class="btn-primary full-width">
              Retour à l'accueil
            </a>
            <a routerLink="/stages" class="btn-secondary full-width">
              Voir d'autres stages
            </a>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== Variables ===== */
    :host {
      --primary: #ED1C24;
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
      --blue: #3b82f6;
      --blue-light: #dbeafe;
      --amber: #f59e0b;
      --amber-light: #fef3c7;
      --green: #10b981;
      --green-light: #d1fae5;
      --radius: 16px;
      --radius-sm: 12px;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    /* ===== Hero Section ===== */
    .hero-section {
      min-height: 40vh;
      background: linear-gradient(135deg, #ED1C24 0%, #ED1C24 100%);
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
      opacity: 0.1;
    }

    .circle-2 {
      width: 300px;
      height: 300px;
      top: 80px;
      right: 40px;
      opacity: 0.05;
      animation-delay: -3s;
    }

    .circle-3 {
      width: 200px;
      height: 200px;
      bottom: 40px;
      left: 25%;
      opacity: 0.05;
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
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1rem;
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
      box-shadow: 0 0 0 4px rgba(237, 28, 36, 0.2);
    }

    .step-dot.completed {
      background: var(--success);
      color: var(--white);
      border-color: var(--success);
    }

    .step-line {
      width: 80px;
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
      padding: 0 20px;
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

    /* ===== Type Selection Grid ===== */
    .type-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }

    @media (max-width: 640px) {
      .type-grid { grid-template-columns: 1fr; }
    }

    .type-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      background: var(--white);
      border: 2px solid var(--border);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.3s;
      text-align: left;
      position: relative;
    }

    .type-card:hover {
      border-color: rgba(237, 28, 36, 0.3);
      background: #fef7f7;
    }

    .type-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }

    .type-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .type-icon[data-color="blue"] {
      background: var(--blue-light);
      color: var(--blue);
    }

    .type-icon[data-color="amber"] {
      background: var(--amber-light);
      color: var(--amber);
    }

    .type-icon[data-color="green"] {
      background: var(--green-light);
      color: var(--green);
    }

    .type-icon[data-color="red"] {
      background: var(--primary-light);
      color: var(--primary);
    }

    .type-info {
      flex: 1;
    }

    .type-title {
      font-weight: 600;
      color: var(--ink);
      font-size: 0.9375rem;
      margin-bottom: 4px;
    }

    .type-meta {
      font-size: 0.8125rem;
      color: var(--muted);
    }

    .type-check {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      background: var(--primary);
      color: var(--white);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.3s ease-out;
    }

    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
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
      box-shadow: 0 8px 20px rgba(237, 28, 36, 0.3);
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
      box-shadow: 0 0 0 3px rgba(237, 28, 36, 0.1);
    }

    .form-input::placeholder {
      color: var(--light);
    }

    /* ===== Binome Section ===== */
    .binome-section {
      margin-top: 32px;
      padding-top: 32px;
      border-top: 1px solid var(--border);
    }

    .binome-toggle {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 20px;
      background: var(--bg);
      border-radius: var(--radius-sm);
    }

    .checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .binome-label {
      cursor: pointer;
    }

    .binome-title {
      display: block;
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 4px;
    }

    .binome-desc {
      display: block;
      font-size: 0.875rem;
      color: var(--muted);
    }

    .binome-form {
      margin-top: 24px;
      padding: 24px;
      background: var(--bg);
      border-radius: var(--radius-sm);
    }

    .binome-heading {
      font-weight: 600;
      color: var(--ink);
      margin-bottom: 20px;
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
      margin-top: 12px;
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
      gap: 24px;
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
      margin-bottom: 16px;
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
      text-decoration: none;
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
      gap: 16px;
    }

    @media (max-width: 640px) {
      .review-grid { grid-template-columns: 1fr; }
    }

    .review-item {
      font-size: 0.875rem;
    }

    .review-item.full-width {
      grid-column: span 2;
    }

    @media (max-width: 640px) {
      .review-item.full-width { grid-column: span 1; }
    }

    .review-label {
      color: var(--muted);
    }

    /* ===== Document Preview ===== */
    .document-preview {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .document-preview.with-border {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .document-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      background: var(--success-light);
      color: var(--success);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .document-info {
      flex: 1;
    }

    .document-name {
      font-weight: 500;
      color: var(--ink);
    }

    .document-size {
      font-size: 0.75rem;
      color: var(--muted);
    }

    .binome-tag {
      color: var(--muted);
      font-weight: 400;
    }

    /* ===== Terms Section ===== */
    .terms-section {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-top: 32px;
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
      animation: scaleIn 0.5s ease-out;
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
export class PostulerComponent implements OnInit {
  stageTypes = TYPE_STAGE_INFO.filter(t => t.type !== 'PFE');
  universites = signal<Universite[]>([]);
  selectedType = signal<TypeStage | null>(null);

  // Mapping des noms d'icônes vers les chemins SVG
  iconPaths: { [key: string]: string } = {
    'academic-cap': 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222',
    'building-office': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    'sun': 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    'document': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };

  getIconPath(iconName: string): string {
    return this.iconPaths[iconName] || this.iconPaths['academic-cap'];
  }
  cv1File = signal<File | null>(null);
  cv2File = signal<File | null>(null);
  submitting = signal(false);
  showSuccess = signal(false);
  currentStep = signal(1);
  isDragging = signal(false);
  acceptTerms = false;

  steps = [
    { number: 1, label: 'Type de stage' },
    { number: 2, label: 'Informations' },
    { number: 3, label: 'Documents' },
    { number: 4, label: 'Confirmation' }
  ];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private universiteService: UniversiteService,
    private candidatureService: CandidatureService
  ) {
    this.form = this.fb.group({
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
      binomeTel: [''],
      binomeUniversiteId: [''],
      binomeNiveauAcademique: ['']
    });
  }

  ngOnInit() {
    this.loadUniversites();
    this.initScrollReveal();

    this.route.queryParams.subscribe(params => {
      if (params['type']) {
        this.selectTypeStage(params['type'] as TypeStage);
        this.currentStep.set(2);
      }
    });
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

  loadUniversites() {
    this.universiteService.listerTous().subscribe({
      next: (unis) => this.universites.set(unis),
      error: (err) => console.error('Erreur chargement universités:', err)
    });
  }

  selectTypeStage(type: TypeStage) {
    this.selectedType.set(type);
  }

  getSelectedTypeInfo() {
    return TYPE_STAGE_INFO.find(t => t.type === this.selectedType());
  }

  nextStep() {
    if (this.currentStep() < 4) {
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

  isStep3Valid(): boolean {
    if (!this.cv1File()) return false;
    if (this.selectedType() === 'PFE' && this.form.get('estBinome')?.value && !this.cv2File()) {
      return false;
    }
    return true;
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
        if (field === 'cv1') {
          this.cv1File.set(file);
        } else {
          this.cv2File.set(file);
        }
      }
    }
  }

  onFileSelect(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (field === 'cv1') {
        this.cv1File.set(file);
      } else {
        this.cv2File.set(file);
      }
    }
  }

  removeFile(field: string) {
    if (field === 'cv1') {
      this.cv1File.set(null);
    } else {
      this.cv2File.set(null);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  onSubmit() {
    if (this.form.invalid || !this.cv1File() || !this.selectedType() || !this.acceptTerms) return;

    this.submitting.set(true);

    const formValue = this.form.value;
    const request: CandidatureRequest = {
      typeStage: this.selectedType()!,
      estBinome: formValue.estBinome,
      candidat1: {
        nom: formValue.nom,
        prenom: formValue.prenom,
        email: formValue.email,
        tel: formValue.tel,
        niveauAcademique: formValue.niveauAcademique as Niveau,
        universiteId: formValue.universiteId
      },
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
      undefined,
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

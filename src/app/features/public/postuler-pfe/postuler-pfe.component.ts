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
  templateUrl: './postuler-pfe.component.html',
  styleUrls: ['./postuler-pfe.component.css']
})
export class PostulerPfeComponent implements OnInit {
  universites = signal<Universite[]>([]);
  sujets = signal<SujetPfe[]>([]);
  selectedSujet = signal<SujetPfe | null>(null);
  loading = signal(true);
  submitting = signal(false);
  showSuccess = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal<string>('');
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
      let next = this.currentStep() + 1;
      // Skip binome step (3) if niveau is not L3
      if (next === 3 && this.form.get('niveauAcademique')?.value !== 'L3') {
        this.form.patchValue({ estBinome: false });
        next = 4;
      }
      this.currentStep.set(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep() > 1) {
      let prev = this.currentStep() - 1;
      // Skip binome step (3) if niveau is not L3
      if (prev === 3 && this.form.get('niveauAcademique')?.value !== 'L3') {
        prev = 2;
      }
      this.currentStep.set(prev);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isStep2Valid(): boolean {
    const controls = ['nom', 'prenom', 'email', 'tel', 'universiteId', 'niveauAcademique'];
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
        this.errorMessage.set(this.cleanErrorMessage(err?.error?.message));
        this.showErrorModal.set(true);
      }
    });
  }

  // ═══ Error Modal ═══
  private cleanErrorMessage(message: string): string {
    if (!message) return 'Une erreur est survenue. Veuillez réessayer.';
    // Enlever le préfixe du contrôleur pour afficher seulement le vrai message
    const prefix = 'Erreur lors de la création de la candidature: ';
    return message.startsWith(prefix) ? message.substring(prefix.length) : message;
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }
}

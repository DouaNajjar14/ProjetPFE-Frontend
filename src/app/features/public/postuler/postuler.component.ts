import { Component, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { UniversiteService } from '../../../core/services/universite.service';
import { CandidatureService } from '../../../core/services/candidature.service';
import { PublicService } from '../../../core/services/public.service';
import { Universite } from '../../../core/models/universite.model';
import { TypeStage, TYPE_STAGE_INFO, CandidatureRequest } from '../../../core/models/candidature.model';
import { Niveau } from '../../../core/models/candidat.model';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';

@Component({
  selector: 'app-postuler',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './postuler.component.html',
  styleUrls: ['./postuler.component.css']
})
export class PostulerComponent implements OnInit {
  allUniversites = signal<Universite[]>([]);
  sujets = signal<SujetPfe[]>([]);
  selectedType = signal<TypeStage | null>(null);
  typePrefilled = signal(false);
  pfeSujetPrefilled = signal(false);
  cv1File = signal<File | null>(null);
  cv2File = signal<File | null>(null);
  lettreFile = signal<File | null>(null);
  submitting = signal(false);
  showSuccess = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal<string>('');
  currentStep = signal(1);
  acceptTerms = false;

  stageTypes = TYPE_STAGE_INFO;

  steps = [
    { num: 1, label: 'Informations' },
    { num: 2, label: 'Stage' },
    { num: 3, label: 'Documents' },
    { num: 4, label: 'Confirmation' }
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
      nom: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      tel: ['', [Validators.required, Validators.pattern(/^[0-9]{8}$/)]],
      universiteId: ['', Validators.required],
      typeStage: ['', Validators.required],
      niveauAcademique: ['', Validators.required],
      sujetChoix1Id: [''],
      sujetChoix2Id: [''],
      estBinome: [false],
      binomeNom: ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      binomePrenom: ['', [Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]],
      binomeEmail: ['', [Validators.email]],
      binomeTel: ['', [Validators.pattern(/^[0-9]{8}$/)]]
    });
  }

  // Filter universities: ISET/ISETCOM only for INITIATION & PERFECTIONNEMENT
  filteredUniversites = computed(() => {
    const type = this.selectedType();
    const all = this.allUniversites();
    if (type === 'INITIATION' || type === 'PERFECTIONNEMENT') {
      return all.filter(u => {
        const n = u.nom.toLowerCase();
        return n.includes('iset') || n.includes('isetcom');
      });
    }
    return all;
  });

  // Niveau options based on type
  niveauOptions = computed(() => {
    const type = this.selectedType();
    switch (type) {
      case 'INITIATION':
        return [{ value: 'L1', label: 'L1 — 1ère année Licence' }];
      case 'PERFECTIONNEMENT':
        return [{ value: 'L2', label: 'L2 — 2ème année Licence' }];
      case 'ETE':
        return [
          { value: 'L1', label: 'L1 — 1ère année Licence' },
          { value: 'L2', label: 'L2 — 2ème année Licence' },
          { value: 'M1', label: 'M1 — Master 1' },
          { value: 'CY1', label: 'CY1 — Cycle Ingénieur 1' },
          { value: 'CY2', label: 'CY2 — Cycle Ingénieur 2' }
        ];
      case 'PFE':
        return [
          { value: 'L3', label: 'L3 — Licence' },
          { value: 'M2', label: 'M2 — Master 2' },
          { value: 'CY3', label: 'CY3 — Cycle Ingénieur 3' }
        ];
      default:
        return [];
    }
  });

  ngOnInit() {
    this.universiteService.listerTous().subscribe({
      next: (unis) => this.allUniversites.set(unis)
    });

    this.publicService.listerSujetsPfe().subscribe({
      next: (sujets) => this.sujets.set(sujets)
    });

    this.form.get('estBinome')?.valueChanges.subscribe(isBinome => {
      this.applyBinomeValidators(!!isBinome);
      if (!isBinome) {
        this.cv2File.set(null);
      }
    });

    // Pre-select type and/or subject from queryParams
    this.route.queryParams.subscribe(params => {
      this.typePrefilled.set(false);
      this.pfeSujetPrefilled.set(false);

      if (params['type']) {
        const type = params['type'] as TypeStage;
        if (this.stageTypes.some(t => t.type === type)) {
          this.typePrefilled.set(true);
          this.selectedType.set(type);
          this.form.patchValue({ typeStage: type });
          this.setDefaultNiveau(type);
        }
      }
      if (params['sujet']) {
        // Coming from PFE Book with a pre-selected subject
        this.typePrefilled.set(true);
        this.pfeSujetPrefilled.set(true);
        this.selectedType.set('PFE');
        this.form.patchValue({ typeStage: 'PFE', sujetChoix1Id: params['sujet'] });
      }
    });
  }

  onTypeChange() {
    const type = this.form.get('typeStage')?.value as TypeStage;

    // PFE applications must go through PFE Book topic selection.
    if (type === 'PFE' && !this.pfeSujetPrefilled()) {
      this.router.navigate(['/pfe-book']);
      return;
    }

    this.selectedType.set(type || null);
    this.setDefaultNiveau(type);
    // Reset université when type changes (filtered list depends on type)
    this.form.patchValue({ universiteId: '' });
    // Reset PFE-specific fields when changing type
    if (type !== 'PFE') {
      this.form.patchValue({ sujetChoix1Id: '', sujetChoix2Id: '', estBinome: false });
    }
  }

  onNiveauChange() {
    const niveau = this.form.get('niveauAcademique')?.value;
    // Reset binome when switching away from L3
    if (niveau !== 'L3') {
      this.form.patchValue({ estBinome: false });
      this.cv2File.set(null);
    }
  }

  private setDefaultNiveau(type: TypeStage) {
    if (type === 'INITIATION') {
      this.form.patchValue({ niveauAcademique: 'L1' });
    } else if (type === 'PERFECTIONNEMENT') {
      this.form.patchValue({ niveauAcademique: 'L2' });
    } else {
      this.form.patchValue({ niveauAcademique: '' });
    }
  }

  getTypeLabel(): string {
    const info = TYPE_STAGE_INFO.find(t => t.type === this.selectedType());
    return info?.titre || '—';
  }

  getNiveauLabel(): string {
    const v = this.form.get('niveauAcademique')?.value;
    const opt = this.niveauOptions().find(o => o.value === v);
    return opt?.label || v || '—';
  }

  getUniversiteNom(): string {
    const id = this.form.get('universiteId')?.value;
    const u = this.allUniversites().find(u => u.id === id);
    return u?.nom || '—';
  }

  getSujetTitre(id: string): string {
    const s = this.sujets().find(s => s.id === id);
    return s?.titre || '—';
  }

  isPrefilledPfeFlow(): boolean {
    return this.pfeSujetPrefilled() && this.selectedType() === 'PFE';
  }

  isTypeLocked(): boolean {
    return this.typePrefilled();
  }

  isNiveauLocked(): boolean {
    const type = this.selectedType();
    return type === 'INITIATION' || type === 'PERFECTIONNEMENT';
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

  isStep1Valid(): boolean {
    return ['nom', 'prenom', 'email', 'tel'].every(c => this.form.get(c)?.valid);
  }

  isStep2Valid(): boolean {
    if (!this.form.get('typeStage')?.value || !this.form.get('niveauAcademique')?.value) return false;
    if (!this.form.get('universiteId')?.value) return false;
    // PFE requires at least sujet 1
    if (this.selectedType() === 'PFE' && !this.form.get('sujetChoix1Id')?.value) return false;
    // If binome is checked, all binome fields required
    if (this.form.get('estBinome')?.value) {
      const binomeFields = ['binomeNom', 'binomePrenom', 'binomeEmail', 'binomeTel'];
      if (!binomeFields.every(f => this.form.get(f)?.valid)) return false;
    }
    return true;
  }

  private applyBinomeValidators(isBinome: boolean) {
    const nomCtrl = this.form.get('binomeNom');
    const prenomCtrl = this.form.get('binomePrenom');
    const emailCtrl = this.form.get('binomeEmail');
    const telCtrl = this.form.get('binomeTel');

    if (isBinome) {
      nomCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]);
      prenomCtrl?.setValidators([Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]);
      emailCtrl?.setValidators([Validators.required, Validators.email]);
      telCtrl?.setValidators([Validators.required, Validators.pattern(/^[0-9]{8}$/)]);
    } else {
      this.form.patchValue({
        binomeNom: '',
        binomePrenom: '',
        binomeEmail: '',
        binomeTel: ''
      }, { emitEvent: false });

      nomCtrl?.setValidators([Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]);
      prenomCtrl?.setValidators([Validators.minLength(2), Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/)]);
      emailCtrl?.setValidators([Validators.email]);
      telCtrl?.setValidators([Validators.pattern(/^[0-9]{8}$/)]);
    }

    nomCtrl?.updateValueAndValidity({ emitEvent: false });
    prenomCtrl?.updateValueAndValidity({ emitEvent: false });
    emailCtrl?.updateValueAndValidity({ emitEvent: false });
    telCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  isStep3Valid(): boolean {
    if (!this.cv1File()) return false;
    if (!this.lettreFile()) return false;
    if (this.form.get('estBinome')?.value && !this.cv2File()) return false;
    return true;
  }

  // ═══ File handling ═══
  onDragOver(e: DragEvent) { e.preventDefault(); }
  onDragLeave(e: DragEvent) { e.preventDefault(); }

  onDrop(e: DragEvent, field: string) {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) this.setFile(files[0], field);
  }

  onFileSelect(e: Event, field: string) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.setFile(input.files[0], field);
  }

  private setFile(file: File, field: string) {
    if (field === 'cv1') this.cv1File.set(file);
    else if (field === 'cv2') this.cv2File.set(file);
    else if (field === 'lettre') this.lettreFile.set(file);
  }

  removeFile(field: string) {
    if (field === 'cv1') this.cv1File.set(null);
    else if (field === 'cv2') this.cv2File.set(null);
    else if (field === 'lettre') this.lettreFile.set(null);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const s = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
  }

  // ═══ Submit ═══
  onSubmit() {
    if (!this.cv1File() || !this.selectedType() || !this.acceptTerms) return;
    this.submitting.set(true);

    const v = this.form.value;
    const request: CandidatureRequest = {
      typeStage: v.typeStage,
      estBinome: v.estBinome || false,
      candidat1: {
        nom: v.nom,
        prenom: v.prenom,
        email: v.email,
        tel: v.tel,
        niveauAcademique: v.niveauAcademique as Niveau,
        universiteId: v.universiteId
      }
    };

    // PFE subjects
    if (this.selectedType() === 'PFE') {
      request.sujetChoix1Id = v.sujetChoix1Id;
      if (v.sujetChoix2Id) request.sujetChoix2Id = v.sujetChoix2Id;
    }

    // Binome
    if (v.estBinome) {
      request.candidat2 = {
        nom: v.binomeNom,
        prenom: v.binomePrenom,
        email: v.binomeEmail,
        tel: v.binomeTel,
        niveauAcademique: v.niveauAcademique as Niveau,
        universiteId: v.universiteId
      };
    }

    this.candidatureService.creer(
      request,
      this.cv1File()!,
      this.lettreFile() || undefined,
      this.cv2File() || undefined
    ).subscribe({
      next: () => { this.submitting.set(false); this.showSuccess.set(true); },
      error: (err) => {
        console.error('Erreur:', err?.error || err);
        this.submitting.set(false);
        this.errorMessage.set(this.cleanErrorMessage(err?.error?.message));
        this.showErrorModal.set(true);
      }
    });
  }

  // ═══ Error Modal ═══
  private cleanErrorMessage(message: string): string {
    if (!message) return 'Erreur lors de la soumission.';
    // Enlever le préfixe du contrôleur pour afficher seulement le vrai message
    const prefix = 'Erreur lors de la création de la candidature: ';
    return message.startsWith(prefix) ? message.substring(prefix.length) : message;
  }

  closeErrorModal() {
    this.showErrorModal.set(false);
    this.errorMessage.set('');
  }
}

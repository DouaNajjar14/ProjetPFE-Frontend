import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SujetPfeService } from '../../../core/services/sujet-pfe.service';
import { DepartementService } from '../../../core/services/departement.service';
import { SpecialiteUniversitaireService } from '../../../core/services/specialite-universitaire.service';
import { CompetenceService } from '../../../core/services/competence.service';
import { SujetPfe, SujetPfeRequest, Niveau, Statut, Page } from '../../../core/models/sujet-pfe.model';
import { Departement } from '../../../core/models/departement.model';
import { SpecialiteUniversitaire } from '../../../core/models/specialite-universitaire.model';
import { Competence } from '../../../core/models/competence.model';

@Component({
  selector: 'app-agent-rh-sujet-pfe',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './agent-rh-sujet-pfe.component.html',
  styleUrls: ['./agent-rh-sujet-pfe.component.css']
})
export class AgentRhSujetPfeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  sujets = signal<SujetPfe[]>([]);
  departements = signal<Departement[]>([]);
  specialitesUniversitaires = signal<SpecialiteUniversitaire[]>([]);
  competences = signal<Competence[]>([]);
  isLoading = signal(false);
  activeFilter: 'actifs' | 'archives' | 'tous' = 'actifs';

  // Pagination
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  // Search/filter
  searchTitre = '';
  searchStatut: Statut | '' = '';
  searchDepartementId = '';
  searchSpecialiteId = '';

  // Modal
  showModal = signal(false);
  showConfirm = signal(false);
  showDetail = signal(false);
  modalMode: 'create' | 'edit' = 'create';
  editingSujet: SujetPfe | null = null;
  detailSujet: SujetPfe | null = null;
  confirmSujet: SujetPfe | null = null;
  confirmAction: 'archiver' | 'desarchiver' | 'fermer' = 'archiver';
  modalError = signal<string | null>(null);
  isSaving = signal(false);

  // Reactive Form
  sujetForm!: FormGroup;

  // Enums for template
  niveaux = Object.values(Niveau);
  statuts = Object.values(Statut);

  // Selected specialties IDs
  selectedSpecialiteIds: number[] = [];
  selectedCompetenceIds: number[] = [];

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  constructor(
    private fb: FormBuilder,
    private sujetService: SujetPfeService,
    private departementService: DepartementService,
    private specialiteUniversitaireService: SpecialiteUniversitaireService,
    private competenceService: CompetenceService,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadSujets();
    this.loadDepartements();
    this.loadSpecialitesUniversitaires();
    this.loadCompetences();

    // Read route parameter
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadAndShowSujet(params['id']);
      }
    });
  }

  private loadAndShowSujet(sujetId: string): void {
    this.sujetService.trouverParId(sujetId).subscribe(
      (sujet: SujetPfe) => {
        this.detailSujet = sujet;
        this.showDetail.set(true);
      },
      (error) => {
        console.error('Erreur lors du chargement du sujet:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadSujets();
    });
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchTitre);
  }

  initForm(): void {
    this.sujetForm = this.fb.group({
      titre: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200)
      ]],
      mission: ['', [
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(2000)
      ]],
      nombreStagiaires: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(10)
      ]],
      niveauAcademique: [Niveau.L3, [Validators.required]],
      dureeEnMois: [1, [
        Validators.required,
        Validators.min(1),
        Validators.max(24)
      ]],
      departementId: ['', [Validators.required]]
    });
  }

  // Specialite multi-select methods
  toggleSpecialite(specId: number): void {
    const index = this.selectedSpecialiteIds.indexOf(specId);
    if (index === -1) {
      this.selectedSpecialiteIds.push(specId);
    } else {
      this.selectedSpecialiteIds.splice(index, 1);
    }
  }

  isSpecialiteSelected(specId: number): boolean {
    return this.selectedSpecialiteIds.includes(specId);
  }

  getSelectedSpecialitesText(): string {
    return this.specialitesUniversitaires()
      .filter(s => this.selectedSpecialiteIds.includes(s.id))
      .map(s => s.nom)
      .join(', ');
  }

  // Competence multi-select methods
  toggleCompetence(compId: number): void {
    const index = this.selectedCompetenceIds.indexOf(compId);
    if (index === -1) {
      this.selectedCompetenceIds.push(compId);
    } else {
      this.selectedCompetenceIds.splice(index, 1);
    }
  }

  isCompetenceSelected(compId: number): boolean {
    return this.selectedCompetenceIds.includes(compId);
  }

  getSelectedCompetencesText(): string {
    return this.competences()
      .filter(c => this.selectedCompetenceIds.includes(c.id))
      .map(c => c.nom)
      .join(', ');
  }

  // Field error helpers
  getFieldError(field: string): string | null {
    const control = this.sujetForm.get(field);
    if (!control || !control.errors || (!control.touched && !control.dirty)) return null;

    const errors = control.errors;
    const labels: Record<string, string> = {
      titre: 'Le titre',
      mission: 'La mission',
      nombreStagiaires: 'Le nombre de stagiaires',
      niveauAcademique: 'Le niveau académique',
      dureeEnMois: 'La durée',
      departementId: 'Le département'
    };
    const label = labels[field] || field;

    if (errors['required']) return `${label} est obligatoire`;
    if (errors['minlength']) return `${label} doit contenir au moins ${errors['minlength'].requiredLength} caractères`;
    if (errors['maxlength']) return `${label} ne doit pas dépasser ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `${label} doit être au minimum ${errors['min'].min}`;
    if (errors['max']) return `${label} ne doit pas dépasser ${errors['max'].max}`;

    return null;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.sujetForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  loadDepartements(): void {
    this.departementService.listerActifs().subscribe({
      next: (data) => this.departements.set(data),
      error: () => { }
    });
  }

  loadSpecialitesUniversitaires(): void {
    this.specialiteUniversitaireService.lister().subscribe({
      next: (data) => {
        console.log('Spécialités chargées:', data);
        this.specialitesUniversitaires.set(data);
      },
      error: (err) => {
        console.error('Erreur chargement spécialités:', err);
        this.showToast('Erreur lors du chargement des spécialités', 'error');
      }
    });
  }

  loadCompetences(): void {
    this.competenceService.lister().subscribe({
      next: (data) => {
        console.log('Compétences chargées:', data);
        this.competences.set(data);
      },
      error: (err) => {
        console.error('Erreur chargement compétences:', err);
        this.showToast('Erreur lors du chargement des compétences', 'error');
      }
    });
  }

  loadSujets(): void {
    this.isLoading.set(true);

    if (this.searchTitre || this.searchStatut || this.searchDepartementId || this.searchSpecialiteId) {
      this.sujetService.rechercher(
        this.searchStatut as Statut || undefined,
        this.searchDepartementId || undefined,
        this.searchTitre || undefined,
        this.currentPage,
        this.pageSize,
        this.searchSpecialiteId || undefined
      ).subscribe({
        next: (page) => this.handlePageResponse(page),
        error: () => {
          this.showToast('Erreur lors du chargement', 'error');
          this.isLoading.set(false);
        }
      });
      return;
    }

    const obs =
      this.activeFilter === 'actifs' ? this.sujetService.listerActifs(this.currentPage, this.pageSize) :
        this.activeFilter === 'archives' ? this.sujetService.listerArchives(this.currentPage, this.pageSize) :
          this.sujetService.listerTous(this.currentPage, this.pageSize);

    obs.subscribe({
      next: (page) => this.handlePageResponse(page),
      error: () => {
        this.showToast('Erreur lors du chargement des sujets PFE', 'error');
        this.isLoading.set(false);
      }
    });
  }

  handlePageResponse(page: Page<SujetPfe>): void {
    this.sujets.set(page.content);
    this.totalPages = page.totalPages;
    this.totalElements = page.totalElements;
    this.isLoading.set(false);
  }

  setFilter(filter: 'actifs' | 'archives' | 'tous'): void {
    this.activeFilter = filter;
    this.currentPage = 0;
    this.clearSearch();
    this.loadSujets();
  }

  clearSearch(): void {
    this.searchTitre = '';
    this.searchStatut = '';
    this.searchDepartementId = '';
    this.searchSpecialiteId = '';
  }

  clearFilters(): void {
    this.clearSearch();
    this.onSearch();
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadSujets();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadSujets();
  }

  // Modal
  openCreateModal(): void {
    this.modalMode = 'create';
    this.sujetForm.reset({
      titre: '',
      mission: '',
      nombreStagiaires: 1,
      niveauAcademique: Niveau.L3,
      dureeEnMois: 1,
      departementId: ''
    });
    this.selectedSpecialiteIds = [];
    this.selectedCompetenceIds = [];
    this.editingSujet = null;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  openEditModal(sujet: SujetPfe): void {
    this.modalMode = 'edit';
    this.sujetForm.patchValue({
      titre: sujet.titre || '',
      mission: sujet.mission || '',
      nombreStagiaires: sujet.nombreStagiaires || 1,
      niveauAcademique: sujet.niveauAcademique || Niveau.L3,
      dureeEnMois: sujet.dureeEnMois || 1,
      departementId: sujet.departementId || ''
    });
    // Extract specialite IDs from the response
    if (sujet.specialitesUniversitaires && sujet.specialitesUniversitaires.length > 0) {
      this.selectedSpecialiteIds = sujet.specialitesUniversitaires.map(s => s.id);
    } else {
      this.selectedSpecialiteIds = [];
    }
    // Extract competence IDs from the response
    if (sujet.competences && sujet.competences.length > 0) {
      this.selectedCompetenceIds = sujet.competences.map(c => c.id);
    } else {
      this.selectedCompetenceIds = [];
    }
    this.sujetForm.markAllAsTouched();
    this.editingSujet = sujet;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.sujetForm.reset();
    this.selectedSpecialiteIds = [];
    this.selectedCompetenceIds = [];
    this.editingSujet = null;
    this.modalError.set(null);
  }

  saveModal(): void {
    if (this.sujetForm.invalid) {
      this.sujetForm.markAllAsTouched();
      this.modalError.set('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (this.selectedSpecialiteIds.length === 0) {
      this.modalError.set('Veuillez sélectionner au moins une spécialité');
      return;
    }

    if (this.selectedCompetenceIds.length === 0) {
      this.modalError.set('Veuillez sélectionner au moins une compétence');
      return;
    }

    this.isSaving.set(true);
    this.modalError.set(null);

    const formValue = this.sujetForm.value;
    const request: SujetPfeRequest = {
      titre: formValue.titre.trim(),
      mission: formValue.mission.trim(),
      specialiteUniversitaireIds: this.selectedSpecialiteIds,
      competenceIds: this.selectedCompetenceIds,
      nombreStagiaires: formValue.nombreStagiaires,
      niveauAcademique: formValue.niveauAcademique,
      dureeEnMois: formValue.dureeEnMois,
      departementId: formValue.departementId
    };

    const obs = this.modalMode === 'create'
      ? this.sujetService.creer(request)
      : this.sujetService.modifier(this.editingSujet!.id, request);

    const label = this.modalMode === 'create' ? 'créé' : 'modifié';

    obs.subscribe({
      next: () => {
        this.showToast(`Sujet PFE ${label} avec succès`, 'success');
        this.closeModal();
        this.loadSujets();
        this.isSaving.set(false);
      },
      error: (err) => {
        this.modalError.set(err.error?.message || `Erreur lors de l'opération`);
        this.isSaving.set(false);
      }
    });
  }

  // Detail
  openDetail(sujet: SujetPfe): void {
    this.detailSujet = sujet;
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.detailSujet = null;
  }

  editFromDetail(): void {
    if (this.detailSujet) {
      const sujet = this.detailSujet;
      this.closeDetail();
      this.openEditModal(sujet);
    }
  }

  // Confirm actions
  openConfirm(sujet: SujetPfe, action: 'archiver' | 'desarchiver' | 'fermer'): void {
    this.confirmSujet = sujet;
    this.confirmAction = action;
    this.showConfirm.set(true);
  }

  closeConfirm(): void {
    this.showConfirm.set(false);
    this.confirmSujet = null;
  }

  executeConfirm(): void {
    if (!this.confirmSujet) return;

    const obs =
      this.confirmAction === 'archiver' ? this.sujetService.archiver(this.confirmSujet.id) :
        this.confirmAction === 'desarchiver' ? this.sujetService.desarchiver(this.confirmSujet.id) :
          this.sujetService.fermer(this.confirmSujet.id);

    const labels: Record<string, string> = {
      archiver: 'archivé',
      desarchiver: 'désarchivé',
      fermer: 'fermé'
    };

    obs.subscribe({
      next: () => {
        this.showToast(`Sujet PFE ${labels[this.confirmAction]} avec succès`, 'success');
        this.closeConfirm();
        this.loadSujets();
      },
      error: () => {
        this.showToast('Erreur lors de l\'opération', 'error');
        this.closeConfirm();
      }
    });
  }

  // Helpers
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getOpenCount(): number {
    return this.sujets().filter(s => s.statut === Statut.OUVERT && !s.archive).length;
  }

  getArchivedCount(): number {
    return this.sujets().filter(s => s.archive).length;
  }

  getNiveauLabel(niveau: Niveau): string {
    const labels: Record<string, string> = {
      L3: 'Licence',
      M2: 'Master',
      CY3: 'Cycle Ingénieur'
    };
    return labels[niveau] || niveau;
  }

  getStatutLabel(statut: Statut): string {
    const labels: Record<string, string> = {
      OUVERT: 'Disponible',
      POURVU: 'Pourvu',
      FERME: 'Indisponible'
    };
    return labels[statut] || statut;
  }

  getConfirmTitle(): string {
    const titles: Record<string, string> = {
      archiver: 'Archiver ce sujet ?',
      desarchiver: 'Désarchiver ce sujet ?',
      fermer: 'Rendre indisponible ce sujet ?'
    };
    return titles[this.confirmAction];
  }

  getConfirmText(): string {
    const texts: Record<string, string> = {
      archiver: `Le sujet "${this.confirmSujet?.titre}" sera archivé et ne sera plus visible dans la liste active.`,
      desarchiver: `Le sujet "${this.confirmSujet?.titre}" sera désarchivé et redeviendra visible.`,
      fermer: `Le sujet "${this.confirmSujet?.titre}" sera rendu indisponible et ne pourra plus recevoir de candidatures.`
    };
    return texts[this.confirmAction];
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getRemainingChars(field: string, max: number): number {
    const value = this.sujetForm.get(field)?.value || '';
    return max - value.length;
  }
}

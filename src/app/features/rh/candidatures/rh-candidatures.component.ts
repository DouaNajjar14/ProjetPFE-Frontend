import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AgentRHService, CandidatureStats } from '../../../core/services/agent-rh.service';
import { Candidature, StatutCandidature, TypeStage } from '../../../core/models/candidature.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-rh-candidatures',
  standalone: true,
  imports: [CommonModule, FormsModule,CommonModule,
  FormsModule,
  TableModule,
  ButtonModule,
  TagModule,
  AvatarModule,
  InputTextModule,
  DropdownModule,
  DialogModule,
  CalendarModule,
  ToastModule,
  TooltipModule],
  providers: [MessageService],
  templateUrl: './rh-candidatures.component.html',
  styleUrls: ['./rh-candidatures.component.css']
})
export class RhCandidaturesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  candidatures = signal<Candidature[]>([]);
  filteredCandidatures = signal<Candidature[]>([]);
  stats = signal<CandidatureStats | null>(null);
  isLoading = signal(false);

  // Filters
  searchQuery = '';
  filterStatut: StatutCandidature | '' = '';

  // Tab navigation by stage type
  activeTab = signal<TypeStage | 'TOUS'>('TOUS');

  // Detail modal
  showDetail = signal(false);
  selectedCandidature = signal<Candidature | null>(null);
  isUpdatingStatut = signal(false);
  dateEntretienInput = '';

  // Acceptation modal
  showAcceptModal = signal(false);
  dateDebutInput = '';

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');
  private toastTimer: any;

  // Enum values for template
  statuts: StatutCandidature[] = ['EN_ATTENTE', 'PRESELECTIONNE', 'ACCEPTE', 'REJETE'];
  typesStage: TypeStage[] = ['INITIATION', 'PERFECTIONNEMENT', 'ETE', 'PFE'];

  constructor(
    private agentRHService: AgentRHService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadCandidatures();
    this.loadStats();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const typeParam = params.get('type');
      if (typeParam) {
        const typeMap: Record<string, TypeStage | 'TOUS'> = {
          'tous': 'TOUS',
          'initiation': 'INITIATION',
          'perfectionnement': 'PERFECTIONNEMENT',
          'pfe': 'PFE',
          'ete': 'ETE'
        };
        const newTab = typeMap[typeParam.toLowerCase()] || 'TOUS';
        this.activeTab.set(newTab);
        this.searchQuery = '';
        this.filterStatut = '';
        this.applyFilters();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadCandidatures(): void {
    this.isLoading.set(true);
    this.agentRHService.listerToutesCandidatures().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.candidatures.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Erreur lors du chargement des candidatures', 'error');
        this.isLoading.set(false);
      }
    });
  }

  loadStats(): void {
    this.agentRHService.getStatistiquesCandidatures().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.stats.set(data),
      error: () => {}
    });
  }

  applyFilters(): void {
    let result = this.candidatures();

    // Filter by active tab (stage type)
    const tab = this.activeTab();
    if (tab !== 'TOUS') {
      result = result.filter(c => c.typeStage === tab);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.candidat1.nom.toLowerCase().includes(q) ||
        c.candidat1.prenom.toLowerCase().includes(q) ||
        c.candidat1.email.toLowerCase().includes(q) ||
        (c.candidat2 && (
          c.candidat2.nom.toLowerCase().includes(q) ||
          c.candidat2.prenom.toLowerCase().includes(q)
        )) ||
        (c.sujetChoix1?.titre.toLowerCase().includes(q)) ||
        (c.sujetChoix1?.departementNom.toLowerCase().includes(q))
      );
    }

    if (this.filterStatut) {
      result = result.filter(c => c.statut === this.filterStatut);
    }

    this.filteredCandidatures.set(result);
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatut = '';
    this.applyFilters();
  }

  openDetail(candidature: Candidature): void {
    this.selectedCandidature.set(candidature);
    this.dateEntretienInput = this.toDateTimeLocalValue(candidature.dateEntretien);
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.selectedCandidature.set(null);
    this.dateEntretienInput = '';
    this.dateDebutInput = '';
    this.showAcceptModal.set(false);
  }

  openAcceptModal(): void {
    this.showAcceptModal.set(true);
  }

  closeAcceptModal(): void {
    this.showAcceptModal.set(false);
    this.dateDebutInput = '';
  }

  changerStatutDepuisDetail(statut: StatutCandidature): void {
    const candidature = this.selectedCandidature();
    if (!candidature || this.isUpdatingStatut()) return;

    const payload: { statut: StatutCandidature; dateEntretien?: string; dateDebut?: string } = { statut };

    if (statut === 'PRESELECTIONNE') {
      if (!this.dateEntretienInput?.trim()) {
        this.showToast("La date d'entretien est obligatoire pour présélectionner", 'error');
        return;
      }
      payload.dateEntretien = this.normalizeDateTimeForApi(this.dateEntretienInput);
    }
    
    if (statut === 'ACCEPTE') {
      if (!this.dateDebutInput?.trim()) {
        this.showToast("La date de début de stage est obligatoire pour accepter", 'error');
        return;
      }
      // dateDebut format is expected to be simple date or datetime? Usually YYYY-MM-DDT00:00:00 if Java LocalDateTime
      // If the backend accepts dates with time, we use the same normalize logic if the input is datetime-local.
      // But usually "date de début" is just a Date. Let's see what the backend expects.
      // We will parse it to `T00:00:00` to be safe if input is `type="date"`.
      payload.dateDebut = this.dateDebutInput.includes('T') 
        ? this.normalizeDateTimeForApi(this.dateDebutInput) 
        : `${this.dateDebutInput}T09:00:00`; 
      
      this.closeAcceptModal();
    }

    this.isUpdatingStatut.set(true);
    this.agentRHService.changerStatutCandidature(candidature.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.selectedCandidature.set(updated);
          this.dateEntretienInput = this.toDateTimeLocalValue(updated.dateEntretien);
          this.updateLocalCandidature(updated);
          this.loadStats();
          this.showToast('Statut mis à jour avec succès', 'success');
          this.isUpdatingStatut.set(false);
        },
        error: (error) => {
          const apiMessage = error?.error?.message;
          this.showToast(apiMessage || 'Erreur lors du changement de statut', 'error');
          this.isUpdatingStatut.set(false);
        }
      });
  }

  private updateLocalCandidature(updated: Candidature): void {
    const updatedList = this.candidatures().map(c => c.id === updated.id ? updated : c);
    this.candidatures.set(updatedList);
    this.applyFilters();
  }

  private normalizeDateTimeForApi(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    return trimmed.length === 16 ? `${trimmed}:00` : trimmed;
  }

  private toDateTimeLocalValue(dateStr?: string): string {
    if (!dateStr) return '';

    const parsed = new Date(dateStr);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.getDate()).padStart(2, '0');
      const hours = String(parsed.getHours()).padStart(2, '0');
      const minutes = String(parsed.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return dateStr.length >= 16 ? dateStr.slice(0, 16) : '';
  }

  getStatutLabel(statut: StatutCandidature): string {
    const labels: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'En attente',
      PRESELECTIONNE: 'Présélectionné',
      ACCEPTE: 'Accepté',
      REJETE: 'Rejeté'
    };
    return labels[statut] || statut;
  }

  // Classes for statut pill inside the red gradient header
  getStatutHeaderClass(statut: StatutCandidature): string {
    const classes: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'bg-amber-400/20 border-amber-300/30 text-amber-100',
      PRESELECTIONNE: 'bg-blue-400/20 border-blue-300/30 text-blue-100',
      ACCEPTE: 'bg-emerald-400/20 border-emerald-300/30 text-emerald-100',
      REJETE: 'bg-white/15 border-white/25 text-white/80'
    };
    return classes[statut] || 'bg-white/15 border-white/25 text-white';
  }

  getStatutDotClass(statut: StatutCandidature): string {
    const classes: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'bg-amber-300',
      PRESELECTIONNE: 'bg-blue-300',
      ACCEPTE: 'bg-emerald-400',
      REJETE: 'bg-white/60'
    };
    return classes[statut] || 'bg-white/60';
  }

  getStatutClass(statut: StatutCandidature): string {
    const classes: Record<StatutCandidature, string> = {
      EN_ATTENTE: 'bg-amber-50 text-amber-700',
      PRESELECTIONNE: 'bg-blue-50 text-blue-700',
      ACCEPTE: 'bg-emerald-50 text-emerald-700',
      REJETE: 'bg-red-50 text-red-700'
    };
    return classes[statut] || 'bg-gray-100 text-gray-600';
  }

  getTypeLabel(type: TypeStage): string {
    const labels: Record<TypeStage, string> = {
      INITIATION: 'Initiation',
      PERFECTIONNEMENT: 'Perfectionnement',
      ETE: 'Été',
      PFE: 'PFE'
    };
    return labels[type] || type;
  }

  getTypeClass(type: TypeStage): string {
    const classes: Record<TypeStage, string> = {
      INITIATION: 'bg-blue-50 text-blue-700',
      PERFECTIONNEMENT: 'bg-amber-50 text-amber-700',
      ETE: 'bg-emerald-50 text-emerald-700',
      PFE: 'bg-ooredoo-600/[0.06] text-ooredoo-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-600';
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getStatCount(key: string, map?: { [k: string]: number }): number {
    return map?.[key] ?? 0;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastMessage.set(null), 3500);
  }

  // --- NEW PRIME NG HELPER METHODS ---
  getInitials(prenom?: string, nom?: string): string {
    if (!prenom && !nom) return 'U';
    return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase();
  }

  getTypeSeverity(type: TypeStage): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (type) {
      case 'INITIATION': return 'info';
      case 'PERFECTIONNEMENT': return 'warning';
      case 'ETE': return 'success';
      case 'PFE': return 'danger';
      default: return 'secondary';
    }
  }

  getStatutSeverity(statut: StatutCandidature): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (statut) {
      case 'EN_ATTENTE': return 'warning';
      case 'PRESELECTIONNE': return 'info';
      case 'ACCEPTE': return 'success';
      case 'REJETE': return 'danger';
      default: return 'secondary';
    }
  }
}


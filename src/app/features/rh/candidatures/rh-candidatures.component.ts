import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AgentRHService, CandidatureStats } from '../../../core/services/agent-rh.service';
import { Candidature, StatutCandidature, TypeStage, CandidatureUpdateRequest } from '../../../core/models/candidature.model';

@Component({
  selector: 'app-rh-candidatures-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rh-candidatures.component.html',
  styleUrls: ['./rh-candidatures.component.css']
})
export class RhCandidaturesListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  candidatures = signal<Candidature[]>([]);
  filteredCandidatures = signal<Candidature[]>([]);
  stats = signal<CandidatureStats | null>(null);

  // Tabs and Filters
  activeTab = signal<'PFE' | 'STAGES'>('PFE');
  filterStatut: StatutCandidature | 'ENTRETIEN' | '' = '';
  searchQuery = '';

  // Modal Detail
  showDetail = signal(false);
  selectedCandidature = signal<Candidature | null>(null);

  // Modal Acceptation / Entretien
  showAcceptModal = signal(false);
  dateEntretienInput: string = '';
  targetStatut: StatutCandidature | null = null;

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');
  private toastTimer: any;

  // Constants for template
  GRD = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

  constructor(
    private agentRHService: AgentRHService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const type = params.get('type');
      if (type === 'initiation' || type === 'perfectionnement' || type === 'ete') {
        this.setActiveTab('STAGES');
      } else {
        if (type === 'pfe') this.setActiveTab('PFE');
        else if (type === 'stages') this.setActiveTab('STAGES');
      }
    });

    this.loadCandidatures();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  loadCandidatures(): void {
    console.log('Loading candidatures...');
    this.agentRHService.listerToutesCandidatures()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Candidatures loaded:', data.length);
          this.candidatures.set(data);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error loading candidatures:', err);
          this.showToast('Erreur chargement', 'error');
        }
      });
  }

  loadStats(): void {
    this.agentRHService.getStatistiquesCandidatures()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.stats.set(data),
        error: () => { }
      });
  }

  // ─── TABS & FILTERS ───
  setActiveTab(tab: 'PFE' | 'STAGES') {
    this.activeTab.set(tab);
    this.filterStatut = '';
    this.searchQuery = '';
    this.applyFilters();
  }

  setFilterStatut(statut: StatutCandidature | 'ENTRETIEN' | '') {
    this.filterStatut = statut;
    this.applyFilters();
  }

  applySearch(val: string) {
    this.searchQuery = val;
    this.applyFilters();
  }

  applyFilters() {
    let res = this.candidatures();
    const tab = this.activeTab();

    // Tab filter
    if (tab === 'PFE') {
      res = res.filter(c => c.typeStage === 'PFE');
    } else {
      res = res.filter(c => c.typeStage !== 'PFE');
    }

    // Statut filter
    if (this.filterStatut) {
      if (this.filterStatut === 'ENTRETIEN') {
        res = res.filter(c => c.statut === 'PRESELECTIONNE' && !!c.dateEntretien);
      } else {
        res = res.filter(c => c.statut === this.filterStatut);
      }
    }

    // Search filter
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      res = res.filter(c =>
        c.candidat1.nom.toLowerCase().includes(q) ||
        c.candidat1.prenom.toLowerCase().includes(q) ||
        c.candidat1.universiteNom.toLowerCase().includes(q) ||
        (c.candidat2 && (c.candidat2.nom.toLowerCase().includes(q) || c.candidat2.prenom.toLowerCase().includes(q)))
      );
    }

    this.filteredCandidatures.set(res);
  }

  // ─── COUNTS ───
  getCountByType(type: 'PFE' | 'STAGES'): number {
    if (type === 'PFE') return this.candidatures().filter(c => c.typeStage === 'PFE').length;
    return this.candidatures().filter(c => c.typeStage !== 'PFE').length;
  }

  getCountStages(): number {
    return this.getCountByType('STAGES');
  }

  getCountByStatut(statut: StatutCandidature): number {
    // Total for current tab
    const tab = this.activeTab();
    let res = this.candidatures();
    if (tab === 'PFE') res = res.filter(c => c.typeStage === 'PFE');
    else res = res.filter(c => c.typeStage !== 'PFE');

    return res.filter(c => c.statut === statut).length;
  }

  getCountByStatutInView(statut: StatutCandidature | 'ENTRETIEN' | ''): number {
    const tab = this.activeTab();
    let res = this.candidatures();
    if (tab === 'PFE') res = res.filter(c => c.typeStage === 'PFE');
    else res = res.filter(c => c.typeStage !== 'PFE');

    if (statut === '') return res.length;
    if (statut === 'ENTRETIEN') return res.filter(c => c.statut === 'PRESELECTIONNE' && !!c.dateEntretien).length;
    return res.filter(c => c.statut === statut).length;
  }

  // ─── TEMPLATE HELPERS ───
  getInitials(prenom: string, nom: string): string {
    return ((prenom[0] || '') + (nom[0] || '')).toUpperCase();
  }

  getGradientClass(str: string): string {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return this.GRD[Math.abs(h) % 7];
  }

  getStatusClass(statut: StatutCandidature): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'st-att';
      case 'PRESELECTIONNE': return 'st-pre';
      case 'ACCEPTE': return 'st-acc';
      case 'REJETE': return 'st-ref';
      default: return 'st-att';
    }
  }

  // Override for status badge/dot logic in template
  getStatusBadgeClass(statut: StatutCandidature): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'b-att';
      case 'PRESELECTIONNE': return 'b-pre';
      case 'ACCEPTE': return 'b-acc';
      case 'REJETE': return 'b-ref';
      default: return 'b-att';
    }
  }

  getStatusDotColor(statut: StatutCandidature): string {
    switch (statut) {
      case 'EN_ATTENTE': return '#F59E0B';
      case 'PRESELECTIONNE': return '#2563EB';
      case 'ACCEPTE': return '#00A86B';
      case 'REJETE': return '#94A3B8';
      default: return '#F59E0B';
    }
  }

  getStatusLabel(statut: StatutCandidature): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'En attente';
      case 'PRESELECTIONNE': return 'Présélectionné';
      case 'ACCEPTE': return 'Accepté';
      case 'REJETE': return 'Refusé';
      default: return 'En attente';
    }
  }

  getModalStatusClass(statut: StatutCandidature): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'm-sp-att';
      case 'PRESELECTIONNE': return 'm-sp-pre';
      case 'ACCEPTE': return 'm-sp-acc';
      case 'REJETE': return 'm-sp-ref';
      default: return 'm-sp-att';
    }
  }

  // ─── MODAL ACTIONS ───
  openModal(c: Candidature) {
    this.selectedCandidature.set(c);
    this.showDetail.set(true);
  }

  closeModal(event?: Event) {
    if (event && (event.target as HTMLElement).classList.contains('overlay')) {
      this.showDetail.set(false);
      this.selectedCandidature.set(null);
    }
  }

  closeDetail() {
    this.showDetail.set(false);
    this.selectedCandidature.set(null);
  }

  canPreselectionner(s: StatutCandidature): boolean { return s === 'EN_ATTENTE'; }
  canEntretien(s: StatutCandidature): boolean { return s === 'EN_ATTENTE' || s === 'PRESELECTIONNE'; }
  canAccepter(s: StatutCandidature): boolean { return ['EN_ATTENTE', 'PRESELECTIONNE'].includes(s); } // Adapted
  canRefuser(s: StatutCandidature): boolean { return s !== 'REJETE' && s !== 'ACCEPTE'; }

  updateStatutWithModal(statut: 'PRESELECTIONNE' | 'ACCEPTE' | 'REJETE' | 'ENTRETIEN') {
    if (statut === 'ENTRETIEN' || statut === 'PRESELECTIONNE' || statut === 'ACCEPTE') {
      this.targetStatut = statut === 'ENTRETIEN' ? 'PRESELECTIONNE' : statut;
      this.dateEntretienInput = '';
      this.showAcceptModal.set(true);
    } else {
      this.updateStatut(statut);
    }
  }

  confirmEntretien() {
    if (!this.dateEntretienInput || !this.selectedCandidature()) return;

    const id = this.selectedCandidature()!.id;
    const isoDate = new Date(this.dateEntretienInput).toISOString();

    const req: CandidatureUpdateRequest = this.targetStatut === 'ACCEPTE'
      ? { statut: 'ACCEPTE', dateDebut: isoDate }
      : { statut: 'PRESELECTIONNE', dateEntretien: isoDate };

    this.agentRHService.changerStatutCandidature(id, req).subscribe({
      next: (updated) => {
        this.updateLocalCandidature(updated);
        this.showAcceptModal.set(false);
        this.showToast(
          this.targetStatut === 'ACCEPTE' ? 'Candidature acceptée avec succès' : 'Entretien planifié avec succès',
          'success'
        );
        this.closeDetail();
      },
      error: () => this.showToast('Erreur lors de la mise à jour', 'error')
    });
  }

  updateStatut(statut: StatutCandidature) {
    const c = this.selectedCandidature();
    if (!c) return;

    const req: CandidatureUpdateRequest = { statut };
    this.agentRHService.changerStatutCandidature(c.id, req).subscribe({
      next: (updated) => {
        this.updateLocalCandidature(updated);
        this.showToast('Statut mis à jour', 'success');
        // Update modal view
        this.selectedCandidature.set(updated);
      },
      error: () => this.showToast('Erreur mise à jour statut', 'error')
    });
  }

  updateLocalCandidature(updated: Candidature) {
    this.candidatures.update(list => list.map(c => c.id === updated.id ? updated : c));
    this.applyFilters();
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage.set(msg);
    this.toastType.set(type);
    this.toastTimer = setTimeout(() => {
      this.toastMessage.set(null);
    }, 3800);
  }
}


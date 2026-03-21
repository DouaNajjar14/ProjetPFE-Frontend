import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { StagiaireService } from '../../../../core/services/stagiaire.service';
import { StagiaireResponse, StatutStagiaire } from '../../../../core/models/stagiaire.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-stagiaire-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    AvatarModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './stagiaire-list.component.html',
  styleUrls: ['./stagiaire-list.component.css']
})
export class StagiaireListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  stagiaires = signal<StagiaireResponse[]>([]);
  filteredStagiaires = signal<StagiaireResponse[]>([]);
  isLoading = signal(false);

  searchQuery = '';
  filterStatut: StatutStagiaire | '' = '';
  filterTypeStage = '';

  statutOptions = [
    { label: 'Actif', value: 'ACTIF' },
    { label: 'Terminé', value: 'TERMINE' },
    { label: 'Abandonné', value: 'ABANDONNE' }
  ];

  typeStageOptions = [
    { label: 'Initiation', value: 'INITIATION' },
    { label: 'Perfectionnement', value: 'PERFECTIONNEMENT' },
    { label: 'Été', value: 'ETE' },
    { label: 'PFE', value: 'PFE' }
  ];

  constructor(
    private stagiaireService: StagiaireService,
    private messageService: MessageService,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadStagiaires();

    const stagiaireId = this.route.snapshot.queryParams['stagiaireId'];
    const confirmed   = this.route.snapshot.queryParams['account-confirmed'];

    if (confirmed === 'true' && stagiaireId) {
      this.stagiaireService.getStagiaireById(stagiaireId).subscribe(data => {
        this.http.post(
          'http://localhost:5678/webhook/stagiaire-confirme',
          {
            stagiaireId:  data.id,
            username:     data.username,
            tempPassword: data.tempPassword,
            prenom:       data.prenom,
            nom:          data.nom,
            email:        data.email,
            typeStage:    data.typeStage,
            dateDebut:    data.dateDebut,
            dateFin:      data.dateFin,
            departement:  data.departementNom
          },
          { headers: { 'X-Webhook-Secret': 'ooredoo-webhook-secret-2026' } }
        ).subscribe();

        this.messageService.add({
          severity: 'success',
          summary:  'Compte créé',
          detail:   `Le compte de ${data.prenom} ${data.nom} a été créé et les identifiants ont été envoyés par email.`
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadStagiaires(): void {
    this.isLoading.set(true);
    this.stagiaireService.listerStagiaires().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.stagiaires.set(data);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement des stagiaires'
        });
        this.isLoading.set(false);
      }
    });
  }

  applyFilters(): void {
    let result = this.stagiaires();

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(s =>
        s.nom.toLowerCase().includes(q) ||
        s.prenom.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.departementNom.toLowerCase().includes(q)
      );
    }

    if (this.filterStatut) {
      result = result.filter(s => s.statut === this.filterStatut);
    }

    if (this.filterTypeStage) {
      result = result.filter(s => s.typeStage === this.filterTypeStage);
    }

    this.filteredStagiaires.set(result);
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
    this.filterTypeStage = '';
    this.applyFilters();
  }

  // ── Stat helpers ──────────────────────────────────────────────
  get totalCount(): number { return this.stagiaires().length; }
  get actifCount(): number { return this.stagiaires().filter(s => s.statut === 'ACTIF').length; }
  get termineCount(): number { return this.stagiaires().filter(s => s.statut === 'TERMINE').length; }
  get abandonneCount(): number { return this.stagiaires().filter(s => s.statut === 'ABANDONNE').length; }

  // ── Display helpers ───────────────────────────────────────────
  getStatutSeverity(statut: StatutStagiaire): 'success' | 'secondary' | 'danger' {
    switch (statut) {
      case 'ACTIF':      return 'success';
      case 'TERMINE':    return 'secondary';
      case 'ABANDONNE':  return 'danger';
    }
  }

  getStatutLabel(statut: StatutStagiaire): string {
    const labels: Record<StatutStagiaire, string> = {
      ACTIF:      'Actif',
      TERMINE:    'Terminé',
      ABANDONNE:  'Abandonné'
    };
    return labels[statut] || statut;
  }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      INITIATION:       'Initiation',
      PERFECTIONNEMENT: 'Perfectionnement',
      ETE:              'Été',
      PFE:              'PFE'
    };
    return labels[type] || type;
  }

  getTypeSeverity(type: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (type) {
      case 'INITIATION':       return 'info';
      case 'PERFECTIONNEMENT': return 'warning';
      case 'ETE':              return 'success';
      case 'PFE':              return 'danger';
      default:                 return 'secondary';
    }
  }

  getInitials(prenom?: string, nom?: string): string {
    if (!prenom && !nom) return 'S';
    return `${(prenom || '').charAt(0)}${(nom || '').charAt(0)}`.toUpperCase();
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}

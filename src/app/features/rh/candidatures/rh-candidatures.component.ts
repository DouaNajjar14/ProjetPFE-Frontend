import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AgentRHService, CandidatureStats } from '../../../core/services/agent-rh.service';
import { Candidature } from '../../../core/models/candidature.model';
import { RhCandidaturesPfeComponent } from './pfe/rh-candidatures-pfe.component';
import { RhCandidaturesStagesComponent } from './stages/rh-candidatures-stages.component';

@Component({
  selector: 'app-rh-candidatures-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RhCandidaturesPfeComponent, RhCandidaturesStagesComponent],
  templateUrl: './rh-candidatures.component.html',
  styleUrls: ['./rh-candidatures.component.css']
})
export class RhCandidaturesListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  candidatures = signal<Candidature[]>([]);
  stats = signal<CandidatureStats | null>(null);

  // UI State
  searchQuery = '';
  activeSection = signal<'pfe' | 'stages'>('pfe');

  constructor(
    private agentRHService: AgentRHService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Lire le paramètre de route pour déterminer le type (pfe ou stages)
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const type = params['type'] || 'pfe';
        console.log('Route params received, type:', type);
        this.activeSection.set(type as 'pfe' | 'stages');
      });

    this.loadCandidatures();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCandidatures(): void {
    console.log('Loading candidatures...');
    this.agentRHService.listerToutesCandidatures()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Candidatures loaded:', data.length);
          this.candidatures.set(data);
        },
        error: (err) => {
          console.error('Error loading candidatures:', err);
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

  onCandidaturesLoaded(): void {
    this.loadCandidatures();
    this.loadStats();
  }

  setActiveSection(section: 'pfe' | 'stages'): void {
    console.log('Navigating to section:', section);
    this.router.navigate(['/agent-rh/candidatures', section]);
  }
}
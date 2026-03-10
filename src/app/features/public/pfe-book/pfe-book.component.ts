import { Component, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';
import { Departement } from '../../../core/models/departement.model';

@Component({
  selector: 'app-pfe-book',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './pfe-book.component.html',
  styleUrls: ['./pfe-book.component.css']
})
export class PfeBookComponent implements OnInit {
  sujets = signal<SujetPfe[]>([]);
  departements = signal<Departement[]>([]);
  loading = signal(true);
  currentIndex = signal(0);

  searchQuery = signal('');
  selectedDepartement = signal('');
  selectedSpecialite = signal('');

  allSpecialites = computed(() => {
    const map = new Map<string, string>();
    for (const s of this.sujets()) {
      for (const sp of s.specialitesUniversitaires ?? []) {
        map.set(String(sp.id), sp.nom);
      }
    }
    return [...map.entries()].map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom));
  });

  filteredSujets = computed(() => {
    let result = this.sujets();
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      result = result.filter(s =>
        s.titre.toLowerCase().includes(q) ||
        s.mission.toLowerCase().includes(q) ||
        s.departementNom?.toLowerCase().includes(q) ||
        s.competences?.some(c => c.nom.toLowerCase().includes(q))
      );
    }
    const dept = this.selectedDepartement();
    if (dept) {
      result = result.filter(s => s.departementId === dept);
    }
    const spec = this.selectedSpecialite();
    if (spec) {
      result = result.filter(s =>
        s.specialitesUniversitaires?.some(sp => String(sp.id) === spec)
      );
    }
    return result;
  });

  currentSubject = computed((): SujetPfe | null => {
    return this.filteredSujets()[this.currentIndex()] ?? null;
  });

  constructor(private publicService: PublicService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.publicService.listerDepartements().subscribe({
      next: (depts) => this.departements.set(depts),
      error: (err) => console.error('Erreur chargement départements:', err)
    });
    this.publicService.listerSujetsPfe().subscribe({
      next: (sujets) => { this.sujets.set(sujets); this.loading.set(false); },
      error: (err) => { console.error('Erreur chargement sujets:', err); this.loading.set(false); }
    });
  }

  onSearchChange(value: string) { this.searchQuery.set(value); this.currentIndex.set(0); }
  onFilterChange(value: string) { this.selectedDepartement.set(value); this.currentIndex.set(0); }
  onSpecialiteChange(value: string) { this.selectedSpecialite.set(value); this.currentIndex.set(0); }

  resetFilters() {
    this.searchQuery.set('');
    this.selectedDepartement.set('');
    this.selectedSpecialite.set('');
    this.currentIndex.set(0);
  }

  previousSubject() { if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1); }
  nextSubject() { if (this.currentIndex() < this.filteredSujets().length - 1) this.currentIndex.update(i => i + 1); }
  goToSubject(index: number) { if (index >= 0 && index < this.filteredSujets().length) this.currentIndex.set(index); }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'OUVERT': return 'Disponible';
      case 'POURVU': return 'Pourvu';
      case 'FERME': return 'Fermé';
      default: return statut || 'Disponible';
    }
  }

  getSpecialites(): string {
    const specs = this.currentSubject()?.specialitesUniversitaires;
    if (!specs || specs.length === 0) return 'Non spécifiée';
    return specs.map(s => s.nom).join(' / ');
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DepartementService } from '../../../../core/services/departement.service';
import { SpecialiteService } from '../../../../core/services/specialite.service';
import { Departement } from '../../../../core/models/departement.model';

@Component({
  selector: 'app-departement-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departement-list.component.html',
  styleUrls: ['./departement-list.component.css']
})
export class DepartementListComponent implements OnInit {
  departements = signal<Departement[]>([]);
  filteredDepartements = signal<Departement[]>([]);
  isLoading = signal(false);
  searchTerm = '';
  activeFilter: 'actifs' | 'archives' | 'tous' = 'actifs';

  // Modal state
  showModal = signal(false);
  showDeleteConfirm = signal(false);
  modalMode: 'create' | 'edit' = 'create';
  editingDepartement: Departement | null = null;
  departementNom = '';
  modalError = signal<string | null>(null);
  isSaving = signal(false);
  deletingDepartement: Departement | null = null;

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  // Detail modal
  showDetail = signal(false);
  selectedDepartement: Departement | null = null;

  constructor(
    private departementService: DepartementService,
    private specialiteService: SpecialiteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDepartements();
  }

  loadDepartements(): void {
    this.isLoading.set(true);
    const obs =
      this.activeFilter === 'actifs' ? this.departementService.listerActifs() :
        this.activeFilter === 'archives' ? this.departementService.listerArchives() :
          this.departementService.listerTous();

    obs.subscribe({
      next: (data) => {
        this.departements.set(data);
        this.applyFilter();
        this.loadSpecialitesForDepartements(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Erreur lors du chargement des départements', 'error');
        this.isLoading.set(false);
      }
    });
  }

  loadSpecialitesForDepartements(depts: Departement[]): void {
    const requests = depts
      .filter(d => !d.archive)
      .map(d => this.specialiteService.listerParDepartement(d.id));

    if (requests.length === 0) return;

    forkJoin(requests).subscribe({
      next: (results) => {
        const updatedDepts = this.departements().map((dept, idx) => {
          if (dept.archive) return dept;
          const deptIndex = depts.filter(d => !d.archive).findIndex(d => d.id === dept.id);
          return deptIndex !== -1 ? { ...dept, specialites: results[deptIndex] } : dept;
        });
        this.departements.set(updatedDepts);
        this.applyFilter();
      },
      error: () => { }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.departements().filter(d =>
      d.nom.toLowerCase().includes(term)
    );
    this.filteredDepartements.set(filtered);
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  setFilter(filter: 'actifs' | 'archives' | 'tous'): void {
    this.activeFilter = filter;
    this.loadDepartements();
  }

  // Navigation to specialites
  viewSpecialites(dept: Departement): void {
    this.router.navigate(['/admin/departements', dept.id, 'specialites']);
  }

  // Modal operations
  openCreateModal(): void {
    this.modalMode = 'create';
    this.departementNom = '';
    this.editingDepartement = null;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  openEditModal(dept: Departement, event: Event): void {
    event.stopPropagation();
    this.modalMode = 'edit';
    this.departementNom = dept.nom;
    this.editingDepartement = dept;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.departementNom = '';
    this.editingDepartement = null;
    this.modalError.set(null);
  }

  saveModal(): void {
    if (!this.departementNom.trim()) {
      this.modalError.set('Le nom du département est obligatoire');
      return;
    }

    this.isSaving.set(true);
    this.modalError.set(null);

    if (this.modalMode === 'create') {
      this.departementService.creer({
        nom: this.departementNom.trim()
      }).subscribe({
        next: () => {
          this.showToast('Département créé avec succès', 'success');
          this.closeModal();
          this.loadDepartements();
          this.isSaving.set(false);
        },
        error: (err) => {
          this.modalError.set(err.error?.message || 'Erreur lors de la création');
          this.isSaving.set(false);
        }
      });
    } else {
      const editId = this.editingDepartement!.id;
      const newNom = this.departementNom.trim();
      this.departementService.modifier(editId, {
        nom: newNom
      }).subscribe({
        next: () => {
          // Update in place instead of reloading
          const updated = this.departements().map(d =>
            d.id === editId ? { ...d, nom: newNom } : d
          );
          this.departements.set(updated);
          this.applyFilter();
          this.showToast('Département modifié avec succès', 'success');
          this.closeModal();
          this.isSaving.set(false);
        },
        error: (err) => {
          this.modalError.set(err.error?.message || 'Erreur lors de la modification');
          this.isSaving.set(false);
        }
      });
    }
  }

  // Archive/Unarchive
  openArchiveConfirm(dept: Departement, event: Event): void {
    event.stopPropagation();
    this.deletingDepartement = dept;
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm.set(false);
    this.deletingDepartement = null;
  }

  confirmArchive(): void {
    if (!this.deletingDepartement) return;

    const action = this.deletingDepartement.archive
      ? this.departementService.desarchiver(this.deletingDepartement.id)
      : this.departementService.archiver(this.deletingDepartement.id);

    const actionLabel = this.deletingDepartement.archive ? 'désarchivé' : 'archivé';

    action.subscribe({
      next: () => {
        this.showToast(`Département ${actionLabel} avec succès`, 'success');
        this.closeDeleteConfirm();
        this.loadDepartements();
      },
      error: () => {
        this.showToast(`Erreur lors de l'archivage`, 'error');
        this.closeDeleteConfirm();
      }
    });
  }

  // Detail modal
  openDetailModal(dept: Departement): void {
    this.selectedDepartement = dept;
    this.showDetail.set(true);
  }

  closeDetailModal(): void {
    this.showDetail.set(false);
    this.selectedDepartement = null;
  }

  editFromDetail(): void {
    if (this.selectedDepartement) {
      const dept = this.selectedDepartement;
      this.closeDetailModal();
      this.openEditModal(dept, new Event('click'));
    }
  }

  // Toast
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  get activeDeptCount(): number {
    return this.departements().filter(d => !d.archive).length;
  }

  get archivedDeptCount(): number {
    return this.departements().filter(d => d.archive).length;
  }

  // Calculate total stagiaires and encadrants
  get totalStagiaires(): number {
    return this.departements().filter(d => !d.archive).reduce((sum, d) => sum + (d.nombreStagiairesActuel || 0), 0);
  }

  get totalEncadrants(): number {
    return this.departements().filter(d => !d.archive).reduce((sum, d) => sum + (d.nombreEncadrantsActuel || 0), 0);
  }
}

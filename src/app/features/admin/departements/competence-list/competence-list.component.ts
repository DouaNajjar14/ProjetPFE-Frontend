import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompetenceService } from '../../../../core/services/competence.service';
import { SpecialiteService } from '../../../../core/services/specialite.service';
import { DepartementService } from '../../../../core/services/departement.service';
import { Competence } from '../../../../core/models/competence.model';
import { Specialite } from '../../../../core/models/specialite.model';
import { Departement } from '../../../../core/models/departement.model';

@Component({
    selector: 'app-competence-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './competence-list.component.html',
    styleUrls: ['./competence-list.component.css']
})
export class CompetenceListComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private competenceService = inject(CompetenceService);
    private specialiteService = inject(SpecialiteService);
    private departementService = inject(DepartementService);

    // Route params
    departementId: string = '';
    specialiteId: string = '';
    departement = signal<Departement | null>(null);
    specialite = signal<Specialite | null>(null);

    // Data state
    competences = signal<Competence[]>([]);
    isLoading = signal(true);
    searchTerm = signal('');
    activeFilter = signal<'actifs' | 'archives'>('actifs');

    // Modal state
    showModal = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    editingCompetence: Competence | null = null;
    competenceNom = '';
    modalError = signal('');
    isSaving = signal(false);

    // Delete confirm
    showDeleteConfirm = signal(false);
    deletingCompetence: Competence | null = null;

    // Toast
    toastMessage = signal('');
    toastType = signal<'success' | 'error'>('success');

    filteredCompetences = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.competences().filter(c =>
            c.nom.toLowerCase().includes(term)
        );
    });

    ngOnInit(): void {
        this.departementId = this.route.snapshot.paramMap.get('deptId') || '';
        this.specialiteId = this.route.snapshot.paramMap.get('specId') || '';
        const initialFilter = this.route.snapshot.queryParamMap.get('filter');
        if (initialFilter === 'archives' || initialFilter === 'actifs') {
            this.activeFilter.set(initialFilter);
        }

        if (this.departementId && this.specialiteId) {
            this.loadDepartement();
            this.loadSpecialite();
            this.loadCompetences();
        }
    }

    loadDepartement(): void {
        this.departementService.trouverParId(this.departementId).subscribe({
            next: (dept) => this.departement.set(dept),
            error: () => { }
        });
    }

    loadSpecialite(): void {
        this.specialiteService.trouverParId(+this.specialiteId).subscribe({
            next: (spec) => this.specialite.set(spec),
            error: () => { }
        });
    }

    loadCompetences(): void {
        this.isLoading.set(true);
        const obs = this.activeFilter() === 'archives'
            ? this.competenceService.listerArchivesParSpecialite(+this.specialiteId)
            : this.competenceService.listerParSpecialite(+this.specialiteId);
        obs.subscribe({
            next: (data) => {
                this.competences.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.showToast('Erreur lors du chargement des compétences', 'error');
            }
        });
    }

    onSearchChange(): void {
        // Filtering handled by computed
    }

    setFilter(filter: 'actifs' | 'archives'): void {
        this.activeFilter.set(filter);
        this.loadCompetences();
    }

    restoreCompetence(comp: Competence, event: Event): void {
        event.stopPropagation();
        this.competenceService.desarchiver(comp.id).subscribe({
            next: () => {
                this.showToast('Compétence restaurée avec succès', 'success');
                this.loadCompetences();
            },
            error: () => this.showToast('Erreur lors de la restauration', 'error')
        });
    }

    goBack(): void {
        this.router.navigate(['/admin/departements', this.departementId, 'specialites']);
    }

    goToDepartements(): void {
        this.router.navigate(['/admin/departements']);
    }

    openCreateModal(): void {
        this.modalMode = 'create';
        this.editingCompetence = null;
        this.competenceNom = '';
        this.modalError.set('');
        this.showModal.set(true);
    }

    openEditModal(comp: Competence, event: Event): void {
        event.stopPropagation();
        this.modalMode = 'edit';
        this.editingCompetence = comp;
        this.competenceNom = comp.nom;
        this.modalError.set('');
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.competenceNom = '';
        this.editingCompetence = null;
        this.modalError.set('');
    }

    saveModal(): void {
        const nom = this.competenceNom.trim();
        if (!nom) {
            this.modalError.set('Le nom est requis');
            return;
        }

        this.isSaving.set(true);
        this.modalError.set('');

        if (this.modalMode === 'create') {
            const request = { nom, specialiteId: +this.specialiteId };
            this.competenceService.creer(request).subscribe({
                next: () => {
                    this.showToast('Compétence créée avec succès', 'success');
                    this.loadCompetences();
                    this.closeModal();
                    this.isSaving.set(false);
                },
                error: (err) => {
                    this.modalError.set(err.error?.message || 'Erreur lors de la création');
                    this.isSaving.set(false);
                }
            });
        } else if (this.editingCompetence) {
            const editId = this.editingCompetence.id;
            const request = { nom, specialiteId: +this.specialiteId };
            this.competenceService.modifier(editId, request).subscribe({
                next: () => {
                    // Update in place instead of reloading
                    const updated = this.competences().map(c =>
                        c.id === editId ? { ...c, nom } : c
                    );
                    this.competences.set(updated);
                    this.showToast('Compétence modifiée avec succès', 'success');
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

    openDeleteConfirm(comp: Competence, event: Event): void {
        event.stopPropagation();
        this.deletingCompetence = comp;
        this.showDeleteConfirm.set(true);
    }

    closeDeleteConfirm(): void {
        this.showDeleteConfirm.set(false);
        this.deletingCompetence = null;
    }

    confirmDelete(): void {
        if (!this.deletingCompetence) return;

        this.competenceService.supprimer(this.deletingCompetence.id).subscribe({
            next: () => {
                this.showToast('Compétence archivée avec succès', 'success');
                this.loadCompetences();
                this.closeDeleteConfirm();
            },
            error: () => {
                this.showToast('Erreur lors de l\'archivage', 'error');
                this.closeDeleteConfirm();
            }
        });
    }

    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(''), 4000);
    }
}

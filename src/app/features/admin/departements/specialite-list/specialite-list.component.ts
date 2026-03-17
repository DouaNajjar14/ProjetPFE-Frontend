import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SpecialiteService } from '../../../../core/services/specialite.service';
import { DepartementService } from '../../../../core/services/departement.service';
import { Specialite } from '../../../../core/models/specialite.model';
import { Departement } from '../../../../core/models/departement.model';

@Component({
    selector: 'app-specialite-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './specialite-list.component.html',
    styleUrls: ['./specialite-list.component.css']
})
export class SpecialiteListComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private specialiteService = inject(SpecialiteService);
    private departementService = inject(DepartementService);

    // Department info
    departementId: string = '';
    departement = signal<Departement | null>(null);

    // Data state
    specialites = signal<Specialite[]>([]);
    isLoading = signal(true);
    searchTerm = signal('');
    activeFilter = signal<'actifs' | 'archives'>('actifs');

    // Modal state
    showModal = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    editingSpecialite: Specialite | null = null;
    specialiteNom = '';
    modalError = signal('');
    isSaving = signal(false);

    // Delete confirm
    showDeleteConfirm = signal(false);
    deletingSpecialite: Specialite | null = null;

    // Toast
    toastMessage = signal('');
    toastType = signal<'success' | 'error'>('success');

    // Detail modal
    showDetail = signal(false);
    selectedSpecialite: Specialite | null = null;

    filteredSpecialites = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.specialites().filter(s =>
            s.nom.toLowerCase().includes(term)
        );
    });

    ngOnInit(): void {
        this.departementId = this.route.snapshot.paramMap.get('id') || '';
        if (this.departementId) {
            this.loadDepartement();
            this.loadSpecialites();
        }
    }

    loadDepartement(): void {
        this.departementService.trouverParId(this.departementId).subscribe({
            next: (dept) => this.departement.set(dept),
            error: () => this.showToast('Erreur lors du chargement du département', 'error')
        });
    }

    loadSpecialites(): void {
        this.isLoading.set(true);
        const obs = this.activeFilter() === 'archives'
            ? this.specialiteService.listerArchivesParDepartement(this.departementId)
            : this.specialiteService.listerParDepartement(this.departementId);
        obs.subscribe({
            next: (data) => {
                this.specialites.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.showToast('Erreur lors du chargement des spécialités', 'error');
            }
        });
    }

    onSearchChange(): void {
        // Filtering handled by computed
    }

    setFilter(filter: 'actifs' | 'archives'): void {
        this.activeFilter.set(filter);
        this.loadSpecialites();
    }

    goBack(): void {
        this.router.navigate(['/admin/departements']);
    }

    viewCompetences(spec: Specialite): void {
        this.router.navigate(['/admin/departements', this.departementId, 'specialites', spec.id, 'competences'], {
            queryParams: { filter: this.activeFilter() === 'archives' ? 'archives' : 'actifs' }
        });
    }

    restoreSpecialite(spec: Specialite, event: Event): void {
        event.stopPropagation();
        this.specialiteService.desarchiver(spec.id).subscribe({
            next: () => {
                this.showToast('Spécialité restaurée avec succès', 'success');
                this.loadSpecialites();
            },
            error: () => this.showToast('Erreur lors de la restauration', 'error')
        });
    }

    openCreateModal(): void {
        this.modalMode = 'create';
        this.editingSpecialite = null;
        this.specialiteNom = '';
        this.modalError.set('');
        this.showModal.set(true);
    }

    openEditModal(spec: Specialite, event: Event): void {
        event.stopPropagation();
        this.modalMode = 'edit';
        this.editingSpecialite = spec;
        this.specialiteNom = spec.nom;
        this.modalError.set('');
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.specialiteNom = '';
        this.editingSpecialite = null;
        this.modalError.set('');
    }

    saveModal(): void {
        const nom = this.specialiteNom.trim();
        if (!nom) {
            this.modalError.set('Le nom est requis');
            return;
        }

        this.isSaving.set(true);
        this.modalError.set('');

        if (this.modalMode === 'create') {
            const request = { nom, departementId: this.departementId };
            this.specialiteService.creer(request).subscribe({
                next: () => {
                    this.showToast('Spécialité créée avec succès', 'success');
                    this.loadSpecialites();
                    this.closeModal();
                    this.isSaving.set(false);
                },
                error: (err) => {
                    this.modalError.set(err.error?.message || 'Erreur lors de la création');
                    this.isSaving.set(false);
                }
            });
        } else if (this.editingSpecialite) {
            const editId = this.editingSpecialite.id;
            const request = { nom, departementId: this.departementId };
            this.specialiteService.modifier(editId, request).subscribe({
                next: () => {
                    // Update in place instead of reloading
                    const updated = this.specialites().map(s =>
                        s.id === editId ? { ...s, nom } : s
                    );
                    this.specialites.set(updated);
                    this.showToast('Spécialité modifiée avec succès', 'success');
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

    openDeleteConfirm(spec: Specialite, event: Event): void {
        event.stopPropagation();
        this.deletingSpecialite = spec;
        this.showDeleteConfirm.set(true);
    }

    closeDeleteConfirm(): void {
        this.showDeleteConfirm.set(false);
        this.deletingSpecialite = null;
    }

    confirmDelete(): void {
        if (!this.deletingSpecialite) return;

        this.specialiteService.supprimer(this.deletingSpecialite.id).subscribe({
            next: () => {
                this.showToast('Spécialité archivée avec succès', 'success');
                this.loadSpecialites();
                this.closeDeleteConfirm();
            },
            error: () => {
                this.showToast('Erreur lors de l\'archivage', 'error');
                this.closeDeleteConfirm();
            }
        });
    }

    // Detail modal
    openDetailModal(spec: Specialite): void {
        this.selectedSpecialite = spec;
        this.showDetail.set(true);
    }

    closeDetailModal(): void {
        this.showDetail.set(false);
        this.selectedSpecialite = null;
    }

    editFromDetail(): void {
        if (this.selectedSpecialite) {
            const spec = this.selectedSpecialite;
            this.closeDetailModal();
            this.openEditModal(spec, new Event('click'));
        }
    }

    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(''), 4000);
    }
}

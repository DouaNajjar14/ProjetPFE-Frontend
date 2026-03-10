import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncadrantService } from '../../../core/services/encadrant.service';
import { DepartementService } from '../../../core/services/departement.service';
import { SpecialiteService } from '../../../core/services/specialite.service';
import { Encadrant } from '../../../core/models/encadrant.model';
import { Departement } from '../../../core/models/departement.model';
import { Specialite } from '../../../core/models/specialite.model';

@Component({
    selector: 'app-rh-encadrant-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rh-encadrant-list.component.html',
    styleUrls: ['./rh-encadrant-list.component.css']
})
export class RhEncadrantListComponent implements OnInit {
    encadrants = signal<Encadrant[]>([]);
    filteredEncadrants = signal<Encadrant[]>([]);
    departements = signal<Departement[]>([]);
    allSpecialites = signal<Specialite[]>([]);
    isLoading = signal(false);
    searchTerm = '';

    // Filtres
    filterDepartementId: string = '';
    filterSpecialiteId: string = '';

    // Detail modal
    showDetail = signal(false);
    selectedEncadrant: Encadrant | null = null;

    // Toast
    toastMessage = signal<string | null>(null);
    toastType = signal<'success' | 'error'>('success');

    constructor(
        private encadrantService: EncadrantService,
        private departementService: DepartementService,
        private specialiteService: SpecialiteService
    ) { }

    ngOnInit(): void {
        this.loadEncadrants();
        this.loadDepartements();
        this.loadAllSpecialites();
    }

    loadDepartements(): void {
        this.departementService.listerActifs().subscribe({
            next: (data) => this.departements.set(data),
            error: () => this.showToast('Erreur lors du chargement des départements', 'error')
        });
    }

    loadAllSpecialites(): void {
        this.specialiteService.lister().subscribe({
            next: (data: Specialite[]) => this.allSpecialites.set(data),
            error: () => this.showToast('Erreur lors du chargement des spécialités', 'error')
        });
    }

    loadEncadrants(): void {
        this.isLoading.set(true);
        this.encadrantService.listerActifs().subscribe({
            next: (data) => {
                this.encadrants.set(data);
                this.applyFilter();
                this.isLoading.set(false);
            },
            error: () => {
                this.showToast('Erreur lors du chargement des encadrants', 'error');
                this.isLoading.set(false);
            }
        });
    }

    applyFilter(): void {
        const term = this.searchTerm.toLowerCase().trim();
        let filtered = this.encadrants().filter(e =>
            e.nom.toLowerCase().includes(term) ||
            e.prenom.toLowerCase().includes(term) ||
            e.email.toLowerCase().includes(term)
        );

        if (this.filterDepartementId) {
            filtered = filtered.filter(e => e.departementId?.toString() === this.filterDepartementId);
        }

        if (this.filterSpecialiteId) {
            filtered = filtered.filter(e =>
                e.specialites?.some(s => s.id?.toString() === this.filterSpecialiteId)
            );
        }

        this.filteredEncadrants.set(filtered);
    }

    onFilterDepartementChange(): void {
        this.applyFilter();
    }

    onFilterSpecialiteChange(): void {
        this.applyFilter();
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.filterDepartementId = '';
        this.filterSpecialiteId = '';
        this.applyFilter();
    }

    onSearchChange(): void {
        this.applyFilter();
    }

    // Detail modal
    openDetailModal(encadrant: Encadrant): void {
        this.selectedEncadrant = encadrant;
        this.showDetail.set(true);
    }

    closeDetailModal(): void {
        this.showDetail.set(false);
        this.selectedEncadrant = null;
    }

    // Toast
    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(null), 3500);
    }

    get activeCount(): number {
        return this.encadrants().filter(e => e.actif).length;
    }

    get totalCapacity(): number {
        return this.encadrants().filter(e => e.actif).reduce((sum, e) => sum + e.capaciteMax, 0);
    }

    get usedCapacity(): number {
        return this.encadrants().filter(e => e.actif).reduce((sum, e) => sum + e.capaciteActuelle, 0);
    }

    getCapacityPercentage(encadrant: Encadrant): number {
        if (encadrant.capaciteMax === 0) return 0;
        return Math.round((encadrant.capaciteActuelle / encadrant.capaciteMax) * 100);
    }

    getCapacityColor(encadrant: Encadrant): string {
        const pct = this.getCapacityPercentage(encadrant);
        if (pct >= 100) return 'bg-red-500';
        if (pct >= 75) return 'bg-amber-500';
        return 'bg-emerald-500';
    }
}

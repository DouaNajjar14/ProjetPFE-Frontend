import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DepartementService } from '../../../core/services/departement.service';
import { SpecialiteService } from '../../../core/services/specialite.service';
import { Departement } from '../../../core/models/departement.model';

@Component({
    selector: 'app-rh-departement-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rh-departement-list.component.html',
    styleUrls: ['./rh-departement-list.component.css']
})
export class RhDepartementListComponent implements OnInit {
    departements = signal<Departement[]>([]);
    filteredDepartements = signal<Departement[]>([]);
    isLoading = signal(false);
    searchTerm = '';

    // Detail modal
    showDetail = signal(false);
    selectedDepartement: Departement | null = null;

    // Toast
    toastMessage = signal<string | null>(null);
    toastType = signal<'success' | 'error'>('success');

    constructor(
        private departementService: DepartementService,
        private specialiteService: SpecialiteService
    ) { }

    ngOnInit(): void {
        this.loadDepartements();
    }

    loadDepartements(): void {
        this.isLoading.set(true);
        this.departementService.listerActifs().subscribe({
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
        const requests = depts.map(d => this.specialiteService.listerParDepartement(d.id));
        if (requests.length === 0) return;

        forkJoin(requests).subscribe({
            next: (results) => {
                const updatedDepts = this.departements().map((dept, idx) => {
                    return { ...dept, specialites: results[idx] };
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

    // Detail modal
    openDetailModal(dept: Departement): void {
        this.selectedDepartement = dept;
        this.showDetail.set(true);
    }

    closeDetailModal(): void {
        this.showDetail.set(false);
        this.selectedDepartement = null;
    }

    // Toast
    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(null), 3500);
    }

    get totalStagiaires(): number {
        return this.departements().reduce((sum, d) => sum + (d.nombreStagiairesActuel || 0), 0);
    }

    get totalEncadrants(): number {
        return this.departements().reduce((sum, d) => sum + (d.nombreEncadrantsActuel || 0), 0);
    }
}

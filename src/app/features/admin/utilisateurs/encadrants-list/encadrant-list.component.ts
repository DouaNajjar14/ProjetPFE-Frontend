import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncadrantService } from '../../../../core/services/encadrant.service';
import { DepartementService } from '../../../../core/services/departement.service';
import { SpecialiteService } from '../../../../core/services/specialite.service';
import { CompetenceService } from '../../../../core/services/competence.service';
import { Encadrant, EncadrantRequest, EncadrantUpdateRequest } from '../../../../core/models/encadrant.model';
import { Departement } from '../../../../core/models/departement.model';
import { Specialite } from '../../../../core/models/specialite.model';
import { Competence } from '../../../../core/models/competence.model';

@Component({
    selector: 'app-encadrant-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './encadrant-list.component.html',
    styleUrls: ['./encadrant-list.component.css']
})
export class EncadrantListComponent implements OnInit {
    encadrants = signal<Encadrant[]>([]);
    filteredEncadrants = signal<Encadrant[]>([]);
    departements = signal<Departement[]>([]);
    allSpecialites = signal<Specialite[]>([]);
    availableSpecialites = signal<Specialite[]>([]);
    availableCompetences = signal<Competence[]>([]);
    isLoading = signal(false);
    searchTerm = '';
    activeFilter: 'actifs' | 'archives' | 'tous' = 'actifs';

    // Filtres
    filterDepartementId: string = '';
    filterSpecialiteId: string = '';

    // Modal
    showModal = signal(false);
    showConfirm = signal(false);
    showDetail = signal(false);
    modalMode: 'create' | 'edit' = 'create';
    editingEncadrant: Encadrant | null = null;
    selectedEncadrant: Encadrant | null = null;
    modalError = signal<string | null>(null);
    isSaving = signal(false);
    confirmEncadrant: Encadrant | null = null;
    showPassword = false;

    // Form fields
    formNom = '';
    formPrenom = '';
    formEmail = '';
    formTel = '';
    formMotDePasse = '';
    formCapaciteMax = 5;
    formDepartementId = '';
    formSpecialiteIds: number[] = [];
    formCompetenceIds: number[] = [];

    // Validation touched state
    formTouched: Record<string, boolean> = {};

    // Toast
    toastMessage = signal<string | null>(null);
    toastType = signal<'success' | 'error'>('success');

    constructor(
        private encadrantService: EncadrantService,
        private departementService: DepartementService,
        private specialiteService: SpecialiteService,
        private competenceService: CompetenceService
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
        const obs =
            this.activeFilter === 'actifs' ? this.encadrantService.listerActifs() :
                this.activeFilter === 'archives' ? this.encadrantService.listerArchives() :
                    this.encadrantService.listerTous();

        obs.subscribe({
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

        // Filtre par département
        if (this.filterDepartementId) {
            filtered = filtered.filter(e => e.departementId?.toString() === this.filterDepartementId);
        }

        // Filtre par spécialité
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

    setFilter(filter: 'actifs' | 'archives' | 'tous'): void {
        this.activeFilter = filter;
        this.loadEncadrants();
    }

    openCreateModal(): void {
        this.modalMode = 'create';
        this.resetForm();
        this.editingEncadrant = null;
        this.modalError.set(null);
        this.showModal.set(true);
    }

    openEditModal(encadrant: Encadrant): void {
        this.modalMode = 'edit';
        this.formNom = encadrant.nom;
        this.formPrenom = encadrant.prenom;
        this.formEmail = encadrant.email;
        this.formTel = encadrant.tel || '';
        this.formDepartementId = encadrant.departementId || '';
        this.formCapaciteMax = encadrant.capaciteMax;
        this.formMotDePasse = '';
        this.formSpecialiteIds = encadrant.specialites?.map(s => s.id) || [];
        this.formCompetenceIds = encadrant.competences?.map(c => c.id) || [];
        this.editingEncadrant = encadrant;
        this.modalError.set(null);

        // Load available specialites for this department
        if (this.formDepartementId) {
            this.specialiteService.listerParDepartement(this.formDepartementId).subscribe({
                next: (data) => {
                    this.availableSpecialites.set(data);
                    // Then load available competences for selected specialites
                    if (this.formSpecialiteIds.length > 0) {
                        this.loadCompetencesForSpecialites();
                    }
                },
                error: () => this.availableSpecialites.set([])
            });
        }

        this.showModal.set(true);
    }

    private loadCompetencesForSpecialites(): void {
        const allCompetences: Competence[] = [];
        let loadedCount = 0;

        this.formSpecialiteIds.forEach(specId => {
            this.competenceService.listerParSpecialite(specId).subscribe({
                next: (data) => {
                    allCompetences.push(...data);
                    loadedCount++;
                    if (loadedCount === this.formSpecialiteIds.length) {
                        const uniqueCompetences = allCompetences.filter(
                            (comp, index, self) => index === self.findIndex(c => c.id === comp.id)
                        );
                        this.availableCompetences.set(uniqueCompetences);
                    }
                },
                error: () => {
                    loadedCount++;
                    if (loadedCount === this.formSpecialiteIds.length) {
                        const uniqueCompetences = allCompetences.filter(
                            (comp, index, self) => index === self.findIndex(c => c.id === comp.id)
                        );
                        this.availableCompetences.set(uniqueCompetences);
                    }
                }
            });
        });
    }

    closeModal(): void {
        this.showModal.set(false);
        this.resetForm();
        this.editingEncadrant = null;
        this.modalError.set(null);
    }

    resetForm(): void {
        this.formNom = '';
        this.formPrenom = '';
        this.formEmail = '';
        this.formTel = '';
        this.formMotDePasse = '';
        this.formCapaciteMax = 5;
        this.formDepartementId = '';
        this.formSpecialiteIds = [];
        this.formCompetenceIds = [];
        this.availableSpecialites.set([]);
        this.availableCompetences.set([]);
        this.showPassword = false;
        this.formTouched = {};
    }

    // ═══════ VALIDATION METHODS ═══════
    touchField(field: string): void {
        this.formTouched[field] = true;
    }

    markAllTouched(): void {
        ['nom', 'prenom', 'email', 'tel', 'departement'].forEach(f => this.formTouched[f] = true);
    }

    isFieldInvalid(field: string): boolean {
        if (!this.formTouched[field]) return false;
        return !!this.getFieldError(field);
    }

    getFieldError(field: string): string | null {
        if (!this.formTouched[field]) return null;
        switch (field) {
            case 'nom':
                if (!this.formNom.trim()) return 'Le nom est obligatoire';
                if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(this.formNom.trim())) return 'Le nom doit contenir uniquement des lettres';
                if (this.formNom.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
                if (this.formNom.trim().length > 50) return 'Le nom ne doit pas dépasser 50 caractères';
                return null;
            case 'prenom':
                if (!this.formPrenom.trim()) return 'Le prénom est obligatoire';
                if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(this.formPrenom.trim())) return 'Le prénom doit contenir uniquement des lettres';
                if (this.formPrenom.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
                if (this.formPrenom.trim().length > 50) return 'Le prénom ne doit pas dépasser 50 caractères';
                return null;
            case 'email':
                if (!this.formEmail.trim()) return 'L\'email est obligatoire';
                if (!/^[a-zA-Z0-9._%+-]+@ooredoo\.tn$/i.test(this.formEmail.trim())) return 'L\'email doit être au format xxx@ooredoo.tn';
                return null;
            case 'tel':
                if (this.formTel.trim()) {
                    const telClean = this.formTel.replace(/[\s\-\.+]/g, '');
                    // Remove 216 prefix if present
                    const telDigits = telClean.replace(/^216/, '');
                    if (!/^\d{8}$/.test(telDigits)) return 'Le téléphone doit contenir exactement 8 chiffres';
                    if (!/^[2459]\d{7}$/.test(telDigits)) return 'Le téléphone doit commencer par 2, 4, 5 ou 9';
                }
                return null;
            case 'departement':
                if (!this.formDepartementId) return 'Le département est obligatoire';
                return null;
            default:
                return null;
        }
    }

    hasFormErrors(): boolean {
        const fields = ['nom', 'prenom', 'email', 'tel', 'departement'];
        return fields.some(f => {
            const tempTouched = this.formTouched[f];
            this.formTouched[f] = true;
            const hasError = !!this.getFieldError(f);
            this.formTouched[f] = tempTouched;
            return hasError;
        });
    }

    // ═══════ AUTO-GENERATE PASSWORD ═══════
    generatePassword(): string {
        const prenom = this.formPrenom.trim().toLowerCase().replace(/[^a-z]/g, '');
        const nom = this.formNom.trim().toLowerCase().replace(/[^a-z]/g, '');

        // Get 3 chars from prenom (pad with 'x' if shorter)
        const prenomPart = (prenom + 'xxx').substring(0, 3);
        // Get 3 chars from nom (pad with 'x' if shorter)
        const nomPart = (nom + 'xxx').substring(0, 3);

        // Random digit
        const digit = Math.floor(Math.random() * 10).toString();

        // Random symbol
        const symbols = '!@#$%&*?';
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];

        // Combine: First char uppercase
        const password = prenomPart.charAt(0).toUpperCase() + prenomPart.substring(1) + nomPart + digit + symbol;

        return password;
    }

    onNameChange(): void {
        if (this.modalMode === 'create' && this.formPrenom.trim() && this.formNom.trim()) {
            this.formMotDePasse = this.generatePassword();
        }
    }

    // Cascading selection handlers
    onDepartementChange(): void {
        // Reset specialités et compétences
        this.formSpecialiteIds = [];
        this.formCompetenceIds = [];
        this.availableCompetences.set([]);

        if (this.formDepartementId) {
            this.specialiteService.listerParDepartement(this.formDepartementId).subscribe({
                next: (data) => this.availableSpecialites.set(data),
                error: () => this.availableSpecialites.set([])
            });
        } else {
            this.availableSpecialites.set([]);
        }
    }

    onSpecialitesChange(): void {
        // Reset compétences
        this.formCompetenceIds = [];
        this.availableCompetences.set([]);

        if (this.formSpecialiteIds.length > 0) {
            // Load competences for all selected specialites
            const allCompetences: Competence[] = [];
            let loadedCount = 0;

            this.formSpecialiteIds.forEach(specId => {
                this.competenceService.listerParSpecialite(specId).subscribe({
                    next: (data) => {
                        allCompetences.push(...data);
                        loadedCount++;
                        if (loadedCount === this.formSpecialiteIds.length) {
                            // Remove duplicates by ID
                            const uniqueCompetences = allCompetences.filter(
                                (comp, index, self) => index === self.findIndex(c => c.id === comp.id)
                            );
                            this.availableCompetences.set(uniqueCompetences);
                        }
                    },
                    error: () => {
                        loadedCount++;
                        if (loadedCount === this.formSpecialiteIds.length) {
                            const uniqueCompetences = allCompetences.filter(
                                (comp, index, self) => index === self.findIndex(c => c.id === comp.id)
                            );
                            this.availableCompetences.set(uniqueCompetences);
                        }
                    }
                });
            });
        }
    }

    toggleSpecialite(specId: number): void {
        const index = this.formSpecialiteIds.indexOf(specId);
        if (index > -1) {
            this.formSpecialiteIds.splice(index, 1);
        } else {
            this.formSpecialiteIds.push(specId);
        }
        this.onSpecialitesChange();
    }

    toggleCompetence(compId: number): void {
        const index = this.formCompetenceIds.indexOf(compId);
        if (index > -1) {
            this.formCompetenceIds.splice(index, 1);
        } else {
            this.formCompetenceIds.push(compId);
        }
    }

    isSpecialiteSelected(specId: number): boolean {
        return this.formSpecialiteIds.includes(specId);
    }

    isCompetenceSelected(compId: number): boolean {
        return this.formCompetenceIds.includes(compId);
    }

    saveModal(): void {
        // Mark all fields as touched to show errors
        this.markAllTouched();

        // Check for validation errors
        if (this.hasFormErrors()) {
            this.modalError.set('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        if (this.formCapaciteMax < 1) {
            this.modalError.set('La capacité maximale doit être au moins 1');
            return;
        }

        this.isSaving.set(true);
        this.modalError.set(null);

        if (this.modalMode === 'create') {
            // Auto-generate password if not already done
            if (!this.formMotDePasse.trim()) {
                this.formMotDePasse = this.generatePassword();
            }
            const request: EncadrantRequest = {
                nom: this.formNom.trim(),
                prenom: this.formPrenom.trim(),
                email: this.formEmail.trim(),
                tel: this.formTel.trim(),
                motDePasse: this.formMotDePasse,
                capaciteMax: this.formCapaciteMax,
                departementId: this.formDepartementId,
                specialiteIds: this.formSpecialiteIds,
                competenceIds: this.formCompetenceIds
            };
            this.encadrantService.creer(request).subscribe({
                next: () => {
                    this.showToast('Encadrant créé avec succès', 'success');
                    this.closeModal();
                    this.loadEncadrants();
                    this.isSaving.set(false);
                },
                error: (err) => {
                    console.error('Erreur création encadrant:', err);
                    const errorMsg = err.error?.message || err.error?.errors?.join(', ') || JSON.stringify(err.error) || 'Erreur lors de la création';
                    this.modalError.set(errorMsg);
                    this.isSaving.set(false);
                }
            });
        } else {
            const editId = this.editingEncadrant!.id;
            const request: EncadrantUpdateRequest = {
                nom: this.formNom.trim(),
                prenom: this.formPrenom.trim(),
                email: this.formEmail.trim(),
                tel: this.formTel.trim(),
                capaciteMax: this.formCapaciteMax,
                departementId: this.formDepartementId,
                specialiteIds: this.formSpecialiteIds,
                competenceIds: this.formCompetenceIds
            };
            this.encadrantService.modifier(editId, request).subscribe({
                next: (updatedEncadrant) => {
                    // Update in place instead of reloading
                    const updated = this.encadrants().map(e =>
                        e.id === editId ? updatedEncadrant : e
                    );
                    this.encadrants.set(updated);
                    this.applyFilter();
                    this.showToast('Encadrant modifié avec succès', 'success');
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

    // Detail view
    openDetailModal(encadrant: Encadrant): void {
        this.selectedEncadrant = encadrant;
        this.showDetail.set(true);
    }

    closeDetailModal(): void {
        this.showDetail.set(false);
        this.selectedEncadrant = null;
    }

    editFromDetail(): void {
        if (this.selectedEncadrant) {
            const encadrant = this.selectedEncadrant;
            this.closeDetailModal();
            this.openEditModal(encadrant);
        }
    }

    // Archive/Unarchive
    openArchiveConfirm(encadrant: Encadrant): void {
        this.confirmEncadrant = encadrant;
        this.showConfirm.set(true);
    }

    closeConfirm(): void {
        this.showConfirm.set(false);
        this.confirmEncadrant = null;
    }

    confirmArchive(): void {
        if (!this.confirmEncadrant) return;

        const action = this.confirmEncadrant.actif
            ? this.encadrantService.archiver(this.confirmEncadrant.id)
            : this.encadrantService.desarchiver(this.confirmEncadrant.id);

        const label = this.confirmEncadrant.actif ? 'archivé' : 'désarchivé';

        action.subscribe({
            next: () => {
                this.showToast(`Encadrant ${label} avec succès`, 'success');
                this.closeConfirm();
                this.loadEncadrants();
            },
            error: () => {
                this.showToast(`Erreur lors de l'opération`, 'error');
                this.closeConfirm();
            }
        });
    }

    // Toast
    showToast(message: string, type: 'success' | 'error'): void {
        this.toastMessage.set(message);
        this.toastType.set(type);
        setTimeout(() => this.toastMessage.set(null), 3500);
    }

    formatDate(dateStr: string): string {
        if (!dateStr) return '—';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    get activeCount(): number {
        return this.encadrants().filter(e => e.actif).length;
    }

    get archivedCount(): number {
        return this.encadrants().filter(e => !e.actif).length;
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

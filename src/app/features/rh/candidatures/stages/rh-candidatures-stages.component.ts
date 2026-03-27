import { Component, Input, Output, OnInit, EventEmitter, Signal, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Candidature } from '../../../../core/models/candidature.model';
import { AgentRHService } from '../../../../core/services/agent-rh.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-rh-candidatures-stages',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rh-candidatures-stages.component.html',
    styleUrls: ['./rh-candidatures-stages.component.css']
})
export class RhCandidaturesStagesComponent implements OnInit {
    @Input() candidatures: Signal<Candidature[]> = signal([]);
    @Input() stats: any = null;
    @Output() candidaturesLoaded = new EventEmitter<void>();

    filteredCandidatures = signal<any[]>([]);
    localStats = signal({ total: 0, attente: 0, presel: 0, accepte: 0, refuse: 0 });
    selected: any = null;
    curPill: string = 'all';
    stageTypeFilter: string = '';
    statusFilter: string = 'all'; // En attente, PRESELECTIONNE, ACCEPTE, REJETE, or 'all'
    levelFilter: string = ''; // Filter by level (L1, L2, L3, M1, M2, etc.)
    searchQuery: string = '';

    // Properties for template
    openPdf: SafeResourceUrl | '' = '';
    pdfLoading: boolean = false;
    currentDocType: string = ''; // Track which document type is being viewed
    progColor: string = 'green';
    progressPct: number = 0;
    progGradient: string = 'linear-gradient(90deg, #059669, #34d399)';
    steps: any[] = [];

    // Modal for date entry
    showAcceptModal = signal(false);
    dateEntretienInput: string = '';
    targetStatut: any = null;

    // Toast notifications
    toastMessage = signal<string | null>(null);
    toastType = signal<'success' | 'error'>('success');
    private toastTimer: any;

    // Modal Avertissement Doublons
    showDuplicateWarningModal = signal(false);
    duplicateCandidatures = signal<Candidature[]>([]);
    private pendingConfirmationAfterWarning: boolean = false;
    private fullCandidature: Candidature | null = null;

    GRD = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

    constructor(private agentRHService: AgentRHService, private http: HttpClient, private sanitizer: DomSanitizer) {
        effect(() => {
            // Reset to list view when section changes
            this.selected = null;

            const cands = this.candidatures();

            // Filter for STAGES (INITIATION, PERFECTIONNEMENT, ETE)
            const stagesCands = cands.filter(c =>
                c.typeStage === 'INITIATION' ||
                c.typeStage === 'PERFECTIONNEMENT' ||
                c.typeStage === 'ETE'
            );

            const mapped = stagesCands.map(c => this.mapCandidature(c));

            // Apply all filters
            const filtered = this.applyAllFilters(mapped);
            this.filteredCandidatures.set(filtered);

            // Calculate local stats
            const stats = {
                total: stagesCands.length,
                attente: stagesCands.filter(c => c.statut === 'EN_ATTENTE').length,
                presel: stagesCands.filter(c => c.statut === 'PRESELECTIONNE').length,
                accepte: stagesCands.filter(c => c.statut === 'ACCEPTE').length,
                refuse: stagesCands.filter(c => c.statut === 'REJETE').length
            };
            this.localStats.set(stats);
        }, { allowSignalWrites: true });
    }

    private applyAllFilters(candidates: any[]): any[] {
        return candidates.filter(c => {
            // Filter by stage type
            if (this.stageTypeFilter && c.type !== this.stageTypeFilter) {
                return false;
            }

            // Filter by status
            if (this.statusFilter !== 'all') {
                if (this.statusFilter === 'EN_ATTENTE' && c.statut !== 'EN_ATTENTE') return false;
                if (this.statusFilter === 'PRESELECTIONNE' && c.statut !== 'PRESELECTIONNE') return false;
                if (this.statusFilter === 'ACCEPTE' && c.statut !== 'ACCEPTE') return false;
                if (this.statusFilter === 'REJETE' && c.statut !== 'REJETE') return false;
            }

            // Filter by level
            if (this.levelFilter && this.levelFilter !== 'all' && !c.niv.includes(this.levelFilter)) {
                return false;
            }

            // Filter by search query
            if (this.searchQuery.trim()) {
                const query = this.searchQuery.toLowerCase();
                return (
                    c.name.toLowerCase().includes(query) ||
                    c.univ.toLowerCase().includes(query) ||
                    c.email.toLowerCase().includes(query) ||
                    c.tel.toLowerCase().includes(query) ||
                    c.niv.toLowerCase().includes(query) ||
                    c.type.toLowerCase().includes(query)
                );
            }

            return true;
        });
    }

    ngOnInit(): void {
        // Reset to list view when component loads
        this.selected = null;
    }

    private mapCandidature(c: Candidature): any {
        const gradColors = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
        const colorIdx = (c.candidat1.nom.charCodeAt(0) + c.candidat1.prenom.charCodeAt(0)) % gradColors.length;

        const statClassMap: { [key: string]: string } = {
            'EN_ATTENTE': 'wait',
            'PRESELECTIONNE': 'sel',
            'ACCEPTE': 'ok',
            'REJETE': 'reject'
        };

        // Extract abbreviation from university name (text in parentheses)
        const univName = c.candidat1.universiteNom || '';
        const abbrevMatch = univName.match(/\(([^)]+)\)/);
        const univAbrev = abbrevMatch ? abbrevMatch[1] : univName;

        // Map niveau académique to full text
        const niveauMap: { [key: string]: string } = {
            'L1': '1ère année Licence',
            'L2': '2ème année Licence',
            'L3': '3ème année Licence',
            'M1': '1ère année Master',
            'M2': '2ème année Master',
            'CY1': '1ère année cycle Ingénieur',
            'CY2': '2ème année cycle Ingénieur',
            'CY3': '3ème année cycle Ingénieur'
        };

        // Get full niveau text
        const niveauComplet = niveauMap[c.candidat1.niveauAcademique] || c.candidat1.niveauAcademique || 'N/A';

        // Determine duration based on stage type
        let duree = '0 mois';
        switch (c.typeStage) {
            case 'INITIATION':
                duree = '1 mois';
                break;
            case 'PERFECTIONNEMENT':
                duree = '1 mois';
                break;
            case 'ETE':
                duree = '1 à 2 mois';
                break;
        }

        return {
            id: c.id,
            candidatId: c.candidat1.id,
            initials: (c.candidat1.prenom[0] || '') + (c.candidat1.nom[0] || ''),
            name: `${c.candidat1.prenom} ${c.candidat1.nom}`,
            univ: univAbrev,
            email: c.candidat1.email,
            tel: c.candidat1.tel || 'N/A',
            phone: c.candidat1.tel,
            date: c.dateDepot ? new Date(c.dateDepot).toLocaleDateString('fr-FR') : 'N/A',
            type: c.typeStage || 'N/A',
            statut: c.statut,
            av: gradColors[colorIdx],
            avStyle: '',
            duree: duree,
            niv: niveauComplet,
            dept: 'N/A',
            periode: c.typeStage || 'N/A',
            statClass: statClassMap[c.statut] || ''
        };
    }

    setPill(pill: string): void {
        this.curPill = pill;
        this.statusFilter = pill === 'all' ? 'all' : pill;
        this.updateFilters();
    }

    setFilterStageType(type: string): void {
        this.stageTypeFilter = type; // Direct assignment, no toggle
        this.updateFilters();
    }

    setStatusFilter(status: string): void {
        this.statusFilter = status;
        this.curPill = status === 'all' ? 'all' : status;
        this.updateFilters();
    }

    setLevelFilter(level: string): void {
        this.levelFilter = level;
        this.updateFilters();
    }

    private updateFilters(): void {
        // Trigger re-filtering
        const mapped = this.candidatures()
            .filter(c => c.typeStage === 'INITIATION' || c.typeStage === 'PERFECTIONNEMENT' || c.typeStage === 'ETE')
            .map(c => this.mapCandidature(c));
        const filtered = this.applyAllFilters(mapped);
        this.filteredCandidatures.set(filtered);
    }

    getCountByStageType(type: string): number {
        const cands = this.candidatures();
        return cands.filter(c => c.typeStage === type).length;
    }

    openDetail(c: any): void {
        this.selected = c;
        this.fullCandidature = this.candidatures().find(cand => cand.id === c.id) || null;
        this.updateProgressBar(c.statut);
    }

    private updateProgressBar(statut: string): void {
        // Define the workflow steps
        const allSteps = ['Reçu', 'Présélec.', 'Entretien', 'Accepté'];

        // Map status to steps completion
        switch (statut) {
            case 'EN_ATTENTE':
                this.steps = ['done', 'idle', 'idle', 'idle'];
                this.progressPct = 25;
                this.progColor = '#d97706'; // yellow
                this.progGradient = 'linear-gradient(90deg, #d97706, #f59e0b)';
                break;
            case 'PRESELECTIONNE':
                this.steps = ['done', 'active', 'idle', 'idle'];
                this.progressPct = 50;
                this.progColor = '#d97706'; // yellow for Présélec
                this.progGradient = 'linear-gradient(90deg, #059669, #d97706)';
                break;
            case 'ACCEPTE':
                this.steps = ['done', 'done', 'done', 'done'];
                this.progressPct = 100;
                this.progColor = '#059669'; // green
                this.progGradient = 'linear-gradient(90deg, #059669, #34d399)';
                break;
            case 'REJETE':
                this.steps = ['done', 'reject', 'idle', 'idle'];
                this.progressPct = 0;
                this.progColor = '#dc2626'; // red
                this.progGradient = 'linear-gradient(90deg, #dc2626, #ef4444)';
                break;
            default:
                this.steps = ['idle', 'idle', 'idle', 'idle'];
                this.progressPct = 0;
                this.progColor = '#6b7280'; // gray
                this.progGradient = 'linear-gradient(90deg, #6b7280, #9ca3af)';
        }
    }

    goBack(): void {
        this.selected = null;
    }

    getTypeClass(type: string): string {
        // Transform type to normal case for display
        const displayText: { [key: string]: string } = {
            'INITIATION': 'Initiation',
            'PERFECTIONNEMENT': 'Perfectionnement',
            'ETE': 'Été'
        };
        const classMap: { [key: string]: string } = {
            'INITIATION': 'bg-blue',
            'PERFECTIONNEMENT': 'bg-purple',
            'ETE': 'bg-green'
        };
        // Store the display text back to the object for use in template
        return classMap[type] || 'bg-gray-100';
    }

    getLevelClass(level: string): string {
        // Returns a class for the level badge
        return 'bg-gray';
    }

    getBadgeClass(statut: string): string {
        const classMap: { [key: string]: string } = {
            'EN_ATTENTE': 'bg-yellow-100 text-yellow-800',
            'PRESELECTIONNE': 'bg-purple-100 text-purple-700',
            'ACCEPTE': 'bg-green-100 text-green-700',
            'REJETE': 'bg-red-100 text-red-700'
        };
        return classMap[statut] || 'bg-gray-100 text-gray-700';
    }

    getFormattedType(type: string): string {
        const typeMap: { [key: string]: string } = {
            'INITIATION': 'Initiation',
            'PERFECTIONNEMENT': 'Perfectionnement',
            'ETE': 'Été'
        };
        return typeMap[type] || type;
    }

    getFormattedStatut(statut: string): string {
        const statutMap: { [key: string]: string } = {
            'EN_ATTENTE': 'En attente',
            'PRESELECTIONNE': 'Présélectionné',
            'ACCEPTE': 'Accepté',
            'REJETE': 'Rejeté'
        };
        return statutMap[statut] || statut;
    }

    getNiv(niv: string): string {
        return niv || 'N/A';
    }

    getUniv(univ: string): string {
        return univ || 'N/A';
    }

    togglePdf(id: string): void {
        this.openPdf = this.openPdf === id ? '' : id;
    }

    applySearch(query: string): void {
        this.searchQuery = query;
        this.updateFilters();
    }

    canPreselectionner(statut: string): boolean {
        return statut === 'EN_ATTENTE';
    }

    canEntretien(statut: string): boolean {
        return statut === 'EN_ATTENTE' || statut === 'PRESELECTIONNE';
    }

    canAccepter(statut: string): boolean {
        return statut === 'EN_ATTENTE' || statut === 'PRESELECTIONNE';
    }

    canRefuser(statut: string): boolean {
        return statut !== 'REJETE' && statut !== 'ACCEPTE';
    }

    updateStatutWithModal(statut: 'PRESELECTIONNE' | 'ACCEPTE' | 'REJETE' | 'ENTRETIEN') {
        if (statut === 'ENTRETIEN' || statut === 'PRESELECTIONNE' || statut === 'ACCEPTE') {
            this.targetStatut = statut === 'ENTRETIEN' ? 'PRESELECTIONNE' : statut;
            this.dateEntretienInput = '';
            this.showAcceptModal.set(true);
        } else {
            this.updateStatut(statut);
        }
    }

    preselectionner(): void {
        this.updateStatutWithModal('PRESELECTIONNE');
    }

    accepter(): void {
        this.updateStatutWithModal('ACCEPTE');
    }

    rejeter(): void {
        this.updateStatut('REJETE');
    }

    confirmEntretien(): void {
        if (!this.dateEntretienInput || !this.selected) return;

        // Check for duplicate candidates
        const duplicates = this.findDuplicateCandidatures();
        if (duplicates.length > 0 && !this.pendingConfirmationAfterWarning) {
            this.duplicateCandidatures.set(duplicates);
            this.showDuplicateWarningModal.set(true);
            return;
        }

        this.pendingConfirmationAfterWarning = false;
        this.proceedWithConfirmation();
    }

    proceedWithConfirmation(): void {
        if (!this.dateEntretienInput || !this.selected) return;

        const id = this.selected.id;
        const isoDate = new Date(this.dateEntretienInput).toISOString();

        const req: any = this.targetStatut === 'ACCEPTE'
            ? { statut: 'ACCEPTE', dateDebut: isoDate }
            : { statut: 'PRESELECTIONNE', dateEntretien: isoDate };

        this.agentRHService.changerStatutCandidature(id, req).subscribe({
            next: (updated) => {
                this.selected.statut = updated.statut;
                this.selected.statClass = this.getStatutClass(updated.statut);
                this.updateProgressBar(updated.statut);
                this.showAcceptModal.set(false);
                this.showToast(
                    this.targetStatut === 'ACCEPTE' ? 'Candidature acceptée avec succès' : 'Entretien planifié avec succès',
                    'success'
                );
                // Reload candidatures
                this.candidaturesLoaded.emit();
            },
            error: () => this.showToast('Erreur lors de la mise à jour', 'error')
        });
    }

    findDuplicateCandidatures(): Candidature[] {
        const current = this.fullCandidature;
        if (!current) return [];

        console.log('=== DUPLICATE DETECTION START ===');
        console.log('Current candidature ID:', current.id);
        console.log('Current typeStage:', current.typeStage);
        console.log('Current candidat1:', {
            nom: current.candidat1?.nom,
            prenom: current.candidat1?.prenom,
            email: current.candidat1?.email,
            universiteNom: current.candidat1?.universiteNom
        });
        if (current.candidat2) {
            console.log('Current candidat2:', {
                nom: current.candidat2?.nom,
                prenom: current.candidat2?.prenom,
                email: current.candidat2?.email,
                universiteNom: current.candidat2?.universiteNom
            });
        }

        // Helper function to normalize strings (remove accents, spaces, lowercase)
        const normalize = (str: string) => {
            if (!str) return "";
            return str
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        };

        // Helper function to compare candidates (now including university)
        const isSameCandidat = (c1: any, c2: any) => {
            if (!c1 || !c2) return false;
            const sameNom = normalize(c1.nom) === normalize(c2.nom);
            const samePrenom = normalize(c1.prenom) === normalize(c2.prenom);
            const sameEmail = normalize(c1.email) === normalize(c2.email);
            const sameUniversite = normalize(c1.universiteNom) === normalize(c2.universiteNom);

            console.log(`Comparing: ${c1.nom} ${c1.prenom} (${c1.universiteNom}) vs ${c2.nom} ${c2.prenom} (${c2.universiteNom})`);
            console.log(`  - Nom match: ${sameNom}, Prenom match: ${samePrenom}, Email match: ${sameEmail}, Universite match: ${sameUniversite}`);

            return sameNom && samePrenom && sameEmail && sameUniversite;
        };

        const duplicates = this.candidatures().filter((c: Candidature) => {
            if (c.id === current.id) return false;

            const isDuplicate = (
                // Check if current.candidat1 matches any candidat in c
                (current.candidat1 && (
                    isSameCandidat(current.candidat1, c.candidat1) ||
                    isSameCandidat(current.candidat1, c.candidat2)
                )) ||
                // Check if current.candidat2 matches any candidat in c
                (current.candidat2 && (
                    isSameCandidat(current.candidat2, c.candidat1) ||
                    isSameCandidat(current.candidat2, c.candidat2)
                ))
            );

            if (isDuplicate) {
                console.log(`✓ DUPLICATE FOUND with candidature ${c.id} (${c.typeStage})`);
            }

            return isDuplicate;
        });

        console.log('Total duplicates found:', duplicates.length);
        console.log('Duplicate candidatures:', duplicates.map(d => ({ id: d.id, typeStage: d.typeStage })));
        console.log('=== DUPLICATE DETECTION END ===');

        return duplicates;
    }

    confirmDuplicateWarning() {
        this.pendingConfirmationAfterWarning = true;
        this.showDuplicateWarningModal.set(false);
        this.confirmEntretien();
    }

    cancelDuplicateWarning() {
        this.showDuplicateWarningModal.set(false);
        this.duplicateCandidatures.set([]);
        this.pendingConfirmationAfterWarning = false;
    }

    updateStatut(statut: string): void {
        if (!this.selected) return;

        const req: any = { statut };
        this.agentRHService.changerStatutCandidature(this.selected.id, req).subscribe({
            next: (updated) => {
                this.selected.statut = updated.statut;
                this.selected.statClass = this.getStatutClass(updated.statut);
                this.updateProgressBar(updated.statut);
                this.showToast('Statut mis à jour avec succès', 'success');
                // Reload candidatures
                this.candidaturesLoaded.emit();
            },
            error: () => this.showToast('Erreur lors de la mise à jour', 'error')
        });
    }

    getStatutClass(statut: string): string {
        const classMap: { [key: string]: string } = {
            'EN_ATTENTE': 'wait',
            'PRESELECTIONNE': 'sel',
            'ACCEPTE': 'ok',
            'REJETE': 'reject'
        };
        return classMap[statut] || 'wait';
    }

    showToast(msg: string, type: 'success' | 'error'): void {
        this.toastMessage.set(msg);
        this.toastType.set(type);
        if (this.toastTimer) clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => {
            this.toastMessage.set(null);
        }, 3800);
    }

    // Document viewing and downloading methods
    onViewDocument(docType: string): void {
        if (!this.selected || !this.selected.candidatId) return;

        const candidatId = this.selected.candidatId;
        const apiUrl = `${environment.apiUrl}/documents/candidatures/${candidatId}/${docType}/lecture`;

        this.pdfLoading = true;
        this.currentDocType = docType; // Track the document type being viewed

        this.http.get<any>(apiUrl).subscribe({
            next: (response) => {
                if (response && response.url) {
                    // Use the pre-signed URL directly from the backend
                    this.openPdf = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
                    this.pdfLoading = false;
                } else {
                    throw new Error('Invalid response format: missing URL');
                }
            },
            error: (err) => {
                console.error('Erreur lors de la récupération du document:', err);
                // Try alternate port if primary fails
                const altUrl = apiUrl.replace(':8080/api', ':8086/api');
                this.http.get<any>(altUrl).subscribe({
                    next: (response) => {
                        if (response && response.url) {
                            this.openPdf = this.sanitizer.bypassSecurityTrustResourceUrl(response.url);
                            this.pdfLoading = false;
                        }
                    },
                    error: (altErr) => {
                        this.pdfLoading = false;
                        console.error('Document not available:', altErr);
                        alert('Impossible de charger le document. Assurez-vous que le serveur est en cours d\'exécution.');
                    }
                });
            }
        });
    }

    // Load PDF bytes from URL for modification
    closePdfModal(): void {
        // Clear the pre-signed URL reference
        this.openPdf = '';
        this.currentDocType = '';
    }

    getPdfUrl(): SafeResourceUrl | '' {
        return this.openPdf;
    }

    onDownloadDocument(docType: string): void {
        if (!this.selected || !this.selected.candidatId) return;

        const candidatId = this.selected.candidatId;

        // Download original document from backend
        const apiUrl = `${environment.apiUrl}/documents/candidatures/${candidatId}/${docType}/telechargement`;

        this.http.get<any>(apiUrl).subscribe({
            next: (response) => {
                if (response && response.url) {
                    try {
                        const link = document.createElement('a');
                        link.href = response.url;

                        // Format filename with candidate name
                        let fileName = response.nomDocument;
                        if (!fileName) {
                            const candidatName = this.selected.name
                                ? this.selected.name.replace(/\s+/g, '_').toLowerCase()
                                : `candidat_${candidatId}`;
                            fileName = `${docType.toUpperCase()}_${candidatName}.pdf`;
                        } else if (!fileName.endsWith('.pdf')) {
                            fileName += '.pdf';
                        }

                        link.download = fileName;
                        link.style.display = 'none';
                        document.body.appendChild(link);

                        console.log(`📄 Downloading: ${fileName}`);
                        link.click();
                        document.body.removeChild(link);
                    } catch (err) {
                        console.error('❌ Error downloading PDF:', err);
                        alert('Erreur lors du téléchargement');
                    }
                }
            },
            error: (err) => {
                console.error('❌ HTTP Error:', err);
                alert('Impossible de télécharger le document');
            }
        });
    }
}

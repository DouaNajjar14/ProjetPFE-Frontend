import { Component, Input, Output, EventEmitter, OnInit, Signal, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Candidature, StatutCandidature, CandidatureUpdateRequest } from '../../../../core/models/candidature.model';
import { AgentRHService } from '../../../../core/services/agent-rh.service';
import { DocumentCandidatureService } from '../../../../core/services/document-candidature.service';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-rh-candidatures-pfe',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './rh-candidatures-pfe.component.html',
    styleUrls: ['./rh-candidatures-pfe.component.css']
})
export class RhCandidaturesPfeComponent implements OnInit {
    @Input() candidatures: Signal<Candidature[]> = signal([]);
    @Input() stats: any = null;
    @Input() searchQuery: string = '';
    @Output() candidaturesLoaded = new EventEmitter<void>();

    filteredCandidatures = signal<any[]>([]);
    localStats = signal({ total: 0, attente: 0, presel: 0, accepte: 0, refuse: 0 });
    filtered: any[] = [];
    selected: any = null;
    curPill: string = 'all';
    filterStatut: StatutCandidature | 'ENTRETIEN' | '' = '';
    levelFilter: string = ''; // Filter by academic level
    departementFilter: string = ''; // Filter by department/subject

    // PDF viewer state
    openPdf: SafeResourceUrl | '' = '';
    pdfLoading: boolean = false;
    currentDocType: string = ''; // Track which document type is being viewed

    // Progress related properties
    progColor: string = 'red';
    progressPct: number = 0;
    progGradient: any = {};
    steps: any[] = [];

    // Modal Detail
    showDetail = signal(false);
    selectedCandidature = signal<Candidature | null>(null);

    // Modal Acceptation / Entretien
    showAcceptModal = signal(false);
    dateEntretienInput: string = '';
    targetStatut: StatutCandidature | null = null;

    // Modal Avertissement Doublons
    showDuplicateWarningModal = signal(false);
    duplicateCandidatures = signal<Candidature[]>([]);
    private fullCandidature: Candidature | null = null;
    private pendingConfirmationAfterWarning: boolean = false;

    // Document Modals
    showDocumentViewerModal = signal(false);
    documentViewerCandidatId = signal<string | null>(null);
    documentViewerType = signal<'CV' | 'LETTRE_MOTIVATION'>('CV');

    showDocumentUploaderModal = signal(false);
    documentUploaderCandidatId = signal<string | null>(null);
    documentUploaderType = signal<'CV' | 'LETTRE_MOTIVATION'>('CV');

    // Toast
    toastMessage = signal<string | null>(null);
    toastType = signal<'success' | 'error'>('success');
    private toastTimer: any;

    // Constants for template
    GRD = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];

    // Reference to subjects section for scroll navigation
    @ViewChild('subjectsSection') subjectsSection: ElementRef | undefined;

    constructor(
        private agentRHService: AgentRHService,
        private documentService: DocumentCandidatureService,
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private router: Router
    ) {
        // Watch for changes in candidatures and update filtered list
        effect(() => {
            // Reset to list view when section changes
            this.selected = null;

            const cands = this.candidatures();
            console.log('Effect triggered - PFE candidatures:', cands);

            // Filter for PFE only
            const pfeCands = cands.filter(c => c.typeStage === 'PFE');
            const mapped = pfeCands.map(c => this.mapCandidature(c));

            console.log('Filtered PFE candidatures:', mapped.length);
            this.filteredCandidatures.set(mapped as any);

            // Calculate local stats
            const stats = {
                total: pfeCands.length,
                attente: pfeCands.filter(c => c.statut === 'EN_ATTENTE').length,
                presel: pfeCands.filter(c => c.statut === 'PRESELECTIONNE').length,
                accepte: pfeCands.filter(c => c.statut === 'ACCEPTE').length,
                refuse: pfeCands.filter(c => c.statut === 'REJETE').length
            };
            this.localStats.set(stats);
        }, { allowSignalWrites: true });
    }

    private mapCandidature(c: Candidature): any {
        const gradColors = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7'];
        const colorIdx = (c.candidat1.nom.charCodeAt(0) + c.candidat1.prenom.charCodeAt(0)) % gradColors.length;

        const statusClassMap: { [key: string]: string } = {
            'EN_ATTENTE': 'wait',
            'PRESELECTIONNE': 'sel',
            'ACCEPTE': 'ok',
            'REJETE': 'reject'
        };

        return {
            id: c.id,
            candidatId: c.candidat1.id,
            candidat2Id: c.candidat2 ? c.candidat2.id : null,
            initials: (c.candidat1.prenom[0] || '') + (c.candidat1.nom[0] || ''),
            name: `${c.candidat1.prenom} ${c.candidat1.nom}`,
            univ: c.candidat1.universiteNom,
            niveau: c.candidat1.niveauAcademique,
            email: c.candidat1.email,
            tel: c.candidat1.tel,
            statut: c.statut,
            av: gradColors[colorIdx],
            avStyle: null,
            binome: c.estBinome,
            bInitials: c.candidat2 ? (c.candidat2.prenom[0] || '') + (c.candidat2.nom[0] || '') : null,
            bNom: c.candidat2 ? c.candidat2.nom : null,
            bPrenom: c.candidat2 ? c.candidat2.prenom : null,
            bUniv: c.candidat2 ? c.candidat2.universiteNom : null,
            bNiveau: c.candidat2 ? c.candidat2.niveauAcademique : null,
            bEmail: c.candidat2 ? c.candidat2.email : null,
            bTel: c.candidat2 ? c.candidat2.tel : null,
            date: new Date(c.dateDepot).toLocaleDateString('fr-FR'),
            dept1: c.sujetChoix1?.departementNom || '-',
            sujet1: c.sujetChoix1?.titre || '-',
            sujet1Id: c.sujetChoix1?.id || null,
            dureePfe: c.sujetChoix1?.dureeEnMois ? `${c.sujetChoix1.dureeEnMois} mois` : '6 mois',
            dept2: c.sujetChoix2?.departementNom || null,
            sujet2: c.sujetChoix2?.titre || null,
            sujet2Id: c.sujetChoix2?.id || null,
            type: c.estBinome ? 'Binôme' : 'Individuelle',
            dateEntretien: c.dateEntretien ? new Date(c.dateEntretien).toLocaleDateString('fr-FR') : null,
            dateDepot: c.dateDepot,
            statClass: statusClassMap[c.statut] || 'wait'
        };
    }

    ngOnInit(): void {
        // Reset to list view when component loads
        this.selected = null;
        console.log('PFE Component Init - Candidatures:', this.candidatures());
        this.filteredCandidatures.set(this.candidatures());
    }

    setFilterStatut(statut: StatutCandidature | 'ENTRETIEN' | '') {
        this.filterStatut = statut;
        this.applyFilters();
    }

    applySearch(val: string) {
        this.searchQuery = val;
        this.applyFilters();
    }

    setLevelFilter(level: string): void {
        this.levelFilter = level;
        this.applyFilters();
    }

    setDepartementFilter(dept: string): void {
        this.departementFilter = dept;
        this.applyFilters();
    }

    applyFilters() {
        let res = this.candidatures();

        // PFE filtering - show only PFE candidates
        res = res.filter(c => !c.typeStage || c.typeStage === 'PFE');

        // Statut filter (for PFE section)
        if (this.filterStatut) {
            if (this.filterStatut === 'ENTRETIEN') {
                res = res.filter(c => c.statut === 'PRESELECTIONNE' && !!c.dateEntretien);
            } else {
                res = res.filter(c => c.statut === this.filterStatut);
            }
        }

        // Level filter
        if (this.levelFilter) {
            res = res.filter(c => {
                const niveau = c.candidat1?.niveauAcademique || '';
                if (this.levelFilter === 'Licence') return niveau.startsWith('L');
                if (this.levelFilter === 'Master') return niveau.startsWith('M');
                if (this.levelFilter === 'CY') return niveau.startsWith('CY');
                return false;
            });
        }

        // Departement filter
        if (this.departementFilter) {
            res = res.filter(c => {
                return c.sujetChoix1?.departementNom === this.departementFilter ||
                    c.sujetChoix2?.departementNom === this.departementFilter;
            });
        }

        // Search filter
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            res = res.filter(c =>
                c.candidat1.nom.toLowerCase().includes(q) ||
                c.candidat1.prenom.toLowerCase().includes(q) ||
                c.candidat1.universiteNom.toLowerCase().includes(q) ||
                (c.candidat2 && (c.candidat2.nom.toLowerCase().includes(q) || c.candidat2.prenom.toLowerCase().includes(q)))
            );
        }

        // Transform and set filtered candidatures
        const mapped = res.map(c => this.mapCandidature(c));
        this.filteredCandidatures.set(mapped);
    }

    getAvailableDepartements(): string[] {
        const departments = new Set<string>();
        this.candidatures().forEach(c => {
            if (c.sujetChoix1?.departementNom) {
                departments.add(c.sujetChoix1.departementNom);
            }
            if (c.sujetChoix2?.departementNom) {
                departments.add(c.sujetChoix2.departementNom);
            }
        });
        return Array.from(departments).sort();
    }

    getCountByStatut(statut: StatutCandidature | 'ENTRETIEN'): number {
        return this.candidatures().filter(c => {
            if (statut === 'ENTRETIEN') {
                return c.statut === 'PRESELECTIONNE' && !!c.dateEntretien;
            }
            return c.statut === statut;
        }).length;
    }

    // ─── TEMPLATE HELPERS ───
    getInitials(prenom: string, nom: string): string {
        return ((prenom[0] || '') + (nom[0] || '')).toUpperCase();
    }

    getGradientClass(str: string): string {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = (h << 5) - h + str.charCodeAt(i);
            h |= 0;
        }
        return this.GRD[Math.abs(h) % 7];
    }

    getStatusBadgeClass(statut: StatutCandidature): string {
        switch (statut) {
            case 'EN_ATTENTE': return 'b-att';
            case 'PRESELECTIONNE': return 'b-pre';
            case 'ACCEPTE': return 'b-acc';
            case 'REJETE': return 'b-ref';
            default: return 'b-att';
        }
    }

    getStatusDotColor(statut: StatutCandidature): string {
        switch (statut) {
            case 'EN_ATTENTE': return '#F59E0B';
            case 'PRESELECTIONNE': return '#2563EB';
            case 'ACCEPTE': return '#00A86B';
            case 'REJETE': return '#94A3B8';
            default: return '#F59E0B';
        }
    }

    getStatusLabel(statut: StatutCandidature): string {
        switch (statut) {
            case 'EN_ATTENTE': return 'En attente';
            case 'PRESELECTIONNE': return 'Présélectionné';
            case 'ACCEPTE': return 'Accepté';
            case 'REJETE': return 'Refusé';
            default: return 'En attente';
        }
    }

    getProgressPercent(statut: StatutCandidature): number {
        switch (statut) {
            case 'EN_ATTENTE': return 25;
            case 'PRESELECTIONNE': return 50;
            case 'ACCEPTE': return 100;
            case 'REJETE': return 0;
            default: return 0;
        }
    }

    getStepClass(step: number, statut: StatutCandidature): string {
        const steps: { [key in StatutCandidature]: number } = {
            'EN_ATTENTE': 1,
            'PRESELECTIONNE': 2,
            'ACCEPTE': 4,
            'REJETE': 0
        };
        const currentStep = steps[statut];
        if (currentStep === 0) return 'step-inactive';
        return step <= currentStep ? 'step-active' : 'step-inactive';
    }

    getWorkflowClass(step: number, statut: StatutCandidature): 'done' | 'active' | 'pending' {
        const steps: { [key in StatutCandidature]: number } = {
            'EN_ATTENTE': 1,
            'PRESELECTIONNE': 2,
            'ACCEPTE': 4,
            'REJETE': 0
        };
        const currentStep = steps[statut];
        if (currentStep === 0) return 'pending';
        if (step < currentStep) return 'done';
        if (step === currentStep) return 'active';
        return 'pending';
    }

    getTelLink(tel: string): string {
        return 'tel:' + tel.replace(/\s/g, '');
    }

    getModalStatusClass(statut: StatutCandidature): string {
        switch (statut) {
            case 'EN_ATTENTE': return 'm-sp-att';
            case 'PRESELECTIONNE': return 'm-sp-pre';
            case 'ACCEPTE': return 'm-sp-acc';
            case 'REJETE': return 'm-sp-ref';
            default: return 'm-sp-att';
        }
    }

    // ─── MODAL ACTIONS ───
    openModal(c: Candidature) {
        this.selectedCandidature.set(c);
        this.showDetail.set(true);
    }

    closeModal(event?: Event) {
        if (event && (event.target as HTMLElement).classList.contains('overlay')) {
            this.showDetail.set(false);
            this.selectedCandidature.set(null);
        }
    }

    closeDetail() {
        this.showDetail.set(false);
        this.selectedCandidature.set(null);
    }

    canPreselectionner(s: StatutCandidature): boolean { return s === 'EN_ATTENTE'; }
    canEntretien(s: StatutCandidature): boolean { return s === 'EN_ATTENTE' || s === 'PRESELECTIONNE'; }
    canAccepter(s: StatutCandidature): boolean { return ['EN_ATTENTE', 'PRESELECTIONNE'].includes(s); }
    canRefuser(s: StatutCandidature): boolean { return s !== 'REJETE' && s !== 'ACCEPTE'; }

    updateStatutWithModal(statut: 'PRESELECTIONNE' | 'ACCEPTE' | 'REJETE' | 'ENTRETIEN') {
        if (statut === 'ENTRETIEN' || statut === 'PRESELECTIONNE' || statut === 'ACCEPTE') {
            this.targetStatut = statut === 'ENTRETIEN' ? 'PRESELECTIONNE' : statut;
            this.dateEntretienInput = '';
            this.showAcceptModal.set(true);
        } else {
            this.updateStatut(statut);
        }
    }

    confirmEntretien() {
        if (!this.dateEntretienInput || !this.selectedCandidature()) return;

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

    proceedWithConfirmation() {
        if (!this.dateEntretienInput || !this.selectedCandidature()) return;

        const id = this.selectedCandidature()!.id;
        const isoDate = new Date(this.dateEntretienInput).toISOString();

        const req: CandidatureUpdateRequest = this.targetStatut === 'ACCEPTE'
            ? { statut: 'ACCEPTE', dateDebut: isoDate }
            : { statut: 'PRESELECTIONNE', dateEntretien: isoDate };

        this.agentRHService.changerStatutCandidature(id, req).subscribe({
            next: (updated) => {
                this.updateLocalCandidature(updated);
                this.showAcceptModal.set(false);
                this.showToast(
                    this.targetStatut === 'ACCEPTE' ? 'Candidature acceptée avec succès' : 'Entretien planifié avec succès',
                    'success'
                );
                this.closeDetail();
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

        const duplicates = this.candidatures().filter(c => {
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

    updateStatut(statut: StatutCandidature) {
        const c = this.selectedCandidature();
        if (!c) return;

        const req: CandidatureUpdateRequest = { statut };
        this.agentRHService.changerStatutCandidature(c.id, req).subscribe({
            next: (updated) => {
                this.updateLocalCandidature(updated);
                this.showToast('Statut mis à jour', 'success');
                this.selectedCandidature.set(updated);
            },
            error: () => this.showToast('Erreur mise à jour statut', 'error')
        });
    }

    updateLocalCandidature(updated: Candidature) {
        // Update the parent's candidatures signal
        this.candidaturesLoaded.emit();
    }

    showToast(msg: string, type: 'success' | 'error') {
        this.toastMessage.set(msg);
        this.toastType.set(type);
        this.toastTimer = setTimeout(() => {
            this.toastMessage.set(null);
        }, 3800);
    }

    // ─── DOCUMENT MODALS ───
    openDocumentViewerCV(candidatId: string) {
        this.openDocumentViewer('CV', candidatId);
    }

    openDocumentViewerLetter(candidatId: string) {
        this.openDocumentViewer('LETTRE_MOTIVATION', candidatId);
    }

    openDocumentViewer(type: 'CV' | 'LETTRE_MOTIVATION', candidatId: string) {
        this.documentViewerType.set(type);
        this.documentViewerCandidatId.set(candidatId);
        this.showDocumentViewerModal.set(true);
    }

    closeDocumentViewer() {
        this.showDocumentViewerModal.set(false);
        this.documentViewerCandidatId.set(null);
    }

    closeDocumentViewerModal() {
        this.closeDocumentViewer();
    }

    openDocumentUploader(type: 'CV' | 'LETTRE_MOTIVATION', candidatId: string) {
        this.documentUploaderType.set(type);
        this.documentUploaderCandidatId.set(candidatId);
        this.showDocumentUploaderModal.set(true);
    }

    closeDocumentUploader() {
        this.showDocumentUploaderModal.set(false);
        this.documentUploaderCandidatId.set(null);
    }

    onDocumentUploadSuccess() {
        this.showToast('Document uploadé avec succès', 'success');
        this.closeDocumentUploader();
        this.candidaturesLoaded.emit();
    }

    onDocumentUploadError() {
        this.showToast('Erreur lors de l\'upload du document', 'error');
    }

    // Additional required methods
    onViewDocument(docType: string, candidatId: string): void {
        if (!candidatId) return;

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

    closePdfModal(): void {
        // Clear the pre-signed URL reference
        this.openPdf = '';
        this.currentDocType = '';
    }

    getPdfUrl(): SafeResourceUrl | '' {
        return this.openPdf;
    }

    onDownloadDocument(docType: string, candidatId: string): void {
        if (!candidatId) return;

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
                            const candidatName = this.selected && this.selected.name
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

    togglePdf(id: string): void {
        // Legacy method - now replaced with proper document viewing
        // This is kept for backwards compatibility if needed
    }

    openPdfViewer(candidatId: string): void {
        this.openDocumentViewerCV(candidatId);
    }

    setPill(pill: string): void {
        this.curPill = pill;
        if (pill === 'all') {
            this.setFilterStatut('');
        } else {
            this.setFilterStatut(pill as StatutCandidature | 'ENTRETIEN');
        }
    }

    openDetail(item: any): void {
        this.selected = item;
        this.selectedCandidature.set(item);
        this.fullCandidature = this.candidatures().find(cand => cand.id === item.id) || null;
        this.updateProgressBar(item.statut);
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

    navigateToSujet(sujetId: string): void {
        if (sujetId) {
            this.router.navigate(['/agent-rh/sujets-pfe', sujetId]);
        }
    }

    getTypeClass(type: string): string {
        return 'bg-' + (type || 'init').toLowerCase();
    }

    getBadgeClass(status: string): string {
        return 'bg-' + (status || 'wait').toLowerCase();
    }

    getNiv(niveau: string): string {
        // Return only the academic level (Licence, Master, Ingénieur)
        if (!niveau) return 'N/A';
        const code = niveau.substring(0, 1).toUpperCase();
        if (code === 'L') return 'Licence';
        if (code === 'M') return 'Master';
        if (code === 'C') return 'Ingénieur';
        return niveau;
    }

    getUniv(univ: string): string {
        return univ || 'N/A';
    }

    getStatusClass(statut: string): string {
        const statusMap: { [key: string]: string } = {
            'EN_ATTENTE': 'wait',
            'PRESELECTIONNE': 'sel',
            'ACCEPTE': 'ok',
            'REJETE': 'reject'
        };
        return statusMap[statut] || 'wait';
    }

    getFormattedType(type: string): string {
        const typeMap: { [key: string]: string } = {
            'INITIATION': 'Initiation',
            'PERFECTIONNEMENT': 'Perfectionnement',
            'ETE': 'Été',
            'STAGE_COURT': 'Stage Court',
            'STAGE_LONG': 'Stage Long'
        };
        return typeMap[type] || type;
    }

    getFormattedStatut(statut: string): string {
        const statutMap: { [key: string]: string } = {
            'EN_ATTENTE': 'En attente',
            'PRESELECTIONNE': 'Présélectionné',
            'ACCEPTE': 'Accepté',
            'REJETE': 'Rejeté',
            'ENTRETIEN': 'Entretien'
        };
        return statutMap[statut] || statut;
    }

    preselectionner(candidatId?: string): void {
        this.updateStatutWithModal('PRESELECTIONNE');
    }

    accepter(candidatId?: string): void {
        this.updateStatutWithModal('ACCEPTE');
    }

    rejeter(candidatId?: string): void {
        this.updateStatut('REJETE');
    }

    formatDate(dateStr: any): string {
        if (!dateStr) return 'Non disponible';
        try {
            const date = new Date(dateStr);
            const day = date.getDate();
            const monthNames = ['Jan.', 'Fév.', 'Mar.', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sep.', 'Oct.', 'Nov.', 'Déc.'];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
            const hourIn12 = date.getHours() % 12 || 12;
            return `${day} ${month} ${year}, ${String(hourIn12).padStart(2, '0')}:${minutes} ${ampm}`;
        } catch (e) {
            return 'Format invalide';
        }
    }

    getLetterMotivationFileName(): string {
        if (!this.selected) return 'LM_document.pdf';
        if (this.selected.binome) {
            return `LM_${this.selected.name.replace(/\s+/g, '')}_${this.selected.bPrenom}${this.selected.bNom}.pdf`;
        }
        return `LM_${this.selected.name.replace(/\s+/g, '')}.pdf`;
    }
}

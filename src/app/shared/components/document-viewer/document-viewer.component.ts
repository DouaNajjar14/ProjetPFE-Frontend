import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentCandidatureService } from '../../../core/services/document-candidature.service';
import { DocumentUrlResponse } from '../../../core/models/document.model';
import { SafePipe } from '../../pipes/safe.pipe';

export type DocumentType = 'CV' | 'LETTRE_MOTIVATION';

@Component({
    selector: 'app-document-viewer',
    standalone: true,
    imports: [CommonModule, SafePipe],
    templateUrl: './document-viewer.component.html',
    styleUrl: './document-viewer.component.css'
})
export class DocumentViewerComponent implements OnInit {

    @Input() candidatId!: string | number;
    @Input() documentType: DocumentType = 'CV';

    // Signals for reactive state
    isLoading = signal(false);
    documentUrl = signal<string>('');
    errorMessage = signal<string>('');
    documentName = signal<string>('');

    // Mobile detection
    isMobile = signal(window.innerWidth < 768);

    constructor(private documentService: DocumentCandidatureService) {
        window.addEventListener('resize', () => {
            this.isMobile.set(window.innerWidth < 768);
        });
    }

    ngOnInit() {
        this.loadDocumentUrl();
    }

    /**
     * Load the document URL based on documentType
     */
    private loadDocumentUrl() {
        if (!this.candidatId) {
            this.errorMessage.set('ID candidat manquant');
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');

        const serviceMethod = this.documentType === 'CV'
            ? this.documentService.getUrlLectureCv(this.candidatId)
            : this.documentService.getUrlLectureLettre(this.candidatId);

        serviceMethod.subscribe({
            next: (response: DocumentUrlResponse) => {
                this.documentUrl.set(response.url);
                this.documentName.set(response.nomDocument);
                this.isLoading.set(false);
            },
            error: (error) => {
                this.isLoading.set(false);

                const errorBody = error.error?.message || error.message || 'Erreur inconnue';

                if (error.status === 404) {
                    this.errorMessage.set(`📄 ${this.getDocumentLabel()} non disponible`);
                } else if (error.status === 403) {
                    this.errorMessage.set('🔒 Accès refusé à ce document');
                } else if (error.status === 400) {
                    this.errorMessage.set(`⚠️ ${errorBody}`);
                } else if (error.status === 0) {
                    this.errorMessage.set('⚠️ Impossible de se connecter au serveur');
                } else {
                    this.errorMessage.set(`⚠️ Erreur: ${errorBody}`);
                }
            }
        });
    }

    /**
     * Download the document
     */
    downloadDocument() {
        if (!this.candidatId) {
            return;
        }

        this.isLoading.set(true);

        const serviceMethod = this.documentType === 'CV'
            ? this.documentService.getUrlTelechargementCv(this.candidatId)
            : this.documentService.getUrlTelechargementLettre(this.candidatId);

        serviceMethod.subscribe({
            next: (response: DocumentUrlResponse) => {
                // Open download URL in new tab
                window.open(response.url, '_blank');
                this.isLoading.set(false);
            },
            error: (error) => {
                this.isLoading.set(false);

                const errorBody = error.error?.message || error.message || 'Erreur inconnue';

                if (error.status === 404) {
                    this.errorMessage.set(`📄 ${this.getDocumentLabel()} non disponible`);
                } else if (error.status === 403) {
                    this.errorMessage.set('🔒 Accès refusé à ce document');
                } else if (error.status === 400) {
                    this.errorMessage.set(`⚠️ ${errorBody}`);
                } else if (error.status === 0) {
                    this.errorMessage.set('⚠️ Impossible de se connecter au serveur');
                } else {
                    this.errorMessage.set(`⚠️ Erreur lors du téléchargement: ${errorBody}`);
                }
            }
        });
    }

    /**
     * Get human-readable label for document
     */
    getDocumentLabel(): string {
        return this.documentType === 'CV' ? 'CV' : 'Lettre de motivation';
    }
}

import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { DocumentCandidatureService } from '../../../core/services/document-candidature.service';
import { DocumentUploadResponse } from '../../../core/models/document.model';

export type DocumentType = 'CV' | 'LETTRE_MOTIVATION';

@Component({
    selector: 'app-document-uploader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './document-uploader.component.html',
    styleUrl: './document-uploader.component.css'
})
export class DocumentUploaderComponent {

    @Input() candidatId!: string | number;
    @Input() documentType: DocumentType = 'CV';
    @Input() maxFileSize: number = 5242880; // 5 MB in bytes

    @Output() uploadSuccess = new EventEmitter<DocumentUploadResponse>();
    @Output() uploadError = new EventEmitter<string>();

    // Signals for reactive state
    isDragOver = signal(false);
    isUploading = signal(false);
    uploadProgress = signal(0);
    selectedFile = signal<File | null>(null);
    uploadMessage = signal<string>('');
    messageType = signal<'success' | 'error' | ''>('');

    private fileInput = document.createElement('input');

    constructor(private documentService: DocumentCandidatureService) {
        this.fileInput.type = 'file';
        this.fileInput.accept = '.pdf';
    }

    /**
     * Handle drag over
     */
    onDragOver(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    /**
     * Handle drag leave
     */
    onDragLeave(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    /**
     * Handle file drop
     */
    onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    /**
     * Handle file selection from input
     */
    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = input.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    /**
     * Trigger file input click
     */
    triggerFileInput() {
        this.fileInput.click();
    }

    /**
     * Validate and select file
     */
    private handleFile(file: File) {
        // Reset messages
        this.uploadMessage.set('');
        this.messageType.set('');

        // Validate file type
        if (file.type !== 'application/pdf') {
            this.uploadMessage.set('⚠️ Seuls les fichiers PDF sont acceptés');
            this.messageType.set('error');
            this.uploadError.emit('Type de fichier invalide');
            return;
        }

        // Validate file size
        if (file.size > this.maxFileSize) {
            const maxSizeMB = Math.round(this.maxFileSize / 1024 / 1024);
            this.uploadMessage.set(`⚠️ Fichier trop volumineux (max ${maxSizeMB}MB)`);
            this.messageType.set('error');
            this.uploadError.emit('Fichier trop volumineux');
            return;
        }

        // Store selected file
        this.selectedFile.set(file);
    }

    /**
     * Upload the selected file
     */
    uploadFile() {
        const file = this.selectedFile();
        if (!file || !this.candidatId) {
            this.uploadMessage.set('⚠️ Sélectionnez un fichier');
            this.messageType.set('error');
            return;
        }

        this.isUploading.set(true);
        this.uploadProgress.set(0);

        // Choose upload method based on document type
        const uploadMethod = this.documentType === 'CV'
            ? this.documentService.uploadCv(this.candidatId, file)
            : this.documentService.uploadLettreMotivation(this.candidatId, file);

        uploadMethod.subscribe({
            next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total) {
                    this.uploadProgress.set(Math.round((event.loaded / event.total) * 100));
                } else if (event instanceof HttpResponse) {
                    this.isUploading.set(false);
                    this.uploadProgress.set(100);
                    this.uploadMessage.set(`✅ ${this.getDocumentLabel()} téléchargé avec succès`);
                    this.messageType.set('success');

                    // Emit success event
                    this.uploadSuccess.emit(event.body);

                    // Reset after 3 seconds
                    setTimeout(() => {
                        this.selectedFile.set(null);
                        this.uploadProgress.set(0);
                        this.uploadMessage.set('');
                        this.messageType.set('');
                    }, 3000);
                }
            },
            error: (error) => {
                this.isUploading.set(false);

                let errorMsg = 'Erreur lors du téléchargement';
                if (error.status === 400) {
                    errorMsg = '⚠️ ' + (error.error?.message || 'Fichier invalide');
                } else if (error.status === 413) {
                    errorMsg = '⚠️ Fichier trop volumineux';
                }

                this.uploadMessage.set(errorMsg);
                this.messageType.set('error');
                this.uploadError.emit(errorMsg);
            }
        });
    }

    /**
     * Remove selected file
     */
    removeFile() {
        this.selectedFile.set(null);
        this.uploadProgress.set(0);
        this.uploadMessage.set('');
        this.messageType.set('');
    }

    /**
     * Get human-readable label
     */
    getDocumentLabel(): string {
        return this.documentType === 'CV' ? 'CV' : 'Lettre de motivation';
    }

    /**
     * Get formatted file size
     */
    getFormattedFileSize(bytes: number): string {
        const mb = bytes / 1024 / 1024;
        return mb.toFixed(2) + ' MB';
    }
}

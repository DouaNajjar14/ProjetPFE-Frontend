import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DocumentUrlResponse, DocumentUploadResponse } from '../models/document.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentCandidatureService {

    private apiUrl = `${environment.apiUrl}/documents/candidatures`;

    constructor(private http: HttpClient) { }

    /**
     * Upload CV file for a candidate
     */
    uploadCv(candidatId: string | number, file: File): Observable<HttpEvent<DocumentUploadResponse>> {
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('POST', `${this.apiUrl}/${candidatId}/cv`, formData, {
            reportProgress: true
        });

        return this.http.request(req);
    }

    /**
     * Upload lettre de motivation file for a candidate
     */
    uploadLettreMotivation(candidatId: string | number, file: File): Observable<HttpEvent<DocumentUploadResponse>> {
        const formData = new FormData();
        formData.append('file', file);

        const req = new HttpRequest('POST', `${this.apiUrl}/${candidatId}/lettre`, formData, {
            reportProgress: true
        });

        return this.http.request(req);
    }

    /**
     * Get read URL for CV (inline viewing)
     */
    getUrlLectureCv(candidatId: string | number): Observable<DocumentUrlResponse> {
        return this.http.get<DocumentUrlResponse>(`${this.apiUrl}/${candidatId}/cv/lecture`);
    }

    /**
     * Get download URL for CV
     */
    getUrlTelechargementCv(candidatId: string | number): Observable<DocumentUrlResponse> {
        return this.http.get<DocumentUrlResponse>(`${this.apiUrl}/${candidatId}/cv/telechargement`);
    }

    /**
     * Get read URL for lettre de motivation (inline viewing)
     */
    getUrlLectureLettre(candidatId: string | number): Observable<DocumentUrlResponse> {
        return this.http.get<DocumentUrlResponse>(`${this.apiUrl}/${candidatId}/lettre/lecture`);
    }

    /**
     * Get download URL for lettre de motivation
     */
    getUrlTelechargementLettre(candidatId: string | number): Observable<DocumentUrlResponse> {
        return this.http.get<DocumentUrlResponse>(`${this.apiUrl}/${candidatId}/lettre/telechargement`);
    }
}

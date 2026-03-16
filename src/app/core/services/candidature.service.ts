import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    Candidature,
    CandidatureRequest,
    CandidatureUpdateRequest,
    CandidatureStats,
    TypeStage,
    StatutCandidature
} from '../models/candidature.model';

@Injectable({
    providedIn: 'root'
})
export class CandidatureService {
    private readonly API_URL = `${environment.apiUrl}/candidatures`;

    constructor(private http: HttpClient) { }

    creer(request: CandidatureRequest, cv1: File, lettreMotivation1?: File, cv2?: File, lettreMotivation2?: File): Observable<Candidature> {
        const formData = new FormData();
        formData.append('candidature', JSON.stringify(request));
        formData.append('cv1', cv1);

        if (lettreMotivation1) {
            formData.append('lettreMotivation1', lettreMotivation1);
        }
        if (cv2) {
            formData.append('cv2', cv2);
        }
        if (lettreMotivation2) {
            formData.append('lettreMotivation2', lettreMotivation2);
        }

        return this.http.post<Candidature>(this.API_URL, formData);
    }

    modifier(id: string, request: CandidatureUpdateRequest): Observable<Candidature> {
        return this.http.put<Candidature>(`${this.API_URL}/${id}`, request);
    }

    listerTous(): Observable<Candidature[]> {
        return this.http.get<Candidature[]>(this.API_URL);
    }

    trouverParId(id: string): Observable<Candidature> {
        return this.http.get<Candidature>(`${this.API_URL}/${id}`);
    }

    listerParStatut(statut: StatutCandidature): Observable<Candidature[]> {
        return this.http.get<Candidature[]>(`${this.API_URL}/statut/${statut}`);
    }

    listerParTypeStage(typeStage: TypeStage): Observable<Candidature[]> {
        return this.http.get<Candidature[]>(`${this.API_URL}/type/${typeStage}`);
    }

    getStatistiques(): Observable<CandidatureStats> {
        return this.http.get<CandidatureStats>(`${this.API_URL}/statistiques`);
    }
}

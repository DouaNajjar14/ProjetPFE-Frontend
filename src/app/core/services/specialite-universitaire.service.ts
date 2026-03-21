import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SpecialiteUniversitaire, SpecialiteUniversitaireRequest } from '../models/specialite-universitaire.model';

@Injectable({
    providedIn: 'root'
})
export class SpecialiteUniversitaireService {
    private apiUrl = `${environment.apiUrl}/admin/specialites-universitaires`;

    constructor(private http: HttpClient) { }

    lister(): Observable<SpecialiteUniversitaire[]> {
        return this.http.get<SpecialiteUniversitaire[]>(this.apiUrl);
    }

    trouverParId(id: number): Observable<SpecialiteUniversitaire> {
        return this.http.get<SpecialiteUniversitaire>(`${this.apiUrl}/${id}`);
    }

    creer(request: SpecialiteUniversitaireRequest): Observable<SpecialiteUniversitaire> {
        return this.http.post<SpecialiteUniversitaire>(this.apiUrl, request);
    }

    modifier(id: number, request: SpecialiteUniversitaireRequest): Observable<SpecialiteUniversitaire> {
        return this.http.put<SpecialiteUniversitaire>(`${this.apiUrl}/${id}`, request);
    }

    supprimer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

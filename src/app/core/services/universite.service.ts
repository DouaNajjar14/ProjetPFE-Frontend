import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Universite, UniversiteRequest } from '../models/universite.model';

@Injectable({
    providedIn: 'root'
})
export class UniversiteService {
    private readonly API_URL = `${environment.apiUrl}/universites`;

    constructor(private http: HttpClient) { }

    creer(request: UniversiteRequest): Observable<Universite> {
        return this.http.post<Universite>(this.API_URL, request);
    }

    modifier(id: string, request: UniversiteRequest): Observable<Universite> {
        return this.http.put<Universite>(`${this.API_URL}/${id}`, request);
    }

    supprimer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${id}`);
    }

    listerTous(): Observable<Universite[]> {
        return this.http.get<Universite[]>(this.API_URL);
    }

    trouverParId(id: string): Observable<Universite> {
        return this.http.get<Universite>(`${this.API_URL}/${id}`);
    }
}

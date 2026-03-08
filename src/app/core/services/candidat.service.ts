import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Candidat } from '../models/candidat.model';

@Injectable({
    providedIn: 'root'
})
export class CandidatService {
    private readonly API_URL = `${environment.apiUrl}/candidats`;

    constructor(private http: HttpClient) { }

    listerTous(): Observable<Candidat[]> {
        return this.http.get<Candidat[]>(this.API_URL);
    }

    trouverParId(id: string): Observable<Candidat> {
        return this.http.get<Candidat>(`${this.API_URL}/${id}`);
    }
}

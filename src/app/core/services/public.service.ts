import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SujetPfe } from '../models/sujet-pfe.model';
import { Departement } from '../models/departement.model';

@Injectable({
    providedIn: 'root'
})
export class PublicService {
    private readonly API_URL = `${environment.apiUrl}/public`;

    constructor(private http: HttpClient) { }

    // Sujets PFE publics
    listerSujetsPfe(): Observable<SujetPfe[]> {
        return this.http.get<SujetPfe[]>(`${this.API_URL}/sujets-pfe`);
    }

    trouverSujetPfeParId(id: string): Observable<SujetPfe> {
        return this.http.get<SujetPfe>(`${this.API_URL}/sujets-pfe/${id}`);
    }

    listerSujetsPfeParDepartement(departementId: string): Observable<SujetPfe[]> {
        return this.http.get<SujetPfe[]>(`${this.API_URL}/sujets-pfe/departement/${departementId}`);
    }

    // Départements publics
    listerDepartements(): Observable<Departement[]> {
        return this.http.get<Departement[]>(`${this.API_URL}/departements`);
    }
}

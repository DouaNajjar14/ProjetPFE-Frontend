import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StagiaireResponse } from '../models/stagiaire.model';

@Injectable({ providedIn: 'root' })
export class StagiaireService {
  private readonly API_URL = `${environment.apiUrl}/admin/stagiaires`;

  constructor(private http: HttpClient) {}

  listerStagiaires(): Observable<StagiaireResponse[]> {
    return this.http.get<StagiaireResponse[]>(this.API_URL);
  }

  getStagiaireById(id: string): Observable<StagiaireResponse> {
    return this.http.get<StagiaireResponse>(`${this.API_URL}/${id}`);
  }
}

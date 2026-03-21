import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AgentRH, AgentRHRequest, AgentRHUpdateRequest } from '../models/agent-rh.model';
import { Candidature, CandidatureUpdateRequest, StatutCandidature, TypeStage } from '../models/candidature.model';

export interface CandidatureStats {
  total: number;
  parStatut: { [key: string]: number };
  parTypeStage: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class AgentRHService {
  private readonly API_URL = `${environment.apiUrl}/admin/agents-rh`;
  private readonly CANDIDATURES_URL = `${environment.apiUrl}/agent-rh/candidatures`;

  constructor(private http: HttpClient) { }

  creer(request: AgentRHRequest): Observable<AgentRH> {
    return this.http.post<AgentRH>(this.API_URL, request);
  }

  modifier(id: string, request: AgentRHUpdateRequest): Observable<AgentRH> {
    return this.http.put<AgentRH>(`${this.API_URL}/${id}`, request);
  }

  archiver(id: string): Observable<AgentRH> {
    return this.http.patch<AgentRH>(`${this.API_URL}/${id}/archiver`, {});
  }

  desarchiver(id: string): Observable<AgentRH> {
    return this.http.patch<AgentRH>(`${this.API_URL}/${id}/desarchiver`, {});
  }

  listerActifs(): Observable<AgentRH[]> {
    return this.http.get<AgentRH[]>(this.API_URL);
  }

  listerArchives(): Observable<AgentRH[]> {
    return this.http.get<AgentRH[]>(`${this.API_URL}/archives`);
  }

  listerTous(): Observable<AgentRH[]> {
    return this.http.get<AgentRH[]>(`${this.API_URL}/tous`);
  }

  trouverParId(id: string): Observable<AgentRH> {
    return this.http.get<AgentRH>(`${this.API_URL}/${id}`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  Consultation des candidatures
  // ─────────────────────────────────────────────────────────────────────────

  listerToutesCandidatures(): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(this.CANDIDATURES_URL);
  }

  trouverCandidatureParId(id: string): Observable<Candidature> {
    return this.http.get<Candidature>(`${this.CANDIDATURES_URL}/${id}`);
  }

  listerCandidaturesParStatut(statut: StatutCandidature): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.CANDIDATURES_URL}/statut/${statut}`);
  }

  listerCandidaturesParTypeStage(typeStage: TypeStage): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.CANDIDATURES_URL}/type/${typeStage}`);
  }

  listerCandidaturesParTypeEtStatut(typeStage: TypeStage, statut: StatutCandidature): Observable<Candidature[]> {
    return this.http.get<Candidature[]>(`${this.CANDIDATURES_URL}/type/${typeStage}/statut/${statut}`);
  }

  getStatistiquesCandidatures(): Observable<CandidatureStats> {
    return this.http.get<CandidatureStats>(`${this.CANDIDATURES_URL}/statistiques`);
  }

  changerStatutCandidature(id: string, request: CandidatureUpdateRequest): Observable<Candidature> {
    return this.http.patch<Candidature>(`${environment.apiUrl}/candidatures/${id}/statut`, request);
  }
}

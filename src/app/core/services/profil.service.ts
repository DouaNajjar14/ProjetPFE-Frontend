import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
    ProfilResponse,
    ModifierCoordonneeRequest,
    ChangerMotDePasseRequest,
    ActiviteLog,
    SessionActive
} from '../models/profil.model';

@Injectable({
    providedIn: 'root'
})
export class ProfilService {
    private readonly apiUrl = `${environment.apiUrl}/profil`;

    constructor(private http: HttpClient) { }

    /**
     * Récupérer le profil de l'utilisateur actuel
     */
    obtenirProfil(): Observable<ProfilResponse> {
        return this.http.get<ProfilResponse>(`${this.apiUrl}/moi`);
    }

    /**
     * Modifier les coordonnées (email, téléphone)
     * Le backend ignore les champs nom et prenom s'ils sont envoyés
     */
    modifierCoordonnees(data: ModifierCoordonneeRequest): Observable<ProfilResponse> {
        return this.http.put<ProfilResponse>(`${this.apiUrl}/coordonnees`, data);
    }

    /**
     * Changer le mot de passe
     * Vérifie le mot de passe actuel côté backend
     * Invalide tous les autres tokens
     */
    changerMotDePasse(data: ChangerMotDePasseRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/changer-mot-de-passe`, data);
    }

    /**
     * Récupérer l'historique d'activité
     */
    obtenirActivite(): Observable<ActiviteLog[]> {
        return this.http.get<ActiviteLog[]>(`${this.apiUrl}/activite`);
    }

    /**
     * Récupérer les sessions actives
     */
    obtenirSessions(): Observable<SessionActive[]> {
        return this.http.get<SessionActive[]>(`${this.apiUrl}/sessions`);
    }

    /**
     * Déconnecter une session spécifique
     */
    deconnecterSession(sessionId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/sessions/${sessionId}/deconnecter`, {});
    }
}

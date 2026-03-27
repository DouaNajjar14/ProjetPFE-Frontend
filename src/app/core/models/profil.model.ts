/**
 * Models pour la gestion du profil utilisateur
 */

export interface ProfilUtilisateur {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    role: string;
    statut: string;
    dateCreation: string;
    derniereConnexion: string;
}

export interface ModifierCoordonneeRequest {
    email: string;
    telephone: string;
}

export interface ChangerMotDePasseRequest {
    motDePasseActuel: string;
    nouveauMotDePasse: string;
}

export interface ProfilResponse {
    id: string;
    prenom: string;
    nom: string;
    email: string;
    telephone: string;
    role: string;
    statut: string;
    createdAt: string;
    updatedAt: string;
}

export interface ActiviteLog {
    id: string;
    type: string;
    description: string;
    dateTime: string;
    adresse_ip?: string;
    navigateur?: string;
}

export interface SessionActive {
    id: string;
    appareil: string;
    navigateur: string;
    ville: string;
    dateCreation: string;
    dernierAcces: string;
    etat: string;
    sessionActuelle: boolean;
}

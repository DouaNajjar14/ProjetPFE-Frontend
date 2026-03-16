import { Competence } from './competence.model';
import { Specialite } from './specialite.model';

export interface Encadrant {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    capaciteMax: number;
    capaciteActuelle: number;
    actif: boolean;
    dateCreation: string;
    dateModification: string;
    departementId: string;
    departementNom: string;
    specialites?: Specialite[];
    competences?: Competence[];
}

export interface EncadrantRequest {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    motDePasse: string;
    capaciteMax: number;
    departementId: string;
    specialiteIds?: number[];
    competenceIds?: number[];
}

export interface EncadrantUpdateRequest {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    capaciteMax: number;
    departementId: string;
    specialiteIds?: number[];
    competenceIds?: number[];
}

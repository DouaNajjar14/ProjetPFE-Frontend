import { Competence } from './competence.model';

export interface Specialite {
    id: number;
    nom: string;
    departementId: string;
    departementNom: string;
    competences: Competence[];
    archive?: boolean;
}

export interface SpecialiteRequest {
    nom: string;
    departementId: string;
    competenceIds?: number[];
}

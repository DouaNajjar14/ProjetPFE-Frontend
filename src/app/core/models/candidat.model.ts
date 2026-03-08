export type Niveau = 'L3' | 'M2' | 'CY3';

export interface Candidat {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    niveauAcademique: Niveau;
    cv: string;
    lettreMotivation?: string;
    universiteId: string;
    universiteNom: string;
}

export interface CandidatRequest {
    nom: string;
    prenom: string;
    email: string;
    tel: string;
    niveauAcademique: Niveau;
    universiteId: string;
}

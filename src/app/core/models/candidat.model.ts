export type Niveau = 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | 'CY1' | 'CY2' | 'CY3';

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

export interface Competence {
    id: number;
    nom: string;
    specialiteId?: number;
    specialiteNom?: string;
}

export interface CompetenceRequest {
    nom: string;
    specialiteId?: number;
}

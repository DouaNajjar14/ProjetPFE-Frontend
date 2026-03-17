export interface Competence {
    id: number;
    nom: string;
    specialiteId?: number;
    specialiteNom?: string;
    archive?: boolean;
}

export interface CompetenceRequest {
    nom: string;
    specialiteId?: number;
}

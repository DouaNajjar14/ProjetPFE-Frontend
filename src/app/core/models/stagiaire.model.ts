export type StatutStagiaire = 'ACTIF' | 'TERMINE' | 'ABANDONNE';

export interface StagiaireResponse {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  username?: string;
  tempPassword?: string;
  typeStage: string;
  departementNom: string;
  encadrantNomComplet: string;
  dateDebut: string;
  dateFin: string;
  statut: StatutStagiaire;
  createdAt: string;
}

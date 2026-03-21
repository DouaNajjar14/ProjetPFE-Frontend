import { Specialite } from './specialite.model';

export interface Departement {
  id: string;
  nom: string;
  nombreEncadrantsActuel: number;
  nombreStagiairesActuel: number;
  archive: boolean;
  specialites?: Specialite[];
}

export interface DepartementRequest {
  nom: string;
}

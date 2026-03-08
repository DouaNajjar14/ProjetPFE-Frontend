import { Candidat, CandidatRequest } from './candidat.model';

export type TypeStage = 'INITIATION' | 'PERFECTIONNEMENT' | 'ETE' | 'PFE';
export type StatutCandidature = 'EN_ATTENTE' | 'PRESELECTIONNE' | 'ACCEPTE' | 'REJETE';

export interface SujetPfeSimple {
    id: string;
    titre: string;
    departementNom: string;
}

export interface Candidature {
    id: string;
    typeStage: TypeStage;
    statut: StatutCandidature;
    estBinome: boolean;
    dateDepot: string;
    dateEntretien?: string;
    dateDebut: string;
    dateFin: string;
    candidat1: Candidat;
    candidat2?: Candidat;
    sujetChoix1?: SujetPfeSimple;
    sujetChoix2?: SujetPfeSimple;
}

export interface CandidatureRequest {
    typeStage: TypeStage;
    estBinome: boolean;
    candidat1: CandidatRequest;
    candidat2?: CandidatRequest;
    sujetChoix1Id?: string;
    sujetChoix2Id?: string;
    dateDebut: string;
    dateFin: string;
}

export interface CandidatureUpdateRequest {
    statut: StatutCandidature;
    dateEntretien?: string;
}

export interface CandidatureStats {
    parStatut: { [key: string]: number };
    parTypeStage: { [key: string]: number };
}

// Type stage info pour affichage
export interface TypeStageInfo {
    type: TypeStage;
    titre: string;
    description: string;
    duree: string;
    niveau: string;
    couleur: string;
    icone: string;
    objectifs: string[];
    prerequis: string[];
}

export const TYPE_STAGE_INFO: TypeStageInfo[] = [
    {
        type: 'INITIATION',
        titre: 'Stage d\'Initiation',
        description: 'Première immersion dans le monde professionnel pour les étudiants de 1ère année ISET et ISETCOM uniquement.',
        duree: '1-2 mois',
        niveau: 'L1',
        couleur: 'blue',
        icone: 'academic-cap',
        objectifs: [
            'Découvrir l\'environnement professionnel',
            'Observer les métiers des télécommunications',
            'Comprendre le fonctionnement d\'une entreprise',
            'Rédiger un rapport de stage'
        ],
        prerequis: [
            'Être étudiant en L1 (ISET ou ISETCOM)',
            'Avoir une convention de stage',
            'Motivation et curiosité'
        ]
    },
    {
        type: 'PERFECTIONNEMENT',
        titre: 'Stage de Perfectionnement',
        description: 'Approfondissez vos connaissances techniques avec des missions concrètes. Réservé aux étudiants ISET et ISETCOM en L2.',
        duree: '2-3 mois',
        niveau: 'L2',
        couleur: 'amber',
        icone: 'building-office',
        objectifs: [
            'Appliquer les connaissances académiques',
            'Participer à des projets techniques',
            'Développer des compétences pratiques',
            'Travailler en équipe'
        ],
        prerequis: [
            'Être étudiant en L2 (ISET ou ISETCOM)',
            'Bases techniques solides',
            'Convention de stage obligatoire'
        ]
    },
    {
        type: 'ETE',
        titre: 'Stage d\'Été',
        description: 'Profitez de la période estivale (juin-août) pour acquérir une expérience professionnelle. Ouvert à tous les étudiants.',
        duree: '1-2 mois',
        niveau: 'Tous niveaux',
        couleur: 'green',
        icone: 'sun',
        objectifs: [
            'Acquérir une première expérience',
            'Explorer différents départements',
            'Développer son réseau',
            'Valoriser son CV'
        ],
        prerequis: [
            'Être étudiant (tous niveaux: L1, L2, M1, Cycle1, Cycle2)',
            'Disponibilité pendant l\'été',
            'Convention de stage'
        ]
    },
    {
        type: 'PFE',
        titre: 'Projet de Fin d\'Études',
        description: 'L\'aboutissement de votre parcours académique. Consultez le PFE Book pour découvrir les sujets et postulez directement par sujet.',
        duree: '4-6 mois',
        niveau: 'Ingénieur / Master / Licence',
        couleur: 'red',
        icone: 'rocket-launch',
        objectifs: [
            'Réaliser un projet complet de A à Z',
            'Résoudre une problématique concrète',
            'Développer des solutions innovantes',
            'Soutenir devant un jury'
        ],
        prerequis: [
            'Être en dernière année d\'études',
            'Maîtriser les technologies requises',
            'Postuler via le PFE Book uniquement'
        ]
    }
];

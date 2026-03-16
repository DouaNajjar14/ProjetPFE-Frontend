import { Component, OnInit, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TYPE_STAGE_INFO } from '../../../core/models/candidature.model';
import { PublicService } from '../../../core/services/public.service';
import { SujetPfe } from '../../../core/models/sujet-pfe.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    typeStages = TYPE_STAGE_INFO;
    featuredSujets = signal<SujetPfe[]>([]);
    totalSujets = computed(() => this.featuredSujets().length);

    processSteps = [
        { num: '01', title: 'Candidature', desc: 'Formulaire en ligne ou via le PFE Book', color: '#059669' },
        { num: '02', title: 'Confirmation', desc: 'Email automatique après soumission', color: '#0284c7' },
        { num: '03', title: 'Présélection', desc: 'Examen du dossier sous 5 jours ouvrables', color: '#b45309' },
        { num: '04', title: 'Entretien', desc: "Rencontrez l'équipe et démontrez votre motivation", color: '#6d28d9' },
        { num: '05', title: 'Intégration', desc: 'Accès créé, documents déposés, stage lancé', color: '#E2001A' },
        { num: '06', title: 'Attestation', desc: "Évaluation finale et génération de l'attestation", color: '#059669' },
    ];

    constructor(private publicService: PublicService) { }

    ngOnInit() {
        this.publicService.listerSujetsPfe().subscribe({
            next: (sujets) => this.featuredSujets.set(sujets),
            error: () => this.featuredSujets.set([])
        });
    }

    getStrokeColor(couleur: string): string {
        const map: Record<string, string> = { blue: '#0284c7', amber: '#b45309', green: '#059669', red: '#E2001A' };
        return map[couleur] ?? '#E2001A';
    }
}

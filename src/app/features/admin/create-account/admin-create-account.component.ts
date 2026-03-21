import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type PageStatus = 'loading' | 'form' | 'expired' | 'already-confirmed' | 'submitting';

interface PendingAccountData {
  prenom: string;
  nom: string;
  email: string;
  username: string;
  departement?: string;
  departementNom?: string;
  dateDebut: string;
  dateFin: string;
  typeStage: string;
}

interface ConfirmResponse {
  stagiaireId: string;
  username: string;
  tempPassword: string;
}

@Component({
  selector: 'app-admin-create-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './admin-create-account.component.html',
  styleUrls: ['./admin-create-account.component.css']
})
export class AdminCreateAccountComponent implements OnInit {
  status = signal<PageStatus>('loading');
  submitError = signal<string | null>(null);
  token = '';
  form!: FormGroup;

  typeStageOptions = [
    { label: 'Initiation',       value: 'INITIATION' },
    { label: 'Perfectionnement', value: 'PERFECTIONNEMENT' },
    { label: 'Été',              value: 'ETE' },
    { label: 'PFE',              value: 'PFE' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      prenom:      ['', Validators.required],
      nom:         ['', Validators.required],
      email:       ['', [Validators.required, Validators.email]],
      username:    ['', Validators.required],
      departement: ['', Validators.required],
      dateDebut:   ['', Validators.required],
      dateFin:     ['', Validators.required],
      typeStage:   ['', Validators.required]
    });

    this.token = this.route.snapshot.queryParams['token'] || '';
    if (!this.token) {
      this.status.set('expired');
      return;
    }

    this.loadPendingAccount();
  }

  private loadPendingAccount(): void {
    this.http
      .get<PendingAccountData>(
        `${environment.apiUrl}/admin/pending-accounts/${this.token}`
      )
      .subscribe({
        next: (data) => {
          this.form.patchValue({
            prenom:      data.prenom ?? '',
            nom:         data.nom ?? '',
            email:       data.email ?? '',
            username:    data.username ?? '',
            departement: data.departement ?? data.departementNom ?? '',
            dateDebut:   data.dateDebut ? data.dateDebut.slice(0, 10) : '',
            dateFin:     data.dateFin   ? data.dateFin.slice(0, 10)   : '',
            typeStage:   data.typeStage ?? ''
          });
          // Lock informational fields — only dates remain editable
          (['prenom', 'nom', 'email', 'username', 'departement', 'typeStage'] as const)
            .forEach(f => this.form.get(f)?.disable());
          this.status.set('form');
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.status.set('already-confirmed');
          } else {
            // 410 Gone or any other error → expired
            this.status.set('expired');
          }
        }
      });
  }

  confirm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.status.set('submitting');
    this.submitError.set(null);

    // getRawValue() includes disabled controls
    const payload = this.form.getRawValue();

    this.http
      .put<ConfirmResponse>(
        `${environment.apiUrl}/admin/pending-accounts/${this.token}/confirm`,
        payload
      )
      .subscribe({
        next: (response) => {
          // Fire-and-forget webhook
          this.http
            .post(
              'http://localhost:5678/webhook/stagiaire-confirme',
              {
                stagiaireId:  response.stagiaireId,
                username:     response.username,
                tempPassword: response.tempPassword,
                prenom:       payload.prenom,
                nom:          payload.nom,
                email:        payload.email,
                typeStage:    payload.typeStage,
                dateDebut:    payload.dateDebut,
                dateFin:      payload.dateFin,
                departement:  payload.departement
              },
              { headers: { 'X-Webhook-Secret': 'ooredoo-webhook-secret-2026' } }
            )
            .subscribe();

          this.router.navigate(['/admin/stagiaires']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            this.status.set('already-confirmed');
          } else {
            this.status.set('form');
            this.submitError.set(
              err.error?.message ?? 'Une erreur est survenue. Veuillez réessayer.'
            );
          }
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/stagiaires']);
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  getTypeLabel(value: string): string {
    return this.typeStageOptions.find(o => o.value === value)?.label ?? value;
  }

  getTypeSeverity(type: string): 'info' | 'warning' | 'success' | 'danger' | 'secondary' {
    switch (type) {
      case 'INITIATION':       return 'info';
      case 'PERFECTIONNEMENT': return 'warning';
      case 'ETE':              return 'success';
      case 'PFE':              return 'danger';
      default:                 return 'secondary';
    }
  }
}

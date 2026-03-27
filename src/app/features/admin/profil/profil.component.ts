import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfilService } from '../../../core/services/profil.service';
import { AuthService } from '../../../core/services/auth.service';
import {
    ProfilResponse,
    ModifierCoordonneeRequest,
    ChangerMotDePasseRequest
} from '../../../core/models/profil.model';

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profil.component.html',
    styleUrls: ['./profil.component.css'],
    host: { style: 'display: contents' }
})
export class ProfilComponent implements OnInit {
    // ═══ DATA ═══
    profil = signal<ProfilResponse | null>(null);

    // ═══ UI STATE ═══
    currentTab = signal<'coordonnees' | 'securite'>('coordonnees');
    loading = signal(false);
    toastMessage = signal('');
    toastType = signal<'ok' | 'err'>('ok');
    showToast = signal(false);

    // ═══ FORM STATE — COORDONNÉES ═══
    formEmail = signal('');
    formTel = signal('');
    coordonnesDirty = signal(false);
    coordonnesSaving = signal(false);

    // ═══ FORM STATE — MOT DE PASSE ═══
    curPass = signal('');
    newPass = signal('');
    confirmPass = signal('');
    passRequirements = signal({
        len: false,
        upper: false,
        lower: false,
        num: false,
        sym: false
    });
    passStrength = signal(0);
    passMatch = signal(false);
    passSaving = signal(false);

    // ═══ VISIBILITY ═══
    eyeStates = signal({
        cur: false,
        new: false,
        confirm: false
    });

    // ═══ ERRORS ═══
    errors = signal({
        email: '',
        tel: '',
        curPass: '',
        newPass: '',
        confirmPass: ''
    });

    // ═══ COMPUTED ═══
    initials = computed(() => {
        const p = this.profil();
        if (!p) return 'U';
        const first = (p.prenom[0] || '').toUpperCase();
        const last = (p.nom[0] || '').toUpperCase();
        return first + last;
    });

    fullName = computed(() => {
        const p = this.profil();
        if (!p) return 'Utilisateur';
        return `${p.prenom} ${p.nom}`.trim();
    });

    passwordValid = computed(() => {
        const r = this.passRequirements();
        return r.len && r.upper && r.lower && r.num && r.sym;
    });

    canSavePass = computed(() => {
        return (
            this.curPass().trim().length > 0 &&
            this.passwordValid() &&
            this.newPass() === this.confirmPass() &&
            this.passMatch()
        );
    });

    passwordRequirements = computed(() => this.passRequirements());

    isDirtyCoord = computed(() => this.coordonnesDirty());

    formattedCreatedAt = computed(() => {
        const p = this.profil();
        if (!p || !p.createdAt) return 'N/A';
        return this.parseAndFormatDate(p.createdAt);
    });

    constructor(
        private profilService: ProfilService,
        public authService: AuthService
    ) { }

    // ═══ DATE PARSING ═══
    parseAndFormatDate(dateStr: string): string {
        try {
            // Parse "DD/MM/YYYY HH:MM" format
            const parts = dateStr.split(' ');
            if (parts.length < 1) return dateStr;

            const dateParts = parts[0].split('/');
            if (dateParts.length !== 3) return dateStr;

            const [day, month, year] = dateParts;
            const date = new Date(`${year}-${month}-${day}`);

            if (isNaN(date.getTime())) return dateStr;

            // Format as "MMM yyyy" (e.g., "Mar 2026")
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = months[date.getMonth()];
            return `${monthName} ${date.getFullYear()}`;
        } catch {
            return dateStr;
        }
    }

    ngOnInit() {
        this.loadProfil();
    }

    // ═══ LOAD DATA ═══
    loadProfil() {
        this.loading.set(true);
        this.profilService.obtenirProfil().subscribe({
            next: (data) => {
                console.log('✅ Profil reçu:', data);
                this.profil.set(data);
                this.formEmail.set(data.email);
                this.formTel.set(data.telephone);
                this.loading.set(false);
            },
            error: (err: any) => {
                const errorMsg = err?.error?.message || err?.message || 'Erreur serveur';
                const status = err?.status || 'Connexion échouée';
                console.error(`Erreur chargement profil (${status}):`, {
                    message: errorMsg,
                    error: err,
                    rawResponse: err?.error,
                    status: err?.status,
                    statusText: err?.statusText
                });
                this.showErrorToast(`Impossible de charger le profil: ${errorMsg}`);
                this.loading.set(false);
            }
        });
    }

    // ═══ TAB SWITCHING ═══
    switchTab(tab: 'coordonnees' | 'securite') {
        this.currentTab.set(tab);
    }

    // ═══ COORDONNÉES ═══
    markDirty(section: 'coordonnees' | 'securite') {
        if (section === 'coordonnees') {
            this.markDirtyCoord();
        }
    }

    markDirtyCoord() {
        const original = this.profil();
        if (!original) return;

        const changed =
            this.formEmail() !== original.email ||
            this.formTel() !== original.telephone;

        this.coordonnesDirty.set(changed);
    }

    cancelCoord() {
        const p = this.profil();
        if (p) {
            this.formEmail.set(p.email);
            this.formTel.set(p.telephone);
        }
        this.coordonnesDirty.set(false);
        this.clearErrors(['email', 'tel']);
    }

    saveCoord() {
        this.clearErrors(['email', 'tel']);
        let valid = true;

        // Valider email
        const email = this.formEmail().trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            this.setError('email', 'Email invalide.');
            valid = false;
        }

        // Valider téléphone
        const tel = this.formTel().trim();
        if (!tel || tel.length < 8) {
            this.setError('tel', 'Numéro de téléphone invalide.');
            valid = false;
        }

        if (!valid) return;

        this.coordonnesSaving.set(true);
        const data: ModifierCoordonneeRequest = { email, telephone: tel };

        this.profilService.modifierCoordonnees(data).subscribe({
            next: (updated) => {
                this.profil.set(updated);
                this.coordonnesSaving.set(false);
                this.coordonnesDirty.set(false);
                this.showSuccessToast('Coordonnées mises à jour avec succès.');
            },
            error: (err) => {
                this.coordonnesSaving.set(false);
                const msg = err?.error?.message || 'Erreur lors de la mise à jour';
                this.showErrorToast(msg);
            }
        });
    }

    // ═══ MOT DE PASSE ═══
    onNewPassInput() {
        const pwd = this.newPass();
        const reqs = this.checkPasswordRequirements(pwd);
        this.passRequirements.set(reqs);

        const score = Object.values(reqs).filter(Boolean).length;
        this.passStrength.set(score);

        this.updatePasswordMatch();
    }

    updatePasswordMatch() {
        const p1 = this.newPass();
        const p2 = this.confirmPass();
        this.passMatch.set(p1 === p2 && p1.length > 0);
    }

    updateMatch() {
        this.updatePasswordMatch();
    }

    checkPasswordRequirements(pwd: string) {
        return {
            len: pwd.length >= 8,
            upper: /[A-Z]/.test(pwd),
            lower: /[a-z]/.test(pwd),
            num: /[0-9]/.test(pwd),
            sym: /[^A-Za-z0-9]/.test(pwd)
        };
    }

    toggleEye(field: 'cur' | 'new' | 'confirm') {
        const current = this.eyeStates()[field];
        this.eyeStates.update((state) => ({ ...state, [field]: !current }));
    }

    togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
        const fieldMap = { current: 'cur', new: 'new', confirm: 'confirm' } as const;
        this.toggleEye(fieldMap[field]);
    }

    savePassword() {
        this.clearErrors(['curPass', 'newPass', 'confirmPass']);
        let valid = true;

        const cur = this.curPass();
        const p1 = this.newPass();
        const p2 = this.confirmPass();

        if (!cur) {
            this.setError('curPass', 'Veuillez saisir votre mot de passe actuel.');
            valid = false;
        }

        if (!this.passwordValid) {
            this.setError('newPass', 'Le mot de passe ne respecte pas les critères requis.');
            valid = false;
        }

        if (p1 !== p2 || !p2) {
            this.setError('confirmPass', 'Les mots de passe ne correspondent pas.');
            valid = false;
        }

        if (!valid) return;

        this.passSaving.set(true);
        const data: ChangerMotDePasseRequest = {
            motDePasseActuel: cur,
            nouveauMotDePasse: p1
        };

        this.profilService.changerMotDePasse(data).subscribe({
            next: () => {
                this.passSaving.set(false);
                this.curPass.set('');
                this.newPass.set('');
                this.confirmPass.set('');
                this.passRequirements.set({
                    len: false,
                    upper: false,
                    lower: false,
                    num: false,
                    sym: false
                });
                this.showSuccessToast('Mot de passe mis à jour avec succès.');
            },
            error: (err) => {
                this.passSaving.set(false);
                const msg = err?.error?.message || 'Erreur lors de la mise à jour du mot de passe';
                this.showErrorToast(msg);
            }
        });
    }

    // ═══ TOAST & ERRORS ═══
    private showSuccessToast(msg: string) {
        this.toastMessage.set(msg);
        this.toastType.set('ok');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3500);
    }

    private showErrorToast(msg: string) {
        this.toastMessage.set(msg);
        this.toastType.set('err');
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3500);
    }

    private setError(field: string, msg: string) {
        const errors = this.errors();
        if (field in errors) {
            this.errors.set({ ...errors, [field as keyof typeof errors]: msg });
        }
    }

    private clearErrors(fields: string[]) {
        const errors = this.errors();
        fields.forEach((f) => {
            if (f in errors) {
                errors[f as keyof typeof errors] = '';
            }
        });
        this.errors.set({ ...errors });
    }

    getError(field: string): string {
        const errorsObj = this.errors() as Record<string, string>;
        return errorsObj[field] || '';
    }

    hasError(field: string): boolean {
        return this.getError(field).length > 0;
    }
}

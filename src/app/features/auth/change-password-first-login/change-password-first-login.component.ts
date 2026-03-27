import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-change-password-first-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './change-password-first-login.component.html',
    styleUrls: ['./change-password-first-login.component.css']
})
export class ChangePasswordFirstLoginComponent implements OnInit {

    newPassword: string = '';
    confirmPassword: string = '';
    isLoading: boolean = false;
    showSuccess: boolean = false;

    // Password strength
    passwordStrength: number = 0;
    strengthLabel: string = '';
    strengthColor: string = '';

    // Requirements
    requirements = {
        len: false,
        upper: false,
        lower: false,
        num: false,
        sym: false
    };

    // User info
    userName: string = '';
    userEmail: string = '';
    userInitials: string = '';

    // Eye icons visibility
    showNewPassword: boolean = false;
    showConfirmPassword: boolean = false;

    // Error handling
    errorNew: string = '';
    errorConfirm: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private location: Location
    ) { }

    ngOnInit(): void {
        // Get current user info from localStorage or service
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            this.userName = `${user.prenom} ${user.nom}`.trim();
            this.userEmail = user.email;
            const firstChar = (user.prenom?.[0] || '') + (user.nom?.[0] || '');
            this.userInitials = firstChar.toUpperCase() || '?';
        }

        // Prevent back navigation after password change
        history.pushState(null, '', location.href);
        window.addEventListener('popstate', () => {
            if (this.showSuccess) {
                history.pushState(null, '', location.href);
            }
        });
    }

    /**
     * Check password requirements
     */
    checkRequirements(): void {
        const pwd = this.newPassword;

        this.requirements = {
            len: pwd.length >= 8,
            upper: /[A-Z]/.test(pwd),
            lower: /[a-z]/.test(pwd),
            num: /[0-9]/.test(pwd),
            sym: /[^A-Za-z0-9]/.test(pwd)
        };

        // Calculate strength
        const score = Object.values(this.requirements).filter(Boolean).length;
        this.passwordStrength = score;

        const strengthLevels = [
            { label: 'Très faible', color: '#E30613' },
            { label: 'Faible', color: '#E30613' },
            { label: 'Moyen', color: '#f59e0b' },
            { label: 'Fort', color: '#2d9a58' },
            { label: 'Très fort', color: '#1a6b35' }
        ];

        if (score > 0) {
            const level = strengthLevels[score - 1];
            this.strengthLabel = level.label;
            this.strengthColor = level.color;
        }
    }

    /**
     * Toggle password visibility
     */
    togglePasswordVisibility(field: 'new' | 'confirm'): void {
        if (field === 'new') {
            this.showNewPassword = !this.showNewPassword;
        } else {
            this.showConfirmPassword = !this.showConfirmPassword;
        }
    }

    /**
     * Check if passwords match
     */
    passwordsMatch(): boolean {
        return this.newPassword === this.confirmPassword && this.newPassword.length > 0;
    }

    /**
     * Check if all requirements are met
     */
    allRequirementsMet(): boolean {
        return Object.values(this.requirements).every(Boolean);
    }

    /**
     * Submit form
     */
    handleSubmit(): void {
        this.errorNew = '';
        this.errorConfirm = '';

        // Validation
        if (!this.newPassword) {
            this.errorNew = 'Veuillez saisir un nouveau mot de passe.';
            return;
        }

        if (!this.allRequirementsMet()) {
            this.errorNew = 'Le mot de passe ne remplit pas tous les critères requis.';
            return;
        }

        if (!this.confirmPassword) {
            this.errorConfirm = 'Veuillez confirmer votre mot de passe.';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorConfirm = 'Les mots de passe ne correspondent pas.';
            return;
        }

        // Submit
        this.isLoading = true;

        this.authService.changePasswordFirstLogin({
            nouveauMotDePasse: this.newPassword,
            confirmerMotDePasse: this.confirmPassword
        }).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.showSuccess = true;
                console.log('Mot de passe changé avec succès!');

                // Update token in localStorage if needed
                if (response.token) {
                    const authData = localStorage.getItem('auth');
                    if (authData) {
                        const auth = JSON.parse(authData);
                        auth.access_token = response.token;
                        localStorage.setItem('auth', JSON.stringify(auth));
                    }
                }

                // Redirect after 3 seconds
                setTimeout(() => {
                    this.router.navigate(['/agent-rh/dashboard']);
                }, 3000);
            },
            error: (error) => {
                this.isLoading = false;
                const errorMessage = error.error?.message || 'Erreur lors du changement de mot de passe';
                console.error('Error:', errorMessage);
                alert(errorMessage);
            }
        });
    }
}

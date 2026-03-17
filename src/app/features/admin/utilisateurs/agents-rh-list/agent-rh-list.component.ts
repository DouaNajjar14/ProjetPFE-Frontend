import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentRHService } from '../../../../core/services/agent-rh.service';
import { AgentRH, AgentRHRequest, AgentRHUpdateRequest } from '../../../../core/models/agent-rh.model';

@Component({
  selector: 'app-agent-rh-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-rh-list.component.html',
  styleUrls: ['./agent-rh-list.component.css']
})
export class AgentRhListComponent implements OnInit {
  agents = signal<AgentRH[]>([]);
  filteredAgents = signal<AgentRH[]>([]);
  currentPage = signal(1);
  readonly pageSize = 10;
  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredAgents().length / this.pageSize)));
  paginatedAgents = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAgents().slice(start, start + this.pageSize);
  });
  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });
  isLoading = signal(false);
  searchTerm = '';
  activeFilter: 'actifs' | 'archives' | 'tous' = 'actifs';

  // Modal
  showModal = signal(false);
  showConfirm = signal(false);
  showDetail = signal(false);
  modalMode: 'create' | 'edit' = 'create';
  editingAgent: AgentRH | null = null;
  selectedAgent: AgentRH | null = null;
  modalError = signal<string | null>(null);
  isSaving = signal(false);
  confirmAgent: AgentRH | null = null;
  showPassword = false;

  // Form fields
  formNom = '';
  formPrenom = '';
  formEmail = '';
  formTel = '';
  formMotDePasse = '';

  // Validation touched state
  formTouched: Record<string, boolean> = {};

  // Toast
  toastMessage = signal<string | null>(null);
  toastType = signal<'success' | 'error'>('success');

  constructor(private agentService: AgentRHService) { }

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoading.set(true);
    const obs =
      this.activeFilter === 'actifs' ? this.agentService.listerActifs() :
        this.activeFilter === 'archives' ? this.agentService.listerArchives() :
          this.agentService.listerTous();

    obs.subscribe({
      next: (data) => {
        this.agents.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        this.showToast('Erreur lors du chargement des agents RH', 'error');
        this.isLoading.set(false);
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const filtered = this.agents().filter(a =>
      a.nom.toLowerCase().includes(term) ||
      a.prenom.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term)
    );
    this.filteredAgents.set(filtered);
    this.currentPage.set(1);
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  setFilter(filter: 'actifs' | 'archives' | 'tous'): void {
    this.activeFilter = filter;
    this.loadAgents();
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) this.currentPage.set(page);
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.resetForm();
    this.editingAgent = null;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  openEditModal(agent: AgentRH): void {
    this.modalMode = 'edit';
    this.formNom = agent.nom;
    this.formPrenom = agent.prenom;
    this.formEmail = agent.email;
    this.formTel = agent.tel || '';
    this.formMotDePasse = '';
    this.editingAgent = agent;
    this.modalError.set(null);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.resetForm();
    this.editingAgent = null;
    this.modalError.set(null);
  }

  resetForm(): void {
    this.formNom = '';
    this.formPrenom = '';
    this.formEmail = '';
    this.formTel = '';
    this.formMotDePasse = '';
    this.showPassword = false;
    this.formTouched = {};
  }

  touchField(field: string): void {
    this.formTouched[field] = true;
  }

  markAllTouched(): void {
    ['nom', 'prenom', 'email', 'tel', 'motDePasse'].forEach(f => this.formTouched[f] = true);
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidTel(tel: string): boolean {
    // +216 suivi d'un préfixe 20-29, 50-59 ou 90-98, puis 3+3 chiffres
    return /^\+216 (2[0-9]|5[0-9]|9[0-8]) \d{3} \d{3}$/.test(tel.trim());
  }

  isFieldInvalid(field: string): boolean {
    if (!this.formTouched[field]) return false;
    return !!this.getFieldError(field);
  }

  getFieldError(field: string): string | null {
    if (!this.formTouched[field]) return null;
    switch (field) {
      case 'nom':
        if (!this.formNom.trim()) return 'Le nom est obligatoire';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(this.formNom.trim())) return 'Le nom doit contenir uniquement des lettres';
        if (this.formNom.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        if (this.formNom.trim().length > 50) return 'Le nom ne doit pas dépasser 50 caractères';
        return null;
      case 'prenom':
        if (!this.formPrenom.trim()) return 'Le prénom est obligatoire';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(this.formPrenom.trim())) return 'Le prénom doit contenir uniquement des lettres';
        if (this.formPrenom.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        if (this.formPrenom.trim().length > 50) return 'Le prénom ne doit pas dépasser 50 caractères';
        return null;
      case 'email':
        if (!this.formEmail.trim()) return 'L\'email est obligatoire';
        if (!/^[a-zA-Z0-9._%+-]+@ooredoo\.tn$/i.test(this.formEmail.trim())) return 'L\'email doit être au format xxx@ooredoo.tn';
        return null;
      case 'tel':
        if (this.formTel.trim()) {
          const telClean = this.formTel.replace(/[\s\-\.+]/g, '');
          // Remove 216 prefix if present
          const telDigits = telClean.replace(/^216/, '');
          if (!/^\d{8}$/.test(telDigits)) return 'Le téléphone doit contenir exactement 8 chiffres';
          if (!/^[2459]\d{7}$/.test(telDigits)) return 'Le téléphone doit commencer par 2, 4, 5 ou 9';
        }
        return null;
      default:
        return null;
    }
  }

  hasFormErrors(): boolean {
    const fields = ['nom', 'prenom', 'email', 'tel'];
    return fields.some(f => {
      const tempTouched = this.formTouched[f];
      this.formTouched[f] = true;
      const hasError = !!this.getFieldError(f);
      this.formTouched[f] = tempTouched;
      return hasError;
    });
  }

  // ═══════ AUTO-GENERATE PASSWORD ═══════
  generatePassword(): string {
    const prenom = this.formPrenom.trim().toLowerCase().replace(/[^a-z]/g, '');
    const nom = this.formNom.trim().toLowerCase().replace(/[^a-z]/g, '');

    // Get 3 chars from prenom (pad with 'x' if shorter)
    const prenomPart = (prenom + 'xxx').substring(0, 3);
    // Get 3 chars from nom (pad with 'x' if shorter)
    const nomPart = (nom + 'xxx').substring(0, 3);

    // Random digit
    const digit = Math.floor(Math.random() * 10).toString();

    // Random symbol
    const symbols = '!@#$%&*?';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];

    // Combine: First char uppercase
    const password = prenomPart.charAt(0).toUpperCase() + prenomPart.substring(1) + nomPart + digit + symbol;

    return password;
  }

  onNameChange(): void {
    if (this.modalMode === 'create' && this.formPrenom.trim() && this.formNom.trim()) {
      this.formMotDePasse = this.generatePassword();
    }
  }

  getPasswordStrength(): 'weak' | 'medium' | 'strong' {
    const p = this.formMotDePasse;
    const hasUpper = /[A-Z]/.test(p);
    const hasDigit = /[0-9]/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);
    const hasLength = p.length >= 8;
    const criteria = [hasLength, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
    if (criteria === 4) return 'strong';
    if (criteria >= 2) return 'medium';
    return 'weak';
  }

  getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrength();
    return s === 'strong' ? 'Fort' : s === 'medium' ? 'Moyen' : 'Faible';
  }

  passwordCriteria() {
    const p = this.formMotDePasse;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      digit: /[0-9]/.test(p),
      symbol: /[^A-Za-z0-9]/.test(p)
    };
  }

  saveModal(): void {
    this.markAllTouched();
    if (this.hasFormErrors()) {
      this.modalError.set('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.isSaving.set(true);
    this.modalError.set(null);

    if (this.modalMode === 'create') {
      // Auto-generate password if not already done
      if (!this.formMotDePasse.trim()) {
        this.formMotDePasse = this.generatePassword();
      }
      const request: AgentRHRequest = {
        nom: this.formNom.trim(),
        prenom: this.formPrenom.trim(),
        email: this.formEmail.trim(),
        tel: this.formTel.trim(),
        motDePasse: this.formMotDePasse
      };
      this.agentService.creer(request).subscribe({
        next: () => {
          this.showToast('Agent RH créé avec succès', 'success');
          this.closeModal();
          this.loadAgents();
          this.isSaving.set(false);
        },
        error: (err) => {
          this.modalError.set(err.error?.message || 'Erreur lors de la création');
          this.isSaving.set(false);
        }
      });
    } else {
      const editId = this.editingAgent!.id;
      const request: AgentRHUpdateRequest = {
        nom: this.formNom.trim(),
        prenom: this.formPrenom.trim(),
        email: this.formEmail.trim(),
        tel: this.formTel.trim()
      };
      this.agentService.modifier(editId, request).subscribe({
        next: (updatedAgent) => {
          // Update in place instead of reloading
          const updated = this.agents().map(a =>
            a.id === editId ? updatedAgent : a
          );
          this.agents.set(updated);
          this.applyFilter();
          this.showToast('Agent RH modifié avec succès', 'success');
          this.closeModal();
          this.isSaving.set(false);
        },
        error: (err) => {
          this.modalError.set(err.error?.message || 'Erreur lors de la modification');
          this.isSaving.set(false);
        }
      });
    }
  }

  // Detail view
  openDetailModal(agent: AgentRH): void {
    this.selectedAgent = agent;
    this.showDetail.set(true);
  }

  closeDetailModal(): void {
    this.showDetail.set(false);
    this.selectedAgent = null;
  }

  editFromDetail(): void {
    if (this.selectedAgent) {
      const agent = this.selectedAgent;
      this.closeDetailModal();
      this.openEditModal(agent);
    }
  }

  // Archive/Unarchive
  openArchiveConfirm(agent: AgentRH): void {
    this.confirmAgent = agent;
    this.showConfirm.set(true);
  }

  closeConfirm(): void {
    this.showConfirm.set(false);
    this.confirmAgent = null;
  }

  confirmArchive(): void {
    if (!this.confirmAgent) return;

    const action = this.confirmAgent.actif
      ? this.agentService.archiver(this.confirmAgent.id)
      : this.agentService.desarchiver(this.confirmAgent.id);

    const label = this.confirmAgent.actif ? 'archivé' : 'désarchivé';

    action.subscribe({
      next: () => {
        this.showToast(`Agent RH ${label} avec succès`, 'success');
        this.closeConfirm();
        this.loadAgents();
      },
      error: () => {
        this.showToast(`Erreur lors de l'opération`, 'error');
        this.closeConfirm();
      }
    });
  }

  // Toast
  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  get activeCount(): number {
    return this.agents().filter(a => a.actif).length;
  }

  get archivedCount(): number {
    return this.agents().filter(a => !a.actif).length;
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

@Component({
    selector: 'app-public-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, PublicHeaderComponent, PublicFooterComponent],
    template: `
    <div class="min-h-screen flex flex-col bg-brand-bg">
      <app-public-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-public-footer />
    </div>
  `
})
export class PublicLayoutComponent { }

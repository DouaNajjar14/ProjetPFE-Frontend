import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TYPE_STAGE_INFO, TypeStageInfo } from '../../../core/models/candidature.model';

@Component({
  selector: 'app-stages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.css']
})
export class StagesComponent {
  typeStages = TYPE_STAGE_INFO;

  getIconBg(c: string): string {
    const m: Record<string, string> = { blue: 'rgba(2,132,199,.1)', amber: 'rgba(180,83,9,.1)', green: 'rgba(5,150,105,.1)', red: 'rgba(226,0,26,.08)' };
    return m[c] ?? '#f3f4f6';
  }

  getStroke(c: string): string {
    const m: Record<string, string> = { blue: '#0284c7', amber: '#b45309', green: '#059669', red: '#E2001A' };
    return m[c] ?? '#6b7280';
  }

  getTagBg(c: string): string {
    const m: Record<string, string> = { blue: 'rgba(2,132,199,.09)', amber: 'rgba(180,83,9,.09)', green: 'rgba(5,150,105,.09)', red: 'rgba(226,0,26,.08)' };
    return m[c] ?? '#f3f4f6';
  }
}

import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safe',
    standalone: true
})
@Injectable({
    providedIn: 'root'
})
export class SafePipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    /**
     * Bypass security for resource URLs
     * Required for iframes, object, embed, and script tags with dynamic URLs
     * Example: <iframe [src]="url | safe"></iframe>
     */
    transform(value: string): SafeResourceUrl {
        if (!value) {
            return this.sanitizer.bypassSecurityTrustResourceUrl('');
        }
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }
}

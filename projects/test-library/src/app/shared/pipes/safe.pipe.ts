import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(url: string | null | undefined): SafeUrl | null {
    if (!url) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
}

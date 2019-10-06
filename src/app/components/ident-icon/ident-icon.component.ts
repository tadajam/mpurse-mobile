import { Component, Input, SimpleChanges } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-ident-icon',
  templateUrl: './ident-icon.component.html',
  styleUrls: ['./ident-icon.component.scss']
})
export class IdentIconComponent {
  @Input() address: string;
  @Input() diameter: number;
  trustSvg: SafeHtml;

  constructor(
    private keyringService: KeyringService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.address) {
      if (this.address) {
        this.trustSvg = this.sanitizer.bypassSecurityTrustHtml(
          this.keyringService.createIdentIcon(
            changes.address.currentValue,
            this.diameter
          )
        );
      }
    }
  }
}

import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss']
})
export class StartPage {
  private isDisable = false;

  constructor(
    private router: Router,
    private keyringService: KeyringService,
    private commonService: CommonService
  ) {}

  createNew(): void {
    this.isDisable = true;
    this.keyringService
      .existsVault()
      .pipe(
        map((exists: boolean) => {
          if (!exists) {
            this.keyringService.createDefaultKeyring();
          } else {
            throw new Error('An account already exists.');
          }
        })
      )
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: error => this.commonService.presentErrorToast(error.toString())
      });
  }
}

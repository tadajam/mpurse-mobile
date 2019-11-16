import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { Observable } from 'rxjs';

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

  existsVault(): Observable<void> {
    return this.keyringService.existsVault().pipe(
      map(exists => {
        if (exists) {
          throw new Error('An account already exists.');
        }
      })
    );
  }

  createNew(): void {
    this.isDisable = true;
    this.existsVault()
      .pipe(map(() => this.keyringService.createDefaultKeyring()))
      .subscribe({
        next: () => this.router.navigateByUrl('/'),
        error: error => this.commonService.presentErrorToast(error.toString())
      });
  }

  generateCustomSeed(): void {
    this.existsVault().subscribe({
      next: () =>
        this.router.navigateByUrl(
          this.router.createUrlTree(['/password'], {
            queryParams: { custom: true }
          })
        ),
      error: error => this.commonService.presentErrorToast(error.toString())
    });
  }

  importExistingSeed(): void {
    this.existsVault().subscribe({
      next: () =>
        this.router.navigateByUrl(
          this.router.createUrlTree(['/password'], {
            queryParams: { import: true }
          })
        ),
      error: error => this.commonService.presentErrorToast(error.toString())
    });
  }
}

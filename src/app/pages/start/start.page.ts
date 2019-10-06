import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-start',
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss']
})
export class StartPage {
  private isDisable = false;

  constructor(private router: Router, private keyringService: KeyringService) {}

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
        error: error => console.log(error)
      });
  }
}

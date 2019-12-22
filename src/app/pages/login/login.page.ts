import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { CommonService } from 'src/app/services/common.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { NavController, AlertController } from '@ionic/angular';
import { PreferenceService } from 'src/app/services/preference.service';
import { from } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  hide = true;
  shouldInput = false;

  passwordControl = new FormControl('', [Validators.required]);

  passwordForm = new FormGroup({
    password: this.passwordControl
  });

  constructor(
    private keyringService: KeyringService,
    private commonService: CommonService,
    private navController: NavController,
    private preferenceService: PreferenceService,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {}

  ionViewDidEnter(): void {
    this.shouldInput = false;
    this.keyringService.unlockWithTouchId().subscribe({
      next: () => this.navController.navigateRoot('/'),
      error: () => (this.shouldInput = true)
    });
  }

  login(): void {
    this.keyringService.unlock(this.passwordControl.value).subscribe({
      next: () => {
        this.shouldInput = false;
        this.navController.navigateRoot('/');
      },
      error: error => {
        this.commonService.presentErrorToast(error.toString());
      }
    });
  }

  initMpurse(): void {
    const buttons: any[] = [
      { text: this.translateService.instant('login.cancel'), role: 'cancel' },
      {
        text: this.translateService.instant('login.initialize'),
        handler: (): void => {
          this.keyringService
            .purgeVault()
            .pipe(flatMap(() => this.preferenceService.resetPreferences()))
            .subscribe({
              next: () => this.navController.navigateRoot('/')
            });
        }
      }
    ];
    from(
      this.alertController.create({
        header: this.translateService.instant('login.initialize'),
        message: this.translateService.instant('login.initializeMessage'),
        buttons: buttons
      })
    ).subscribe({ next: alert => alert.present() });
  }
}

import { Component } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { flatMap, map } from 'rxjs/operators';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { CommonService } from 'src/app/services/common.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-password',
  templateUrl: './password.page.html',
  styleUrls: ['./password.page.scss']
})
export class PasswordPage {
  custom = false;
  import = false;
  hide = true;

  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8)
  ]);
  confirmPasswordControl = new FormControl('', []);
  useBiometricsControl = new FormControl(false, []);

  passwordForm = new FormGroup(
    {
      password: this.passwordControl,
      confirmPassword: this.confirmPasswordControl,
      biometrics: this.useBiometricsControl
    },
    { validators: this.checkPasswords }
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private commonService: CommonService,
    private navController: NavController
  ) {}

  ionViewDidEnter(): void {
    this.activatedRoute.queryParams
      .pipe(
        map(params => {
          if (params.custom) {
            this.custom = params.custom;
          } else if (params.import) {
            this.import = params.import;
          }
        }),
        flatMap(() => this.keyringService.isEncrypted())
      )
      .subscribe({
        next: isEncrypted => {
          if (isEncrypted) {
            this.openSeedPhrasePage();
          }
        }
      });

    this.keyringService.isAvailableKeychainTouchId().subscribe({
      next: () => {
        this.useBiometricsControl.enable();
        this.useBiometricsControl.setValue(true);
      },
      error: () => this.useBiometricsControl.disable()
    });
  }

  checkPasswords(group: FormGroup): { [key: string]: any } | null {
    const pass = group.controls.password.value;
    const confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? null : { notMatch: true };
  }

  cancel(): void {
    this.navController.navigateRoot('/home/wallet');
  }

  encrypt(): void {
    if (this.useBiometricsControl.value) {
      this.keyringService
        .savePasswordWithTouchId(this.passwordControl.value)
        .subscribe({
          next: () => {
            this.preferenceService.setUseBiometrics(true);
            this.openSeedPhrasePage();
          },
          error: () =>
            this.commonService.presentErrorToast(
              'An error occurred during biometric authentication'
            )
        });
    } else {
      this.keyringService.setPassword(this.passwordControl.value).subscribe({
        next: () => {
          this.preferenceService.setUseBiometrics(false);
          this.openSeedPhrasePage();
        }
      });
    }
  }

  openSeedPhrasePage(): void {
    if (!this.custom && !this.import) {
      this.navController.navigateRoot('/seed-phrase');
    } else {
      this.router.navigateByUrl(
        this.router.createUrlTree(['/seed-phrase'], {
          queryParams: { custom: this.custom, import: this.import }
        })
      );
    }
  }
}
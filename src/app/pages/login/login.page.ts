import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { CommonService } from 'src/app/services/common.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  hide = true;
  shouldInput = false;

  passwordControl = new FormControl('123456789', [Validators.required]);

  passwordForm = new FormGroup({
    password: this.passwordControl
  });

  constructor(
    private keyringService: KeyringService,
    private commonService: CommonService,
    private navController: NavController
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
}

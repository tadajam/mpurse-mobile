import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PreferenceService } from 'src/app/services/preference.service';
import { KeyringService } from 'src/app/services/keyring.service';
import { Location } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-import-account',
  templateUrl: './import-account.page.html',
  styleUrls: ['./import-account.page.scss']
})
export class ImportAccountPage {
  nameControl = new FormControl('');
  privatekeyControl = new FormControl('', [Validators.required]);

  importForm = new FormGroup({
    name: this.nameControl,
    privatekey: this.privatekeyControl
  });

  constructor(
    private keyringService: KeyringService,
    private modalController: ModalController,
    private preferenceService: PreferenceService,
    private location: Location,
    private commonService: CommonService
  ) {}

  ionViewDidEnter(): void {
    this.nameControl.setValue(this.preferenceService.incrementAccountName());
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  importAccount(): void {
    this.keyringService
      .importAccount(this.nameControl.value, this.privatekeyControl.value)
      .subscribe({
        next: (address: string) => {
          this.preferenceService.changeAddress(address);
          this.location.back();
        },
        error: error => this.commonService.presentErrorToast(error.toString())
      });
  }
}

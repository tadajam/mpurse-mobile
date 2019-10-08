import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PreferenceService } from 'src/app/services/preference.service';
import { KeyringService } from 'src/app/services/keyring.service';
import { from } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-import-account',
  templateUrl: './import-account.page.html',
  styleUrls: ['./import-account.page.scss']
})
export class ImportAccountPage implements OnInit {
  nameFormControl = new FormControl('');
  privatekeyFormControl = new FormControl('', [Validators.required]);

  importForm = new FormGroup({
    name: this.nameFormControl,
    privatekey: this.privatekeyFormControl
  });

  constructor(
    private keyringService: KeyringService,
    public modalController: ModalController,
    private preferenceService: PreferenceService,
    public toastController: ToastController,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.nameFormControl.setValue(
      this.preferenceService.incrementAccountName()
    );
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  importAccount(): void {
    this.keyringService
      .importAccount(
        this.nameFormControl.value,
        this.privatekeyFormControl.value
      )
      .subscribe({
        next: (address: string) => {
          this.preferenceService.changeAddress(address);
          this.location.back();
        },
        error: error => {
          from(
            this.toastController.create({
              message: error.toString(),
              duration: 2000
            })
          ).subscribe(toast => toast.present());
        }
      });
  }
}

import { Component, OnInit } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { from } from 'rxjs';
import { Identity } from 'src/app/interfaces/identity';
import { ModalController } from '@ionic/angular';
import { ImportAccountPage } from '../import-account/import-account.page';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss']
})
export class AccountsPage implements OnInit {
  isDisable = false;
  identities: Identity[] = [];
  selectedAddress = '';

  constructor(
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    public modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.identities = this.preferenceService.getIdentities();
    this.selectedAddress = this.preferenceService.getSelectedAddress();
  }

  changeAddress(address: string): void {
    this.preferenceService.changeAddress(address);
    this.modalController.dismiss();
  }

  addAccount(): void {
    this.isDisable = true;
    this.preferenceService.changeAddress(this.keyringService.addAccount());
    this.modalController.dismiss();
    this.isDisable = false;
  }

  openImportPage(): void {
    this.modalController.dismiss();
    from(
      this.modalController.create({ component: ImportAccountPage })
    ).subscribe(modal => modal.present());
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}

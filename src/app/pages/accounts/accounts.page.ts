import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Identity } from 'src/app/interfaces/identity';
import { ModalController, AlertController } from '@ionic/angular';
import { from } from 'rxjs';
import { ImportAccountPage } from '../import-account/import-account.page';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.page.html',
  styleUrls: ['./accounts.page.scss']
})
export class AccountsPage {
  isDisable = false;
  identities: Identity[] = [];
  selectedAddress = '';

  constructor(
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    public alertController: AlertController
  ) {}

  ionViewDidEnter(): void {
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
    this.isDisable = true;
    this.modalController.dismiss();
    from(
      this.modalController.create({ component: ImportAccountPage })
    ).subscribe({
      next: modal => modal.present()
    });
    this.isDisable = false;
  }

  removeAccount(address: string): void {
    const buttons: any[] = [
      { text: 'CANCEL', role: 'cancel' },
      {
        text: 'REMOVE',
        handler: (): void => {
          this.keyringService.removeAccount(address);
          this.closeModal();
        }
      }
    ];
    from(
      this.alertController.create({
        header: 'REMOVE',
        message: 'Are you sure you want to remove this account?',
        buttons: buttons
      })
    ).subscribe({ next: alert => alert.present() });
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}

import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { ExportPage } from '../export/export.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  private subscriptions = new Subscription();
  lang = 'en';
  searchEngine = 'google';
  address = '';
  accountName = '';

  constructor(
    private router: Router,
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    public alertController: AlertController,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.lang = this.preferenceService.getLanguage();
    this.updateAddress(this.preferenceService.getSelectedAddress());

    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => {
          this.updateAddress(address);
        }
      })
    );
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  updateAddress(address: string): void {
    this.address = address;
    const identity = this.preferenceService.getIdentity(address);
    this.accountName = identity ? identity.name : '';
  }

  changeLang(): void {
    this.preferenceService.setLanguage(this.lang);
  }

  initMpurse(): void {
    const buttons: any[] = [
      { text: 'CANCEL', role: 'cancel' },
      {
        text: 'Initialize',
        handler: (): void => {
          this.keyringService
            .purgeVault()
            .pipe(flatMap(() => this.preferenceService.resetPreferences()))
            .subscribe({
              next: () => this.router.navigateByUrl('/')
            });
        }
      }
    ];
    from(
      this.alertController.create({
        header: 'INITIALIZE',
        message: 'Are you sure you want to remove all?',
        buttons: buttons
      })
    ).subscribe({ next: alert => alert.present() });
  }

  openExportPage(isPhrase: boolean): void {
    from(
      this.modalController.create({
        component: ExportPage,
        componentProps: {
          address: isPhrase ? '' : this.address
        }
      })
    ).subscribe({
      next: modal => modal.present()
    });
  }
}

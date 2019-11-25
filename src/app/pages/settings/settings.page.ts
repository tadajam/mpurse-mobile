import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { flatMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { ExportPage } from '../export/export.page';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  subscriptions: Subscription;
  lang = 'en';
  searchEngine = 'google';
  address = '';
  accountName = '';

  constructor(
    private router: Router,
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private alertController: AlertController,
    private modalController: ModalController,
    private commonService: CommonService
  ) {}

  ionViewDidEnter(): void {
    this.lang = this.preferenceService.getLanguage();
    this.searchEngine = this.preferenceService.getSearchEngine();

    this.updateAddress(this.preferenceService.getSelectedAddress());
    this.subscriptions = new Subscription();
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

  changeSearchEngine(): void {
    this.preferenceService.setSearchEngine(this.searchEngine);
  }

  deleteHistories(): void {
    const buttons: any[] = [
      { text: 'CANCEL', role: 'cancel' },
      {
        text: 'REMOVE',
        handler: (): void => {
          this.preferenceService.deleteHistories();
        }
      }
    ];
    from(
      this.alertController.create({
        header: 'BROWSER HISTORY',
        message: 'Are you sure you want to remove browser history?',
        buttons: buttons
      })
    ).subscribe({ next: alert => alert.present() });
  }

  initMpurse(): void {
    const buttons: any[] = [
      { text: 'CANCEL', role: 'cancel' },
      {
        text: 'INITIALIZE',
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

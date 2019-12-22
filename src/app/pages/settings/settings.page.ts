import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { flatMap } from 'rxjs/operators';
import {
  AlertController,
  ModalController,
  NavController
} from '@ionic/angular';
import { from, Subscription } from 'rxjs';
import { ExportPage } from '../export/export.page';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss']
})
export class SettingsPage {
  subscriptions: Subscription;
  lang = 'en';
  searchEngine = 'google';
  autoLockTime = 15000;

  address = '';
  accountName = '';

  constructor(
    private navController: NavController,
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private alertController: AlertController,
    private modalController: ModalController,
    private translateService: TranslateService
  ) {}

  ionViewDidEnter(): void {
    this.lang = this.preferenceService.getLanguage();
    this.searchEngine = this.preferenceService.getSearchEngine();
    this.autoLockTime = this.preferenceService.getAutoLockTime();

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

  changeAutoLockTime(): void {
    this.preferenceService.setAutoLockTime(this.autoLockTime);
  }

  deleteHistories(): void {
    const buttons: any[] = [
      {
        text: this.translateService.instant('settings.cancel'),
        role: 'cancel'
      },
      {
        text: this.translateService.instant('settings.remove'),
        handler: (): void => {
          this.preferenceService.deleteHistories();
        }
      }
    ];
    from(
      this.alertController.create({
        header: this.translateService.instant('settings.removeBrowserHistory'),
        message: this.translateService.instant(
          'settings.browserHistoryConfirmation'
        ),
        buttons: buttons
      })
    ).subscribe({ next: alert => alert.present() });
  }

  initMpurse(): void {
    const buttons: any[] = [
      {
        text: this.translateService.instant('settings.cancel'),
        role: 'cancel'
      },
      {
        text: this.translateService.instant('settings.initialize'),
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
        header: this.translateService.instant('settings.initialize'),
        message: this.translateService.instant(
          'settings.initializeConfirmation'
        ),
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

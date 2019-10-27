import { Component } from '@angular/core';
import { PreferenceService } from 'src/app/services/preference.service';
import { Subscription, from } from 'rxjs';
import { KeyringService } from 'src/app/services/keyring.service';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';
import { FormControl } from '@angular/forms';
import { BackgroundService } from 'src/app/services/background.service';
import { CommonService } from 'src/app/services/common.service';
import { AccountsPage } from '../accounts/accounts.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.page.html',
  styleUrls: ['./browser.page.scss']
})
export class BrowserPage {
  private subscriptions = new Subscription();
  address: string;
  searchStrControl = new FormControl('');
  appList: { href: string; title: string; icon: string }[] = [
    {
      href: 'https://web3.askmona.org/',
      title: 'Ask Mona 3.0',
      icon: 'https://web3.askmona.org/apple-touch-icon.png'
    }
  ];

  constructor(
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private inAppBrowserService: InAppBrowserService,
    private backgroundService: BackgroundService,
    private commonService: CommonService,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.address = this.preferenceService.getSelectedAddress();

    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => (this.address = address)
      })
    );
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe({
      next: modal => modal.present()
    });
  }

  open(searchStr: string): void {
    this.inAppBrowserService.open(searchStr);
  }

  search(): void {
    if (this.searchStrControl.value !== '') {
      this.open(this.searchStrControl.value);
    }
  }
}

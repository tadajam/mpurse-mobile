import { Component, OnInit } from '@angular/core';
import { PreferenceService } from 'src/app/services/preference.service';
import { Subscription, from } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { AccountsPage } from '../accounts/accounts.page';
import { KeyringService } from 'src/app/services/keyring.service';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';
import { FormControl } from '@angular/forms';
import { BackgroundService } from 'src/app/services/background.service';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.page.html',
  styleUrls: ['./browser.page.scss']
})
export class BrowserPage implements OnInit {
  private subscriptions = new Subscription();
  address: string;
  searchStr = new FormControl('');
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
    private modalController: ModalController,
    private inAppBrowserService: InAppBrowserService,
    private backgroundService: BackgroundService
  ) {}

  ngOnInit(): void {
    this.address = this.preferenceService.getSelectedAddress();

    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => (this.address = address),
        error: error => console.log(error)
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe(
      modal => modal.present()
    );
  }

  open(url: string): void {
    this.inAppBrowserService.open(url);
  }

  search(): void {
    if (this.searchStr.value !== '') {
      this.open(this.searchStr.value);
    }
  }
}

import { Component } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  address = '';
  accountName = '';
  private subscriptions = new Subscription();

  constructor(
    private keyringService: KeyringService,
    private preferenceService: PreferenceService
  ) {}

  ionViewDidEnter(): void {
    this.updateAddress(this.preferenceService.getSelectedAddress());

    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => this.updateAddress(address)
      })
    );
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  updateAddress(address: string): void {
    this.address = address;
    const identity = this.preferenceService.getIdentity(this.address);
    this.accountName = identity ? identity.name : '';
  }
}

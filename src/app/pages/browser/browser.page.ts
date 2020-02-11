import { Component } from '@angular/core';
import { PreferenceService } from 'src/app/services/preference.service';
import { Subscription, from } from 'rxjs';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';
import { FormControl } from '@angular/forms';
import { AccountsPage } from '../accounts/accounts.page';
import { ModalController, PopoverController } from '@ionic/angular';
import { AppInfo } from 'src/app/interfaces/app-info';
import { AppInfoPage } from '../app-info/app-info.page';
import { AppGroup } from 'src/app/enum/app-group.enum';
import { BrowserPopoverComponent } from 'src/app/components/browser-popover/browser-popover.component';

@Component({
  selector: 'app-browser',
  templateUrl: './browser.page.html',
  styleUrls: ['./browser.page.scss']
})
export class BrowserPage {
  subscriptions: Subscription;
  address: string;
  searchStrControl = new FormControl('');
  isReorderMode = false;
  appList: AppInfo[] = [
    {
      href: 'https://web3.askmona.org/',
      title: 'Ask Mona 3.0',
      icon: 'https://web3.askmona.org/apple-touch-icon.png',
      description:
        'Ask Mona 3.0では、掲示板形式で簡単にMONAをやり取りすることができます。質問したり、答えたりしてMONAを手に入れてください。'
    },
    {
      href: 'https://mpurse-extension.komikikaku.com/step',
      title: 'Mpurseエクステ',
      icon: 'https://mpurse-extension.komikikaku.com/ogimage.png',
      description: 'Mpurseとモナパレットがあわさりサイキョーにベンリ'
    }
  ];

  constructor(
    private preferenceService: PreferenceService,
    private inAppBrowserService: InAppBrowserService,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) {}

  ionViewDidEnter(): void {
    this.address = this.preferenceService.getSelectedAddress();

    this.subscriptions = new Subscription();
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

  openAppInfoPage(group: AppGroup | string): void {
    from(
      this.modalController.create({
        component: AppInfoPage,
        componentProps: {
          appGroup: group
        }
      })
    ).subscribe({
      next: modal => modal.present()
    });
  }

  openPopover(event: any): void {
    from(
      this.popoverController.create({
        component: BrowserPopoverComponent,
        event: event
      })
    ).subscribe({
      next: popover => popover.present()
    });
  }

  open(searchStr: string): void {
    this.inAppBrowserService.open(searchStr);
  }

  search(): void {
    if (this.searchStrControl.value !== '') {
      this.open(this.searchStrControl.value);
      this.searchStrControl.setValue('');
    }
  }

  getFavorites(): AppInfo[] {
    return this.preferenceService.getFavorites();
  }

  getHeadFavorites(): AppInfo[] {
    return this.preferenceService.getFavorites().slice(0, 5);
  }

  toggleFavorite(favorite: AppInfo): void {
    if (this.getFavorites().some(v => v.href === favorite.href)) {
      this.preferenceService.deleteFavorite(favorite.href);
    } else {
      this.preferenceService.addFavorite(favorite);
    }
  }

  isFavorite(favoriteHref: string): boolean {
    return this.getFavorites().some(v => v.href === favoriteHref);
  }

  reorderFavorites(event: any): void {
    this.preferenceService.setFavorites(
      event.detail.complete(this.getFavorites())
    );
  }

  getHistories(): AppInfo[] {
    return this.preferenceService.getHistories();
  }

  getHeadHistories(): AppInfo[] {
    return this.preferenceService.getHistories().slice(0, 5);
  }

  deleteHistory(historyIndex: number): void {
    this.preferenceService.deleteHistory(historyIndex);
  }

  getTabLength(): number {
    return this.inAppBrowserService.getTabsLength();
  }
}

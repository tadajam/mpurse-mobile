import { Component } from '@angular/core';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-tab-browser',
  templateUrl: './tab-browser.page.html',
  styleUrls: ['./tab-browser.page.scss']
})
export class TabBrowserPage {
  searchStr = new FormControl('');

  appList: { href: string; title: string; icon: string }[] = [
    {
      href: 'https://web3.askmona.org/',
      title: 'Ask Mona 3.0',
      icon: 'https://web3.askmona.org/apple-touch-icon.png'
    },
    {
      href: 'https://metamask.io/',
      title: 'MetaMask',
      icon: 'https://metamask.io/img/apple-touch-icon.png'
    },
    {
      href: 'https://github.com/tadajam/mpurse',
      title: 'tadajam/mpurse: Extension for Monaparty.',
      icon: 'https://github.githubassets.com/favicon.ico'
    }
  ];

  isReorderMode = false;

  constructor(private inAppBrowserSerrvice: InAppBrowserService) {}

  search(): void {
    if (this.searchStr.value !== '') {
      this.open(this.searchStr.value);
    }
  }
  open(url: string): void {
    this.inAppBrowserSerrvice.open(url);
  }

  getHistories(): { href: string; title: string; icon: string }[] {
    return this.inAppBrowserSerrvice.getHistories();
  }

  deleteHistory(history: string): void {
    return this.inAppBrowserSerrvice.deleteHistory(history);
  }

  getFavorites(): { href: string; title: string; icon: string }[] {
    return this.inAppBrowserSerrvice.getFavorites();
  }

  toggleFavorite(favorite: {
    href: string;
    title: string;
    icon: string;
  }): void {
    if (this.getFavorites().some(v => v.href === favorite.href)) {
      this.inAppBrowserSerrvice.deleteFavorite(favorite.href);
    } else {
      this.inAppBrowserSerrvice.addFavorite(favorite);
    }
  }

  isFavorite(favorite: string): boolean {
    return this.getFavorites().some(v => v.href === favorite);
  }

  reorderFavorites(event: any): void {
    this.inAppBrowserSerrvice.setFavorites(
      event.detail.complete(this.inAppBrowserSerrvice.getFavorites())
    );
  }

  onPress(): void {
    this.isReorderMode = !this.isReorderMode;
  }
}

import { Component, Input, ViewChild } from '@angular/core';
import { AppGroup } from 'src/app/enum/app-group.enum';
import { ModalController, IonInfiniteScroll } from '@ionic/angular';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { AppInfo } from 'src/app/interfaces/app-info';
import { BackgroundService } from 'src/app/services/background.service';

@Component({
  selector: 'app-app-info',
  templateUrl: './app-info.page.html',
  styleUrls: ['./app-info.page.scss']
})
export class AppInfoPage {
  @ViewChild('infinite', { static: false }) infiniteScroll: IonInfiniteScroll;
  @Input() appGroup: AppGroup;

  appInfo: AppInfo[] = [];
  page = 0;
  limit = 10;
  isReorderMode = false;

  constructor(
    private preferenceService: PreferenceService,
    private inAppBrowserService: InAppBrowserService,
    private backgroundService: BackgroundService,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.appInfo = this.getApps(this.page, this.limit);
  }

  ionViewWillLeave(): void {
    this.page = 0;
  }

  open(searchStr: string): void {
    this.inAppBrowserService.open(searchStr);
    this.modalController.dismiss();
  }

  getApps(page: number, limit: number): AppInfo[] {
    switch (this.appGroup) {
      case AppGroup.Active:
        return this.inAppBrowserService
          .getTabs()
          .slice(page * limit, page * limit + limit);
      case AppGroup.Favorite:
        return this.preferenceService
          .getFavorites()
          .slice(page * limit, page * limit + limit);
      case AppGroup.History:
        return this.preferenceService
          .getHistories()
          .slice(page * limit, page * limit + limit);
    }
  }

  loadNext(): void {
    const apps = this.getApps(++this.page, this.limit);
    this.infiniteScroll.complete();
    Array.prototype.push.apply(this.appInfo, apps);
  }

  reorderFavorites(event: any): void {
    this.preferenceService.setFavorites(
      event.detail.complete(this.preferenceService.getFavorites())
    );
    this.appInfo = this.getApps(0, this.page * this.limit + this.limit);
  }

  toggleFavorite(favorite: AppInfo): void {
    if (this.isFavorite(favorite.href)) {
      this.preferenceService.deleteFavorite(favorite.href);
    } else {
      this.preferenceService.addFavorite(favorite);
    }
    this.appInfo = this.getApps(0, this.page * this.limit + this.limit);
  }

  isFavorite(favoriteHref: string): boolean {
    return this.preferenceService
      .getFavorites()
      .some(v => v.href === favoriteHref);
  }

  deleteHistory(historyIndex: number): void {
    this.preferenceService.deleteHistory(historyIndex);
    this.appInfo = this.getApps(0, this.page * this.limit + this.limit);
  }

  showTab(tabIndex: number): void {
    this.inAppBrowserService.showTab(tabIndex);
    this.closeModal();
  }

  closeTab(tabIndex: number): void {
    this.inAppBrowserService.closeTab(tabIndex);
    this.appInfo.splice(tabIndex, 1);
  }

  closeModal(): void {
    this.modalController.dismiss();
  }
}

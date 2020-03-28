import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { from, Observable, Subject } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { PreferenceKey } from '../enum/preference-key.enum';
import { Identity } from '../interfaces/identity';
import { MpurseAccount } from '../interfaces/mpurse-account';
import { TranslateService } from '@ngx-translate/core';
import { AppInfo } from '../interfaces/app-info';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private MAX_FAVORITES = 50;
  private MAX_HISTORIES = 100;
  private finishedBackup = false;

  private language = 'en';
  private searchEngine = 'google';
  private useBiometrics = false;

  private selectedAddress = '';
  private selectedAddressSubject = new Subject<string>();
  selectedAddressState = this.selectedAddressSubject.asObservable();

  private identities: Identity[] = [];
  private favorites: AppInfo[] = [];
  private histories: AppInfo[] = [];

  private autoLockTime = 15000;

  constructor(
    private storage: Storage,
    private translateService: TranslateService
  ) {
    from(this.storage.get(PreferenceKey.FinishedBackup)).subscribe({
      next: (finishedBackup: boolean) => (this.finishedBackup = finishedBackup)
    });

    from(this.storage.get(PreferenceKey.Language))
      .pipe(
        map(lang => {
          let l = lang || this.translateService.getBrowserLang();
          l = /(en|ja)/gi.test(l) ? l : 'en';
          return l;
        })
      )
      .subscribe({
        next: lang => {
          this.translateService.use(lang);
          this.language = lang;
        }
      });

    from(this.storage.get(PreferenceKey.SearchEngine))
      .pipe(map(searchEngine => searchEngine || 'google'))
      .subscribe({ next: searchEngine => (this.searchEngine = searchEngine) });

    from(this.storage.get(PreferenceKey.UseBiometrics)).subscribe({
      next: useBiometrics => (this.useBiometrics = useBiometrics)
    });

    from(this.storage.get(PreferenceKey.SelectedAddress))
      .pipe(map((address: string) => (address ? address : '')))
      .subscribe({
        next: (address: string) => (this.selectedAddress = address)
      });

    from(this.storage.get(PreferenceKey.Identities))
      .pipe(map((identities: Identity[]) => (identities ? identities : [])))
      .subscribe({
        next: (identities: Identity[]) => (this.identities = identities)
      });

    from(this.storage.get(PreferenceKey.Favorites))
      .pipe(map((favorites: AppInfo[]) => (favorites ? favorites : [])))
      .subscribe({
        next: (favorites: AppInfo[]) => (this.favorites = favorites)
      });

    from(this.storage.get(PreferenceKey.Histories))
      .pipe(map((histories: AppInfo[]) => (histories ? histories : [])))
      .subscribe({
        next: (histories: AppInfo[]) => (this.histories = histories)
      });

    from(this.storage.get(PreferenceKey.AutoLockTime))
      .pipe(
        map((autoLockTime: number) => (autoLockTime ? autoLockTime : 15000))
      )
      .subscribe({
        next: (autoLockTime: number) => (this.autoLockTime = autoLockTime)
      });
  }

  syncAccount(accounts: MpurseAccount[]): void {
    for (let i = 0; i < accounts.length; i++) {
      if (!this.existsAddressInIdentities(accounts[i].address)) {
        const accountName = this.incrementAccountName();
        const identity = {
          address: accounts[i].address,
          name: accountName,
          isImport: accounts[i].isImport,
          approvedOrigins: []
        };
        this.identities.push(identity);
      }
    }
    this.saveIdentityes();

    if (this.selectedAddress === '') {
      this.changeAddress(accounts[0].address);
    }
  }

  resetPreferences(): Observable<void> {
    return from(this.storage.remove(PreferenceKey.FinishedBackup)).pipe(
      flatMap(() => this.storage.remove(PreferenceKey.SelectedAddress)),
      flatMap(() => this.storage.remove(PreferenceKey.Identities)),
      flatMap(() => this.storage.remove(PreferenceKey.Favorites)),
      flatMap(() => this.storage.remove(PreferenceKey.Histories)),
      flatMap(() => this.storage.remove(PreferenceKey.AutoLockTime)),
      map(() => {
        this.language = 'en';
        this.searchEngine = 'google';
        this.finishedBackup = false;
        this.selectedAddress = '';
        this.identities = [];
        this.favorites = [];
        this.histories = [];
        this.autoLockTime = 15000;
      })
    );
  }

  // finishedBackup
  setFinishedBackup(isFinished: boolean): void {
    this.finishedBackup = isFinished;
    this.storage.set(PreferenceKey.FinishedBackup, this.finishedBackup);
  }

  deferBackup(): void {
    this.finishedBackup = true;
  }

  getFinishedBackup(): boolean {
    return this.finishedBackup;
  }

  // selectedAddress
  private saveSelectedAddress(): void {
    this.storage.set(PreferenceKey.SelectedAddress, this.selectedAddress);
  }

  getSelectedAddress(): string {
    return this.selectedAddress;
  }

  changeAddress(address: string): void {
    if (this.selectedAddress !== address) {
      this.selectedAddress = address;
      this.selectedAddressSubject.next(address);
      this.saveSelectedAddress();
    }
  }

  // identities
  private saveIdentityes(): void {
    this.storage.set(PreferenceKey.Identities, this.identities);
  }

  getIdentities(): Identity[] {
    return this.identities;
  }

  getIdentity(address: string): Identity {
    return this.identities.find(value => value.address === address);
  }

  existsAddressInIdentities(address: string): boolean {
    return this.identities.some(value => value.address === address);
  }

  existsNameInIdentities(name: string): boolean {
    return this.identities.some(value => value.name === name);
  }

  addIdentity(identity: Identity): void {
    if (!this.existsAddressInIdentities(identity.address)) {
      this.identities.push(identity);
      this.saveIdentityes();
    }
  }

  removeIdentity(address: string): void {
    this.identities = this.identities.filter(
      value => value.address !== address
    );
    if (this.selectedAddress === address) {
      this.changeAddress(this.identities[0].address);
    }
    this.saveIdentityes();
  }

  setAccountName(name: string): void {
    const identity = this.getIdentity(this.selectedAddress);
    identity.name = name;
    this.selectedAddressSubject.next(this.selectedAddress);
    this.saveIdentityes();
  }

  incrementAccountName(): string {
    const name = this.translateService.instant('preference.account');
    let num = this.identities.length + 1;
    while (this.existsNameInIdentities(name + num)) {
      num++;
    }
    return name + num;
  }

  setApprovedOrigin(origin: string): void {
    const identity = this.getIdentity(this.selectedAddress);
    if (!identity.approvedOrigins.some(value => value === origin)) {
      identity.approvedOrigins.push(origin);
      this.saveIdentityes();
    }
  }

  isApproved(origin: string): boolean {
    const identity = this.getIdentity(this.selectedAddress);
    return identity.approvedOrigins.some(value => value === origin);
  }

  // language
  getLanguage(): string {
    return this.language;
  }

  setLanguage(lang: string): void {
    this.translateService.use(lang);
    this.language = lang;
    this.storage.set(PreferenceKey.Language, lang);
  }

  //searchEngine
  getSearchEngine(): string {
    return this.searchEngine;
  }

  setSearchEngine(searchEngine: string): void {
    this.searchEngine = searchEngine;
    this.storage.set(PreferenceKey.SearchEngine, searchEngine);
  }

  // useBiometrics
  private saveUseBiometrics(): void {
    this.storage.set(PreferenceKey.UseBiometrics, this.useBiometrics);
  }

  getUseBiometrics(): boolean {
    return this.useBiometrics;
  }

  setUseBiometrics(useBiometrics: boolean): void {
    if (this.useBiometrics !== useBiometrics) {
      this.useBiometrics = useBiometrics;
      this.saveUseBiometrics();
    }
  }

  // favorites
  saveFavorites(): void {
    this.storage.set(PreferenceKey.Favorites, this.favorites);
  }

  getFavorites(): AppInfo[] {
    return this.favorites;
  }

  setFavorites(favorites: AppInfo[]): void {
    this.favorites = favorites;
    this.saveFavorites();
  }

  addFavorite(favorite: AppInfo): void {
    if (favorite && this.favorites.length <= this.MAX_FAVORITES) {
      this.favorites.push(favorite);
      this.saveFavorites();
    }
  }

  deleteFavorite(favorite: string): void {
    this.setFavorites(this.favorites.filter(v => v.href !== favorite));
  }

  // histories
  saveHistories(): void {
    this.storage.set(PreferenceKey.Histories, this.histories);
  }

  getHistories(): AppInfo[] {
    return this.histories;
  }

  addHistory(history: AppInfo): void {
    if (history) {
      if (this.histories.length >= this.MAX_HISTORIES) {
        this.histories.pop();
      }
      this.histories.unshift(history);
      this.saveHistories();
    }
  }

  deleteHistory(index: number): void {
    this.histories = this.histories.filter((v, i) => i !== index);
    this.saveHistories();
  }

  deleteHistories(): void {
    this.histories = [];
    this.saveHistories();
  }

  // autoLockTime
  getAutoLockTime(): number {
    return this.autoLockTime;
  }

  setAutoLockTime(autoLockTime: number): void {
    this.autoLockTime = autoLockTime;
    this.storage.set(PreferenceKey.AutoLockTime, autoLockTime);
  }
}

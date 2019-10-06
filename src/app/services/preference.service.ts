import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { from, Observable, Subject } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import { PreferenceKey } from '../enum/preference-key.enum';
import { Identity } from '../interfaces/identity';
import { MpurseAccount } from '../interfaces/mpurse-account';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService {
  private language = 'en';
  private finishedBackup = false;

  private selectedAddress = '';
  private selectedAddressSubject = new Subject<string>();
  selectedAddressState = this.selectedAddressSubject.asObservable();

  private identities: Identity[] = [];

  constructor(
    private storage: Storage,
    private translateService: TranslateService
  ) {
    from(this.storage.get(PreferenceKey.Language))
      .pipe(
        map(lang => {
          console.log(lang);
          let l = lang || this.translateService.getBrowserLang();
          l = /(en|ja)/gi.test(l) ? l : 'en';
          return l;
        })
      )
      .subscribe(lang => {
        this.setLanguage(lang);
      });

    from(this.storage.get(PreferenceKey.FinishedBackup))
      .pipe(map(finishedBackup => finishedBackup === 'true'))
      .subscribe({
        next: (finishedBackup: boolean) =>
          (this.finishedBackup = finishedBackup)
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
      map(() => {
        this.language = 'en';
        this.finishedBackup = false;
        this.selectedAddress = '';
        this.identities = [];
      })
    );
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
    this.saveIdentityes();
  }

  setAccountName(name: string): void {
    const identity = this.getIdentity(this.selectedAddress);
    identity.name = name;
    this.saveIdentityes();
  }

  incrementAccountName(): string {
    const name = 'Account';
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

  getLanguage(): string {
    return this.language;
  }

  setLanguage(lang: string): void {
    this.translateService.use(lang);
    this.language = lang;
    this.storage.set(PreferenceKey.Language, lang);
  }
}

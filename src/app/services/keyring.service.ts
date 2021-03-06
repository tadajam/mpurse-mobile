import { Injectable } from '@angular/core';

import { Keyring } from '../classes/keyring';
import { PreferenceService } from './preference.service';
import { SeedType } from '../enum/seed-type.enum';
import { SeedLanguage } from '../enum/seed-language.enum';
import * as jazzicon from 'jazzicon';
import { Observable, from, of, Observer, Subject, empty } from 'rxjs';
import {
  map,
  flatMap,
  catchError,
  toArray,
  concatMap,
  expand
} from 'rxjs/operators';
import { Encryptor } from '../classes/encryptor';
import { Storage } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { VaultData } from '../interfaces/vault-data';
import { Hdkey } from '../interfaces/hdkey';
import { KeyringKey } from '../enum/keyring-key.enum';
import { MpurseAccount } from '../interfaces/mpurse-account';
import { Identity } from '../interfaces/identity';
import { MpchainUtil } from '../classes/mpchain-util';
import { TranslateService } from '@ngx-translate/core';

interface Vault {
  version: number;
  data: string;
  checksum: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyringService {
  private VERSION = 1;

  private GAP_LIMIT = 20;

  private keyring: Keyring;
  private password = '';

  private loginStateSubject = new Subject<boolean>();
  loginState = this.loginStateSubject.asObservable();

  constructor(
    private storage: Storage,
    private keychainTouchId: KeychainTouchId,
    private preferenceService: PreferenceService,
    private translateService: TranslateService
  ) {
    this.keychainTouchId.setLocale(this.preferenceService.getLanguage());
    this.keyring = new Keyring();
  }

  setPassword(inputPassword: string): Observable<void> {
    return this.existsVault().pipe(
      map(exists => {
        this.password = inputPassword;
        if (exists) {
          this.saveVault();
        }
      })
    );
  }

  savePasswordWithTouchId(inputPassword: string): Observable<void> {
    return from(this.keychainTouchId.isAvailable()).pipe(
      flatMap(() =>
        this.keychainTouchId.save(KeyringKey.MpurseUser, inputPassword)
      ),
      flatMap(() => this.setPassword(inputPassword))
    );
  }

  verifyPassword(inputPassword: string): Observable<void> {
    return this.getValidVault().pipe(
      map(vault => {
        if (vault.checksum !== Encryptor.createCheckSum(inputPassword)) {
          throw new Error(
            this.translateService.instant('keyring.passwordNotMatch')
          );
        }
      })
    );
  }

  verifyPasswordWithTouchId(): Observable<void> {
    return from(this.keychainTouchId.isAvailable()).pipe(
      flatMap(() => this.keychainTouchId.has(KeyringKey.MpurseUser)),
      flatMap(() => {
        return this.keychainTouchId.verify(
          KeyringKey.MpurseUser,
          this.translateService.instant('keyring.showSecret')
        );
      }),
      flatMap(result => this.verifyPassword(result))
    );
  }

  isAvailableKeychainTouchId(): Observable<any> {
    return from(this.keychainTouchId.isAvailable());
  }

  private saveVault(): void {
    const vault = {
      version: this.VERSION,
      data: Encryptor.encrypt(this.keyring.serialize(), this.password),
      checksum: Encryptor.createCheckSum(this.password)
    };

    this.storage.set(KeyringKey.Vault, JSON.stringify(vault));
  }

  private getValidVault(): Observable<Vault> {
    return from(this.storage.get(KeyringKey.Vault)).pipe(
      map((vaultStr: string) => JSON.parse(vaultStr)),
      map((vault: Vault) => {
        if (vault && 'data' in vault && 'checksum' in vault) {
          return vault;
        } else {
          throw new Error(
            this.translateService.instant('keyring.vaultNotFount')
          );
        }
      })
    );
  }

  isEncrypted(): Observable<boolean> {
    return this.getValidVault().pipe(
      map(vault => {
        return vault.checksum !== Encryptor.createCheckSum('');
      }),
      catchError(() => of(false))
    );
  }

  existsVault(): Observable<boolean> {
    return this.existsKeyring().pipe(
      flatMap(exists => {
        if (exists) {
          return of(true);
        } else {
          return this.getValidVault();
        }
      }),
      map(() => true),
      catchError(() => of(false))
    );
  }

  purgeVault(): Observable<void> {
    return from(this.storage.remove(KeyringKey.Vault)).pipe(
      flatMap(() => this.keychainTouchId.isAvailable()),
      flatMap(() => this.keychainTouchId.delete(KeyringKey.MpurseUser)),
      catchError(() => of(void 0)),
      map(() => {
        this.password = '';
        this.keyring.initKeyring();
      })
    );
  }

  existsKeyring(): Observable<boolean> {
    return Observable.create((observer: Observer<boolean>) => {
      observer.next(this.keyring.getHdkey().numberOfAccounts !== 0);
      observer.complete();
    });
  }

  private createKeyring(vaultData: VaultData): void {
    this.keyring.deserialize(vaultData);
    this.saveVault();
    this.preferenceService.syncAccount(this.keyring.getAccounts());
  }

  generateRandomMnemonic(seedType: SeedType, seedLanguage: string): string {
    return this.keyring.generateRandomMnemonic(seedType, seedLanguage);
  }

  createDefaultKeyring(): void {
    this.password = '';
    const mnemonic = this.keyring.generateRandomMnemonic(
      SeedType.Bip39,
      SeedLanguage.ENGLISH
    );

    const hdkey: Hdkey = {
      mnemonic: mnemonic,
      seedType: SeedType.Bip39,
      basePath: "m/44'/22'/0'/0/",
      numberOfAccounts: 1
    };

    this.createKeyring({ hdkey: hdkey, privatekeys: [] });
  }

  createCustomKeyring(
    seedType: SeedType,
    mnemonic: string,
    basePath: string
  ): Observable<void> {
    return this.getLastTxIndex(seedType, mnemonic, basePath).pipe(
      map(index => (index >= 0 ? index + 1 : 1)),
      map(numberOfAccounts => {
        const hdkey: Hdkey = {
          mnemonic: mnemonic,
          seedType: seedType,
          basePath: basePath,
          numberOfAccounts: numberOfAccounts
        };
        this.createKeyring({ hdkey: hdkey, privatekeys: [] });
      })
    );
  }

  createExistingKeyring(): Observable<void> {
    return this.getValidVault().pipe(
      map((vault: Vault) => {
        if (vault.checksum === Encryptor.createCheckSum(this.password)) {
          const vaultData: VaultData = JSON.parse(
            Encryptor.decrypt(vault.data, this.password)
          );
          this.createKeyring(vaultData);
        } else {
          throw new Error(
            this.translateService.instant('keyring.passwordNotMatch')
          );
        }
      })
    );
  }

  getLastTxIndex(
    seedType: SeedType,
    mnemonic: string,
    basePath: string
  ): Observable<number> {
    return of({ index: 0, lastIndex: -1 }).pipe(
      expand(loopObj => {
        return from(
          MpchainUtil.cb('get_chain_address_info', {
            addresses: this.keyring.getAddresses(
              seedType,
              basePath,
              mnemonic,
              loopObj.index * this.GAP_LIMIT,
              this.GAP_LIMIT
            ),
            with_uxtos: false,
            with_last_txn_hashes: true
          })
        ).pipe(
          flatMap(info => {
            const reverseIndex = info
              .map(v => v.last_txns.length)
              .slice()
              .reverse()
              .findIndex(v => v > 0);
            const lastIndex = info.length - 1;
            return reverseIndex >= 0
              ? of({
                  index: loopObj.index + 1,
                  lastIndex:
                    loopObj.index * this.GAP_LIMIT + lastIndex - reverseIndex
                })
              : this.getLastmessageIndex(loopObj.index, info.map(v => v.addr));
          })
        );
      }),
      map(loopObj => loopObj.lastIndex),
      toArray(),
      map(lastIndexes => Math.max.apply(null, lastIndexes)),
      catchError(() => of(-1))
    );
  }

  getLastmessageIndex(
    loopIndex: number,
    address: string[]
  ): Observable<{ index: number; lastIndex: number } | never> {
    return from(address).pipe(
      concatMap(address =>
        MpchainUtil.mp('history', {
          address: address,
          page: 1,
          limit: 0
        })
      ),
      toArray(),
      map(info => info.map(v => v.total)),
      flatMap(lengths => {
        const reverseIndex = lengths
          .slice()
          .reverse()
          .findIndex(v => v > 0);
        const lastIndex = lengths.length - 1;
        return reverseIndex >= 0
          ? of({
              index: loopIndex + 1,
              lastIndex: loopIndex * this.GAP_LIMIT + lastIndex - reverseIndex
            })
          : empty();
      })
    );
  }

  unlock(inputPassword: string): Observable<void> {
    return this.getValidVault().pipe(
      map(vault => {
        if (vault.checksum === Encryptor.createCheckSum(inputPassword)) {
          this.password = inputPassword;
          this.loginStateSubject.next(true);
        } else {
          throw new Error(
            this.translateService.instant('keyring.passwordNotMatch')
          );
        }
      })
    );
  }

  lock(): void {
    this.password = '';
    this.loginStateSubject.next(false);
    this.keyring.initKeyring();
  }

  unlockWithTouchId(): Observable<void> {
    return from(this.keychainTouchId.isAvailable()).pipe(
      flatMap(() => this.keychainTouchId.has(KeyringKey.MpurseUser)),
      flatMap(() => {
        return this.keychainTouchId.verify(
          KeyringKey.MpurseUser,
          this.translateService.instant('keyring.login')
        );
      }),
      flatMap(result => this.unlock(result))
    );
  }

  isUnlocked(): Observable<boolean> {
    return this.existsKeyring().pipe(
      flatMap(exists => {
        if (exists) {
          return of(true);
        } else {
          return this.getValidVault().pipe(
            map(
              (vault: Vault) =>
                vault.checksum === Encryptor.createCheckSum(this.password)
            )
          );
        }
      })
    );
  }

  addAccount(): string {
    const account = this.keyring.addAccount();

    const identity: Identity = {
      address: account.address,
      name: this.preferenceService.incrementAccountName(),
      isImport: false,
      approvedOrigins: []
    };

    this.preferenceService.addIdentity(identity);

    this.saveVault();
    return account.address;
  }

  importAccount(name: string, wif: string): Observable<string> {
    let account: MpurseAccount;
    return Observable.create((observer: Observer<string>) => {
      try {
        account = this.keyring.importAccount(wif);
      } catch (error) {
        observer.error(error);
      }
      this.saveVault();
      this.preferenceService.addIdentity({
        address: account.address,
        name: name,
        isImport: true,
        approvedOrigins: []
      });
      observer.next(account.address);
      observer.complete();
    });
  }

  removeAccount(address: string): void {
    this.keyring.removeAccount(address);
    this.saveVault();
    this.preferenceService.removeIdentity(address);
  }

  getPrivatekey(address: string): string {
    return this.keyring.getPrivatekey(address);
  }

  getHdkey(): Hdkey {
    return this.keyring.getHdkey();
  }

  getSeedTypeName(seedType: string): string {
    switch (seedType) {
      case 'Electrum1':
        return 'Electrum Seed Version 1';
      case 'Electrum2':
        return 'Electrum Seed Version 2';
      case 'Bip39':
        return 'Bip39';
      default:
        return 'Undefined';
    }
  }

  signMessage(message: string): string {
    return this.keyring.signMessage(
      message,
      this.preferenceService.getSelectedAddress()
    );
  }

  signRawTransaction(unsignedTx: string): Observable<string> {
    return from(
      this.keyring.signTransaction(
        unsignedTx,
        this.preferenceService.getSelectedAddress()
      )
    );
  }

  createIdentIcon(address: string, diameter: number): string {
    if (address) {
      const bytes = this.keyring.decodeBase58(address);
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] < 16) {
          hex += '0';
        }
        hex += bytes[i].toString(16);
      }
      return jazzicon(diameter, parseInt(hex.slice(0, 16), 16)).innerHTML;
    } else {
      return null;
    }
  }

  isAddress(addressStr: string): boolean {
    return this.keyring.isAddress(addressStr);
  }
}

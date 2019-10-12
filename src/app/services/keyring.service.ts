import { Injectable } from '@angular/core';

import { Keyring } from '../classes/keyring';
import { PreferenceService } from './preference.service';
import { SeedVersion } from '../enum/seed-version.enum';
import { SeedLanguage } from '../enum/seed-language.enum';
import * as jazzicon from 'jazzicon';
import { Observable, from, of, Observer } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';
import { Encryptor } from '../classes/encryptor';
import { Storage } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { VaultData } from '../interfaces/vault-data';
import { Hdkey } from '../interfaces/hdkey';
import { KeyringKey } from '../enum/keyring-key.enum';
import { MpurseAccount } from '../interfaces/mpurse-account';
import { Identity } from '../interfaces/identity';
import { MpchainUtil } from '../classes/mpchain-util';

interface Vault {
  version: number;
  data: string;
  checksum: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeyringService {
  private version = 1;
  private keyring: Keyring;
  private password = '';

  constructor(
    private storage: Storage,
    private keychainTouchId: KeychainTouchId,
    private preferenceService: PreferenceService
  ) {
    this.keychainTouchId.setLocale(this.preferenceService.getLanguage());
    this.keyring = new Keyring();
  }

  private saveVault(): void {
    const vault = {
      version: this.version,
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
          throw new Error('No valid vault found');
        }
      })
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
      flatMap(() => this.keychainTouchId.delete('mpurse-user')),
      map(() => {
        this.password = '';
        this.keyring = new Keyring();
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

  createDefaultKeyring(): void {
    this.password = '';
    const mnemonic = this.keyring.generateRandomMnemonic(
      SeedVersion.Bip39,
      SeedLanguage.ENGLISH
    );

    const hdkey: Hdkey = {
      mnemonic: mnemonic,
      seedVersion: SeedVersion.Bip39,
      basePath: "m/44'/22'/0'/0/",
      numberOfAccounts: 1
    };

    this.createKeyring({ hdkey: hdkey, privatekeys: [] });
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
          throw new Error('Invalid password');
        }
      })
    );
  }

  // getHdkey() {}

  // unlock() {}

  unlockWithTouchId(): Observable<void> {
    return from(this.keychainTouchId.isAvailable()).pipe(
      flatMap(() => this.keychainTouchId.has(KeyringKey.MpurseUser)),
      catchError(() => of(false)),
      flatMap(exists => {
        if (exists) {
          return this.keychainTouchId.verify(
            KeyringKey.MpurseUser,
            'Unlock Mpurse'
          );
        } else {
          return of(false);
        }
      }),
      catchError(() => of(false)),
      map((result: string | boolean) => {
        if (typeof result !== 'boolean') {
          this.password = result;
        }
      })
    );
  }

  // lock() {}

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

  // getAccounts(): MpurseAccount[] {
  //   return this.keyring.getAccounts();
  // }

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

  // getPrivatekey() {}

  // removeAccount() {}

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

  sendTransaction(signedTx: string): Observable<string> {
    return from(MpchainUtil.sendTx(signedTx));
  }

  // send() {}

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
}

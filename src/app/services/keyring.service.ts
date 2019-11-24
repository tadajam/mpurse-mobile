import { Injectable } from '@angular/core';

import { Keyring } from '../classes/keyring';
import { PreferenceService } from './preference.service';
import { SeedType } from '../enum/seed-type.enum';
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
          throw new Error('Passwords do not match');
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
          'Show Secret'
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

  isEncrypted(): Observable<boolean> {
    return this.getValidVault().pipe(
      map(vault => {
        return vault.checksum !== Encryptor.createCheckSum('');
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
    basePah: string
  ): void {
    const hdkey: Hdkey = {
      mnemonic: mnemonic,
      seedType: seedType,
      basePath: basePah,
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
          throw new Error('Passwords do not match');
        }
      })
    );
  }

  unlock(inputPassword: string): Observable<void> {
    return this.getValidVault().pipe(
      map(vault => {
        if (vault.checksum === Encryptor.createCheckSum(inputPassword)) {
          this.password = inputPassword;
        } else {
          throw new Error('Passwords do not match');
        }
      })
    );
  }

  lock(): void {
    this.password = '';
    this.keyring.initKeyring();
  }

  unlockWithTouchId(): Observable<void> {
    return from(this.keychainTouchId.isAvailable()).pipe(
      flatMap(() => this.keychainTouchId.has(KeyringKey.MpurseUser)),
      flatMap(() => {
        return this.keychainTouchId.verify(
          KeyringKey.MpurseUser,
          'Login Mpurse'
        );
      }),
      flatMap(result => {
        this.password = result;
        return this.createExistingKeyring();
      })
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
}

import { BitcoreUtil } from './bitcore-util';

import { Hdkey } from '../interfaces/hdkey';
import { MpurseAccount } from '../interfaces/mpurse-account';
import { VaultData } from '../interfaces/vault-data';

export class Keyring {
  private bitcore: BitcoreUtil;

  private hdkey: Hdkey;
  private privatekeys: string[];

  private accounts: MpurseAccount[];

  constructor() {
    this.bitcore = new BitcoreUtil();

    this.hdkey = {
      seedType: '',
      basePath: '',
      mnemonic: '',
      numberOfAccounts: 0
    };
    this.privatekeys = [];
    this.accounts = [];
  }

  deserialize(vaultData: VaultData): void {
    this.hdkey = vaultData.hdkey;
    this.privatekeys = vaultData.privatekeys;

    this.accounts = [];
    const hdPrivateKey = this.bitcore.getHDPrivateKey(
      this.hdkey.mnemonic,
      this.hdkey.seedType
    );
    for (let i = 0; i < this.hdkey.numberOfAccounts; i++) {
      this.setAccount(
        this.bitcore.getPrivateKey(hdPrivateKey, this.hdkey.basePath, i),
        false
      );
    }
    for (let i = 0; i < this.privatekeys.length; i++) {
      this.setAccount(
        this.bitcore.getPrivateKeyFromWIF(this.privatekeys[i]),
        true
      );
    }
  }

  serialize(): string {
    return JSON.stringify({ hdkey: this.hdkey, privatekeys: this.privatekeys });
  }

  getPassphrase(): string {
    return this.hdkey.mnemonic;
  }

  getHdkey(): Hdkey {
    return this.hdkey;
  }

  getPrivatekey(address: string): string {
    const account = this.accounts.find(value => value.address === address);
    let wif = '';
    if (account) {
      wif = this.bitcore.hex2WIF(account.privatekey);
    }

    return wif;
  }

  setAccount(privatekey: any, isImport: boolean): void {
    const address = this.bitcore.getAddress(privatekey);

    if (!this.accounts.some(value => value.address === address)) {
      this.accounts.push({
        address: address,
        privatekey: privatekey.toString(),
        publickey: privatekey.toPublicKey().toString(),
        isImport: isImport
      });
    }
  }

  addAccount(): MpurseAccount {
    const hdPrivateKey = this.bitcore.getHDPrivateKey(
      this.hdkey.mnemonic,
      this.hdkey.seedType
    );
    const privatekey = this.bitcore.getPrivateKey(
      hdPrivateKey,
      this.hdkey.basePath,
      this.hdkey.numberOfAccounts
    );
    this.setAccount(privatekey, false);
    this.hdkey.numberOfAccounts++;
    return this.getAccount(this.bitcore.getAddress(privatekey));
  }

  importAccount(wif: string): MpurseAccount {
    const privatekey = this.bitcore.getPrivateKeyFromWIF(wif);
    this.setAccount(privatekey, true);
    this.privatekeys.push(wif);
    return this.getAccount(this.bitcore.getAddress(privatekey));
  }

  removeAccount(address: string): void {
    const account = this.accounts.find(value => value.address === address);
    let wif = '';
    if (account) {
      wif = this.bitcore.hex2WIF(account.privatekey);
    }
    this.privatekeys = this.privatekeys.filter(value => value !== wif);
    this.accounts = this.accounts.filter(value => value.address !== address);
  }

  getAccount(address: string): MpurseAccount {
    return this.accounts.find(value => value.address === address);
  }

  getAccounts(): MpurseAccount[] {
    return this.accounts;
  }

  containsPrivatekey(wif: string): boolean {
    return this.accounts.some(
      value =>
        value.privatekey === this.bitcore.getPrivateKeyFromWIF(wif).toString()
    );
  }

  generateRandomMnemonic(seedType: string, seedLanguage: string): string {
    return this.bitcore.generateRandomMnemonic(seedType, seedLanguage);
  }

  decodeBase58(address: string): Uint8Array {
    return this.bitcore.decodeBase58(address);
  }

  signTransaction(tx: string, address: string): Promise<string> {
    const account = this.accounts.find(value => value.address === address);
    return this.bitcore.signTransaction(tx, account.privatekey);
  }

  signMessage(message: string, address: string): string {
    const account = this.accounts.find(value => value.address === address);
    return this.bitcore.signMessage(message, account.privatekey);
  }
}

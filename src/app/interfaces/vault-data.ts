import { Hdkey } from './hdkey';

export interface VaultData {
  hdkey: Hdkey;
  privatekeys: string[];
}

import { MpchainAssetBalance } from './mpchain-asset-balance';

export interface MpchainBalance {
  address: string;
  data: MpchainAssetBalance[];
  total: number;
}

export interface MpchainAsset {
  asset: string;
  asset_id: number;
  asset_longname: string;
  block_index: number;
  description: string;
  divisible: boolean;
  estimated_value: {
    mona: string;
    usd: string;
    xmp: string;
  };
  issuer: string;
  listed: boolean;
  locked: boolean;
  owner: string;
  reassignable: boolean;
  supply: string;
  timestamp: number;
  type: string;
}

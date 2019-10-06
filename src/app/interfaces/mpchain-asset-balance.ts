export interface MpchainAssetBalance {
  asset: string;
  asset_longname: string;
  description: string;
  estimated_value: {
    mona: string;
    usd: string;
    xmp: string;
  };
  quantity: string;
  unconfirmed_quantity: string;
}

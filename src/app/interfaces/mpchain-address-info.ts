export interface MpchainAddressInfo {
  address: string;
  assets: {
    held: number;
    owned: number;
  };
  estimated_value: {
    mona: string;
    usd: string;
    xmp: string;
  };
  mona_balance: string;
  unconfirmed_mona_balance: string;
  unconfirmed_xmp_balance: string;
  xmp_balance: string;
}

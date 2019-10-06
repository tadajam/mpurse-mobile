export interface MpchainAPIParams {
  address?: string;
  asset?: string;
  block?: number;
  tx_index?: number;
  tx_hash?: string;
  tx_hex?: string;
  base_asset?: string;
  quote_asset?: string;
  page?: number;
  limit?: number;
}

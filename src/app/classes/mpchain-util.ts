import { MpchainAddressInfo } from '../interfaces/mpchain-address-info';
import { MpchainAsset } from '../interfaces/mpchain-asset';
import { MpchainBalance } from '../interfaces/mpchain-balance';
import { MpchainAPIParams } from '../interfaces/mpchain-apiparams';
import { MpchainAssetBalance } from '../interfaces/mpchain-asset-balance';

export class MpchainUtil {
  static API_URL = 'https://mpchain.info/api/';

  private static httpGet(apiString: string): Promise<any> {
    const request = new XMLHttpRequest();
    return new Promise((resolve): any => {
      request.addEventListener('load', () => {
        const json = JSON.parse(request.response);
        resolve(json);
      });
      request.open('GET', this.API_URL + apiString);
      request.send();
    });
  }

  private static httpPost(apiString: string, params: string): Promise<any> {
    const request = new XMLHttpRequest();
    return new Promise((resolve, reject): any => {
      request.addEventListener('load', () => {
        let json: any;
        try {
          json = JSON.parse(request.response);
        } catch (e) {
          json = { error: 'api dead' };
        }
        if ('code' in json || 'error' in json) {
          reject(json);
        } else {
          resolve(json);
        }
      });
      request.open('POST', this.API_URL + apiString);
      request.setRequestHeader('Content-Type', 'application/json');
      request.send(params);
    });
  }

  static mp(method: string, params: MpchainAPIParams): Promise<any> {
    if (!this.isObject(params)) {
      return Promise.reject({ error: 'Invalid argument' });
    }
    let apiString = method;
    switch (method) {
      case 'send_tx':
        if ('tx_hex' in params) {
          return this.httpPost(method, JSON.stringify(params));
        } else {
          return Promise.reject({ error: 'Invalid argument' });
        }
      case 'balance':
        if (!('address' in params) || !('asset' in params)) {
          return Promise.reject({ error: 'Invalid argument' });
        }
        apiString += '/' + params.address + '/' + params.asset;
        break;
      case 'market':
        if (!('base_asset' in params) || !('quote_asset' in params)) {
          return Promise.reject({ error: 'Invalid argument' });
        }
        apiString += '/' + params.base_asset + '/' + params.quote_asset;
        break;
      case 'market_history':
        if (!('base_asset' in params) || !('quote_asset' in params)) {
          return Promise.reject({ error: 'Invalid argument' });
        }
        apiString =
          'market/' + params.base_asset + '/' + params.quote_asset + '/history';
        apiString += params.address ? '/' + params.address : '';
        break;
      case 'market_orderbook':
        if (!('base_asset' in params) || !('quote_asset' in params)) {
          return Promise.reject({ error: 'Invalid argument' });
        }
        apiString =
          'market/' +
          params.base_asset +
          '/' +
          params.quote_asset +
          '/orderbook';
        apiString += params.address ? '/' + params.address : '';
        break;
      case 'market_orders':
        if (
          !('base_asset' in params) ||
          !('quote_asset' in params) ||
          !('address' in params)
        ) {
          return Promise.reject({ error: 'Invalid argument' });
        }
        apiString =
          'market/' +
          params.base_asset +
          '/' +
          params.quote_asset +
          '/orders/' +
          params.address;
        break;
      default:
        let paramStr = 'address' in params ? params.address : '';
        paramStr += 'asset' in params ? params.asset : '';
        paramStr += 'block' in params ? params.block.toString() : '';
        paramStr += 'tx_index' in params ? params.tx_index.toString() : '';
        paramStr += 'tx_hash' in params ? params.tx_hash : '';
        apiString += '/' + paramStr;
    }
    if ('page' in params) {
      apiString += '/' + params.page;
      apiString += 'limit' in params ? '/' + params.limit : '';
    }
    return this.httpGet(apiString);
  }

  static getAddressInfo(address: string): Promise<MpchainAddressInfo> {
    return this.mp('address', { address: address });
  }

  static getAsset(asset: string): Promise<MpchainAsset> {
    return this.mp('asset', { asset: asset });
  }

  static getBalance(
    address: string,
    asset: string
  ): Promise<MpchainAssetBalance> {
    return this.mp('balance', { address: address, asset: asset });
  }

  static getBalances(
    address: string,
    page: number,
    limit: number
  ): Promise<MpchainBalance> {
    return this.mp('balances', { address: address, page: page, limit: limit });
  }

  static getMempool(
    address: string,
    page: number,
    limit: number
  ): Promise<any> {
    return this.mp('mempool', { address: address, page: page, limit: limit });
  }

  static sendTx(txHex: string): Promise<any> {
    return this.mp('send_tx', { tx_hex: txHex });
  }

  // counterblock

  static cb(method: string, params: any): Promise<any> {
    if (!this.isObject(params)) {
      return Promise.reject({ error: 'Invalid argument' });
    }
    const postParams = {
      jsonrpc: '2.0',
      id: 0,
      method: method,
      params: params
    };
    return this.httpPost('cb/', JSON.stringify(postParams)).then(
      result => new Promise((resolve): any => resolve(result.result))
    );
  }

  static cp(method: string, params: any): Promise<any> {
    if (!this.isObject(params)) {
      return Promise.reject({ error: 'Invalid argument' });
    }
    const cbParams = {
      method: method,
      params: params
    };
    return this.cb('proxy_to_counterpartyd', cbParams);
  }

  static createSend(
    source: string,
    destination: string,
    asset: string,
    quantity: number,
    memo: string,
    memoIsHex: boolean,
    feePerKb: number,
    disableUtxoLocks: boolean
  ): Promise<any> {
    const cpParams = {
      source: source,
      destination: destination,
      asset: asset,
      quantity: quantity,
      memo: memo,
      memo_is_hex: memoIsHex,
      fee_per_kb: feePerKb,
      allow_unconfirmed_inputs: true,
      extended_tx_info: true,
      disable_utxo_locks: disableUtxoLocks
    };
    return this.cp('create_send', cpParams);
  }

  static getScriptPubKey(txHash: string, voutIndex: number): Promise<any> {
    const cbParams = { tx_hash: txHash, vout_index: voutIndex };
    return this.cb('get_script_pub_key', cbParams);
  }

  private static isObject(obj: any): boolean {
    return (
      Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase() === 'object'
    );
  }
}

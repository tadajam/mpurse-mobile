import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { MpchainUtil } from '../classes/mpchain-util';
import { MpchainAddressInfo } from '../interfaces/mpchain-address-info';
import { MpchainBalance } from '../interfaces/mpchain-balance';
import { MpchainAssetBalance } from '../interfaces/mpchain-asset-balance';
import { MpchainAPIParams } from '../interfaces/mpchain-apiparams';
import { flatMap, concatMap, reduce, map, catchError } from 'rxjs/operators';
import Decimal from 'decimal.js';
import { MpchainAsset } from '../interfaces/mpchain-asset';

@Injectable({
  providedIn: 'root'
})
export class MpchainService {
  getAddressInfo(address: string): Observable<MpchainAddressInfo> {
    return from(MpchainUtil.getAddressInfo(address));
  }

  getBalances(
    address: string,
    page: number,
    limit: number
  ): Observable<MpchainBalance> {
    return from(MpchainUtil.getBalances(address, page, limit));
  }

  getBalance(address: string, asset: string): Observable<MpchainAssetBalance> {
    return from(MpchainUtil.getBalance(address, asset));
  }

  getBalanceArray(address: string): Observable<MpchainAssetBalance[]> {
    const limit = 2;
    return this.getBalances(address, 1, limit).pipe(
      flatMap((firstBalances: MpchainBalance) => {
        const getBalances: Observable<MpchainAssetBalance[]>[] = [
          this.getBalance(address, 'MONA').pipe(map(balance => [balance])),
          of(firstBalances.data)
        ];
        const apiCount = new Decimal(firstBalances.total)
          .div(new Decimal(limit))
          .toNumber();
        for (let i = 1; i < apiCount; i++) {
          const getBalance = this.getBalances(address, i + 1, limit).pipe(
            map(balances => balances.data)
          );
          getBalances.push(getBalance);
        }
        return getBalances;
      }),
      concatMap(getBalances => getBalances),
      reduce((pasts, current) => pasts.concat(current))
    );
  }

  getIssuer(asset: string): Observable<string> {
    return from(MpchainUtil.getAsset(asset)).pipe(
      map(asset => {
        if ('error' in asset || !asset.issuer) {
          throw new Error('Not Found');
        } else {
          return asset.issuer;
        }
      })
    );
  }

  getAssetInfo(asset: string): Observable<MpchainAsset> {
    return from(MpchainUtil.getAsset(asset)).pipe(
      map(asset => {
        if ('error' in asset) {
          throw new Error('Not Found');
        } else {
          return asset;
        }
      })
    );
  }

  createSend(
    source: string,
    destination: string,
    asset: string,
    amountStr: string,
    memoType: string,
    memoValue: string,
    feePerB: string,
    disableUtxoLocks: boolean
  ): Observable<string> {
    return this.getAssetInfo(asset).pipe(
      flatMap(assetInfo => {
        let amount: number;
        if (assetInfo.divisible) {
          amount = new Decimal(amountStr)
            .times(new Decimal(100000000))
            .toNumber();
        } else {
          amount = new Decimal(amountStr).toNumber();
        }
        return MpchainUtil.createSend(
          source,
          destination,
          assetInfo.asset,
          amount,
          memoType === 'no' ? '' : memoValue,
          memoType === 'hex',
          new Decimal(feePerB).times(new Decimal(1000)).toNumber(),
          disableUtxoLocks
        );
      }),
      catchError(error => {
        throw new Error(this.interpretError(error));
      })
    );
  }

  sendTransaction(signedTx: string): Observable<string> {
    return from(MpchainUtil.sendTx(signedTx)).pipe(
      catchError(error => {
        throw new Error(this.interpretError(error));
      })
    );
  }

  mp(method: string, params: MpchainAPIParams): Observable<any> {
    return from(MpchainUtil.mp(method, params));
  }

  cp(method: string, params: any): Observable<any> {
    return from(MpchainUtil.cp(method, params));
  }

  cb(method: string, params: any): Observable<any> {
    return from(MpchainUtil.cb(method, params));
  }

  interpretError(error: any): string {
    let errorMessage = '';

    if (this.isObject(error) && 'error' in error) {
      if (this.isObject(error.error) && 'data' in error.error) {
        if (this.isObject(error.error.data) && 'message' in error.error.data) {
          try {
            errorMessage = JSON.parse(error.error.data.message).message;
          } catch (e) {
            errorMessage = error.error.data.message;
          }

          if (/("message"\:")(.+)("\},)/.test(errorMessage)) {
            errorMessage = /("message"\:")(.+)("\},)/.exec(errorMessage)[2];
          } else if (/(result is None)(.+)(monacoin)/.test(errorMessage)) {
            errorMessage = 'Monacoin API is dead.';
          } else if (/(result is None)(.+)(counterparty)/.test(errorMessage)) {
            errorMessage = 'Counterparty API is dead.';
          }
        } else if (this.isObject(error.error.data)) {
          errorMessage = JSON.stringify(error.error.data);
        } else {
          errorMessage = error.error.data;
        }
      } else if (this.isObject(error.error)) {
        errorMessage = JSON.stringify(error.error);
      } else {
        if (/(ECONNREFUSED)/.test(error.error)) {
          errorMessage = 'Counterblock API is dead.';
        } else if (/(Server is not caught up)/.test(error.error)) {
          errorMessage = 'Server is not caught up.';
        } else {
          errorMessage = error.error;
        }
      }
    } else if (this.isObject(error)) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = error;
    }

    return errorMessage;
  }

  private isObject(obj: any): boolean {
    return (
      Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase() === 'object'
    );
  }
}

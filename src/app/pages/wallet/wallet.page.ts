import { Component, ViewChild } from '@angular/core';
import {
  IonInfiniteScroll,
  ModalController,
  NavController,
  AlertController
} from '@ionic/angular';
import { from, Subscription, Observable, of } from 'rxjs';
import { PreferenceService } from 'src/app/services/preference.service';
import { MpchainAddressInfo } from 'src/app/interfaces/mpchain-address-info';
import { flatMap, tap, map } from 'rxjs/operators';
import { MpchainAssetBalance } from 'src/app/interfaces/mpchain-asset-balance';
import { MpchainBalance } from 'src/app/interfaces/mpchain-balance';
import { FormControl, Validators } from '@angular/forms';
import { MpchainService } from 'src/app/services/mpchain.service';
import { AccountsPage } from '../accounts/accounts.page';
import { CommonService } from 'src/app/services/common.service';
import { Decimal } from 'decimal.js';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss']
})
export class WalletPage {
  @ViewChild('infinite', { static: false }) infiniteScroll: IonInfiniteScroll;
  loading = false;
  shouldBackup = false;

  address = '';
  accountName = '';
  isEditable = false;
  addressInfo: MpchainAddressInfo;
  monaBalance: MpchainAssetBalance;
  xmpBalance: MpchainAssetBalance;
  page = 1;
  limit = 10;
  total = 0;
  assetBalances: MpchainAssetBalance[] = [];
  searchAssetStrControl = new FormControl('', Validators.required);
  searchedAsset: MpchainAssetBalance;
  subscriptions: Subscription;

  constructor(
    private preferenceService: PreferenceService,
    private mpchainService: MpchainService,
    private commonService: CommonService,
    private modalController: ModalController,
    private navController: NavController,
    private alertController: AlertController,
    private translateService: TranslateService
  ) {}

  ionViewDidEnter(): void {
    this.loading = true;
    this.isEditable = false;
    this.updateAddress(this.preferenceService.getSelectedAddress()).subscribe({
      next: () => {
        this.loading = false;
        this.checkBackup();
      },
      error: error => this.commonService.presentErrorToast(error.toString())
    });

    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.preferenceService.selectedAddressState
        .pipe(
          tap(() => (this.loading = true)),
          flatMap((address: string) => this.updateAddress(address))
        )
        .subscribe({
          next: () => {
            this.loading = false;
            this.checkBackup();
          },
          error: error => this.commonService.presentErrorToast(error.toString())
        })
    );
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  updateAddress(address: string): Observable<void> {
    this.address = address;
    const identity = this.preferenceService.getIdentity(this.address);
    this.accountName = identity ? identity.name : '';

    return this.updateBalance();
  }

  updateBalance(): Observable<void> {
    this.shouldBackup = false;
    return this.mpchainService.getAddressInfo(this.address).pipe(
      map((info: MpchainAddressInfo) => {
        if (new Decimal(info.mona_balance).toNumber() > 0) {
          this.shouldBackup = true;
        }

        this.addressInfo = info;
        this.monaBalance = {
          asset: 'MONA',
          asset_longname: null,
          description: '',
          estimated_value: null,
          quantity: info.mona_balance,
          unconfirmed_quantity: info.unconfirmed_mona_balance
        };
        this.xmpBalance = {
          asset: 'XMP',
          asset_longname: null,
          description: '',
          estimated_value: null,
          quantity: info.xmp_balance,
          unconfirmed_quantity: info.unconfirmed_xmp_balance
        };
      }),
      flatMap(() =>
        this.mpchainService.getBalances(this.address, 1, this.limit)
      ),
      map((balances: MpchainBalance) => {
        if (balances.total > 0) {
          this.shouldBackup = true;
        }
        this.page = 1;
        this.total = balances.total;
        this.assetBalances = balances.data;
        this.searchedAsset = null;
      })
    );
  }

  checkBackup(): void {
    if (!this.preferenceService.getFinishedBackup() && this.shouldBackup) {
      const buttons: any[] = [
        { text: this.translateService.instant('wallet.later'), role: 'cancel' },
        {
          text: this.translateService.instant('wallet.encrypt'),
          handler: (): void => {
            this.preferenceService.deferBackup();
            this.navController.navigateRoot('/password');
          }
        }
      ];
      from(
        this.alertController.create({
          header: this.translateService.instant('wallet.backup'),
          message: this.translateService.instant('wallet.backupMessage'),
          buttons: buttons
        })
      ).subscribe({ next: alert => alert.present() });
    }
  }

  refresh(event: any): void {
    this.loading = true;
    this.updateBalance().subscribe({
      next: () => {
        event.target.complete();
        this.loading = false;
        this.checkBackup();
      }
    });
  }

  loadNextBalances(): void {
    if (this.assetBalances.length < this.total) {
      this.mpchainService
        .getBalances(this.address, ++this.page, this.limit)
        .subscribe({
          next: (balances: MpchainBalance) => {
            this.infiniteScroll.complete();
            Array.prototype.push.apply(this.assetBalances, balances.data);
          }
        });
    } else {
      this.infiniteScroll.complete();
    }
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe({
      next: modal => modal.present()
    });
  }

  editName(): void {
    this.isEditable = true;
  }

  changeAccountName(): void {
    let e = '';
    if (this.accountName === '') {
      e = this.translateService.instant('wallet.empty');
    } else if (
      this.preferenceService.getIdentity(this.address).name !==
        this.accountName &&
      this.preferenceService.existsNameInIdentities(this.accountName)
    ) {
      e = this.translateService.instant('wallet.duplicate');
    }

    if (e === '') {
      this.preferenceService.setAccountName(this.accountName);
      this.isEditable = false;
    } else {
      this.commonService.presentErrorToast(e);
    }
  }

  copyAddress(): void {
    this.commonService.copyString(this.address);
  }

  search(): void {
    this.mpchainService
      .getBalance(this.address, this.searchAssetStrControl.value)
      .pipe(
        flatMap((asset: MpchainAssetBalance) => {
          if (!('error' in asset)) {
            return of(asset);
          } else {
            return this.mpchainService.getBalance(
              this.address,
              this.searchAssetStrControl.value.toUpperCase()
            );
          }
        }),
        tap((asset: MpchainAssetBalance) => {
          if ('error' in asset) {
            throw new Error(asset['error']);
          }
        })
      )
      .subscribe({
        next: (asset: MpchainAssetBalance) => (this.searchedAsset = asset),
        error: error => {
          this.commonService.presentErrorToast(error.toString());
          this.searchedAsset = null;
        }
      });
  }
}

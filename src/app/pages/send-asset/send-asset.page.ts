import { Component } from '@angular/core';
import { Identity } from 'src/app/interfaces/identity';
import {
  FormControl,
  FormGroup,
  Validators,
  ValidationErrors
} from '@angular/forms';
import { Subscription, from, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PreferenceService } from 'src/app/services/preference.service';
import { BackgroundService } from 'src/app/services/background.service';
import { Location } from '@angular/common';
import { MpchainAssetBalance } from 'src/app/interfaces/mpchain-asset-balance';
import {
  flatMap,
  tap,
  filter,
  map,
  toArray,
  repeat,
  catchError
} from 'rxjs/operators';
import { MpchainService } from 'src/app/services/mpchain.service';
import { KeyringService } from 'src/app/services/keyring.service';
import { CommonService } from 'src/app/services/common.service';
import { AccountsPage } from '../accounts/accounts.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-send-asset',
  templateUrl: './send-asset.page.html',
  styleUrls: ['./send-asset.page.scss']
})
export class SendAssetPage {
  address: string;
  identity: Identity;
  request: any;

  assets: MpchainAssetBalance[] = [];

  toAddressControl = new FormControl('', {
    updateOn: 'blur',
    validators: [Validators.required]
  });
  amountControl = new FormControl(0, {
    updateOn: 'blur',
    validators: [
      Validators.required,
      Validators.pattern(/^([1-9][0-9]{0,9}|0)(\.[0-9]{1,8})?$/),
      Validators.min(0.00000001)
    ]
  });

  memoTypeControl = new FormControl('no', [Validators.required]);
  memoValueControl = new FormControl('', {
    updateOn: 'blur'
  });

  memoGroup = new FormGroup(
    {
      memoType: this.memoTypeControl,
      memoValue: this.memoValueControl
    },
    { validators: this.memoValidator }
  );

  assetControl = new FormControl('MONA', {
    updateOn: 'blur',
    validators: [Validators.required]
  });
  feeControl = new FormControl(101, {
    updateOn: 'blur',
    validators: [Validators.required, Validators.min(10)]
  });

  sendAssetForm = new FormGroup({
    to: this.toAddressControl,
    amount: this.amountControl,
    asset: this.assetControl,
    memo: this.memoGroup,
    fee: this.feeControl
  });

  memoValidator(group: FormGroup): ValidationErrors | null {
    const emptyValidator =
      group.controls.memoType.value === 'no'
        ? true
        : group.controls.memoValue.value !== '';
    const hexValidator =
      group.controls.memoType.value === 'hex'
        ? group.controls.memoValue.value.match(/^([0-9a-f][0-9a-f])+$/)
        : true;
    return emptyValidator && hexValidator ? null : { invalidMemo: true };
  }

  toHasAssigned = false;
  assetHasAssigned = false;
  amountHasAssigned = false;
  memoTypeHasAssigned = false;
  memoValueHasAssigned = false;

  unsignedTx = '';
  calculatedFee = 0;

  subscriptions: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private backgroundService: BackgroundService,
    private location: Location,
    private mpchainService: MpchainService,
    private keyringService: KeyringService,
    private commonService: CommonService,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.updateAddress(this.preferenceService.getSelectedAddress());

    this.activatedRoute.queryParams
      .pipe(
        map(params => {
          if (params.id) {
            this.request = this.backgroundService.getPendingRequest(
              parseFloat(params.id)
            );
            if (this.request) {
              if (this.request.message.to) {
                this.toAddressControl.setValue(this.request.message.to);
                this.toHasAssigned = true;
              }
              if (this.request.message.asset) {
                this.assetControl.setValue(this.request.message.asset);
                this.assetHasAssigned = true;
              }
              if (this.request.message.amount) {
                this.amountControl.setValue(this.request.message.amount);
                this.amountHasAssigned = true;
              }
              if (this.request.message.memoType) {
                this.memoTypeControl.setValue(this.request.message.memoType);
                this.memoTypeHasAssigned = true;
              }
              if (this.request.message.memoValue) {
                this.memoValueControl.setValue(this.request.message.memoValue);
                this.memoValueHasAssigned = true;
              }
            }
          } else {
            if (params.to) {
              this.toAddressControl.setValue(params.to);
              this.toHasAssigned = true;
            }
            if (params.asset) {
              this.assetControl.setValue(params.asset);
              this.assetHasAssigned = true;
            }
            if (params.amount) {
              this.amountControl.setValue(params.amount);
              this.amountHasAssigned = true;
            }
            if (params.memoType) {
              this.memoTypeControl.setValue(params.memoType);
              this.memoTypeHasAssigned = true;
            }
            if (params.memoValue) {
              this.memoValueControl.setValue(params.memoValue);
              this.memoValueHasAssigned = true;
            }
          }
        }),
        flatMap(() => this.updateAssets())
      )
      .subscribe({
        next: (balances: MpchainAssetBalance[]) => (this.assets = balances),
        error: error => this.commonService.presentErrorToast(error.toString())
      });

    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.preferenceService.selectedAddressState
        .pipe(
          tap((address: string) => {
            if (this.request) {
              throw new Error('Canceled');
            } else {
              this.updateAddress(address);
            }
          }),
          flatMap(() => this.updateAssets())
        )
        .subscribe({
          next: (balances: MpchainAssetBalance[]) => (this.assets = balances),
          error: () => this.cancel()
        })
    );

    this.sendAssetForm.valueChanges
      .pipe(
        tap(() => {
          this.unsignedTx = '';
          this.calculatedFee = 0;
        }),
        filter(() => this.sendAssetForm.valid),
        flatMap(() => this.createSend(true)),
        catchError(error => {
          this.commonService.presentErrorToast(error.toString());
          return of();
        }),
        repeat()
      )
      .subscribe({
        next: result => {
          this.unsignedTx = result['tx_hex'];
          this.calculatedFee = result['btc_fee'];
        }
      });
  }

  ionViewWillLeave(): void {
    this.toAddressControl.setValue('');
    this.amountControl.setValue(0);
    this.memoTypeControl.setValue('no');
    this.memoValueControl.setValue('');
    this.assetControl.setValue('MONA');
    this.feeControl.setValue(101);
    this.toHasAssigned = false;
    this.assetHasAssigned = false;
    this.amountHasAssigned = false;
    this.memoTypeHasAssigned = false;
    this.memoValueHasAssigned = false;
    if (this.request) {
      this.backgroundService.cancelPendingRequest(this.request.id);
    }
    this.subscriptions.unsubscribe();
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe({
      next: modal => modal.present()
    });
  }

  updateAddress(address: string): void {
    this.address = address;
    this.identity = this.preferenceService.getIdentity(this.address);
    this.assetControl.setValue('MONA');
    this.amountControl.setValue(0);
  }

  updateAssets(): Observable<MpchainAssetBalance[]> {
    if (this.assetHasAssigned) {
      const getBalanceArray = [
        this.mpchainService.getBalance(this.address, 'MONA')
      ];
      if (this.assetControl.value !== 'MONA') {
        getBalanceArray.push(
          this.mpchainService.getBalance(this.address, this.assetControl.value)
        );
      }
      return from(getBalanceArray).pipe(
        flatMap(_ => _),
        toArray()
      );
    } else {
      return this.mpchainService.getBalanceArray(this.address);
    }
  }

  getAssetName(asset: string): string {
    const targetAsset = this.assets.filter(value => value.asset === asset);
    if (targetAsset.length > 0) {
      return targetAsset[0].asset_longname
        ? targetAsset[0].asset_longname
        : targetAsset[0].asset;
    } else {
      return '';
    }
  }

  getAvailable(asset: string): string {
    const assetInfo = this.assets.filter(value => value.asset === asset);
    if (assetInfo.length > 0) {
      return assetInfo[0].quantity;
    } else {
      return '0';
    }
  }

  getAvailableNumber(asset: string): number {
    return Number(this.getAvailable(asset));
  }

  setAvailableAllFunds(): void {
    this.amountControl.setValue(this.getAvailable(this.assetControl.value));
  }

  getIssuer(): void {
    this.mpchainService.getIssuer(this.toAddressControl.value).subscribe({
      next: issuer => {
        this.commonService.presentSuccessToast(
          'Set ' +
            this.toAddressControl.value +
            ' issuer to destination address'
        );
        this.toAddressControl.setValue(issuer);
      },
      error: error => this.commonService.presentErrorToast(error)
    });
  }

  scanQrcode(): void {
    this.commonService.scanQrcode().subscribe({
      next: text => this.toAddressControl.setValue(text)
    });
  }

  changeFeeRange(event: any): void {
    this.feeControl.setValue(event.target.value);
  }

  createSend(disableUtxoLocks: boolean): Observable<any> {
    this.unsignedTx = '';
    this.calculatedFee = 0;

    return this.mpchainService.createSend(
      this.address,
      this.toAddressControl.value,
      this.assetControl.value,
      this.amountControl.value,
      this.memoTypeControl.value,
      this.memoValueControl.value,
      this.feeControl.value,
      disableUtxoLocks
    );
  }

  sendAsset(): void {
    this.createSend(false)
      .pipe(
        flatMap(result =>
          this.keyringService.signRawTransaction(result['txHash'])
        ),
        flatMap(signedTx => this.mpchainService.sendTransaction(signedTx))
      )
      .subscribe({
        next: result => {
          if (this.request) {
            this.backgroundService.sendResponse(
              this.request.action,
              this.request.id,
              {
                txHash: result['txHash']
              }
            );
            this.location.back();
          } else {
            this.commonService.presentSuccessToast(
              'Funds sent. tx_hash: ' + result['txHash']
            );
            this.location.back();
          }
        },
        error: error => this.commonService.presentErrorToast(error.toString())
      });
  }

  cancel(): void {
    this.location.back();
  }
}

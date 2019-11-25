import { Component } from '@angular/core';
import { Identity } from 'src/app/interfaces/identity';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, from } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PreferenceService } from 'src/app/services/preference.service';
import { Location } from '@angular/common';
import { BackgroundService } from 'src/app/services/background.service';
import { KeyringService } from 'src/app/services/keyring.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { filter } from 'rxjs/operators';
import { MpchainService } from 'src/app/services/mpchain.service';
import { CommonService } from 'src/app/services/common.service';
import { AccountsPage } from '../accounts/accounts.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss']
})
export class TransactionPage {
  address: string;
  identity: Identity;
  request: any;
  unsignedTxControl = new FormControl('', [Validators.required]);
  signedTxControl = new FormControl('', []);

  signatureForm = new FormGroup({
    unsignedTx: this.unsignedTxControl,
    signedTx: this.signedTxControl
  });
  subscriptions: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private backgroundService: BackgroundService,
    private keyringService: KeyringService,
    private location: Location,
    private clipboard: Clipboard,
    private mpchainService: MpchainService,
    private commonService: CommonService,
    private modalController: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.activatedRoute.queryParams
      .pipe(filter(params => params.id))
      .subscribe({
        next: params => {
          this.request = this.backgroundService.getPendingRequest(
            parseFloat(params.id)
          );
          if (this.request) {
            this.unsignedTxControl.setValue(this.request.message.tx);
          }
        }
      });

    this.address = this.preferenceService.getSelectedAddress();
    this.identity = this.preferenceService.getIdentity(this.address);

    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => {
          if (this.request) {
            this.cancel();
          } else {
            this.signedTxControl.setValue('');
            this.address = address;
            this.identity = this.preferenceService.getIdentity(this.address);
          }
        }
      })
    );
  }

  ionViewWillLeave(): void {
    this.unsignedTxControl.setValue('');
    this.signedTxControl.setValue('');
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

  sign(): void {
    this.keyringService
      .signRawTransaction(this.unsignedTxControl.value)
      .subscribe({
        next: signedTx => this.signedTxControl.setValue(signedTx),
        error: error => this.commonService.presentErrorToast(error.toString())
      });
  }

  copy(): void {
    from(this.clipboard.copy(this.signedTxControl.value)).subscribe({
      next: () => this.commonService.presentSuccessToast('Copied')
    });
  }

  broadcast(): void {
    this.mpchainService.sendTransaction(this.signedTxControl.value).subscribe({
      next: txHash => {
        this.backgroundService.sendResponse(
          this.request.action,
          this.request.id,
          {
            txHash: txHash
          }
        );
        this.location.back();
      },
      error: error => this.commonService.presentErrorToast(error.toString())
    });
  }

  sendToWeb(): void {
    this.backgroundService.sendResponse(this.request.action, this.request.id, {
      signedTx: this.signedTxControl.value
    });
    this.location.back();
  }

  cancel(): void {
    this.location.back();
  }
}

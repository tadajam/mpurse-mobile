import { Component, OnInit } from '@angular/core';
import { Identity } from 'src/app/interfaces/identity';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription, from } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PreferenceService } from 'src/app/services/preference.service';
import { Location } from '@angular/common';
import { ModalController, ToastController } from '@ionic/angular';
import { BackgroundService } from 'src/app/services/background.service';
import { AccountsPage } from '../accounts/accounts.page';
import { KeyringService } from 'src/app/services/keyring.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { MpchainUtil } from 'src/app/classes/mpchain-util';
import { flatMap } from 'rxjs/operators';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss']
})
export class TransactionPage implements OnInit {
  requestId: number;
  address: string;
  identity: Identity;
  request: any;
  unsignedTxFormControl = new FormControl('', [Validators.required]);
  signedTxFormControl = new FormControl('', []);

  signatureForm = new FormGroup({
    unsignedTx: this.unsignedTxFormControl,
    signedTx: this.signedTxFormControl
  });
  private subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    private backgroundService: BackgroundService,
    private keyringService: KeyringService,
    private location: Location,
    private clipboard: Clipboard,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe({
      next: params => {
        if (params.id) {
          this.request = this.backgroundService.getPendingRequest(
            parseFloat(params.id)
          );
          if (this.request) {
            this.requestId = this.request.id;
            this.unsignedTxFormControl.setValue(this.request.message.tx);
          }
        }
      }
    });

    this.address = this.preferenceService.getSelectedAddress();
    this.identity = this.preferenceService.getIdentity(this.address);

    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => {
          if (this.request) {
            this.cancel();
          } else {
            this.signedTxFormControl.setValue('');
            this.address = address;
            this.identity = this.preferenceService.getIdentity(this.address);
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.backgroundService.cancelPendingRequest(this.requestId);
    this.subscriptions.unsubscribe();
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe(
      modal => modal.present()
    );
  }

  sign(): void {
    this.keyringService
      .signRawTransaction(this.unsignedTxFormControl.value)
      .subscribe({
        next: signedTx => this.signedTxFormControl.setValue(signedTx),
        error: error =>
          from(
            this.toastController.create({
              translucent: true,
              message: error,
              duration: 2000,
              position: 'top'
            })
          ).subscribe(toast => toast.present())
      });
  }

  copy(): void {
    from(this.clipboard.copy(this.signedTxFormControl.value))
      .pipe(
        flatMap(() =>
          this.toastController.create({
            translucent: true,
            message: 'Copied',
            duration: 2000,
            position: 'top'
          })
        )
      )
      .subscribe(toast => toast.present());
  }

  broadcast(): void {
    this.keyringService
      .sendTransaction(this.signedTxFormControl.value)
      .subscribe({
        next: txHash => {
          this.backgroundService.sendResponse(
            this.request.action,
            this.request.id,
            {
              txHash: txHash
            }
          );
          this.location.back();
        }
      });
  }

  sendToWeb(): void {
    this.backgroundService.sendResponse(this.request.action, this.request.id, {
      signedTx: this.signedTxFormControl.value
    });
    this.location.back();
  }

  cancel(): void {
    this.location.back();
  }
}

import { Component } from '@angular/core';
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
import { flatMap, filter } from 'rxjs/operators';
import { MpchainService } from 'src/app/services/mpchain.service';

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
  private subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    private backgroundService: BackgroundService,
    private keyringService: KeyringService,
    private location: Location,
    private clipboard: Clipboard,
    private toastController: ToastController,
    private mpchainService: MpchainService
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
    from(this.modalController.create({ component: AccountsPage })).subscribe(
      modal => modal.present()
    );
  }

  sign(): void {
    this.keyringService
      .signRawTransaction(this.unsignedTxControl.value)
      .subscribe({
        next: signedTx => this.signedTxControl.setValue(signedTx),
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
    from(this.clipboard.copy(this.signedTxControl.value))
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

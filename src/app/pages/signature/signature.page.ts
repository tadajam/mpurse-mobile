import { Component } from '@angular/core';
import { BackgroundService } from 'src/app/services/background.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Identity } from 'src/app/interfaces/identity';
import { ActivatedRoute } from '@angular/router';
import { Subscription, from } from 'rxjs';
import { FormGroup, FormControl } from '@angular/forms';
import { KeyringService } from 'src/app/services/keyring.service';
import { Location } from '@angular/common';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { filter } from 'rxjs/operators';
import { AccountsPage } from '../accounts/accounts.page';
import { CommonService } from 'src/app/services/common.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.page.html',
  styleUrls: ['./signature.page.scss']
})
export class SignaturePage {
  address: string;
  identity: Identity;
  request: any;
  messageControl = new FormControl('', []);
  signatureControl = new FormControl('', []);

  signatureForm = new FormGroup({
    message: this.messageControl,
    signature: this.signatureControl
  });
  subscriptions = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private backgroundService: BackgroundService,
    private keyringService: KeyringService,
    private location: Location,
    private clipboard: Clipboard,
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
            this.messageControl.setValue(this.request.message.message);
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
            this.signatureControl.setValue('');
            this.address = address;
            this.identity = this.preferenceService.getIdentity(this.address);
          }
        }
      })
    );
  }

  ionViewWillLeave(): void {
    this.messageControl.setValue('');
    this.signatureControl.setValue('');
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
    this.signatureControl.setValue(
      this.keyringService.signMessage(this.messageControl.value)
    );
  }

  copy(): void {
    from(this.clipboard.copy(this.signatureControl.value)).subscribe({
      next: () => this.commonService.presentSuccessToast('Copied')
    });
  }

  sendToWeb(): void {
    this.backgroundService.sendResponse(this.request.action, this.request.id, {
      signature: this.signatureControl.value
    });
    this.location.back();
  }

  cancel(): void {
    this.location.back();
  }
}

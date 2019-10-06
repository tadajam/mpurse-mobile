import { Component, OnInit } from '@angular/core';
import { BackgroundService } from 'src/app/services/background.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Identity } from 'src/app/interfaces/identity';
import { ActivatedRoute } from '@angular/router';
import { Subscription, from } from 'rxjs';
import { ModalController, ToastController } from '@ionic/angular';
import { AccountsPage } from '../accounts/accounts.page';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { KeyringService } from 'src/app/services/keyring.service';
import { Location } from '@angular/common';
import { Clipboard } from '@ionic-native/clipboard/ngx';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.page.html',
  styleUrls: ['./signature.page.scss']
})
export class SignaturePage implements OnInit {
  requestId: number;
  address: string;
  identity: Identity;
  request: any;
  messageFormControl = new FormControl('', [Validators.required]);
  signatureFormControl = new FormControl('', []);

  signatureForm = new FormGroup({
    message: this.messageFormControl,
    signature: this.signatureFormControl
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
    public toastController: ToastController
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
            this.messageFormControl.setValue(this.request.message.message);
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
            this.signatureFormControl.setValue('');
            this.address = address;
            this.identity = this.preferenceService.getIdentity(this.address);
          }
        },
        error: error => console.log(error)
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
    this.signatureFormControl.setValue(
      this.keyringService.signMessage(this.messageFormControl.value)
    );
  }

  copy(): void {
    this.clipboard.copy(this.signatureFormControl.value);
    from(
      this.toastController.create({
        translucent: true,
        message: 'Copied',
        duration: 2000
      })
    ).subscribe(toast => toast.present());
  }

  send(): void {
    this.backgroundService.sendResponse(this.request.action, this.request.id, {
      signature: this.signatureFormControl.value
    });
    this.location.back();
  }

  cancel(): void {
    this.location.back();
  }
}

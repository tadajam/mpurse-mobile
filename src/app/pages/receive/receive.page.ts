import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Identity } from 'src/app/interfaces/identity';
import { PreferenceService } from 'src/app/services/preference.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.page.html',
  styleUrls: ['./receive.page.scss']
})
export class ReceivePage {
  address: string;
  addressQr: string;

  constructor(
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    private commonService: CommonService
  ) {}

  ionViewDidEnter(): void {
    this.address = this.preferenceService.getSelectedAddress();
    this.commonService
      .createQrcode(this.address)
      .subscribe({ next: qr => (this.addressQr = qr) });
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  copy(): void {
    this.commonService.copyString(this.address);
  }
}

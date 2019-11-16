import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { KeyringService } from 'src/app/services/keyring.service';
import { CommonService } from 'src/app/services/common.service';
import { Hdkey } from 'src/app/interfaces/hdkey';

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss']
})
export class ExportPage {
  @Input() address: string;
  privatekey: string;
  privatekeyQr: string;

  hdKey: Hdkey;
  seedPhraseQr: string;

  constructor(
    private keyringService: KeyringService,
    private modalController: ModalController,
    private commonService: CommonService
  ) {}

  ionViewDidEnter(): void {
    if (this.address) {
      this.privatekey = this.keyringService.getPrivatekey(this.address);
      this.commonService
        .createQrcode(this.privatekey)
        .subscribe({ next: qr => (this.privatekeyQr = qr) });
    } else {
      this.hdKey = this.keyringService.getHdkey();
      this.commonService
        .createQrcode(this.hdKey.mnemonic)
        .subscribe({ next: qr => (this.seedPhraseQr = qr) });
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  getSeedTypeName(seedType: string): string {
    return this.keyringService.getSeedTypeName(seedType);
  }

  copy(targetStr: string): void {
    this.commonService.copyString(targetStr);
  }
}

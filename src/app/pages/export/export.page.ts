import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { KeyringService } from 'src/app/services/keyring.service';
import { CommonService } from 'src/app/services/common.service';
import { Hdkey } from 'src/app/interfaces/hdkey';

@Component({
  selector: 'app-export',
  templateUrl: './export.page.html',
  styleUrls: ['./export.page.scss']
})
export class ExportPage implements OnInit {
  @Input() address: string;
  privatekey: string;
  privatekeyQr: string;

  seedPhrase: Hdkey;
  seedPhraseQr: string;

  constructor(
    private keyringService: KeyringService,
    private modalController: ModalController,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    if (this.address) {
      this.privatekey = this.keyringService.getPrivatekey(this.address);
      this.keyringService
        .getPrivatekeyQr(this.address)
        .subscribe({ next: qr => (this.privatekeyQr = qr) });
    } else {
      this.seedPhrase = this.keyringService.getHdkey();
      this.keyringService
        .getSeedPhraseQr()
        .subscribe({ next: qr => (this.seedPhraseQr = qr) });
    }
  }

  closeModal(): void {
    this.modalController.dismiss();
  }

  getSeedVersionName(seedVersion: string): string {
    return this.keyringService.getSeedVersionName(seedVersion);
  }

  copy(targetStr: string): void {
    this.commonService.copyString(targetStr);
  }
}

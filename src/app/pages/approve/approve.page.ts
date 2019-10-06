import { Component, OnInit } from '@angular/core';
import { BackgroundService } from 'src/app/services/background.service';
import { PreferenceService } from 'src/app/services/preference.service';
import { Identity } from 'src/app/interfaces/identity';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-approve',
  templateUrl: './approve.page.html',
  styleUrls: ['./approve.page.scss']
})
export class ApprovePage implements OnInit {
  address: string;
  identity: Identity;
  request: any;

  constructor(
    private preferenceService: PreferenceService,
    private backgroundService: BackgroundService,
    public modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.address = this.preferenceService.getSelectedAddress();
    this.identity = this.preferenceService.getIdentity(this.address);
    this.request = this.backgroundService.getPendingRequests()[0];
  }

  ngOnDestroy(): void {
    if (!this.preferenceService.isApproved(this.request.origin)) {
      this.backgroundService.cancelPendingRequest(this.request.id);
    }
  }

  cancel(): void {
    this.modalController.dismiss();
  }

  approve(): void {
    this.preferenceService.setApprovedOrigin(this.request.origin);
    this.backgroundService.navigateByPendingRequest();
    this.modalController.dismiss();
  }
}

import { Component } from '@angular/core';
import { PreferenceService } from 'src/app/services/preference.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { filter, flatMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { ApprovePage } from '../approve/approve.page';
import { BackgroundService } from 'src/app/services/background.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  address = '';
  accountName = '';
  subscriptions: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    private backgroundervice: BackgroundService
  ) {}

  ionViewDidEnter(): void {
    this.activatedRoute.queryParams
      .pipe(
        filter(params => params.approvalRequestId),
        flatMap(() => this.modalController.create({ component: ApprovePage }))
      )
      .subscribe({
        next: modal => {
          this.backgroundervice.setApprovalRequestId(null);
          modal.present();
        }
      });

    this.updateAddress(this.preferenceService.getSelectedAddress());

    this.subscriptions = new Subscription();
    this.subscriptions.add(
      this.preferenceService.selectedAddressState.subscribe({
        next: (address: string) => this.updateAddress(address)
      })
    );
  }

  ionViewWillLeave(): void {
    this.subscriptions.unsubscribe();
  }

  updateAddress(address: string): void {
    this.address = address;
    const identity = this.preferenceService.getIdentity(this.address);
    this.accountName = identity ? identity.name : '';
  }
}

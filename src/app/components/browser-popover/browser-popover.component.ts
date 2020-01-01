import { Component } from '@angular/core';
import { from } from 'rxjs';
import { ModalController, PopoverController } from '@ionic/angular';
import { AppGroup } from 'src/app/enum/app-group.enum';
import { AppInfoPage } from 'src/app/pages/app-info/app-info.page';

@Component({
  selector: 'app-browser-popover',
  templateUrl: './browser-popover.component.html',
  styleUrls: ['./browser-popover.component.scss']
})
export class BrowserPopoverComponent {
  constructor(
    private modalController: ModalController,
    private popoverController: PopoverController
  ) {}

  openAppInfoPage(group: AppGroup | string): void {
    from(
      this.modalController.create({
        component: AppInfoPage,
        componentProps: {
          appGroup: group
        }
      })
    ).subscribe({
      next: modal => {
        this.popoverController.dismiss();
        modal.present();
      }
    });
  }
}

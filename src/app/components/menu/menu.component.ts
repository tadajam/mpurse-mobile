import { Component, Input } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/services/common.service';
import { from } from 'rxjs';
import { AccountsPage } from 'src/app/pages/accounts/accounts.page';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  @Input() address: string;
  @Input() accountName: string;

  // To avoid freezing.
  isSwipeEnabled = true;

  constructor(
    private menuController: MenuController,
    private commonService: CommonService,
    private modalController: ModalController
  ) {}

  menuClose(): void {
    this.menuController.close();
  }

  shortenAddress(address: string): string {
    let str = address.substr(0, 6) + '...';
    str += address.substr(address.length - 4, 4);
    return str;
  }

  openAccountsPage(): void {
    this.menuClose();
    from(this.modalController.create({ component: AccountsPage })).subscribe({
      next: modal => modal.present()
    });
  }
}

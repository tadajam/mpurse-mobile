import { Component, Input } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { from } from 'rxjs';
import { AccountsPage } from 'src/app/pages/accounts/accounts.page';
import { KeyringService } from 'src/app/services/keyring.service';
import { Router } from '@angular/router';
import { ReceivePage } from 'src/app/pages/receive/receive.page';

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
    private router: Router,
    private menuController: MenuController,
    private modalController: ModalController,
    private keyringService: KeyringService
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

  openReceivePage(): void {
    this.menuClose();
    from(this.modalController.create({ component: ReceivePage })).subscribe({
      next: modal => modal.present()
    });
  }

  logout(): void {
    this.menuClose();
    this.keyringService.lock();
    this.router.navigateByUrl('/');
  }
}

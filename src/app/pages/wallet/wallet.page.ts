import { Component, OnInit } from '@angular/core';
import { KeyringService } from 'src/app/services/keyring.service';
import { ModalController, ToastController } from '@ionic/angular';
import { AccountsPage } from '../accounts/accounts.page';
import { from, Subscription, Observable } from 'rxjs';
import { PreferenceService } from 'src/app/services/preference.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { MpchainUtil } from 'src/app/classes/mpchain-util';
import { MpchainAddressInfo } from 'src/app/interfaces/mpchain-address-info';
import { flatMap, tap } from 'rxjs/operators';
import { MpchainAssetBalance } from 'src/app/interfaces/mpchain-asset-balance';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss']
})
export class WalletPage implements OnInit {
  loading = false;
  address = '';
  accountName = '';
  isEditable = false;
  addressInfo: MpchainAddressInfo;
  monaBalance: MpchainAssetBalance;
  xmpBalance: MpchainAssetBalance;
  assetBalances: MpchainAssetBalance[] = [];
  searchedAsset: MpchainAssetBalance;
  private subscriptions = new Subscription();

  constructor(
    private keyringService: KeyringService,
    private preferenceService: PreferenceService,
    private modalController: ModalController,
    private clipboard: Clipboard,
    public toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.isEditable = false;
    this.updateAddress(this.preferenceService.getSelectedAddress()).subscribe({
      next: (info: MpchainAddressInfo) => {
        this.addressInfo = info;
        this.loading = false;
      },
      error: error => console.log(error)
    });

    this.subscriptions.add(
      this.preferenceService.selectedAddressState
        .pipe(
          tap(() => (this.loading = true)),
          flatMap((address: string) => this.updateAddress(address))
        )
        .subscribe({
          next: (info: MpchainAddressInfo) => {
            this.addressInfo = info;
            this.loading = false;
          },
          error: error => console.log(error)
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateAddress(address: string): Observable<MpchainAddressInfo> {
    this.address = address;
    const identity = this.preferenceService.getIdentity(this.address);
    this.accountName = identity ? identity.name : '';

    return this.updateBalance();
  }

  updateBalance(): Observable<MpchainAddressInfo> {
    return from(MpchainUtil.getAddressInfo(this.address)).pipe(
      tap((info: MpchainAddressInfo) => {
        this.monaBalance = {
          asset: 'MONA',
          asset_longname: null,
          description: '',
          estimated_value: null,
          quantity: info.mona_balance,
          unconfirmed_quantity: info.unconfirmed_mona_balance
        };
        this.xmpBalance = {
          asset: 'XMP',
          asset_longname: null,
          description: '',
          estimated_value: null,
          quantity: info.xmp_balance,
          unconfirmed_quantity: info.unconfirmed_xmp_balance
        };
      })
    );
  }

  refresh(event: any): void {
    this.loading = true;
    this.updateBalance().subscribe({
      next: () => {
        event.target.complete();
        this.loading = false;
      }
    });
  }

  openAccountsPage(): void {
    from(this.modalController.create({ component: AccountsPage })).subscribe(
      modal => modal.present()
    );
  }

  editName(): void {
    this.isEditable = true;
  }

  onInputTime(name: string): void {
    this.accountName = name;
  }

  changeAccountName(): void {
    let e = '';
    if (this.accountName === '') {
      e = 'The account name is empty';
    } else if (
      this.preferenceService.getIdentity(this.address).name !==
        this.accountName &&
      this.preferenceService.existsNameInIdentities(this.accountName)
    ) {
      e = 'The account name is a duplicate';
    }

    if (e !== '') {
      this.preferenceService.setAccountName(this.accountName);
    } else {
      from(
        this.toastController.create({
          translucent: true,
          message: e,
          duration: 2000
        })
      ).subscribe(toast => toast.present());
    }
  }

  copyAddress(): void {
    this.clipboard.copy(this.address);
    from(
      this.toastController.create({
        translucent: true,
        message: 'Copied',
        duration: 2000
      })
    ).subscribe(toast => toast.present());
  }

  search(): void {
    console.log('search');
  }
}

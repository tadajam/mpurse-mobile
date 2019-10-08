import { Component, Input } from '@angular/core';
import { MpchainAssetBalance } from 'src/app/interfaces/mpchain-asset-balance';
import { Decimal } from 'decimal.js';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent {
  @Input() asset: MpchainAssetBalance;
  @Input() searched: boolean;

  reflectUnconfirmed(): number {
    return new Decimal(this.asset.quantity)
      .plus(new Decimal(this.asset.unconfirmed_quantity))
      .toNumber();
  }

  isDivisible(): boolean {
    return this.asset.quantity.includes('.');
  }

  hasUnconfirmed(): boolean {
    return (
      this.asset &&
      this.asset.unconfirmed_quantity !== '' &&
      this.asset.unconfirmed_quantity !== '0.00000000' &&
      this.asset.unconfirmed_quantity !== '0'
    );
  }
}

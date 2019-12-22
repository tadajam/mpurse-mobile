import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { MenuComponent } from '../../components/menu/menu.component';
import { ComponentModule } from 'src/app/components/component.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      { path: '', redirectTo: 'browser', pathMatch: 'full' },
      {
        path: 'browser',
        loadChildren: '../browser/browser.module#BrowserPageModule'
      },
      {
        path: 'wallet',
        loadChildren: '../wallet/wallet.module#WalletPageModule'
      },
      {
        path: 'settings',
        loadChildren: '../settings/settings.module#SettingsPageModule'
      },
      {
        path: 'info',
        loadChildren: '../infomation/infomation.module#InfomationPageModule'
      },
      {
        path: 'signature',
        loadChildren: '../signature/signature.module#SignaturePageModule'
      },
      {
        path: 'transaction',
        loadChildren: '../transaction/transaction.module#TransactionPageModule'
      },
      {
        path: 'send-asset',
        loadChildren: '../send-asset/send-asset.module#SendAssetPageModule'
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule,
    TranslateModule
  ],
  declarations: [HomePage, MenuComponent]
})
export class HomePageModule {}

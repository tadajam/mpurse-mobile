import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AccountsPage } from './accounts.page';
import { ComponentModule } from 'src/app/components/component.module';
import { ImportAccountPageModule } from '../import-account/import-account.module';

const routes: Routes = [
  {
    path: '',
    component: AccountsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule,
    ImportAccountPageModule
  ],
  declarations: [AccountsPage]
})
export class AccountsPageModule {}

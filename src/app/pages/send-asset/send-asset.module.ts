import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SendAssetPage } from './send-asset.page';
import { ComponentModule } from 'src/app/components/component.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SendAssetPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [SendAssetPage]
})
export class SendAssetPageModule {}

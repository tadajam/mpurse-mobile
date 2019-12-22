import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignaturePage } from './signature.page';
import { ComponentModule } from 'src/app/components/component.module';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: SignaturePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [SignaturePage]
})
export class SignaturePageModule {}

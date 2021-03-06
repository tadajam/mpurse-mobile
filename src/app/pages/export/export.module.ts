import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExportPage } from './export.page';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: ExportPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [ExportPage]
})
export class ExportPageModule {}

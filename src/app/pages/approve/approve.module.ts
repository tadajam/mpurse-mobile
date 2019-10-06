import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ApprovePage } from './approve.page';
import { ComponentModule } from 'src/app/components/component.module';

const routes: Routes = [
  {
    path: '',
    component: ApprovePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule
  ],
  declarations: [ApprovePage]
})
export class ApprovePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BrowserPage } from './browser.page';
import { ComponentModule } from 'src/app/components/component.module';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserPopoverComponent } from 'src/app/components/browser-popover/browser-popover.component';

const routes: Routes = [
  {
    path: '',
    component: BrowserPage
  }
];

@NgModule({
  entryComponents: [BrowserPopoverComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [BrowserPage, BrowserPopoverComponent]
})
export class BrowserPageModule {}

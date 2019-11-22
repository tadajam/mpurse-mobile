import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportPage } from './export.page';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { AngularDelegate, ModalController } from '@ionic/angular';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { RouterTestingModule } from '@angular/router/testing';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ReactiveFormsModule } from '@angular/forms';

describe('ExportPage', () => {
  let component: ExportPage;
  let fixture: ComponentFixture<ExportPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [
        InAppBrowser,
        KeychainTouchId,
        ModalController,
        AngularDelegate,
        Clipboard,
        TranslateStore,
        BarcodeScanner
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

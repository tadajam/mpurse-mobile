import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfomationPage } from './infomation.page';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController, AngularDelegate } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

describe('InfomationPage', () => {
  let component: InfomationPage;
  let fixture: ComponentFixture<InfomationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InfomationPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [TranslateModule.forChild(), IonicStorageModule.forRoot()],
      providers: [InAppBrowser, TranslateStore]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfomationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

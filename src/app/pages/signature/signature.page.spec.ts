import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignaturePage } from './signature.page';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { ModalController, AngularDelegate, IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';

describe('SignaturePage', () => {
  let component: SignaturePage;
  let fixture: ComponentFixture<SignaturePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignaturePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule,
        HttpClientModule,
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
        TranslateStore
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignaturePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

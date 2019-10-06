import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovePage } from './approve.page';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Clipboard } from '@ionic-native/clipboard/ngx';

describe('ApprovePage', () => {
  let component: ApprovePage;
  let fixture: ComponentFixture<ApprovePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
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
    fixture = TestBed.createComponent(ApprovePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

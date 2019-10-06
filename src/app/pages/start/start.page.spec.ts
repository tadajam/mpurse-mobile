import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StartPage } from './start.page';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { RouterTestingModule } from '@angular/router/testing';

describe('StartPage', () => {
  let component: StartPage;
  let fixture: ComponentFixture<StartPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StartPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [
        InAppBrowser,
        KeychainTouchId,
        ModalController,
        AngularDelegate,
        TranslateStore
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

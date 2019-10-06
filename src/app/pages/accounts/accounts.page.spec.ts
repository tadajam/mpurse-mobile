import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsPage } from './accounts.page';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { ModalController, AngularDelegate } from '@ionic/angular';

describe('AccountsPage', () => {
  let component: AccountsPage;
  let fixture: ComponentFixture<AccountsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AccountsPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [
        KeychainTouchId,
        ModalController,
        AngularDelegate,
        TranslateStore
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

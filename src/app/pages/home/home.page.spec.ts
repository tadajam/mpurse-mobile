import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePage } from './home.page';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [KeychainTouchId, TranslateStore]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

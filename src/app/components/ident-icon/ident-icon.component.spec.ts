import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentIconComponent } from './ident-icon.component';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';

describe('IdentIconComponent', () => {
  let component: IdentIconComponent;
  let fixture: ComponentFixture<IdentIconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdentIconComponent],
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
    fixture = TestBed.createComponent(IdentIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

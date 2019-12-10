import { TestBed } from '@angular/core/testing';

import { BackgroundService } from './background.service';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { RouterTestingModule } from '@angular/router/testing';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';

describe('BackgroundService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [InAppBrowser, TranslateStore, KeychainTouchId]
    })
  );

  it('should be created', () => {
    const service: BackgroundService = TestBed.get(BackgroundService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CommonService } from './common.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

describe('CommonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [
        InAppBrowser,
        KeychainTouchId,
        Clipboard,
        BarcodeScanner,
        TranslateStore
      ]
    })
  );

  it('should be created', () => {
    const service: CommonService = TestBed.get(CommonService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { KeyringService } from './keyring.service';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';

describe('KeyringService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [KeychainTouchId, TranslateStore]
    })
  );

  it('should be created', () => {
    const service: KeyringService = TestBed.get(KeyringService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { InAppBrowserService } from './in-app-browser.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';

describe('InAppBrowserService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TranslateModule.forChild(), IonicStorageModule.forRoot()],
      providers: [InAppBrowser, TranslateStore]
    })
  );

  it('should be created', () => {
    const service: InAppBrowserService = TestBed.get(InAppBrowserService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { InAppBrowserService } from './in-app-browser.service';

describe('InAppBrowserService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [InAppBrowser]
    })
  );

  it('should be created', () => {
    const service: InAppBrowserService = TestBed.get(InAppBrowserService);
    expect(service).toBeTruthy();
  });
});

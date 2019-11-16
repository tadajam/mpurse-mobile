import { TestBed } from '@angular/core/testing';

import { CommonService } from './common.service';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

describe('CommonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [Clipboard, BarcodeScanner]
    })
  );

  it('should be created', () => {
    const service: CommonService = TestBed.get(CommonService);
    expect(service).toBeTruthy();
  });
});

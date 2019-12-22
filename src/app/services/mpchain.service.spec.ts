import { TestBed } from '@angular/core/testing';

import { MpchainService } from './mpchain.service';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';

describe('MpchainService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TranslateModule.forChild()],
      providers: [TranslateStore]
    })
  );

  it('should be created', () => {
    const service: MpchainService = TestBed.get(MpchainService);
    expect(service).toBeTruthy();
  });
});

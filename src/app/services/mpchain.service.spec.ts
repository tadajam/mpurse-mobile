import { TestBed } from '@angular/core/testing';

import { MpchainService } from './mpchain.service';

describe('MpchainService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MpchainService = TestBed.get(MpchainService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { CommonService } from './common.service';
import { ModalController, AngularDelegate } from '@ionic/angular';

describe('CommonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [ModalController, AngularDelegate]
    })
  );

  it('should be created', () => {
    const service: CommonService = TestBed.get(CommonService);
    expect(service).toBeTruthy();
  });
});

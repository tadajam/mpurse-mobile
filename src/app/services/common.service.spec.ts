import { TestBed } from '@angular/core/testing';

import { CommonService } from './common.service';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { Clipboard } from '@ionic-native/clipboard/ngx';

describe('CommonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TranslateModule.forChild()],
      providers: [ModalController, AngularDelegate, Clipboard]
    })
  );

  it('should be created', () => {
    const service: CommonService = TestBed.get(CommonService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PreferenceService } from './preference.service';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';

describe('PreferenceService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [TranslateStore]
    })
  );

  it('should be created', () => {
    const service: PreferenceService = TestBed.get(PreferenceService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { BackgroundService } from './background.service';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ModalController, AngularDelegate } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

describe('BackgroundService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        TranslateModule.forChild(),
        IonicStorageModule.forRoot()
      ],
      providers: [
        InAppBrowser,
        ModalController,
        AngularDelegate,
        TranslateStore
      ]
    })
  );

  it('should be created', () => {
    const service: BackgroundService = TestBed.get(BackgroundService);
    expect(service).toBeTruthy();
  });
});

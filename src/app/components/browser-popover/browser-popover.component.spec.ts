import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserPopoverComponent } from './browser-popover.component';
import {
  ModalController,
  AngularDelegate,
  PopoverController
} from '@ionic/angular';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';

describe('BrowserPopoverComponent', () => {
  let component: BrowserPopoverComponent;
  let fixture: ComponentFixture<BrowserPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowserPopoverComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [TranslateModule.forChild()],
      providers: [
        ModalController,
        AngularDelegate,
        PopoverController,
        TranslateStore
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowserPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

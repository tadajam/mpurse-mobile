import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowserPopoverComponent } from './browser-popover.component';
import {
  ModalController,
  AngularDelegate,
  PopoverController
} from '@ionic/angular';

describe('BrowserPopoverComponent', () => {
  let component: BrowserPopoverComponent;
  let fixture: ComponentFixture<BrowserPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BrowserPopoverComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [],
      providers: [ModalController, AngularDelegate, PopoverController]
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

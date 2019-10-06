import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfomationPage } from './infomation.page';

describe('InfomationPage', () => {
  let component: InfomationPage;
  let fixture: ComponentFixture<InfomationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [InfomationPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfomationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

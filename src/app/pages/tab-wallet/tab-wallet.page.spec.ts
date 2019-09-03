import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabWalletPage } from './tab-wallet.page';

describe('TabWalletPage', () => {
  let component: TabWalletPage;
  let fixture: ComponentFixture<TabWalletPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabWalletPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabWalletPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

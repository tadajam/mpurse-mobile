import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabBrowserPage } from './tab-browser.page';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

describe('TabBrowserPage', () => {
  let component: TabBrowserPage;
  let fixture: ComponentFixture<TabBrowserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabBrowserPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [InAppBrowser]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabBrowserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

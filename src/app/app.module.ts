import { NgModule, Injectable } from '@angular/core';
import {
  BrowserModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { KeychainTouchId } from '@ionic-native/keychain-touch-id/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AccountsPageModule } from './pages/accounts/accounts.module';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { ApprovePageModule } from './pages/approve/approve.module';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@Injectable()
export class IonicGestureConfig extends HammerGestureConfig {
  buildHammer(element: HTMLElement): any {
    const mc = new (window as any).Hammer(element);
    for (const eventName in this.overrides) {
      if (eventName) {
        mc.get(eventName).set(this.overrides[eventName]);
      }
    }
    return mc;
  }
}

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    AccountsPageModule,
    ApprovePageModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HAMMER_GESTURE_CONFIG, useClass: IonicGestureConfig },
    InAppBrowser,
    KeychainTouchId,
    Clipboard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

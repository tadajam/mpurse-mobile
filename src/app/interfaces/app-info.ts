import { InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';

export interface AppInfo {
  inAppBrowserObject?: InAppBrowserObject;
  href: string;
  origin?: string;
  title: string;
  icon: string;
  description: string;
}

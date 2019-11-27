import { Component } from '@angular/core';
import { InAppBrowserService } from 'src/app/services/in-app-browser.service';

@Component({
  selector: 'app-infomation',
  templateUrl: './infomation.page.html',
  styleUrls: ['./infomation.page.scss']
})
export class InfomationPage {
  constructor(private inAppBrowserService: InAppBrowserService) {}

  openInAppBrowser(query: string): void {
    this.inAppBrowserService.open(query);
  }
}

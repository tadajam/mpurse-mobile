import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { from, Observable, timer, Subscription } from 'rxjs';
import { Clipboard } from '@ionic-native/clipboard/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { filter, map } from 'rxjs/operators';
import QRCode from 'qrcode';
import { PreferenceService } from './preference.service';
import { Router } from '@angular/router';
import { KeyringService } from './keyring.service';
import { InAppBrowserService } from './in-app-browser.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(
    private clipboard: Clipboard,
    private toastController: ToastController,
    private barcodeScanner: BarcodeScanner,
    private preferenceService: PreferenceService,
    private router: Router,
    private keyringService: KeyringService,
    private inAppBrowserService: InAppBrowserService,
    private translateService: TranslateService
  ) {}

  private presentToast(message: string, css: string): void {
    const duration = message.toString().length * 50;
    from(
      this.toastController.create({
        message: message,
        cssClass: 'toast ' + css,
        duration: duration,
        position: 'bottom',
        showCloseButton: duration > 5000
      })
    ).subscribe({ next: toast => toast.present() });
  }

  presentSuccessToast(message: string): void {
    this.presentToast(message, 'toast-success');
  }

  presentErrorToast(message: string): void {
    this.presentToast(message, 'toast-error');
  }

  copyString(targetStr: string): void {
    from(this.clipboard.copy(targetStr)).subscribe({
      next: () =>
        this.presentSuccessToast(this.translateService.instant('common.copy'))
    });
  }

  scanQrcode(): Observable<string> {
    return from(this.barcodeScanner.scan()).pipe(
      filter(barcodeData => !barcodeData.cancelled),
      map(barcodeData => barcodeData.text)
    );
  }

  createQrcode(targetStr: string): Observable<string> {
    return from(
      QRCode.toDataURL(targetStr, {
        errorCorrectionLevel: 'H'
      })
    ) as Observable<string>;
  }

  autoLockTimer(): Subscription {
    const autoLockTime = this.preferenceService.getAutoLockTime();
    if (autoLockTime < 0) {
      return Subscription.EMPTY;
    } else {
      return timer(autoLockTime).subscribe({
        next: () => this.lock()
      });
    }
  }

  lock(): void {
    this.inAppBrowserService.hideTabs();
    this.keyringService.lock();
    this.router.navigateByUrl('/');
  }
}

import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  constructor(private toastController: ToastController) {}

  private presentToast(message: string, css: string): void {
    const duration = message.toString().length * 50;
    from(
      this.toastController.create({
        message: message,
        color: 'light',
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
}

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InPageMessage } from '../enum/in-page-message.enum';
import { InAppBrowserService } from './in-app-browser.service';
import { InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { flatMap, map, filter, catchError } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { PreferenceService } from './preference.service';
import { MpchainService } from './mpchain.service';

@Injectable({
  providedIn: 'root'
})
export class BackgroundService {
  private inAppBrowserObject: InAppBrowserObject;
  private href: string;
  private origin: string;
  private title: string;
  private icon: string;
  private pendingRequests: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private preferenceService: PreferenceService,
    private inAppBrowserService: InAppBrowserService,
    private router: Router,
    private mpchainService: MpchainService
  ) {
    this.inAppBrowserService.inAppBrowserObjectState.subscribe(
      (inAppBrowser: InAppBrowserObject) => {
        this.inAppBrowserObject = inAppBrowser;
        this.onCreateInAppBrowser();
      }
    );
  }

  onCreateInAppBrowser(): void {
    this.inAppBrowserObject.on('exit').subscribe(() => {
      this.inAppBrowserObject = null;
      this.origin = null;
      this.pendingRequests = [];
    });

    this.inAppBrowserObject
      .on('message')
      .pipe(filter(event => event['data'].action === InPageMessage.InitRequest))
      .subscribe(event => {
        this.href = event['data'].message.href;
        this.origin = event['data'].message.origin;
        this.title = event['data'].message.title;
        this.icon = event['data'].message.icon;
        this.sendResponse(event['data'].action, event['data'].id, {
          isUnlocked: true
        });
      });

    this.inAppBrowserObject
      .on('message')
      .pipe(
        filter(
          event =>
            event['data'].action === InPageMessage.AddressRequest ||
            event['data'].action === InPageMessage.SendAssetRequest ||
            event['data'].action === InPageMessage.SignRawTransactionRequest ||
            event['data'].action === InPageMessage.SignMessageRequest ||
            event['data'].action === InPageMessage.SendRawTransactionRequest
        ),
        map(event => {
          switch (event['data'].action) {
            case InPageMessage.AddressRequest:
              event['data'].target = '';
              break;
            case InPageMessage.SendAssetRequest:
              event['data'].target = 'send';
              break;
            case InPageMessage.SignRawTransactionRequest:
              event['data'].target = 'transaction';
              break;
            case InPageMessage.SignMessageRequest:
              event['data'].target = 'signature';
              break;
            case InPageMessage.SendRawTransactionRequest:
              event['data'].target = 'transaction';
              break;
          }
          event['data'].href = this.href;
          event['data'].origin = this.origin;
          event['data'].title = this.title;
          event['data'].icon = this.icon;
          this.pendingRequests.push(event['data']);
        }),
        filter(() => this.pendingRequests.length === 1)
      )
      .subscribe({
        next: () => this.navigateByPendingRequest()
      });

    this.inAppBrowserObject
      .on('message')
      .pipe(
        filter(
          event =>
            event['data'].action === InPageMessage.MpchainRequest ||
            event['data'].action === InPageMessage.CounterBlockRequest ||
            event['data'].action === InPageMessage.CounterPartyRequest
        ),
        flatMap(event => {
          switch (event['data'].action) {
            case InPageMessage.MpchainRequest:
              return this.mpchainApi(
                event['data'],
                this.mpchainService.mp(
                  event['data'].message.method,
                  event['data'].message.params
                )
              );
            case InPageMessage.CounterBlockRequest:
              return this.mpchainApi(
                event['data'],
                this.mpchainService.cb(
                  event['data'].message.method,
                  event['data'].message.params
                )
              );
            case InPageMessage.CounterPartyRequest:
              return this.mpchainApi(
                event['data'],
                this.mpchainService.cp(
                  event['data'].message.method,
                  event['data'].message.params
                )
              );
          }
        })
      )
      .subscribe({
        next: result => {
          this.sendResponse(result.action, result.id, result.result);
        }
      });
  }

  mpchainApi(
    data: any,
    api: Observable<any>
  ): Observable<{ action: InPageMessage; id: number; result: any }> {
    return api.pipe(
      map(result => {
        return { action: data.action, id: data.id, result: result };
      }),
      catchError(error => {
        return of({ action: data.action, id: data.id, result: error });
      })
    );
  }

  private postMessage(response: {
    action: InPageMessage;
    id: number;
    data: any;
  }): void {
    this.inAppBrowserObject.executeScript({
      code: 'window.postMessage(' + JSON.stringify(response) + ', "*")'
    });
  }

  getPendingRequests(): any[] {
    return this.pendingRequests;
  }

  getPendingRequest(id: number): any {
    return this.pendingRequests.find(value => value.id === id);
  }

  cancelPendingRequest(id: number): void {
    const request = this.pendingRequests.find(value => value.id === id);
    if (request) {
      this.sendResponse(request.action, request.id, {
        error: 'User Cancelled'
      });
    }
    this.setApprovalRequestId(null);
  }

  setApprovalRequestId(id: number): void {
    this.router.navigateByUrl(
      this.router.createUrlTree(['.'], {
        relativeTo: this.activatedRoute,
        queryParams: { approvalRequestId: id },
        queryParamsHandling: 'merge'
      })
    );
  }

  sendResponse(requestAction: InPageMessage, id: number, result: any): void {
    this.postMessage({
      action: this.getResponseAction(requestAction),
      id: id,
      data: result
    });

    this.pendingRequests = this.pendingRequests.filter(
      value => value.id !== id
    );

    if (this.pendingRequests.length === 0) {
      this.inAppBrowserObject.show();
    } else {
      this.navigateByPendingRequest();
    }
  }

  getResponseAction(requestAction: InPageMessage): InPageMessage {
    switch (requestAction) {
      case InPageMessage.InitRequest:
        return InPageMessage.InitResponse;
      case InPageMessage.AddressRequest:
        return InPageMessage.AddressResponse;
      case InPageMessage.SendAssetRequest:
        return InPageMessage.SendAssetResponse;
      case InPageMessage.SignRawTransactionRequest:
        return InPageMessage.SignRawTransactionResponse;
      case InPageMessage.SignMessageRequest:
        return InPageMessage.SignMessageResponse;
      case InPageMessage.SendRawTransactionRequest:
        return InPageMessage.SendRawTransactionResponse;
      case InPageMessage.MpchainRequest:
        return InPageMessage.MpchainResponse;
      case InPageMessage.CounterBlockRequest:
        return InPageMessage.CounterBlockResponse;
      case InPageMessage.CounterPartyRequest:
        return InPageMessage.CounterPartyResponse;
    }
  }
  navigateByPendingRequest(): void {
    this.setApprovalRequestId(null);
    const address = this.preferenceService.getSelectedAddress();
    const identity = this.preferenceService.getIdentity(address);
    if (!identity.approvedOrigins.some(value => value === this.origin)) {
      this.inAppBrowserObject.hide();
      this.setApprovalRequestId(this.pendingRequests[0].id);
    } else {
      if (this.pendingRequests[0].target === '') {
        this.sendResponse(
          this.pendingRequests[0].action,
          this.pendingRequests[0].id,
          { address: address }
        );
      } else {
        this.inAppBrowserObject.hide();
        this.router.navigateByUrl(
          this.router.createUrlTree(
            ['/home/' + this.pendingRequests[0].target],
            { queryParams: { id: this.pendingRequests[0].id } }
          )
        );
      }
    }
  }
}

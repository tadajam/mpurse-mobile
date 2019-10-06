import { Injectable } from '@angular/core';
import {
  InAppBrowser,
  InAppBrowserObject,
  InAppBrowserEvent
} from '@ionic-native/in-app-browser/ngx';
import { flatMap, filter } from 'rxjs/operators';
import { InPageMessage } from '../enum/in-page-message.enum';
import { Subject } from 'rxjs';
import { AppInfo } from '../interfaces/app-info';

@Injectable({
  providedIn: 'root'
})
export class InAppBrowserService {
  inAppBrowserObject: InAppBrowserObject;
  private inAppBrowserObjectSubject = new Subject<InAppBrowserObject>();
  inAppBrowserObjectState = this.inAppBrowserObjectSubject.asObservable();

  lastBrowse: AppInfo = null;

  favorites: AppInfo[] = [];

  histories: AppInfo[] = [];

  constructor(private inAppBrowser: InAppBrowser) {}

  open(target: string): void {
    this.inAppBrowserObject = this.inAppBrowser.create(
      this.generateUrl(target),
      '_blank',
      { hideurlbar: 'yes' }
    );
    this.inAppBrowserObjectSubject.next(this.inAppBrowserObject);

    this.inAppBrowserObject.on('exit').subscribe({
      next: () => {
        this.addHistory(this.lastBrowse);
        this.lastBrowse = null;
      }
    });

    this.inAppBrowserObject
      .on('message')
      .pipe(
        filter(
          (event: InAppBrowserEvent) =>
            event['data']['action'] === InPageMessage.InitRequest
        )
      )
      .subscribe({
        next: (event: InAppBrowserEvent) => {
          this.lastBrowse = {
            href: event['data']['message']['href'],
            origin: event['data']['message']['origin'],
            title: event['data']['message']['title'],
            icon: event['data']['message']['icon']
          };
        }
      });

    this.inAppBrowserObject
      .on('loadstop')
      .pipe(
        flatMap(() =>
          this.inAppBrowserObject.executeScript({
            code: this.getInPageString()
          })
        )
      )
      .subscribe({
        next: x => console.log('executeScript response : ' + JSON.stringify(x)),
        error: error => console.log(error)
      });
  }

  show(): void {
    if (this.inAppBrowserObject) {
      this.inAppBrowserObject.show();
    }
  }

  hide(): void {
    if (this.inAppBrowserObject) {
      this.inAppBrowserObject.hide();
    }
  }

  getFavorites(): {
    href: string;
    origin: string;
    title: string;
    icon: string;
  }[] {
    return this.favorites;
  }

  setFavorites(
    favorites: { href: string; origin: string; title: string; icon: string }[]
  ): void {
    this.favorites = favorites;
  }

  addFavorite(favorite: {
    href: string;
    origin: string;
    title: string;
    icon: string;
  }): void {
    if (favorite) {
      this.favorites.push(favorite);
    }
  }

  deleteFavorite(favorite: string): void {
    this.favorites = this.favorites.filter(v => v.href !== favorite);
  }

  getHistories(): {
    href: string;
    origin: string;
    title: string;
    icon: string;
  }[] {
    return this.histories;
  }

  addHistory(history: {
    href: string;
    origin: string;
    title: string;
    icon: string;
  }): void {
    if (history) {
      this.histories.unshift(history);
    }
  }

  deleteHistory(history: string): void {
    this.histories = this.histories.filter(v => v.href !== history);
  }

  generateUrl(target: string): string {
    try {
      new URL(target);
      return target;
    } catch (e) {
      return 'https://www.google.com/search?q=' + target;
    }
  }

  //I want to load via file.
  getInPageString(): string {
    return '!function(e){var t={};function n(s){if(t[s])return t[s].exports;var r=t[s]={i:s,l:!1,exports:{}};return e[s].call(r.exports,r,r.exports,n),r.l=!0,r.exports}n.m=e,n.c=t,n.d=function(e,t,s){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:s})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(n.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)n.d(s,r,function(t){return e[t]}.bind(null,r));return s},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});const s=n(1),r=n(2);window.mpurse=new class{constructor(){this.updateEmitter=new r.EventEmitter,this.init()}onMessage(e,t,n,s){const r=this.createListener(e,t,n,s);window.addEventListener("message",r)}createListener(e,t,n,s){const r=o=>{o.data.action===e&&o.data.id===n&&(t&&window.removeEventListener("message",r),s(o.data))};return r}init(){this.initId=Math.random(),this.onMessage(s.InPageMessage.InitResponse,!0,this.initId,e=>{this.onMessage(s.InPageMessage.LoginState,!1,0,e=>this.updateEmitter.emit("stateChanged",e.data.isUnlocked)),this.onMessage(s.InPageMessage.AddressState,!1,0,e=>this.updateEmitter.emit("addressChanged",e.data.address)),this.updateEmitter.emit("stateChanged",e.data.isUnlocked)}),window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.InitRequest,id:this.initId,message:{href:window.location.href,origin:window.origin,title:window.document.title,icon:this.getTouchIcon()}}))}getTouchIcon(){const e=document.getElementsByTagName("link");let t=[];for(let n=0;e.length>n;n++)"apple-touch-icon"===e[n].rel?t[0]=e[n].href:"icon"===e[n].rel&&(t[1]=e[n].href);return t[0]?t[0]:t[1]}getAddress(){return new Promise((e,t)=>{const n=Math.random();this.onMessage(s.InPageMessage.AddressResponse,!0,n,n=>{n.data.error?t(n.data.error):e(n.data.address)}),window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.AddressRequest,id:n,message:null}))})}sendAsset(e,t,n,r,o){return new Promise((i,a)=>{const u=Math.random();this.onMessage(s.InPageMessage.SendAssetResponse,!0,u,e=>{e.data.error?a(e.data.error):i(e.data.txHash)});const d={to:e,asset:t,amount:n,memoType:r,memoValue:o};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.SendAssetRequest,id:u,message:d}))})}signRawTransaction(e){return new Promise((t,n)=>{const r=Math.random();this.onMessage(s.InPageMessage.SignRawTransactionResponse,!0,r,e=>{e.data.error?n(e.data.error):t(e.data.signedTx)});const o={tx:e};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.SignRawTransactionRequest,id:r,message:o}))})}signMessage(e){return new Promise((t,n)=>{const r=Math.random();this.onMessage(s.InPageMessage.SignMessageResponse,!0,r,e=>{e.data.error?n(e.data.error):t(e.data.signature)});const o={message:e};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.SignMessageRequest,id:r,message:o}))})}sendRawTransaction(e){return new Promise((t,n)=>{const r=Math.random();this.onMessage(s.InPageMessage.SendRawTransactionResponse,!0,r,e=>{e.data.error?n(e.data.error):t(e.data.txHash)});const o={tx:e};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.SendRawTransactionRequest,id:r,message:o}))})}mpchain(e,t){return new Promise((n,r)=>{const o=Math.random();this.onMessage(s.InPageMessage.MpchainResponse,!0,o,e=>{e.data.error?r(e.data.error):n(e.data)});const i={method:e,params:t};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.MpchainRequest,id:o,message:i}))})}counterBlock(e,t){return new Promise((n,r)=>{const o=Math.random();this.onMessage(s.InPageMessage.CounterBlockResponse,!0,o,e=>{e.data.error?r(e.data.error):n(e.data)});const i={method:e,params:t};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.CounterBlockRequest,id:o,message:i}))})}counterParty(e,t){return new Promise((n,r)=>{const o=Math.random();this.onMessage(s.InPageMessage.CounterPartyResponse,!0,o,e=>{e.data.error?r(e.data.error):n(e.data)});const i={method:e,params:t};window.webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({action:s.InPageMessage.CounterPartyRequest,id:o,message:i}))})}}},function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){e.InitRequest="mpurse.init.request",e.InitResponse="mpurse.init.response",e.AddressState="mpurse.state.address",e.LoginState="mpurse.state.login",e.AddressRequest="mpurse.address.request",e.AddressResponse="mpurse.address.response",e.SendAssetRequest="mpurse.send.asset.request",e.SendAssetResponse="mpurse.send.asset.response",e.SignRawTransactionRequest="mpurse.sign.tx.request",e.SignRawTransactionResponse="mpurse.sign.tx.response",e.SignMessageRequest="mpurse.sign.message.request",e.SignMessageResponse="mpurse.sign.message.response",e.SendRawTransactionRequest="mpurse.send.tx.raw.request",e.SendRawTransactionResponse="mpurse.send.tx.raw.response",e.MpchainRequest="mpurse.mpchain.request",e.MpchainResponse="mpurse.mpchain.response",e.CounterBlockRequest="mpurse.counterblock.request",e.CounterBlockResponse="mpurse.counterblock.response",e.CounterPartyRequest="mpurse.counterparty.request",e.CounterPartyResponse="mpurse.counterparty.response"}(t.InPageMessage||(t.InPageMessage={}))},function(e,t,n){"use strict";var s,r="object"==typeof Reflect?Reflect:null,o=r&&"function"==typeof r.apply?r.apply:function(e,t,n){return Function.prototype.apply.call(e,t,n)};s=r&&"function"==typeof r.ownKeys?r.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var i=Number.isNaN||function(e){return e!=e};function a(){a.init.call(this)}e.exports=a,a.EventEmitter=a,a.prototype._events=void 0,a.prototype._eventsCount=0,a.prototype._maxListeners=void 0;var u=10;function d(e){return void 0===e._maxListeners?a.defaultMaxListeners:e._maxListeners}function c(e,t,n,s){var r,o,i,a;if("function"!=typeof n)throw new TypeError(\'The "listener" argument must be of type Function. Received type \'+typeof n);if(void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),o=e._events),i=o[t]),void 0===i)i=o[t]=n,++e._eventsCount;else if("function"==typeof i?i=o[t]=s?[n,i]:[i,n]:s?i.unshift(n):i.push(n),(r=d(e))>0&&i.length>r&&!i.warned){i.warned=!0;var u=new Error("Possible EventEmitter memory leak detected. "+i.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");u.name="MaxListenersExceededWarning",u.emitter=e,u.type=t,u.count=i.length,a=u,console&&console.warn&&console.warn(a)}return e}function p(){for(var e=[],t=0;t<arguments.length;t++)e.push(arguments[t]);this.fired||(this.target.removeListener(this.type,this.wrapFn),this.fired=!0,o(this.listener,this.target,e))}function g(e,t,n){var s={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},r=p.bind(s);return r.listener=n,s.wrapFn=r,r}function f(e,t,n){var s=e._events;if(void 0===s)return[];var r=s[t];return void 0===r?[]:"function"==typeof r?n?[r.listener||r]:[r]:n?function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(r):h(r,r.length)}function l(e){var t=this._events;if(void 0!==t){var n=t[e];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function h(e,t){for(var n=new Array(t),s=0;s<t;++s)n[s]=e[s];return n}Object.defineProperty(a,"defaultMaxListeners",{enumerable:!0,get:function(){return u},set:function(e){if("number"!=typeof e||e<0||i(e))throw new RangeError(\'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received \'+e+".");u=e}}),a.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},a.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||i(e))throw new RangeError(\'The value of "n" is out of range. It must be a non-negative number. Received \'+e+".");return this._maxListeners=e,this},a.prototype.getMaxListeners=function(){return d(this)},a.prototype.emit=function(e){for(var t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);var s="error"===e,r=this._events;if(void 0!==r)s=s&&void 0===r.error;else if(!s)return!1;if(s){var i;if(t.length>0&&(i=t[0]),i instanceof Error)throw i;var a=new Error("Unhandled error."+(i?" ("+i.message+")":""));throw a.context=i,a}var u=r[e];if(void 0===u)return!1;if("function"==typeof u)o(u,this,t);else{var d=u.length,c=h(u,d);for(n=0;n<d;++n)o(c[n],this,t)}return!0},a.prototype.addListener=function(e,t){return c(this,e,t,!1)},a.prototype.on=a.prototype.addListener,a.prototype.prependListener=function(e,t){return c(this,e,t,!0)},a.prototype.once=function(e,t){if("function"!=typeof t)throw new TypeError(\'The "listener" argument must be of type Function. Received type \'+typeof t);return this.on(e,g(this,e,t)),this},a.prototype.prependOnceListener=function(e,t){if("function"!=typeof t)throw new TypeError(\'The "listener" argument must be of type Function. Received type \'+typeof t);return this.prependListener(e,g(this,e,t)),this},a.prototype.removeListener=function(e,t){var n,s,r,o,i;if("function"!=typeof t)throw new TypeError(\'The "listener" argument must be of type Function. Received type \'+typeof t);if(void 0===(s=this._events))return this;if(void 0===(n=s[e]))return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete s[e],s.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(r=-1,o=n.length-1;o>=0;o--)if(n[o]===t||n[o].listener===t){i=n[o].listener,r=o;break}if(r<0)return this;0===r?n.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(n,r),1===n.length&&(s[e]=n[0]),void 0!==s.removeListener&&this.emit("removeListener",e,i||t)}return this},a.prototype.off=a.prototype.removeListener,a.prototype.removeAllListeners=function(e){var t,n,s;if(void 0===(n=this._events))return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]),this;if(0===arguments.length){var r,o=Object.keys(n);for(s=0;s<o.length;++s)"removeListener"!==(r=o[s])&&this.removeAllListeners(r);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(void 0!==t)for(s=t.length-1;s>=0;s--)this.removeListener(e,t[s]);return this},a.prototype.listeners=function(e){return f(this,e,!0)},a.prototype.rawListeners=function(e){return f(this,e,!1)},a.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):l.call(e,t)},a.prototype.listenerCount=l,a.prototype.eventNames=function(){return this._eventsCount>0?s(this._events):[]}}]);';
  }
}

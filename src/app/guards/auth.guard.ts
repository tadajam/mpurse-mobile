import { Injectable } from '@angular/core';
import { UrlTree, CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { KeyringService } from '../services/keyring.service';
import { map, flatMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private keyringService: KeyringService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.keyringService.isUnlocked().pipe(
      flatMap((isUnlocked: boolean) => {
        if (isUnlocked) {
          return this.keyringService
            .createExistingKeyring()
            .pipe(map(() => true));
        } else {
          return of(this.router.parseUrl('/login'));
        }
      }),
      catchError(() => of(this.router.parseUrl('/start')))
    );
  }
}

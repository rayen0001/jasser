import { HttpInterceptorFn } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth/login') || req.url.includes('/auth/signup')) {
    return next(req);
  }

  return from(Preferences.get({ key: 'token' })).pipe(
    switchMap(({ value }) => {
      if (!value) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${value}`,
        },
      });

      return next(authReq);
    })
  );
};

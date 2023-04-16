/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  uidHandler:any;
  constructor(private router:Router){
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // console.log('Request');

    return next.handle(request).pipe(catchError((error:any)=>{
      if(error instanceof HttpErrorResponse && error.status==401){
        localStorage.clear();
        this.router.navigate(['login'])
      }
     if(error instanceof HttpErrorResponse && error.status==404){
        localStorage.clear();
        this.router.navigate(['404'])
      }
      return throwError(error);
    }));
  }
}

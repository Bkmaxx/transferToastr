import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuard implements CanActivate {
  constructor(private router:Router){}
  canActivate(): boolean{
    if(localStorage.getItem('uid')){
      return true;
    }
    else{
      this.router.navigate(['login'])
      return false;
    }
  }

}

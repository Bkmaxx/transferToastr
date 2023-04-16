import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-http-error-page',
  templateUrl: './http-error-page.component.html',
  styleUrls: ['./http-error-page.component.scss']
})
export class HttpErrorPageComponent {
time=5;
constructor(private router:Router){
  const x=setInterval(()=>this.time--,1000)
  setTimeout(()=>{
    clearInterval(x)
router.navigate(['dashboard'])
  },5000)
}
}

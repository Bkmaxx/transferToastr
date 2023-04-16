import { Component, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from 'src/services/shared/loader.service';
import { ToastrService } from 'src/services/shared/toastr.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  uidHandler: string | null;
  showLoader:any;
  banner:string=`
  dP""b8  88  88 88 888888  dP""b8  88  88    db    888888 Yb    dP oP"Yb. 
  dP      88  88 88   88   dP       88  88   dPYb     88    Yb  dP  "' dP' 
  Yb      888888 88   88   Yb       888888  dP__Yb    88     YbdP     dP'  
   Ybood  88  88 88   88    Ybood   88  88 dP""""Yb   88      YP    .d8888 
                                                                                                         
  `
  constructor(private router:Router,private toastr:ToastrService,private loader:LoaderService){
    console.log(this.banner)
    console.log=()=>null;
    this.uidHandler=localStorage.getItem('uid');
    this.loader.getLoadingStatus().subscribe((response:any)=>{
      this.showLoader=response?.loading;
      // console.log(response);
  
    })
    
    this.toastr.getNotification().subscribe((response:any)=>{
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      if(response?.message){
        // console.log(response?.message);
        
        Toast.fire({
          icon: 'success',
          title: response?.message
        })
      }
    })
  }
  @HostListener('window:storage')
  onStorageChange() {
    // console.log('Smart Guy');

    if(localStorage.getItem('uid')&&!this.uidHandler){
      this.uidHandler=localStorage.getItem('uid');
    }
    if(localStorage.getItem('uid')&&this.uidHandler){
      if(localStorage.getItem('uid')!==this.uidHandler){
          localStorage.clear()
          this.router.navigate(['login'])
      }
    }
  }

  



}

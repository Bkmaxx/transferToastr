import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ToastrService {
  private toastr=new BehaviorSubject<any>({message:'Welcome To ChitChatV2'})
  private notify=this.toastr.asObservable()
  setToastMessage(message:String){
    return this.toastr.next({message:message})
  }
  getNotification(){
    return this.notify;
  }
}

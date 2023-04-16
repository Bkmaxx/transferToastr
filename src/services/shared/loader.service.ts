import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  
  private spinner=new BehaviorSubject<any>({loading:false})
  private loading= this.spinner.asObservable();
  getLoadingStatus(){
    return this.loading
  }
  setLoadingStatus(response:boolean){
    return this.spinner.next({loading:response})
  }
}

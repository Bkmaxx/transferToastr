import { Component, OnInit,ChangeDetectorRef,AfterViewInit,AfterViewChecked} from '@angular/core';
import { urls } from 'src/commons/constants';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/services/shared/firebase.service';
import { collection,doc, where, query, getDocs, addDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { HttpRequestsService } from 'src/services/shared/http-requests.service';
import { LoaderService } from 'src/services/shared/loader.service';
import { ToastrService } from 'src/services/shared/toastr.service';

@Component({
  selector: 'app-search-user',
  templateUrl: './search-user.component.html',
  styleUrls: ['./search-user.component.scss']
})
export class SearchUserComponent implements OnInit,AfterViewInit,AfterViewChecked{
  urls=urls
  dataBase:any;
  dataBaseReffrence:any;
  chatsReff:any;
  userData: any;
  chatsList:any=[];
  usersChatlistsReff: any;
  searchInput:any;
  searchInputDebounce:any;
  searchResult:any=[];
  userschatReff:any;
  chatId:any;
  chatName:any;
  chatProfile:any;
  senderId=localStorage.getItem('uid')??'';
  switchReponse: any='0';
  chatlistListener:any;
  recieverId:any;
  isAnonymous:boolean=localStorage.getItem('uid')?.startsWith('0x')?true:false;
  showLoader: any;
constructor(private router:Router,
  private fireBaseService:FirebaseService,
  private httpRequests:HttpRequestsService
 , private loader:LoaderService,
 private changeDetector:ChangeDetectorRef
 ,private toastr:ToastrService,
 ){
  if(!(localStorage.getItem('uid'))){
    router.navigate(['login'])
  }
  loader.setLoadingStatus(true);
  this.dataBase=fireBaseService.getDb();
  this.dataBaseReffrence=doc(this.dataBase,'chats',this.senderId);
  this.chatsReff=collection(this.dataBase, "chats");
  this.usersChatlistsReff=collection(this.dataBase, 'usersChatlists',localStorage.getItem('uid')??'','chats');
  httpRequests.getUser(this.isAnonymous).subscribe((response:any)=>{
    this.userData=Object.values(response)[0];
    this.userData.id=this.isAnonymous?parseInt(this.userData.uid,16).toString():this.userData.id;})
}

ngOnInit() {
  this.chatlistListener = onSnapshot(collection(this.dataBase, 'usersChatlists',localStorage.getItem('uid')??'','chats'), (collection) => {
    this.chatsList=[];
    collection.docs.forEach((result:any,index:number,array:any)=>{
      this.chatsList.push(result.data());
      // console.log(index+' == '+array.length ,index==array.length-1);
      
      if(index==array.length-1){
        this.loader.setLoadingStatus(false)
      }

    })})

}
ngAfterViewInit() {
  this.changeDetector.detectChanges()
}
ngAfterViewChecked() {
  this.changeDetector.detectChanges()
}
errorImageHandler(imageEvent:any) {
    imageEvent.target.src=urls.defaultProfile;
    }
logOut(){
  localStorage.clear()
  this.toastr.setToastMessage('Sign-Out Success !')
  this.router.navigate(['/login'])
}
searchUser(inputEvent:any){
    // console.log(inputEvent?.value);
    clearTimeout(this.searchInputDebounce)
    this.searchInputDebounce=setTimeout(()=>{
      // console.log('Searching ... ');
      this.searchQuery(Array.from(inputEvent.value))
    },1000)
}
searchQuery(searchArray:any){
  // console.log('response');
  if(searchArray.length>0){
    const search=query(collection(this.dataBase, 'usersChatlists'), where('userName','array-contains-any',searchArray));
    this.searchResult=[]
    getDocs(search).then((response:any)=>response.forEach((doc:any) => {
      if(doc.id!==this.senderId){
      this.searchResult.push({id:doc.id,name:String(doc.data().userName).replaceAll(',','')});
      // console.log(doc.id, ' => ', doc.data());
    }
  }))
  }
  else{
    this.searchResult=null;
  }
}

createChat(uid:any){
    this.userschatReff=collection(this.dataBase,'usersChatlists',this.senderId,'chats');
    const idArray:any=[]
    const messagIdArray:any=[]
    getDocs(this.userschatReff).then((response:any)=>
    {response.forEach((result:any)=>{
      // console.log(result?.id);
      if(result.id==uid){
        this.chatId=result?.data()?.id
        this.switchReponse='0'
      }
      idArray.push(result?.id);
      messagIdArray.push(result?.data()?.id)

    })
    // console.log(idArray,uid);

    if(idArray.includes(uid)){
      // console.log('Chat All ready Exists',this.chatId)
    }
    else{
        addDoc(this.chatsReff, {messages:[]}).then((response:any)=>{
        this.chatId=response?.id
        this.switchReponse='0'
        const recieverId=uid;
        const senderData={id:this.chatId,reciever:recieverId};
        const recieverData={id:this.chatId,reciever:this.senderId};
        const sender=collection(this.dataBase,'usersChatlists',this.senderId,'chats');
        const reciever=collection(this.dataBase,'usersChatlists',recieverId,'chats');
        setDoc(doc(sender,recieverId),senderData).then((response:any)=>{
          // console.log(response||'Success-Sender')
        }
          ).catch(()=>console.log('Error'))
        setDoc(doc(reciever,this.senderId),recieverData).then((response:any)=>{
          // console.log(response||'Success-Reciever')
        }).catch()
      })
    }
    })
    this.changeDetector.detectChanges()
  }
  createGroup(){
    this.switchReponse='1';
  }

}

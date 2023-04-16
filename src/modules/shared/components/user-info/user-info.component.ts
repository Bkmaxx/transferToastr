import { Component } from '@angular/core';
import { FirebaseService } from 'src/services/shared/firebase.service';
import { HttpRequestsService } from 'src/services/shared/http-requests.service';
import{getStorage,ref, uploadBytesResumable} from'firebase/storage'
import {FormControl,FormGroup,Validators } from '@angular/forms';
import { urls } from 'src/commons/constants';
import { doc, setDoc } from 'firebase/firestore';
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent {
  file:any;
  userData:any={};
  userDataKey:any;
  urls=urls
  isAnonymous:boolean=localStorage.getItem('uid')?.startsWith('0x')?true:false;
  profileForm!:FormGroup ;
  dataBase: any;
  profilePic: any;
  profilePicUrl:any;
  imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']
  constructor(private firebase:FirebaseService,private httpRequests:HttpRequestsService){
    this.dataBase=firebase.getDb();
    httpRequests.getUser(this.isAnonymous).subscribe((response:any)=>{
      this.userDataKey=Object.keys(response)
      this.userData=Object.values(response)[0]
      this.setProfileForm()
      this.profileForm.disable()

    })


  }


  setProfileForm(){
    this.profileForm=new FormGroup({
      uid:new FormControl(this.userData.uid),
      id:new FormControl(this.userData.id),
      phone_number:new FormControl(this.userData.phone_number),
      name:new FormControl(this.userData?.name??'Anonymous',[Validators.required]),
      profile:new FormControl(this.userData.profile),
    })
  }
  getFile(fileinputEvent:any){
  this.profilePic=fileinputEvent.srcElement.files[0]
  this.profilePic = fileinputEvent?.srcElement?.files[0];
  this.profilePic.isImage = this.imageExtensions.includes(this.profilePic.type.split('/')[1].toLowerCase());
  if (this.profilePic.isImage) {
    const reader = new FileReader();
    reader.readAsDataURL(fileinputEvent?.srcElement?.files[0]);
    reader.onload = (_event) => {
      this.profilePicUrl = reader.result;
    }
  }
  else {
    this.profilePic = null;
    this.profilePicUrl = '';

  }

  this.updateProfilePic()
  }
  updateProfilePic(){
    const app=this.firebase.app()
    const storage=getStorage(app)
    const data=localStorage.getItem('uid')||'';
    const imageref=ref(storage,'/'+this.userData.uid||'')
    const metadata = {
      contentType: 'image/jpeg',
    };

    const uploadTask = uploadBytesResumable(imageref, this.profilePic, metadata);

    uploadTask.on('state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log('Upload is ' + progress + '% done');
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;
        case 'storage/canceled':
          // User canceled the upload
          break;

        // ...

        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
      }
    },
    () => {
      this.httpRequests.getDownloadLink(this.userData.uid).subscribe((response:any)=>{
        const downloadUrl=urls.storage+String(this.userData.uid).replace('+','%2B')+'?alt=media&token='+response?.downloadTokens;
        this.profileForm.value.profile=downloadUrl;
      })
    })
  }
  profileUpdates(){
    console.log('pushing updates')
    console.log('profile details',this.profileForm.value,this.userData)
    this.httpRequests.postUpdates(this.userDataKey,this.isAnonymous,this.profileForm.value).subscribe((response:any)=>{
      console.log(response)
      setDoc(doc(this.dataBase,'usersChatlists',localStorage.getItem('uid')??''),{userName:Array.from(this.profileForm.value?.name)})
    })
    this.profileForm.disable()
  }
  errorImageHandler(imageEvent:any) {
    imageEvent.target.src=urls.defaultProfile;
    }

}

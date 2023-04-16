import { Component, Input, OnChanges } from '@angular/core';
import { collection, deleteDoc, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { urls } from 'src/commons/constants';
import { FirebaseService } from 'src/services/shared/firebase.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { HttpRequestsService } from 'src/services/shared/http-requests.service';
import { ToastrService } from 'src/services/shared/toastr.service';

@Component({
  selector: 'app-chat-room-info',
  templateUrl: './chat-room-info.component.html',
  styleUrls: ['./chat-room-info.component.scss']
})
export class ChatRoomInfoComponent implements OnChanges{
  @Input() chatRoomInfo:any;
  @Input() chatId:any;
  dataBase: any;
  searchInputDebounce: any;
  searchResult: any;
  senderId: any;
  chatMembersIds: any = [];
  fetchedChatMembersIds:any=[];
  newChatMembersIds:any=[];
  removedMembersIds:any=[];
  url = urls;
  groupChatForm!: FormGroup;
  dataBaseReffrence: any;
  chatsReff: any;
  usersChatlistsReff: any;
  groupProfilePic: any;
  groupProfileLocalUrl: any;
  groupProfileStorageUrl: any;
  errorToggle= false;
  imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']
  imageErrorToggle= false;
  hasImage= false;
  uploadProgress=100;
  constructor(private toastr:ToastrService,private fireBaseService: FirebaseService, private httpRequests: HttpRequestsService) {
    this.senderId = localStorage.getItem('uid') ?? ''
    this.dataBase = fireBaseService.getDb();
    this.dataBaseReffrence = doc(this.dataBase, 'chats', this.senderId);
    this.groupChatForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      moto: new FormControl(),
    })
  }
  ngOnChanges(){
    if(this.chatRoomInfo){
    this.groupProfileLocalUrl=this.chatRoomInfo[2]?.profile;
    this.chatMembersIds=this.chatRoomInfo[0]?.members;
    this.fetchedChatMembersIds=this.chatRoomInfo[0]?.members;
    this.groupChatForm.patchValue(this.chatRoomInfo[1])
    this.chatsReff = doc(this.dataBase, "chats",this.chatId);
  }
  }

  searchUser(inputEvent: any) {
    console.log(inputEvent?.value);
    clearTimeout(this.searchInputDebounce)
    this.searchInputDebounce = setTimeout(() => {
      console.log('Searching ... ');
      this.searchQuery(Array.from(inputEvent.value))
    }, 1000)
  }
  searchQuery(searchArray: any) {
    console.log('response');
    if (searchArray.length > 0) {
      const search = query(collection(this.dataBase, 'usersChatlists'), where('userName', 'array-contains-any', searchArray));
      this.searchResult = []
      getDocs(search).then((response: any) => response.forEach((doc: any) => {
        if (doc?.id !== this.senderId && !(this.chatMembersIds.includes(doc?.id))) {
          this.searchResult.push({ id: doc?.id, name: String(doc.data()?.userName).replaceAll(',', '') });
        }
      }))
    }
    else {
      this.searchResult = null;
    }
  }

  addMember(id: any) {
    this.chatMembersIds.push(id)
  }
  removeMember(index: number) {
    this.chatMembersIds.splice(index, 1)
  }
  createGroup() {
    //Removed Members
    const removalList=this.fetchedChatMembersIds.filter((id:any)=>this.removedMembersIds===id);
    removalList.forEach((member:any)=>{
      const deleteDocRef=doc(this.dataBase, 'usersChatlists', member, 'chats',this.chatId);
      deleteDoc(deleteDocRef).then(()=>console.log('Member with id ',member,' has been removed !'))
    })
    //removal ends
      console.log('updating  Group');
      updateDoc(this.chatsReff,{info:[{members:this.chatMembersIds},this.groupChatForm.value,{profile:this.groupProfileLocalUrl}]}).then((response: any) => {
      console.log('Update Done !');
      const newMembers=this.chatMembersIds.filter((member:any)=>!(removalList.includes(member)));
      const groupData = this.groupChatForm.value;
      groupData.reciever = this.chatId;
      groupData.id = this.chatId;
      groupData.profile = this.groupProfileLocalUrl ?? '';
      newMembers.forEach((member: any) => {
        const reciever = collection(this.dataBase, 'usersChatlists', member, 'chats');
        setDoc(doc(reciever, this.chatId), groupData).then((response: any) => console.log(response || 'Member Updated Successfully ', member)).catch(() => console.log('Error'))
      })
    })
  }
  profilePicHandler(fileinputEvent: any) {
    this.groupProfilePic = fileinputEvent?.srcElement?.files[0];
    this.groupProfilePic.isImage = this.imageExtensions.includes(this.groupProfilePic.type.split('/')[1].toLowerCase());
    if (this.groupProfilePic.isImage) {
      const reader = new FileReader();
      reader.readAsDataURL(fileinputEvent?.srcElement?.files[0]);
      reader.onload = (_event) => {
        this.groupProfileLocalUrl = reader.result;
        this.hasImage = true;
      }
    }
    else {
      this.groupProfilePic = null;
      this.groupProfileLocalUrl = '';
      this.imageErrorToggler()
    }

  }

  uploadPicCreateGroup() {
      const imageId=this.chatId;
      const app = this.fireBaseService.app()
      const storage = getStorage(app)
      const imageref = ref(storage, '/' + imageId)
      const uploadTask = uploadBytesResumable(imageref, this.groupProfilePic);
      uploadTask.on('state_changed',
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          // console.log(error)
        }
        ,
        () => {
          this.httpRequests.getDownloadLink(imageId).subscribe((response: any) => {
            const downloadUrl = urls.storage + imageId + '?alt=media&token=' + response?.downloadTokens;
            this.groupProfilePic = null;
            this.groupProfileStorageUrl = downloadUrl;
            //Removed Members
            const removalList=this.fetchedChatMembersIds.filter((id:any)=>this.removedMembersIds===id);
            removalList.forEach((member:any)=>{
              const deleteDocRef=doc(this.dataBase, 'usersChatlists', member, 'chats',this.chatId);
              deleteDoc(deleteDocRef).then(()=>console.log('Member with id ',member,' has been removed !'))
            })
            //removal ends
              // console.log('updating  Group');
              updateDoc(this.chatsReff,{info:[{members:this.chatMembersIds},this.groupChatForm.value,{profile:this.groupProfileStorageUrl ?? ''}]}).then((response: any) => {
              // console.log('Update Done !');
                this.toastr.setToastMessage('Updated Successfully !')
              const newMembers=this.chatMembersIds.filter((member:any)=>!(removalList.includes(member)));
              const groupData = this.groupChatForm.value;
              groupData.reciever = this.chatId;
              groupData.id = this.chatId;
              groupData.profile = this.groupProfileStorageUrl ?? '';
              newMembers.forEach((member: any) => {
                const reciever = collection(this.dataBase, 'usersChatlists', member, 'chats');
                setDoc(doc(reciever, this.chatId), groupData).then((response: any) => {
                  // console.log(response || 'Member Updated Successfully ', member)
                }).catch(() => {
                  // console.log('Error')
                })
              })
            })
           })
        })

  }
  errorToggler() {
    this.errorToggle = true;
    setTimeout(() => { this.errorToggle = false }, 1300)
  }
  imageErrorToggler() {
    this.imageErrorToggle = true;
    setTimeout(() => { this.imageErrorToggle = false }, 1300)
  }
  imageAlternate(imageEvent: any) {
    imageEvent.target.src = urls.defaultProfile;
  }
}

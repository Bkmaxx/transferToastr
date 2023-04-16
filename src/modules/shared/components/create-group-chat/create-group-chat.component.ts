import { Component, Input } from '@angular/core';
import { addDoc, collection, doc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { urls } from 'src/commons/constants';
import { FirebaseService } from 'src/services/shared/firebase.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { HttpRequestsService } from 'src/services/shared/http-requests.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-group-chat',
  templateUrl: './create-group-chat.component.html',
  styleUrls: ['./create-group-chat.component.scss']
})
export class CreateGroupChatComponent {

  dataBase: any;
  searchInputDebounce: any;
  searchResult: any;
  senderId: any;
  chatMembersIds: any = [];
  chatMembers: any = [];
  url = urls;
  groupChatForm!: FormGroup;
  dataBaseReffrence: any;
  chatsReff: any;
  usersChatlistsReff: any;
  chatId: any;
  groupProfilePic: any;
  groupProfileLocalUrl: any;
  groupProfileStorageUrl: any;
  errorToggle= false;
  imageExtensions = ['jpg', 'jpeg', 'gif', 'png', 'webp']
  imageErrorToggle= false;
  hasImage= false;
  constructor(private router:Router,private fireBaseService: FirebaseService, private httpRequests: HttpRequestsService) {
    this.senderId = localStorage.getItem('uid') ?? ''
    this.dataBase = fireBaseService.getDb();
    this.dataBaseReffrence = doc(this.dataBase, 'chats', this.senderId);
    this.chatsReff = collection(this.dataBase, "chats");
    this.groupChatForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      moto: new FormControl(),
    })
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

  addMember(id: any, name: any) {
    this.chatMembers.push({ id: id, name: name })
    this.chatMembersIds.push(id)
  }
  removeMember(index: number) {
    this.chatMembers.splice(index, 1)
    this.chatMembersIds.splice(index, 1)
  }
  createGroup() {
    this.chatMembersIds.push(this.senderId)

    // console.log('creating new Group');
    addDoc(this.chatsReff, { info:[{members:this.chatMembersIds},this.groupChatForm.value,{profile:this.groupProfileStorageUrl ?? ''}],messages: [] }).then((response: any) => {
      console.log(response?.id);
      this.chatId = response.id
      const groupData = this.groupChatForm.value;
      groupData.reciever = this.chatId;
      groupData.id = this.chatId;
      groupData.profile = this.groupProfileStorageUrl ?? '';
      const chatMembersIds=this.chatMembersIds
      chatMembersIds.forEach((member: any,index:number,array:any) => {
        const reciever = collection(this.dataBase, 'usersChatlists', member, 'chats');
        setDoc(doc(reciever, this.chatId), groupData).then((response: any) => {
          // console.log(response || 'Member Added Successfully ', member)
          if(index===array.length-1)
          {
            setTimeout(()=>this.resetData())
          }
        }).catch(() => console.log('Error'))

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
    this.chatMembersIds.push(this.senderId)
    console.log('creating new Group with profile pic');
    addDoc(this.chatsReff,{ info:[{members:this.chatMembersIds},this.groupChatForm.value,{profile:''}],messages: [] }).then((response: any) => {
      console.log(response?.id);
      this.chatId = response.id
      const imageId = response.id;
      const app = this.fireBaseService.app()
      const storage = getStorage(app)
      const imageref = ref(storage, '/' + imageId)
      const uploadTask = uploadBytesResumable(imageref, this.groupProfilePic);
      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.log(error)
        }
        ,
        () => {
          this.httpRequests.getDownloadLink(imageId).subscribe((response: any) => {
            const downloadUrl = urls.storage + imageId + '?alt=media&token=' + response?.downloadTokens;
            this.groupProfilePic = null;
            this.groupProfileStorageUrl = downloadUrl;
            const groupData = this.groupChatForm.value;
            groupData.reciever = this.chatId;
            groupData.id = this.chatId;
            groupData.profile = this.groupProfileStorageUrl ?? '';
            this.chatMembersIds.forEach((member: any,index:number,array:any) => {
              const reciever = collection(this.dataBase, 'usersChatlists', member, 'chats');
              setDoc(doc(reciever, this.chatId), groupData).then((response: any) => console.log(response || 'Member Added Successfully ', member)).catch(() => console.log('Error'))
              if(index===array.length-1)
              {
                setTimeout(()=>this.resetData())
              }
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
  resetData(){
    this.chatMembers=[];
    this.groupChatForm.reset();
    this.chatMembersIds=[];
    this.groupProfilePic='';
    this.groupProfileLocalUrl='';
  }
}

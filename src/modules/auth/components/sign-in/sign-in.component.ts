import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { getAuth, RecaptchaVerifier,signInWithPhoneNumber} from "firebase/auth";
import { LoadBundleTask, doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseService } from 'src/services/shared/firebase.service';
import { HttpRequestsService } from 'src/services/shared/http-requests.service';
import { WindowService } from 'src/services/shared/window.service';
import { Router } from '@angular/router';
import { ToastrService } from 'src/services/shared/toastr.service';
import { LoaderService } from 'src/services/shared/loader.service';
@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit{
  isHuman=false;
  otpInputToggle=false;
  windowRef:any;
  App:any;
  loginForm:FormGroup;
  errorToggle=false;
  otp='';
  otpInputConfig={
    length:6,
    inputStyles: {
    width: "30px",
    height: "30px",
  },
  allowNumbersOnly:true,
}

//metamask
isMetaMaskPresent=false;
etherium:any;
dataBase: any;
//metamask

  constructor(
    private loader:LoaderService,
    private toastr:ToastrService,
    private router:Router,
    private requests:HttpRequestsService,
    private window:WindowService,
    private firbaseService:FirebaseService){
    if(localStorage.getItem('uid')){
      router.navigate(['dashboard'])
    }
    this.windowRef=window.windowRef;
    this.etherium=this.windowRef.ethereum
    this.isMetaMaskPresent=this.etherium?this.etherium.isMetaMask:false;
    this.dataBase=firbaseService.getDb();
    this.loginForm=new FormGroup({
      phone:new FormControl('',[Validators.required,Validators.minLength(10),Validators.maxLength(10),Validators.pattern('[0-9]{10}')]),
    })
  }
  auth = getAuth(this.firbaseService.app()||undefined);
  ngOnInit(){
    try{
    this.windowRef.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size':'normal',
      'callback': (response:any) => {
       this.isHuman=true;
      //  console.log(response)
      },
      'expired-callback': () => {
    //  console.log('Error !')
     this.isHuman=false
      }
    }, this.auth);

    this.windowRef.recaptchaVerifier.render()
  }
  catch(someError:any){
    // console.log('Some Error Encountered !');

  }
  }

   logIn(){
  //  console.log('Verifying !!')
   this.otpInputToggle=false;
   console.log(this.loginForm.value.otp)
    if(this.otp?.length===6){
      this.verifyOtp(this.otp)
    }
    else{
      // console.log('Error!')
    }
   }
    get _loginControls(){
     return this.loginForm.controls
   }
   errorToggler(){
     this.errorToggle=true;
     setTimeout(()=>this.errorToggle=false,2000)
   }
   numberCheck(value:any){
     value.value=value.value.match('[0-9]+')
   }
   sendOtp(){
      const appVerifier = this.windowRef.recaptchaVerifier;
      if(this.isHuman){
      signInWithPhoneNumber(this.auth,'+91'+this.loginForm.value?.phone, appVerifier).then((result:any) => {
        this.otpInputToggle=true;
        // console.log(result)
        this.toastr.setToastMessage('OTP Sent Successfully !')
        this.windowRef.confirmationResult = result;
        this.windowRef.recaptchaVerifier.clear()
        this.loginForm.get('phone')?.disable()
    })
    .catch( (error:any) => {
      // console.log(error)
      this.loginForm.get('phone')?.enable()
    });

  }
  else{
    // console.log(this.errorToggler())
  }
   }

 verifyOtp(code:string)
      { code=this.otp
        this.windowRef.confirmationResult.confirm(code).then((result:any) => {
        const user = result.user;
        // console.log(result);
        this.loader.setLoadingStatus(true)
        localStorage.setItem('uid',result?.user?.uid)
        localStorage.setItem('idToken',result?._tokenResponse?.idToken);
        
        this.createUidDoc(result?.user?.uid)
        // console.log(result)
      }).catch((error:any) => {
        // console.log(error)
        this.loginForm.get('phone')?.enable()
      });
  }
  onOtpInput(event:any){
    this.otp=event
  }

  // MetaMask code Begins

  loginMetamask(){
    if (this.etherium) {
      this.toastr.setToastMessage('Ethereum successfully detected!')
      if(this.etherium.isConnected()){
          this.etherium.request({method:'eth_accounts'})
          .then((accounts:any)=>{
            if(accounts.length==0){
              // console.log('Please Connect to Metamask !');
              // console.log('Connecting to Metamask !')
              this.etherium.request({method:'eth_requestAccounts'})
              .then((accounts:any)=>{
               // console.log(accounts)
                localStorage.setItem('uid',accounts[0])
                this.createUidDoc(accounts[0])
                this.requests.getUser(true).subscribe(
                  (response:any)=>console.log('redirect',response),
                  ()=>{this.requests.registerUser(true).subscribe((response:any)=>{
                    // this.toastr.setToastMessage('mask'+response)
                  })})
              })
              .catch((error:any)=>{
                if(error.code===4001){
                  this.toastr.setToastMessage('Please Connect to Metamask !');
                }
                else{
                  this.toastr.setToastMessage('Some Error Encountered');
                }

              })
            }
            else{
              localStorage.setItem('uid',accounts[0])
              this.createUidDoc(accounts[0])
              console.log('success');
            }
          })
          .catch((error:any)=>console.log(error))
      }
      else{

        //sweet Alert Here
        console.log('Try Reloading Your Window !');

      }
    }
    else {
    console.error('Please install MetaMask!')
    window.open('https://metamask.io/download/')
  }
  }
  createMetamask() {

    console.log('Create Meta Mask Account')
    window.open('https://metamask.io/download/')
    }

  createUidDoc(uid:any){
    const isAnonymous=uid?.startsWith('0x')?true:false;
    const getDocReff=doc(this.dataBase,'usersChatlists',uid)
    getDoc(getDocReff).then((data:any)=>{
      if(!data.exists()){
        // console.log('creating New');
        this.requests.registerUser(isAnonymous).subscribe()
        setDoc(doc(this.dataBase,'usersChatlists',uid),{userName:[]});
        this.loader.setLoadingStatus(false)
        this.toastr.setToastMessage('Sign In Success')
        this.router.navigate(['dashboard'])

      }
      else{
        // console.log('Account Allready exsists !');
        this.loader.setLoadingStatus(false)
        this.router.navigate(['dashboard'])
        
        this.toastr.setToastMessage('Sign In Success')
      }

    })
  }
}


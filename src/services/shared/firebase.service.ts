import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import{getFirestore} from 'firebase/firestore';
@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  firebaseConfig={
    apiKey: "AIzaSyD9Du2K1GUtGhD-MnODhxNxiDgZVP_OxjI",
    authDomain: "chitchatv2-f816e.firebaseapp.com",
    databaseURL: "https://chitchatv2-f816e-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chitchatv2-f816e",
    storageBucket: "chitchatv2-f816e.appspot.com",
    messagingSenderId: "1093034790456",
    appId: "1:1093034790456:web:331d0a3060bc9bfef320cd",
    measurementId: "G-FTQV32SJFD"
  };
  constructor() {

   }
   app=()=>initializeApp(this.firebaseConfig);

   getDb(){
    return getFirestore(initializeApp(this.firebaseConfig))
   }
}

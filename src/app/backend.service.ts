import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  firebaseApp: FirebaseApp;
  constructor() {
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }


  login(email: string, password: string) : Promise<UserCredential>{
    const auth = getAuth(this.firebaseApp);
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout(){
    const auth = getAuth(this.firebaseApp);
    return signOut(auth);
  }

  getCurrentUser(){
    const auth = getAuth(this.firebaseApp);
    return auth.currentUser;
  }

}

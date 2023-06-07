import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { FirebaseApp, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut, User, UserCredential } from "firebase/auth";


@Injectable({
  providedIn: 'root'
})
export class BackendService {
  firebaseApp: FirebaseApp;
  constructor() {
    this.firebaseApp = initializeApp(environment.firebaseConfig);
    const auth = getAuth(this.firebaseApp)
    setPersistence(auth, browserSessionPersistence );
  }


  login(email: string, password: string) : Promise<UserCredential>{
    const auth = getAuth(this.firebaseApp);
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout() : Promise<void>{
    const auth = getAuth(this.firebaseApp);
    return signOut(auth);
  }

  getAuth(){
    return getAuth(this.firebaseApp);
  }

}

import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { FirebaseApp, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, DocumentSnapshot, DocumentData, setDoc } from "firebase/firestore"; 
import { Cocktail, Party, UserAccount } from './app.core';

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

  // Firebase Auth
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

  // Firestore
  getAccount(uid: string) : Promise<UserAccount>{
    return new Promise( (resolve, reject) => {
      this.getData("users", uid).then(
        data => {
          if (data.exists()){
            resolve(data.data() as UserAccount);
          } else {
            reject();
          }
        }
      ).catch(err => { throw err; reject(); })
    });
  }

  private getData(collection: string, id: string) : Promise<DocumentSnapshot<DocumentData>>{
    const db = getFirestore(this.firebaseApp);
    const docRef = doc(db, collection, id);
    return getDoc(docRef);
  }

  createAccount(uid: string, name: string){
    const db = getFirestore(this.firebaseApp);
    const accountRef = doc(db, "users", uid);
    return setDoc(accountRef, { name: name }, { merge: true });
  }

  getParty(id: string) : Promise<Party>{
    return new Promise( (resolve, reject) => {
      this.getData("parties", id).then(
        data => {
          if (data.exists()){
            resolve(data.data() as Party);
          } else {
            reject();
          }
        }
      ).catch(err => {reject(); throw err;})
    });
  }

  getCocktail(id: string) : Promise<Cocktail>{
    return new Promise( (resolve, reject) => {
      this.getData("cocktails", id).then(
        data => {
          if (data.exists()){
            resolve(data.data() as Cocktail);
          } else {
            reject();
          }
        }
      ).catch(err => {throw err; reject(); })
    });
  }

}

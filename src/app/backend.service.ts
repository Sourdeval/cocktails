import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { FirebaseApp, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, DocumentSnapshot, DocumentData, setDoc, deleteDoc } from "firebase/firestore"; 
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

  private readonly COL_PARTY = 'parties';
  private readonly COL_USER = 'users';
  private readonly COL_COCKTAIL = 'cocktails';

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
      this.getData(this.COL_USER, uid).then(
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

  private deleteData(collection: string, id: string) : Promise<void>{
    const db = getFirestore(this.firebaseApp);
    const docRef = doc(db, collection, id);
    return deleteDoc(docRef);
  }

  private updateData(collection: string, id: string, data: any) : Promise<void>{
    const db = getFirestore(this.firebaseApp);
    const docRef = doc(db, collection, id);
    return setDoc(docRef, data);
  }

  createAccount(uid: string, name: string){
    const db = getFirestore(this.firebaseApp);
    const accountRef = doc(db, this.COL_USER, uid);
    return setDoc(accountRef, { name: name }, { merge: true });
  }

  getParty(id: string) : Promise<Party>{
    return new Promise( (resolve, reject) => {
      this.getData(this.COL_PARTY, id).then(
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

  deleteParty(id: string, uid: string): Promise<void[]>{
    return Promise.all([
      this.deleteData(this.COL_PARTY, id),
      new Promise<void>( (resolve, reject) => {
        this.getAccount(uid).then(data => {
          data.partiesId = data.partiesId.filter(partyId => {
            return partyId !== id;
          })
          return this.updateData(this.COL_USER, uid, data);
        });
      })
    ]);
  }

  getCocktail(id: string) : Promise<Cocktail>{
    return new Promise( (resolve, reject) => {
      this.getData(this.COL_COCKTAIL, id).then(
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

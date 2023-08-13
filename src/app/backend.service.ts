import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';

import { FirebaseApp, initializeApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { getFirestore, doc, getDoc, DocumentSnapshot, DocumentData, setDoc, deleteDoc, addDoc, collection, DocumentReference } from "firebase/firestore"; 
import { Cocktail, ConfigCocktail, Party, UserAccount } from './app.core';

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
  private readonly COL_CONFIG = 'config';
  private readonly DOC_CONFIG = 'config';

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
            reject("Account with id '"+uid+"' doesn't exist.");
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

  private createData(collectionString: string, data: any): Promise<DocumentReference<any>>{
    const db = getFirestore(this.firebaseApp);
    const collec = collection(db, collectionString);
    return addDoc(collec, data);
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
            reject("Party with id '"+id+"' doesn't exist.");
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
          this.updateData(this.COL_USER, uid, data).then(() => resolve())
        });
      }),
      new Promise<void>( (resolve, reject) => {
        this.getData(this.COL_CONFIG, this.DOC_CONFIG).then(config => {
          if (config.exists()){
            let configCocktail = config.data() as ConfigCocktail;
            configCocktail.partyIds = configCocktail.partyIds.filter(partyId => {
              return partyId !== id;
            })
            this.updateData(this.COL_CONFIG, this.DOC_CONFIG, configCocktail).then(() => resolve());
          }
        })
      })
    ]);
  }

  setParty(id: string, party: Party) : Promise<void>{
    return this.updateData(this.COL_PARTY, id, party);
  }

  createParty(id: string, uid: string, party: Party) : Promise<void[]>{
    return Promise.all([
      this.updateData(this.COL_PARTY, id, party),
      new Promise<void>( (resolve, reject) => {
        this.getAccount(uid).then(data => {
          data.partiesId.push(id);
          this.updateData(this.COL_USER, uid, data).then(() => resolve());
        });
      }),
      new Promise<void>( (resolve, reject) => {
        this.getData(this.COL_CONFIG, this.DOC_CONFIG).then(config => {
          if (config.exists()){
            let configCocktail = config.data() as ConfigCocktail;
            configCocktail.partyIds.push(id);
            this.updateData(this.COL_CONFIG, this.DOC_CONFIG, configCocktail).then(() => resolve());
          }
        })
      })
    ]);
  }

  getNewPartyId(): Promise<string>{
    return new Promise( (resolve, reject) => {
      this.getData(this.COL_CONFIG, this.DOC_CONFIG).then(config => {
        if (config.exists()){
          let configCocktail = config.data() as ConfigCocktail;
          for(let i=0; i<999; i++){
            let newId = (Math.floor(Math.random()*899+100)).toString();
            if (configCocktail.partyIds.indexOf(newId) < 0){
              resolve(newId);
              return;
            }
          }
          for(let i=0; i<999; i++){
            let newId = (Math.random()*8999+1000).toString();
            if (configCocktail.partyIds.indexOf(newId) < 0){
              resolve(newId);
              return;
            }
          }
        }
        reject();
    })
    
    });
  }

  getCocktail(id: string) : Promise<Cocktail>{
    return new Promise( (resolve, reject) => {
      this.getData(this.COL_COCKTAIL, id).then(
        data => {
          if (data.exists()){
            resolve(data.data() as Cocktail);
          } else {
            reject("Cocktail with id '"+id+"' doesn't exist." );
          }
        }
      ).catch(err => {throw err; reject(); })
    });
  }

  deleteCocktail(id: string, uid: string): Promise<void[]>{
    return Promise.all([
      this.deleteData(this.COL_COCKTAIL, id),
      new Promise<void>( (resolve, reject) => {
        this.getAccount(uid).then(data => {
          data.cocktailsId = data.cocktailsId.filter(cocktailId => {
            return cocktailId !== id;
          })
          this.updateData(this.COL_USER, uid, data).then(() => resolve())
        });
      })
    ]);
  }

  createCocktail(uid: string, cocktail: Cocktail): Promise<string>{
    return new Promise<string>( (resolve, reject) =>
      this.createData(this.COL_COCKTAIL, cocktail).then(docRef => {
        if (!docRef.id) { reject(); return; }
        this.getAccount(uid).then(data => {
          data.cocktailsId.push(docRef.id);
          this.updateData(this.COL_USER, uid, data).then(() => resolve(docRef.id));
        });
      })
    );
  }

}

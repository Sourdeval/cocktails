import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { getDownloadURL, getStorage, ref } from "firebase/storage";


@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private firebaseApp: FirebaseApp;
  constructor() {
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }

  getCocktailImage(img: string) : Promise<string>{
    const storage = getStorage(this.firebaseApp);
    const storageRef = ref(storage, 'cocktailImages/'+img);
    return getDownloadURL(storageRef);
  }
}

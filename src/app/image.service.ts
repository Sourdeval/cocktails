import { Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { environment } from 'src/environments/environment';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

// --- MAX_SIZE ---
// 3000 lectures pour une soirée
// Environ 10 cocktails par soirée
// Donc 10 images
// Soit 30 000 téléchargement d'image pour une soirée
// La limite étant de 1Go soit 1024Mo soit 1048576Ko
// 1 048 576/30 000 = 35Ko
// Par sécurité, on va donc fixer le maximum à 30Ko

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private firebaseApp: FirebaseApp;
  MAX_SIZE = 30 * 1024; //30Ko
  constructor() {
    this.firebaseApp = initializeApp(environment.firebaseConfig);
  }

  getCocktailImage(img: string) : Promise<string>{
    const storage = getStorage(this.firebaseApp);
    const storageRef = ref(storage, 'cocktailImages/'+img);
    return getDownloadURL(storageRef);
  }

  deleteImageCocktail(img: string){
    const storage = getStorage(this.firebaseApp);
    const storageRef = ref(storage, 'cocktailImages/'+img);
    return deleteObject(storageRef);
  }

  uploadImageCocktail(file: File, id: string){
    const storage = getStorage(this.firebaseApp);
    const storageRef = ref(storage, 'cocktailImages/'+id);
    return uploadBytes(storageRef, file);
  }
}

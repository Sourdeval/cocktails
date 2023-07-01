//Source : https://stackoverflow.com/questions/69270802/uncaught-in-promise-firebaseerror

import { ErrorHandler, Injectable } from "@angular/core";
import { FirebaseError } from "firebase/app";
import { environment } from "src/environments/environment";

interface AngularFireError extends Error {
    rejection: FirebaseError;
}

function errorIsAngularFireError(err: any): err is AngularFireError {
    return err.rejection && err.rejection.name === 'FirebaseError';
}

// Not providedIn 'root': needs special handling in app.module to override default error handler.
@Injectable()
export class CustomErrorHandler implements ErrorHandler {
    handleError(error: any) {
        if (!environment.production){
            throw error;
        }
        // AngularFire errors should be catchable and handled in components; no need to further process them.
        if (!errorIsAngularFireError(error)) {
            console.error(error);
        }
    }
}

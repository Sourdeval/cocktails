import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  user: any;
  constructor(private readonly back: BackendService){
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  login(){
    console.log(this.loginForm.controls['email'].value)
    console.log(this.loginForm.controls['password'].value)
    this.back.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value)
      .then((userCredential) => {
        console.log(userCredential.user)
        this.user = userCredential.user;
      })
      .catch((error) => {
        console.log('MYERROR: '+error.code+' - '+error.message);
      })
  }

  logout(){
    this.user=undefined;
    this.back.logout().then(
      () => this.user = undefined
    )
    .catch((error) => {
      console.log('MYERROR: '+error.code+' - '+error.message);
    })
  }

}

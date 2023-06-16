import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  user: User | null = null;
  constructor(private readonly back: BackendService,
    private readonly zone : NgZone,
    private readonly router : Router,
    private errorBar : MatSnackBar){ 
    this.back.getAuth().onAuthStateChanged(user => {
      if (user != null) { zone.run(() => this.router.navigate(['/master'])) }
      this.user = user;
    })
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  login(){
    this.back.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value)
      .then((userCredential) => {
        this.zone.run(() => this.router.navigate(['/master']));
      })
      .catch((error) => {
        this.errorBar.open('Connexion impossible', undefined, {
          duration: 3000,
          panelClass: ['error-snackbar']
        })
      })
  }
}

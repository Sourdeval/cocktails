import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  numberForm: FormGroup;
  constructor(
    private readonly errorBar : MatSnackBar,
    private readonly router : Router
  ){
    this.numberForm = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$')])
    });
  }

  submitCode(){
    if (this.numberForm.controls['code'].value == '508'){
      this.router.navigate(['/508']);
    }
    else {
      this.errorBar.open('Code soirée inconnu', undefined, {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.numberForm.controls['code'].setValue('');
    }
  }
  
}

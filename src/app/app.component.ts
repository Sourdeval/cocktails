import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  numberForm: FormGroup;
  constructor(){
    this.numberForm = new FormGroup({
      code: new FormControl('', [Validators.required, Validators.maxLength(3), Validators.minLength(3), Validators.pattern('^[0-9]+$')])
    });
  }

  submitCode(){
    console.log(this.numberForm.controls['code'].value)
  }
}

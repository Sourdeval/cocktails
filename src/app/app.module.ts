import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { MasterComponent } from './master/master.component';
import { BigTitleComponent } from './titles/big-title.component';
import { LitTitleComponent } from './titles/lit-title.component';
import { CustomErrorHandler } from './app.errorhandler';
import { DrinkerComponent } from './drinker/drinker.component';
import { FieldsDialog } from './dialogs/fields.dialog';
import { ConfirmDialog } from './dialogs/confirm.dialog';
import { PartyComponent } from './master/party.component';
import { CocktailComponent } from './master/cocktail.component';

const ROUTES: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'master', component: MasterComponent },
  { path: 'master/party/:id', component: PartyComponent },
  { path: 'master/cocktail/:id', component: CocktailComponent },
  { path: ':id', component: DrinkerComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    MasterComponent,
    BigTitleComponent,
    LitTitleComponent,
    FieldsDialog,
    ConfirmDialog,
    DrinkerComponent,
    PartyComponent,
    CocktailComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    RouterModule.forRoot(ROUTES),
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSelectModule
  ],
  providers: [
    {provide: ErrorHandler, useClass: CustomErrorHandler}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

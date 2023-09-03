import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { User } from 'firebase/auth';
import { CocktailWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { FieldsDialog } from '../dialogs/fields.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialog } from '../dialogs/confirm.dialog';
import { ImageService } from '../image.service';

@Component({
  selector: 'app-cocktail',
  templateUrl: './cocktail.component.html',
  styleUrls: ['./cocktail.component.css']
})
export class CocktailComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;
  cocktail: CocktailWithId | null = null;
  descriptionForm: FormGroup;
  imageURL: string = '';
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router : Router,
    private readonly back : BackendService,
    private readonly zone : NgZone,
    public dialog: MatDialog,
    private readonly errorBar : MatSnackBar,
    private readonly imageBack: ImageService
  ) {
    this.descriptionForm = new FormGroup({
      desc: new FormControl('', [Validators.maxLength(1000)])
    });
  }

  ngOnInit(): void {
    var id: string | null = null;
    this.route.paramMap.subscribe((params: ParamMap) => {
      id = params.get('id');
      if (!id) { this.zone.run(() => this.router.navigate(['/master'])); }
      this.back.getAuth().onAuthStateChanged(user => {
        if(user == null) { this.zone.run(() => this.router.navigate(['/login'])); return; }
        this.user = user;
        this.back.getAccount(this.user?.uid ?? '').then(account => {
          this.account = account;
          if (!id || this.account.cocktailsId.indexOf(id) < 0){
            this.zone.run(() => this.router.navigate(['/master']));
          }
          this.loadCocktail(id ?? '');
        }).catch(() => {
          this.zone.run(() => this.router.navigate(['/login']));
        });
      });
    });
  }

  loadCocktail(id: string){
    if (!id || id == '') { return; }
    this.back.getCocktail(id).then(data => {
      this.cocktail = {
        id: id,
        cock: data,
        new: false
      }
      this.descriptionForm.controls['desc'].setValue(data.desc);
      if (data.image){
        this.imageBack.getCocktailImage(this.cocktail.cock.image).then(url => {
          this.imageURL = url;
        }).catch(() => {
          this.errorBar.open("Impossible de récupérer l'image", undefined, {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        })
      }
    });
  }

  changeName(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nouveau nom'] = this.cocktail?.cock.name ?? '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Renommer le cocktail",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nouveau nom']){
        return;
      }
      if (this.cocktail){
        let temp = this.cocktail.cock.name;
        this.cocktail.cock.name = result['Nouveau nom'];
        this.back.setCocktail(this.cocktail?.id ?? '', this.cocktail.cock).catch(() => {
          if (this.cocktail){
            this.cocktail.cock.name = temp;
          }
          this.errorBar.open('Impossible de renommer', undefined, {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        })
      }
    });
  }

  changeDescription(){
    if (!this.cocktail){
      return;
    }
    let temp = this.cocktail.cock.desc;
    if (this.descriptionForm.value['desc'] === temp) { return; }
    this.cocktail.cock.desc = this.descriptionForm.value['desc'];
    this.back.setCocktail(this.cocktail.id, this.cocktail.cock).catch(() => {
      if (this.cocktail){
        this.cocktail.cock.desc = temp;
      }
      this.errorBar.open('Impossible de changer la description actuellement.', undefined, {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.descriptionForm.controls['desc'].setValue(temp);
    })
  }

  deleteIngredient(ing: string){
    if (!this.cocktail){
      return;
    }
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        message: 'Voulez-vous supprimer "' + ing + '" des ingrédients ?',
        ok: "Supprimer"
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result){
        return;
      }
      if (this.cocktail){
        let temp = this.cocktail.cock.ingredients;
        console.log()
        this.cocktail.cock.ingredients = this.cocktail.cock.ingredients.filter( i => {
          return i !== ing;
        });
        this.back.setCocktail(this.cocktail?.id ?? '', this.cocktail.cock).catch(() => {
          if (this.cocktail){
            this.cocktail.cock.ingredients = temp;
          }
          this.errorBar.open('Impossible de supprimer "'+ing+'"', undefined, {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        })
      }
    });
  }

  addIngredient(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nouvel ingrédient'] = '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Ajouter un ingrédient",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nouvel ingrédient']){
        return;
      }
      if (this.cocktail){
        let temp = this.cocktail.cock.ingredients;
        this.cocktail.cock.ingredients.push(result['Nouvel ingrédient']);
        this.back.setCocktail(this.cocktail?.id ?? '', this.cocktail.cock).catch(() => {
          if (this.cocktail){
            this.cocktail.cock.ingredients = temp;
          }
          this.errorBar.open("Impossible d'ajouter un ingrédient", undefined, {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        })
      }
    });
  }
}

import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { User } from 'firebase/auth';
import { CocktailWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { FieldsDialog } from '../dialogs/fields.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cocktail',
  templateUrl: './cocktail.component.html',
  styleUrls: ['./cocktail.component.css']
})
export class CocktailComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;
  cocktail: CocktailWithId | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router : Router,
    private readonly back : BackendService,
    private readonly zone : NgZone,
    public dialog: MatDialog,
    private readonly errorBar : MatSnackBar,
  ) { }

  ngOnInit(): void {
    var id: string | null = null;
    this.route.paramMap.subscribe((params: ParamMap) => {
      id = params.get('id');
      if (!id) { this.zone.run(() => this.router.navigate(['/master'])); }
      this.back.getAuth().onAuthStateChanged(user => {
        if(user == null) { this.zone.run(() => this.router.navigate(['/login'])); return; }
        this.user = user;
        console.log('AZEAH')
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
}

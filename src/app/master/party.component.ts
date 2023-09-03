import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { User } from 'firebase/auth';
import { CocktailOfParty, CocktailWithId, PartyWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { FieldsDialog } from '../dialogs/fields.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;
  party: PartyWithId | null = null;
  partyCocktails: CocktailOfParty[] = [];
  allCocktailList: CocktailWithId[] = [];
  @ViewChild('selectNewCocktail') selectNewCocktail : MatSelect | undefined;

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
        this.back.getAccount(this.user?.uid ?? '').then(account => {
          this.account = account;
          if (!id || this.account.partiesId.indexOf(id) < 0){
            this.zone.run(() => this.router.navigate(['/master']));
          }
          this.loadParty(id ?? '');
        }).catch(() => {
          this.zone.run(() => this.router.navigate(['/login']));
        });
      });
    });
  }

  loadParty(id: string){
    this.partyCocktails = [];
    if (id == '') { return; }
    this.back.getParty(id).then(data => {
      this.party = {
        id: id,
        party: data
      };
      this.party.party.cocktails.forEach(link => {
        this.back.getCocktail(link.id).then(data => {
          this.partyCocktails.push({
            link: link,
            cock: data,
            imageUrl: ''
          })
        })
      });
    })
  }

  changeName(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nouveau nom'] = this.party?.party.name ?? '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Changer le nom de la soirée",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nouveau nom']){
        return;
      }
      if (this.party){
        let temp = this.party.party.name;
        this.party.party.name = result['Nouveau nom'];
        this.back.setParty(this.party?.id ?? '', this.party.party).catch(() => {
          if (this.party){
            this.party.party.name = temp;
          }
          this.errorBar.open('Impossible de renommer', undefined, {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        })
      }
    });
  }

  removeCocktail(id: string){
    if (this.party){
      let temp = this.party?.party.cocktails;
      this.party.party.cocktails = this.party.party.cocktails.filter(link => {
        return link.id !== id;
      })
      this.back.setParty(this.party.id, this.party.party).then(() => {
        this.partyCocktails = this.partyCocktails.filter(cock => {
          return cock.link.id !== id;
        })
        if (this.allCocktailList.length !== 0){
          this.back.getCocktail(id).then(data => {
            this.allCocktailList.push({cock: data, id:id, new: false});
          })
        }
      }).catch(() => {
        if (this.party){
          this.party.party.cocktails = temp;
        }
      })
    }
  }

  outOfStockIng(ing: string){

  }

  setOutOfStock(id: string){
    if (this.party){
      let i = this.party.party.cocktails.findIndex(link => link.id === id);
      if (i > -1){
        this.party.party.cocktails[i].outOfStock = true;
        this.back.setParty(this.party.id, this.party.party).catch(() => {
          if (this.party){
            this.party.party.cocktails[i].outOfStock = false;
          }
        })
      }
    }
  }

  setNotOutOfStock(id: string){
    if (this.party){
      let i = this.party.party.cocktails.findIndex(link => link.id === id);
      if (i > -1){
        this.party.party.cocktails[i].outOfStock = false;
        this.back.setParty(this.party.id, this.party.party).catch(() => {
          if (this.party){
            this.party.party.cocktails[i].outOfStock = true;
          }
        })
      }
    }
  }

  getAllCocktails(){
    if (this.allCocktailList.length === 0){
      let allPromises: Promise<void>[] = [];
      this.account?.cocktailsId.forEach(id => {
        if (this.party){
          if (this.party?.party.cocktails.findIndex(link => link.id === id) < 0){
            allPromises.push(new Promise<void>( (resolve, reject) => {
              this.back.getCocktail(id).then(data => {
                this.allCocktailList.push({cock: data, id: id, new: false})
                resolve();
              })
            }));
          }
        }
        else {
          allPromises.push(new Promise<void>( (resolve, reject) => {
            this.back.getCocktail(id).then(data => {
              this.allCocktailList.push({cock: data, id: id, new: false})
              resolve();
            })
          }));
        }
      })
      Promise.all(allPromises).then(() => {
        this.selectNewCocktail?.open();
      })
    }
  }

  addCocktailToParty(){
    if (this.party && this.selectNewCocktail?.value){
      let id = this.selectNewCocktail.value;
      let temp = this.party.party.cocktails;
      this.party.party.cocktails.push({ id:id, outOfStock: false })
      this.back.setParty(this.party.id, this.party.party).then(() => {
        if (this.party && this.selectNewCocktail){
          this.loadParty(this.party.id);
          this.selectNewCocktail.value = undefined;
          this.allCocktailList = this.allCocktailList.filter(cock => cock.id !== id);
        }
      }).catch(() => {
        if (this.party){
          this.party.party.cocktails = temp;
        }
      })
    }
  }

}

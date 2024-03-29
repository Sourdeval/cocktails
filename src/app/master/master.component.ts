import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';
import { Cocktail, CocktailWithId, Party, PartyWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { FieldsDialog } from '../dialogs/fields.dialog';
import { CONFIRMED, ConfirmDialog } from '../dialogs/confirm.dialog';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;
  parties: PartyWithId[] = [];
  cocktails: CocktailWithId[] = [];

  constructor(private readonly back : BackendService,
    private readonly zone : NgZone,
    private readonly router : Router,
    public dialog: MatDialog) {
    back.getAuth().onAuthStateChanged(user => {
      if(user == null) { zone.run(() => this.router.navigate(['/login'])); return; }
      this.user = user;
      back.getAccount(this.user?.uid ?? '').then(account => {
        this.account = account;
        this.loadParties();
        this.loadCocktails();
      }).catch(error => {
        //Register
        
        let neededFields: { [id: string] : string; } = {};
        neededFields['Nouveau nom'] = "";
        const dialogRef = this.dialog.open(FieldsDialog, {
          data: {
            title: "Création du compte",
            canExit: false,
            fields: neededFields,
          }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          this.back.createAccount(this.user?.uid ?? '', result).then(() => {
            this.back.getAccount(this.user?.uid ?? '').then(account => {
              this.account = account;
              this.loadParties();
              this.loadCocktails();
            })
          }).catch(error => {
            zone.run(() => this.router.navigate(['/login'])); return;
          })
        })
      })
    })
  }

  ngOnInit(): void {
  }

  editAccount() {
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nouveau nom'] = this.account?.name ?? '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Modifier le compte",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nouveau nom']){
        return;
      }
      this.back.createAccount(this.user?.uid ?? '', result['Nouveau nom']).then(() => {
        this.back.getAccount(this.user?.uid ?? '').then(account => {
          this.account = account;
        })
      })
    });
  }

  loadParties(){
    this.parties = [];
    if (this.account){
      this.account.partiesId.forEach(partyId => {
        this.back.getParty(partyId).then(party => {
          this.parties.push({
            party: party,
            id:partyId
          });
        })
      });
    }
  }

  loadCocktails(){
    this.cocktails = [];
    if (this.account){
      this.account.cocktailsId.forEach(cocktailId => {
        this.back.getCocktail(cocktailId).then(cocktail => {
          this.cocktails.push({
            cock: cocktail,
            id: cocktailId,
            new: false
          });
          this.cocktails.sort((n1,n2) => {
            return n1.cock.name.localeCompare(n2.cock.name);
          });
        })
      });
    }
  }

  deleteParty(party: PartyWithId){
    const dialogRef = this.dialog.open(ConfirmDialog,{
      data: {
        message: 'Voulez-vous vraiment supprimer la soirée "'+party.party.name+'" ?',
        ok: 'Supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == CONFIRMED){
        this.back.deleteParty(party.id, this.user?.uid ?? '').then(
          () => {
            if (this.account){
              this.account.partiesId = this.account.partiesId.filter(id =>{
                return id !== party.id;
              });
            }
            this.loadParties();
          }
        )
      }
    });
  }

  addParty(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nom de la soirée'] = '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Créer une nouvelle soirée",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nom de la soirée']){
        return;
      }
      let party: Party = {
        name: result['Nom de la soirée'],
        opened: false,
        cocktails: [],
      }
      let newId = '';
      this.back.getNewPartyId().then(data => {
        newId = data;
        if (newId == ''){ return; }
        this.back.createParty(newId, this.user?.uid ?? '', party).then(() => {
          this.back.getAccount(this.user?.uid ?? '').then(account => {
            this.account = account;
            this.loadParties();
          })
        })
      })
    });
  }

  openParty(party: PartyWithId){
    party.party.opened = true;
    this.back.setParty(party.id, party.party);
  }

  closeParty(party: PartyWithId){
    party.party.opened = false;
    this.back.setParty(party.id, party.party);
  }

  addCocktail(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nom du cocktail'] = '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        title: "Créer un nouveau cocktail",
        canExit: true,
        fields: neededFields
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result || !result['Nom du cocktail']){
        return;
      }
      let cocktail: Cocktail = {
        name: result['Nom du cocktail'],
        ingredients: [],
        image: '',
        desc: ''
      }
      this.back.createCocktail(this.user?.uid ?? '', cocktail).then(id => {
        if (id){
          this.cocktails.push({
            id: id,
            cock: cocktail,
            new: true
          })
          this.cocktails.sort((n1,n2) => {
            return n1.cock.name.localeCompare(n2.cock.name);
          });
        }
      });
    });
  }

  deleteCocktail(c: CocktailWithId){
    const dialogRef = this.dialog.open(ConfirmDialog,{
      data: {
        message: 'Voulez-vous vraiment supprimer le cocktail "'+c.cock.name+'" ?',
        ok: 'Supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == CONFIRMED){
        this.back.deleteCocktail(c.id, this.user?.uid ?? '').then(
          () => {this.loadCocktails();}
        )
      }
    });
  }
}

import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';
import { Party, PartyWithId, UserAccount } from '../app.core';
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
      }).catch(error => {
        let neededFields: { [id: string] : string; } = {};
        neededFields['Nouveau nom'] = "";
        const dialogRef = this.dialog.open(FieldsDialog, {
          data: {
            name: this.account?.name ?? '',
            canExit: false,
            fields: neededFields,
          }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          this.back.createAccount(this.user?.uid ?? '', result).then(() => {
            this.back.getAccount(this.user?.uid ?? '').then(account => {
              this.account = account;
              this.loadParties();
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
        name: this.account?.name ?? '',
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
          this.loadParties();
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
          () => {this.loadParties();}
        )
      }
    });
  }

  addParty(){
    let neededFields: { [id: string] : string; } = {};
    neededFields['Nom de la soirée'] = '';
    const dialogRef = this.dialog.open(FieldsDialog, {
      data: {
        name: this.account?.name ?? '',
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
        cocktailsId: [],
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
}

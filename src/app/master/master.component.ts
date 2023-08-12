import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';
import { PartyWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { EditAccountDialog } from '../dialogs/edit-account.dialog';
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
        const dialogRef = this.dialog.open(EditAccountDialog, {
          data: {name: this.account?.name ?? '', canExit: false},
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
    const dialogRef = this.dialog.open(EditAccountDialog, {
      data: {name: this.account?.name ?? '', canExit: true},
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result){
        return;
      }
      this.back.createAccount(this.user?.uid ?? '', result).then(() => {
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
        console.log('delete');
      }
    })
  }
}

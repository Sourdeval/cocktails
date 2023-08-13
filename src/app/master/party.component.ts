import { Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { User } from 'firebase/auth';
import { PartyWithId, UserAccount } from '../app.core';
import { MatDialog } from '@angular/material/dialog';
import { FieldsDialog } from '../dialogs/fields.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export class PartyComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;
  party: PartyWithId | null = null;

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
    });
    if (!id) { this.zone.run(() => this.router.navigate(['/master'])); }
    this.back.getAuth().onAuthStateChanged(user => {
      if(user == null) { this.zone.run(() => this.router.navigate(['/login'])); return; }
      this.user = user;
      this.back.getAccount(this.user?.uid ?? '').then(account => {
        this.account = account;
        this.loadParty(id ?? '');
      }).catch(() => {
        this.zone.run(() => this.router.navigate(['/login']));
      });
    });
  }

  loadParty(id: string){
    if (id == '') { return; }
    this.back.getParty(id).then(data => {
      this.party = {
        id: id,
        party: data
      };
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

}

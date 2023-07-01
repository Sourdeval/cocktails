import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';
import { UserAccount } from '../app.core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {
  user: User | null = null;
  account: UserAccount | null = null;

  constructor(private readonly back : BackendService,
    private readonly zone : NgZone,
    private readonly router : Router,
    public dialog: MatDialog) {
    back.getAuth().onAuthStateChanged(user => {
      if(user == null) { zone.run(() => this.router.navigate(['/login'])); return; }
      this.user = user;
      back.getAccount(this.user?.uid ?? '').then(account => {
        this.account = account;
      }).catch(error => {
        const dialogRef = this.dialog.open(EditAccountDialog, {
          data: {name: this.account?.name ?? '', canExit: false},
        });
    
        dialogRef.afterClosed().subscribe(result => {
          this.back.createAccount(this.user?.uid ?? '', result).then(() => {
            this.back.getAccount(this.user?.uid ?? '').then(account => {
              this.account = account;
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
      this.back.createAccount(this.user?.uid ?? '', result).then(() => {
        this.back.getAccount(this.user?.uid ?? '').then(account => {
          this.account = account;
        })
      })
    });
  }
}

export interface DialogData {
  name: string;
  canExit: boolean;
}

@Component({
  templateUrl: '../dialogs/edit-account.dialog.html',
})
export class EditAccountDialog {
  constructor(
    public dialogRef: MatDialogRef<EditAccountDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

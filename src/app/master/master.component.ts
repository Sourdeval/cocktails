import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';
import { UserAccount } from '../app.core';

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
    private readonly router : Router) {
    back.getAuth().onAuthStateChanged(user => {
      if(user == null) { zone.run(() => this.router.navigate(['/login'])); return; }
      this.user = user;
      back.getAccount(this.user?.uid ?? '').then(account => {
        this.account = account;
      }).catch(error => {
        back.createAccount(this.user?.uid ?? '', "Vico").then(() => {
          back.getAccount(this.user?.uid ?? '').then(account => {
            this.account = account;
          })
        }).catch(error => {
          zone.run(() => this.router.navigate(['/login'])); return;
        })
      })
    })
  }

  ngOnInit(): void {
  }
}

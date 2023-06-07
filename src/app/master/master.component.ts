import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.css']
})
export class MasterComponent implements OnInit {
  user: User | null = null;

  constructor(private readonly back : BackendService,
    private readonly zone : NgZone,
    private readonly router : Router) {
    back.getAuth().onAuthStateChanged(user => {
      if(user == null) { zone.run(() => this.router.navigate(['/login'])) }
      this.user = user;
    })
  }

  ngOnInit(): void {
  }

  logout(){
    this.back.logout().then(
      () => {
        this.zone.run(() => this.router.navigate(['/login']))
      }
    )
    .catch((error) => {
      console.log('MYERROR: '+error.code+' - '+error.message);
    })
  }
}

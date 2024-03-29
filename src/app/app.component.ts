import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@firebase/auth';
import { BackendService } from './backend.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: User | null = null;

  constructor(private readonly back : BackendService,
    private readonly zone : NgZone,
    private readonly router : Router) {
    back.getAuth().onAuthStateChanged(user => {
      this.user = user;
    })
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

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { CocktailWithId, Party } from '../app.core';
import { BackendService } from '../backend.service';

@Component({
  selector: 'app-drinker',
  templateUrl: './drinker.component.html',
  styleUrls: ['./drinker.component.css']
})
export class DrinkerComponent implements OnInit {
  partyNumber: string = '';
  party: Party | undefined;
  cocktails: CocktailWithId[] = new Array();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router : Router,
    private readonly back : BackendService,
    ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id !== '508'){
        this.router.navigate(['']);
      }
      else {
        this.partyNumber = id;
        this.back.getParty(this.partyNumber).then(
          party => {
            if (party.opened){
              this.party = party;
              party.cocktailsId.forEach(id => {
                this.back.getCocktail(id).then(cock =>{
                  let cockId : CocktailWithId = {
                    cock: cock,
                    id: id
                  }
                  this.cocktails.push(cockId);
                })
              })
            }
            else {
              this.router.navigate([''])
            }
          }
        ).catch(err => {
          this.router.navigate(['']);
        })
      }
    } );
  }

}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Cocktail, CocktailOfParty, CocktailPartyLink, Party } from '../app.core';
import { BackendService } from '../backend.service';
import { ImageService } from '../image.service';

@Component({
  selector: 'app-drinker',
  templateUrl: './drinker.component.html',
  styleUrls: ['./drinker.component.css']
})
export class DrinkerComponent implements OnInit {
  partyNumber: string = '';
  party: Party | undefined;
  cocktails: CocktailOfParty[] = new Array();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router : Router,
    private readonly back : BackendService,
    private readonly imageBack: ImageService,
    ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (!id){
        this.router.navigate(['']);
      }
      else {
        this.partyNumber = id;
        this.back.getParty(this.partyNumber).then(
          party => {
            if (party.opened){
              this.party = party;
              party.cocktails.forEach(link => {
                this.back.getCocktail(link.id).then(cock =>{
                  if (!cock.image){
                    this.addCocktailToList(cock, link, '');
                  }
                  else {
                    this.imageBack.getCocktailImage(cock.image).then(url => {
                      this.addCocktailToList(cock, link, url);
                    }).catch(() => {
                      this.addCocktailToList(cock, link, '');
                    })
                  }
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

  private addCocktailToList(cock: Cocktail, link: CocktailPartyLink, imageUrl: string){
    let cockId = {
      cock: cock,
      link: link,
      imageUrl: imageUrl
    }
    this.cocktails.push(cockId);
  }
}

import { Component, OnInit } from '@angular/core';
import * as $ from 'jquery'
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-ressources-city',
  templateUrl: './ressources-city.component.html',
  styleUrls: ['./ressources-city.component.scss']
})
export class RessourcesCityComponent implements OnInit {
  ressourses:Array<any> = []
  url_prefix = environment.url_prefix
  url_frontend = environment.url_frontend
  constructor() { }

  ngOnInit() {
    $.getJSON("../../../../assets/ressourses.json", (json)=> {
      console.log(json); 
      this.ressourses = json
    },
     (err)=> {
      
    });
  }

}

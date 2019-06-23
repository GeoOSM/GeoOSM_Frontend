import { Component} from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import * as $ from 'jquery';


import { communicationComponent } from "./service/communicationComponent.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'app';
  catalogue_load = false


  constructor(  
      private router: Router, 
    public location: Location,
    private communicationComponent : communicationComponent    
){}

  ngOnInit() {
    
    var th = false
    var ca = false

    this.communicationComponent.getDataThematiques().subscribe(data =>{
        th = true
        if(ca){
            this.catalogue_load = true
        }
    })

    this.communicationComponent.getDataCartes().subscribe(data =>{
        ca = true
        if(th){
            this.catalogue_load = true
        }
    })

  }

  isMaps(path){
        var titlee = this.location.prepareExternalUrl(this.location.path());
        titlee = titlee.slice( 1 );
        if(path == titlee){
            return false;
        }
        else {
            return true;
        }
    }

    close_loading(id){
        $('#'+id).hide()
    }

} 

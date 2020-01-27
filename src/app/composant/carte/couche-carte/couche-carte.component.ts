import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-couche-carte',
  templateUrl: './couche-carte.component.html',
  styleUrls: ['./couche-carte.component.scss']
})
export class CoucheCarteComponent implements OnInit {

  constructor() { }

  @Input() couche_cartes;
  @Output() toogle_carte = new EventEmitter();

  url_prefix = environment.url_prefix
  
  ngOnInit() {
  }

  displayDataOnMap(carte){
    this.toogle_carte.emit(carte)
  }

 

}

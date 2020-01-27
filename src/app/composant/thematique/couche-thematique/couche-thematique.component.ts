import { Component, OnInit,Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-couche-thematique',
  templateUrl: './couche-thematique.component.html',
  styleUrls: ['./couche-thematique.component.scss']
})
export class CoucheThematiqueComponent implements OnInit {

  constructor() { }

  @Input() couche;
  @Output() toogle_couche = new EventEmitter();

  url_prefix = environment.url_prefix
  
  ngOnInit() {
  }

  displayDataOnMap(couche){
    this.toogle_couche.emit(couche)
  }

}

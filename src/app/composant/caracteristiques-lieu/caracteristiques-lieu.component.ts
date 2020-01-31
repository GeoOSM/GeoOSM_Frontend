import { Component, OnInit,Input,Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-caracteristiques-lieu',
  templateUrl: './caracteristiques-lieu.component.html',
  styleUrls: ['./caracteristiques-lieu.component.scss']
})
export class CaracteristiquesLieuComponent implements OnInit {

  @Input() caracteristicsPoint;
  @Output() close_caracteristique_action = new EventEmitter();
  @Output() zoomToPoint_action = new EventEmitter();
  @Output() shareLocation_action = new EventEmitter();

  url_prefix = environment.url_prefix

  constructor(public translate: TranslateService){
    translate.addLangs(['fr']);
    translate.setDefaultLang('fr');
  }
  ngOnInit() {
  }

  isPhone() {
		if (document.documentElement.clientWidth <= 767) {
			return true
		} else {
			return false
		}
  }

  zoomToPoint(){
    this.zoomToPoint_action.emit()
  }
  close_caracteristique(){
    this.close_caracteristique_action.emit()
  }

  shareLocation(){
    this.shareLocation_action.emit()
  }
  
}

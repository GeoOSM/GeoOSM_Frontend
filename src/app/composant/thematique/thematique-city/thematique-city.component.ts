import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-thematique-city',
  templateUrl: './thematique-city.component.html',
  styleUrls: ['./thematique-city.component.scss']
})
export class ThematiqueCityComponent implements OnInit {

  @Input() thematique;
  url_prefix = environment.url_prefix

  constructor() { }

  ngOnInit() {
  }

}

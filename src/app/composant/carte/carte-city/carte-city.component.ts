import { Component, OnInit, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-carte-city',
  templateUrl: './carte-city.component.html',
  styleUrls: ['./carte-city.component.scss']
})
export class CarteCityComponent implements OnInit {

  @Input() groupeCarte;
  url_prefix = environment.url_prefix
  constructor() { }

  ngOnInit() {
  }

}

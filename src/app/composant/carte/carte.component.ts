import { Component, OnInit,Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-carte',
  templateUrl: './carte.component.html',
  styleUrls: ['./carte.component.scss']
})
export class CarteComponent implements OnInit {

  constructor() { }

  @Input() groupeCarte;
  url_prefix = environment.url_prefix
  
  ngOnInit() {
  }

}

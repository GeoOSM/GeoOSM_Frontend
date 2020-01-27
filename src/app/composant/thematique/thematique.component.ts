import { Component, OnInit,Input } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-thematique',
  templateUrl: './thematique.component.html',
  styleUrls: ['./thematique.component.scss']
})
export class ThematiqueComponent implements OnInit {

  constructor() { }

  @Input() thematique;
	url_prefix = environment.url_prefix


  ngOnInit() {
  }

}

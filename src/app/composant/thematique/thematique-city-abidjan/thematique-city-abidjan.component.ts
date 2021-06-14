import { Component, OnInit, Input } from "@angular/core";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-thematique-city-abidjan",
  templateUrl: "./thematique-city-abidjan.component.html",
  styleUrls: ["./thematique-city-abidjan.component.scss"],
})
export class ThematiqueCityAbidjanComponent implements OnInit {
  @Input() thematique;
  url_prefix = environment.url_prefix;

  constructor() {}

  ngOnInit() {}
}

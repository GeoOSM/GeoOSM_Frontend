import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { communicationComponent } from "../.../../../../service/communicationComponent.service";
@Component({
  selector: "app-couche-thematique",
  templateUrl: "./couche-thematique.component.html",
  styleUrls: ["./couche-thematique.component.scss"],
})
export class CoucheThematiqueComponent implements OnInit {
  constructor(private communicationComponent: communicationComponent) {}

  @Input() couche;
  @Output() toogle_couche = new EventEmitter();

  url_prefix = environment.url_prefix;

  ngOnInit() {}

  displayDataOnMap(couche) {
    console.log(couche);
    this.communicationComponent.get_thematique_by_rang(couche.rang_thema);

    this.toogle_couche.emit(couche);
  }

  disabled_couche(couche) {
    // console.log(couche)
    if (
      (couche["wms_type"] == "osm" && couche["number"] == 0) ||
      couche["number"] == null
    ) {
      return true;
    } else if (
      (couche["wms_type"] == null && couche["number"] == 0) ||
      couche["number"] == null
    ) {
      return true;
    } else {
      return false;
    }
  }
}

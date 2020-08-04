import {
  ViewChildren,
  Component,
  OnInit,
  Input,
  HostListener,
  Directive,
  NgIterable,
  Host,
  TemplateRef,
  ViewContainerRef,
  EmbeddedViewRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgForOf } from "@angular/common";
import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PopStateEvent,
} from "@angular/common";
import { communicationComponent } from "../service/communicationComponent.service";
import {
  MatSnackBar,
  MatBottomSheet,
  MatBottomSheetRef,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material";

import { geoportailService } from "../service/geoportail.service";

import * as $ from "jquery";
import { MapComponent } from "../map/map.component";
import { modalQuestion } from "../modal/question.modal";
import { environment } from "../../environments/environment";
import { TranslateService } from "@ngx-translate/core";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  reponse_geocode;
  word_geocode = "";
  filter_expression;
  reponse_geocode_count;
  querry_recherche_body = false;
  environment: any;
  config_projet: any;
  my_extend_active_form_group: FormGroup = this.fb.group({
    my_extend_active: "",
  });

  extend_active: any[] = [];

  constructor(
    private fb: FormBuilder,
    public location: Location,
    private router: Router,
    private geoportailService: geoportailService,
    private communicationComponent: communicationComponent,
    public dialog: MatDialog,
    public translate: TranslateService
  ) {
    this.environment = environment;
    translate.addLangs(environment.avaible_language);
    translate.setDefaultLang(environment.default_language);
  }

  change_language(lang) {
    //   console.log(lang)
    if (lang["value"]) {
      this.translate.use(lang["value"]);
    }
  }

  change_extent(value) {
    this.communicationComponent.changeExtent.next(value);
  }

  ngOnInit() {
    this.reponse_geocode = {};
    this.reponse_geocode["nominatim"] = [];

    this.reponse_geocode["thematiques"] = [];
    this.reponse_geocode["limites"] = [];
    this.reponse_geocode["adresses"] = [];
    this.reponse_geocode["cartes"] = [];
    this.reponse_geocode["position"] = [];

    this.reponse_geocode_count = 0;
    // this.reponse_geocode_count["nominatim"] = 0

    // this.reponse_geocode_count["thematiques"] = 0
    // this.reponse_geocode_count["limites"] = 0
    // this.reponse_geocode_count["adresses"] = 0
    // this.reponse_geocode_count["cartes"] = 0

    var donne = {};
    donne["thematiques"] = [];
    donne["cartes"] = [];

    this.communicationComponent.changeExtent.subscribe((value) => {
      this.my_extend_active_form_group
        .get("my_extend_active")
        .setValue(value, { emitEvent: false });
    });

    this.my_extend_active_form_group
      .get("my_extend_active")
      .valueChanges.subscribe((value) => {
        console.log(
          this.my_extend_active_form_group.get("my_extend_active").value
        );
        this.communicationComponent.changeExtent.next(
          this.my_extend_active_form_group.get("my_extend_active").value
        );
      });

    this.communicationComponent.config_projet.subscribe((value) => {
      this.config_projet = value;
    });
    this.communicationComponent.getDataThematiques().subscribe((data) => {
      donne["thematiques"] = data;

      for (var i = 0; i < donne["thematiques"].length; i++) {
        if (donne["thematiques"][i].sous_thematiques) {
          for (
            var j = 0;
            j < donne["thematiques"][i].sous_thematiques.length;
            j++
          ) {
            for (
              var k = 0;
              k < donne["thematiques"][i].sous_thematiques[j].couches.length;
              k++
            ) {
              donne["thematiques"][i].sous_thematiques[j].couches[k]["tags_"] =
                "";
              donne["thematiques"][i].sous_thematiques[j].couches[k][
                "rang_thema"
              ] = i;
              var element = [];

              if (
                !Array.isArray(
                  donne["thematiques"][i].sous_thematiques[j].couches[k][
                    "metadata"
                  ]
                )
              ) {
                for (
                  var index = 0;
                  index <
                  donne["thematiques"][i].sous_thematiques[j].couches[k][
                    "metadata"
                  ].tags.length;
                  index++
                ) {
                  element.push(
                    donne["thematiques"][i].sous_thematiques[j].couches[k][
                      "metadata"
                    ].tags[index].tags
                  );
                }

                donne["thematiques"][i].sous_thematiques[j].couches[k][
                  "tags_"
                ] = element.toString();
              }

              donne["thematiques"][i].sous_thematiques[j].couches[k][
                "description_catalogue"
              ] =
                donne["thematiques"][i].sous_thematiques[j].couches[k]["nom"] +
                " " +
                donne["thematiques"][i]["nom"] +
                " " +
                donne["thematiques"][i].sous_thematiques[j]["nom"] +
                " " +
                element.toString();

              this.reponse_geocode["thematiques"].push(
                donne["thematiques"][i].sous_thematiques[j].couches[k]
              );
            }
          }
        } else {
          for (var j = 0; j < donne["thematiques"][i].couches.length; j++) {
            donne["thematiques"][i].couches[j]["tags_"] = "";
            donne["thematiques"][i].couches[j]["rang_thema"] = i;
            var element = [];
            if (
              !Array.isArray(donne["thematiques"][i].couches[j]["metadata"])
            ) {
              for (
                var index = 0;
                index <
                donne["thematiques"][i].couches[j]["metadata"].tags.length;
                index++
              ) {
                element.push(
                  donne["thematiques"][i].couches[j]["metadata"].tags[index]
                    .tags
                );
              }

              donne["thematiques"][i].couches[j]["tags_"] = element.toString();
            }
            donne["thematiques"][i].couches[j]["description_catalogue"] =
              donne["thematiques"][i].couches[j]["nom"] +
              " " +
              donne["thematiques"][i]["nom"] +
              " " +
              element.toString();

            this.reponse_geocode["thematiques"].push(
              donne["thematiques"][i].couches[j]
            );
          }
        }
      }
    });

    this.communicationComponent.getDataCartes().subscribe((data) => {
      donne["cartes"] = data;

      for (var i = 0; i < donne["cartes"].length; i++) {
        if (donne["cartes"][i].sous_cartes) {
          for (var j = 0; j < donne["cartes"][i].sous_cartes.length; j++) {
            for (
              var k = 0;
              k < donne["cartes"][i].sous_cartes[j].couches.length;
              k++
            ) {
              if (donne["cartes"][i].sous_cartes[j].couches[k].type == "pdf") {
                for (
                  var index = 0;
                  index <
                  donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf
                    .length;
                  index++
                ) {
                  donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["nom"] =
                    donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                      index
                    ]["name"];
                  donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["tags_"] = "";
                  donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["rang_thema"] = i;
                  var element = [];
                  if (
                    !Array.isArray(
                      donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                        index
                      ]["metadata"]
                    )
                  ) {
                    for (
                      var z = 0;
                      z <
                      donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                        index
                      ]["metadata"].tags.length;
                      z++
                    ) {
                      element.push(
                        donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                          index
                        ]["metadata"].tags[z].tags
                      );
                    }

                    donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                      index
                    ]["tags_"] = element.toString();
                  }

                  donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["description_catalogue"] =
                    donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                      index
                    ]["name"] +
                    " " +
                    donne["cartes"][i]["nom"] +
                    " " +
                    donne["cartes"][i].sous_cartes[j]["nom"] +
                    " " +
                    donne["cartes"][i].sous_cartes[j].couches[k]["nom"] +
                    " " +
                    element.toString();

                  this.reponse_geocode["cartes"].push(
                    donne["cartes"][i].sous_cartes[j].couches[k].cartes_pdf[
                      index
                    ]
                  );
                }
              } else {
                donne["cartes"][i].sous_cartes[j].couches[k]["tags_"] = "";
                donne["cartes"][i].sous_cartes[j].couches[k]["rang_thema"] = i;
                var element = [];
                if (
                  !Array.isArray(
                    donne["cartes"][i].sous_cartes[j].couches[k]["metadata"]
                  )
                ) {
                  for (
                    var index = 0;
                    index <
                    donne["cartes"][i].sous_cartes[j].couches[k]["metadata"]
                      .tags.length;
                    index++
                  ) {
                    element.push(
                      donne["cartes"][i].sous_cartes[j].couches[k]["metadata"]
                        .tags[index].tags
                    );
                  }

                  donne["cartes"][i].sous_cartes[j].couches[k][
                    "tags_"
                  ] = element.toString();
                }
                donne["cartes"][i].sous_cartes[j].couches[k][
                  "description_catalogue"
                ] =
                  donne["cartes"][i].sous_cartes[j].couches[k]["nom"] +
                  " " +
                  donne["cartes"][i]["nom"] +
                  " " +
                  donne["cartes"][i].sous_cartes[j]["nom"] +
                  " " +
                  element.toString();
                this.reponse_geocode["cartes"].push(
                  donne["cartes"][i].sous_cartes[j].couches[k]
                );
              }
            }
          }
        } else {
          for (var k = 0; k < donne["cartes"][i].couches.length; k++) {
            if (donne["cartes"][i].couches[k].type == "pdf") {
              for (
                var index = 0;
                index < donne["cartes"][i].couches[k].cartes_pdf.length;
                index++
              ) {
                donne["cartes"][i].couches[k].cartes_pdf[index][
                  "description_catalogue"
                ] =
                  donne["cartes"][i].couches[k].cartes_pdf[index]["name"] +
                  " " +
                  donne["cartes"][i]["nom"] +
                  " " +
                  donne["cartes"][i].couches[k]["nom"];
                donne["cartes"][i].couches[k].cartes_pdf[index]["nom"] =
                  donne["cartes"][i].couches[k].cartes_pdf[index]["name"];
                donne["cartes"][i].couches[k].cartes_pdf[index]["tags_"] = "";
                donne["cartes"][i].couches[k].cartes_pdf[index][
                  "rang_thema"
                ] = i;
                this.reponse_geocode["cartes"].push(
                  donne["cartes"][i].couches[k].cartes_pdf[index]
                );
              }
            } else {
              donne["cartes"][i].couches[k]["description_catalogue"] =
                donne["cartes"][i].couches[k]["nom"] +
                " " +
                donne["cartes"][i]["nom"];

              donne["cartes"][i].couches[k]["rang_thema"] = i;
              donne["cartes"][i].couches[k]["tags_"] = "";

              this.reponse_geocode["cartes"].push(
                donne["cartes"][i].couches[k]
              );
            }
          }
        }
      }
      console.log(this.reponse_geocode);
    });

    this.communicationComponent.getData().subscribe((data) => {
      if (data["type_query_action"] == "setWord_geocode") {
        this.word_geocode = data["value"];
      }
    });

    this.communicationComponent.all_extends.subscribe((data) => {
      this.extend_active = data;
    });
  }

  questionModalOpen() {
    if (document.documentElement.clientWidth >= 767) {
      var width = "50%";
      var height = "60%";
    } else {
      var width = "90%";
      var height = "80%";
    }
    const dialogRef = this.dialog.open(modalQuestion, {
      width: width,
      // height: height
    });
  }

  isMaps(path) {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    titlee = titlee.slice(1);
    if (path == titlee) {
      return false;
    } else {
      return true;
    }
  }

  goto() {
    this.router.navigate(["map"]);
  }

  displayResultQuery() {
    if (this.reponse_geocode.nominatim.length != 0) {
      return true;
    } else {
      //return false
    }
  }

  clearQuery() {
    this.reponse_geocode["nominatim"] = [];
    this.reponse_geocode["position"] = [];
    this.word_geocode = "";
    this.querry_recherche_body = false;
    var a = {};
    a["type_query_action"] = "clear";
    this.communicationComponent.updateData(Object.create(a));
  }

  display_reponse_geocode_limites() {
    if (this.reponse_geocode["limites"].length != 0) {
      return true;
    } else {
      return false;
    }
  }
  display_reponse_geocode_adresse() {
    if (this.reponse_geocode["adresses"].length != 0) {
      return true;
    } else {
      return false;
    }
  }
  display_reponse_geocode_position() {
    if (this.reponse_geocode["position"].length != 0) {
      return true;
    } else {
      return false;
    }
  }

  geocode(word) {
    this.filter_expression = {
      // 'tags_': word,
      description_catalogue: word,
      // 'nom': word
    };

    this.querry_recherche_body = false;
    $("#loading_querry_recherche").show();
    this.reponse_geocode["limites"] = [];
    this.reponse_geocode["adresses"] = [];
    this.reponse_geocode["position"] = [];

    if (word.split(",").length == 1) {
      // #adresse
      // this.geoportailService.getPositionFromAdress({'adresse':word}).then((data: Object[]) =>{
      //     if(Array.isArray(data)){
      //         data[0]['adresse'] = word
      //         this.reponse_geocode["adresses"] = data
      //     }
      // })
    }

    if (word.split(",").length == 1) {
      var word_for_search_limite = word;

      // if ( word.includes('département') || word.includes('départements') || word.includes('arrondissement') || word.includes('arrondissements') || word.includes('commune') || word.includes('communes') || word.includes('departement')|| word.includes('departements')|| word.includes('region')|| word.includes('regions')|| word.includes('région')|| word.includes('régions') ) {
      word_for_search_limite = word
        .replace("commune", "")
        .replace("communes", "")
        .replace("quartier", "")
        .replace("quartiers", "")
        .replace("departement", "")
        .replace("departements", "")
        .replace("département", "")
        .replace("départements", "")
        .replace("region", "")
        .replace("regions", "")
        .replace("région", "")
        .replace("régions", "")
        .replace("arrondissement", "")
        .replace("arrondissements", "")
        .replace(" de ", "")
        .replace(" du ", "")
        .replace(" le ", "")
        .replace(" la ", "")
        .replace(" d' ", "")
        .replace(" ", "");

      console.log(word_for_search_limite);
      // }

      this.geoportailService
        .searchLimite({ word: word_for_search_limite })
        .then((data: any) => {
          if (data["status"] == "ok") {
            var limites = [];
            var limite_display = [];

            for (
              let index = 0;
              index < this.config_projet["limites"].length;
              index++
            ) {
              const element = this.config_projet["limites"][index];
              limite_display.push(element["nom"]);
              limites.push(element["nom_table"]);
            }

            for (var i = 0; i < limites.length; i++) {
              var element = limites[i];
              for (var index = 0; index < data[limites[i]].length; index++) {
                this.reponse_geocode["limites"].push({
                  type: limites[i],
                  type_display: limite_display[i],
                  name: data[limites[i]][index]["name"],
                  id: data[limites[i]][index]["id"],
                  ref: data[limites[i]][index]["ref"],
                });
              }
            }

            console.log(this.reponse_geocode["limites"]);
          }
        });
    }

    this.geoportailService.queryNominatim(word).then((data: Object[]) => {
      this.reponse_geocode["nominatim"] = [];
      for (var index = 0; index < data.length; index++) {
        // &&  data[index]['address']['state']=='Occitania'
        if (
          data[index]["address"]["country_code"] == environment.indicatif_pays
        ) {
          this.reponse_geocode["nominatim"].push(data[index]);
        }
      }

      // this.reponse_geocode["nominatim"] = data
      $("#loading_querry_recherche").hide();

      this.querry_recherche_body = true;
      console.log(this.reponse_geocode);
    });
  }

  displayResult(item, type) {
    console.log(item);
    if (type == "nominatim") {
      if (item.osm_type == "relation") {
        var osm_type = "R";
      } else if (item.osm_type == "way") {
        var osm_type = "W";
      } else if (item.osm_type == "node") {
        var osm_type = "N";
      }

      var osm_id = item.osm_id;
      var tags = [];

      var a = {};
      a[item.class] = item.type;
      item["a_tags"] = a;

      item.type_query = type;
      item.type_query_action = "display";
      this.word_geocode = item.display_name;
      this.communicationComponent.updateData(item);
      this.reponse_geocode[type] = [];
      this.querry_recherche_body = false;
      // this.geoportailService.formatNominatimResponse(osm_type,osm_id).then((data: Object[]) =>{
      //     console.log(data)
      //     $.each( data, function( i, item ) {

      //         if(i != 'calculated_importance' && i != 'calculated_postcode' && i != 'calculated_wikipedia' && i != 'centroid' && i != 'names' && i != 'geometry' && i != 'extratags' && i != 'indexed_date' ){
      //             var a = {}
      //             a[i]=item
      //             tags.push(a)
      //         }

      //     })
      //     console.log(tags)
      // })
    } else {
      item.type_query = type;
      item.type_query_action = "display";
      this.word_geocode = "";
      if (type == "limites") {
        this.word_geocode =
          item.type_display + " : " + item.name + " (" + item.ref + ")";
      }
      if (type == "position") {
        this.word_geocode = item.position + "," + item.nom;
      }
      this.communicationComponent.updateData(item);
      this.querry_recherche_body = false;
    }
  }
}

@Directive({
  selector: "[ngForIfEmpty]",
})
export class NgForIfEmpty<T> {
  @Input()
  public set ngForIfEmpty(templateRef: TemplateRef<any>) {
    this.templateRef = templateRef;
    this.viewRef = null;
    this.updateView();
  }

  private templateRef: TemplateRef<any>;
  private viewRef: EmbeddedViewRef<any>;
  private _isEmpty: boolean = false;

  constructor(
    @Host() private ngForOf: NgForOf<T>,
    private viewContainer: ViewContainerRef
  ) {
    const _ngDoCheck = ngForOf.ngDoCheck.bind(ngForOf);
    ngForOf.ngDoCheck = () => {
      _ngDoCheck();

      //   console.log(ngForOf)
      this.isEmpty =
        !ngForOf["_ngForOf"] || this.isIterableEmpty(ngForOf["_ngForOf"]);
      //console.log(this.isEmpty ,'isEmpty')
    };
  }

  private set isEmpty(value: boolean) {
    if (value !== this._isEmpty) {
      this._isEmpty = value;
      this.updateView();
    }
  }
  private get isEmpty() {
    return this._isEmpty;
  }

  private updateView() {
    if (this.isEmpty) {
      if (!this.viewRef) {
        this.viewContainer.clear();
        if (this.templateRef) {
          this.viewRef = this.viewContainer.createEmbeddedView(
            this.templateRef
          );
        }
      }

      console.log(1);
    } else {
      //this.viewContainer.clear();
      this.viewRef = null;
    }
  }

  private isIterableEmpty(iterable): boolean {
    for (let item of iterable) {
      return false;
    }

    return true;
  }
}

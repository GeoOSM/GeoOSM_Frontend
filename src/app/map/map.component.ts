import { CoucheThematiqueComponent } from "./../composant/thematique/couche-thematique/couche-thematique.component";
import {
  Component,
  OnInit,
  ViewChild,
  NgZone,
  HostBinding,
  Output,
  EventEmitter,
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Meta } from "@angular/platform-browser";
import { OrderBy } from "../filter/orderby";
import { Observable } from "rxjs";
import { map as MAP, startWith } from "rxjs/operators";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSelectionListChange } from "@angular/material/list";
import {
  MatSnackBar,
  MatBottomSheet,
  MatBottomSheetRef,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  FormArray,
  Validators,
} from "@angular/forms";
import * as $ from "jquery";
import { Chart } from "chart.js";
import { MatSidenav } from "@angular/material/sidenav";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";

import { extent as Extent } from "openlayers";
import { tilegrid } from "openlayers";
import { Map } from "openlayers";
import { View } from "openlayers";
import { control as Control } from "openlayers";
import { geom } from "openlayers";
import { layer } from "openlayers";
import { Feature } from "openlayers";
import { source } from "openlayers";
import { format as Format } from "openlayers";
import { style } from "openlayers";
import { proj } from "openlayers";
import { Overlay } from "openlayers";
import { interaction } from "openlayers";
import { Collection } from "openlayers";
import { Sphere } from "openlayers";
import { Observable as OBservable } from "openlayers";
import { events } from "openlayers";
import { Attribution } from "openlayers";
import { loadingstrategy } from "openlayers";

import { buttonsheetComponent } from "../buttonSheet/buttonheet.component";
import { buttonsheetGeosiComponent } from "../buttonSheet/buttonheet_geosi.component";
import { modalComponent } from "../modal/modal.component";
import { modalMetadata } from "../modal/modal.metadata";
import { commentComponent } from "../modal/modal.comment";

import { cartesService } from "../service/cartes.service";
import { thematiqueService } from "../service/thematiques.service";
import { geoportailService } from "../service/geoportail.service";
import { PrrintService } from "../service/prrint.service";
import { communicationComponent } from "../service/communicationComponent.service";
import { environment } from "../../environments/environment";
import { AddGeosignetsComponent } from "../composant/add-geosignets/add-geosignets.component";

declare var jsPDF: any;
declare var turf: any;

const view = new View({
  center: proj.transform([0, 0], "EPSG:4326", "EPSG:3857"),
  zoom: 0,
  minZoom: 0,
});
const scaleControl = new Control.ScaleLine();
const attribution = new Control.Attribution({
  collapsible: true,
});
const map = new Map({
  layers: [],
  target: "map",
  loadTilesWhileAnimating: true,
  view: view,
  controls: Control.defaults({ attribution: false }).extend([
    scaleControl,
    attribution,
  ]),
});
scaleControl.setUnits("metric");

const stylePolygon = function (feature) {
  function stringDivider(str, width, spaceReplacer) {
    if (str.length > width) {
      var p = width;
      while (p > 0 && str[p] != " " && str[p] != "-") {
        p--;
      }
      if (p > 0) {
        var left;
        if (str.substring(p, p + 1) == "-") {
          left = str.substring(0, p + 1);
        } else {
          left = str.substring(0, p);
        }
        var right = str.substring(p + 1);
        return (
          left + spaceReplacer + stringDivider(right, width, spaceReplacer)
        );
      }
    }
    return str;
  }

  var getText = function (donne) {
    if (donne.name) {
      return donne.name;
    } else {
      var label = "";

      for (var i = 0; i < donne.length; i++) {
        if (donne[i]["champ_principal"]) {
          label = donne[i]["val"];
        }
      }

      return label;
    }
  };

  var donne = feature.getProperties().ptestyle;
  var pte = feature.getProperties().data;

  if (donne.img !== null && donne.img !== undefined) {
    var styles = [
      new style.Style({
        stroke: new style.Stroke({
          color: "#434343",
          width: 4,
        }),
        fill: new style.Fill({
          color: donne.img,
        }),
        text: new style.Text({
          font: "15px Calibri,sans-serif",
          text: stringDivider(getText(pte), 16, "\n"),
          fill: new style.Fill({ color: "#000" }),
          stroke: new style.Stroke({ color: "#000", width: 1 }),
          offsetX: 0,
          offsetY: 0,
        }),
      }),
    ];

    return styles;
  } else {
    return new style.Style({
      fill: new style.Fill({
        color: donne.remplir_couleur,
      }),
      stroke: new style.Stroke({
        color: "#434343",
        width: 4,
      }),
      text: new style.Text({
        font: "15px Calibri,sans-serif",
        text: stringDivider(getText(pte), 16, "\n"),
        fill: new style.Fill({ color: "#000" }),
        stroke: new style.Stroke({ color: "#000", width: 1 }),
        offsetX: 0,
        offsetY: 0,
      }),
    });
  }
};

const styleLigne = function (feature, resolution) {
  function getFont(resolution) {
    var font;

    if (resolution > 4.8) {
      font = "0px Calibri,sans-serif";
    } else if (resolution < 0.7) {
      font = "17px Calibri,sans-serif";
    } else {
      font = 10 / resolution + "px Calibri,sans-serif";
    }

    return font;
  }

  var createTextStyle = function (features, resolution) {
    var geometry = features.getGeometry();
    var donne = features.getProperties().data;

    var rotation;

    geometry.forEachSegment(function (start, end) {
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      rotation = Math.atan2(dy, dx);
    });

    return new style.Text({
      font: getFont(resolution),
      text: getText(donne),
      fill: new style.Fill({ color: "#000" }),
      stroke: new style.Stroke({ color: "#000", width: 1 }),
      offsetX: 0,
      offsetY: 0,
      //rotation: rotation
    });
  };

  var getText = function (donne) {
    if (donne.name) {
      return donne.name;
    } else {
      var label = "";

      for (var i = 0; i < donne.length; i++) {
        if (donne[i]["champ_principal"]) {
          label = donne[i]["val"];
        }
      }

      return label;
    }
  };

  var pte = feature.getProperties().data;
  var couche = feature.getProperties().ptestyle;

  return new style.Style({
    fill: new style.Fill({
      color: couche.contour_couleur,
    }),
    stroke: new style.Stroke({
      color: couche.contour_couleur,
      width: 4,
    }),
    image: new style.Circle({
      radius: 5,
      stroke: new style.Stroke({
        color: couche.contour_couleur,
      }),
      fill: new style.Fill({
        color: couche.contour_couleur,
      }),
    }),
    text: createTextStyle(feature, map.getView().getResolution()),
  });
};

export interface User {}

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.scss"],
})
export class MapComponent implements OnInit {
  @HostBinding("class.is-open")
  @ViewChild("sidenav1")
  sidenav1: MatSidenav;

  @ViewChild("sidenav2") sidenav2: MatSidenav;

  @Output() toogle_couche = new EventEmitter();

  reason_left = "";
  reason_right = "";
  right_slide_actic;
  primaryColor;
  source_draw;
  vector_draw;
  draw;
  type_draw;
  count_draw;
  edit_draw_button;
  type_edit_draw;
  commentBox;
  colorPickerBox;
  colorDraw;
  select;
  modify;
  source_mesure;
  vector_mesure;
  sketch;
  helpTooltipElement;
  helpTooltip;
  measureTooltipElement;
  measureTooltip;
  continuePolygonMsg;
  continueLineMsg;
  listener;
  event_mesure;
  extent_cameroun;
  mesure_type;
  zoomToExtentStatus;
  deZoomToExtentStatus;
  zoomStory = [];
  centerStory = [];
  pos = -1;
  updateStory = true;
  cartes;
  thematiques;
  typeMenu;
  groupMenuActive;
  activeGroup = true;
  selectFeature;
  layerInMap = [];
  zIndexMax = 1;
  typeDataFeature;
  dataFeature = [];
  yTree;
  modeCompare = false;
  precompose;
  postcompose;
  swipeEvent;
  layerInCompare = [];
  modeMappilary;
  responseMappilary;
  previewPointMappilary;
  positionProperties;
  altimetrie;
  profil_alti_active = false;
  chart_drape;
  masque;
  masque_source;
  geocode_variable;
  tags_couche;
  data_right_click = { item: [] };
  caracteristicsPoint = { display: false };
  commentLayer;
  comment_user;
  displayPropertiesDivs = [];
  geoSignets = [];
  url_share;
  roi_projet_geojson;

  chart_analyse_spatiale = [];
  list_analyse_spatial = [];
  /* printMapObjet = {
    titre: "",
    description: "",
  };*/

  titre: string = "";
  description: string = "";

  url_prefix = environment.url_prefix;
  url_frontend = environment.url_frontend;

  opened_right = false;

  toggle_left(reason_left: string) {
    if (this.reason_left == "") {
      this.constructMapBind();
    }
    // console.log( this.sidenav1,Object.getPrototypeOf(this.sidenav1))
    this.reason_left = reason_left;
    this.sidenav1.toggle();
    if (!this.opened_left || this.opened_left == undefined) {
      $(".utils").css("left", "300px");
      $("#notifications").css("left", "300px");
      $("#mouseposition").css("left", "300px");
      $("#bloc_caracteristique").css("left", "300px");
    } else {
      $("#bloc_caracteristique").css("left", "65px");

      $(".utils").css("left", "40px");
      $("#notifications").css("left", "65px");
      $("#mouseposition").css("left", "65px");
      $(".slide2").css("left", "-300px");
      $(".title_rollback_slide2").css("left", "-300px");
    }
  }

  toggle_right(index, reason_right: string) {
    if (!this.opened_right || this.opened_right == undefined) {
      //ouvert

      $(".utils_right").css("right", "220px");
      this.right_slide_actic = index;
      this.sidenav2.toggle();
      this.opened_right = true;
    } else {
      //fermer

      if (this.right_slide_actic != index) {
        this.right_slide_actic = index;
      } else {
        $(".utils_right").css("right", "0px");
        this.sidenav2.toggle();

        this.reason_right = reason_right;
        this.opened_right = false;
      }
    }
  }

  events_left = "close";
  events_right = "close";
  config_projet;
  opened_left: false;
  environment: any;

  constructor(
    private zone: NgZone,
    public notif: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public MetaData: MatDialog,
    private cartesService: cartesService,
    private thematiqueService: thematiqueService,
    private geoportailService: geoportailService,
    private PrrintService: PrrintService,
    private communicationComponent: communicationComponent,
    private activatedRoute: ActivatedRoute,
    private meta: Meta,
    public translate: TranslateService,
    private builder: FormBuilder
  ) {
    this.environment = environment;
  }

  public formAnalyse_spatial = this.builder.group({
    id: [, Validators.required],
  });

  ngOnInit() {
    ///////// shadow getInternalFile ////////////////////////////

    this.geoportailService.getConfigProjet().then((config) => {
      this.config_projet = config;
      console.log(this.config_projet);
    });

    this.geoportailService.getZoneInteret().then((cameroun: Object[]) => {
      var geometry = JSON.parse(cameroun["data"]["geometry"]);
      this.roi_projet_geojson = geometry;
      console.log(geometry);
      // })

      // this.geoportailService.getInternalFile("/assets/cameroun.geojson").then((cameroun: Object[]) => {

      this.geoportailService
        .getInternalFile("/assets/world_shadow.geojson")
        .then((world_shadow: Object[]) => {
          var features_cameroun = new Format.GeoJSON().readFeatures(
            JSON.parse(cameroun["data"]["geometry"]),
            {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            }
          );

          var features_world_shadow = new Format.GeoJSON().readFeatures(
            JSON.parse(world_shadow["_body"])["features"][0]
          );

          var rasterSource_world = new source.ImageVector({
            source: new source.Vector(),
            projection: "EPSG:3857",
            style: new style.Style({
              fill: new style.Fill({
                color: [0, 0, 0, 0.6],
              }),
            }),
          });

          var rasterSource_cmr = new source.ImageVector({
            source: new source.Vector(),
            projection: "EPSG:3857",
            style: new style.Style({
              fill: new style.Fill({
                color: [0, 0, 0, 0.1],
              }),
            }),
          });

          rasterSource_world.getSource().addFeatures(features_world_shadow);
          rasterSource_cmr.getSource().addFeatures(features_cameroun);

          var raster = new source.Raster({
            sources: [rasterSource_world, rasterSource_cmr],
            operation: function (pixels, data) {
              if (pixels[1][3] == 0) {
                return pixels[0];
                //return [0, 0, 0, 1]
              } else {
                return [0, 0, 0, 1];
              }
            },
          });
          var rasterLayer = new layer.Image({
            source: raster,
          });
          rasterLayer.setZIndex(1000);
          map.addLayer(rasterLayer);

          this.extent_cameroun = rasterSource_cmr.getSource().getExtent();
          this.globalView();
          this.displayDefaultLayer();

          setTimeout(() => {
            this.geoportailService.getVisitiors().then((vues: Object[]) => {
              console.log(vues);
              $("#id_nombre_vues").show();
              if (vues && vues.length > 0) {
                $("#nombre_vues").text(vues[0]["vues"]);
              }
            });
          }, 3000);

          setTimeout(() => {
            $("#id_nombre_vues").hide();
          }, 7000);

          this.activatedRoute.queryParams.subscribe((params) => {
            let share = params["share"];

            if (share == "draw") {
              this.displayShareDraw(params["id"]);
            } else if (share == "location") {
              var location = params["path"].split(",");
              console.log(location, location[2]);
              this.data_right_click["coord"] = [
                parseFloat(location[0]),
                parseFloat(location[1]),
              ];
              map.getView().setZoom(parseFloat(location[2]));
              map.getView().setCenter(this.data_right_click["coord"]);
              this.getCarateristics();
            } else if (share == "limites") {
              var properties = params["path"].split(",");
              console.log(properties, properties[0]);
              var limites = [
                "communes",
                "departements",
                "regions",
                "quartiers",
              ];
              var limite_display = [
                "Commune",
                "Département",
                "Region",
                "Quartier",
              ];

              var donne = {
                id: properties[1],
                name: undefined,
                ref: undefined,
                type: properties[0],
                type_display: limite_display[limites.indexOf(properties[0])],
                type_query: "limites",
                type_query_action: "display",
              };

              this.displayLimitesAdministratives(donne);
            }

            if (
              share == "map" &&
              params["path"] &&
              params["path"].split(",")[3]
            ) {
            } else {
              map.getView().fit(this.extent_cameroun, {
                size: map.getSize(),
                duration: 1000,
              });
            }
          });

          map.on("moveend", () => {
            var bbox_cam = turf.bboxPolygon(this.extent_cameroun);
            var bbox_view = turf.bboxPolygon(
              map.getView().calculateExtent(map.getSize())
            );

            // turf.bbox(line)
            // var bool = turf.booleanOverlap(bbox_view,bbox_cam)
            // var bool = turf.booleanContains(bbox_view,bbox_cam)
            var bool = turf.intersect(
              turf.toWgs84(bbox_view),
              turf.toWgs84(bbox_cam)
            );
            if (bool == null) {
              map.getView().fit(this.extent_cameroun, {
                size: map.getSize(),
                duration: 1000,
              });
            }
          });
        });
    });

    /////////// //shadow ////////////////////

    this.caracteristicsPoint["display"] = false;

    this.data_right_click["item"] = [];

    this.translate
      .get("menu_contextuel", { value: "caracteristique" })
      .subscribe((res: any) => {
        this.data_right_click["item"][0] = {
          name: res.caracteristique,
          icon: 1,
          click: "this.getCarateristics",
        };
      });

    this.translate
      .get("menu_contextuel", { value: "partager" })
      .subscribe((res: any) => {
        console.log(res);
        this.data_right_click["item"][1] = {
          name: res.partager,
          icon: 2,
          click: "this.shareLocation",
        };
      });

    this.translate
      .get("menu_contextuel", { value: "commenter" })
      .subscribe((res: any) => {
        this.data_right_click["item"][2] = {
          name: res.commenter,
          icon: 3,
          click: "this.openModalComment",
        };
      });

    this.translate
      .get("menu_contextuel", { value: "ajouter_geosignet" })
      .subscribe((res: any) => {
        this.data_right_click["item"][3] = {
          name: res.ajouter_geosignet,
          icon: 4,
          click: "this.addGeoSignets",
        };
      });

    this.translate
      .get("menu_contextuel", { value: "voir_geosignet" })
      .subscribe((res: any) => {
        this.data_right_click["item"][4] = {
          name: res.voir_geosignet,
          icon: 5,
          click: "this.displayGeoSignet",
        };
      });

    ///////// share /////////////////////////////

    this.communicationComponent.getDataThematiques().subscribe((data) => {
      this.activatedRoute.queryParams.subscribe((params) => {
        let share = params["share"];
        console.log(params);
        if (share == "data") {
          var path = params["path"].split(",");
          //var url = couche.key_couche+','+sous.key+','+group.id_cartes
          var key_couche = path[0];
          var key_sous = path[1];
          var key_groupe = path[2];

          for (var i = 0; i < this.thematiques.length; i++) {
            if (this.thematiques[i].id_thematique == key_groupe) {
              if (this.thematiques[i].sous_thematiques && key_sous != false) {
                for (
                  var j = 0;
                  j < this.thematiques[i].sous_thematiques.length;
                  j++
                ) {
                  if (this.thematiques[i].sous_thematiques[j].key == key_sous) {
                    for (
                      var k = 0;
                      k <
                      this.thematiques[i].sous_thematiques[j].couches.length;
                      k++
                    ) {
                      if (
                        this.thematiques[i].sous_thematiques[j].couches[k]
                          .key_couche == key_couche
                      ) {
                        this.thematiques[i].sous_thematiques[j].couches[
                          k
                        ].checked = true;
                        this.displayDataOnMap(
                          this.thematiques[i].sous_thematiques[j].couches[k],
                          this.thematiques[i]
                        );
                      }
                    }
                  }
                }
              } else {
                if (this.thematiques[i].id_thematique == key_groupe) {
                  for (var j = 0; j < this.thematiques[i].couches.length; j++) {
                    if (
                      this.thematiques[i].couches[j].key_couche == key_couche
                    ) {
                      this.thematiques[i].couches[j].checked = true;
                      this.displayDataOnMap(
                        this.thematiques[i].couches[j],
                        this.thematiques[i]
                      );
                    }
                  }
                }
              }
            }
          }
        } else if (share == "feature") {
          var prop = params["path"].split(",");
          var id_cat = prop[0];
          var key_couche = prop[1];
          console.log(id_cat, key_couche);
          for (var i = 0; i < this.thematiques.length; i++) {
            if (this.thematiques[i].id_thematique == id_cat) {
              if (
                this.thematiques[i].sous_thematiques &&
                this.thematiques[i].sous_thematiques
              ) {
                var sous_thematique = true;
                for (
                  var j = 0;
                  j < this.thematiques[i].sous_thematiques.length;
                  j++
                ) {
                  for (
                    var k = 0;
                    k < this.thematiques[i].sous_thematiques[j].couches.length;
                    k++
                  ) {
                    if (
                      this.thematiques[i].sous_thematiques[j].couches[k]
                        .key_couche == key_couche
                    ) {
                      var type_geom =
                        this.thematiques[i].sous_thematiques[j].couches[k].geom;
                      var icone =
                        this.thematiques[i].sous_thematiques[j].couches[k].img;
                    }
                  }
                }
              } else {
                var sous_thematique = true;
                for (var j = 0; j < this.thematiques[i].couches.length; j++) {
                  if (this.thematiques[i].couches[j].key_couche == key_couche) {
                    var type_geom = this.thematiques[i].couches[j].geom;
                    var icone = this.thematiques[i].couches[j].img;
                  }
                }
              }
            }
          }
          console.log("iciii", params["type"]);
          if (params["type"] == "osm") {
            var details_osm_url =
              "https://nominatim.openstreetmap.org/details.php?osmtype=" +
              prop[2] +
              "&osmid=" +
              prop[3] +
              "&polygon_geojson=1&addressdetails=1&format=json";

            $.get(details_osm_url, (data) => {
              console.log(data);
              var item = data;
              if (type_geom == "point") {
                var coord = item.centroid.coordinates;
              } else {
                var coord = item.geometry.coordinates;
              }

              var resultat = {
                icone: icone,
                type_query: "share",
                type_geom: type_geom,
                data: item.address[0].localname,
                coord: coord,
              };
              console.log(resultat, "resultat");
              this.displayResultGeocodeOnMap(resultat);
              var a = {};
              a["type_query_action"] = "setWord_geocode";
              a["value"] = item.address[0].localname;
              this.communicationComponent.updateData(Object.create(a));
            });
          } else if (params["type"] == "feature") {
            var parameters = {
              sous_thematique: sous_thematique,
              id_thematique: id_cat,
              key_couche: key_couche,
              id: prop[2],
            };

            this.geoportailService
              .getFeatureFromLayerById(parameters)
              .then((data: Object[]) => {
                var item = data["data"];
                var geometry = JSON.parse(item["geometry"]);
                var coord;
                if (type_geom == "point") {
                  if (geometry.coordinates.length == 1) {
                    coord = geometry.coordinates[0];
                  } else {
                    coord = geometry.coordinates;
                  }
                } else {
                  if (geometry.coordinates.length == 1) {
                    coord = geometry.coordinates[0];
                  } else {
                    coord = geometry.coordinates;
                  }
                }

                var resultat = {
                  icone: icone,
                  type_query: "share",
                  type_geom: type_geom,
                  data: item,
                  coord: coord,
                };
                console.log(resultat, "resultat");
                var a = {};
                a["type_query_action"] = "setWord_geocode";
                a["value"] = data["nom_title"];
                this.communicationComponent.updateData(Object.create(a));
                this.displayResultGeocodeOnMap(resultat);
              });
          }
        } else if (share == "state") {
          if (this.cartes) {
            this.displayAllFromStateOfMap();
          }
        }
      });
    });

    this.communicationComponent.getDataCartes().subscribe((data) => {
      this.activatedRoute.queryParams.subscribe((params) => {
        let share = params["share"];

        if (share == "map") {
          var path = params["path"].split(",");
          //var url = couche.key_couche+','+sous.key+','+group.id_cartes
          var key_couche = path[0];
          var key_sous = path[1];
          var key_groupe = path[2];

          if (path[3]) {
            var id_mapPdf = path[3];
          }

          for (var i = 0; i < this.cartes.length; i++) {
            if (this.cartes[i].id_cartes == key_groupe) {
              if (this.cartes[i].sous_cartes && key_sous != false) {
                for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
                  if (this.cartes[i].sous_cartes[j].key == key_sous) {
                    for (
                      var k = 0;
                      k < this.cartes[i].sous_cartes[j].couches.length;
                      k++
                    ) {
                      if (
                        this.cartes[i].sous_cartes[j].couches[k].key_couche ==
                          key_couche &&
                        !id_mapPdf
                      ) {
                        this.cartes[i].sous_cartes[j].couches[k].checked = true;
                        this.displayDataOnMap(
                          this.cartes[i].sous_cartes[j].couches[k],
                          this.cartes[i]
                        );
                      } else if (
                        this.cartes[i].sous_cartes[j].couches[k].key_couche ==
                          key_couche &&
                        id_mapPdf
                      ) {
                        for (
                          var index = 0;
                          index <
                          this.cartes[i].sous_cartes[j].couches[k].cartes_pdf
                            .length;
                          index++
                        ) {
                          if (
                            this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                              index
                            ]["id"] == id_mapPdf
                          ) {
                            this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                              index
                            ].checked = true;
                            this.displayDataOnMap(
                              this.cartes[i].sous_cartes[j].couches[k]
                                .cartes_pdf[index],
                              this.cartes[i]
                            );
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                for (var j = 0; j < this.cartes[i].couches.length; j++) {
                  if (
                    this.cartes[i].couches[j].key_couche == key_couche &&
                    !id_mapPdf
                  ) {
                    this.cartes[i].couches[j].checked = true;
                    this.displayDataOnMap(
                      this.cartes[i].couches[j],
                      this.cartes[i]
                    );
                  } else if (
                    this.cartes[i].couches[j].key_couche == key_couche &&
                    id_mapPdf
                  ) {
                    for (
                      var index = 0;
                      index < this.cartes[i].couches[j].cartes_pdf.length;
                      index++
                    ) {
                      if (
                        this.cartes[i].couches[j].cartes_pdf[index]["id"] ==
                        id_mapPdf
                      ) {
                        this.cartes[i].couches[j].cartes_pdf[index].checked =
                          true;
                        this.displayDataOnMap(
                          this.cartes[i].couches[j].cartes_pdf[index],
                          this.cartes[i]
                        );
                      }
                    }
                  }
                }
              }
            }
          }
        } else if (share == "state") {
          if (this.thematiques) {
            this.displayAllFromStateOfMap();
          }
        }
      });
    });
    ///////// ///////share /////////////////////////////

    ////////////// geocode communication component between header and map componnect ////////////
    this.communicationComponent.getData().subscribe((data) => {
      if (data["type_query_action"] == "display") {
        this.displayResultGeocode(data);
      } else if (data["type_query_action"] == "clear") {
        map.getLayers().forEach((layer) => {
          if (layer.get("name") == "querry") {
            layer.get("source").clear();
          }
        });
      }
    });
    ////////////// // geocode communication component between header and map componnect ////////////

    map.setTarget("sidebar");
    map.setTarget("map");

    this.cartesService.Getcartes().then((data: Object[]) => {
      this.cartes = data;

      for (var i = 0; i < this.cartes.length; i++) {
        if (this.cartes[i].sous_cartes) {
          for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
            for (
              var k = 0;
              k < this.cartes[i].sous_cartes[j].couches.length;
              k++
            ) {
              this.cartes[i].sous_cartes[j].couches[k].rang_thema = i;
              this.cartes[i].sous_cartes[j].couches[k].id_cat =
                this.cartes[i]["id_cartes"];
              this.cartes[i].sous_cartes[j].couches[k].id_sous_cat =
                this.cartes[i].sous_cartes[j]["key"];
              this.cartes[i].sous_cartes[j].couches[k].id_sous_cat_couche =
                this.cartes[i].sous_cartes[j].couches[k]["key_couche"];

              if (this.cartes[i].sous_cartes[j].couches[k].principal) {
                this.cartes[i].sous_cartes[j].couches[k].checked = true;
                this.displayDataOnMap(
                  this.cartes[i].sous_cartes[j].couches[k],
                  this.cartes[i]
                );
              } else {
                this.cartes[i].sous_cartes[j].couches[k].checked = false;
              }

              if (this.cartes[i].sous_cartes[j].couches[k].type != "pdf") {
                this.cartes[i].sous_cartes[j].couches[k].opacity = 100;
              } else {
                for (
                  var index = 0;
                  index <
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length;
                  index++
                ) {
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "id_cat"
                  ] = this.cartes[i]["id_cartes"];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "id_sous_cat"
                  ] = this.cartes[i].sous_cartes[j]["key"];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "id_sous_cat_couche"
                  ] = this.cartes[i].sous_cartes[j].couches[k]["key_couche"];

                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "nom"
                  ] =
                    this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                      "name"
                    ];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "urlFile"
                  ] =
                    this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                      "url"
                    ];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "url"
                  ] =
                    this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                      "url_tile"
                    ];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "opacity"
                  ] = 100;
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "display"
                  ] = true;
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "typeInf"
                  ] = "sous_cartes_pdf";
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "type"
                  ] =
                    this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                      "type"
                    ];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "commentaire"
                  ] =
                    this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                      "description"
                    ];
                }
              }

              this.cartes[i].sous_cartes[j].couches[k].inLayerTree = true;
              this.cartes[i].sous_cartes[j].couches[k].statusDescription_inf =
                false;
            }
          }
        } else {
          for (var j = 0; j < this.cartes[i].couches.length; j++) {
            this.cartes[i].couches[j].rang_thema = i;
            this.cartes[i].couches[j].id_cat = this.cartes[i]["id_cartes"];
            this.cartes[i].couches[j].id_sous_cat = false;
            this.cartes[i].couches[j].id_sous_cat_couche =
              this.cartes[i].couches[j]["key_couche"];

            if (this.cartes[i].couches[j].principal) {
              this.cartes[i].couches[j].checked = true;
              this.displayDataOnMap(this.cartes[i].couches[j], "");
            } else {
              this.cartes[i].couches[j].checked = false;
            }

            if (this.cartes[i].couches[j].type != "pdf") {
              this.cartes[i].couches[j].opacity = 100;
            } else {
              for (
                var index = 0;
                index < this.cartes[i].couches[j].cartes_pdf.length;
                index++
              ) {
                this.cartes[i].couches[j].cartes_pdf[index]["id_cat"] =
                  this.cartes[i]["id_cartes"];
                this.cartes[i].couches[j].cartes_pdf[index]["id_sous_cat"] =
                  false;
                this.cartes[i].couches[j].cartes_pdf[index][
                  "id_sous_cat_couche"
                ] = this.cartes[i].couches[j]["key_couche"];

                this.cartes[i].couches[j].cartes_pdf[index]["nom"] =
                  this.cartes[i].couches[j].cartes_pdf[index]["name"];
                this.cartes[i].couches[j].cartes_pdf[index]["urlFile"] =
                  this.cartes[i].couches[j].cartes_pdf[index]["url"];
                this.cartes[i].couches[j].cartes_pdf[index]["url"] =
                  this.cartes[i].couches[j].cartes_pdf[index]["url_tile"];
                this.cartes[i].couches[j].cartes_pdf[index]["opacity"] = 100;
                this.cartes[i].couches[j].cartes_pdf[index]["display"] = true;
                this.cartes[i].couches[j].cartes_pdf[index]["typeInf"] =
                  "sous_cartes_pdf";
                this.cartes[i].couches[j].cartes_pdf[index]["type"] =
                  this.cartes[i].couches[j].cartes_pdf[index]["type"];
                this.cartes[i].couches[j].cartes_pdf[index]["commentaire"] =
                  this.cartes[i].couches[j].cartes_pdf[index]["description"];
              }
            }

            this.cartes[i].couches[j].inLayerTree = true;
            this.cartes[i].couches[j].statusDescription_inf = false;
          }
        }
      }

      map.on("moveend", () => {
        this.displayInlayerTree();
      });

      this.communicationComponent.updateDataCartes(this.cartes);
      if (document.documentElement.clientWidth >= 767) {
        this.toggle_left("");
      }
    });

    var getOperateur = function (code) {
      if (code == 0) {
        return "=";
      } else if (code == 1) {
        return "!=";
      } else if (code == 2) {
        return "IS NOT NULL";
      } else if (code == 3) {
        return "IS NULL";
      }
    };

    this.thematiqueService.Getthematiques().then((data: Object[]) => {
      this.thematiques = data;
      this.tags_couche = [];
      for (var i = 0; i < this.thematiques.length; i++) {
        if (this.thematiques[i].sous_thematiques) {
          for (
            var j = 0;
            j < this.thematiques[i].sous_thematiques.length;
            j++
          ) {
            for (
              var k = 0;
              k < this.thematiques[i].sous_thematiques[j].couches.length;
              k++
            ) {
              var resume = "";

              this.thematiques[i].sous_thematiques[j].couches[k].rang_thema = i;
              this.thematiques[i].sous_thematiques[j].couches[k].id_cat =
                this.thematiques[i].id_thematique;
              this.thematiques[i].sous_thematiques[j].couches[k][
                "id_sous_cat"
              ] = this.thematiques[i].sous_thematiques[j].key;
              this.thematiques[i].sous_thematiques[j].couches[k][
                "id_sous_cat_couche"
              ] = this.thematiques[i].sous_thematiques[j].couches[k].key_couche;

              this.thematiques[i].sous_thematiques[j].couches[k].checked =
                false;

              this.thematiques[i].sous_thematiques[j].couches[k].opacity =
                parseFloat(
                  this.thematiques[i].sous_thematiques[j].couches[k].opacity
                ) * 100;

              if (
                this.thematiques[i].sous_thematiques[j].couches[k]
                  .type_couche == "requete"
              ) {
                for (
                  var index = 0;
                  index <
                  this.thematiques[i].sous_thematiques[j].couches[k]
                    .cles_vals_osm.length;
                  index++
                ) {
                  var element = {};
                  element["couche"] =
                    this.thematiques[i].sous_thematiques[j].couches[k];
                  var operateur =
                    this.thematiques[i].sous_thematiques[j].couches[k]
                      .cles_vals_osm[index]["operateur"];
                  element["cle"] =
                    this.thematiques[i].sous_thematiques[j].couches[
                      k
                    ].cles_vals_osm[index]["action"];
                  element["val"] =
                    this.thematiques[i].sous_thematiques[j].couches[
                      k
                    ].cles_vals_osm[index]["nom"];

                  var key_val =
                    element["cle"] +
                    " " +
                    getOperateur(operateur) +
                    element["val"];
                  // resume = resume + "; " + key_val

                  this.tags_couche.push(element);
                }
                // this.thematiques[i].sous_thematiques[j].couches[k].metadata['resume'] = resume
              } else if (
                this.thematiques[i].sous_thematiques[j].couches[k]
                  .type_couche == "wms" &&
                this.thematiques[i].sous_thematiques[j].couches[k].wms_type ==
                  "osm"
              ) {
                for (
                  var index = 0;
                  index <
                  this.thematiques[i].sous_thematiques[j].couches[k]
                    .cles_vals_osm.length;
                  index++
                ) {
                  var element = {};
                  element["couche"] =
                    this.thematiques[i].sous_thematiques[j].couches[k];
                  var operateur =
                    this.thematiques[i].sous_thematiques[j].couches[k]
                      .cles_vals_osm[index]["operateur"];
                  element["cle"] =
                    this.thematiques[i].sous_thematiques[j].couches[
                      k
                    ].cles_vals_osm[index]["action"];
                  element["val"] =
                    this.thematiques[i].sous_thematiques[j].couches[
                      k
                    ].cles_vals_osm[index]["nom"];

                  var key_val =
                    element["cle"] +
                    " " +
                    getOperateur(operateur) +
                    element["val"];
                  // resume = resume + "; " + key_val

                  this.tags_couche.push(element);
                }
                // this.thematiques[i].sous_thematiques[j].couches[k].metadata['resume'] = resume
              }

              if (
                this.thematiques[i].sous_thematiques[j].couches[k].nom ==
                "commentaires"
              ) {
                this.commentLayer =
                  this.thematiques[i].sous_thematiques[j].couches[k];
                this.commentLayer.shema = this.thematiques[i].shema;
                this.thematiques[i].sous_thematiques[j].couches.splice(k, 1);
              }
            }
          }
        } else {
          for (var j = 0; j < this.thematiques[i].couches.length; j++) {
            var resume = "";
            this.thematiques[i].couches[j].rang_thema = i;
            this.thematiques[i].couches[j].id_cat =
              this.thematiques[i].id_thematique;
            this.thematiques[i].couches[j]["id_sous_cat"] = false;
            this.thematiques[i].couches[j]["id_sous_cat_couche"] =
              this.thematiques[i].couches[j].key_couche;

            this.thematiques[i].couches[j].checked = false;
            this.thematiques[i].couches[j].opacity =
              parseFloat(this.thematiques[i].couches[j].opacity) * 100;

            if (this.thematiques[i].couches[j].type_couche == "requete") {
              for (
                var index = 0;
                index < this.thematiques[i].couches[j].cles_vals_osm.length;
                index++
              ) {
                var element = {};
                element["couche"] = this.thematiques[i].couches[j];
                var operateur =
                  this.thematiques[i].couches[j].cles_vals_osm[index][
                    "operateur"
                  ];
                element["cle"] =
                  this.thematiques[i].couches[j].cles_vals_osm[index]["action"];
                element["val"] =
                  this.thematiques[i].couches[j].cles_vals_osm[index]["nom"];

                var key_val =
                  element["cle"] +
                  " " +
                  getOperateur(operateur) +
                  element["val"];
                // resume = resume + "; " + key_val
                this.tags_couche.push(element);
              }
              // this.thematiques[i].couches[j].metadata['resume'] = resume
            } else if (
              this.thematiques[i].couches[j].type_couche == "wms" &&
              this.thematiques[i].couches[j].wms_type == "osm"
            ) {
              for (
                var index = 0;
                index < this.thematiques[i].couches[j].cles_vals_osm.length;
                index++
              ) {
                var element = {};
                element["couche"] = this.thematiques[i].couches[j];
                var operateur =
                  this.thematiques[i].couches[j].cles_vals_osm[index][
                    "operateur"
                  ];
                element["cle"] =
                  this.thematiques[i].couches[j].cles_vals_osm[index]["action"];
                element["val"] =
                  this.thematiques[i].couches[j].cles_vals_osm[index]["nom"];

                var key_val =
                  element["cle"] +
                  " " +
                  getOperateur(operateur) +
                  element["val"];
                // resume = resume + "; " + key_val
                this.tags_couche.push(element);
              }
              // this.thematiques[i].couches[j].metadata['resume'] = resume
            }
          }
        }
      }

      this.communicationComponent.updateDataThematiques(this.thematiques);
    });

    this.right_slide_actic = 0;
    this.primaryColor = environment.primaryColor;
    this.colorDraw = this.primaryColor;

    //// global variables for altimetrie tools///////////
    this.altimetrie = {
      active: false,
    };

    //// global variables for drawing tools///////////
    this.count_draw = {
      Point: [],
      LineString: [],
      Polygon: [],
      text: [],
    };
    this.initialise_layer_itineraire();
    this.source_draw = new source.Vector();

    this.vector_draw = new layer.Vector({
      source: this.source_draw,
    });
    this.vector_draw.setZIndex(100);
    this.vector_draw.set("name", "draw");
    map.addLayer(this.vector_draw);

    //// global variables for comments of drawing tools///////////

    var extent = map.getView().calculateExtent(map.getSize());
    var cor = getCenterOfExtent(extent);
    this.commentBox = new Overlay({
      position: [cor[0], cor[1]],
      element: document.getElementById("comment"),
    });
    map.addOverlay(this.commentBox);

    $("#comment").hide();

    function getCenterOfExtent(Extent) {
      var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
      var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
      return [X, Y];
    }

    //// global variables for coloring of drawing tools///////////

    var extent = map.getView().calculateExtent(map.getSize());
    var cor = getCenterOfExtent(extent);
    this.colorPickerBox = new Overlay({
      position: [cor[0], cor[1]],
      element: document.getElementById("colorPicker"),
    });
    map.addOverlay(this.colorPickerBox);

    $("#colorPicker").hide();

    //// global variables for mesuring tools///////////

    var rgb = this.hexToRgb(this.primaryColor);
    this.source_mesure = new source.Vector();

    this.vector_mesure = new layer.Vector({
      source: this.source_mesure,
      style: new style.Style({
        fill: new style.Fill({
          color: [rgb.r, rgb.g, rgb.b, 0.1],
        }),
        stroke: new style.Stroke({
          color: this.primaryColor,
          width: 2,
        }),
        image: new style.Circle({
          radius: 5,
          stroke: new style.Stroke({
            color: this.primaryColor,
          }),
          fill: new style.Fill({
            color: [rgb.r, rgb.g, rgb.b, 0.1],
          }),
        }),
      }),
    });
    this.vector_mesure.setZIndex(100);
    this.vector_mesure.set("name", "mesure");
    map.addLayer(this.vector_mesure);

    this.sketch;
    this.helpTooltipElement;
    this.helpTooltip;
    this.measureTooltipElement;
    this.measureTooltip;
    this.continuePolygonMsg = "Click to continue drawing the polygon";
    this.continueLineMsg = "Click to continue drawing the line";

    ////// function for roll back or front in map tools/////////

    map.on("moveend", () => {
      if (this.updateStory) {
        this.pos++;
        this.zoomStory[this.pos] = map.getView().getZoom();
        this.centerStory[this.pos] = map.getView().getCenter();
      }
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////// 			evenement du onclick 			///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    this.masque_source = new source.Vector();

    this.masque = new layer.Vector({
      source: this.masque_source,
    });
    map.addLayer(this.masque);

    map.on("click", (evt) => {
      var feature = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        return feature;
      });

      var layer = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
        return layer;
      });

      /////////////////////layer vector /////////////////////////////////
      if (layer) {
        /////////////////////cluster, on zoom juste /////////////////////////////////
        if (feature["O"]["features"] && feature["O"]["features"].length != 1) {
          map.getView().setResolution(map.getView().getResolution() * 2);

          map.getView().setCenter(evt.coordinate);
          map.getView().setZoom(map.getView().getZoom() + 3);
        } else {
          console.log(layer);
          if (layer.get("type") == "requete" || layer.get("type") == "wfs") {
            if (feature.getProperties()["features"]) {
              var dataFeature =
                feature.getProperties()["features"][0]["O"]["data"];
            } else {
              var dataFeature = feature.getProperties()["data"];
            }

            var pte = [];

            pte.push({
              index: "title_couche_thematique",
              val: this.communicationComponent.get_couche_by_key_and_id_cat(
                layer.get("id_cat"),
                layer.get("key_couche")
              ),
              display: false,
            });

            pte.push({
              index: "name",
              val: dataFeature["name"],
              display: true,
            });

            pte.push({
              index: "osm_id",
              val: Math.abs(dataFeature["osm_id"]),
              display: false,
            });

            var details_osm_url =
              "https://nominatim.openstreetmap.org/lookup?osm_ids=R" +
              Math.abs(dataFeature["osm_id"]) +
              ",W" +
              Math.abs(dataFeature["osm_id"]) +
              ",N" +
              Math.abs(dataFeature["osm_id"]) +
              "&format=json";

            if (typeof dataFeature["hstore_to_json"] === "string") {
              var hstore_to_json = JSON.parse(dataFeature["hstore_to_json"]);
            } else {
              var hstore_to_json = dataFeature["hstore_to_json"];
            }

            $.each(hstore_to_json, (index, val) => {
              if (index != "name" && val) {
                var type = "text";

                pte.push({
                  index: index,
                  val: val,
                  type: type,
                  display: true,
                });
              }

              if (index == "name" && val) {
                for (var i = 0; i < pte.length; i++) {
                  if (pte[i]["index"] == "name" && !pte[i]["val"]) {
                    pte[i]["val"] = val;
                  }
                }
              }
            });

            this.zone.run(() => {
              this.typeDataFeature = "keyVal";
              this.dataFeature = pte;
            });

            $("#notifications").show();

            $.get(details_osm_url, (data) => {
              console.log(data);
              if (data.length > 0) {
                var osm_type = data[0].osm_type;
                var osm_url =
                  "https://www.openstreetmap.org/" +
                  osm_type +
                  "/" +
                  Math.abs(dataFeature["osm_id"]);

                if (osm_type == "relation") {
                  var osm_type_small = "R";
                } else if (osm_type == "way") {
                  var osm_type_small = "W";
                } else if (osm_type == "node") {
                  var osm_type_small = "N";
                }

                pte.push({
                  index: "OSM",
                  val: osm_url,
                  type: "url_osm",
                  display: true,
                });
                pte.push({
                  index: "share_osm",
                  val:
                    layer.get("id_cat") +
                    "," +
                    layer.get("key_couche") +
                    "," +
                    osm_type_small +
                    "," +
                    Math.abs(dataFeature["osm_id"]),
                  type: "share",
                  display: false,
                });

                this.zone.run(() => {
                  this.dataFeature = pte;
                });

                // this.openProperties('280px')
              } else {
                // this.openProperties('280px')
              }
            });
            this.openProperties("280px");
            this.activate_an_icon(
              feature.getGeometry(),
              feature.getGeometry().getType()
            );
            $("#notifications").hide();
          } else if (layer.get("type") == "pdf") {
            var datas = feature.getProperties()["data"].cartes_pdf;

            var pte = [];
            this.dataFeature = [];
            /*for (var i = 0; i < datas.length; i++) {

							datas[i]['nom'] = datas[i]['name']
							datas[i]['urlFile'] = datas[i]['url']
							datas[i]['url'] = datas[i]['url_tile']
							datas[i]['opacity'] = 100
							datas[i]['display'] = true
							datas[i]['typeInf'] = 'sous_cartes_pdf'
							datas[i]['type'] = datas[i]['type']
							datas[i]['commentaire'] = datas[i]['description']

						}*/

            this.zone.run(() => {
              var donne = {};
              var bool = [];
              donne["position"] = { x: 0, y: 0 };
              donne["pte"] = datas;
              donne["maximise"] = true;
              donne["name"] = layer.get("name");

              for (
                var index = 0;
                index < this.displayPropertiesDivs.length;
                index++
              ) {
                if (
                  this.displayPropertiesDivs[index].name == layer.get("name")
                ) {
                  bool.push(index);
                }
              }
              if (bool.length == 0) {
                this.displayPropertiesDivs.push(donne);
              } else {
                this.displayPropertiesDivs[bool[0]]["position"] = {
                  x: 0,
                  y: 0,
                };
                this.displayPropertiesDivs[bool[0]]["maximise"] = true;
              }

              console.log(this.displayPropertiesDivs);

              //this.typeDataFeature = 'pdf'
              //this.dataFeature.push(datas[i])
            });
            //this.openProperties('400px')
          } else if (
            layer.get("type") == "api" ||
            layer.get("type") == "couche"
          ) {
            if (feature.getProperties()["features"]) {
              var dataFeature =
                feature.getProperties()["features"][0]["O"]["data"];
            } else {
              var dataFeature = feature.getProperties()["data"];
            }

            var pte = [];

            pte.push({
              index: "title_couche_thematique",
              val: this.communicationComponent.get_couche_by_key_and_id_cat(
                layer.get("id_cat"),
                layer.get("key_couche")
              ),
              display: false,
            });
            var hstore_to_json = dataFeature;
            for (var i = 0; i < hstore_to_json.length; i++) {
              if (
                hstore_to_json[i]["val"] != null &&
                hstore_to_json[i]["val"] != "" &&
                hstore_to_json[i]["val"] != " " &&
                hstore_to_json[i]["index"] != "geom" &&
                hstore_to_json[i]["index"] != "geometry" &&
                hstore_to_json[i]["index"] != "id"
              ) {
                if (hstore_to_json[i]["aliase"]) {
                  pte.push({
                    index: hstore_to_json[i]["aliase"],
                    val: hstore_to_json[i]["val"],
                    display: true,
                  });
                } else {
                  pte.push({
                    index: hstore_to_json[i]["index"],
                    val: hstore_to_json[i]["val"],
                    display: true,
                  });
                }
              } else if (
                hstore_to_json[i]["index"] == "id" &&
                layer.get("type") != "api"
              ) {
                pte.push({
                  index: "share_feature",
                  val:
                    layer.get("id_cat") +
                    "," +
                    layer.get("key_couche") +
                    "," +
                    hstore_to_json[i]["val"],
                  type: "share",
                  display: false,
                });
              }
            }

            this.zone.run(() => {
              this.typeDataFeature = "keyVal";
              this.dataFeature = pte;
            });
            this.activate_an_icon(
              feature.getGeometry(),
              feature.getGeometry().getType()
            );
            this.openProperties("280px");
            // console.log(pte)
          } else if (layer.get("type") == "querry") {
            if (feature.getProperties()["features"]) {
              var dataFeature =
                feature.getProperties()["features"][0]["O"]["data"];
            } else {
              var dataFeature = feature.getProperties()["data"];
            }

            if (dataFeature.osm_type) {
              if (dataFeature.osm_type == "relation") {
                var osm_type = "R";
              } else if (dataFeature.osm_type == "way") {
                var osm_type = "W";
              } else if (dataFeature.osm_type == "node") {
                var osm_type = "N";
              }

              var display_name = dataFeature.display_name;
              var type = dataFeature.type;
              var osm_id = dataFeature.osm_id;

              //var href = "https://nominatim.openstreetmap.org/details.php?osmtype=" + osm_type + "&osmid=" + osm_id;
              var href =
                "https://www.openstreetmap.org/" + osm_type + "/" + osm_id;
              console.log(dataFeature);
            } else if (dataFeature.type_query == "limites") {
              console.log("ok");
              var pte = [];

              pte.push({
                index: "title_couche_thematique",
                val: this.communicationComponent.get_couche_by_key_and_id_cat(
                  layer.get("id_cat"),
                  layer.get("key_couche")
                ),
                display: false,
              });

              pte.push({
                index: "share_limites",
                val: dataFeature.type + "," + dataFeature.id,
                type: "share",
                display: false,
              });
              pte.push({
                index: "Nom",
                val: dataFeature.name,
                display: true,
              });
              pte.push({
                index: "Référence",
                val: dataFeature.ref,
                display: true,
              });
              this.zone.run(() => {
                this.typeDataFeature = "keyVal";
                this.dataFeature = pte;
              });
              this.openProperties("120px");
            }
            console.log(dataFeature);
          }
        }
      } /////////////////////layer cartes /////////////////////////////////
      else {
        map.forEachLayerAtPixel(evt.pixel, (lay) => {
          if (
            lay.get("type_couche_inf") == "thematiques" ||
            lay.get("interrogeable") == true
          ) {
            var source = lay.getSource();
            var viewResolution = view.getResolution();

            var url =
              Object.create(source).getGetFeatureInfoUrl(
                evt.coordinate,
                viewResolution,
                "EPSG:3857"
              ) + "&FI_POINT_TOLERANCE=30&INFO_FORMAT=application/json";
            var coord_center = map.getCoordinateFromPixel(evt.pixel);

            $.get(url, (data) => {
              var pte = [];

              var details_osm_url = "";
              if (typeof data == "object") {
                try {
                  var properties = data["features"][0]["properties"];

                  pte.push({
                    index: "name",
                    val: properties["name"],
                    display: true,
                  });

                  for (const key in properties) {
                    const element = properties[key];
                    if (
                      key == "hstore_to_json" &&
                      properties.hasOwnProperty(key)
                    ) {
                      $.each(element, (index, valeur) => {
                        if (index != "name" && index != "amenity" && valeur) {
                          var type = "text";

                          pte.push({
                            index: index,
                            val: valeur,
                            type: type,
                            display: true,
                          });
                        }
                      });
                    } else if (key == "osm_id") {
                      var details_osm_url =
                        "https://nominatim.openstreetmap.org/lookup?osm_ids=R" +
                        Math.abs(element) +
                        ",W" +
                        Math.abs(element) +
                        ",N" +
                        Math.abs(element) +
                        "&format=json";
                    }
                  }
                } catch (error) {}
              } else {
                var donne = data.split(/\r?\n/);
                for (var index = 0; index < donne.length; index++) {
                  if (donne[index].includes("geometry")) {
                    //console.log(donne[index]) hstore_to_
                    //console.log(donne[index]) hstore_to_
                    //console.log(donne[index]) hstore_to_
                    var geometry_wkt = donne[index]
                      .split("=")[1]
                      .replace(/'/g, "");
                    console.log("passe");
                  } else if (
                    !donne[index].includes("Layer") &&
                    !donne[index].includes("fid") &&
                    !donne[index].includes("Feature") &&
                    donne[index].split("=").length == 2
                  ) {
                    var champ = donne[index].split("=")[0];
                    var val = donne[index].split("=")[1].replace(/'/g, "");

                    if (champ.includes("osm_id")) {
                      details_osm_url =
                        "https://nominatim.openstreetmap.org/lookup?osm_ids=R" +
                        val +
                        ",W" +
                        val +
                        ",N" +
                        val +
                        "&format=json";
                    }

                    if (
                      champ.includes("hstore_to_") ||
                      champ.includes("hstore_to_json")
                    ) {
                      console.log(donne[index], val);
                      var hstore_to_json = JSON.parse(val);

                      $.each(hstore_to_json, (index, valeur) => {
                        if (index != "name" && index != "amenity" && valeur) {
                          var type = "text";

                          pte.push({
                            index: index,
                            val: valeur,
                            type: type,
                            display: true,
                          });
                        }
                      });
                    } else if (champ != "" && val && val != "") {
                      pte.push({
                        index: champ,
                        val: val,
                        display: true,
                      });
                    }
                  }
                }
              }

              if (geometry_wkt) {
                var wkt = new Format.WKT();

                var feature = wkt.readFeature(geometry_wkt);

                this.masque_source.clear();
                this.masque_source.addFeature(feature);
                var z = lay.getZIndex() + 1;
                this.masque.setZIndex(z);
              }
              if (pte.length > 0) {
                pte.push({
                  index: "title_couche_thematique",
                  val: this.communicationComponent.get_couche_by_key_and_id_cat(
                    lay.get("id_cat"),
                    lay.get("key_couche")
                  ),
                  display: false,
                });
                this.zone.run(() => {
                  this.typeDataFeature = "keyVal";
                  this.dataFeature = pte;
                });

                // var geometry= new geom.Point(coord_center)
                // this.activate_an_icon(geometry, geometry.getType())

                if (details_osm_url != "" && pte.length > 0) {
                  $("#notifications").show();

                  $.get(details_osm_url, (data) => {
                    console.log(data);
                    if (data.length > 0) {
                      var osm_type = data[0].osm_type;
                      var osm_id = data[0].osm_id;
                      var osm_url =
                        "https://www.openstreetmap.org/" +
                        osm_type +
                        "/" +
                        osm_id;

                      pte.push({
                        index: "OSM",
                        val: osm_url,
                        type: "url_osm",
                        display: true,
                      });
                      if (osm_type == "relation") {
                        var osm_type_small = "R";
                      } else if (osm_type == "way") {
                        var osm_type_small = "W";
                      } else if (osm_type == "node") {
                        var osm_type_small = "N";
                      }
                      pte.push({
                        index: "share_osm",
                        val:
                          lay.get("id_cat") +
                          "," +
                          lay.get("key_couche") +
                          "," +
                          osm_type_small +
                          "," +
                          osm_id,
                        type: "share",
                        display: false,
                      });

                      this.zone.run(() => {
                        this.dataFeature = pte;
                      });
                    } else {
                    }

                    $("#notifications").hide();
                  });

                  this.openProperties("280px");
                } else if (pte.length > 0) {
                  this.openProperties("280px");
                }
              }
            });

            return;
          }
        });
      }
    });
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////// 		//evenement du onclick 				//////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////// 			evenement du hover	 			///////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\
    var popup_lot = new Overlay({
      element: document.getElementById("popup_lot"),
      stopEvent: true,
    });
    map.addOverlay(popup_lot);

    var popup_mappilary = new Overlay({
      element: document.getElementById("popup_mappilary"),
      stopEvent: true,
    });
    map.addOverlay(popup_mappilary);

    var target = map.getTarget();
    var jTarget = typeof target === "string" ? $("#" + target) : $(target);
    var cursor_on_popup = false;
    var popup_once_open = false;

    $(map.getViewport()).on("mouseout", (evt) => {
      $(".custom-mouse-position").text("WGS84");
    });
    $(map.getViewport()).on("mousemove", (evt) => {
      var pixel = map.getEventPixel(evt.originalEvent);
      var coord_center = proj.transform(
        map.getCoordinateFromPixel(pixel),
        "EPSG:3857",
        "EPSG:4326"
      );
      $(".custom-mouse-position").text(
        coord_center[0].toFixed(4) + " , " + coord_center[1].toFixed(4)
      );

      map.forEachLayerAtPixel(pixel, (layer) => {
        if (layer.get("type") != "mappilary") {
          var hit = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
            if (layer && layer.get("type") != "mappilary") {
              return true;
            }
          });

          if (hit) {
            jTarget.css("cursor", "pointer");
          } else {
            jTarget.css("cursor", "");
          }
        }
      });

      var feature = map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        return feature;
      });

      var layer = map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        return layer;
      });

      if (layer && feature && layer.get("type") == "querry") {
        popup_once_open = true;
        if (feature.getProperties()["features"]) {
          var dataFeature = feature.getProperties()["features"][0]["O"]["data"];
        } else {
          var dataFeature = feature.getProperties()["data"];
        }

        if (dataFeature) {
          if (dataFeature.osm_type) {
            $("#popup_infos_contain").text(dataFeature.display_name);
            $("#popup_infos_title").text(dataFeature.type);

            var osm_type = dataFeature.osm_type;
            var osm_id = dataFeature.osm_id;

            //var href = "https://nominatim.openstreetmap.org/details.php?osmtype=" + osm_type + "&osmid=" + osm_id;
            var href =
              "https://www.openstreetmap.org/" + osm_type + "/" + osm_id;

            $("#popup_details").attr("href", href);
            $("#popup_details").show();
            map.addOverlay(popup_lot);

            if (Object.create(feature.getGeometry()).getType() == "Point") {
              var coordinate = Object.create(
                feature.getGeometry()
              ).getCoordinates();
              popup_lot.setPosition(coordinate);
            } else {
              var coordinate_poly = Extent.getCenter(
                Object.create(feature.getGeometry()).getExtent()
              );
              popup_lot.setPosition(coordinate_poly);
            }
          } else if (dataFeature.type_query == "limites") {
            $("#popup_infos_title").text(dataFeature.type_display);
            if (dataFeature.ref) {
              $("#popup_infos_contain").text(
                dataFeature.name + " (" + dataFeature.ref + ")"
              );
            } else {
              $("#popup_infos_contain").text(dataFeature.name);
            }

            var coordinate_poly = Extent.getCenter(
              Object.create(feature.getGeometry()).getExtent()
            );
            map.addOverlay(popup_lot);
            popup_lot.setPosition(coordinate_poly);
          }
        }
      } else if (layer && feature && layer.get("type") == "pdf") {
        $("#popup_details").hide();
        popup_once_open = true;
        var dataFeature = feature.getProperties()["data"];
        var pte = layer.get("name");
        //console.log(dataFeature,feature.getProperties())
        if (pte) {
          $("#popup_infos_contain").text(
            dataFeature["cartes_pdf"].length + " carte(s)"
          );
          $("#popup_infos_title").text(pte);
          map.addOverlay(popup_lot);
          var coordinate = Object.create(
            feature.getGeometry()
          ).getCoordinates();
          popup_lot.setPosition(coordinate);
        }
      } else if (
        layer &&
        feature &&
        layer.get("type") != "mappilary" &&
        feature["O"].hasOwnProperty("features")
      ) {
        $("#popup_details").hide();
        popup_once_open = true;
        /////////////////////cluster, on fait rien/////////////////////////////////
        if (feature["O"]["features"] && feature["O"]["features"].length != 1) {
        } else {
          // console.log(layer.get('type'))
          if (layer.get("type") == "requete" || layer.get("type") == "wfs") {
            if (feature.getProperties()["features"]) {
              var dataFeature =
                feature.getProperties()["features"][0]["O"]["data"];
            } else {
              var dataFeature = feature.getProperties()["data"];
            }

            var pte = dataFeature["name"];

            if (pte) {
              $("#popup_infos_contain").html(pte);
              $("#popup_infos_title").text(
                this.undescore2space(layer.get("name"))
              );
              map.addOverlay(popup_lot);
              //Object.create(feature.getGeometry());
              var coordinate = Object.create(
                feature.getGeometry()
              ).getCoordinates();
              popup_lot.setPosition(coordinate);
            }
          } else if (
            layer.get("type") == "api" ||
            layer.get("type") == "couche"
          ) {
            if (feature.getProperties()["features"]) {
              var dataFeature =
                feature.getProperties()["features"][0]["O"]["data"];
            } else {
              var dataFeature = feature.getProperties()["data"];
            }

            var pte;

            var hstore_to_json = dataFeature;

            for (var i = 0; i < hstore_to_json.length; i++) {
              if (
                hstore_to_json[i]["index"] != "geom" &&
                hstore_to_json[i]["index"] != "geometry" &&
                hstore_to_json[i]["index"] != "id"
              ) {
                if (hstore_to_json[i]["champ_principal"]) {
                  pte = hstore_to_json[i]["val"];
                }
              }
            }

            if (pte) {
              $("#popup_infos_contain").html(pte);
              $("#popup_infos_title").text(
                this.undescore2space(layer.get("name"))
              );
              map.addOverlay(popup_lot);
              var coordinate = Object.create(
                feature.getGeometry()
              ).getCoordinates();
              popup_lot.setPosition(coordinate);
            }
          }
        }
      } else if (
        layer &&
        feature &&
        layer.get("type") == "mappilaryPoint" &&
        feature.getProperties()["data"]
      ) {
        var pte = feature.getProperties()["data"];
        //console.log(pte)
        //console.log(this.responseMappilary['features'])

        var point = {
          img: this.responseMappilary["features"][pte.i]["properties"][
            "coordinateProperties"
          ].image_keys[pte.j],
          cas: this.responseMappilary["features"][pte.i]["properties"][
            "coordinateProperties"
          ].cas[pte.j],
        };

        var stActive = new style.Style({
          image: new style.Circle({
            radius: 9,
            fill: new style.Fill({
              color: "rgba(53, 175, 109,0.7)",
            }),
          }),
        });

        var rotation = (Math.PI / 2 + Math.PI * point.cas) / -360;

        /*var stActiv = new style.Style({
					image :new style.RegularShape({
							fill:new style.Fill({
								 color: 'rgba(53, 175, 109,0.7)'
							  }),
							  stroke: new style.Stroke({
								 color: '#fff',
								 width: 3
							}),
						  points: 3,
						radius: 10,
						rotation: rotation,
						angle: 0
						})

					   })*/

        feature["setStyle"](stActive);

        map.addOverlay(popup_mappilary);
        var coordinate = Object.create(feature.getGeometry()).getCoordinates();
        popup_mappilary.setPosition(coordinate);

        $("#img_mappilary").attr(
          "src",
          "https://d1cuyjsrcm0gby.cloudfront.net/" +
            point.img +
            "/thumb-320.jpg"
        );

        this.zone.run(() => {
          this.previewPointMappilary = feature;
        });
      } else {
        if (popup_once_open) {
          $("#popup_lot").on("mousemove", (evt) => {
            //console.log(1)
            cursor_on_popup = true;
          });

          $("#popup_lot").on("mouseleave", (evt) => {
            //console.log('out')
            cursor_on_popup = false;

            $("#popup_infos_contain").text("");
            map.removeOverlay(popup_lot);
            popup_once_open = false;
          });
          setTimeout(function () {
            //console.log(cursor_on_popup)
            if (cursor_on_popup == false) {
              $("#popup_infos_contain").text("");
              map.removeOverlay(popup_lot);
              popup_once_open = false;
            }
          }, 200);
        }

        if (this.previewPointMappilary) {
          var st = new style.Style({
            image: new style.Circle({
              radius: 4,
              fill: new style.Fill({
                color: "#fff",
              }),
              stroke: new style.Stroke({
                color: "rgba(53, 175, 109,0.7)",
                width: 3,
              }),
            }),
            stroke: new style.Stroke({
              color: "rgba(53, 175, 109,0.7)",
              width: 4,
            }),
          });
          this.previewPointMappilary.setStyle(st);
          this.previewPointMappilary = undefined;
          map.removeOverlay(popup_mappilary);
          $("#img_mappilary").attr("src", "");
        }
      }
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////// 			//evenement du hover	 			///////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\
  }

  isPhone() {
    if (document.documentElement.clientWidth <= 767) {
      return true;
    } else {
      return false;
    }
  }

  displayDownloadsResult(params, analyse_spatial: any) {
    $("#loading_calcul").hide();
    var numbers = [];
    var labels = [];
    var data = analyse_spatial["query"];
    for (var index = 0; index < data.length; index++) {
      numbers.push(data[index]["number"]);
      labels.push(data[index]["nom"] + " (" + data[index]["number"] + ") ");
    }
    console.log(analyse_spatial);

    var features_cameroun = new Format.GeoJSON().readFeatures(
      analyse_spatial["geometry"],
      {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      }
    );

    var zone_analyseSource = new source.Vector({
      features: features_cameroun,
    });

    var center_zone_analyse = Extent.getCenter(zone_analyseSource.getExtent());
    console.log(center_zone_analyse);

    var zone_analyse_layer = new layer.Vector({
      source: zone_analyseSource,
      style: new style.Style({
        stroke: new style.Stroke({
          color: "#000",
          width: 2,
        }),
        fill: new style.Fill({
          color: this.primaryColor,
        }),
      }),
      visible: true,
      updateWhileAnimating: true,
    });

    zone_analyse_layer.setZIndex(this.zIndexMax++);

    //analyse_spatial['type_couche_inf'] = 'analyse_spatiale'
    //analyse_spatial['zIndex_inf'] = z
    //analyse_spatial['index_inf'] = this.layerInMap.length
    //analyse_spatial['name_analyse'] = 'analyse_spatiale_'+this.list_analyse_spatial.length
    //analyse_spatial['nom'] = 'Analyse spatiale '+this.list_analyse_spatial.length+1 + ' '+ analyse_spatial['emprisesChoisiName']

    var pte = {
      img: "assets/images/imagette_analyse.png",
      checked: true,
      visible: true,
      type: "analyse_spatiale",
      type_couche_inf: "analyse_spatiale",
      zIndex_inf: this.zIndexMax,
      index_inf: this.layerInMap.length,
      emprisesChoisiName: analyse_spatial["emprisesChoisiName"],
      querry: analyse_spatial["query"],
      name_analyse: "analyse_spatiale_" + this.list_analyse_spatial.length,
      nom:
        "Analyse " +
        (this.list_analyse_spatial.length + 1) +
        ": " +
        analyse_spatial["emprisesChoisiName"],
    };

    this.layerInMap.push(pte);

    // list_analyse_spatial il sert juste de compteur, la donnée dans la n'est pas bonne lol
    this.list_analyse_spatial.push(analyse_spatial);

    zone_analyse_layer.set("name", pte["name_analyse"]);
    zone_analyse_layer.set("type", "analyse_spatiale");

    map.addLayer(zone_analyse_layer);

    var extent_zone = zone_analyseSource.getExtent();
    map.getView().fit(extent_zone, { size: map.getSize(), duration: 1000 });

    var coord = center_zone_analyse;

    setTimeout(() => {
      $("#" + pte["name_analyse"]).show();

      var coord_caracteri = new Overlay({
        position: coord,
        positioning: "center-center",
        element: document.getElementById(pte["name_analyse"] + "_chart"),
      });

      map.addOverlay(coord_caracteri);

      var dynamicColors = function () {
        var r = Math.floor(Math.random() * 255);
        var g = Math.floor(Math.random() * 255);
        var b = Math.floor(Math.random() * 255);
        return "rgb(" + r + "," + g + "," + b + ")";
      };
      var coloR = [];
      for (var i in numbers) {
        coloR.push(dynamicColors());
      }
      this.chart_analyse_spatiale[this.chart_analyse_spatiale.length] =
        new Chart(pte["name_analyse"], {
          type: "pie",
          scaleFontColor: "red",
          data: {
            labels: labels,
            datasets: [
              {
                data: numbers,
                backgroundColor: coloR,
                borderColor: "rgba(200, 200, 200, 0.75)",
                hoverBorderColor: "rgba(200, 200, 200, 1)",
              },
            ],
          },
          options: {
            title: {
              display: true,
              text: pte["emprisesChoisiName"],
              fontColor: "#fff",
              fontSize: 16,
              position: "top",
            },
            legend: {
              display: true,
              labels: {
                fontColor: "#fff",
                fontSize: 14,
              },
            },
            scales: {
              xAxes: [
                {
                  display: false,
                  ticks: {
                    fontColor: "Black", // this here
                  },
                },
              ],
              yAxes: [
                {
                  display: false,
                },
              ],
            },

            onClick: (event) => {
              console.log(event);
              var name_analyse = event.target.id;
            },
          },
        });

      var notif = this.notif.open(
        "Cliquer sur le graphique pour telecharger",
        "Fermer",
        {
          duration: 20000,
        }
      );
    }, 1000);
  }

  download_files(name_analyse) {
    console.log(name_analyse);
    // var name_analyse = event.target.id

    for (var index = 0; index < this.layerInMap.length; index++) {
      if (
        this.layerInMap[index]["type"] == "analyse_spatiale" &&
        this.layerInMap[index]["name_analyse"] == name_analyse
      ) {
        var items = [];
        for (var i = 0; i < this.layerInMap[index]["querry"].length; i++) {
          var element = this.layerInMap[index]["querry"][i];
          items.push({
            nom: element["nom"],
            nom_file: element["nom_file"],
            type: "url",
            number: element["number"],
          });
        }
        this.zone.run(() => {
          this.typeDataFeature = "download";
          this.dataFeature = items;
        });
        console.log(this.typeDataFeature, this.dataFeature);
        this.openProperties("220px");
      }
    }
  }

  removeSpecialCharacter(data) {
    return data.replace(/[^a-zA-Z0-9]/g, "_");
  }

  desactivate_an_icon() {
    var lay;
    map.getLayers().forEach(function (layer) {
      if (layer.get("name") == "activate_icon") {
        lay = layer;
      }
    });

    if (lay) {
      map.removeLayer(lay);
    }
  }

  activate_an_icon(geometry_, type) {
    this.zone.run(() => {
      this.desactivate_an_icon();
      var coord = geometry_.getCoordinates();
      var primaryColor = this.primaryColor;
      if (type == "Point") {
        var features = [];
        var newMarker = new Feature({
          geometry: new geom.Point(coord),
        });
        features[0] = newMarker;

        var markerSource = new source.Vector({
          features: features,
        });

        var LayTheCopy = new layer.Vector({
          source: markerSource,
          style: new style.Style({
            image: new style.Circle({
              radius: 24,
              stroke: new style.Stroke({
                color: primaryColor,
                width: 5,
              }),
            }),
          }),
        });

        LayTheCopy.set("name", "activate_icon");
        LayTheCopy.setZIndex(1002);
        map.addLayer(LayTheCopy);
      } else {
        /*	var features = []
		
					if (type == 'Polygon') {
						var newMarker = new Feature({
							geometry: new geom.LineString(coordinate[0]),
						});
					} else {
						var newMarker = new Feature({
							geometry: new geom.LineString(coordinate),
						});
					}
		
					features[0] = newMarker;
		
		
					var markerSource = new source.Vector({
						features: features
					});
		
					var myStyle = new style.Style({
		
						stroke: new style.Stroke({
							color: '#1CAC77',
							width: 5
						}),
		
					});
		
					var LayTheCopy = new layer.Vector({
						source: markerSource,
						style: myStyle
					})*/
      }
    });
  }

  closePropertiesPdf(j) {
    this.displayPropertiesDivs.splice(j, 1);
  }
  right_click(e) {
    var coord = map.getCoordinateFromPixel([e.layerX, e.layerY]);

    this.data_right_click["coord"] = coord;
    this.data_right_click["zoom"] = map.getView().getZoom();
  }

  addGeoSignets() {
    const add_geosignets_dialog = this.dialog.open(AddGeosignetsComponent, {
      // width: '60%',
      // height: '80%',
      minWidth: "350px",
      data: { nom: "" },
    });

    add_geosignets_dialog.afterClosed().subscribe((result) => {
      if (result && result["statut"]) {
        this.geoSignets.push({
          id: this.geoSignets.length + 1,
          coord: this.data_right_click["coord"],
          zoom: this.data_right_click["zoom"],
          nom: result["nom"],
        });

        this.translate.get("notifications").subscribe((res: any) => {
          var notif = this.notif.open(
            res.signet_added_1 + result["nom"] + res.signet_added_2,
            "Fermer",
            {
              duration: 2000,
            }
          );
        });
      }
      console.log(this.geoSignets);
      console.log("The dialog was closed :", result);
    });
  }

  lunch_function(id) {
    var fun = this.data_right_click["item"][id]["click"];

    eval(fun + "();");
  }

  shareLocation() {
    var coord = this.data_right_click["coord"];
    var path =
      coord[0].toFixed(4) +
      "," +
      coord[1].toFixed(4) +
      "," +
      map.getView().getZoom();
    var url_share = this.url_frontend + "/map?share=location&path=" + path;

    var notif = this.notif.open(url_share, "Partager", {
      duration: 10000,
    });

    notif.onAction().subscribe(() => {
      $("#share_div").show();
      this.url_share = url_share;
      setTimeout(() => {
        $("#share_div").hide();
      }, 5000);
      //this.selectText('simple-snack-bar span')
    });
  }
  zoomToPoint() {
    map.getView().setZoom(18);
    map.getView().setCenter(this.data_right_click["coord"]);
  }
  getCarateristics() {
    $("#spinner_loading").show();

    var coord = this.data_right_click["coord"];

    $("#coord_caracteristics").show();
    var coord_caracteri = new Overlay({
      position: coord,
      element: document.getElementById("coord_caracteristics"),
    });

    map.addOverlay(coord_caracteri);

    $("#coord_caracteristics").on("mousemove", (evt) => {
      $("#coord_caracteristics .fa-times").show();

      $("#coord_caracteristics .fa-dot-circle").hide();
    });

    $("#coord_caracteristics").on("mouseout", (evt) => {
      $("#coord_caracteristics .fa-times").hide();

      $("#coord_caracteristics .fa-dot-circle").show();
    });

    var coord_4326 = proj.transform(coord, "EPSG:3857", "EPSG:4326");

    this.caracteristicsPoint["adresse"] = false;
    this.caracteristicsPoint["position"] = false;

    this.caracteristicsPoint["coord"] =
      coord_4326[0].toFixed(4) + " , " + coord_4326[1].toFixed(4);

    $.post(this.url_prefix + "getLimite", { coord: coord_4326 }, (data) => {
      this.caracteristicsPoint["limites_adm"] = [];
      // this.caracteristicsPoint['departement'] = data.departement
      if (typeof data == "object") {
        for (const key in data) {
          if (data.hasOwnProperty(key) && data[key]) {
            this.caracteristicsPoint["limites_adm"].push({
              nom: key,
              valeur: data[key],
            });
          }
        }
      }

      $("#spinner_loading").hide();

      this.caracteristicsPoint["display"] = true;

      console.log(this.caracteristicsPoint);
    });

    var geocodeOsm =
      "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
      coord_4326[1] +
      "&lon=" +
      coord_4326[0] +
      "&zoom=18&addressdetails=1";
    this.caracteristicsPoint["lieu_dit"] = false;
    $.get(geocodeOsm, (data) => {
      console.log(data);
      var name = data.display_name.split(",")[0];
      var osm_url =
        "https://www.openstreetmap.org/" + data.osm_type + "/" + data.osm_id;
      this.caracteristicsPoint["lieu_dit"] = name;
      this.caracteristicsPoint["url_osm"] = osm_url;
    });
  }

  close_caracteristique() {
    this.caracteristicsPoint["display"] = false;
    $("#coord_caracteristics").hide();
  }

  share(type, couche, sous, group) {
    console.log(type, couche, sous, group);
    if (type == "map") {
      if (sous) {
        var url = couche.key_couche + "," + sous.key + "," + group.id_cartes;
      } else {
        var url = couche.key_couche + ",false," + group.id_cartes;
      }
    } else if (type == "data") {
      if (sous) {
        var url =
          couche.key_couche + "," + sous.key + "," + group.id_thematique;
      } else {
        var url = couche.key_couche + ",false," + group.id_thematique;
      }
    }

    var url_share = this.url_frontend + "/map?share=" + type + "&path=" + url;

    var notif = this.notif.open(url_share, "Partager", {
      duration: 7000,
    });

    notif.onAction().subscribe(() => {
      $("#share_div").show();
      this.url_share = url_share;
      setTimeout(() => {
        $("#share_div").hide();
      }, 5000);

      //this.selectText('simple-snack-bar span')
    });
  }

  shareStateOfMap() {
    function dynamicSort(property) {
      var sortOrder = 1;
      if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
      }
      return function (a, b) {
        var result =
          a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
        return result * sortOrder;
      };
    }
    var urls = [];

    for (var i = 0; i < this.layerInMap.length; i++) {
      if (!this.layerInMap[i].principal && this.layerInMap[i].visible == true) {
        if (
          this.layerInMap[i].type_couche == "requete" ||
          this.layerInMap[i].type_couche == "couche" ||
          this.layerInMap[i].type == "api"
        ) {
          if (this.layerInMap[i].id_sous_cat) {
            var url =
              "data," +
              this.layerInMap[i].id_sous_cat_couche +
              "," +
              this.layerInMap[i].id_sous_cat +
              "," +
              this.layerInMap[i].id_cat;
          } else {
            var url =
              "data," +
              this.layerInMap[i].id_sous_cat_couche +
              ",false" +
              this.layerInMap[i].id_cat;
          }

          urls.push({
            url: url,
            rang: this.layerInMap[i].zIndex_inf,
          });
        } else if (
          this.layerInMap[i].type_couche == "wms" ||
          this.layerInMap[i].type == "wms" ||
          this.layerInMap[i].type == "xyz" ||
          this.layerInMap[i].type == "pdf"
        ) {
          if (this.layerInMap[i].id_sous_cat) {
            if (this.layerInMap[i].typeInf == "sous_cartes_pdf") {
              var url =
                "map," +
                this.layerInMap[i].id_sous_cat_couche +
                "," +
                this.layerInMap[i].id_sous_cat +
                "," +
                this.layerInMap[i].id_cat +
                "," +
                this.layerInMap[i].id;
            } else {
              var url =
                "map," +
                this.layerInMap[i].id_sous_cat_couche +
                "," +
                this.layerInMap[i].id_sous_cat +
                "," +
                this.layerInMap[i].id_cat;
            }
          } else {
            if (this.layerInMap[i].typeInf == "sous_cartes_pdf") {
              var url =
                "map," +
                this.layerInMap[i].id_sous_cat_couche +
                ",false" +
                this.layerInMap[i].id_cat +
                "," +
                this.layerInMap[i].id;
            } else {
              var url =
                "map," +
                this.layerInMap[i].id_sous_cat_couche +
                ",false" +
                this.layerInMap[i].id_cat;
            }
          }
          urls.push({
            url: url,
            rang: this.layerInMap[i].zIndex_inf,
          });
        }
      }
    }
    var urls_classé = urls.sort(dynamicSort("rang"));

    var coord = map.getView().getCenter();
    var location =
      coord[0].toFixed(4) +
      "," +
      coord[1].toFixed(4) +
      "," +
      map.getView().getZoom();

    var url_share =
      this.url_frontend +
      "/map?share=state&nbre=" +
      urls_classé.length +
      "&path=" +
      location;
    for (var index = 0; index < urls_classé.length; index++) {
      url_share = url_share + "&path" + index + "=" + urls_classé[index].url;
    }
    console.log(url_share, urls_classé);
    var notif = this.notif.open(
      url_share.substring(0, 40) + "...",
      "Partager",
      {
        duration: 7000,
      }
    );

    notif.onAction().subscribe(() => {
      $("#share_div").show();
      this.url_share = url_share;
      setTimeout(() => {
        $("#share_div").hide();
      }, 5000);
    });
  }

  displayAllFromStateOfMap() {
    this.activatedRoute.queryParams.subscribe((params) => {
      let share = params["share"];
      let nbre = params["nbre"] - 1;

      if (share == "state") {
        var path_index = 0;

        while (path_index <= nbre) {
          if (params["path" + path_index]) {
            var path = params["path" + path_index].split(",");

            var type_data = path[0];
            var key_couche = path[1];
            var key_sous = path[2];
            var key_groupe = path[3];

            if (type_data == "data") {
              for (var i = 0; i < this.thematiques.length; i++) {
                if (this.thematiques[i].id_thematique == key_groupe) {
                  if (
                    this.thematiques[i].sous_thematiques &&
                    key_sous != false
                  ) {
                    for (
                      var j = 0;
                      j < this.thematiques[i].sous_thematiques.length;
                      j++
                    ) {
                      if (
                        this.thematiques[i].sous_thematiques[j].key == key_sous
                      ) {
                        for (
                          var k = 0;
                          k <
                          this.thematiques[i].sous_thematiques[j].couches
                            .length;
                          k++
                        ) {
                          if (
                            this.thematiques[i].sous_thematiques[j].couches[k]
                              .key_couche == key_couche
                          ) {
                            this.thematiques[i].sous_thematiques[j].couches[
                              k
                            ].checked = true;
                            this.displayDataOnMap(
                              this.thematiques[i].sous_thematiques[j].couches[
                                k
                              ],
                              this.thematiques[i]
                            );
                          }
                        }
                      }
                    }
                  } else {
                    if (this.thematiques[i].id_thematique == key_groupe) {
                      for (
                        var j = 0;
                        j < this.thematiques[i].couches.length;
                        j++
                      ) {
                        if (
                          this.thematiques[i].couches[j].key_couche ==
                          key_couche
                        ) {
                          this.thematiques[i].couches[j].checked = true;
                          this.displayDataOnMap(
                            this.thematiques[i].couches[j],
                            this.thematiques[i]
                          );
                        }
                      }
                    }
                  }
                }
              }
            } else if (type_data == "map") {
              if (path[4]) {
                var id_mapPdf = path[4];
              }

              for (var i = 0; i < this.cartes.length; i++) {
                if (this.cartes[i].id_cartes == key_groupe) {
                  if (this.cartes[i].sous_cartes && key_sous != false) {
                    for (
                      var j = 0;
                      j < this.cartes[i].sous_cartes.length;
                      j++
                    ) {
                      if (this.cartes[i].sous_cartes[j].key == key_sous) {
                        for (
                          var k = 0;
                          k < this.cartes[i].sous_cartes[j].couches.length;
                          k++
                        ) {
                          if (
                            this.cartes[i].sous_cartes[j].couches[k]
                              .key_couche == key_couche &&
                            !id_mapPdf
                          ) {
                            this.cartes[i].sous_cartes[j].couches[k].checked =
                              true;
                            this.displayDataOnMap(
                              this.cartes[i].sous_cartes[j].couches[k],
                              this.cartes[i]
                            );
                          } else if (
                            this.cartes[i].sous_cartes[j].couches[k]
                              .key_couche == key_couche &&
                            id_mapPdf
                          ) {
                            for (
                              var index = 0;
                              index <
                              this.cartes[i].sous_cartes[j].couches[k]
                                .cartes_pdf.length;
                              index++
                            ) {
                              if (
                                this.cartes[i].sous_cartes[j].couches[k]
                                  .cartes_pdf[index]["id"] == id_mapPdf
                              ) {
                                this.cartes[i].sous_cartes[j].couches[
                                  k
                                ].cartes_pdf[index].checked = true;
                                this.displayDataOnMap(
                                  this.cartes[i].sous_cartes[j].couches[k]
                                    .cartes_pdf[index],
                                  this.cartes[i]
                                );
                              }
                            }
                          }
                        }
                      }
                    }
                  } else {
                    for (var j = 0; j < this.cartes[i].couches.length; j++) {
                      if (
                        this.cartes[i].couches[j].key_couche == key_couche &&
                        !id_mapPdf
                      ) {
                        this.cartes[i].couches[j].checked = true;
                        this.displayDataOnMap(
                          this.cartes[i].couches[j],
                          this.cartes[i]
                        );
                      } else if (
                        this.cartes[i].couches[j].key_couche == key_couche &&
                        id_mapPdf
                      ) {
                        for (
                          var index = 0;
                          index < this.cartes[i].couches[j].cartes_pdf.length;
                          index++
                        ) {
                          if (
                            this.cartes[i].couches[j].cartes_pdf[index]["id"] ==
                            id_mapPdf
                          ) {
                            this.cartes[i].couches[j].cartes_pdf[
                              index
                            ].checked = true;
                            this.displayDataOnMap(
                              this.cartes[i].couches[j].cartes_pdf[index],
                              this.cartes[i]
                            );
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (path_index == nbre) {
            var location = params["path"].split(",");
            console.log(location, location[2]);
            this.data_right_click["coord"] = [
              parseFloat(location[0]),
              parseFloat(location[1]),
            ];
            map.getView().setZoom(parseFloat(location[2]));
            map.getView().setCenter(this.data_right_click["coord"]);
            this.getCarateristics();
          }
          path_index++;
        }
      }
    });
  }

  shareMapPdf(mapPdf) {
    console.log(mapPdf);
    if (mapPdf.id_sous_cat) {
      var url =
        mapPdf.id_sous_cat_couche +
        "," +
        mapPdf.id_sous_cat +
        "," +
        mapPdf.id_cat +
        "," +
        mapPdf.id;
    } else {
      var url =
        mapPdf.id_sous_cat_couche + ",false" + mapPdf.id_cat + "," + mapPdf.id;
    }

    var url_share = this.url_frontend + "/map?share=map" + "&path=" + url;

    var notif = this.notif.open(url_share, "Partager", {
      duration: 7000,
    });

    notif.onAction().subscribe(() => {
      $("#share_div").show();
      this.url_share = url_share;
      setTimeout(() => {
        $("#share_div").hide();
      }, 5000);
    });
  }

  shareFeature(feature) {
    var url_share = this.communicationComponent.getUrlShareFeature(feature);

    var notif = this.notif.open(url_share, "Partager", {
      duration: 10000,
    });

    notif.onAction().subscribe(() => {
      $("#share_div").show();
      this.url_share = url_share;
      setTimeout(() => {
        $("#share_div").hide();
      }, 5000);
    });
  }

  undescore2space(donne): any {
    return donne.replace(/_/g, " ");
  }

  space2underscore(donne): any {
    return donne.replace(/ /g, "_");
  }

  constructMapBind() {
    for (var i = 0; i < this.cartes.length; i++) {
      if (this.cartes[i].sous_cartes) {
        for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
          for (
            var k = 0;
            k < this.cartes[i].sous_cartes[j].couches.length;
            k++
          ) {
            if (this.cartes[i].sous_cartes[j].couches[k].principal) {
              var target =
                "map" +
                this.cartes[i].sous_cartes[j].couches[k].key_couche +
                "true" +
                this.cartes[i].sous_cartes[j].key;
              // this.cartes[i].sous_cartes[j].couches[k]['constructMapBind'] = true
              this.displayDataOfBindOnMap(
                this.cartes[i].sous_cartes[j].couches[k],
                target
              );
            }
          }
        }
      } else {
        for (var j = 0; j < this.cartes[i].couches.length; j++) {
          if (this.cartes[i].couches[j].principal) {
            var target =
              "map" +
              this.cartes[i].couches[j].key_couche +
              "false" +
              this.cartes[i].id_cartes;
            // this.cartes[i].couches[j]['constructMapBind'] = true
            this.displayDataOfBindOnMap(this.cartes[i].couches[j], target);
          }
        }
      }
    }
  }

  zoom(type) {
    if (type == "plus") {
      map.getView().setZoom(map.getView().getZoom() + 1);
    } else {
      map.getView().setZoom(map.getView().getZoom() - 1);
    }
  }

  zoomToExtent() {
    map.removeInteraction(this.draw);
    this.deZoomToExtentStatus = false;

    if (!this.zoomToExtentStatus) {
      this.draw = new interaction.DragBox({});

      map.addInteraction(this.draw);

      var sourceZoom = new source.Vector();

      var vector = new layer.Vector({
        source: sourceZoom,
      });

      this.draw.on("boxend", (evt) => {
        var geom = evt.target.getGeometry();
        var feat = new Feature({ geometry: geom });
        sourceZoom.addFeature(feat);

        var src = vector.getSource();
        var extent = vector.getSource().getExtent();

        map.getView().fit(extent, { size: map.getSize() });

        src.clear();
      });

      this.zoomToExtentStatus = true;
    } else {
      map.removeInteraction(this.draw);
      this.zoomToExtentStatus = false;
    }
  }

  deZoomToExtent() {
    map.removeInteraction(this.draw);
    this.zoomToExtentStatus = false;

    if (!this.deZoomToExtentStatus) {
      this.draw = new interaction.DragBox({});

      map.addInteraction(this.draw);

      var sourceZoom = new source.Vector();

      var vector = new layer.Vector({
        source: sourceZoom,
      });

      this.draw.on("boxend", (evt) => {
        var geom = evt.target.getGeometry();
        var feat = new Feature({ geometry: geom });
        sourceZoom.addFeature(feat);

        var src = vector.getSource();
        var extent = vector.getSource().getExtent();

        map.getView().setZoom(map.getView().getZoom() - 1);

        src.clear();
      });

      this.deZoomToExtentStatus = true;
    } else {
      map.removeInteraction(this.draw);
      this.deZoomToExtentStatus = false;
    }
  }

  openModalComment() {
    const dialogRef = this.dialog.open(commentComponent, {
      // width: '60%',
      // height: '80%',
      minWidth: "350px",
    });

    dialogRef.afterClosed().subscribe((data_result) => {
      if (data_result && data_result["statut"]) {
        var result = data_result["data"];
        $("#spinner_loading").show();

        var donne = {
          data: [],
          coordinates: this.data_right_click["coord"],
          table: "tourisme_loisirs_commentaires",
          shema: "tourisme_et_loisirs",
          geom: "Point",
        };

        donne.data[0] = {
          ind: "nom",
          val: result.nom,
        };

        donne.data[1] = {
          ind: "email",
          val: result.email,
        };

        donne.data[2] = {
          ind: "description",
          val: result.description,
        };

        donne.data[3] = {
          ind: "date",
          val: new Date(),
        };
        console.log(result, donne);

        this.geoportailService.addEntite(donne).then((data: Object[]) => {
          $("#spinner_loading").hide();
          console.log(data);

          this.translate.get("notifications").subscribe((res: any) => {
            var notif = this.notif.open(res.comment_added, "Fermer", {
              duration: 3000,
            });
          });
        });
      }
    });
  }

  openModal(type) {
    const dialogRef = this.dialog.open(modalComponent, {
      width: "400px",
      data: { type: type },
    });

    dialogRef.afterClosed().subscribe((modal_result) => {
      if (modal_result.statut) {
        var result = modal_result["data"];

        if (result.projection == "WGS84") {
          var coord_wgs84 = [];
          coord_wgs84[0] = parseFloat(result.longitude);
          coord_wgs84[1] = parseFloat(result.latitude);
          var coord = proj.transform(
            [coord_wgs84[0], coord_wgs84[1]],
            "EPSG:4326",
            "EPSG:3857"
          );

          console.log(coord);

          var point_geojson = turf.point(coord);
          var bbox_cam = turf.bboxPolygon(this.extent_cameroun);
          var bbox_point = turf.bboxPolygon(turf.bbox(point_geojson));
          //console.log(point_geojson,bbox_cam)
          var bool = turf.booleanContains(bbox_cam, point_geojson);
          if (bool) {
            map.setView(
              new View({
                center: coord,
                zoom: 17,
              })
            );

            $("#setCoordOverlay").show();
            var setCoordOverlay = new Overlay({
              position: coord,
              element: document.getElementById("setCoordOverlay"),
            });

            map.addOverlay(setCoordOverlay);

            $("#setCoordOverlay").on("mousemove", (evt) => {
              $("#setCoordOverlay i").show();
            });

            $("#setCoordOverlay").on("mouseout", (evt) => {
              $("#setCoordOverlay i").hide();
            });
          } else {
            var notif = this.notif.open(
              "Vos coordonnées sont en déhors du Cameroun",
              "Fermer",
              {
                duration: 2000,
              }
            );
          }
        }
      }
    });
  }

  close_setCoordOverlay() {
    $("#setCoordOverlay").hide();
  }

  rollBack() {
    this.updateStory = false;
    if (this.pos != 0) {
      this.pos--;
      map
        .getView()
        .setCenter([
          this.centerStory[this.pos][0],
          this.centerStory[this.pos][1],
        ]);
      var tr = map.getView().setZoom(this.zoomStory[this.pos]);
      if (tr != null) this.updateStory = true;
    } else {
      this.updateStory = true;
    }
  }

  globalView() {
    map
      .getView()
      .fit(this.extent_cameroun, { size: map.getSize(), duration: 1000 });
  }

  rollFront() {
    this.updateStory = false;
    var len = this.zoomStory.length;
    if (this.pos != len - 1) {
      this.pos++;
      map
        .getView()
        .setCenter([
          this.centerStory[this.pos][0],
          this.centerStory[this.pos][1],
        ]);
      var tr = map.getView().setZoom(this.zoomStory[this.pos]);
      if (tr != null) this.updateStory = true;
    } else {
      this.updateStory = true;
    }
  }

  menuActif = "thematiques";
  openMenu(type) {
    var execute = (type) => {
      this.menuActif = type;
      if (type == "cartes") {
        this.constructMapBind();
      }
    };

    this.toggle_left("");
    console.log(this.sidenav1.opened);
    if (!this.sidenav1.opened) {
      setTimeout(() => {
        this.toggle_left("");
        execute(type);
      }, 200);
    } else {
      execute(type);
    }
  }
  groupMenuActive_color = "#fff";
  slideTo(typeMenu, data, sous_type_for_icon?: string): any {
    this.typeMenu = typeMenu;

    if (this.typeMenu == "menuCarte") {
      data["sous_type_for_icon"] = sous_type_for_icon;
      this.groupMenuActive = data;
      this.groupMenuActive_color = this.environment.primaryColor;
      document.getElementsByClassName("slide2")[0].scrollTop = 0;

      var derniere_position_de_scroll_connue = 0;
      var ticking = false;

      var faitQuelquechose = function (position_scroll) {
        var height =
          $(".header_bar").height() + $(".title_rollback_slide2").height();
        for (
          var i = 0;
          i < document.getElementsByClassName("sous_themes_cartes").length;
          i++
        ) {
          if (
            document
              .getElementsByClassName("sous_themes_cartes")
              [i].getBoundingClientRect().top -
              (height + $(".sous_themes_cartes").height()) <
            3
          ) {
            document.getElementsByClassName("sous_themes_cartes")[i].className =
              "sous_themes_cartes_active";

            if (
              document.getElementsByClassName("sous_themes_cartes_active")
                .length > 1
            ) {
              document.getElementsByClassName(
                "sous_themes_cartes_active"
              )[0].className = "sous_themes_cartes";
            }
            var rang = document
              .getElementsByClassName("sous_themes_cartes_active")[0]
              .id.split("_")[1];

            document.getElementsByClassName("sous_themes_cartes_active")[0][
              "style"
            ]["top"] = height - 5 + "px";
          }
        }

        for (
          var i = 0;
          i < document.getElementsByClassName("sous_themes_block").length;
          i++
        ) {
          if (
            document
              .getElementsByClassName("sous_themes_block")
              [i].getBoundingClientRect().top >
            height + $(".sous_themes_cartes").height()
          ) {
            var rang = document
              .getElementsByClassName("sous_themes_block")
              [i].id.split("_")[1];

            document.getElementById("sousthemescartes_" + rang).className =
              "sous_themes_cartes";
          }
        }
      };

      document
        .getElementsByClassName("slide2")[0]
        .addEventListener("scroll", (e) => {
          derniere_position_de_scroll_connue =
            document.getElementsByClassName("slide2")[0].scrollTop;

          if (!ticking) {
            window.requestAnimationFrame(() => {
              faitQuelquechose(derniere_position_de_scroll_connue);

              ticking = false;
            });
          }
          ticking = true;
        });
    } else if (this.typeMenu == "menuThematique") {
      console.log(data);
      for (let index = 0; index < data.sous_thematiques.length; index++) {
        data.sous_thematiques[index]["activated"] = true;
        // const element = array[index];
      }
      this.groupMenuActive_color = data["color"];
      this.groupMenuActive = data;
    } else if (this.typeMenu == "analyse_spatial") {
      this.groupMenuActive = {
        nom: "Telechargement des données",
      };
    }
    if (!this.opened_left || this.opened_left == undefined) {
      this.toggle_left("");
    }

    $(".slide2").css("left", "40px");
    $(".title_rollback_slide2").css("left", "45px");
    $(".slide2").css("bottom", "0px");
    // $('.mat-drawer').css('overflow-y', 'inherit');
    // $('.slide2').css('overflow-y', 'initial');
  }

  slide2_is_open() {
    // console.log(document.getElementsByClassName('slide2')[0]['style']['left'] == "0px")
    if (
      document.getElementsByClassName("slide2")[0]["style"]["left"] == "40px"
    ) {
      return true;
    } else {
      return false;
    }
  }
  slideBack(): any {
    $(".slide2").css("left", "-270px");
    $(".title_rollback_slide2").css("left", "-300px");
    $(".sous_themes_cartes_active").css("position", "unset");
    // $('.mat-drawer').css('overflow-y', 'auto');
  }

  hexToRgb(hex): any {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  drawToolsFunction(type): any {
    var rgb = this.hexToRgb(this.primaryColor);

    map.removeInteraction(this.draw);

    if (this.type_edit_draw != undefined) {
      this.EditDraw(this.type_edit_draw);
    }

    if (this.type_draw != type) {
      this.type_draw = type;

      if (type == "text") {
        var source_text = new source.Vector();

        var vector_text = new layer.Vector({
          source: source_text,
        });

        this.draw = new interaction.Draw({
          source: source_text,
          type: "Point",
          style: new style.Style({
            stroke: new style.Stroke({
              color: this.primaryColor,
              width: 4,
            }),
            image: new style.Circle({
              radius: 5,
              stroke: new style.Stroke({
                color: this.primaryColor,
              }),
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.1],
              }),
            }),
          }),
        });
        map.addInteraction(this.draw);

        this.draw.on("drawend", (e) => {
          var id = this.count_draw[type].length;
          var geom = e.feature.getGeometry().getCoordinates();
          var coord = geom;

          this.commentBox.setPosition(coord);

          $("#text-comment").val(null);
          $("#text-comment").data("id", id);
          $("#text-comment").data("type", type);
          $("#text-comment").data("coord", coord);

          $("#comment").show();
        });
      } else {
        this.draw = new interaction.Draw({
          source: this.source_draw,
          type: type,
          style: new style.Style({
            stroke: new style.Stroke({
              color: this.primaryColor,
              width: 4,
            }),
            image: new style.Circle({
              radius: 5,
              stroke: new style.Stroke({
                color: this.primaryColor,
              }),
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.1],
              }),
            }),
          }),
        });

        map.addInteraction(this.draw);

        this.draw.on("drawend", (e) => {
          var id = this.count_draw[type].length;
          var geom = e.feature.getGeometry().getCoordinates();

          if (type == "Point") {
            var coord = geom;
          } else if (type == "Polygon") {
            var coord = geom[0][1];
          } else {
            var coord = geom[0];
          }

          this.commentBox.setPosition(coord);
          $("#comment").show();
          $("#text-comment").val(null);
          $("#text-comment").data("id", id);
          $("#text-comment").data("type", type);

          var feature = e.feature;
          feature.set("descripion", "");
          feature.set("type", type);
          feature.set("id", id);

          feature.setStyle(
            new style.Style({
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.1],
              }),
              stroke: new style.Stroke({
                color: this.primaryColor,
                width: 4,
              }),
              image: new style.Circle({
                radius: 6,
                fill: new style.Fill({
                  color: this.primaryColor,
                }),
              }),
            })
          );

          this.count_draw[type].push({
            id: id,
            comment: null,
            type: type,
            geometry: geom,
            hexa_code: this.primaryColor,
          });
        });
      }
    } else {
      this.type_draw = undefined;

      $("#comment").hide();
    }
  }

  saveComment_draw(comment) {
    var id = $("#text-comment").data("id");
    var type = $("#text-comment").data("type");

    if (type == "text") {
      var feature;
      for (var i = 0; i < this.source_draw.getFeatures().length; i++) {
        if (
          this.source_draw.getFeatures()[i].get("id") == id &&
          this.source_draw.getFeatures()[i].get("type") == type
        ) {
          feature = this.source_draw.getFeatures()[i];
          var color = this.count_draw[type][id].hexa_code;
          this.count_draw[type][id].comment = comment;
          feature.set("descripion", comment);
          feature.setStyle(
            new style.Style({
              image: new style.Circle({
                radius: 1,
                stroke: new style.Stroke({
                  color: color,
                }),
              }),
              text: new style.Text({
                font: "bold 18px Calibri,sans-serif",
                fill: new style.Fill({
                  color: color,
                }),
                text: comment,
                stroke: new style.Stroke({ color: "#fff", width: 2 }),
              }),
            })
          );
        }
      }

      if (!feature) {
        var coord = $("#text-comment").data("coord");

        feature = new Feature({
          geometry: new geom.Point(coord),
        });

        feature.set("descripion", comment);
        feature.set("type", "text");
        feature.set("id", id);

        feature.setStyle(
          new style.Style({
            image: new style.Circle({
              radius: 1,
              stroke: new style.Stroke({
                color: this.primaryColor,
              }),
            }),
            text: new style.Text({
              font: "bold 18px Calibri,sans-serif",
              fill: new style.Fill({
                color: this.primaryColor,
              }),
              text: comment,
              stroke: new style.Stroke({ color: "#fff", width: 2 }),
            }),
          })
        );

        this.source_draw.addFeatures([feature]);

        this.count_draw[type].push({
          id: id,
          comment: comment,
          type: type,
          geometry: coord,
          hexa_code: this.primaryColor,
        });
      }
    }

    this.count_draw[type][id]["comment"] = comment;

    $("#comment").hide();
  }

  closeComment_draw() {
    $("#comment").hide(); //simple-snack-bar span
  }

  selectText(containerid) {
    if (Document["selection"]) {
      // IE
      var range = Object.create(document.body).createTextRange();
      range.moveToElementText(document.querySelector(containerid));
      range.select();
    } else if (window.getSelection) {
      var range1 = document.createRange();
      range1.selectNode(document.querySelector(containerid));
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range1);
    }
    document.execCommand("copy");
  }

  toogleEditDraw() {
    if (this.source_draw.getFeatures().length == 0 && !this.edit_draw_button) {
      var notif = this.notif.open("Vous n'avez aucun dessin", "Fermer", {
        duration: 2500,
      });

      notif.onAction().subscribe(() => {
        console.log("The snack-bar action was triggered!");
      });
    } else {
      if (this.edit_draw_button) {
        map.removeInteraction(this.select);
        map.removeInteraction(this.modify);

        if (this.type_edit_draw != undefined) {
          this.EditDraw(this.type_edit_draw);
        }

        this.type_edit_draw = undefined;
        $("#comment").hide();
        $("#colorPicker").hide();
      } else {
        map.removeInteraction(this.draw);

        if (this.type_draw != undefined) {
          this.drawToolsFunction(this.type_draw);
        }
      }

      this.edit_draw_button = !this.edit_draw_button;
    }
  }

  EditDraw(type) {
    map.removeInteraction(this.select);
    map.removeInteraction(this.modify);

    if (this.type_draw != undefined) {
      this.drawToolsFunction(this.type_draw);
    }

    var id;
    var color;
    var type_geom;

    if (this.count_draw["Point"].length > 0) {
      for (var i = 0; i < this.count_draw["Point"].length; i++) {
        if (this.count_draw["Point"][i].modeEdit) {
          id = this.count_draw["Point"][i].id;
          color = this.count_draw["Point"][i].hexa_code;
          this.count_draw["Point"][i].modeEdit = false;
          type_geom = "Point";
        }
      }
    }

    if (this.count_draw["LineString"].length > 0) {
      for (var i = 0; i < this.count_draw["LineString"].length; i++) {
        if (this.count_draw["LineString"][i].modeEdit) {
          id = this.count_draw["LineString"][i].id;
          color = this.count_draw["LineString"][i].hexa_code;
          this.count_draw["LineString"][i].modeEdit = false;
          type_geom = "LineString";
        }
      }
    }

    if (this.count_draw["Polygon"].length > 0) {
      for (var i = 0; i < this.count_draw["Polygon"].length; i++) {
        if (this.count_draw["Polygon"][i].modeEdit) {
          id = this.count_draw["Polygon"][i].id;
          color = this.count_draw["Polygon"][i].hexa_code;
          this.count_draw["Polygon"][i].modeEdit = false;
          type_geom = "Polygon";
        }
      }
    }

    if (this.count_draw["text"].length > 0) {
      for (var i = 0; i < this.count_draw["text"].length; i++) {
        if (this.count_draw["text"][i].modeEdit) {
          id = this.count_draw["text"][i].id;
          color = this.count_draw["text"][i].hexa_code;
          this.count_draw["text"][i].modeEdit = false;
          type_geom = "text";
        }
      }
    }

    if (color) {
      var rgb = this.hexToRgb(color);

      map.getLayers().forEach(function (leyer) {
        if (leyer.get("name") == "draw") {
          for (var i = 0; i < leyer.get("source").getFeatures().length; i++) {
            if (
              leyer.get("source").getFeatures()[i].get("id") == id &&
              leyer.get("source").getFeatures()[i].get("type") == type_geom
            ) {
              if (leyer.get("source").getFeatures()[i].get("type") == "text") {
                leyer
                  .get("source")
                  .getFeatures()
                  [i].setStyle(
                    new style.Style({
                      fill: new style.Fill({
                        color: [rgb.r, rgb.g, rgb.b, 0.1],
                      }),
                      stroke: new style.Stroke({
                        color: color,
                        width: 4,
                      }),
                      image: new style.Circle({
                        radius: 1,
                        fill: new style.Fill({
                          color: color,
                        }),
                      }),
                      text: new style.Text({
                        font: "bold 18px Calibri,sans-serif",
                        fill: new style.Fill({
                          color: color,
                        }),
                        text: leyer
                          .get("source")
                          .getFeatures()
                          [i].get("descripion"),
                        stroke: new style.Stroke({ color: "#fff", width: 2 }),
                      }),
                    })
                  );
              } else {
                leyer
                  .get("source")
                  .getFeatures()
                  [i].setStyle(
                    new style.Style({
                      fill: new style.Fill({
                        color: [rgb.r, rgb.g, rgb.b, 0.1],
                      }),
                      stroke: new style.Stroke({
                        color: color,
                        width: 4,
                      }),
                      image: new style.Circle({
                        radius: 6,
                        fill: new style.Fill({
                          color: color,
                        }),
                      }),
                    })
                  );
              }
            }
          }
        }
      });
    }

    if (this.type_edit_draw != type) {
      if (type == "geometry") {
        this.select = new interaction.Select({
          wrapX: false,
          style: new style.Style({
            stroke: new style.Stroke({
              color: "#F9B70F",
              width: 4,
            }),
            image: new style.Circle({
              radius: 11,
              fill: new style.Fill({
                color: "#E40E2F",
              }),
            }),
          }),
        });

        this.modify = new interaction.Modify({
          features: this.select.getFeatures(),
          style: new style.Style({
            stroke: new style.Stroke({
              color: "#F9B70F",
              width: 4,
            }),
            image: new style.Circle({
              radius: 6,
              fill: new style.Fill({
                color: "#E40E2F",
              }),
            }),
          }),
        });

        map.addInteraction(this.select);
        map.addInteraction(this.modify);

        this.modify.once("modifystart", function (e) {});

        this.modify.on("modifyend", (e) => {
          e.features.forEach((feature) => {
            this.count_draw[feature.get("type")][feature.get("id")].geometry =
              feature.getGeometry().getCoordinates();
          });
        });

        this.select.on("select", (e) => {
          //console.log(78,this.select.getFeatures().getArray())
          // this.select.setActive(false)

          var id;
          var color;
          var type_geom;

          if (this.count_draw["Point"].length > 0) {
            for (var i = 0; i < this.count_draw["Point"].length; i++) {
              if (this.count_draw["Point"][i].modeEdit) {
                id = this.count_draw["Point"][i].id;
                color = this.count_draw["Point"][i].hexa_code;
                this.count_draw["Point"][i].modeEdit = false;
                type_geom = "Point";
              }
            }
          }

          if (this.count_draw["LineString"].length > 0) {
            for (var i = 0; i < this.count_draw["LineString"].length; i++) {
              if (this.count_draw["LineString"][i].modeEdit) {
                id = this.count_draw["LineString"][i].id;
                color = this.count_draw["LineString"][i].hexa_code;
                this.count_draw["LineString"][i].modeEdit = false;
                type_geom = "LineString";
              }
            }
          }

          if (this.count_draw["Polygon"].length > 0) {
            for (var i = 0; i < this.count_draw["Polygon"].length; i++) {
              if (this.count_draw["Polygon"][i].modeEdit) {
                id = this.count_draw["Polygon"][i].id;
                color = this.count_draw["Polygon"][i].hexa_code;
                this.count_draw["Polygon"][i].modeEdit = false;
                type_geom = "Polygon";
              }
            }
          }

          if (this.count_draw["text"].length > 0) {
            for (var i = 0; i < this.count_draw["text"].length; i++) {
              if (this.count_draw["text"][i].modeEdit) {
                id = this.count_draw["text"][i].id;
                color = this.count_draw["text"][i].hexa_code;
                this.count_draw["text"][i].modeEdit = false;
                type_geom = "text";
              }
            }
          }

          if (color) {
            var rgb = this.hexToRgb(color);

            map.getLayers().forEach(function (leyer) {
              if (leyer.get("name") == "draw") {
                for (
                  var i = 0;
                  i < leyer.get("source").getFeatures().length;
                  i++
                ) {
                  if (
                    leyer.get("source").getFeatures()[i].get("id") == id &&
                    leyer.get("source").getFeatures()[i].get("type") ==
                      type_geom
                  ) {
                    if (
                      leyer.get("source").getFeatures()[i].get("type") == "text"
                    ) {
                      leyer
                        .get("source")
                        .getFeatures()
                        [i].setStyle(
                          new style.Style({
                            fill: new style.Fill({
                              color: [rgb.r, rgb.g, rgb.b, 0.1],
                            }),
                            stroke: new style.Stroke({
                              color: color,
                              width: 4,
                            }),
                            image: new style.Circle({
                              radius: 1,
                              fill: new style.Fill({
                                color: color,
                              }),
                            }),
                            text: new style.Text({
                              font: "bold 18px Calibri,sans-serif",
                              fill: new style.Fill({
                                color: color,
                              }),
                              text: leyer
                                .get("source")
                                .getFeatures()
                                [i].get("descripion"),
                              stroke: new style.Stroke({
                                color: "#fff",
                                width: 2,
                              }),
                            }),
                          })
                        );
                    } else {
                      leyer
                        .get("source")
                        .getFeatures()
                        [i].setStyle(
                          new style.Style({
                            fill: new style.Fill({
                              color: [rgb.r, rgb.g, rgb.b, 0.1],
                            }),
                            stroke: new style.Stroke({
                              color: color,
                              width: 4,
                            }),
                            image: new style.Circle({
                              radius: 6,
                              fill: new style.Fill({
                                color: color,
                              }),
                            }),
                          })
                        );
                    }
                  }
                }
              }
            });
          }

          for (
            var i = 0;
            i <
            this.count_draw[this.select.getFeatures().getArray()[0].get("type")]
              .length;
            i++
          ) {
            if (
              this.count_draw[
                this.select.getFeatures().getArray()[0].get("type")
              ][i].id == this.select.getFeatures().getArray()[0].get("id")
            ) {
              this.count_draw[
                this.select.getFeatures().getArray()[0].get("type")
              ][i].modeEdit = true;
            }
          }

          this.select
            .getFeatures()
            .getArray()[0]
            .setStyle(
              new style.Style({
                fill: new style.Fill({
                  color: [0, 0, 0, 0.1],
                }),
                stroke: new style.Stroke({
                  color: "#E40E2F",
                  width: 4,
                }),
                image: new style.Circle({
                  radius: 6,
                  fill: new style.Fill({
                    color: "#E40E2F",
                  }),
                }),
              })
            );
        });
      } else if (type == "comment") {
        this.select = new interaction.Select({
          wrapX: false,
          style: new style.Style({
            stroke: new style.Stroke({
              color: "#F9B70F",
              width: 4,
            }),
            image: new style.Circle({
              radius: 11,
              fill: new style.Fill({
                color: "#E40E2F",
              }),
            }),
          }),
        });

        map.addInteraction(this.select);

        this.select.on("select", (e) => {
          console.log(this.select.getFeatures().getArray());
          var type_geom = this.select.getFeatures().getArray()[0].get("type");
          var id = this.select.getFeatures().getArray()[0].get("id");
          var geom = this.select
            .getFeatures()
            .getArray()[0]
            .getGeometry()
            .getCoordinates();

          var comment = this.count_draw[type_geom][id]["comment"];

          if (type_geom == "Point" || type_geom == "text") {
            var coord = geom;
          } else if (type_geom == "Polygon") {
            var coord = geom[0][1];
          } else {
            var coord = geom[0];
          }

          this.commentBox.setPosition(coord);
          $("#comment").show();
          $("#text-comment").val(comment);
          $("#text-comment").data("id", id);
          $("#text-comment").data("type", type_geom);
          $("#text-comment").data("coord", coord);

          console.log($("#comment"));
        });
      } else if (type == "delete") {
        this.select = new interaction.Select({
          wrapX: false,
          style: new style.Style({
            stroke: new style.Stroke({
              color: "#F9B70F",
              width: 4,
            }),
            image: new style.Circle({
              radius: 11,
              fill: new style.Fill({
                color: "#E40E2F",
              }),
            }),
          }),
        });

        map.addInteraction(this.select);

        this.select.on("select", (e) => {
          var type_geom = this.select.getFeatures().getArray()[0].get("type");
          var id = this.select.getFeatures().getArray()[0].get("id");
          var geom = this.select
            .getFeatures()
            .getArray()[0]
            .getGeometry()
            .getCoordinates();

          var comment = this.count_draw[type_geom][id]["comment"];

          this.count_draw[type_geom][id]["visible"] = false;

          this.source_draw.removeFeature(
            this.select.getFeatures().getArray()[0]
          );

          this.select.getFeatures().clear();
        });
      } else if (type == "color") {
        this.select = new interaction.Select({
          wrapX: false,
          style: new style.Style({
            stroke: new style.Stroke({
              color: "#F9B70F",
              width: 4,
            }),
            image: new style.Circle({
              radius: 11,
              fill: new style.Fill({
                color: "#E40E2F",
              }),
            }),
          }),
        });

        map.addInteraction(this.select);

        this.select.on("select", (e) => {
          $("#colorPicker").hide();
          var type_geom = this.select.getFeatures().getArray()[0].get("type");
          var id = this.select.getFeatures().getArray()[0].get("id");
          var geom = this.select
            .getFeatures()
            .getArray()[0]
            .getGeometry()
            .getCoordinates();

          if (type_geom == "Point" || type_geom == "text") {
            var coord = geom;
          } else if (type_geom == "Polygon") {
            var coord = geom[0][1];
          } else {
            var coord = geom[0];
          }

          this.colorDraw = this.count_draw[type_geom][id]["hexa_code"];
          this.colorPickerBox.setPosition(coord);
          $("#colorPicker").show();

          $("#draw-color").data("id", id);
          $("#draw-color").data("type", type_geom);
          $("#draw-color").data("coord", coord);
        });
      }

      this.type_edit_draw = type;
    } else {
      this.type_edit_draw = undefined;
      $("#comment").hide();
      $("#colorPicker").hide();
    }
  }

  saveColorPicker() {
    var id = $("#draw-color").data("id");
    var type = $("#draw-color").data("type");

    for (var i = 0; i < this.source_draw.getFeatures().length; i++) {
      if (
        this.source_draw.getFeatures()[i].get("id") == id &&
        this.source_draw.getFeatures()[i].get("type") == type
      ) {
        var feature = this.source_draw.getFeatures()[i];
        var comment = this.count_draw[type][id].comment;
        var color = this.colorDraw;
        this.count_draw[type][id].hexa_code = color;
        var rgb = this.hexToRgb(color);

        if (type == "text") {
          feature.setStyle(
            new style.Style({
              image: new style.Circle({
                radius: 1,
                stroke: new style.Stroke({
                  color: color,
                }),
              }),
              text: new style.Text({
                font: "bold 18px Calibri,sans-serif",
                fill: new style.Fill({
                  color: color,
                }),
                text: comment,
                stroke: new style.Stroke({ color: "#fff", width: 2 }),
              }),
            })
          );
        } else {
          feature.setStyle(
            new style.Style({
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.1],
              }),
              stroke: new style.Stroke({
                color: color,
                width: 4,
              }),
              image: new style.Circle({
                radius: 6,
                fill: new style.Fill({
                  color: color,
                }),
              }),
            })
          );
        }
      }
    }

    $("#colorPicker").hide();
  }

  closeColorPicker_draw() {
    $("#colorPicker").hide();
  }

  deleteleAllDraw() {
    this.source_draw.clear();
    this.count_draw = {
      Point: [],
      LineString: [],
      Polygon: [],
      text: [],
    };
  }

  downloadAllDraw() {
    const buttonheet_compare = this.bottomSheet.open(buttonsheetComponent, {
      data: { type: "compare", data: this.layerInMap },
    });

    // buttonheet_compare.afterClosed().subscribe(result => {
    //   	console.log('The dialog was closed :',result);
    // });
  }

  displayGeoSignet() {
    if (this.geoSignets.length > 0) {
      const buttonheet_geosi = this.bottomSheet.open(
        buttonsheetGeosiComponent,
        {
          data: { data: this.geoSignets },
        }
      );

      buttonheet_geosi.afterDismissed().subscribe((result) => {
        console.log(result);
        if (!result) {
          //this.modeCompare = false
        } else {
          for (var index = 0; index < this.geoSignets.length; index++) {
            if (this.geoSignets[index]["id"] == parseFloat(result)) {
              var coord = this.geoSignets[index]["coord"];
              var zoom = this.geoSignets[index]["zoom"];
            }
          }

          map.getView().setZoom(zoom + 1);
          map.getView().setCenter(coord);
        }
      });
    } else {
      this.translate.get("choose_signet").subscribe((res: any) => {
        var notif = this.notif.open(res.no_signet, "Fermer", {
          duration: 2500,
        });
      });
    }
  }

  shareAllDraw() {
    var donnes = [];

    for (var i = 0; i < this.count_draw.LineString.length; i++) {
      this.count_draw.LineString[i].geom = {
        type: "LineString",
        coordinates: this.count_draw.LineString[i].geometry,
      };
      if (!this.count_draw.LineString[i].visible) {
        donnes.push(this.count_draw.LineString[i]);
      }
    }

    for (var i = 0; i < this.count_draw.Polygon.length; i++) {
      this.count_draw.Polygon[i].geom = {
        type: "Polygon",
        coordinates: this.count_draw.Polygon[i].geometry,
      };
      if (!this.count_draw.Polygon[i].visible) {
        donnes.push(this.count_draw.Polygon[i]);
      }
    }

    for (var i = 0; i < this.count_draw.Point.length; i++) {
      this.count_draw.Point[i].geom = {
        type: "Point",
        coordinates: this.count_draw.Point[i].geometry,
      };
      if (!this.count_draw.Point[i].visible) {
        donnes.push(this.count_draw.Point[i]);
      }
    }

    for (var i = 0; i < this.count_draw.text.length; i++) {
      this.count_draw.text[i].geom = {
        type: "Point",
        coordinates: this.count_draw.text[i].geometry,
      };
      if (!this.count_draw.text[i].visible) {
        donnes.push(this.count_draw.text[i]);
      }
    }

    console.log(this.count_draw, donnes);

    if (donnes.length > 0) {
      $("#spinner_loading").show();
      this.geoportailService
        .saveDraw({ donnes: donnes })
        .then((data: Object[]) => {
          $("#spinner_loading").hide();

          if (data["status"] == "ok") {
            var url_share =
              this.url_frontend + "/map?share=draw&id=" + data["code_dessin"];

            var notif = this.notif.open(url_share, "Partager", {
              duration: 7000,
            });

            notif.onAction().subscribe(() => {
              $("#share_div").show();
              this.url_share = url_share;
              setTimeout(() => {
                $("#share_div").hide();
              }, 5000);
              //this.selectText('simple-snack-bar span')
            });
          } else {
          }
        });
    } else {
      var notif = this.notif.open("Vous n'avez aucun déssins", "Fermer", {
        duration: 10000,
      });
    }
  }

  displayShareDraw(id) {
    $("#spinner_loading").show();

    this.geoportailService
      .getDraw({ code_dessin: id })
      .then((data: Object[]) => {
        $("#spinner_loading").hide();

        if (data["status"] == "ok") {
          var dessins = {
            point: [],
            polygon: [],
            linestring: [],
            text: [],
          };

          for (var index = 0; index < data["dessins"].length; index++) {
            var element = data["dessins"][index];

            if (element["type_dessin"] == "Point") {
              var i = dessins["point"].length;
              dessins["point"].push("element");
            } else if (element["type_dessin"] == "Polygon") {
              var i = dessins["polygon"].length;
              dessins["polygon"].push(element);
            } else if (element["type_dessin"] == "LineString") {
              var i = dessins["linestring"].length;
              dessins["linestring"].push(element);
            } else if (element["type_dessin"] == "text") {
              var i = dessins["text"].length;
              dessins["text"].push(element);
            }

            var type = element["type_dessin"];
            var primaryColor = element["hexa_code"];
            var rgb = this.hexToRgb(primaryColor);

            var feature = new Format.GeoJSON().readFeature(element.geometry);
            feature.set("descripion", element["descripion"]);
            feature.set("type", type);
            feature.set("id", i);

            if (element["type_dessin"] == "text") {
              feature.setStyle(
                new style.Style({
                  image: new style.Circle({
                    radius: 1,
                    stroke: new style.Stroke({
                      color: primaryColor,
                    }),
                  }),
                  text: new style.Text({
                    font: "bold 18px Calibri,sans-serif",
                    fill: new style.Fill({
                      color: primaryColor,
                    }),
                    text: element["descripion"],
                    stroke: new style.Stroke({ color: "#fff", width: 2 }),
                  }),
                })
              );
            } else {
              feature.setStyle(
                new style.Style({
                  fill: new style.Fill({
                    color: [rgb.r, rgb.g, rgb.b, 0.1],
                  }),
                  stroke: new style.Stroke({
                    color: primaryColor,
                    width: 4,
                  }),
                  image: new style.Circle({
                    radius: 6,
                    fill: new style.Fill({
                      color: primaryColor,
                    }),
                  }),
                })
              );
            }

            this.count_draw[type].push({
              id: i,
              comment: element["descripion"],
              type: type,
              geometry: JSON.parse(element.geometry).coordinates,
              hexa_code: primaryColor,
            });
            this.source_draw.addFeature(feature);
          }

          setTimeout(() => {
            console.log(this.source_draw.getExtent());
            map.getView().fit(this.source_draw.getExtent(), {
              size: map.getSize(),
              duration: 1000,
            });
          }, 5000);

          console.log(this.count_draw);
        } else {
        }
      });
  }

  expansionOpen() {
    if (this.edit_draw_button) {
      map.removeInteraction(this.select);
      map.removeInteraction(this.modify);

      if (this.type_edit_draw != undefined) {
        this.EditDraw(this.type_edit_draw);
      }

      this.type_edit_draw = undefined;
      $("#comment").hide();
      $("#colorPicker").hide();
    } else {
      map.removeInteraction(this.draw);

      if (this.type_draw != undefined) {
        this.drawToolsFunction(this.type_draw);
      }
    }

    if (this.mesure_type != undefined) {
      this.sketch = null;
      this.helpTooltipElement = null;
      this.measureTooltipElement = null;
      map.removeOverlay(this.measureTooltip);
      map.removeOverlay(this.helpTooltip);
      map.removeInteraction(this.draw);
      OBservable.unByKey(this.listener);
      OBservable.unByKey(this.event_mesure);
      this.source_mesure.clear();

      if (document.querySelectorAll(".tooltip.tooltip-static").length > 0) {
        $(".tooltip.tooltip-static").hide();
      }

      this.mesure_type = undefined;
    }
  }

  expansionClose(menu) {
    if (menu == "dessin") {
      if (this.edit_draw_button) {
        map.removeInteraction(this.select);
        map.removeInteraction(this.modify);

        if (this.type_edit_draw != undefined) {
          this.EditDraw(this.type_edit_draw);
        }

        this.type_edit_draw = undefined;
        $("#comment").hide();
        $("#colorPicker").hide();
      } else {
        map.removeInteraction(this.draw);

        if (this.type_draw != undefined) {
          this.drawToolsFunction(this.type_draw);
        }
      }
    } else if (menu == "mesure") {
      if (this.mesure_type != undefined) {
        this.sketch = null;
        this.helpTooltipElement = null;
        this.measureTooltipElement = null;
        map.removeOverlay(this.measureTooltip);
        map.removeOverlay(this.helpTooltip);
        map.removeInteraction(this.draw);
        OBservable.unByKey(this.listener);
        OBservable.unByKey(this.event_mesure);
        this.source_mesure.clear();

        if (document.querySelectorAll(".tooltip.tooltip-static").length > 0) {
          $(".tooltip.tooltip-static").hide();
        }

        this.mesure_type = undefined;
      }
    }
  }

  mesure(type: any): void {
    this.sketch = null;
    map.removeOverlay(this.measureTooltip);
    map.removeOverlay(this.helpTooltip);
    map.removeInteraction(this.draw);
    OBservable.unByKey(this.listener);
    OBservable.unByKey(this.event_mesure);

    if (this.mesure_type != type) {
      if (this.helpTooltipElement) {
        this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
      }

      this.helpTooltipElement = document.createElement("div");
      this.helpTooltipElement.className = "tooltip hidden";
      this.helpTooltip = new Overlay({
        element: this.helpTooltipElement,
        offset: [15, 0],
        positioning: "center-left",
      });

      map.addOverlay(this.helpTooltip);

      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode.removeChild(
          this.measureTooltipElement
        );
      }

      this.measureTooltipElement = document.createElement("div");
      this.measureTooltipElement.className = "tooltip tooltip-measure";
      this.measureTooltip = new Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: "bottom-center",
      });

      map.addOverlay(this.measureTooltip);

      var pointerMoveHandler = (evt) => {
        if (evt.dragging) {
          return;
        }
        /** @type {string} */
        var helpMsg = "Click to start drawing";

        if (this.sketch) {
          var geom = this.sketch.getGeometry();
          if (geom.getType() == "Polygon" || geom.getType() == "Circle") {
            helpMsg = this.continuePolygonMsg;
          } else if (geom.getType() == "LineString") {
            helpMsg = this.continueLineMsg;
          }
        }

        this.helpTooltipElement.innerHTML = helpMsg;
        this.helpTooltip.setPosition(evt.coordinate);

        this.helpTooltipElement.classList.remove("hidden");
      };

      this.event_mesure = map.on("pointermove", pointerMoveHandler);

      map.getViewport().addEventListener("mouseout", () => {
        if (this.mesure_type != type && this.helpTooltipElement) {
          this.helpTooltipElement.classList.add("hidden");
        }
      });

      var formatLength = function (line) {
        if (line.getType() == "Circle") {
          var length: number = line.getRadius();
        } else {
          var length = Sphere.getLength(line);
        }

        var output;
        if (length > 1000) {
          output = Math.round((length / 1000) * 100) / 100 + " " + "km";
        } else {
          output = Math.round(length * 100) / 100 + " " + "m";
        }
        return output;
      };

      var formatArea = function (polygon) {
        var area = Sphere.getArea(polygon);

        var output;
        if (area > 10000) {
          output =
            Math.round((area / 1000000) * 100) / 100 + " " + "km<sup>2</sup>";
        } else {
          output = Math.round(area * 100) / 100 + " " + "m<sup>2</sup>";
        }

        return output;
      };

      this.draw = new interaction.Draw({
        source: this.source_mesure,
        type: type,
        style: new style.Style({
          fill: new style.Fill({
            color: "rgba(255, 255, 255, 0.4)",
          }),
          stroke: new style.Stroke({
            color: "rgba(0, 0, 0, 0.5)",
            lineDash: [10, 10],
            width: 2,
          }),
          image: new style.Circle({
            radius: 5,
            stroke: new style.Stroke({
              color: "rgba(0, 0, 0, 0.7)",
            }),
            fill: new style.Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
          }),
        }),
      });

      this.draw.on("drawstart", (evt) => {
        // set this.sketch
        this.sketch = evt.feature;

        /** @type {Coordinate|undefined} */
        var tooltipCoord = evt.coordinate;

        this.listener = this.sketch.getGeometry().on("change", (evt) => {
          var geom = evt.target;
          var output;
          console.log(evt);
          if (geom.getType() == "Polygon" || geom.getType() == "Circle") {
            if (geom.getType() == "Circle") {
              formatLength;
              output = formatLength(geom);
              tooltipCoord = geom.getCenter();
            } else {
              output = formatArea(geom);
              tooltipCoord = geom.getInteriorPoint().getCoordinates();
            }
          } else if (geom.getType() == "LineString") {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
          }

          this.measureTooltipElement.innerHTML = output;
          this.measureTooltip.setPosition(tooltipCoord);
        });
      });

      this.draw.on("drawend", () => {
        this.measureTooltipElement.className = "tooltip tooltip-static";
        this.measureTooltip.setOffset([0, -7]);
        // unset this.sketch
        this.sketch = null;
        // unset tooltip so that a new one can be created
        this.measureTooltipElement = null;
        if (this.measureTooltipElement) {
          this.measureTooltipElement.parentNode.removeChild(
            this.measureTooltipElement
          );
        }
        this.measureTooltipElement = document.createElement("div");
        this.measureTooltipElement.className = "tooltip tooltip-measure";
        this.measureTooltip = new Overlay({
          element: this.measureTooltipElement,
          offset: [0, -15],
          positioning: "bottom-center",
        });
        map.addOverlay(this.measureTooltip);
        OBservable.unByKey(this.listener);
      });

      map.addInteraction(this.draw);

      this.mesure_type = type;
    } else {
      this.sketch = null;
      this.helpTooltipElement = null;
      this.measureTooltipElement = null;
      map.removeOverlay(this.measureTooltip);
      map.removeOverlay(this.helpTooltip);
      map.removeInteraction(this.draw);
      OBservable.unByKey(this.listener);
      OBservable.unByKey(this.event_mesure);
      this.source_mesure.clear();

      if (document.querySelectorAll(".tooltip.tooltip-static").length > 0) {
        $(".tooltip.tooltip-static").hide();
      }

      this.mesure_type = undefined;
    }
  }

  displayDefaultLayer() {
    for (let index = 0; index < environment.defaultLayers.length; index++) {
      var data = environment.defaultLayers[index];
      var tiles = new layer.Tile({
        source: new source.XYZ({
          url: data.url,
          crossOrigin: "anonymous",
          // attributions: [new Attribution({
          // 	html: " <a  target='_blank'  href='https://www.openstreetmap.org/copyright'> © OpenStreetMap</a>contributors "
          // })]
        }),
      });
      tiles.setZIndex(data.zindex);
      map.addLayer(tiles);
    }
  }

  displayDataOnMap(data, groupe) {
    //console.log(this.cartes,this.thematiques)
    var donne_count = {
      type: "",
    };
    if (data.type == "xyz" && data.typeInf != "sous_cartes_pdf") {
      donne_count.type = "cartes";
      donne_count["id_couche"] = data.key_couche;
      if (this.cartes[data["rang_thema"]].sous_cartes) {
        donne_count["sous"] = true;
      } else {
        donne_count["sous"] = false;
      }
    } else if (
      (data.type_couche == "wms" || data.type == "wms") &&
      data.typeInf != "sous_cartes_pdf"
    ) {
      if (data.type_couche) {
        donne_count.type = "thematiques";
        donne_count["id_couche"] = data.key_couche;

        if (this.thematiques[data["rang_thema"]].sous_thematiques) {
          donne_count["sous"] = true;
        } else {
          donne_count["sous"] = false;
        }
      } else {
        donne_count.type = "cartes";
        donne_count["id_couche"] = data.key_couche;
        if (this.cartes[data["rang_thema"]].sous_cartes) {
          donne_count["sous"] = true;
        } else {
          donne_count["sous"] = false;
        }
      }
    } else if (data.typeInf == "sous_cartes_pdf") {
      donne_count.type = "pdf";
      donne_count["id_couche"] = data.id;
    } else if (
      (data.type_couche == "requete" ||
        data.type_couche == "api" ||
        data.type_couche == "couche") &&
      data.typeInf != "sous_cartes_pdf"
    ) {
      donne_count.type = "thematiques";
      donne_count["id_couche"] = data.key_couche;

      if (this.thematiques[data["rang_thema"]].sous_thematiques) {
        donne_count["sous"] = true;
      } else {
        donne_count["sous"] = false;
      }
    }

    console.log(data, donne_count.type);
    if (donne_count.type != "" && data.checked) {
      console.log(donne_count);

      this.geoportailService
        .addCountVieuwData(donne_count)
        .then((data: Object[]) => {
          console.log(data);
        });
    }

    if (groupe && groupe.shema) {
      data.shema = groupe.shema;
    }

    if (data.checked) {
      var couche_valid = true;
      data.visible = true;
      if (data.bbox) {
        var bbox = data.bbox.split(",");

        var Amin = proj.transform(
          [parseFloat(bbox[0]), parseFloat(bbox[1])],
          "EPSG:4326",
          "EPSG:3857"
        );
        var Amax = proj.transform(
          [parseFloat(bbox[2]), parseFloat(bbox[3])],
          "EPSG:4326",
          "EPSG:3857"
        );

        var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]];
        var a = Extent.boundingExtent([Amin, Amax]);

        map.getView().fit(a, { size: map.getSize(), duration: 1000 });
      }

      if (data.zmin) {
        if (map.getView().getZoom() < data.zmin) {
          map.getView().setZoom(data.zmin);
        }
      }

      if (data.zmax) {
        if (map.getView().getZoom() > data.zmax) {
          map.getView().setZoom(data.zmax);
        }
      }

      if (data.type == "xyz") {
        var tiles = new layer.Tile({
          source: new source.XYZ({
            url: data.url,
            // tileLoadFunction: function (imageTile, src) {
            //      imageTile.getImage().src = src;
            //  },
            crossOrigin: "anonymous",
            attributions: [
              new Attribution({
                html: " <a  target='_blank'  href='https://www.openstreetmap.org/copyright'> © OpenStreetMap</a>contributors ",
              }),
            ],
          }),
        });

        tiles.set("name", this.space2underscore(data.nom));
        tiles.set("type", data.type);
        tiles.set("key_couche", data.key_couche);
        tiles.set("id_cat", data.id_cat);
        tiles.setZIndex(this.zIndexMax++);
        map.addLayer(tiles);

        data.type_couche_inf = "cartes";
        data.zIndex_inf = this.zIndexMax;
      } else if (data.type_couche == "wms" || data.type == "wms") {
        if (data.url != null && data.url != "" && data.url != undefined) {
          data.url = data.url.replace(/ /g, "");
          if (data.type_couche) {
            var type = data.type_couche;
            data.type_couche_inf = "thematiques";
          } else {
            var type = data.type;
            data.type_couche_inf = "cartes";
          }

          if (data.service_wms == null || data.service_wms == true) {
            var wms = new source.TileWMS({
              url: data.url,
              params: { LAYERS: data.identifiant, TILED: true },
              serverType: "mapserver",
              crossOrigin: "anonymous",
            });
            var tiles = new layer.Tile({
              source: wms,
              visible: true,
            });

            if (data.opacity) {
              tiles.setOpacity(data.opacity / 100);
            }

            if (data.interrogeable) {
              console.log(data);
              tiles.set("interrogeable", true);
            } else {
              tiles.set("interrogeable", false);
            }

            tiles.set("name", this.space2underscore(data.nom));
            tiles.set("type", type);
            tiles.set("type_couche_inf", data.type_couche_inf);
            tiles.set("key_couche", data.key_couche);
            tiles.set("id_cat", data.id_cat);
            tiles.setZIndex(this.zIndexMax++);
            map.addLayer(tiles);
          } else {
            var vectorSource = new source.Vector({
              loader: (extent, resolution, projection) => {
                bbox = map.getView().calculateExtent(map.getSize());

                var Amin = proj.transform(
                  [bbox[0], bbox[1]],
                  "EPSG:3857",
                  "EPSG:4326"
                );
                var Amax = proj.transform(
                  [bbox[2], bbox[3]],
                  "EPSG:3857",
                  "EPSG:4326"
                );

                var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]];

                var url_wfs =
                  data.url +
                  "&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&typeName=" +
                  data.identifiant +
                  "&outputFormat=GeoJSON&bbox=" +
                  extend3857.join(",");

                $("#spinner_loading").show();
                this.geoportailService
                  .getUrl(url_wfs)
                  .then((donne: Object[]) => {
                    $("#spinner_loading").hide();

                    var features = new Format.GeoJSON().readFeatures(donne, {
                      dataProjection: "EPSG:4326",
                      featureProjection: "EPSG:3857",
                    });
                    for (var index = 0; index < features.length; index++) {
                      features[index].set(
                        "data",
                        features[index].getProperties()
                      );
                    }
                    vectorSource.addFeatures(features);
                  });
              },
              strategy: loadingstrategy.bbox,
              format: new Format.GeoJSON(),
            });

            var clusterSource = new source.Cluster({
              distance: 80,
              source: vectorSource,
            });

            var rgb = this.hexToRgb(this.primaryColor);

            var styleCache = {};
            var url_prefix = this.url_prefix;
            var LayThe = new layer.Vector({
              source: clusterSource,
              style: function (feature) {
                var size = feature.get("features").length;
                if (size != 1) {
                  var styleDefault = styleCache[size];
                  if (!styleDefault) {
                    styleDefault = new style.Style({
                      image: new style.Circle({
                        radius: 10,
                        stroke: new style.Stroke({
                          color: "#fff",
                          width: 2,
                        }),
                        fill: new style.Fill({
                          color: [rgb.r, rgb.g, rgb.b, 1],
                        }),
                      }),
                      text: new style.Text({
                        text: size.toString(),
                        fill: new style.Fill({
                          color: "#fff",
                        }),
                        font: "10px sans-serif",
                      }),
                    });
                    styleCache[size] = styleDefault;
                  }
                } else {
                  var styleDefaultII = new style.Style({
                    image: new style.Icon({
                      scale: 0.2,
                      src: url_prefix + data.img,
                    }),
                  });

                  return styleDefaultII;
                }

                return styleDefault;
              },
              visible: true,
            });

            var styleCacheCopy = {};
            var LayTheCopy = new layer.Vector({
              source: clusterSource,
              style: function (feature) {
                var size = feature.get("features").length;
                var styleDefault = styleCacheCopy[size];
                if (!styleDefault) {
                  styleDefault = new style.Style({
                    image: new style.Icon({
                      scale: 0.2,
                      src: url_prefix + data.img,
                    }),
                  });

                  styleCacheCopy[size] = styleDefault;
                }

                return styleDefault;
              },
              visible: true,
            });

            LayTheCopy.set("name", this.space2underscore(data.nom));
            LayThe.set("name", this.space2underscore(data.nom));
            LayTheCopy.set("type", "wfs");
            LayThe.set("type", "wfs");
            LayTheCopy.set("type_couche_inf", data.type_couche_inf);
            LayThe.set("type_couche_inf", data.type_couche_inf);
            LayTheCopy.set("key_couche", data.key_couche);
            LayThe.set("key_couche", data.key_couche);
            LayTheCopy.set("id_cat", data.id_cat);
            LayThe.set("id_cat", data.id_cat);
            LayTheCopy.setZIndex(this.zIndexMax++);
            LayThe.setZIndex(this.zIndexMax++);
            map.addLayer(LayTheCopy);
            map.addLayer(LayThe);
          }

          data.zIndex_inf = this.zIndexMax;
        } else {
          couche_valid = false;
          this.notif.open(
            "Cette couche n'a pas encore été completement définie",
            "Fermer",
            {
              duration: 5000,
            }
          );
        }
      } else if (data.type == "pdf" && data.geom) {
        var coord = data.geom.split(",");
        var point = [parseFloat(coord[0]), parseFloat(coord[1])];

        var newMarker = new Feature({
          geometry: new geom.Point(
            proj.transform(
              [parseFloat(coord[0]), parseFloat(coord[1])],
              "EPSG:4326",
              "EPSG:3857"
            )
          ),
          data: data,
        });

        var markerSource = new source.Vector({
          features: [newMarker],
        });

        var LayTheCopy = new layer.Vector({
          source: markerSource,
          style: new style.Style({
            image: new style.Icon({
              // scale: 0.22,
              src: this.url_prefix + data.image_src,
            }),
            text: new style.Text({
              font: "17px Calibri,sans-serif",
              text: data["cartes_pdf"].length.toString(),
              fill: new style.Fill({ color: "#000" }),
              stroke: new style.Stroke({ color: "#000", width: 1 }),
              offsetX: 0,
              offsetY: -5,
              //rotation: rotation
            }),
          }),
          visible: true,
        });

        LayTheCopy.set("name", this.space2underscore(data.nom));
        LayTheCopy.set("type", data.type);
        LayTheCopy.setZIndex(this.zIndexMax++);
        LayTheCopy.set("key_couche", data.key_couche);
        LayTheCopy.set("id_cat", data.id_cat);
        map.addLayer(LayTheCopy);

        var extent = markerSource.getExtent();

        map.getView().fit(extent, { size: map.getSize(), maxZoom: 12 });

        data.type_couche_inf = "cartes";
        data.zIndex_inf = this.zIndexMax;
      } else if (data.type_couche == "requete" && data.status == true) {
        if (data.file_json) {
          $("#spinner_loading").show();
          this.zIndexMax++;

          var url = this.url_prefix + "upload/json/" + data.file_json;
          var post = {
            file: data.file_json,
          };
          this.geoportailService.getJsonFIle(post).then((donne: Object[]) => {
            if (donne.length != 0) {
              this.gestionCarto(data, donne, this.zIndexMax, data.type_couche);
            } else {
              couche_valid = false;
              this.notif.open("Cette couche est vide", "Fermer", {
                duration: 5000,
              });
            }

            $("#spinner_loading").hide();
          });
          data.type_couche_inf = "thematiques";
          data.zIndex_inf = this.zIndexMax;
        } else {
          couche_valid = false;

          this.notif.open(
            "Cette couche n'a pas encore été completement définie",
            "Fermer",
            {
              duration: 5000,
            }
          );
        }
      } else if (data.type_couche == "couche") {
        $("#spinner_loading").show();
        this.zIndexMax++;

        var url =
          this.url_prefix +
          "/api/v1/RestFull/DataJsonApi/" +
          data.shema +
          "/" +
          data.id_couche +
          "";

        this.thematiqueService.GetDataQuery(url).then((donne: Object[]) => {
          if (donne.length != 0) {
            this.gestionCarto(data, donne, this.zIndexMax, data.type_couche);
          } else {
            couche_valid = false;
            this.notif.open("Cette couche est vide", "Fermer", {
              duration: 5000,
            });
          }

          $("#spinner_loading").hide();
        });
        data.type_couche_inf = "thematiques";
        data.zIndex_inf = this.zIndexMax;
      } else if (data.type_couche == "api") {
        this.zIndexMax++;
        $("#spinner_loading").show();
        this.thematiqueService
          .GetDataQuery(data.url)
          .then((donne: Object[]) => {
            this.gestionCarto(data, donne, this.zIndexMax, data.type_couche);
            $("#spinner_loading").hide();
          });

        data.type_couche_inf = "thematiques";
        data.zIndex_inf = this.zIndexMax;
      } else if (data.type == "mappilary") {
        var strokestyle = new style.Style({
          stroke: new style.Stroke({
            color: "rgba(53, 175, 109,0.7)",
            width: 4,
          }),
        });
        //console.log(new source.VectorTile({}))

        var LayTheCopy_vector = new layer.VectorTile();

        var source_vector = new source.VectorTile({
          format: new Format.MVT(),
          tileGrid: tilegrid.createXYZ({ maxZoom: 22 }),
          // tilePixelRatio: 16,
          // opacity: 0.7,
          projection: "EPSG:3857",
          url: "https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt",
        });

        LayTheCopy_vector.setSource(source_vector);

        LayTheCopy_vector.setStyle(strokestyle);

        LayTheCopy_vector.set("name", this.space2underscore(data.nom));
        LayTheCopy_vector.set("type", data.type);
        LayTheCopy_vector.setZIndex(this.zIndexMax++);
        map.addLayer(LayTheCopy_vector);

        data.type_couche_inf = "mappilary";
        data.zIndex_inf = this.zIndexMax;
      } else {
        couche_valid = false;
        this.notif.open("Cette couche est en cours de définition", "Fermer", {
          duration: 5000,
        });
      }

      if (couche_valid) {
        if (
          this.layerInMap.length < 3 &&
          this.layerInMap.length != 0 &&
          document.documentElement.clientWidth >= 767 &&
          !this.opened_right
        ) {
          this.toggle_right(0, "");
        }

        data.index_inf = this.layerInMap.length;
        this.layerInMap.push(data);
      } else {
        data.checked = false;
      }
    } else {
      if (this.layerInCompare.length != 0) {
        for (var i = 0; i < this.layerInCompare.length; i++) {
          if (
            this.space2underscore(this.layerInCompare[i].nom) ==
            this.space2underscore(data.nom)
          ) {
            this.closeModeCompare();
          }
        }
      }

      if (
        this.modeMappilary &&
        this.space2underscore(data.nom) == "mappilary"
      ) {
        this.modeMappilary = false;
      }

      for (var i = 0; i < this.layerInMap.length; i++) {
        if (
          this.space2underscore(this.layerInMap[i].nom) ==
          this.space2underscore(data.nom)
        ) {
          //this.layerInMap[i].checked = false
          var zindex = this.layerInMap[i].zIndex_inf;
          this.layerInMap.splice(i, 1);
        }
      }

      data.visible = false;

      var lay = [];
      map.getLayers().forEach((layer) => {
        if (layer.get("name") == this.space2underscore(data.nom)) {
          lay.push(layer);
          //layer.setVisible(false)
        }

        if (
          layer.get("type") == "mappilaryPoint" &&
          this.space2underscore(data.nom) == "mappilary"
        ) {
          lay.push(layer);
        }

        if (
          data.name_analyse &&
          this.space2underscore(data.name_analyse) == layer.get("name") &&
          layer.get("type") == "analyse_spatiale"
        ) {
          lay.push(layer);
          document.getElementById(data.name_analyse).parentElement["style"][
            "display"
          ] = "none";
          console.log(lay);
        }
      });

      for (var i = 0; i < lay.length; i++) {
        map.removeLayer(lay[i]);
      }

      map.getLayers().forEach((layer) => {
        layer.setZIndex(layer.getZIndex() - 1);
      });

      var z = [];
      for (var i = 0; i < this.layerInMap.length; i++) {
        if (this.layerInMap[i].zIndex_inf > zindex) {
          this.layerInMap[i].zIndex_inf = this.layerInMap[i].zIndex_inf - 1;
        }

        z.push(this.layerInMap[i].zIndex_inf);
      }

      var max = z.reduce(function (a, b) {
        return Math.max(a, b);
      });

      this.zIndexMax = max;
    }
  }

  displayDataOfBindOnMap(data, target1) {
    // console.log('#' + target1 + ' .ol-viewport',$('#' + target1 + ' .ol-viewport'))

    // if ($('#' + target1 + ' .ol-viewport')) {

    setTimeout(() => {
      $("#" + target1).empty();
      if (data.type == "xyz") {
        var mapGhost = new Map({
          target: target1,
          controls: [],
          view: view,
        });

        console.log($("#" + target1), 2);
        var tiles = new layer.Tile({
          source: new source.XYZ({
            url: data.url,
            // tileLoadFunction: function (imageTile, src) {
            //      imageTile.getImage().src = src;
            //  },
            crossOrigin: "anonymous",
          }),
        });
        tiles.set("name", this.space2underscore(data.nom));
        mapGhost.addLayer(tiles);
      } else if (data.type_couche == "wms" || data.type == "wms") {
        var mapGhost = new Map({
          target: target1,
          controls: [],
          view: view,
        });

        var wms = new source.TileWMS({
          url: data.url,
          params: { LAYERS: data.identifiant, TILED: true },
          serverType: "mapserver",
          crossOrigin: "anonymous",
        });
        var tiles = new layer.Tile({
          source: wms,
          visible: true,
        });

        tiles.set("name", this.space2underscore(data.nom));
        mapGhost.addLayer(tiles);
      }
    }, 3000);
    // }
  }

  toogleVisibilityLayer(data) {
    console.log(data);

    if (data.visible) {
      map.getLayers().forEach((layer) => {
        if (layer.get("name") == this.space2underscore(data.nom)) {
          //map.removeLayer(layer)
          layer.setVisible(false);
        }

        if (
          layer.get("type") == "mappilaryPoint" &&
          this.space2underscore(data.nom) == "mappilary"
        ) {
          layer.setVisible(false);
        }

        if (
          data.name_analyse &&
          this.space2underscore(data.name_analyse) == layer.get("name") &&
          layer.get("type") == "analyse_spatiale"
        ) {
          layer.setVisible(false);
          document.getElementById(data.name_analyse).parentElement["style"][
            "display"
          ] = "none";
        }
      });
    } else {
      map.getLayers().forEach((layer) => {
        if (layer.get("name") == this.space2underscore(data.nom)) {
          //map.removeLayer(layer)
          layer.setVisible(true);
        }

        if (
          layer.get("type") == "mappilaryPoint" &&
          this.space2underscore(data.nom) == "mappilary"
        ) {
          layer.setVisible(true);
        }

        if (
          data.name_analyse &&
          this.space2underscore(data.name_analyse) == layer.get("name") &&
          layer.get("type") == "analyse_spatiale"
        ) {
          layer.setVisible(true);

          document.getElementById(data.name_analyse).parentElement["style"][
            "display"
          ] = "block";
        }
      });
    }

    if (
      data.isInMapVieuw == false &&
      data.bbox &&
      data.visible == false &&
      data.type == "wms"
    ) {
      map.getView().setZoom(data.zmin);

      if (data.inLayerTree == false) {
        var bbox = data.bbox.split(",");

        var Amin = proj.transform(
          [parseFloat(bbox[0]), parseFloat(bbox[1])],
          "EPSG:4326",
          "EPSG:3857"
        );
        var Amax = proj.transform(
          [parseFloat(bbox[2]), parseFloat(bbox[3])],
          "EPSG:4326",
          "EPSG:3857"
        );

        var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]];
        var a = Extent.boundingExtent([Amin, Amax]);

        map.getView().fit(a, { size: map.getSize() });
      }
    }

    if (
      data.isInMapVieuw == false &&
      data.bbox == null &&
      data.url == "http://wms.geocameroun.xyz/wms" &&
      data.visible == false &&
      data.type == "wms"
    ) {
      map.getView().setZoom(data.zmin);
      data.isInMapVieuw = true;
    }

    if (
      data.isInMapVieuw == false &&
      data.bbox == null &&
      data.visible == false &&
      data.type == "pdf"
    ) {
      var coord = data.geom.split(",");
      var pt = [parseFloat(coord[0]), parseFloat(coord[1])];
      var point = proj.transform(
        [parseFloat(coord[0]), parseFloat(coord[1])],
        "EPSG:4326",
        "EPSG:3857"
      );

      map.getView().setCenter(point);
      data.isInMapVieuw = true;
    }
  }

  displayInlayerTree(): any {
    for (var i = 0; i < this.cartes.length; i++) {
      if (this.cartes[i].sous_cartes) {
        for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
          for (
            var k = 0;
            k < this.cartes[i].sous_cartes[j].couches.length;
            k++
          ) {
            if (this.cartes[i].sous_cartes[j].couches[k].bbox) {
              var bbox =
                this.cartes[i].sous_cartes[j].couches[k].bbox.split(",");

              var Amin = proj.transform(
                [parseFloat(bbox[0]), parseFloat(bbox[1])],
                "EPSG:4326",
                "EPSG:3857"
              );
              var Amax = proj.transform(
                [parseFloat(bbox[2]), parseFloat(bbox[3])],
                "EPSG:4326",
                "EPSG:3857"
              );

              var extentData = Extent.boundingExtent([Amin, Amax]);

              var bool = Extent.containsExtent(
                map.getView().calculateExtent(map.getSize()),
                extentData
              );

              if (bool == false) {
                var bool = Extent.intersects(
                  map.getView().calculateExtent(map.getSize()),
                  extentData
                );
              }

              if (this.cartes[i].sous_cartes[j].couches[k].zmin) {
                if (
                  this.cartes[i].sous_cartes[j].couches[k].zmin <=
                    map.getView().getZoom() &&
                  map.getView().getZoom() <
                    this.cartes[i].sous_cartes[j].couches[k].zmax
                ) {
                  var boolZoom = true;
                } else {
                  var boolZoom = false;
                }
              }

              this.zone.run(() => {
                this.cartes[i].sous_cartes[j].couches[k].inLayerTree = bool;

                if (
                  this.cartes[i].sous_cartes[j].couches[k].checked &&
                  bool == false
                ) {
                  this.displayDataOnMap(
                    this.cartes[i].sous_cartes[j].couches[k],
                    ""
                  );

                  this.cartes[i].sous_cartes[j].couches[k].checked = false;
                  this.cartes[i].sous_cartes[j].couches[k].visible = false;
                }

                if (this.cartes[i].sous_cartes[j].couches[k].checked) {
                  if (this.cartes[i].sous_cartes[j].couches[k].visible) {
                    if (boolZoom == false || bool == false) {
                      this.toogleVisibilityLayer(
                        this.cartes[i].sous_cartes[j].couches[k]
                      );
                    }

                    this.cartes[i].sous_cartes[j].couches[k].visible = boolZoom;
                    this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw =
                      boolZoom;
                  } else if (
                    !this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw &&
                    boolZoom &&
                    bool
                  ) {
                    this.toogleVisibilityLayer(
                      this.cartes[i].sous_cartes[j].couches[k]
                    );
                    //this.cartes[i].sous_cartes[j].couches[k].inLayerTreeZoomActive = true
                    this.cartes[i].sous_cartes[j].couches[k].visible = true;
                  }
                }
              });
            }

            if (
              this.cartes[i].sous_cartes[j].couches[k].url ==
                "http://wms.geocameroun.xyz/wms" &&
              this.cartes[i].sous_cartes[j].couches[k].type == "wms"
            ) {
              var identifiant =
                this.cartes[i].sous_cartes[j].couches[k].identifiant;

              if (
                identifiant == "SCAN_500k" ||
                identifiant == "SCAN_200k" ||
                identifiant == "SCAN_1500k" ||
                identifiant == "SCAN_50k"
              ) {
                if (
                  this.cartes[i].sous_cartes[j].couches[k].zmin <=
                    map.getView().getZoom() &&
                  map.getView().getZoom() <=
                    this.cartes[i].sous_cartes[j].couches[k].zmax
                ) {
                  var boolZoom = true;
                } else {
                  var boolZoom = false;
                }

                /*this.cartes[i].sous_cartes[j].couches[k].inLayerTree = boolZoom 
									// pour faire disparaitre en fonction du zoom dans le layertree
								*/

                if (this.cartes[i].sous_cartes[j].couches[k].checked == true) {
                  if (
                    boolZoom == false &&
                    this.cartes[i].sous_cartes[j].couches[k].visible == true
                  ) {
                    this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw =
                      false;
                    this.toogleVisibilityLayer(
                      this.cartes[i].sous_cartes[j].couches[k]
                    );
                    this.cartes[i].sous_cartes[j].couches[k].visible = false;
                  } else if (
                    boolZoom == true &&
                    this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw ==
                      false
                  ) {
                    this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw =
                      true;

                    this.toogleVisibilityLayer(
                      this.cartes[i].sous_cartes[j].couches[k]
                    );
                    this.cartes[i].sous_cartes[j].couches[k].visible = true;
                  }
                }
              }
            }

            if (this.cartes[i].sous_cartes[j].couches[k].type == "pdf") {
              var coord =
                this.cartes[i].sous_cartes[j].couches[k].geom.split(",");
              var pt = [parseFloat(coord[0]), parseFloat(coord[1])];
              var point = proj.transform(
                [parseFloat(coord[0]), parseFloat(coord[1])],
                "EPSG:4326",
                "EPSG:3857"
              );

              var bool = Extent.containsCoordinate(
                map.getView().calculateExtent(map.getSize()),
                point
              );

              this.cartes[i].sous_cartes[j].couches[k].inLayerTree = bool;

              if (this.cartes[i].sous_cartes[j].couches[k].checked == true) {
                if (
                  bool == false &&
                  this.cartes[i].sous_cartes[j].couches[k].visible == true
                ) {
                  this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = false;
                  this.toogleVisibilityLayer(
                    this.cartes[i].sous_cartes[j].couches[k]
                  );
                  this.cartes[i].sous_cartes[j].couches[k].visible = false;
                } else if (
                  bool == true &&
                  this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw == false
                ) {
                  this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = true;

                  this.toogleVisibilityLayer(
                    this.cartes[i].sous_cartes[j].couches[k]
                  );
                  this.cartes[i].sous_cartes[j].couches[k].visible = true;
                }
              }
            }
          }
        }
      } else {
        for (var j = 0; j < this.cartes[i].couches.length; j++) {
          if (this.cartes[i].couches[j].bbox) {
            var bbox = this.cartes[i].couches[j].bbox.split(",");

            var Amin = proj.transform(
              [parseFloat(bbox[0]), parseFloat(bbox[1])],
              "EPSG:4326",
              "EPSG:3857"
            );
            var Amax = proj.transform(
              [parseFloat(bbox[2]), parseFloat(bbox[3])],
              "EPSG:4326",
              "EPSG:3857"
            );

            var extentData = Extent.boundingExtent([Amin, Amax]);

            var bool = Extent.containsExtent(
              map.getView().calculateExtent(map.getSize()),
              extentData
            );

            if (bool == false) {
              var bool = Extent.intersects(
                map.getView().calculateExtent(map.getSize()),
                extentData
              );
            }

            if (this.cartes[i].couches[j].zmin) {
              if (
                this.cartes[i].couches[j].zmin <= map.getView().getZoom() &&
                map.getView().getZoom() < this.cartes[i].couches[j].zmax
              ) {
                var boolZoom = true;
              } else {
                var boolZoom = false;
              }
            }

            this.zone.run(() => {
              this.cartes[i].couches[j].inLayerTree = bool;

              if (this.cartes[i].couches[j].checked && bool == false) {
                this.displayDataOnMap(this.cartes[i].couches[j], "");

                this.cartes[i].couches[j].checked = false;
                this.cartes[i].couches[j].visible = false;
              }

              if (this.cartes[i].couches[j].checked) {
                this.cartes[i].couches[j].isInMapVieuw = boolZoom;

                if (this.cartes[i].couches[j].visible) {
                  if (boolZoom == false || bool == false) {
                    this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                  }

                  this.cartes[i].couches[j].visible = boolZoom;
                } else if (
                  !this.cartes[i].couches[j].visible &&
                  boolZoom &&
                  bool
                ) {
                  this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                  //this.cartes[i].couches[j].inLayerTreeZoomActive = true
                  this.cartes[i].couches[j].visible = true;
                }
              }
            });
          }

          if (
            this.cartes[i].couches[j].url == "http://wms.geocameroun.xyz/wms" &&
            this.cartes[i].couches[j].type == "wms"
          ) {
            var identifiant = this.cartes[i].couches[j].identifiant;

            if (
              identifiant == "SCAN_500k" ||
              identifiant == "SCAN_200k" ||
              identifiant == "SCAN_1500k" ||
              identifiant == "SCAN_50k"
            ) {
              if (
                this.cartes[i].couches[j].zmin <= map.getView().getZoom() &&
                map.getView().getZoom() <= this.cartes[i].couches[j].zmax
              ) {
                var boolZoom = true;
              } else {
                var boolZoom = false;
              }

              /*this.cartes[i].couches[j].inLayerTree = boolZoom*/

              if (this.cartes[i].couches[j].checked == true) {
                if (
                  boolZoom == false &&
                  this.cartes[i].couches[j].visible == true
                ) {
                  this.cartes[i].couches[j].isInMapVieuw = false;
                  this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                  this.cartes[i].couches[j].visible = false;
                } else if (
                  boolZoom == true &&
                  this.cartes[i].couches[j].isInMapVieuw == false
                ) {
                  this.cartes[i].couches[j].isInMapVieuw = true;

                  this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                  this.cartes[i].couches[j].visible = true;
                }
              }
            }
          }

          if (this.cartes[i].couches[j].type == "pdf") {
            var coord = this.cartes[i].couches[j].geom.split(",");
            var pt = [parseFloat(coord[0]), parseFloat(coord[1])];
            var point = proj.transform(
              [parseFloat(coord[0]), parseFloat(coord[1])],
              "EPSG:4326",
              "EPSG:3857"
            );

            var bool = Extent.containsCoordinate(
              map.getView().calculateExtent(map.getSize()),
              point
            );

            this.cartes[i].couches[j].inLayerTree = bool;

            if (this.cartes[i].couches[j].checked == true) {
              if (bool == false && this.cartes[i].couches[j].visible == true) {
                this.cartes[i].couches[j].isInMapVieuw = false;
                this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                this.cartes[i].couches[j].visible = false;
              } else if (
                bool == true &&
                this.cartes[i].couches[j].isInMapVieuw == false
              ) {
                this.cartes[i].couches[j].isInMapVieuw = true;

                this.toogleVisibilityLayer(this.cartes[i].couches[j]);
                this.cartes[i].couches[j].visible = true;
              }
            }
          }
        }
      }
    }

    for (var i = 0; i < this.layerInMap.length; i++) {
      if (
        this.layerInMap[i].typeInf == "sous_cartes_pdf" &&
        this.layerInMap[i].zmin &&
        this.layerInMap[i].zmax &&
        this.layerInMap[i].bbox
      ) {
        console.log(78778);

        var bbox = this.layerInMap[i].bbox.split(",");

        var Amin = proj.transform(
          [parseFloat(bbox[0]), parseFloat(bbox[1])],
          "EPSG:4326",
          "EPSG:3857"
        );
        var Amax = proj.transform(
          [parseFloat(bbox[2]), parseFloat(bbox[3])],
          "EPSG:4326",
          "EPSG:3857"
        );

        var extentData = Extent.boundingExtent([Amin, Amax]);

        var bool = Extent.containsExtent(
          map.getView().calculateExtent(map.getSize()),
          extentData
        );

        if (bool == false) {
          var bool = Extent.intersects(
            map.getView().calculateExtent(map.getSize()),
            extentData
          );
        }

        if (
          this.layerInMap[i].zmin <= map.getView().getZoom() &&
          map.getView().getZoom() < this.layerInMap[i].zmax
        ) {
          var boolZoom = true;
        } else {
          var boolZoom = false;
        }

        this.zone.run(() => {
          if (this.layerInMap[i].checked && bool == false) {
            this.displayDataOnMap(this.layerInMap[i], "");
            /*this.layerInMap[i].checked =  false
					    this.layerInMap[i].visible =  false
					    this.layerInMap[i].isInMapVieuw =  false*/
          }

          if (this.layerInMap[i].checked) {
            if (this.layerInMap[i].visible) {
              if (boolZoom == false || bool == false) {
                this.toogleVisibilityLayer(this.layerInMap[i]);
              }

              this.layerInMap[i].visible = boolZoom;

              this.layerInMap[i].isInMapVieuw = boolZoom;
            } else if (!this.layerInMap[i].isInMapVieuw && boolZoom && bool) {
              this.toogleVisibilityLayer(this.layerInMap[i]);

              this.layerInMap[i].visible = true;
            }
          }
        });
      }
    }
  }

  changeOpacity(couche, e) {
    couche.opacity = e.value;

    map.getLayers().forEach((layer) => {
      if (layer.get("name") == this.space2underscore(couche.nom)) {
        layer.setOpacity(couche.opacity / 100);
      }
    });
  }

  gestionCarto(couche, data, z, typeGestion): any {
    var type_geometry = couche.geom;
    console.log(couche);
    if (type_geometry == "point") {
      var k = 0;
      var features = [];

      for (var index = 0; index < data.length; index++) {
        if (typeGestion == "api" || typeGestion == "couche") {
          for (var i = 0; i < data[index].length; i++) {
            if (data[index][i]["index"] == "geometry") {
              var geometry = JSON.parse(data[index][i]["val"]);
            }
          }
        } else if (typeGestion == "requete") {
          var geometry = JSON.parse(data[index].geometry);
        }

        if (geometry.coordinates.length == 1) {
          var coord = proj.transform(
            geometry.coordinates[0],
            "EPSG:4326",
            "EPSG:3857"
          );
        } else {
          var coord = proj.transform(
            geometry.coordinates,
            "EPSG:4326",
            "EPSG:3857"
          );
        }

        //console.log(coord,new geom.Point(coord))

        var newMarker = new Feature({
          geometry: new geom.Point(coord),
          data: data[index],
        });

        features[k] = newMarker;
        k++;
      }

      var markerSource = new source.Vector({
        features: features,
      });

      var clusterSource = new source.Cluster({
        distance: 80,
        source: markerSource,
      });

      var styleCache = {};
      var url_prefix = this.url_prefix;
      var LayThe = new layer.Vector({
        source: clusterSource,
        style: function (feature) {
          var size = feature.get("features").length;
          if (size != 1) {
            var styleDefault = styleCache[size];
            if (!styleDefault) {
              styleDefault = new style.Style({
                image: new style.Circle({
                  radius: 10,
                  stroke: new style.Stroke({
                    color: "#fff",
                    width: 2,
                  }),
                  fill: new style.Fill({
                    color: "#1CAC77",
                  }),
                }),
                text: new style.Text({
                  text: size.toString(),
                  fill: new style.Fill({
                    color: "#fff",
                  }),
                  font: "10px sans-serif",
                }),
              });
              styleCache[size] = styleDefault;
            }
          } else {
            var styleDefaultII = new style.Style({
              image: new style.Icon({
                scale: 0.2,
                src: url_prefix + couche.img,
              }),
            });

            return styleDefaultII;
          }

          return styleDefault;
        },
        visible: true,
      });

      var styleCacheCopy = {};
      var LayTheCopy = new layer.Vector({
        source: clusterSource,
        style: function (feature) {
          var size = feature.get("features").length;
          var styleDefault = styleCacheCopy[size];
          if (!styleDefault) {
            styleDefault = new style.Style({
              image: new style.Icon({
                scale: 0.2,
                src: url_prefix + couche.img,
              }),
            });
            styleCacheCopy[size] = styleDefault;
          }

          return styleDefault;
        },
        visible: true,
      });

      LayTheCopy.setZIndex(z);
      LayThe.setZIndex(z);

      LayTheCopy.set("type", couche.type_couche);
      LayThe.set("type", couche.type_couche);
      LayTheCopy.set("name", this.space2underscore(couche.nom));
      LayThe.set("name", this.space2underscore(couche.nom));

      LayTheCopy.set("id_cat", couche.id_cat);
      LayThe.set("key_couche", couche.key_couche);
      LayTheCopy.set("key_couche", couche.key_couche);
      LayThe.set("id_cat", couche.id_cat);

      map.addLayer(LayTheCopy);
      map.addLayer(LayThe);
      map.getView().fit(markerSource.getExtent(), {
        size: map.getSize(),
        maxZoom: 17,
        duration: 1000,
      });
    } else if (type_geometry == "Polygon") {
      if (couche.img !== null && couche.img !== undefined) {
        var cnv = document.createElement("canvas");
        var ctx = cnv.getContext("2d");
        var img = new Image();
        img.src = this.url_prefix + couche.img;

        img.onload = () => {
          var markerSource = new source.Vector();

          $.each(data, (index, val) => {
            if (typeGestion == "api" || typeGestion == "couche") {
              for (var i = 0; i < data[index].length; i++) {
                if (data[index][i]["index"] == "geometry") {
                  var geometry = JSON.parse(data[index][i]["val"]);
                }
              }
            } else if (typeGestion == "requete") {
              var geometry = JSON.parse(data[index].geometry);
            }

            if (geometry.coordinates.length == 1) {
              if (geometry.coordinates[0].length == 1) {
                var coord = geometry.coordinates[0][0];
              } else {
                var coord = geometry.coordinates[0];
              }
            } else {
              var coord = geometry.coordinates[0][0];
            }

            var a = this.convertepolygon(coord);
            var newMarker = new Feature({
              geometry: new geom.Polygon([a]),
              data: data[index],
              ptestyle: { img: ctx.createPattern(img, "repeat") },
            });

            markerSource.addFeature(newMarker);
          });

          var LayThe = new layer.Vector({
            source: markerSource,
            visible: true,
            style: stylePolygon,
          });

          if (couche.opacity) {
            LayThe.setOpacity(couche.opacity);
          }

          LayThe.setZIndex(z);
          map.addLayer(LayThe);

          var b = this.space2underscore(couche.nom);
          LayThe.set("name", b);
          LayThe.set("type", couche.type_couche);
          LayThe.set("key_couche", couche.key_couche);
          LayThe.set("id_cat", couche.id_cat);
          map.getView().fit(markerSource.getExtent(), {
            size: map.getSize(),
            maxZoom: 17,
            duration: 1000,
          });
        };
      } else {
        var markerSource = new source.Vector();

        $.each(data, (index, val) => {
          if (typeGestion == "api" || typeGestion == "couche") {
            for (var i = 0; i < data[index].length; i++) {
              if (data[index][i]["index"] == "geometry") {
                var geometry = JSON.parse(data[index][i]["val"]);
              }
            }
          } else if (typeGestion == "requete") {
            var geometry = JSON.parse(data[index].geometry);
          }

          if (geometry.coordinates.length == 1) {
            if (geometry.coordinates[0].length == 1) {
              var coord = geometry.coordinates[0][0];
            } else {
              var coord = geometry.coordinates[0];
            }
          } else {
            var coord = geometry.coordinates[0][0];
          }

          var a = this.convertepolygon(coord);
          var newMarker = new Feature({
            geometry: new geom.Polygon([a]),
            data: data[index],
            ptestyle: { remplir_couleur: couche.remplir_couleur },
          });

          markerSource.addFeature(newMarker);
        });

        var LayThe = new layer.Vector({
          source: markerSource,
          visible: true,
          style: stylePolygon,
        });

        if (couche.opacity) {
          LayThe.setOpacity(couche.opacity);
        }

        LayThe.setZIndex(z);
        map.addLayer(LayThe);
        LayThe.set("name", this.space2underscore(couche.nom));
        LayThe.set("type", couche.type_couche);
        LayThe.set("key_couche", couche.key_couche);
        LayThe.set("id_cat", couche.id_cat);
        map.getView().fit(markerSource.getExtent(), {
          size: map.getSize(),
          maxZoom: 17,
          duration: 1000,
        });
      }
    } else if (type_geometry == "LineString") {
      var markerSource = new source.Vector();

      $.each(data, (index, val) => {
        if (typeGestion == "api" || typeGestion == "couche") {
          for (var i = 0; i < data[index].length; i++) {
            if (data[index][i]["index"] == "geometry") {
              var geometry = JSON.parse(data[index][i]["val"]);
            }
          }
        } else if (typeGestion == "requete") {
          var geometry = JSON.parse(data[index].geometry);
        }

        if (geometry.coordinates.length == 1) {
          var coord = geometry.coordinates[0];
        } else {
          var coord = geometry.coordinates;
        }

        //data[index].contour_couleur = couche.contour_couleur

        var newMarker = new Feature({
          geometry: new geom.LineString(this.converteline(coord)),
          data: data[index],
          ptestyle: { contour_couleur: couche.contour_couleur },
        });

        markerSource.addFeature(newMarker);
      });

      var LayThe = new layer.Vector({
        source: markerSource,
        style: styleLigne,
        visible: true,
      });

      LayThe.setZIndex(z);

      map.addLayer(LayThe);
      LayThe.set("name", this.space2underscore(couche.nom));
      LayThe.set("type", couche.type_couche);
      LayThe.set("key_couche", couche.key_couche);
      LayThe.set("id_cat", couche.id_cat);
      map.getView().fit(markerSource.getExtent(), {
        size: map.getSize(),
        maxZoom: 17,
        duration: 1000,
      });
    }
  }

  convertepolygon(features) {
    var data = [];

    for (var i = 0; i < features.length; i++) {
      data.push(
        proj.transform(
          [parseFloat(features[i][0]), parseFloat(features[i][1])],
          "EPSG:4326",
          "EPSG:3857"
        )
      );
    }

    return data;
  }

  converteline(features) {
    var data = [];

    for (var i = 0; i < features.length; i++) {
      data.push(proj.transform(features[i], "EPSG:4326", "EPSG:3857"));
    }

    return data;
  }

  openProperties(height) {
    $("#displayProperties").css("top", "0px");
    $(".displayPropertiesBody").css("max-height", height);

    $("#displayProperties").css("-webkit-transform", "translate(0px)");
    $("#displayProperties").css("transform", "translate(0px)");

    this.positionProperties = { x: 0, y: 0 };

    $("#displayProperties").css("transition", "0s");
    $("#displayProperties").css("-webkit-transition", "0s");
  }

  closeProperties() {
    var h = $("#displayProperties").height() + 10;

    $("#displayProperties").css("transition", "0.5s");

    this.positionProperties = { x: 0, y: 0 };

    $("#displayProperties").css("-webkit-transform", "translate(0px)");
    $("#displayProperties").css("transform", "translate(0px)");

    $("#displayProperties").css("top", -h + "px");
    this.desactivate_an_icon();
    this.masque_source.clear();
  }

  onStop(event, classe, rang) {
    if (this.yTree) {
      $("." + classe).css("-webkit-transform", "translate(0px)");
      $("." + classe).css("transform", "translate(0px)");

      var factorS = this.yTree / 155;

      var factor = parseInt(factorS.toString());

      for (var i = 0; i < this.layerInMap.length; i++) {
        if (this.layerInMap[i].index_inf == rang && factor != 0) {
          if (this.yTree > 0) {
            /// tous ceux dont il a depasse
            for (var k = i + 1; k <= i + factor; k++) {
              if (this.layerInMap[k]) {
                this.layerInMap[k].zIndex_inf =
                  this.layerInMap[k].zIndex_inf + 1;
              }
            }

            this.layerInMap[i].zIndex_inf =
              this.layerInMap[i].zIndex_inf - factor;
          } else if (this.yTree < 0) {
            /// tous ceux dont il a depasse
            for (var k = i - 1; k >= i + factor; k--) {
              if (this.layerInMap[k]) {
                this.layerInMap[k].zIndex_inf =
                  this.layerInMap[k].zIndex_inf - 1;
              }
            }

            this.layerInMap[i].zIndex_inf =
              this.layerInMap[i].zIndex_inf - factor;
          }

          this.resetZindex();
        }
      }
      this.yTree = undefined;
    }
  }

  onMoving(event, i) {
    this.yTree = event.y;
  }

  onMovingProperties(event, bool) {
    if (bool) {
      this.positionProperties = { x: event.x, y: event.y };
    }
  }

  onMovingProperties_pdf(event, i, bool) {
    if (bool) {
      this.displayPropertiesDivs[i]["position"] = { x: event.x, y: event.y };
    }
  }
  minimisePropertiesPdf(i) {
    this.displayPropertiesDivs[i]["position"] = { x: 0, y: 0 };
    this.displayPropertiesDivs[i]["maximise"] = false;

    var a = i * 155 + 300;

    console.log(
      ".displayProperties" + i,
      a + "px !important",
      $(".displayProperties" + i)
    );
    //document.querySelector(".displayProperties"+i).style.left = a+'px !important'

    $(".displayProperties" + i).css("left", a + "px");
  }

  maximisePropertiesPdf(i) {
    this.displayPropertiesDivs[i]["maximise"] = true;
    $(".displayProperties" + i).css("left", "0px !important");
  }

  resetZindex() {
    var z;

    for (var i = 0; i < this.layerInMap.length; i++) {
      map.getLayers().forEach((layer) => {
        if (
          layer.get("name") == this.space2underscore(this.layerInMap[i]["nom"])
        ) {
          layer.setZIndex(this.layerInMap[i]["zIndex_inf"]);
        }

        if (layer.get("name") == "mappilary") {
          z = layer.getZIndex();
        }
      });
    }

    map.getLayers().forEach((layer) => {
      if (layer.get("type") == "mappilaryPoint") {
        layer.setZIndex(z);
      }
    });
  }

  toogleCompare() {
    var swipe = document.getElementById("swipe");
    if (!this.modeCompare) {
      const buttonheet_compare = this.bottomSheet.open(buttonsheetComponent, {
        data: { type: "compare", data: this.layerInMap },
      });

      this.modeCompare = true;

      buttonheet_compare.afterDismissed().subscribe((result) => {
        if (!result) {
          this.modeCompare = false;
          $("#swipe").hide();
        } else {
          $("#swipe").show();

          var index1 = parseFloat(result["layer1"]);
          var index2 = parseFloat(result["layer2"]);

          var layer1;
          var layer2;

          map.getLayers().forEach((layer) => {
            if (
              layer.get("name") ==
              this.space2underscore(this.layerInMap[index1]["nom"])
            ) {
              layer1 = layer;
              layer.setVisible(true);
            } else if (
              layer.get("name") ==
              this.space2underscore(this.layerInMap[index2]["nom"])
            ) {
              layer2 = layer;
              layer.setVisible(true);
            } else if (
              layer.get("type") == "xyz" ||
              layer.get("type") == "wms"
            ) {
              layer.setVisible(false);
            }
          });

          for (var i = 0; i < this.layerInMap.length; i++) {
            if (
              this.layerInMap[i]["type"] == "xyz" ||
              this.layerInMap[i]["type"] == "wms"
            ) {
              this.layerInMap[i]["visible"] = false;
            }
          }

          this.toogleVisibilityLayer(this.layerInMap[index1]);
          this.toogleVisibilityLayer(this.layerInMap[index2]);

          this.layerInMap[index1]["visible"] = true;
          this.layerInMap[index2]["visible"] = true;

          this.layerInCompare[0] = this.layerInMap[index1];
          this.layerInCompare[1] = this.layerInMap[index2];

          if (layer1.getZIndex() > layer2.getZIndex()) {
            var lay1 = layer1;
          } else {
            var lay1 = layer2;
          }

          this.precompose = lay1.on("precompose", function (event) {
            var ctx = event.context;
            var width = ctx.canvas.width * (swipe["value"] / 100);

            ctx.save();
            ctx.beginPath();
            ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
            ctx.clip();
          });

          this.postcompose = lay1.on("postcompose", function (event) {
            var ctx = event.context;
            ctx.restore();
          });

          this.swipeEvent = swipe.addEventListener(
            "input",
            function () {
              console.log(1);
              map.render();
            },
            false
          );
        }
      });
    } else {
      this.closeModeCompare();
    }
  }

  closeModeCompare() {
    this.layerInCompare = [];

    OBservable.unByKey(this.precompose);
    OBservable.unByKey(this.postcompose);
    OBservable.unByKey(this.swipeEvent);

    this.modeCompare = false;

    $("#swipe").hide();
  }

  openDescription(couche, index) {
    if (couche.statusDescription_inf) {
      var elm = document.getElementById(" descriptionLayerBox" + index);
      elm.style.right = "0px";
      elm.style.left = "100%";
      $("#descriptionLayerBoxClose" + index).hide();
    } else {
      var elm = document.getElementById(" descriptionLayerBox" + index);
      elm.style.right = "-5px";
      elm.style.left = "-5px";

      $("#descriptionLayerBoxClose" + index).show();
    }

    couche.statusDescription_inf = !couche.statusDescription_inf;
  }

  toogleMappilary() {
    if (!this.modeMappilary) {
      //Zmax = 15

      var data = {
        type: "mappilary",
        nom: "mappilary",
        type_couche_inf: "mappilary",
        checked: true,
        img: "assets/images/icones/mapillary-couche.png",
      };

      this.displayDataOnMap(data, "");

      this.modeMappilary = !this.modeMappilary;

      if (map.getView().getZoom() > 14) {
        this.displayMappilaryPoint();
      }

      map.on("moveend", () => {
        this.displayMappilaryPoint();
      });
    } else {
      var data = {
        type: "mappilary",
        nom: "mappilary",
        type_couche_inf: "mappilary",
        checked: false,
        img: "assets/images/icones/mapillary-couche.png",
      };

      this.displayDataOnMap(data, "");
    }
  }

  displayMappilaryPoint() {
    if (this.modeMappilary && map.getView().getZoom() > 14) {
      var bboxMap = map
        .getView()
        .calculateExtent(map.getSize())
        .toString()
        .split(",");

      var Amin = proj.transform(
        [parseFloat(bboxMap[0]), parseFloat(bboxMap[1])],
        "EPSG:3857",
        "EPSG:4326"
      );
      var Amax = proj.transform(
        [parseFloat(bboxMap[2]), parseFloat(bboxMap[3])],
        "EPSG:3857",
        "EPSG:4326"
      );

      var bboxUrl = Amin[0] + "," + Amin[1] + "," + Amax[0] + "," + Amax[1];

      var url =
        "https://a.mapillary.com/v3/images/?&bbox=" +
        bboxUrl +
        "&client_id=TG1sUUxGQlBiYWx2V05NM0pQNUVMQTo2NTU3NTBiNTk1NzM1Y2U2";
      var url_sequence =
        "https://a.mapillary.com/v3/sequences?bbox=" +
        bboxUrl +
        "&client_id=TG1sUUxGQlBiYWx2V05NM0pQNUVMQTo2NTU3NTBiNTk1NzM1Y2U2";
      var pointMappilary;
      $.get(url_sequence, (data) => {
        var layer_mappilary;
        var layer_mappilaryPoint;

        map.getLayers().forEach((layer) => {
          if (layer.get("name") == "mappilary") {
            layer_mappilary = layer;
          }

          if (layer.get("name") == "mappilaryPoint") {
            //layer.getSource().clear()
            layer_mappilaryPoint = layer;
          }
        });

        var point = [];
        for (var i = 0; i < data.features.length; i++) {
          for (
            var j = 0;
            j < data.features[i].geometry.coordinates.length;
            j++
          ) {
            var coord = proj.transform(
              data.features[i].geometry.coordinates[j],
              "EPSG:4326",
              "EPSG:3857"
            );

            var newMarker = new Feature({
              geometry: new geom.Point(coord),
              data: { i: i, j: j, type: "point" },
            });

            point.push(newMarker);
          }
        }

        var vectorFeature = new Format.GeoJSON().readFeatures(data, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        var vectorSource = new source.Vector({
          features: point,
        });

        vectorSource.addFeatures(vectorFeature);

        var vectorLayer = new layer.Vector({
          source: vectorSource,
          style: new style.Style({
            image: new style.Circle({
              radius: 4,
              fill: new style.Fill({
                color: "#fff",
              }),
              stroke: new style.Stroke({
                color: "rgba(53, 175, 109,0.7)",
                width: 3,
              }),
            }),
            stroke: new style.Stroke({
              color: "rgba(53, 175, 109,0.7)",
              width: 4,
            }),
          }),
        });

        if (layer_mappilaryPoint) {
          //map.removeLayer(layer_mappilaryPoint)
          layer_mappilaryPoint.getSource().clear();
          layer_mappilaryPoint.setSource(vectorSource);
        }

        vectorLayer.set("name", "mappilaryPoint");
        vectorLayer.set("type", "mappilaryPoint");
        vectorLayer.setZIndex(layer_mappilary.getZIndex());

        map.addLayer(vectorLayer);

        this.zone.run(() => {
          this.responseMappilary = data;
        });
      });
    }
  }

  toogleProfilAlti() {
    map.removeInteraction(this.draw);

    if (this.altimetrie.active == false) {
      this.altimetrie.active = true;
      this.draw = new interaction.Draw({
        source: this.source_draw,
        type: "LineString",
        style: new style.Style({
          stroke: new style.Stroke({
            color: this.primaryColor,
            width: 4,
          }),
          image: new style.Circle({
            radius: 5,
            stroke: new style.Stroke({
              color: "black",
            }),
            fill: new style.Fill({
              color: [0, 0, 0, 0.1],
            }),
          }),
        }),
      });

      map.addInteraction(this.draw);

      this.draw.on("drawend", (e) => {
        var coord = e.feature.getGeometry().getCoordinates();

        //this.profil_alti_overlay.setPosition(coord);
        $("#profil_alti").show();
        ///$("#text-comment").val(null);*/

        var feature = e.feature;

        feature.set("type", "srtm");

        feature.setStyle(
          new style.Style({
            stroke: new style.Stroke({
              color: this.primaryColor,
              width: 6,
            }),
          })
        );

        var geom_4326 = [];

        for (var i = 0; i < coord.length; i++) {
          geom_4326.push(proj.transform(coord[i], "EPSG:3857", "EPSG:4326"));
        }

        map.removeInteraction(this.draw);
        this.profil_alti_active = false;

        this.geoportailService
          .drapeline({ donnes: geom_4326 })
          .then((data: any) => {
            this.zone.run(() => {
              this.profil_alti_active = true;
            });
            var drape = JSON.parse(data);

            //var profil = [[781931.923728387,426134.63210391,727],[781913.854584949,426181.252979657,730],[781895.785441512,426227.873855404,737],[781877.716298074,426274.494731151,741],[781859.647154636,426321.115606898,744],[781841.578011198,426367.736482645,746],[781823.508867761,426414.357358392,735],[781805.439724323,426460.97823414,731],[781787.370580885,426507.599109887,723],[781769.301437447,426554.219985634,718],[781751.23229401,426600.840861381,714],[781733.163150572,426647.461737128,715],[781715.094007134,426694.082612875,721],[781697.024863696,426740.703488622,726],[781678.955720259,426787.324364369,737],[781660.886576821,426833.945240116,742],[781642.817433383,426880.566115863,750],[781624.748289945,426927.18699161,753],[781606.679146508,426973.807867358,753],[781588.61000307,427020.428743105,754],[781570.540859632,427067.049618852,757],[781552.471716194,427113.670494599,755],[781534.402572757,427160.291370346,752],[781516.333429319,427206.912246093,746],[781498.264285881,427253.53312184,745],[781480.195142443,427300.153997587,731],[781462.125999006,427346.774873334,729],[781444.056855568,427393.395749081,722],[781425.98771213,427440.016624829,715],[781407.918568692,427486.637500576,712],[781389.849425255,427533.258376323,712],[781371.780281817,427579.87925207,719],[781353.711138379,427626.500127817,724],[781335.641994941,427673.121003564,729],[781317.572851504,427719.741879311,737],[781299.503708066,427766.362755058,740],[781281.434564628,427812.983630805,742],[781263.36542119,427859.604506552,748],[781245.296277753,427906.225382299,750],[781227.227134315,427952.846258047,751],[781209.157990877,427999.467133794,754],[781191.088847439,428046.088009541,755],[781173.019704002,428092.708885288,751],[781154.950560564,428139.329761035,737],[781136.881417126,428185.950636782,736],[781118.812273688,428232.571512529,729],[781100.743130251,428279.192388276,726],[781082.673986813,428325.813264023,724],[781064.604843375,428372.43413977,719],[781046.535699937,428419.055015517,714],[781028.4665565,428465.675891265,714],[781010.397413062,428512.296767012,723],[780992.328269624,428558.917642759,729],[780974.259126186,428605.538518506,731],[780956.189982749,428652.159394253,735],[780938.120839311,428698.78027,735],[780920.051695873,428745.401145747,730],[780901.982552435,428792.022021494,729],[780883.913408998,428838.642897241,718],[780865.84426556,428885.263772988,716],[780847.775122122,428931.884648736,717],[780829.705978684,428978.505524483,716],[780811.636835247,429025.12640023,717],[780793.567691809,429071.747275977,720],[780775.498548371,429118.368151724,732],[780757.429404933,429164.989027471,735],[780739.360261496,429211.609903218,744],[780721.291118058,429258.230778965,745],[780703.22197462,429304.851654712,746],[780685.152831182,429351.472530459,747],[780667.083687745,429398.093406206,741],[780649.014544307,429444.714281954,731],[780630.945400869,429491.335157701,723],[780612.876257431,429537.956033448,729],[780594.807113994,429584.576909195,744],[780576.737970556,429631.197784942,746],[780558.668827118,429677.818660689,751],[780540.59968368,429724.439536436,750],[780522.530540243,429771.060412183,750],[780504.461396805,429817.68128793,744],[780486.392253367,429864.302163677,733],[780468.323109929,429910.923039424,726],[780450.253966492,429957.543915172,724],[780432.184823054,430004.164790919,722],[780414.115679616,430050.785666666,724],[780396.046536178,430097.406542413,726],[780377.977392741,430144.02741816,731],[780359.908249303,430190.648293907,735],[780341.839105865,430237.269169654,735],[780323.769962427,430283.890045401,738],[780305.70081899,430330.510921148,736],[780287.631675552,430377.131796895,740],[780269.562532114,430423.752672643,741],[780251.493388676,430470.37354839,740],[780233.424245239,430516.994424137,739],[780215.355101801,430563.615299884,740],[780197.285958363,430610.236175631,742],[780179.216814925,430656.857051378,741],[780161.147671488,430703.477927125,738],[780143.07852805,430750.098802872,740],[780125.009384612,430796.719678619,736],[780106.940241174,430843.340554366,734],[780088.871097737,430889.961430113,735],[780070.801954299,430936.582305861,736],[780052.732810861,430983.203181608,736],[780034.663667423,431029.824057355,734],[780016.594523986,431076.444933102,736],[779998.525380548,431123.065808849,741],[779980.45623711,431169.686684596,742],[779962.387093672,431216.307560343,746],[779944.317950235,431262.92843609,746],[779926.248806797,431309.549311837,752],[779908.179663359,431356.170187584,756],[779890.110519921,431402.791063331,761],[779872.041376484,431449.411939079,763],[779853.972233046,431496.032814826,765],[779835.903089608,431542.653690573,773],[779817.83394617,431589.27456632,770],[779799.764802733,431635.895442067,771],[779781.695659295,431682.516317814,770],[779763.626515857,431729.137193561,766],[779745.557372419,431775.758069308,764],[779727.488228982,431822.378945055,765],[779709.419085544,431868.999820802,765],[779691.349942106,431915.62069655,769],[779673.280798668,431962.241572297,770],[779655.211655231,432008.862448044,772],[779637.142511793,432055.483323791,775],[779619.073368355,432102.104199538,771],[779601.004224917,432148.725075285,773],[779582.93508148,432195.345951032,763],[779564.865938042,432241.966826779,764],[779546.796794604,432288.587702526,771],[779528.727651166,432335.208578273,774],[779510.658507729,432381.82945402,787],[779492.589364291,432428.450329768,790],[779474.520220853,432475.071205515,801],[779456.451077415,432521.692081262,802],[779438.381933978,432568.312957009,800],[779420.31279054,432614.933832756,809],[779402.243647102,432661.554708503,812],[779384.174503664,432708.17558425,811],[779366.105360227,432754.796459997,818],[779348.036216789,432801.417335744,822],[779329.967073351,432848.038211491,824],[779311.897929913,432894.659087238,823],[779293.828786476,432941.279962986,820],[779275.759643038,432987.900838733,812],[779257.6904996,433034.52171448,811],[779239.621356162,433081.142590227,803],[779221.552212725,433127.763465974,802],[779203.483069287,433174.384341721,794],[779185.413925849,433221.005217468,791],[779167.344782411,433267.626093215,782],[779149.275638974,433314.246968962,779],[779131.206495536,433360.867844709,773],[779113.137352098,433407.488720457,765],[779095.06820866,433454.109596204,766],[779076.999065223,433500.730471951,772],[779058.929921785,433547.351347698,778],[779040.860778347,433593.972223445,786],[779022.791634909,433640.593099192,790],[779004.722491472,433687.213974939,787],[778986.653348034,433733.834850686,782],[778968.584204596,433780.455726433,780],[778950.515061158,433827.07660218,779],[778932.445917721,433873.697477927,774],[778914.376774283,433920.318353675,762],[778896.307630845,433966.939229422,751],[778878.238487407,434013.560105169,737],[778860.16934397,434060.180980916,739],[778842.100200532,434106.801856663,744],[778824.031057094,434153.42273241,743],[778805.961913656,434200.043608157,742],[778787.892770219,434246.664483904,741],[778769.823626781,434293.285359651,743],[778751.754483343,434339.906235398,746],[778733.685339905,434386.527111145,752],[778715.616196468,434433.147986893,760],[778697.54705303,434479.76886264,762],[778679.477909592,434526.389738387,765],[778661.408766154,434573.010614134,763],[778643.339622717,434619.631489881,766],[778625.270479279,434666.252365628,772],[778607.201335841,434712.873241375,764],[778589.132192403,434759.494117122,766],[778571.063048966,434806.114992869,766],[778552.993905528,434852.735868616,765],[778534.92476209,434899.356744364,768],[778516.855618652,434945.977620111,774],[778498.786475215,434992.598495858,778],[778480.717331777,435039.219371605,777],[778462.648188339,435085.840247352,768],[778444.579044901,435132.461123099,771],[778426.509901464,435179.081998846,778],[778408.440758026,435225.702874593,783],[778390.371614588,435272.32375034,782],[778372.30247115,435318.944626087,786],[778354.233327713,435365.565501835,790],[778336.164184275,435412.186377582,792],[778318.095040837,435458.807253329,794],[778300.025897399,435505.428129076,796],[778281.956753962,435552.049004823,797],[778263.887610524,435598.66988057,800],[778245.818467086,435645.290756317,806],[778227.749323648,435691.911632064,817],[778209.680180211,435738.532507811,846],[778191.611036773,435785.153383558,856],[778173.541893335,435831.774259305,878],[778155.472749897,435878.395135053,880],[778137.40360646,435925.0160108,882],[778116.110184439,435902.805973202,870],[778093.761962382,435858.078386961,850],[778071.413740326,435813.35080072,823],[778049.06551827,435768.62321448,817],[778026.717296213,435723.895628239,793],[778004.369074157,435679.168041998,792],[777982.020852101,435634.440455757,792],[777959.672630044,435589.712869517,800],[777937.324407988,435544.985283276,800],[777914.976185932,435500.257697035,793],[777892.627963875,435455.530110795,792],[777870.279741819,435410.802524554,792],[777847.931519763,435366.074938313,795],[777825.583297706,435321.347352072,790],[777803.23507565,435276.619765832,787],[777780.886853594,435231.892179591,781],[777758.538631537,435187.16459335,776],[777736.190409481,435142.437007109,770],[777713.842187425,435097.709420869,772],[777691.493965368,435052.981834628,774],[777669.145743312,435008.254248387,776],[777646.797521256,434963.526662147,781],[777624.449299199,434918.799075906,790],[777602.101077143,434874.071489665,795],[777579.752855087,434829.343903424,807],[777557.40463303,434784.616317184,816],[777535.056410974,434739.888730943,831],[777512.708188918,434695.161144702,845],[777490.359966861,434650.433558462,849],[777468.011744805,434605.705972221,858],[777445.663522749,434560.97838598,859],[777423.315300692,434516.250799739,860],[777400.967078636,434471.523213499,857],[777378.61885658,434426.795627258,859],[777356.270634523,434382.068041017,862],[777333.922412467,434337.340454777,848],[777311.574190411,434292.612868536,832],[777289.225968354,434247.885282295,811],[777266.877746298,434203.157696054,805],[777244.529524242,434158.430109814,803],[777222.181302185,434113.702523573,785],[777199.833080129,434068.974937332,789],[777177.484858073,434024.247351092,799],[777155.136636016,433979.519764851,801],[777132.78841396,433934.79217861,798],[777110.440191904,433890.064592369,800],[777088.091969847,433845.337006129,791],[777065.743747791,433800.609419888,784],[777043.395525735,433755.881833647,778],[777021.047303678,433711.154247407,784],[776998.699081622,433666.426661166,781],[776976.350859566,433621.699074925,786],[776954.002637509,433576.971488684,789],[776931.654415453,433532.243902444,807],[776909.306193397,433487.516316203,821],[776886.95797134,433442.788729962,830],[776864.609749284,433398.061143722,844],[776842.261527228,433353.333557481,890],[776819.913305171,433308.60597124,907],[776797.565083115,433263.878384999,936],[776775.216861059,433219.150798759,947],[776752.868639002,433174.423212518,964],[776730.520416946,433129.695626277,987],[776708.17219489,433084.968040037,988],[776685.823972833,433040.240453796,994],[776663.475750777,432995.512867555,990],[776641.127528721,432950.785281314,979],[776618.779306664,432906.057695074,983],[776596.431084608,432861.330108833,973],[776574.082862552,432816.602522592,966],[776551.734640495,432771.874936351,961],[776529.386418439,432727.147350111,957],[776507.038196383,432682.41976387,946],[776484.689974326,432637.692177629,926],[776462.34175227,432592.964591389,914],[776439.993530214,432548.237005148,889],[776417.645308157,432503.509418907,870],[776395.297086101,432458.781832666,840],[776372.948864045,432414.054246426,834],[776350.600641988,432369.326660185,842],[776328.252419932,432324.599073944,847],[776305.904197876,432279.871487704,874],[776283.555975819,432235.143901463,896],[776261.207753763,432190.416315222,911],[776238.859531707,432145.688728981,947],[776216.51130965,432100.961142741,967],[776194.163087594,432056.2335565,1003],[776171.814865538,432011.505970259,1008],[776149.466643481,431966.778384019,1004],[776127.118421425,431922.050797778,992],[776104.770199369,431877.323211537,975],[776082.421977312,431832.595625296,967],[776060.073755256,431787.868039056,955],[776037.7255332,431743.140452815,952],[776015.377311143,431698.412866574,951],[775993.029089087,431653.685280334,928],[775970.680867031,431608.957694093,913],[775948.332644974,431564.230107852,895],[775925.984422918,431519.502521611,890],[775903.636200862,431474.774935371,877],[775881.287978805,431430.04734913,863],[775858.939756749,431385.319762889,843],[775836.591534693,431340.592176649,838],[775814.243312636,431295.864590408,825],[775791.89509058,431251.137004167,807],[775769.546868524,431206.409417926,802],[775747.198646467,431161.681831686,792],[775724.850424411,431116.954245445,789],[775702.502202355,431072.226659204,779],[775680.153980298,431027.499072963,772],[775657.805758242,430982.771486723,767],[775635.457536186,430938.043900482,766],[775613.109314129,430893.316314241,755],[775590.761092073,430848.588728001,756],[775568.412870017,430803.86114176,777],[775546.06464796,430759.133555519,796],[775523.716425904,430714.405969278,800],[775501.368203848,430669.678383038,824],[775479.019981791,430624.950796797,841],[775456.671759735,430580.223210556,862],[775434.323537679,430535.495624316,882],[775411.975315622,430490.768038075,921],[775389.627093566,430446.040451834,935],[775367.27887151,430401.312865593,961],[775344.930649453,430356.585279353,978],[775322.582427397,430311.857693112,990],[775300.234205341,430267.130106871,996],[775277.885983284,430222.402520631,1000],[775255.537761228,430177.67493439,997],[775233.189539172,430132.947348149,1003],[775210.841317115,430088.219761908,1010],[775188.493095059,430043.492175668,1002],[775166.144873003,429998.764589427,985],[775143.796650946,429954.037003186,984],[775121.44842889,429909.309416946,962],[775099.100206834,429864.581830705,956],[775076.751984777,429819.854244464,939],[775054.403762721,429775.126658223,916],[775032.055540665,429730.399071983,884],[775009.707318608,429685.671485742,853],[774987.359096552,429640.943899501,840],[774965.010874496,429596.216313261,818],[774942.662652439,429551.48872702,809],[774920.314430383,429506.761140779,788],[774897.966208327,429462.033554538,778],[774875.61798627,429417.305968298,766],[774853.269764214,429372.578382057,752],[774830.921542158,429327.850795816,740],[774808.573320101,429283.123209576,734],[774786.225098045,429238.395623335,741],[774763.876875989,429193.668037094,753],[774741.528653932,429148.940450853,756],[774719.180431876,429104.212864613,753],[774696.83220982,429059.485278372,752],[774674.483987763,429014.757692131,747],[774652.135765707,428970.030105891,744],[774629.787543651,428925.30251965,743],[774607.439321594,428880.574933409,739],[774585.091099538,428835.847347168,734],[774562.742877482,428791.119760928,732],[774540.394655425,428746.392174687,732],[774518.046433369,428701.664588446,723],[774495.698211313,428656.937002205,716],[774473.349989256,428612.209415965,711],[774451.0017672,428567.481829724,709],[774428.653545144,428522.754243483,709],[774406.305323087,428478.026657243,707],[774383.957101031,428433.299071002,715],[774361.608878975,428388.571484761,722],[774339.260656918,428343.84389852,724],[774316.912434862,428299.11631228,737],[774294.564212806,428254.388726039,741],[774272.215990749,428209.661139798,756]]
            var profil = drape["coordinates"];
            var x = [];
            var y = [];
            var xy = [];
            for (var index = 0; index < profil.length; index++) {
              xy.push([profil[index][0], profil[index][1]]);
              x.push(index * 50);
              y.push(profil[index][2]);
            }

            if (this.chart_drape) {
              this.chart_drape.destroy();
            }

            var k = 0;
            var features = [];

            for (var index = 0; index < xy.length; index++) {
              //var coord = proj.transform(xy[index], 'EPSG:32632', 'EPSG:3857')

              var newMarker = new Feature({
                geometry: new geom.Point(xy[index]),
                index: index,
                style: new style.Style({
                  image: new style.Circle({
                    radius: 0,
                    fill: new style.Fill({
                      color: "#fff",
                    }),
                    stroke: new style.Stroke({
                      color: "rgba(53, 175, 109,0.7)",
                      width: 3,
                    }),
                  }),
                  stroke: new style.Stroke({
                    color: "rgba(53, 175, 109,0.7)",
                    width: 0,
                  }),
                }),
              });

              features[k] = newMarker;
              k++;
            }

            var markerSource = new source.Vector({
              features: features,
            });

            var vectorLayer = new layer.Vector({
              source: markerSource,
              style: new style.Style({
                image: new style.Circle({
                  radius: 0,
                  fill: new style.Fill({
                    color: "#fff",
                  }),
                  stroke: new style.Stroke({
                    color: "rgba(53, 175, 109,0.7)",
                    width: 0,
                  }),
                }),
                stroke: new style.Stroke({
                  color: "rgba(53, 175, 109,0.7)",
                  width: 0,
                }),
              }),
            });

            vectorLayer.setZIndex(this.vector_draw.getZIndex());

            vectorLayer.set("type", "drape_points");
            vectorLayer.set("name", "drape_points");

            map.addLayer(vectorLayer);

            this.chart_drape = new Chart("canvas", {
              type: "line",
              data: {
                labels: x,
                datasets: [
                  {
                    data: y,
                    borderColor: this.primaryColor,
                    fill: true,
                    pointRadius: 2,
                  },
                ],
              },
              options: {
                legend: {
                  display: false,
                },
                scales: {
                  xAxes: [
                    {
                      display: true,
                      ticks: {
                        maxTicksLimit: 12,
                      },
                    },
                  ],
                  yAxes: [
                    {
                      display: true,
                    },
                  ],
                },
              },
            });

            var style_inactive = new style.Style({
              image: new style.Circle({
                radius: 0,
                fill: new style.Fill({
                  color: "#fff",
                }),
                stroke: new style.Stroke({
                  color: "rgba(53, 175, 109,0.7)",
                  width: 0,
                }),
              }),
              stroke: new style.Stroke({
                color: "rgba(53, 175, 109,0.7)",
                width: 0,
              }),
            });

            var style_active = new style.Style({
              image: new style.Circle({
                radius: 6,
                fill: new style.Fill({
                  color: "#fff",
                }),
                stroke: new style.Stroke({
                  color: "rgba(53, 175, 109,0.7)",
                  width: 3,
                }),
              }),
              stroke: new style.Stroke({
                color: "rgba(53, 175, 109,0.7)",
                width: 4,
              }),
            });
            //.addEventListener("mouseover")
            document
              .getElementById("canvas")
              .addEventListener("mousemove", (evt) => {
                var firstPoint = this.chart_drape.getElementsAtEvent(evt)[0];

                if (firstPoint) {
                  var label = this.chart_drape.data.labels[firstPoint._index];
                  var value =
                    this.chart_drape.data.datasets[firstPoint._datasetIndex]
                      .data[firstPoint._index];
                  console.log(label, value);
                  map.getLayers().forEach(function (leyer) {
                    if (leyer.get("name") == "drape_points") {
                      for (
                        var i = 0;
                        i < leyer.get("source").getFeatures().length;
                        i++
                      ) {
                        if (
                          label / 50 ==
                          leyer.get("source").getFeatures()[i].get("index")
                        ) {
                          //console.log(leyer.get('source').getFeatures()[firstPoint._index])
                          leyer
                            .get("source")
                            .getFeatures()
                            [i].setStyle(style_active);
                        } else {
                          leyer
                            .get("source")
                            .getFeatures()
                            [i].setStyle(style_inactive);
                        }
                      }
                    }
                  });
                } else {
                  map.getLayers().forEach(function (leyer) {
                    if (leyer.get("name") == "drape_points") {
                      for (
                        var i = 0;
                        i < leyer.get("source").getFeatures().length;
                        i++
                      ) {
                        leyer
                          .get("source")
                          .getFeatures()
                          [i].setStyle(style_inactive);
                      }
                    }
                  });
                }
              });
          });
        //this.count_draw[type].push({ "id": id, "comment": null, "type": type, "geometry": geom, "hexa_code": this.primaryColor });
      });
    } else {
      this.source_draw.clear();
      this.altimetrie.active = false;
      $("#profil_alti").hide();

      var lay = [];
      map.getLayers().forEach((layer) => {
        if (layer.get("name") == "drape_points") {
          lay.push(layer);
        }
      });

      for (var i = 0; i < lay.length; i++) {
        map.removeLayer(lay[i]);
      }
    }
  }

  getTooltip(id) {
    var text1 = $("#" + id).text();

    return text1;
  }

  displayResultGeocode(item) {
    this.geocode_variable = {
      type: item.type_query,
      data: item,
    };
    console.log(this.geocode_variable);
    map.getLayers().forEach((layer) => {
      if (layer.get("name") == "querry") {
        layer.get("source").clear();
      }
    });

    if (this.geocode_variable.type == "nominatim") {
      var tags = {
        cle: item.class.toLowerCase().replace(/ /g, ""),
        val: item.type.toLowerCase().replace(/ /g, ""),
      };
      // console.log(item)
      var i;
      for (var index = 0; index < this.tags_couche.length; index++) {
        if (
          this.tags_couche[index]["cle"].toLowerCase().replace(/ /g, "") ==
            tags.cle &&
          this.tags_couche[index]["val"].toLowerCase().replace(/ /g, "") ==
            tags.val
        ) {
          i = index;
          break;
        } else if (
          this.tags_couche[index]["cle"].toLowerCase().replace(/ /g, "") ==
            tags.cle &&
          this.tags_couche[index]["val"].toLowerCase().replace(/ /g, "") == ""
        ) {
          i = index;
        }
      }

      if (this.geocode_variable.data.icon) {
        if (
          this.geocode_variable.data.osm_type == "node" ||
          this.geocode_variable.data.osm_type == "relation"
        ) {
          var type_geom = "point";
        } else {
          var type_geom = "Polygon";
        }
      } else {
        var type_geom = "LineString";
      }

      if (i) {
        var resultat = {
          icone: this.tags_couche[i]["couche"].img,
          type_query: this.geocode_variable.type,
          type_geom: type_geom,
          type_geom_smartworld: this.tags_couche[i]["couche"].geom,
          result_smartworld: true,
          data: this.geocode_variable.data,
        };
        console.log(resultat, "resultat");
      } else {
        var resultat = {
          icone: this.geocode_variable.data.icon,
          type_query: this.geocode_variable.type,
          type_geom: type_geom,
          type_geom_smartworld: this.tags_couche[0]["couche"].geom,
          result_smartworld: false,
          data: this.geocode_variable.data,
        };

        console.log(resultat, "resultat");
      }

      this.displayResultGeocodeOnMap(resultat);
    } else if (this.geocode_variable.type == "cartes") {
      if (!this.geocode_variable.data.checked) {
        if (
          this.geocode_variable.data.url_raster ||
          this.geocode_variable.data.url_tile ||
          this.geocode_variable.data.url
        ) {
          /*if (this.geocode_variable.data.url_raster) {
						this.geocode_variable.data.url = this.geocode_variable.data.url_raster
					} else if (this.geocode_variable.data.url_tile) {
						this.geocode_variable.data.url = this.geocode_variable.data.url_tile
					}*/

          var groupe = this.cartes[this.geocode_variable.data.rang_thema];
          this.geocode_variable.data.checked = true;
          this.displayDataOnMap(item, groupe);
        } else {
          this.notif.open(
            "Cette carte n'a pas encore été numérisée",
            "Fermer",
            {
              duration: 2500,
            }
          );
        }
      } else {
        this.notif.open(
          "Cette carte est déja dans vos couches en cours",
          "Fermer",
          {
            duration: 2500,
          }
        );
      }
    } else if (this.geocode_variable.type == "thematiques") {
      if (!this.geocode_variable.data.checked) {
        var groupe = this.thematiques[this.geocode_variable.data.rang_thema];
        this.geocode_variable.data.checked = true;
        this.displayDataOnMap(item, groupe);
      } else {
        this.notif.open(
          "Cette donnée est déja dans vos couches en cours",
          "Fermer",
          {
            duration: 2500,
          }
        );
      }
    } else if (this.geocode_variable.type == "limites") {
      var donne = this.geocode_variable.data;
      this.displayLimitesAdministratives(donne);
    } else if (this.geocode_variable.type == "adresses") {
      var donne = this.geocode_variable.data;
      var coord_4326 = JSON.parse(donne.geometry).coordinates;
      var coord = proj.transform(coord_4326, "EPSG:4326", "EPSG:3857");

      this.data_right_click["coord"] = coord;
      this.getCarateristics();
    } else if (this.geocode_variable.type == "position") {
      var donne = this.geocode_variable.data;
      var o = donne["origine"];
      var k = turf.lengthToDegrees(0.015, "kilometers");
      var polygon = turf.polygon([
        [
          [o[0], o[1]],
          [o[0], o[1] + k],
          [o[0] + k, o[1] + k],
          [o[0] + k, o[1]],
          [o[0], o[1]],
        ],
      ]);

      var position_feaure = new Format.GeoJSON().readFeatures(polygon, {
        dataProjection: "EPSG:4326",
        featureProjection: "EPSG:3857",
      });

      // var vectorFeature = (new Format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })

      var vectorSource = new source.Vector({
        features: position_feaure,
      });

      var primaryColor = this.primaryColor;
      var vectorLayer = new layer.Vector({
        source: vectorSource,
        style: new style.Style({
          fill: new style.Fill({
            color: "rgba(255, 255, 255,0.4)",
          }),
          stroke: new style.Stroke({
            color: primaryColor,
            width: 2,
          }),
        }),
      });

      vectorLayer.setZIndex(99);
      vectorLayer.set("type", "querry");
      vectorLayer.set("name", "querry");
      map.addLayer(vectorLayer);
      map.getView().fit(vectorSource.getExtent(), {
        size: map.getSize(),
        maxZoom: 18,
        duration: 1000,
      });
    }
  }

  displayLimitesAdministratives(donne) {
    var formatArea = function (polygon) {
      var area = Sphere.getArea(polygon);
      var output;
      if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + " " + "km²";
      } else {
        output = Math.round(area * 100) / 100 + " " + "m²";
      }

      return output;
    };
    $("#spinner_loading").show();
    this.geoportailService
      .getLimiteById({ id: donne.id, table: donne.type })
      .then((data: Object[]) => {
        $("#spinner_loading").hide();
        if (data["status"] == "ok") {
          donne.name = data["data"].name;
          donne.ref = data["data"].ref;
          var a = {};
          a["type_query_action"] = "setWord_geocode";
          a["value"] =
            donne.type_display + " : " + donne.name + " (" + donne.ref + ")";
          this.communicationComponent.updateData(Object.create(a));

          var newMarker = new Format.GeoJSON().readFeatures(
            JSON.parse(data["data"]["st_asgeojson"]),
            {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            }
          );
          newMarker[0].set("data", donne);

          var markerSource = new source.Vector({
            features: newMarker,
          });

          var rgb = this.hexToRgb(this.primaryColor);
          var primaryColor = this.primaryColor;

          if (donne.ref) {
            var texte =
              donne.type_display +
              " : \n" +
              data["data"].name +
              " (" +
              data["data"].ref +
              "), " +
              formatArea(newMarker[0].getGeometry());
          } else {
            var texte =
              donne.type_display +
              " : \n" +
              data["data"].name +
              " , " +
              formatArea(newMarker[0].getGeometry());
          }
          var LayThe = new layer.Vector({
            source: markerSource,
            style: function (feature) {
              var styleDefaultII = new style.Style({
                stroke: new style.Stroke({
                  color: primaryColor,
                  width: 2,
                }),
                fill: new style.Fill({
                  color: [rgb.r, rgb.g, rgb.b, 0.4],
                }),
                text: new style.Text({
                  font: "15px Calibri,sans-serif", //formatArea
                  text: texte,
                  fill: new style.Fill({ color: "#000" }),
                  stroke: new style.Stroke({ color: "#000", width: 1 }),
                  offsetX: 0,
                  offsetY: 0,
                  //rotation: rotation
                }),
              });
              return styleDefaultII;
            },
            visible: true,
          });

          LayThe.setZIndex(99);

          LayThe.set("type", "querry");

          LayThe.set("name", "querry");

          map.addLayer(LayThe);
          map.getView().fit(markerSource.getExtent(), {
            size: map.getSize(),
            maxZoom: 19,
            duration: 1000,
          });
        }
      });
  }

  displayResultGeocodeOnMap(donne) {
    console.log(donne);

    var rgb = this.hexToRgb(this.primaryColor);
    var primaryColor = this.primaryColor;

    if (donne.type_query == "nominatim") {
      if (donne.result_smartworld) {
        if (donne.type_geom == donne.type_geom_smartworld) {
          var type_geom = donne.type_geom;
        } else {
          var type_geom = donne.type_geom_smartworld;
        }
      } else {
        var type_geom = donne.type_geom;
      }

      if (donne.icone) {
        if (donne.result_smartworld) {
          var url = this.url_prefix + donne.icone;
          var scale = 0.2;
        } else {
          var url = "" + donne.icone;
          var scale = 1.5;
        }
      }
    } else {
      var type_geom = donne.type_geom;
      var url = this.url_prefix + donne.icone;
      var scale = 0.2;
    }

    if (type_geom == "point") {
      var feat = [];
      var coord;
      if (donne.type_query == "nominatim") {
        coord = proj.transform(
          [
            parseFloat(this.geocode_variable.data.lon),
            parseFloat(this.geocode_variable.data.lat),
          ],
          "EPSG:4326",
          "EPSG:3857"
        );

        if (donne.data.polygonpoints && donne.data.type == "administrative") {
          var coord_polys = this.convertepolygon(donne.data.polygonpoints);

          var newMarker = new Feature({
            geometry: new geom.Polygon([coord_polys]),
          });

          feat.push(newMarker);
        }
      } else {
        coord = proj.transform(
          [parseFloat(donne["coord"][0]), parseFloat(donne["coord"][1])],
          "EPSG:4326",
          "EPSG:3857"
        );
      }

      var newMarker = new Feature({
        geometry: new geom.Point(coord),
        data: donne.data,
      });
      feat.push(newMarker);

      var markerSource = new source.Vector({
        features: feat,
      });

      var LayThe = new layer.Vector({
        source: markerSource,
        style: function (feature) {
          console.log(feature.getGeometry().getType());
          if (feature.getGeometry().getType() == "Point") {
            var styleDefaultII = new style.Style({
              image: new style.Icon({
                scale: scale,
                src: url,
              }),
            });
          } else {
            var styleDefaultII = new style.Style({
              stroke: new style.Stroke({
                color: primaryColor,
                width: 2,
              }),
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.4],
              }),
            });
          }

          return styleDefaultII;
        },
        visible: true,
      });
    } else if (type_geom == "Polygon") {
      var coord_poly;
      if (donne.type_query == "nominatim") {
        coord_poly = this.convertepolygon(donne.data.polygonpoints);
      } else {
        coord_poly = this.convertepolygon(donne.coord);
      }

      console.log(coord_poly);

      if (donne.icone) {
        var cnv = document.createElement("canvas");
        var ctx = cnv.getContext("2d");
        var img = new Image();
        img.src = url;
        donne.data.img = url;
        img.onload = () => {
          var newMarker = new Feature({
            geometry: new geom.Polygon([coord_poly]),
            data: donne.data,
            ptestyle: { img: ctx.createPattern(img, "repeat") },
          });

          var markerSource = new source.Vector({
            features: [newMarker],
          });

          var LayThe = new layer.Vector({
            source: markerSource,
            style: stylePolygon,
            visible: true,
          });

          LayThe.setZIndex(99);

          LayThe.set("type", "querry");

          LayThe.set("name", "querry");

          map.addLayer(LayThe);
          map.getView().fit(markerSource.getExtent(), {
            size: map.getSize(),
            maxZoom: 17,
            duration: 1000,
          });
        };
      } else {
        var newMarker = new Feature({
          geometry: new geom.Polygon([coord_poly]),
          data: donne.data,
        });

        var markerSource = new source.Vector({
          features: [newMarker],
        });

        var LayThe = new layer.Vector({
          source: markerSource,
          style: function (feature) {
            var styleDefaultII = new style.Style({
              stroke: new style.Stroke({
                color: primaryColor,
                width: 2,
              }),
              fill: new style.Fill({
                color: [rgb.r, rgb.g, rgb.b, 0.4],
              }),
            });

            return styleDefaultII;
          },
          visible: true,
        });
      }
    } else if (type_geom == "LineString") {
      var coord_poly;
      if (donne.type_query == "nominatim") {
        coord_poly = this.convertepolygon(donne.data.polygonpoints);
      } else {
        coord_poly = this.convertepolygon(donne.coord);
      }

      var newMarker = new Feature({
        geometry: new geom.LineString(coord_poly),
        data: donne.data,
      });

      var markerSource = new source.Vector({
        features: [newMarker],
      });

      var LayThe = new layer.Vector({
        source: markerSource,
        style: function (feature) {
          var styleDefaultII = new style.Style({
            stroke: new style.Stroke({
              color: primaryColor,
              width: 5,
            }),
          });

          return styleDefaultII;
        },
        visible: true,
      });
    }

    if (LayThe) {
      LayThe.setZIndex(99);

      LayThe.set("type", "querry");

      LayThe.set("name", "querry");

      map.addLayer(LayThe);
      console.log(markerSource.getExtent());
      map.getView().fit(markerSource.getExtent(), {
        size: map.getSize(),
        maxZoom: 15,
        duration: 1000,
      });
    }
  }

  displayComments() {
    this.commentLayer.checked = !this.commentLayer.checked;
    this.displayDataOnMap(this.commentLayer, {
      shema: this.commentLayer.shema,
    });
  }

  printMap() {
    $("#loading_print").show();

    function getCenterOfExtent(ext) {
      var X = ext[0] + (ext[2] - ext[0]) / 2;
      var Y = ext[1] + (ext[3] - ext[1]) / 2;
      return [X, Y];
    }

    function getmetricscal() {
      var px = $(".ol-scale-line-inner").css("width");

      var numpx = px.replace(/\D+/g, "");
      var distancecarte = numpx * 0.264583 * 0.1;

      var scale = $(".ol-scale-line-inner").text();
      var numscale = scale.replace(/\D+/g, "");

      var unit = scale.replace(/[0-9]/g, "");

      if (unit == " km") {
        numscale = numscale * 100000;
      } else if (unit == " m") {
        numscale = numscale * 100;
      }

      var dem = numscale / distancecarte;

      return dem;
    }

    map.once("postcompose", (event) => {
      var extents = map.getView().calculateExtent(map.getSize());
      var center = getCenterOfExtent(extents);
      var WGS84 = proj.transform(
        [center[0], center[1]],
        "EPSG:3857",
        "EPSG:4326"
      );

      var canvas = event.context.canvas;
      var label = "png";
      var type = "base64";
      var format = "png";

      var images = {
        png0: canvas.toDataURL("image/png"),
        png1: "data:image/png;base64,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",
      };

      this.PrrintService.createPDFObject(
        images,
        label + " " + type,
        format,
        "none",
        WGS84,
        getmetricscal(),
        this.titre,
        this.description
      );
    });

    map.renderSync();
  }

  delete_all_couches() {
    for (let index = 0; index < this.layerInMap.length; index++) {
      const layer = this.layerInMap[index];
      if (layer["principal"] && layer["principal"] == true) {
      } else {
        // console.log(layer)
        setTimeout(() => {
          layer.checked = false;
          this.displayDataOnMap(layer, undefined);
        }, 500);
      }
    }
  }

  draw_itineraire;
  source_itineraire;
  vector_itineraire;

  data_itineraire = {
    depart: {
      nom: "",
      coord: [],
      set: false,
    },
    destination: {
      nom: "",
      coord: [],
      set: false,
    },
    route: {
      loading: false,
      set: false,
      data: undefined,
    },
  };

  layer_itineraire;
  initialise_layer_itineraire() {
    var mysource = new source.Vector({ wrapX: false });

    this.layer_itineraire = new layer.Vector({
      source: mysource,
      style: (feature) => {
        console.log(feature.getGeometry().getType());
        if (feature.getGeometry().getType() == "Point") {
          if (feature.get("data") == "depart") {
            return new style.Style({
              image: new style.Icon({
                src: "assets/images/settings/depart.svg",
                scale: 2,
              }),
            });
          } else {
            return new style.Style({
              image: new style.Icon({
                src: "assets/images/settings/itineraire-arrivée_icone.svg",
                scale: 1,
              }),
            });
          }
        } else {
          return new style.Style({
            stroke: new style.Stroke({
              width: 6,
              color: this.primaryColor,
            }),
          });
        }
      },
    });

    this.layer_itineraire.setZIndex(1000);
    map.addLayer(this.layer_itineraire);
  }

  positioner_marker(type) {
    if (type == "depart") {
      var color = "rgb(0, 158, 255)";
    } else {
      var color = "rgb(255, 107, 0)";
    }
    if (this.draw_itineraire) {
      map.removeInteraction(this.draw_itineraire);
    }

    this.source_itineraire = new source.Vector({ wrapX: false });

    this.vector_itineraire = new layer.Vector({
      source: this.source_itineraire,
    });

    var addInteraction = () => {
      this.draw_itineraire = new interaction.Draw({
        source: this.source_itineraire,
        type: "Point",
        style: new style.Style({
          image: new style.Circle({
            radius: 5,
            fill: new style.Fill({
              color: color,
            }),
          }),
        }),
      });
      map.addInteraction(this.draw_itineraire);
    };

    addInteraction();

    this.translate
      .get("notifications", { value: "partager" })
      .subscribe((res: any) => {
        var notif = this.notif.open(res.click_on_map_itineraire, "Fermer", {
          duration: 20000,
        });

        this.draw_itineraire.on("drawend", (e) => {
          notif.dismiss();

          var coord = e.feature.getGeometry().getCoordinates();
          var coord_4326 = proj.transform(coord, "EPSG:3857", "EPSG:4326");
          var mygeom = new geom.Point(e.feature.getGeometry().getCoordinates());

          var newMarker = new Feature({
            geometry: mygeom,
            data: type,
          });
          var feat_to_remove;
          for (
            let index = 0;
            index < this.layer_itineraire.getSource().getFeatures().length;
            index++
          ) {
            const my_feat = this.layer_itineraire.getSource().getFeatures()[
              index
            ];
            if (my_feat.get("data") == type) {
              feat_to_remove = my_feat;
            }
          }

          if (feat_to_remove) {
            this.layer_itineraire.getSource().removeFeature(feat_to_remove);
          }
          this.layer_itineraire.getSource().addFeature(newMarker);
          this.data_itineraire[type]["coord"] = coord_4326;
          this.data_itineraire[type]["set"] = true;

          var geocodeOsm =
            "https://nominatim.openstreetmap.org/reverse?format=json&lat=" +
            coord_4326[1] +
            "&lon=" +
            coord_4326[0] +
            "&zoom=18&addressdetails=1";

          $.get(geocodeOsm, (data) => {
            // console.log(data)
            var name = data.display_name.split(",")[0];
            this.data_itineraire[type]["nom"] = name;
          });

          // console.log(this.layer_itineraire.getSource())
          this.calculate_itineraire();
          map.removeInteraction(this.draw_itineraire);
        });
      });
  }

  calculate_itineraire() {
    if (
      this.data_itineraire.depart.coord.length == 2 &&
      this.data_itineraire.destination.coord.length == 2
    ) {
      var a = this.data_itineraire.depart.coord;
      var b = this.data_itineraire.destination.coord;
      this.data_itineraire.route.loading = true;
      this.data_itineraire.route.set = false;
      var url =
        "http://router.project-osrm.org/route/v1/driving/" +
        a[0] +
        "," +
        a[1] +
        ";" +
        b[0] +
        "," +
        b[1] +
        "?overview=full";
      $.get(url, (data) => {
        // console.log(data)
        this.data_itineraire.route.loading = false;

        if (data["routes"] && data["routes"].length > 0) {
          this.data_itineraire.route.data = data;
          this.display_itineraire(data);
        }
      });
    }
  }

  display_itineraire(data) {
    var route = new Format.Polyline({
      factor: 1e5,
    }).readGeometry(data.routes[0].geometry, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857",
    });

    var newMarker = new Feature({
      data: "route",
      geometry: route,
    });

    var feat_to_remove;
    for (
      let index = 0;
      index < this.layer_itineraire.getSource().getFeatures().length;
      index++
    ) {
      const my_feat = this.layer_itineraire.getSource().getFeatures()[index];
      if (my_feat.get("data") == "route") {
        feat_to_remove = my_feat;
      }
    }

    if (feat_to_remove) {
      this.layer_itineraire.getSource().removeFeature(feat_to_remove);
    }
    this.data_itineraire.route.set = true;
    this.layer_itineraire.getSource().addFeature(newMarker);
  }

  formatTimeInineraire(timesSecondes: number): string {
    // var startTime = moment(document.getElementById("startTime").value, "HH:mm");
    // var endTime = moment(document.getElementById("end").value, "HH:mm");

    var duration = moment.duration(timesSecondes, "seconds");
    var hours = "0" + duration.hours();
    var minutes = "0" + duration.minutes();
    // console.log(hours.slice(-2),minutes.slice(-2))
    // document.getElementById('dateDiffResult').value = hours +":"+ minutes;
    return hours.slice(-2) + ":" + minutes.slice(-2);
  }

  formatDistance(distanceMeters: number): string {
    var distanceKm = distanceMeters / 1000;
    return distanceKm.toFixed(2);
  }

  clear_itineraire() {
    this.layer_itineraire.getSource().clear();
    this.data_itineraire.route.set = false;
    this.data_itineraire.depart.coord = [];
    this.data_itineraire.depart.nom = "";
    this.data_itineraire.destination.coord = [];
    this.data_itineraire.destination.nom = "";
  }

  coucheSelected(couche, groupe, event: MatSelectionListChange) {
    //  let couche: coucheInterface = event.option.value;
    couche.checked = event.option.selected;
    this.displayDataOnMap(couche, groupe);

    //  this.displayDataOnMap(data);
  }

  /* displayOnMap(couche) {
    var couche1 = couche.option.value;

    this.communicationComponent.get_thematique_by_rang(couche1.rang_thema);
    console.log(couche1.check);
    this.toogle_couche.emit(couche1);
  }*/
}

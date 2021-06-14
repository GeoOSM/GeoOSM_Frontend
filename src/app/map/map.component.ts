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

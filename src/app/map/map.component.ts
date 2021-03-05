import {
  Component,
  OnInit,
  ViewChild,
  NgZone,
  HostBinding,
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Meta } from "@angular/platform-browser";
import { OrderBy } from "../filter/orderby";
import { Observable } from "rxjs";
import { map as MAP, startWith, skip, filter } from "rxjs/operators";
import { MatSidenavModule } from "@angular/material/sidenav";
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
import { communicationComponent } from "../service/communicationComponent.service";
import { environment } from "../../environments/environment";
import { AddGeosignetsComponent } from "../composant/add-geosignets/add-geosignets.component";
import { PrrintService } from "../service/prrint.service";

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
  collapsed: false,
});
const map = new Map({
  layers: [],
  target: "map",
  loadTilesWhileAnimating: true,
  view: view,
  controls: Control.defaults({ attribution: true }).extend([
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

  titre: string = "";
  description: string = "";

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
  /*printMapObjet = {
		'titre': '',
		'description': '',
	}*/

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
      $(".utils").css("left", "230px");
      $("#notifications").css("left", "300px");
      $("#mouseposition").css("left", "300px");
      $("#bloc_caracteristique").css("left", "300px");
    } else {
      $("#bloc_caracteristique").css("left", "65px");

      $(".utils").css("left", "0px");
      $("#notifications").css("left", "65px");
      $("#mouseposition").css("left", "65px");
      $(".slide2").css("left", "-260px");
      $(".title_rollback_slide2").css("left", "-260px");
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
  all_extends: any[];

  constructor(
    private zone: NgZone,
    public notif: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    public dialog: MatDialog,
    public MetaData: MatDialog,
    private cartesService: cartesService,
    private thematiqueService: thematiqueService,
    private geoportailService: geoportailService,
    private communicationComponent: communicationComponent,
    private activatedRoute: ActivatedRoute,
    private meta: Meta,
    private PrrintService: PrrintService,
    public translate: TranslateService,
    private builder: FormBuilder
  ) {
    this.environment = environment;
    if (localStorage.getItem("signets")) {
      for (
        let index = 0;
        index < localStorage.getItem("signets").split(";").length;
        index++
      ) {
        const element = localStorage.getItem("signets").split(";")[index];
        this.geoSignets.push(JSON.parse(element));
      }
    }
  }

  public formAnalyse_spatial = this.builder.group({
    id: [, Validators.required],
  });

  extend_active_id;
  fitExtendOfOne(extend_active) {
    // console.log(extend_active)
    if (typeof extend_active === "object" && extend_active["geometry"]) {
      this.extend_active_id = extend_active["id"];
      console.log(extend_active);
      var feature_active = new Format.GeoJSON().readFeatures(
        JSON.parse(extend_active["geometry"]),
        {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }
      );
      var my_source = new source.Vector();
      my_source.addFeatures(feature_active);
      var extent = my_source.getExtent();
      map
        .getView()
        .fit(extent, { size: map.getSize(), maxZoom: 7, duration: 1000 });
    }
  }

  ngOnInit() {
    ///////// shadow getInternalFile ////////////////////////////

    this.geoportailService.getConfigProjet().then((config) => {
      this.config_projet = config;
      this.communicationComponent.setConfigProjet(this.config_projet);
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

            this.geoportailService
              .getAllExtents()
              .then((all_extends: any[]) => {
                // console.log(all_extends)
                this.all_extends = all_extends;
                this.communicationComponent.set_all_extends(this.all_extends);

                if (all_extends.length > 0) {
                  var extend_active;
                  for (let index = 0; index < all_extends.length; index++) {
                    const element = all_extends[index];
                    if (element["active"]) {
                      extend_active = element;
                    }
                  }

                  if (extend_active) {
                    this.communicationComponent.changeExtent.next(
                      extend_active
                    );
                    // setTimeout(() => {
                    this.communicationComponent.changeExtent
                      .pipe(
                        filter((value) => typeof value == "object"),
                        skip(1)
                      )
                      .subscribe((extend_active) => {
                        // if (this.extend_active_id != extend_active['id']) {
                        // console.log(this.extend_active_id,extend_active)
                        this.fitExtendOfOne(extend_active);
                        // }
                      });
                    // }, 3000);
                  }

                  if (!share && extend_active) {
                    this.fitExtendOfOne(extend_active);
                  }
                }
              });

            if (!share) {
              map.getView().fit(this.extent_cameroun, {
                size: map.getSize(),
                duration: 1000,
              });
              console.log("qsddzfzefzee");
            }
          });

          map.on("moveend", () => {
            var bbox_cam = turf.bboxPolygon(this.extent_cameroun);
            var bbox_view = turf.bboxPolygon(map.getView().calculateExtent());

            var bool = turf.intersect(
              turf.toWgs84(bbox_view),
              turf.toWgs84(bbox_cam)
            );
            //
            if (!bool) {
              map.getView().fit(this.extent_cameroun, {
                size: map.getSize(),
                maxZoom: 7,
                duration: 1000,
              });
            }
          });
        });
    });

    /////////// //shadow ////////////////////

    this.caracteristicsPoint["display"] = false;

    this.data_right_click["item"] = [];
    this.initialise_right_click();

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
                      var type_geom = this.thematiques[i].sous_thematiques[j]
                        .couches[k].geom;
                      var icone = this.thematiques[i].sous_thematiques[j]
                        .couches[k].img;
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
              this.cartes[i].sous_cartes[j].couches[k].id_cat = this.cartes[i][
                "id_cartes"
              ];
              this.cartes[i].sous_cartes[j].couches[
                k
              ].id_sous_cat = this.cartes[i].sous_cartes[j]["key"];
              this.cartes[i].sous_cartes[j].couches[
                k
              ].id_sous_cat_couche = this.cartes[i].sous_cartes[j].couches[k][
                "key_couche"
              ];

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
                  ] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["name"];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "urlFile"
                  ] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["url"];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "url"
                  ] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["url_tile"];
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
                  ] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["type"];
                  this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index][
                    "commentaire"
                  ] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[
                    index
                  ]["description"];
                }
              }

              this.cartes[i].sous_cartes[j].couches[k].inLayerTree = true;
              this.cartes[i].sous_cartes[j].couches[
                k
              ].statusDescription_inf = false;
            }
          }
        } else {
          for (var j = 0; j < this.cartes[i].couches.length; j++) {
            this.cartes[i].couches[j].rang_thema = i;
            this.cartes[i].couches[j].id_cat = this.cartes[i]["id_cartes"];
            this.cartes[i].couches[j].id_sous_cat = false;
            this.cartes[i].couches[j].id_sous_cat_couche = this.cartes[
              i
            ].couches[j]["key_couche"];

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
                this.cartes[i].couches[j].cartes_pdf[index][
                  "id_cat"
                ] = this.cartes[i]["id_cartes"];
                this.cartes[i].couches[j].cartes_pdf[index][
                  "id_sous_cat"
                ] = false;
                this.cartes[i].couches[j].cartes_pdf[index][
                  "id_sous_cat_couche"
                ] = this.cartes[i].couches[j]["key_couche"];

                this.cartes[i].couches[j].cartes_pdf[index][
                  "nom"
                ] = this.cartes[i].couches[j].cartes_pdf[index]["name"];
                this.cartes[i].couches[j].cartes_pdf[index][
                  "urlFile"
                ] = this.cartes[i].couches[j].cartes_pdf[index]["url"];
                this.cartes[i].couches[j].cartes_pdf[index][
                  "url"
                ] = this.cartes[i].couches[j].cartes_pdf[index]["url_tile"];
                this.cartes[i].couches[j].cartes_pdf[index]["opacity"] = 100;
                this.cartes[i].couches[j].cartes_pdf[index]["display"] = true;
                this.cartes[i].couches[j].cartes_pdf[index]["typeInf"] =
                  "sous_cartes_pdf";
                this.cartes[i].couches[j].cartes_pdf[index][
                  "type"
                ] = this.cartes[i].couches[j].cartes_pdf[index]["type"];
                this.cartes[i].couches[j].cartes_pdf[index][
                  "commentaire"
                ] = this.cartes[i].couches[j].cartes_pdf[index]["description"];
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
              this.thematiques[i].sous_thematiques[j].couches[
                k
              ].id_cat = this.thematiques[i].id_thematique;
              this.thematiques[i].sous_thematiques[j].couches[k][
                "id_sous_cat"
              ] = this.thematiques[i].sous_thematiques[j].key;
              this.thematiques[i].sous_thematiques[j].couches[k][
                "id_sous_cat_couche"
              ] = this.thematiques[i].sous_thematiques[j].couches[k].key_couche;

              this.thematiques[i].sous_thematiques[j].couches[
                k
              ].checked = false;

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
                  element["couche"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k];
                  var operateur = this.thematiques[i].sous_thematiques[j]
                    .couches[k].cles_vals_osm[index]["operateur"];
                  element["cle"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k].cles_vals_osm[index]["action"];
                  element["val"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k].cles_vals_osm[index]["nom"];

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
                  element["couche"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k];
                  var operateur = this.thematiques[i].sous_thematiques[j]
                    .couches[k].cles_vals_osm[index]["operateur"];
                  element["cle"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k].cles_vals_osm[index]["action"];
                  element["val"] = this.thematiques[i].sous_thematiques[
                    j
                  ].couches[k].cles_vals_osm[index]["nom"];

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
                this.commentLayer = this.thematiques[i].sous_thematiques[
                  j
                ].couches[k];
                this.commentLayer.shema = this.thematiques[i].shema;
                this.thematiques[i].sous_thematiques[j].couches.splice(k, 1);
              }
            }
          }
        } else {
          for (var j = 0; j < this.thematiques[i].couches.length; j++) {
            var resume = "";
            this.thematiques[i].couches[j].rang_thema = i;
            this.thematiques[i].couches[j].id_cat = this.thematiques[
              i
            ].id_thematique;
            this.thematiques[i].couches[j]["id_sous_cat"] = false;
            this.thematiques[i].couches[j][
              "id_sous_cat_couche"
            ] = this.thematiques[i].couches[j].key_couche;

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
                var operateur = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["operateur"];
                element["cle"] = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["action"];
                element["val"] = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["nom"];

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
                var operateur = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["operateur"];
                element["cle"] = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["action"];
                element["val"] = this.thematiques[i].couches[j].cles_vals_osm[
                  index
                ]["nom"];

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
              var dataFeature = feature.getProperties()["features"][0]["O"][
                "data"
              ];
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
              var dataFeature = feature.getProperties()["features"][0]["O"][
                "data"
              ];
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
              var dataFeature = feature.getProperties()["features"][0]["O"][
                "data"
              ];
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
              var dataFeature = feature.getProperties()["features"][0]["O"][
                "data"
              ];
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
              var dataFeature = feature.getProperties()["features"][0]["O"][
                "data"
              ];
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
      this.chart_analyse_spatiale[
        this.chart_analyse_spatiale.length
      ] = new Chart(pte["name_analyse"], {
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

  initialise_right_click() {
    console.log(this.translate.currentLang);
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
  }

  right_click(e) {
    this.initialise_right_click();
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

        var signets_text = [];
        for (let index = 0; index < this.geoSignets.length; index++) {
          const element = this.geoSignets[index];
          signets_text.push(JSON.stringify(element));
        }
        localStorage.setItem("signets", signets_text.join(";"));

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
        if (this.layerInMap[i].type_couche_inf == "thematiques") {
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
              ",false," +
              this.layerInMap[i].id_cat;
          }

          urls.push({
            url: url,
            rang: this.layerInMap[i].zIndex_inf,
          });
        } else if (this.layerInMap[i].type_couche_inf == "cartes") {
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
                ",false," +
                this.layerInMap[i].id_cat +
                "," +
                this.layerInMap[i].id;
            } else {
              var url =
                "map," +
                this.layerInMap[i].id_sous_cat_couche +
                ",false," +
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
                            this.cartes[i].sous_cartes[j].couches[
                              k
                            ].checked = true;
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
            setTimeout(() => {
              map.getView().setZoom(parseFloat(location[2]));
              map.getView().setCenter(this.data_right_click["coord"]);
              this.getCarateristics();
            }, 4000);
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
            if (
              this.cartes[i].sous_cartes[j].couches[k].principal &&
              !this.cartes[i].sous_cartes[j].couches[k]["constructMapBind"]
            ) {
              var target =
                "map" +
                this.cartes[i].sous_cartes[j].couches[k].key_couche +
                "true" +
                this.cartes[i].sous_cartes[j].key;
              this.cartes[i].sous_cartes[j].couches[k][
                "constructMapBind"
              ] = true;
              this.displayDataOfBindOnMap(
                this.cartes[i].sous_cartes[j].couches[k],
                target
              );
            }
          }
        }
      } else {
        for (var j = 0; j < this.cartes[i].couches.length; j++) {
          if (
            this.cartes[i].couches[j].principal &&
            !this.cartes[i].couches[j]["constructMapBind"]
          ) {
            var target =
              "map" +
              this.cartes[i].couches[j].key_couche +
              "false" +
              this.cartes[i].id_cartes;
            this.cartes[i].couches[j]["constructMapBind"] = true;
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
          table: "comments",
          shema: "public",
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
              "Vos coordonnées sont en hors du pays",
              "Fermer",
              {
                duration: 5000,
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
          derniere_position_de_scroll_connue = document.getElementsByClassName(
            "slide2"
          )[0].scrollTop;

          if (!ticking) {
            window.requestAnimationFrame(() => {
              faitQuelquechose(derniere_position_de_scroll_connue);

              ticking = false;
            });
          }
          ticking = true;
        });
    } else if (this.typeMenu == "menuThematique") {
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

    $(".slide2").css("left", "0px");
    $(".title_rollback_slide2").css("left", "5px");
    $(".slide2").css("bottom", "0px");
    // $('.mat-drawer').css('overflow-y', 'inherit');
    // $('.slide2').css('overflow-y', 'initial');
  }

  slide2_is_open() {
    // console.log(document.getElementsByClassName('slide2')[0]['style']['left'] == "0px")
    if (
      document.getElementsByClassName("slide2")[0]["style"]["left"] == "0px"
    ) {
      return true;
    } else {
      return false;
    }
  }
  slideBack(): any {
    $(".slide2").css("left", "-260px");
    $(".title_rollback_slide2").css("left", "-260px");
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
            this.count_draw[feature.get("type")][
              feature.get("id")
            ].geometry = feature.getGeometry().getCoordinates();
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
                html:
                  "© Contributeurs <a  target='_blank'  href='https://www.openstreetmap.org/copyright'>  OpenStreetMap </a> ",
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
                      scale: 0.4,
                      // size:[40,40],
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
                      scale: 0.4,
                      // size:[40,40],
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
    setTimeout(() => {
      console.log(data, target1, 1);
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
              var bbox = this.cartes[i].sous_cartes[j].couches[k].bbox.split(
                ","
              );

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
                    this.cartes[i].sous_cartes[j].couches[
                      k
                    ].isInMapVieuw = boolZoom;
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
              var identifiant = this.cartes[i].sous_cartes[j].couches[k]
                .identifiant;

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
                    this.cartes[i].sous_cartes[j].couches[
                      k
                    ].isInMapVieuw = false;
                    this.toogleVisibilityLayer(
                      this.cartes[i].sous_cartes[j].couches[k]
                    );
                    this.cartes[i].sous_cartes[j].couches[k].visible = false;
                  } else if (
                    boolZoom == true &&
                    this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw ==
                      false
                  ) {
                    this.cartes[i].sous_cartes[j].couches[
                      k
                    ].isInMapVieuw = true;

                    this.toogleVisibilityLayer(
                      this.cartes[i].sous_cartes[j].couches[k]
                    );
                    this.cartes[i].sous_cartes[j].couches[k].visible = true;
                  }
                }
              }
            }

            if (this.cartes[i].sous_cartes[j].couches[k].type == "pdf") {
              var coord = this.cartes[i].sous_cartes[j].couches[k].geom.split(
                ","
              );
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
      console.log(couche);
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
                  var value = this.chart_drape.data.datasets[
                    firstPoint._datasetIndex
                  ].data[firstPoint._index];
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

      var type_geom = this.geocode_variable.data.geojson.type;
      if (type_geom == "Point") {
        type_geom = "point";
      }
      // if (this.geocode_variable.data.icon) {
      // 	if (this.geocode_variable.data.osm_type == 'node' || this.geocode_variable.data.osm_type == 'relation') {
      // 		var type_geom = 'point'
      // 	} else {
      // 		var type_geom = 'Polygon'
      // 	}
      // } else {
      // 	var type_geom = 'LineString'
      // }

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
            if (!url) {
              url = "assets/images/icones/location-pin.svg";
            }
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
        coord_poly = Object.create(
          new Format.GeoJSON()
            .readFeatures(donne.data.geojson, {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            })[0]
            .getGeometry()
        ).getCoordinates()[0];
        // coord_poly = this.convertepolygon(coord_poly)
      } else {
        coord_poly = this.convertepolygon(donne.coord);
      }

      console.log(coord_poly);

      if (donne.icone && false) {
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
        coord_poly = Object.create(
          new Format.GeoJSON()
            .readFeatures(donne.data.geojson, {
              dataProjection: "EPSG:4326",
              featureProjection: "EPSG:3857",
            })[0]
            .getGeometry()
        ).getCoordinates();

        // coord_poly = this.convertepolygon(donne.data.polygonpoints)
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
        png1:
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKIAAAA/CAYAAABjChOGAAAJw0lEQVR4Xu2dS6scRRSA66SSeH2gCeJjZSIiLqMEfIBoRQRFFyaouNCYChIQCRr9IxGiCKLYieBCRRMQBDfpKL42GgQXCmJ04QNEDYJiYudIjdXXuj31OPWYuTN3alaXO9XVVae+Oq863QOsfoISQMStXMhvbQ27trkaAE4FO6kNvBKAKp9xCfTgdW2zlwv5SkhGXdvsAoCjoXb1e7cEKoiGbBBxExfytxRgFLQA0KRcW69hrIKoKUDE67mQn+dAUTVjuvQqiIwxF4Rd2zzNGDvJhTxOFXHXNjcAwElq+9ruPwksPIg+c9y1zWYA+F0JSrVjjCmtGYTSvK6CRpMACUS9CNuMLk+vlV2/7vY96IiGrT6fq/2wj3MnDpNkS1umtd/KKixE3MmFfJs6/a5tDjDGjs1bGsMHlUurUUFUZh0AnqXKcNHbrQAREQXF9PiENi9myTfXrm12MMZO2TYWFUQlo5pjpG+vZRAR8QAX8iD9UnfLeYAxRRtqX9GZ3LZJpJpoGlEjEGNNMaXrWV4ARJShRLVr/LFWo6Z0KLToqDnG3NC6HZmlmU3wUubrApFybQ1cqJT83w4o2kH7O7sYY6NUhk5jBM34LGpFivb3jTsFxBq4hMGEgK/kjfxCR2Kz6CtSQPIlpVNPYGZxU4bxmF4LL4gU4QUqU3YAQDu96fjv5Bvr8EoVOdvGTgHZNopZdlVmYX2cIMaYE9/iUGDWAZM3ddS1jWSMncjJVcZkBkqDqOZIlYULjJA27tpmJwAco4ClNiVjbMuwLQCc6P/nOfr03gcR93AhxwpAfGvoA5GszXJApPhsFm2VVANI1Wa+TUjtw6EVyTI1r0+RUQh61zzUdVTLMdysiPgUF5KUxB+6bUVAVDuHMabOYocfa1K4b5S5qFE1gFTh6sDMCkxMHy6tFAJkeF2mjJbPyqn9Umsw+/508l8VhkSXz5kwFgGRYgqogojpK6bSJcYsG0JesZApmmk4nxgQcyDs71syDRWzNtS2/fhWBcTYpLBvUtSFTVnU4RFdSh8Wt4KkyUvJyBUklZgLFTZfu968rwqIJYXgCioGPlZ05bUN8FLjpmyeUvdyBUkl+88FUslj6iCG/Cxb7jEULYYWNsWk2sx+qcUjjNe7cSxBgvf821Z8EZqLLgpuzHpMqh84vF/ILYoGMQSExQyNHfP5oPBVq/hOgEILGxI6JbAoZSpdGmqgwZ2pLJcFCBT4jgVfqQcZIVm6DjF86zeak6tj24RTFmMISWqqx6dJpwFiaAFizFMoyPLJOeX40VZ4kbEOzlrVUO7Zw9reuQFRLbQv9+UDIQWi4UZM6cM1ppBfG6iVdKZkYjZDBojR2pqSrpspELu2ET5hciGtx4U+LRHySamwlAQxZJ5DlqdEwW0GiE7/NbTBfPecKRBjdrTZNgBictV5328IjJRxl3Yn9OMaJ80julQrkTq2CqLnQaVQxEbJUeb0QQmEbG1yNXBIa6ZqRJ+LNDUQXUKNca5zBWwbQ4oDH9JiZp/THrMaW6jELjR+9b2v4qeC6Hh8kyLYFO2SCtFqg1gQRutJTgVxTkA0UxGpMFPMPmUDUqvoPYHXWKRdQfSAGHKSKYs2bJMDUUxJVMzYcopklRvEGFMnKcG3lPVjst2vgjgnIE4yYg459TFQ9yacMaaeTHQ+R1TqYGE1ghXyU3iejPnYMy85OzF2gXxCC/XVm+aUc2pC30WS0jHaf25BVJOkmsqYY8JUEH1R5CSi5n7+OaY9JbgKbZ7Uuc41iKEz0ZDQHJU0vrNKZyl9atFDqqPf5+FmDURPUYG3AmfmQaQslD56G70BzHjoRr2izft8gm33hvJjjmIL75sZJnGy0hcKlAaREqiE1sRSBuaVT8mih4n5iCGtFvJ3PCkDp49ZenEDIEYXxRrR5mZqDR5VTpRnvUOblXqvvl1skW/IJYtxxcyxes+addRV7AVMvsn335U8uw0dZeVsNAVNKBotAYWtj1Kb1VWaleqrT1Qj5iyWTYiThMO8H8XM5cxN5xGTiyaGsqGOVyuHZE1u3tel3WYWxJwFG8BBfuY4Z9dHLmrUi0dN06wek3X9xsqktKFhObJgLBVhD+c5MdNs3iijfo/0dNpwUrGPH6jrKRqXKjwfTH1QkLNhDKjJeVmLjKK0MkU+M60RLQJQr6VQ0fHYa4yVRlJv3C/5Lm19fKXut+KEQEV9+g2uyW/rT4VJaZXUaweWokgS2+ZfT2ItYrV9bvuFeeF4qqbXfmKWiYxxI3IXdF6vXxgQU33gPgeXc9QXSofMKzwlx71QIKbm53Qah/QbK5ZIuf4AEIHYhQJRp0WiI2jtgx1NSW5XbUigcFF/eSol+EgJWiqENAhVq4XTiKnJ4lgQKSkU+jKt/ZYLCWIKjMpPpJpmStXSPKOFiEuMsUsA4OdS81hYEFNgpAh9WqkaRLyRC/mpGlNMUYNOR+3mQh6xBFbnAcAZRLyKC/ndsG9EvIUL+ZHluiUA+Nv8f+/+dG3zIAC8GZLdQoNYGsZpQThMRXVtcxkA/OIAYZ/x/zMAcAQRH+VCHlb/79rmNi7k+30bDeoYiIj4CBfy1b6deqDfLAM0NwMibuRCLoNJ8ZUXHsResLkP0U8TQkS8lgv5tQmeq/DVURM6AtHIkS5xIf/qNeBQIyLilVzIHzW4K7QfIt7JGPsQAEbX6839GBfyJQPaOwDA+/PCFURjNVPOvfXiJL2kPWSuXN8bZu8aLuQ3egwXAsCf/TWuzIDWeD2IjzPGjnMhv9J9PAEAL1hAvJcL+U7XNvsB4HnfuBERuJDndH/LfnVIK1YQLVJ1nOeq2kRmBizT1IKGtrmCC/mTob0e4EK+0bXNkwBwKAbE4dS7tlkHoH5UYKWPiIj7uJAvdm1zPwC8FQDxPi7k0a5tngGAg8am2QYAX7iurSB6pKp/MH1rycKOVC1oA6xrm92MsfX9M85d22wAgH9U2x4An2nWWms/F/I5/fdGADhrAXE5SAlpNgO8/Yyx06Zf6bu2gphLxhSvR8SLuJB/uG7Ztc3DAPAaFUTDR1QwHura5iEAeN0C4rIP2bXNzQAwitYRUW2Cs13bbAeAzxDxVi7kB57xbQGA723fVxCnCFLurUy/r2sb9ds2/ed8LuTHvblOAPFyLuQoJ+iJmu/mQr7rmoOZ8O/a5h7G2A9G2+1cyJfN8Q37qSDm0jGl6xFxAxfyjDahF5hRqgle1zZ3AcB7FNNsPt1nmFTlC1/syCPexIX8ZDjlrm3WM8au40J+aYNtEMBcCgC/VhCnBM5avo0+WdkEAKOgqcSnasQSUqx9ZEuggpgtwtpBCQlUEEtIsfaRLYF/AWtegoAVWJ1/AAAAAElFTkSuQmCC",
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
}

import { Component, OnInit, ViewChild, NgZone, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { OrderBy } from "../filter/orderby";
import { Observable } from 'rxjs';
import { map as MAP, startWith } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBar, MatBottomSheet, MatBottomSheetRef, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as $ from 'jquery';
import { Chart } from 'chart.js';
import { MatSidenav } from '@angular/material/sidenav';


import { extent as Extent } from 'openlayers';
import { tilegrid } from 'openlayers';
import { Map } from 'openlayers';
import { View } from 'openlayers';
import { control as Control } from 'openlayers';
import { geom } from 'openlayers';
import { layer } from 'openlayers';
import { Feature } from 'openlayers';
import { source } from 'openlayers';
import { format as Format } from 'openlayers';
import { style } from 'openlayers';
import { proj } from 'openlayers';
import { Overlay } from 'openlayers';
import { interaction } from 'openlayers';
import { Collection } from 'openlayers';
import { Sphere } from 'openlayers';
import { Observable as OBservable } from 'openlayers';
import { events } from 'openlayers';
import { Attribution } from 'openlayers';
import { loadingstrategy } from 'openlayers';


import { buttonsheetComponent } from '../buttonSheet/buttonheet.component';
import { buttonsheetGeosiComponent } from '../buttonSheet/buttonheet_geosi.component';
import { modalComponent } from '../modal/modal.component';
import { modalMetadata } from '../modal/modal.metadata';
import { commentComponent } from '../modal/modal.comment';

import { cartesService } from "../service/cartes.service";
import { thematiqueService } from "../service/thematiques.service";
import { geoportailService } from "../service/geoportail.service";
import { communicationComponent } from "../service/communicationComponent.service";

declare var jsPDF: any;
declare var turf: any;

const view = new View({
	center: proj.transform([0, 0], 'EPSG:4326', 'EPSG:3857'),
	zoom: 0,
	minZoom: 0
})
const scaleControl = new Control.ScaleLine()
const attribution = new Control.Attribution({
	collapsible: true
});
const map = new Map({
	layers: [

	],
	target: 'map',
	loadTilesWhileAnimating: true,
	view: view,
	controls: Control.defaults({ attribution: false }).extend([
		scaleControl, attribution
	]),
});
scaleControl.setUnits('metric')

const stylePolygon = function (feature) {


	function stringDivider(str, width, spaceReplacer) {
		if (str.length > width) {
			var p = width;
			while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
				p--;
			}
			if (p > 0) {
				var left;
				if (str.substring(p, p + 1) == '-') {
					left = str.substring(0, p + 1);
				} else {
					left = str.substring(0, p);
				}
				var right = str.substring(p + 1);
				return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
			}
		}
		return str;
	}

	var getText = function (donne) {
		if (donne.name) {
			return donne.name
		} else {

			var label = ''

			for (var i = 0; i < donne.length; i++) {
				if (donne[i]['champ_principal']) {
					label = donne[i]['val']
				}
			}

			return label;
		}
	};

	var donne = feature.getProperties().ptestyle
	var pte = feature.getProperties().data

	if (donne.img !== null && donne.img !== undefined) {

		var styles = [
			new style.Style({
				stroke: new style.Stroke({
					color: '#434343',
					width: 4
				}),
				fill: new style.Fill({
					color: donne.img
				}),
				text: new style.Text({
					font: '15px Calibri,sans-serif',
					text: stringDivider(getText(pte), 16, '\n'),
					fill: new style.Fill({ color: '#000' }),
					stroke: new style.Stroke({ color: '#000', width: 1 }),
					offsetX: 0,
					offsetY: 0,
				})

			})
		];


		return styles

	} else {


		return new style.Style({
			fill: new style.Fill({
				color: donne.remplir_couleur
			}),
			stroke: new style.Stroke({
				color: '#434343',
				width: 4
			}),
			text: new style.Text({
				font: '15px Calibri,sans-serif',
				text: stringDivider(getText(pte), 16, '\n'),
				fill: new style.Fill({ color: '#000' }),
				stroke: new style.Stroke({ color: '#000', width: 1 }),
				offsetX: 0,
				offsetY: 0,
			})

		})

	}

}

const styleLigne = function (feature, resolution) {


	function getFont(resolution) {


		var font;

		if (resolution > 4.8) {
			font = '0px Calibri,sans-serif';
		} else if (resolution < 0.7) {
			font = '17px Calibri,sans-serif';
		} else {
			font = 10 / resolution + 'px Calibri,sans-serif'
		}


		return font;
	}

	var createTextStyle = function (features, resolution) {

		var geometry = features.getGeometry();
		var donne = features.getProperties().data


		var rotation;

		geometry.forEachSegment(function (start, end) {
			var dx = end[0] - start[0];
			var dy = end[1] - start[1];
			rotation = Math.atan2(dy, dx);

		});


		return new style.Text({
			font: getFont(resolution),
			text: getText(donne),
			fill: new style.Fill({ color: '#000' }),
			stroke: new style.Stroke({ color: '#000', width: 1 }),
			offsetX: 0,
			offsetY: 0,
			//rotation: rotation
		});

	};

	var getText = function (donne) {
		if (donne.name) {
			return donne.name
		} else {

			var label = ''

			for (var i = 0; i < donne.length; i++) {
				if (donne[i]['champ_principal']) {
					label = donne[i]['val']
				}
			}

			return label;
		}
	};

	var pte = feature.getProperties().data
	var couche = feature.getProperties().ptestyle

	return new style.Style({
		fill: new style.Fill({
			color: couche.contour_couleur
		}),
		stroke: new style.Stroke({
			color: couche.contour_couleur,
			width: 4
		}),
		image: new style.Circle({
			radius: 5,
			stroke: new style.Stroke({
				color: couche.contour_couleur
			}),
			fill: new style.Fill({
				color: couche.contour_couleur
			})
		}),
		text: createTextStyle(feature, map.getView().getResolution())
	});

}

export interface User {

}

@Component({
	selector: 'app-map',
	templateUrl: './map.component.html',
	styleUrls: ['./map.component.scss']
})

export class MapComponent implements OnInit {

	@HostBinding('class.is-open')

	@ViewChild('sidenav1') sidenav1: MatSidenav;

	@ViewChild('sidenav2') sidenav2: MatSidenav;

	reason_left = '';
	reason_right = '';
	right_slide_actic;
	primaryColor
	source_draw
	vector_draw
	draw
	type_draw
	count_draw
	edit_draw_button
	type_edit_draw
	commentBox
	colorPickerBox
	colorDraw
	select
	modify
	source_mesure
	vector_mesure
	sketch
	helpTooltipElement
	helpTooltip
	measureTooltipElement
	measureTooltip
	continuePolygonMsg
	continueLineMsg
	listener
	event_mesure
	extent_cameroun
	mesure_type
	zoomToExtentStatus
	deZoomToExtentStatus
	zoomStory = [];
	centerStory = [];
	pos = -1;
	updateStory = true;
	cartes;
	thematiques;
	typeMenu
	groupMenuActive
	selectFeature
	layerInMap = []
	zIndexMax = 1
	typeDataFeature
	dataFeature = []
	yTree
	modeCompare = false
	precompose
	postcompose
	swipeEvent
	layerInCompare = []
	modeMappilary
	responseMappilary
	previewPointMappilary
	positionProperties
	altimetrie
	profil_alti_active = false
	chart_drape
	masque
	masque_source
	geocode_variable
	tags_couche
	data_right_click = { 'item': [] }
	caracteristicsPoint = { 'display': false }
	commentLayer
	comment_user
	displayPropertiesDivs = []
	geoSignets = []
	url_share
	roi_projet_geojson
	myControl = new FormControl();
	filter_option_expression = {
		'name': ''
	}
	analyse_spatial = {
		'thematiques_analyses': [{
			'thematiques_analyse': undefined,
			'couche_analyse': undefined,
		}],
		'type_emprise_spatiale': undefined,
		'emprises': undefined,
		'emprisesChoisi': undefined,
		'img': 'assets/images/imagette_analyse.png',
		'checked': true,
		'visible': true,
		'type': 'analyse_spatiale',
		'type_couche_inf': 'analyse_spatiale',
	}


	chart_analyse_spatiale = []
	list_analyse_spatial = []
	printMapObjet={
		'titre':'',
		'description':'',
	}

	url_prefix = "http://adminoccitanie.geocameroun.cm/" //"http://localhost:8000/"
	url_frontend = "http://occitanie.geocameroun.cm/" // "http://localhost:4200/"

	opened_right= false;

	toggle_left(reason_left: string) {

		if (this.reason_left == '') {
			this.constructMapBind()
		}
		// console.log( this.sidenav1,Object.getPrototypeOf(this.sidenav1))
		this.reason_left = reason_left;
		this.sidenav1.toggle();
		if (!this.opened_left || this.opened_left == undefined) {
			$('.utils').css('left', '230px')
			$('#notifications').css('left', '300px')
			$('#mouseposition').css('left', '300px')
			$('#bloc_caracteristique').css('left', '300px')
		} else {
			$('#bloc_caracteristique').css('left', '65px')

			$('.utils').css('left', '0px')
			$('#notifications').css('left', '65px')
			$('#mouseposition').css('left', '65px')
			$('.slide2').css('left', '-260px');
			$('.title_rollback_slide2').css('left', '-260px');
		}

	}

	toggle_right(index, reason_right: string) {


		if (!this.opened_right || this.opened_right == undefined) { //ouvert

			$('.utils_right').css('right', '220px')
			this.right_slide_actic = index
			this.sidenav2.toggle();
			this.opened_right = true

		} else { //fermer  
		
			if (this.right_slide_actic != index) {
				this.right_slide_actic = index
			} else {

				$('.utils_right').css('right', '0px')
				this.sidenav2.toggle();

				this.reason_right = reason_right;
				this.opened_right = false
			}
		

		}

		console.log(this.opened_right )
	}

	events_left = 'close';
	events_right = 'close';

	opened_left: false;
	

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
		private builder: FormBuilder
	) {

	}


	public formAnalyse_spatial = this.builder.group({
		id: [, Validators.required],
	});

	ngOnInit() {
	
		///////// shadow getInternalFile ////////////////////////////


		this.geoportailService.getZoneInteret().then((cameroun: Object[]) => {

			var geometry = JSON.parse(cameroun['data']['geometry'])
			this.roi_projet_geojson = geometry
			console.log(geometry)
			// })

			// this.geoportailService.getInternalFile("/assets/cameroun.geojson").then((cameroun: Object[]) => {

			this.geoportailService.getInternalFile("/assets/world_shadow.geojson").then((world_shadow: Object[]) => {

				var features_cameroun = new Format.GeoJSON().readFeatures(JSON.parse(cameroun['data']['geometry']), {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				});

				var features_world_shadow = new Format.GeoJSON().readFeatures(JSON.parse(world_shadow['_body'])['features'][0]);

				var rasterSource_world = new source.ImageVector({
					source: new source.Vector(),
					projection: 'EPSG:3857',
					style: new style.Style({
						fill: new style.Fill({
							color: [0, 0, 0, 0.6]
						})
					})
				});

				var rasterSource_cmr = new source.ImageVector({
					source: new source.Vector(),
					projection: 'EPSG:3857',
					style: new style.Style({
						fill: new style.Fill({
							color: [0, 0, 0, 0.1]
						})
					})
				});

				rasterSource_world.getSource().addFeatures(features_world_shadow)
				rasterSource_cmr.getSource().addFeatures(features_cameroun);


				var raster = new source.Raster({
					sources: [

						rasterSource_world,
						rasterSource_cmr
					],
					operation: function (pixels, data) {
						if (pixels[1][3] == 0) {
							return pixels[0];
							//return [0, 0, 0, 1]
						} else {
							return [0, 0, 0, 1]
						}
					}
				});
				var rasterLayer = new layer.Image({
					source: raster
				});
				rasterLayer.setZIndex(1000)
				map.addLayer(rasterLayer);


				this.extent_cameroun = rasterSource_cmr.getSource().getExtent()

				setTimeout(() => {
					this.geoportailService.getVisitiors().then((vues: Object[]) => {
						console.log(vues)
						$('#id_nombre_vues').show()
						$('#nombre_vues').text(vues[0]['vues'])
					})
				}, 3000)

				setTimeout(() => {
					$('#id_nombre_vues').hide()
				}, 7000)

			

				this.activatedRoute.queryParams.subscribe(params => {
					let share = params['share'];
					
					
					if (share == 'draw') {
						this.displayShareDraw(params['id'])
					} else if (share == 'location') {
						var location = params['path'].split(',')
						console.log(location, location[2])
						this.data_right_click['coord'] = [parseFloat(location[0]), parseFloat(location[1])]
						map.getView().setZoom(parseFloat(location[2]))
						map.getView().setCenter(this.data_right_click['coord'])
						this.getCarateristics()
					} else if(share == 'limites'){
						var properties = params['path'].split(',')
						console.log(properties, properties[0])
						var limites = ['communes','departements','regions','quartiers']
						var limite_display = ['Commune','Département','Region','Quartier']
						
						var donne = {
							'id':properties[1],
							'name':undefined,
							'ref':undefined,
							'type':properties[0],
							'type_display':limite_display[limites.indexOf(properties[0])],
							'type_query':'limites',
							'type_query_action':'display'
						}

						this.displayLimitesAdministratives(donne)
					}

					if(share == "map" &&  params['path'] &&  params['path'].split(',')[3] ){
						
					}else{
						map.getView().fit(this.extent_cameroun, { 'size': map.getSize(), 'duration': 1000 });
					}

				});


				map.on('moveend', () => {

					var bbox_cam = turf.bboxPolygon(this.extent_cameroun);
					var bbox_view = turf.bboxPolygon(map.getView().calculateExtent());


					var bool = turf.booleanContains(bbox_cam, bbox_view)
					// 
					if (!bool) {
						map.getView().fit(this.extent_cameroun, { 'size': map.getSize(), 'maxZoom': 7, 'duration': 1000 });
					}
				})

			})

		})




		/////////// //shadow ////////////////////


		this.caracteristicsPoint['display'] = false

		this.data_right_click['item'] = []

		this.data_right_click['item'][0] = {
			name: 'Caractéristiques de ce lieu',
			click: 'this.getCarateristics'
		}

		this.data_right_click['item'][1] = {
			name: 'Partager ce lieu',
			click: 'this.shareLocation'
		}

		this.data_right_click['item'][2] = {
			name: 'Commenter ce lieu',
			click: 'this.openModalComment'
		}

		this.data_right_click['item'][3] = {
			name: 'Ajouter un géosignet sur ce lieu',
			click: 'this.addGeoSignets'
		}

		this.data_right_click['item'][4] = {
			name: 'Aller sur un géosignet',
			click: 'this.displayGeoSignet'
		}

		///////// share ///////////////////////////// 


		this.communicationComponent.getDataThematiques().subscribe(data => {

			this.activatedRoute.queryParams.subscribe(params => {
				let share = params['share'];
				console.log(params)
				if (share == 'data') {
					var path = params['path'].split(',')
					//var url = couche.key_couche+','+sous.key+','+group.id_cartes
					var key_couche = path[0]
					var key_sous = path[1]
					var key_groupe = path[2]

					for (var i = 0; i < this.thematiques.length; i++) {
						if (this.thematiques[i].id_thematique == key_groupe) {

							if (this.thematiques[i].sous_thematiques && key_sous != false) {

								for (var j = 0; j < this.thematiques[i].sous_thematiques.length; j++) {
									if (this.thematiques[i].sous_thematiques[j].key == key_sous) {

										for (var k = 0; k < this.thematiques[i].sous_thematiques[j].couches.length; k++) {
											if (this.thematiques[i].sous_thematiques[j].couches[k].key_couche == key_couche) {
												this.thematiques[i].sous_thematiques[j].couches[k].checked = true
												this.displayDataOnMap(this.thematiques[i].sous_thematiques[j].couches[k], this.thematiques[i])

											}

										}

									}
								}
							} else {
								if (this.thematiques[i].id_thematique == key_groupe) {
									for (var j = 0; j < this.thematiques[i].couches.length; j++) {

										if (this.thematiques[i].couches[j].key_couche == key_couche) {
											this.thematiques[i].couches[j].checked = true
											this.displayDataOnMap(this.thematiques[i].couches[j], this.thematiques[i])

										}

									}
								}
							}
						}
					}

				} else if (share == "feature") {
					var prop = params['path'].split(',')
					var id_cat = prop[0]
					var key_couche = prop[1]
					console.log(id_cat,key_couche)
					for (var i = 0; i < this.thematiques.length; i++) {
						if (this.thematiques[i].id_thematique == id_cat) {
						
							if (this.thematiques[i].sous_thematiques && this.thematiques[i].sous_thematiques) {
								var sous_thematique = true
								for (var j = 0; j < this.thematiques[i].sous_thematiques.length; j++) {
									for (var k = 0; k < this.thematiques[i].sous_thematiques[j].couches.length; k++) {
										if (this.thematiques[i].sous_thematiques[j].couches[k].key_couche == key_couche) {
											
											var type_geom = this.thematiques[i].sous_thematiques[j].couches[k].geom
											var icone = this.thematiques[i].sous_thematiques[j].couches[k].img
										}

									}
								}

							} else {
								var sous_thematique = true
								for (var j = 0; j < this.thematiques[i].couches.length; j++) {

										if (this.thematiques[i].couches[j].key_couche == key_couche) {
											var type_geom = this.thematiques[i].couches[j].geom
											var icone = this.thematiques[i].couches[j].img
										}

								}
							}
						}
					}
					console.log('iciii',params['type'])
					if (params['type'] == 'osm') {

						var details_osm_url = 'https://nominatim.openstreetmap.org/details.php?osmtype=' + prop[2] + '&osmid=' + prop[3] + '&polygon_geojson=1&addressdetails=1&format=json'

						$.get(details_osm_url, (data) => {
							console.log(data)
								var item = data
								if (type_geom == 'point') {
									var coord = item.centroid.coordinates
								} else {
									var coord = item.geometry.coordinates
								}

								var resultat = {
									icone: icone,
									type_query: "share",
									type_geom: type_geom,
									data: item.address[0].localname,
									coord: coord
								}
								console.log(resultat, 'resultat')
								this.displayResultGeocodeOnMap(resultat)
								var a ={}
								a['type_query_action']='setWord_geocode'
								a['value']=item.address[0].localname
								this.communicationComponent.updateData(Object.create(a))
						})

					} else if (params['type'] == 'feature'){
						var parameters ={
							"sous_thematique":sous_thematique,
							"id_thematique":id_cat,
							"key_couche":key_couche,
							"id":prop[2]
						}
						
						this.geoportailService.getFeatureFromLayerById(parameters).then((data: Object[]) => {
							
							var item = data['data']
							var geometry = JSON.parse(item['geometry']);
							var coord;
							if (type_geom == 'point') {

								if (geometry.coordinates.length == 1) {
									 coord = geometry.coordinates[0]
								} else {
									 coord = geometry.coordinates
								}
							} else {
								if (geometry.coordinates.length == 1) {
									 coord = geometry.coordinates[0]
								} else {
									 coord = geometry.coordinates
								}
							}

							var resultat = {
								icone: icone,
								type_query: "share",
								type_geom: type_geom,
								data: item,
								coord: coord
							}
							console.log(resultat, 'resultat')
							var a ={}
							a['type_query_action']='setWord_geocode'
							a['value']=data['nom_title']
							this.communicationComponent.updateData(Object.create(a))
							this.displayResultGeocodeOnMap(resultat)
						})

					}
				}else if(share == 'state'){
					if(this.cartes){
						this.displayAllFromStateOfMap()
					}
				}
			});

		})

		this.communicationComponent.getDataCartes().subscribe(data => {

			this.activatedRoute.queryParams.subscribe(params => {
				let share = params['share'];

				if (share == 'map') {
					var path = params['path'].split(',')
					//var url = couche.key_couche+','+sous.key+','+group.id_cartes
					var key_couche = path[0]
					var key_sous = path[1]
					var key_groupe = path[2]

					if(path[3]){
						var id_mapPdf = path[3]
					}

					for (var i = 0; i < this.cartes.length; i++) {

						if (this.cartes[i].id_cartes == key_groupe) {

							if (this.cartes[i].sous_cartes && key_sous != false) {
								for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
									if (this.cartes[i].sous_cartes[j].key == key_sous) {
										for (var k = 0; k < this.cartes[i].sous_cartes[j].couches.length; k++) {
											if (this.cartes[i].sous_cartes[j].couches[k].key_couche == key_couche && !id_mapPdf) {
												this.cartes[i].sous_cartes[j].couches[k].checked = true
												this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k], this.cartes[i])

											}else if (this.cartes[i].sous_cartes[j].couches[k].key_couche == key_couche && id_mapPdf){
												for (var index = 0; index < this.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
													if(this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['id'] == id_mapPdf){
														this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].checked = true
														this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index], this.cartes[i])
													}
													
												}
											}
										}
									}
								}
							} else {
								for (var j = 0; j < this.cartes[i].couches.length; j++) {
									if (this.cartes[i].couches[j].key_couche == key_couche && !id_mapPdf) {
										this.cartes[i].couches[j].checked = true
										this.displayDataOnMap(this.cartes[i].couches[j], this.cartes[i])

									}else if (this.cartes[i].couches[j].key_couche == key_couche && id_mapPdf){
										for (var index = 0; index < this.cartes[i].couches[j].cartes_pdf.length; index++) {
											if(this.cartes[i].couches[j].cartes_pdf[index]['id'] == id_mapPdf){
												this.cartes[i].couches[j].cartes_pdf[index].checked = true
												this.displayDataOnMap(this.cartes[i].couches[j].cartes_pdf[index], this.cartes[i])
											}
											
										}
									}
								}
							}

						}
					}

				}else if(share == 'state'){
					if(this.thematiques){
						this.displayAllFromStateOfMap()
					}
				}

			})
		})
		///////// ///////share /////////////////////////////

		////////////// geocode communication component between header and map componnect ////////////
		this.communicationComponent.getData().subscribe(data => {
			if (data['type_query_action'] == 'display') {
				this.displayResultGeocode(data)
			} else if (data['type_query_action'] == 'clear') {

				map.getLayers().forEach((layer) => {
					if (layer.get('name') == 'querry') {
						layer.get('source').clear()
					}

				})
			}

		})
		////////////// // geocode communication component between header and map componnect ////////////

		map.setTarget('sidebar')
		map.setTarget('map')

		this.cartesService.Getcartes().then((data: Object[]) => {

			this.cartes = data

			for (var i = 0; i < this.cartes.length; i++) {
				if (this.cartes[i].sous_cartes) {
					for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
						for (var k = 0; k < this.cartes[i].sous_cartes[j].couches.length; k++) {
							this.cartes[i].sous_cartes[j].couches[k].rang_thema = i
							this.cartes[i].sous_cartes[j].couches[k].id_cat = this.cartes[i]['id_cartes']
							this.cartes[i].sous_cartes[j].couches[k].id_sous_cat = this.cartes[i].sous_cartes[j]['key']
							this.cartes[i].sous_cartes[j].couches[k].id_sous_cat_couche = this.cartes[i].sous_cartes[j].couches[k]['key_couche']

							if (this.cartes[i].sous_cartes[j].couches[k].principal) {
								this.cartes[i].sous_cartes[j].couches[k].checked = true
								this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k], this.cartes[i])

							} else {
								this.cartes[i].sous_cartes[j].couches[k].checked = false
							}

							if (this.cartes[i].sous_cartes[j].couches[k].type != 'pdf') {
								this.cartes[i].sous_cartes[j].couches[k].opacity = 100
							} else {
								for (var index = 0; index < this.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {

									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['id_cat'] = this.cartes[i]['id_cartes']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['id_sous_cat'] = this.cartes[i].sous_cartes[j]['key']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['id_sous_cat_couche'] = this.cartes[i].sous_cartes[j].couches[k]['key_couche']

									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['nom'] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['name']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['urlFile'] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['url']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['url'] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['url_tile']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['opacity'] = 100
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['display'] = true
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['typeInf'] = 'sous_cartes_pdf'
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['type'] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['type']
									this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['commentaire'] = this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['description']
								}
							}

							this.cartes[i].sous_cartes[j].couches[k].inLayerTree = true
							this.cartes[i].sous_cartes[j].couches[k].statusDescription_inf = false
						}
					}
				} else {
					for (var j = 0; j < this.cartes[i].couches.length; j++) {
						this.cartes[i].couches[j].rang_thema = i
						this.cartes[i].couches[j].id_cat = this.cartes[i]['id_cartes']
						this.cartes[i].couches[j].id_sous_cat = false
						this.cartes[i].couches[j].id_sous_cat_couche =this.cartes[i].couches[j]['key_couche']

						if (this.cartes[i].couches[j].principal) {
							this.cartes[i].couches[j].checked = true
							this.displayDataOnMap(this.cartes[i].couches[j], '')

						} else {
							this.cartes[i].couches[j].checked = false
						}

						if (this.cartes[i].couches[j].type != 'pdf') {
							this.cartes[i].couches[j].opacity = 100
						} else {
							for (var index = 0; index < this.cartes[i].couches[j].cartes_pdf.length; index++) {
								this.cartes[i].couches[j].cartes_pdf[index]['id_cat'] = this.cartes[i]['id_cartes']
								this.cartes[i].couches[j].cartes_pdf[index]['id_sous_cat'] = false
								this.cartes[i].couches[j].cartes_pdf[index]['id_sous_cat_couche'] = this.cartes[i].couches[j]['key_couche']

								this.cartes[i].couches[j].cartes_pdf[index]['nom'] = this.cartes[i].couches[j].cartes_pdf[index]['name']
								this.cartes[i].couches[j].cartes_pdf[index]['urlFile'] = this.cartes[i].couches[j].cartes_pdf[index]['url']
								this.cartes[i].couches[j].cartes_pdf[index]['url'] = this.cartes[i].couches[j].cartes_pdf[index]['url_tile']
								this.cartes[i].couches[j].cartes_pdf[index]['opacity'] = 100
								this.cartes[i].couches[j].cartes_pdf[index]['display'] = true
								this.cartes[i].couches[j].cartes_pdf[index]['typeInf'] = 'sous_cartes_pdf'
								this.cartes[i].couches[j].cartes_pdf[index]['type'] = this.cartes[i].couches[j].cartes_pdf[index]['type']
								this.cartes[i].couches[j].cartes_pdf[index]['commentaire'] = this.cartes[i].couches[j].cartes_pdf[index]['description']

							}
						}

						this.cartes[i].couches[j].inLayerTree = true
						this.cartes[i].couches[j].statusDescription_inf = false
					}
				}
			}


			map.on('moveend', () => {

				this.displayInlayerTree()

			})

			this.communicationComponent.updateDataCartes(this.cartes)
			if (document.documentElement.clientWidth >= 767) {
				this.toggle_left('')

			}


		})

		var getOperateur = function(code){
			if (code == 0) {
				return '='
			} else if (code == 1) {
				return '!='
			}else if (code == 2) {
				return 'IS NOT NULL'
			}else if (code == 3) {
				return 'IS NULL'
			}
		}

		this.thematiqueService.Getthematiques().then((data: Object[]) => {
			this.thematiques = data
			this.tags_couche = []
			for (var i = 0; i < this.thematiques.length; i++) {
				if (this.thematiques[i].sous_thematiques) {
					for (var j = 0; j < this.thematiques[i].sous_thematiques.length; j++) {
						for (var k = 0; k < this.thematiques[i].sous_thematiques[j].couches.length; k++) {

							var resume = ""

							this.thematiques[i].sous_thematiques[j].couches[k].rang_thema = i
							this.thematiques[i].sous_thematiques[j].couches[k].id_cat = this.thematiques[i].id_thematique
							this.thematiques[i].sous_thematiques[j].couches[k]['id_sous_cat'] = this.thematiques[i].sous_thematiques[j].key
							this.thematiques[i].sous_thematiques[j].couches[k]['id_sous_cat_couche'] =this.thematiques[i].sous_thematiques[j].couches[k].key_couche

							this.thematiques[i].sous_thematiques[j].couches[k].checked = false

							this.thematiques[i].sous_thematiques[j].couches[k].opacity = parseFloat(this.thematiques[i].sous_thematiques[j].couches[k].opacity) * 100

							if (this.thematiques[i].sous_thematiques[j].couches[k].type_couche == 'requete') {
								for (var index = 0; index < this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm.length; index++) {
									var element = {};
									element['couche'] = this.thematiques[i].sous_thematiques[j].couches[k]
									var operateur =  this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['operateur']
									element['cle'] = this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['action']
									element['val'] = this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['nom']

									var key_val = element['cle'] +' '+getOperateur(operateur)+element['val']
									resume = resume+"; "+ key_val

									this.tags_couche.push(element)
								}
								this.thematiques[i].sous_thematiques[j].couches[k].metadata['resume'] = resume
							} else if (this.thematiques[i].sous_thematiques[j].couches[k].type_couche == 'wms' && this.thematiques[i].sous_thematiques[j].couches[k].wms_type == 'osm') {

								for (var index = 0; index < this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm.length; index++) {
									var element = {};
									element['couche'] = this.thematiques[i].sous_thematiques[j].couches[k]
									var operateur =  this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['operateur']
									element['cle'] = this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['action']
									element['val'] = this.thematiques[i].sous_thematiques[j].couches[k].cles_vals_osm[index]['nom']

									var key_val = element['cle'] +' '+getOperateur(operateur)+element['val']
									resume = resume+"; "+ key_val

									this.tags_couche.push(element)
								}
								this.thematiques[i].sous_thematiques[j].couches[k].metadata['resume'] = resume
							}

							if (this.thematiques[i].sous_thematiques[j].couches[k].nom == 'commentaires') {
								this.commentLayer = this.thematiques[i].sous_thematiques[j].couches[k]
								this.commentLayer.shema = this.thematiques[i].shema
								this.thematiques[i].sous_thematiques[j].couches.splice(k, 1)
							}

						}
					}
				} else {
					for (var j = 0; j < this.thematiques[i].couches.length; j++) {
						var resume = ""
						this.thematiques[i].couches[j].rang_thema = i
						this.thematiques[i].couches[j].id_cat = this.thematiques[i].id_thematique
						this.thematiques[i].couches[j]['id_sous_cat'] = false
						this.thematiques[i].couches[j]['id_sous_cat_couche'] =this.thematiques[i].couches[j].key_couche

						this.thematiques[i].couches[j].checked = false
						this.thematiques[i].couches[j].opacity = parseFloat(this.thematiques[i].couches[j].opacity) * 100

						if (this.thematiques[i].couches[j].type_couche == 'requete') {
							for (var index = 0; index < this.thematiques[i].couches[j].cles_vals_osm.length; index++) {
								var element = {};
								element['couche'] = this.thematiques[i].couches[j]
								var operateur = this.thematiques[i].couches[j].cles_vals_osm[index]['operateur']
								element['cle'] = this.thematiques[i].couches[j].cles_vals_osm[index]['action']
								element['val'] = this.thematiques[i].couches[j].cles_vals_osm[index]['nom']

								var key_val = element['cle'] +' '+getOperateur(operateur)+element['val']
								resume = resume+"; "+ key_val
								this.tags_couche.push(element)
							}
							this.thematiques[i].couches[j].metadata['resume'] = resume
						} else if (this.thematiques[i].couches[j].type_couche == 'wms' && this.thematiques[i].couches[j].wms_type == 'osm') {

							for (var index = 0; index < this.thematiques[i].couches[j].cles_vals_osm.length; index++) {
								var element = {};
								element['couche'] = this.thematiques[i].couches[j]
								var operateur = this.thematiques[i].couches[j].cles_vals_osm[index]['operateur']
								element['cle'] = this.thematiques[i].couches[j].cles_vals_osm[index]['action']
								element['val'] = this.thematiques[i].couches[j].cles_vals_osm[index]['nom']

								var key_val = element['cle'] +' '+getOperateur(operateur)+element['val']
								resume = resume+"; "+ key_val
								this.tags_couche.push(element)
							}
							this.thematiques[i].couches[j].metadata['resume'] = resume
						}

					}
				}
			}


			this.communicationComponent.updateDataThematiques(this.thematiques)

		})


		this.right_slide_actic = 0
		this.primaryColor = '#2196f3'
		this.colorDraw = this.primaryColor

		//// global variables for altimetrie tools///////////
		this.altimetrie = {
			'active': false
		}

		//// global variables for drawing tools///////////
		this.count_draw = {
			'Point': [],
			'LineString': [],
			'Polygon': [],
			'text': []
		}

		this.source_draw = new source.Vector();

		this.vector_draw = new layer.Vector({
			source: this.source_draw
		})
		this.vector_draw.setZIndex(100);
		this.vector_draw.set('name', 'draw')
		map.addLayer(this.vector_draw)

		//// global variables for comments of drawing tools///////////

		var extent = map.getView().calculateExtent(map.getSize());
		var cor = getCenterOfExtent(extent);
		this.commentBox = new Overlay({
			position: [cor[0], cor[1]],
			element: document.getElementById('comment')
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
			element: document.getElementById('colorPicker')
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
					color: [rgb.r, rgb.g, rgb.b, 0.1]
				}),
				stroke: new style.Stroke({
					color: this.primaryColor,
					width: 2
				}),
				image: new style.Circle({
					radius: 5,
					stroke: new style.Stroke({
						color: this.primaryColor
					}),
					fill: new style.Fill({
						color: [rgb.r, rgb.g, rgb.b, 0.1]
					})
				})
			})
		});
		this.vector_mesure.setZIndex(100);
		this.vector_mesure.set('name', 'mesure')
		map.addLayer(this.vector_mesure)

		this.sketch;
		this.helpTooltipElement;
		this.helpTooltip;
		this.measureTooltipElement;
		this.measureTooltip;
		this.continuePolygonMsg = 'Click to continue drawing the polygon';
		this.continueLineMsg = 'Click to continue drawing the line';

		////// function for roll back or front in map tools/////////

		map.on('moveend', () => {

			if (this.updateStory) {

				this.pos++;
				this.zoomStory[this.pos] = map.getView().getZoom();
				this.centerStory[this.pos] = map.getView().getCenter();

			}

		});

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////// 			evenement du onclick 			///////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.masque_source = new source.Vector()

		this.masque = new layer.Vector({
			source: this.masque_source
		});
		map.addLayer(this.masque)

		map.on('click', (evt) => {


			var feature = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
				return feature;
			});

			var layer = map.forEachFeatureAtPixel(evt.pixel, (feature, layer) => {
				return layer;
			});

			/////////////////////layer vector /////////////////////////////////
			if (layer) {
				/////////////////////cluster, on zoom juste /////////////////////////////////
				if (feature['O']["features"] && feature['O']["features"].length != 1) {

					map.getView().setResolution(map.getView().getResolution() * 2);

					map.getView().setCenter(evt.coordinate);
					map.getView().setZoom(map.getView().getZoom() + 3);

				} else {
					if (layer.get('type') == 'requete' || layer.get('type') == 'wfs') {

						if (feature.getProperties()['features']) {
							var dataFeature = feature.getProperties()['features'][0]['O']['data']
						} else {
							var dataFeature = feature.getProperties()['data']
						}


						var pte = []
						pte.push({
							'index': 'name',
							'val': dataFeature['name'],
							'display': true
						})

						pte.push({
							'index': 'osm_id',
							'val': dataFeature['osm_id'],
							'display': false
						})

						var details_osm_url = 'https://nominatim.openstreetmap.org/lookup?osm_ids=R' + dataFeature['osm_id'] + ',W' + dataFeature['osm_id'] + ',N' + dataFeature['osm_id'] + '&format=json'



						var hstore_to_json = JSON.parse(dataFeature['hstore_to_json'])

						$.each(hstore_to_json, (index, val) => {
							if (index != 'name' && val) {
								var type = "text"

								if (index == 'website') {
									type = 'url'
								}
								pte.push({
									'index': index,
									'val': val,
									'type': type,
									'display': true
								})
							}

							if (index == 'name' && val) {

								for (var i = 0; i < pte.length; i++) {

									if (pte[i]['index'] == 'name' && !pte[i]['val']) {
										pte[i]['val'] = val
									}

								}
							}
						})

						this.zone.run(() => {
							this.typeDataFeature = 'keyVal'
							this.dataFeature = pte
						})

						$('#notifications').show()

						$.get(details_osm_url, (data) => {
							console.log(data)
							if (data.length == 1) {
								var osm_type = data[0].osm_type
								var osm_url = 'https://www.openstreetmap.org/' + osm_type + '/' + dataFeature['osm_id']

								pte.push({
									'index': 'OSM url',
									'val': osm_url,
									'type': 'url',
									'display': true
								})

								if (osm_type == 'relation') {
									var osm_type_small = 'R'
								} else if (osm_type == 'way') {
									var osm_type_small = 'W'
								} else if (osm_type == 'node') {
									var osm_type_small = 'N'
								}

								pte.push({
									'index': 'share_osm',
									'val': layer.get('id_cat') + ',' + layer.get('key_couche') + ',' + osm_type_small + ',' + dataFeature['osm_id'],
									'type': 'share',
									'display': false
								})
								

								this.openProperties('220px')
							} else {
								this.openProperties('220px')
							}
							this.activate_an_icon(feature.getGeometry(), feature.getGeometry().getType())

						})

						$('#notifications').hide()



					} else if (layer.get('type') == 'pdf') {

						var datas = feature.getProperties()['data'].cartes_pdf

						var pte = []
						this.dataFeature = []
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
							var donne = {}
							var bool = []
							donne['position'] = { x: 0, y: 0 }
							donne['pte'] = datas
							donne['maximise'] = true
							donne['name'] = layer.get('name')

							for (var index = 0; index < this.displayPropertiesDivs.length; index++) {
								if (this.displayPropertiesDivs[index].name == layer.get('name')) {
									bool.push(index)
								}

							}
							if (bool.length == 0) {
								this.displayPropertiesDivs.push(donne)
							} else {
								this.displayPropertiesDivs[bool[0]]['position'] = { x: 0, y: 0 }
								this.displayPropertiesDivs[bool[0]]['maximise'] = true
							}

							console.log(this.displayPropertiesDivs)

							//this.typeDataFeature = 'pdf'
							//this.dataFeature.push(datas[i])
						})
						//this.openProperties('400px')

					} else if (layer.get('type') == 'api' || layer.get('type') == 'couche') {

						if (feature.getProperties()['features']) {
							var dataFeature = feature.getProperties()['features'][0]['O']['data']
						} else {
							var dataFeature = feature.getProperties()['data']
						}


						var pte = []
						
						var hstore_to_json = dataFeature
						for (var i = 0; i < hstore_to_json.length; i++) {


							if (hstore_to_json[i]['val'] != null && hstore_to_json[i]['val'] != '' && hstore_to_json[i]['val'] != ' ' && hstore_to_json[i]['index'] != 'geom' && hstore_to_json[i]['index'] != 'geometry' && hstore_to_json[i]['index'] != 'id') {

								if (hstore_to_json[i]['aliase']) {
									pte.push({
										'index': hstore_to_json[i]['aliase'],
										'val': hstore_to_json[i]['val'],
										'display': true
									})
								} else {
									pte.push({
										'index': hstore_to_json[i]['index'],
										'val': hstore_to_json[i]['val'],
										'display': true
									})
								}

							}else if ( hstore_to_json[i]['index'] == 'id' && layer.get('type') != 'api'){
								pte.push({
									'index': 'share_feature',
									'val': layer.get('id_cat') + ',' + layer.get('key_couche') + ',' +  hstore_to_json[i]['val'],
									'type': 'share',
									'display': false
								})
							}
						}

						this.zone.run(() => {
							this.typeDataFeature = 'keyVal'
							this.dataFeature = pte

						})
						this.activate_an_icon(feature.getGeometry(), feature.getGeometry().getType())
						this.openProperties('220px')

					} else if (layer.get('type') == 'querry') {

						if (feature.getProperties()['features']) {
							var dataFeature = feature.getProperties()['features'][0]['O']['data']
						} else {
							var dataFeature = feature.getProperties()['data']
						}

						if (dataFeature.osm_type) {
							
							if (dataFeature.osm_type == 'relation') {
								var osm_type = 'R'
							} else if (dataFeature.osm_type == 'way') {
								var osm_type = 'W'
							} else if (dataFeature.osm_type == 'node') {
								var osm_type = 'N'
							}

							var display_name = dataFeature.display_name
							var type = dataFeature.type
							var osm_id = dataFeature.osm_id

							//var href = "https://nominatim.openstreetmap.org/details.php?osmtype=" + osm_type + "&osmid=" + osm_id;
							var href = 'https://www.openstreetmap.org/' + osm_type + '/' + osm_id
							console.log(dataFeature)
							
						}else if (dataFeature.type_query == 'limites') {
							console.log('ok')
							var pte = []
							pte.push({
								'index': 'share_limites',
								'val':  dataFeature.type+',' + dataFeature.id,
								'type': 'share',
								'display': false
							})
							pte.push({
								'index': 'Nom',
								'val': dataFeature.name,
								'display': true
							})
							pte.push({
								'index': 'Référence',
								'val': dataFeature.ref,
								'display': true
							})
							this.zone.run(() => {
								this.typeDataFeature = 'keyVal'
								this.dataFeature = pte
							})
							this.openProperties('120px')
						}
						console.log(dataFeature)
					}
				}

			}/////////////////////layer cartes /////////////////////////////////
			else {

				map.forEachLayerAtPixel(evt.pixel, (lay) => {

					if (lay.get('type_couche_inf') == 'thematiques' || lay.get('interrogeable') == true) {
						var source = lay.getSource()
						var viewResolution = view.getResolution();

						var url = Object.create(source).getGetFeatureInfoUrl(evt.coordinate, viewResolution, 'EPSG:3857');

						$.get(url, (data) => {
							console.log(data.split(/\r?\n/).length, data.split(/\r?\n/)[0]);
							var donne = data.split(/\r?\n/)
							var pte = []
							var details_osm_url = ''
							for (var index = 0; index < donne.length; index++) {
								if (donne[index].includes('geometry')) {
									//console.log(donne[index]) hstore_to_ 
									var geometry_wkt = donne[index].split('=')[1].replace(/'/g, '')
									console.log('passe')


								} else if (!donne[index].includes('Layer') && !donne[index].includes('fid') && !donne[index].includes('Feature') && donne[index].split('=').length == 2) {
									var champ = donne[index].split('=')[0]
									var val = donne[index].split('=')[1].replace(/'/g, '')
									console.log(champ)

									if (champ.includes('osm_id')) {
										details_osm_url = 'https://nominatim.openstreetmap.org/lookup?osm_ids=R' + val + ',W' + val + ',N' + val + '&format=json'

									}

									if (champ.includes('hstore_to_') || champ.includes('hstore_to_json')) {

										var hstore_to_json = JSON.parse(val)

										$.each(hstore_to_json, (index, valeur) => {
											if (index != 'name' && valeur) {
												var type = "text"

												if (index == 'website') {
													type = 'url'
												}
												pte.push({
													'index': index,
													'val': valeur,
													'type': type,
													'display': true
												})

											}
										})
									} else if (champ != "" && val && val != '') {
										pte.push({
											'index': champ,
											'val': val,
											'display': true
										})
									}

								}

							}

							console.log(pte)

							if (geometry_wkt) {
								var wkt = new Format.WKT();

								var feature = wkt.readFeature(geometry_wkt);

								this.masque_source.clear()
								this.masque_source.addFeature(feature)
								var z = lay.getZIndex() + 1
								this.masque.setZIndex(z)
							}
							if(pte.length >0)
							this.zone.run(() => {
								this.typeDataFeature = 'keyVal'
								this.dataFeature = pte
							})

							if (details_osm_url != '' && pte.length >0) {

								$('#notifications').show()

								$.get(details_osm_url, (data) => {
									console.log(data)
									if (data.length == 1) {
										var osm_type = data[0].osm_type
										var osm_id = data[0].osm_id
										var osm_url = 'https://www.openstreetmap.org/' + osm_type + '/' + osm_id

										pte.push({
											'index': 'OSM url',
											'val': osm_url,
											'type': 'url',
											'display': true
										})
										if (osm_type == 'relation') {
											var osm_type_small = 'R'
										} else if (osm_type == 'way') {
											var osm_type_small = 'W'
										} else if (osm_type == 'node') {
											var osm_type_small = 'N'
										}
										pte.push({
											'index': 'share_osm',
											'val': lay.get('id_cat') + ',' + lay.get('key_couche') + ',' + osm_type_small + ',' + osm_id,
											'type': 'share',
											'display': false
										})

										this.openProperties('220px')
									} else {
										this.openProperties('220px')
									}

									$('#notifications').hide()
								})


							} else if( pte.length >0) {
								this.openProperties('220px')
							}


						});

						return;
					}

				});

			}


		})

		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////// 		//evenement du onclick 				//////////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////// 			evenement du hover	 			///////////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\
		var popup_lot = new Overlay({
			element: document.getElementById('popup_lot'),
			stopEvent: true
		});
		map.addOverlay(popup_lot);

		var popup_mappilary = new Overlay({
			element: document.getElementById('popup_mappilary'),
			stopEvent: true
		});
		map.addOverlay(popup_mappilary);

		var target = map.getTarget();
		var jTarget = typeof target === "string" ? $("#" + target) : $(target);
		var cursor_on_popup = false
		var popup_once_open = false

		$(map.getViewport()).on('mouseout', (evt) => {
			$('.custom-mouse-position').text('WGS84')
		})
		$(map.getViewport()).on('mousemove', (evt) => {
			var pixel = map.getEventPixel(evt.originalEvent);
			var coord_center = proj.transform(map.getCoordinateFromPixel(pixel), 'EPSG:3857', 'EPSG:4326')
			$('.custom-mouse-position').text(coord_center[0].toFixed(4) + ' , ' + coord_center[1].toFixed(4))

			map.forEachLayerAtPixel(pixel, (layer) => {

				if (layer.get('type') != 'mappilary') {

					var hit = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
						if (layer && layer.get('type') != 'mappilary') {
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

			if (layer && feature && layer.get('type') == 'querry') {

				popup_once_open = true
				if (feature.getProperties()['features']) {
					var dataFeature = feature.getProperties()['features'][0]['O']['data']
				} else {
					var dataFeature = feature.getProperties()['data']
				}

				if (dataFeature) {
					if (dataFeature.osm_type) {

						$('#popup_infos_contain').text(dataFeature.display_name)
						$('#popup_infos_title').text(dataFeature.type)


						if (dataFeature.osm_type == 'relation') {
							var osm_type = 'R'
						} else if (dataFeature.osm_type == 'way') {
							var osm_type = 'W'
						} else if (dataFeature.osm_type == 'node') {
							var osm_type = 'N'
						}

						var osm_id = dataFeature.osm_id

						//var href = "https://nominatim.openstreetmap.org/details.php?osmtype=" + osm_type + "&osmid=" + osm_id;
						var href = 'https://www.openstreetmap.org/' + osm_type + '/' + osm_id

						$('#popup_details').attr('href', href)
						$('#popup_details').show()
						map.addOverlay(popup_lot);

						if (Object.create(feature.getGeometry()).getType() == 'Point') {
							var coordinate = Object.create(feature.getGeometry()).getCoordinates();
							popup_lot.setPosition(coordinate);
						} else {
							var coordinate_poly = Extent.getCenter(Object.create(feature.getGeometry()).getExtent())
							popup_lot.setPosition(coordinate_poly);
						}

					} else if (dataFeature.type_query == 'limites') {
						$('#popup_infos_title').text(dataFeature.type_display)
						if (dataFeature.ref) {
							$('#popup_infos_contain').text(dataFeature.name + ' (' + dataFeature.ref + ')')
						} else {
							$('#popup_infos_contain').text(dataFeature.name)
						}


						var coordinate_poly = Extent.getCenter(Object.create(feature.getGeometry()).getExtent())
						map.addOverlay(popup_lot);
						popup_lot.setPosition(coordinate_poly);
					}
				}


			} else if (layer && feature && layer.get('type') == 'pdf') {
				$('#popup_details').hide()
				popup_once_open = true
				var dataFeature = feature.getProperties()['data']
				var pte = layer.get('name')
				//console.log(dataFeature,feature.getProperties())
				if (pte) {
					$('#popup_infos_contain').text(dataFeature['cartes_pdf'].length + ' carte(s)')
					$('#popup_infos_title').text(pte)
					map.addOverlay(popup_lot);
					var coordinate = Object.create(feature.getGeometry()).getCoordinates();
					popup_lot.setPosition(coordinate);
				}

			} else if (layer && feature && layer.get('type') != 'mappilary' && feature['O'].hasOwnProperty("features")) {
				$('#popup_details').hide()
				popup_once_open = true
				/////////////////////cluster, on fait rien/////////////////////////////////
				if (feature['O']["features"] && feature['O']["features"].length != 1) {

				} else {
					// console.log(layer.get('type'))
					if (layer.get('type') == 'requete' || layer.get('type') == 'wfs' ) {

						if (feature.getProperties()['features']) {
							var dataFeature = feature.getProperties()['features'][0]['O']['data']
						} else {
							var dataFeature = feature.getProperties()['data']
						}

						var pte = dataFeature['name']


						if (pte) {
							$('#popup_infos_contain').html(pte)
							$('#popup_infos_title').text(this.undescore2space(layer.get('name')))
							map.addOverlay(popup_lot);
							//Object.create(feature.getGeometry());
							var coordinate = Object.create(feature.getGeometry()).getCoordinates();
							popup_lot.setPosition(coordinate);
						}



					} else if (layer.get('type') == 'api' || layer.get('type') == 'couche') {

						if (feature.getProperties()['features']) {
							var dataFeature = feature.getProperties()['features'][0]['O']['data']
						} else {
							var dataFeature = feature.getProperties()['data']
						}


						var pte;

						var hstore_to_json = dataFeature

						for (var i = 0; i < hstore_to_json.length; i++) {


							if (hstore_to_json[i]['index'] != 'geom' && hstore_to_json[i]['index'] != 'geometry' && hstore_to_json[i]['index'] != 'id') {

								if (hstore_to_json[i]['champ_principal']) {
									pte = hstore_to_json[i]['val']
								}

							}
						}

						if (pte) {
							$('#popup_infos_contain').html(pte)
							$('#popup_infos_title').text(this.undescore2space(layer.get('name')))
							map.addOverlay(popup_lot);
							var coordinate = Object.create(feature.getGeometry()).getCoordinates();
							popup_lot.setPosition(coordinate);
						}

					}
				}

			} else if (layer && feature && layer.get('type') == 'mappilaryPoint' && feature.getProperties()['data']) {

				var pte = feature.getProperties()['data']
				//console.log(pte)
				//console.log(this.responseMappilary['features']) 

				var point = {
					'img': this.responseMappilary['features'][pte.i]['properties']['coordinateProperties'].image_keys[pte.j],
					'cas': this.responseMappilary['features'][pte.i]['properties']['coordinateProperties'].cas[pte.j]
				}

				var stActive = new style.Style({
					image: new style.Circle({
						radius: 9,
						fill: new style.Fill({
							color: 'rgba(53, 175, 109,0.7)'
						})
					})
				})

				var rotation = (Math.PI / 2 + (Math.PI * point.cas)) / -360

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



				feature["setStyle"](stActive)

				map.addOverlay(popup_mappilary);
				var coordinate = Object.create(feature.getGeometry()).getCoordinates();
				popup_mappilary.setPosition(coordinate);

				$("#img_mappilary").attr('src', 'https://d1cuyjsrcm0gby.cloudfront.net/' + point.img + '/thumb-320.jpg')

				this.zone.run(() => {
					this.previewPointMappilary = feature
				})

			} else {

				if (popup_once_open) {


					$('#popup_lot').on('mousemove', (evt) => {//console.log(1)
						cursor_on_popup = true
					})

					$('#popup_lot').on('mouseleave', (evt) => { //console.log('out')
						cursor_on_popup = false

						$('#popup_infos_contain').text('')
						map.removeOverlay(popup_lot);
						popup_once_open = false

					})
					setTimeout(function () {
						//console.log(cursor_on_popup)
						if (cursor_on_popup == false) {
							$('#popup_infos_contain').text('')
							map.removeOverlay(popup_lot);
							popup_once_open = false

						}
					}, 200);
				}


				if (this.previewPointMappilary) {
					var st = new style.Style({
						image: new style.Circle({
							radius: 4,
							fill: new style.Fill({
								color: '#fff'
							}),
							stroke: new style.Stroke({
								color: 'rgba(53, 175, 109,0.7)',
								width: 3
							})
						}),
						stroke: new style.Stroke({
							color: 'rgba(53, 175, 109,0.7)',
							width: 4
						})

					})
					this.previewPointMappilary.setStyle(st)
					this.previewPointMappilary = undefined
					map.removeOverlay(popup_mappilary);
					$("#img_mappilary").attr('src', '')
				}
			}




		});


		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////// 			//evenement du hover	 			///////////////////////////////////////
		///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\

	}

	isShareFeatures(feature) {
		for (var index = 0; index < feature.length; index++) {
			if (feature[index]['type'] == 'share') {
				return true
			}
		}
	}

	isPhone() {
		if (document.documentElement.clientWidth <= 767) {
			return true
		} else {
			return false
		}
	}
	chooseThematique_function(i) {
		this.analyse_spatial['thematiques_analyses'][i]['couche_analyse'] = undefined
	}

	choose_another_couche_option() {
		this.analyse_spatial['thematiques_analyses'].push({
			'thematiques_analyse': undefined,
			'couche_analyse': undefined,
		})
	}

	remove_another_couche_option(i) {
		this.analyse_spatial['thematiques_analyses'].splice(i, 1)
	}

	display_remove_another_couche_option() {
		if (this.analyse_spatial['thematiques_analyses'].length > 1) {
			return true
		} else {
			return false
		}
	}

	chooseCouche_function() {
		this.analyse_spatial["emprisesChoisiId"] = undefined

		this.myControl.reset()
		if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] != "tout" && this.analyse_spatial['type_emprise_spatiale'] != "draw") {
			this.geoportailService.getListLimit({ 'table': this.analyse_spatial['type_emprise_spatiale'] }).then((data: Object[]) => {
				var new_name = []
				for (var index = 0; index < data.length; index++) {
					var element = data[index]['name'] + ', (' + data[index]['ref'] + ')';
					new_name.push(element)
				}
				this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = data
				this.analyse_spatial['emprises'] = data
				this.analyse_spatial['emprises_formate'] = new_name

				this.myControl.valueChanges.subscribe((x) => {
					this.filter_option_expression.name = x;
				});

			})
		}else if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] == "tout"){
			// this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = 'tout'
			this.analyse_spatial['emprises'] = 'tout' 
			this.analyse_spatial['emprisesChoisiId'] = 'tout' 
			this.analyse_spatial['type_emprise_spatiale'] = 'tout'
			this.analyse_spatial['emprisesChoisiName'] = 'tout'
		}
		console.log(this.analyse_spatial,0)
	}

	calculate_analyse_spatial(event) {
		//console.log(event,event["option"]) 
		var nom_limite = ''
		for (var index = 0; index < event["option"]["viewValue"].split(',').length; index++) {
			//console.log(5)
			if (index <= event["option"]["viewValue"].split(',').length - 2) {
				nom_limite = nom_limite + event["option"]["viewValue"].split(',')[index]
			}
		}
		this.filter_option_expression.name = nom_limite

		for (var index = 0; index < this.analyse_spatial['emprises'].length; index++) {
			//console.log( this.removeSpecialCharacter(this.analyse_spatial['emprises'][index]['name']) == this.removeSpecialCharacter(this.analyse_spatial['emprisesChoisi']) )
			if (this.removeSpecialCharacter(this.analyse_spatial['emprises'][index]['name']) == this.removeSpecialCharacter(nom_limite)) {
				this.analyse_spatial['emprisesChoisiId'] = this.analyse_spatial['emprises'][index]['id']
				this.analyse_spatial['emprisesChoisiName'] = this.analyse_spatial['emprises'][index]['name']
				console.log('hihi')
			}
		}

		console.log(this.analyse_spatial, event["option"]["viewValue"], nom_limite)
	}

	disableOptionAnalyseSpatial(data) {
		if (data.type == 'xyz') {
			return true
		} else if ( data.type_couche == 'wms' || data.type == 'wms') {
			return false
		}else if (data.type_couche == 'requete' && data.status == true && data.file_json) {
			return false
		} else if (data.type_couche == 'couche') {
			return false
		} else if (data.type_couche == 'api' && data.url) {
			return false
		} else {
			return true
		}
	}

	display_calculate_result_analyse_spatial() {

	
		if (this.analyse_spatial["type_emprise_spatiale"] && this.analyse_spatial["emprises"] && this.analyse_spatial["emprisesChoisiId"]) {
			var error = []
			for (var index = 0; index < this.analyse_spatial["thematiques_analyses"].length; index++) {
				if (this.analyse_spatial["thematiques_analyses"][index]["thematiques_analyse"] && this.analyse_spatial["thematiques_analyses"][index]["couche_analyse"]) {

				} else {
					error.push(1)
				}
			}

			if (error.length == 0) {
				return true
			} else {
				return false
			}

		} else {
			return false
		}
	}

	calculate_result_analyse_spatial() {
		$('#loading_calcul').show()

		this.analyse_spatial['query'] = []
		for (var index = 0; index < this.analyse_spatial["thematiques_analyses"].length; index++) {
			var couche = this.analyse_spatial["thematiques_analyses"][index]["couche_analyse"]
			var thematique = this.analyse_spatial["thematiques_analyses"][index]["thematiques_analyse"]

			if (couche.type_couche == 'requete') {

				this.analyse_spatial['query'].push({
					'url': this.url_prefix + 'geoportail/getJsonFIle/',
					'data': { 'file': couche.file_json },
					'methode': 'post',
					'index': index,
					'nom': couche.nom,
					'type': couche.type_couche
				})

			} else if (couche.type_couche == 'couche') {

				var url = this.url_prefix + "/api/v1/RestFull/DataJsonApi/" + thematique.shema + "/" + couche.id_couche + ""

				this.analyse_spatial['query'].push({
					'url': url,
					'methode': 'get',
					'index': index,
					'nom': couche.nom,
					'type': couche.type_couche
				})

			} else if (couche.type_couche == 'api') {
				this.analyse_spatial['query'].push({
					'url': couche.url,
					'methode': 'get',
					'index': index,
					'nom': couche.nom,
					'type': couche.type_couche
				})

			}else{
				if (couche.identifiant){
					this.analyse_spatial['query'].push({ 
						'url': couche.url,
						'projet_qgis': 'occitanie',
						'methode': 'qgis',
						'index': index,
						'nom': couche.nom,
						'type': couche.type_couche,
						'identifiant': couche.identifiant,
					})
				}
			}

		}

		if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] != "draw"  && this.analyse_spatial['type_emprise_spatiale'] != "tout") {
			this.geoportailService.getLimitById({ 'table': this.analyse_spatial['type_emprise_spatiale'], id: this.analyse_spatial["emprisesChoisiId"] }).then((data: Object[]) => {
				this.analyse_spatial['geometry'] = JSON.parse(data["geometry"])['coordinates']
				var params = {
					'querry': this.analyse_spatial['query'],
					'geometry': this.analyse_spatial['geometry']
				}
				console.log(params)
				this.analyse_spatiale(params)
			})
		}else if(this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] == "tout"){
			var coordinates_poly = []
			for (var k = 0; k < this.roi_projet_geojson['coordinates'].length; k++) {
				var element = this.roi_projet_geojson['coordinates'][k];
				if(element.length == 1){
					coordinates_poly.push(element[0])
				}else{
					coordinates_poly.push(element)
				}
			}
			this.analyse_spatial['geometry'] = coordinates_poly
			var params = {
				'querry': this.analyse_spatial['query'],
				'geometry': 'tout'
			}
			// console.log(params)
			this.analyse_spatiale(params)
		}
	}

	analyse_spatiale(params){
		this.geoportailService.analyse_spatiale(params).then((data: Object[]) => {
			$('#loading_calcul').hide()
			// console.log(data)
			var numbers = []
			var labels = []
			for (var index = 0; index < data.length; index++) {
				numbers.push(data[index]['number'])
				labels.push(data[index]['nom'] + ' (' + data[index]['number'] + ') ')
				this.analyse_spatial["query"][data[index]['index']]["number"] = data[index]['number']
				this.analyse_spatial["query"][data[index]['index']]["nom_file"] = data[index]['nom_file']
			}

			var zone_analyse = turf.polygon(this.analyse_spatial['geometry']);
			var center_zone_analyse = turf.centerOfMass(zone_analyse);
			var features_cameroun = new Format.GeoJSON().readFeatures(zone_analyse, {
				dataProjection: 'EPSG:4326',
				featureProjection: 'EPSG:3857'
			});

			var zone_analyseSource = new source.Vector({
				features: features_cameroun
			});

			var zone_analyse_layer = new layer.Vector({
				source: zone_analyseSource,
				style: new style.Style({
					stroke: new style.Stroke({
						color: '#000',
						width: 2
					}),
					fill: new style.Fill({
						color: this.primaryColor
					}),
				}),
				visible: true,
				updateWhileAnimating: true,
			});

			zone_analyse_layer.setZIndex(this.zIndexMax++)


			//this.analyse_spatial['type_couche_inf'] = 'analyse_spatiale'
			//this.analyse_spatial['zIndex_inf'] = z
			//this.analyse_spatial['index_inf'] = this.layerInMap.length
			//this.analyse_spatial['name_analyse'] = 'analyse_spatiale_'+this.list_analyse_spatial.length
			//this.analyse_spatial['nom'] = 'Analyse spatiale '+this.list_analyse_spatial.length+1 + ' '+ this.analyse_spatial['emprisesChoisiName']

			var pte = {
				'img': 'assets/images/imagette_analyse.png',
				'checked': true,
				'visible': true,
				'type': 'analyse_spatiale',
				'type_couche_inf': 'analyse_spatiale',
				'zIndex_inf': this.zIndexMax,
				'index_inf': this.layerInMap.length,
				'emprisesChoisiName': this.analyse_spatial['emprisesChoisiName'],
				'querry': this.analyse_spatial['query'],
				'name_analyse': 'analyse_spatiale_' + this.list_analyse_spatial.length,
				'nom': 'Analyse ' + (this.list_analyse_spatial.length + 1) + ': ' + this.analyse_spatial['emprisesChoisiName']
			}

			this.layerInMap.push(pte)

			// list_analyse_spatial il sert juste de compteur, la donnée dans la n'est pas bonne lol
			this.list_analyse_spatial.push(this.analyse_spatial)


			zone_analyse_layer.set('name', pte['name_analyse']);
			zone_analyse_layer.set('type', 'analyse_spatiale');

			map.addLayer(zone_analyse_layer)

			console.log(this.layerInMap, pte)
			var extent_zone = zone_analyseSource.getExtent()
			map.getView().fit(extent_zone, { 'size': map.getSize(), 'duration': 1000 });

			var coord = proj.transform(center_zone_analyse.geometry.coordinates, 'EPSG:4326', 'EPSG:3857')

			setTimeout(() => {
				$('#' + pte['name_analyse']).show()


				var coord_caracteri = new Overlay({
					position: coord,
					positioning: 'center-center',
					element: document.getElementById(pte['name_analyse'])
				});

				map.addOverlay(coord_caracteri);

				var dynamicColors = function () {
					var r = Math.floor(Math.random() * 255);
					var g = Math.floor(Math.random() * 255);
					var b = Math.floor(Math.random() * 255);
					return "rgb(" + r + "," + g + "," + b + ")";
				};
				var coloR = []
				for (var i in numbers) {

					coloR.push(dynamicColors());
				}
				this.chart_analyse_spatiale[this.chart_analyse_spatiale.length] = new Chart(pte['name_analyse'], {
					type: 'bar',
					data: {
						labels: labels,
						datasets: [
							{
								data: numbers,
								backgroundColor: coloR,
								borderColor: 'rgba(200, 200, 200, 0.75)',
								hoverBorderColor: 'rgba(200, 200, 200, 1)',
							}
						]
					},
					options: {
						title: {
							display: true,
							text: pte['emprisesChoisiName'],
							fontColor: "Black",
							fontSize: 16,
							position: 'bottom'
						},
						legend: {
							display: false,
							labels: {
								fontColor: "Black",
								// fontSize: 18
							}
						},
						scales: {
							xAxes: [{
								display: true,
							}],
							yAxes: [{
								display: false,
							}],
						},

						onClick: (event) => {
							console.log(event)
							var name_analyse = event.target.id

							for (var index = 0; index < this.layerInMap.length; index++) {
								if (this.layerInMap[index]['type'] == 'analyse_spatiale' && this.layerInMap[index]['name_analyse'] == name_analyse) {
									var items = []
									for (var i = 0; i < this.layerInMap[index]['querry'].length; i++) {
										var element = this.layerInMap[index]['querry'][i];
										items.push({
											'nom': element['nom'],
											'nom_file': element['nom_file'],
											'type': 'url',
											'number': element['number']
										})
									}
									this.zone.run(() => {
										this.typeDataFeature = 'download'
										this.dataFeature = items
									})
									console.log(this.typeDataFeature, this.dataFeature)
									this.openProperties('170px')
								}
							}

						}
					}
				});

				var notif = this.notif.open("Cliquer sur le graphique pour telecharger", 'Fermer', {
					duration: 20000
				});

			}, 1000)

		})
	}

	removeSpecialCharacter(data) {
		return data.replace(/[^a-zA-Z0-9]/g, '_');
	}

	desactivate_an_icon() {
		var lay;
		map.getLayers().forEach(function (layer) {
			if (layer.get('name') == "activate_icon") {
				lay = layer
			}
		});

		if (lay) {
			map.removeLayer(lay)
		}

	}

	activate_an_icon(geometry_, type) {
		console.log(geometry_.getCoordinates(), geometry_)
		this.desactivate_an_icon()
		var coord = geometry_.getCoordinates()
		var primaryColor = this.primaryColor
		if (type == 'Point') {

			var features = []
			var newMarker = new Feature({
				geometry: new geom.Point(coord),
			});
			features[0] = newMarker;


			var markerSource = new source.Vector({
				features: features
			});

			var LayTheCopy = new layer.Vector({
				source: markerSource,
				style: new style.Style({
					image: new style.Circle({
						radius: 24,
						stroke: new style.Stroke({
							color: primaryColor,
							width: 5,

						})
					})
				})
			})

			LayTheCopy.set('name', "activate_icon");
			LayTheCopy.setZIndex(1002)
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


	}

	closePropertiesPdf(j) {
		this.displayPropertiesDivs.splice(j, 1)
	}
	right_click(e) {

		var coord = map.getCoordinateFromPixel([e.layerX, e.layerY])

		this.data_right_click['coord'] = coord
		this.data_right_click['zoom'] = map.getView().getZoom()

	}

	addGeoSignets() {
		this.geoSignets.push({
			'id': this.geoSignets.length + 1,
			'coord': this.data_right_click['coord'],
			'zoom': this.data_right_click['zoom']
		})

		var notif = this.notif.open("Le GéoSignet a bien été ajouté", 'Fermer', {
			duration: 2000
		});
		console.log(this.geoSignets)
	}
	lunch_function(id) {

		var fun = this.data_right_click['item'][id]['click'];

		eval(fun + '();');
	}

	shareLocation() {
		
		var coord = this.data_right_click['coord']
		var path = coord[0].toFixed(4) + ',' + coord[1].toFixed(4) + ',' + map.getView().getZoom()
		var url_share = this.url_frontend + '/map?share=location&path=' + path

		var notif = this.notif.open(url_share, 'Partager', {
			duration: 10000
		});

		notif.onAction().subscribe(() => {
			$('#share_div').show()
			this.url_share = url_share
			setTimeout(() => {
				$('#share_div').hide()
			}, 5000)
			//this.selectText('simple-snack-bar span')
		});
	}
	zoomToPoint() {
		map.getView().setZoom(18)
		map.getView().setCenter(this.data_right_click['coord'])
	}
	getCarateristics() {

		var coord = this.data_right_click['coord']

		$('#coord_caracteristics').show()
		var coord_caracteri = new Overlay({
			position: coord,
			element: document.getElementById('coord_caracteristics')
		});

		map.addOverlay(coord_caracteri);

		$('#coord_caracteristics').on('mousemove', (evt) => {
			$('#coord_caracteristics .fa-times').show()

			$('#coord_caracteristics .fa-dot-circle').hide()
		})

		$('#coord_caracteristics').on('mouseout', (evt) => {
			$('#coord_caracteristics .fa-times').hide()

			$('#coord_caracteristics .fa-dot-circle').show()

		})

		var coord_4326 = proj.transform(coord, 'EPSG:3857', 'EPSG:4326')

		this.caracteristicsPoint['adresse'] = false
		this.caracteristicsPoint['position'] = false

		this.caracteristicsPoint['coord'] = coord_4326[0].toFixed(4) + ' , ' + coord_4326[1].toFixed(4)


		$.post(this.url_prefix + 'getLimite', { 'coord': coord_4326 }, (data) => {
			this.caracteristicsPoint['commune'] = data.commune
			// this.caracteristicsPoint['quartier'] = data.quartier
			this.caracteristicsPoint['departement'] = data.departement
			// this.caracteristicsPoint['region'] = data.region
			$('#spinner_loading').hide()

			this.caracteristicsPoint['display'] = true
			/*$('#bloc_caracteristiqueushare_button').click((e)=>{
				this.shareLocation()
			}) 

			$('#bloc_caracteristique_zoomToPoint').click((e)=>{
				this.zoomToPoint()
			})*/

			console.log(this.caracteristicsPoint)
		})


		var geocodeOsm = "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + coord_4326[1] + "&lon=" + coord_4326[0] + "&zoom=18&addressdetails=1"
		this.caracteristicsPoint['lieu_dit'] = false
		$.get(geocodeOsm, (data) => {
			console.log(data)
			var name = data.display_name.split(',')[0]
			var osm_url = 'https://www.openstreetmap.org/' + data.osm_type + '/' + data.osm_id
			this.caracteristicsPoint['lieu_dit'] = name
			this.caracteristicsPoint['url_osm'] = osm_url
		})

	}

	close_caracteristique() {
		this.caracteristicsPoint['display'] = false
		$('#coord_caracteristics').hide()
	}

	share(type, couche, sous, group) {
		if (type == 'map') {
			if (sous) {
				var url = couche.key_couche + ',' + sous.key + ',' + group.id_cartes
			} else {
				var url = couche.key_couche + ',false,' + group.id_cartes
			}
		} else if (type == 'data') {
			if (sous) {
				var url = couche.key_couche + ',' + sous.key + ',' + group.id_thematique
			} else {
				var url = couche.key_couche + ',false,' + group.id_thematique
			}
		}

		var url_share = this.url_frontend + '/map?share=' + type + '&path=' + url

		var notif = this.notif.open(url_share, 'Partager', {
			duration: 7000
		});

		notif.onAction().subscribe(() => {
			$('#share_div').show()
			this.url_share = url_share
			setTimeout(() => {
				$('#share_div').hide()
			}, 5000)

			//this.selectText('simple-snack-bar span')
		});
	}

	shareStateOfMap(){

		function dynamicSort(property) {
			var sortOrder = 1;
			if(property[0] === "-") {
				sortOrder = -1;
				property = property.substr(1);
			}
			return function (a,b) {
				var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
				return result * sortOrder;
			}
		}
		var urls = []

		for (var i = 0; i < this.layerInMap.length; i++) {
			if (!this.layerInMap[i].principal && this.layerInMap[i].visible==true) {
			
				if(this.layerInMap[i].type_couche == "requete" || this.layerInMap[i].type_couche == "couche" || this.layerInMap[i].type == "api"  ){
					if (this.layerInMap[i].id_sous_cat) {
						var url = "data,"+this.layerInMap[i].id_sous_cat_couche + ',' + this.layerInMap[i].id_sous_cat + ',' + this.layerInMap[i].id_cat
						
					} else {
						var url = "data,"+this.layerInMap[i].id_sous_cat_couche + ',false' + this.layerInMap[i].id_cat
					}

					urls.push({
						'url':url,
						'rang':this.layerInMap[i].zIndex_inf
					})
				}else if(this.layerInMap[i].type_couche == "wms" || this.layerInMap[i].type == "wms" || this.layerInMap[i].type == "xyz" || this.layerInMap[i].type == "pdf"){

				
						if (this.layerInMap[i].id_sous_cat) {
							if(this.layerInMap[i].typeInf =="sous_cartes_pdf"){
								var url = "map,"+this.layerInMap[i].id_sous_cat_couche + ',' + this.layerInMap[i].id_sous_cat + ',' + this.layerInMap[i].id_cat + ',' + this.layerInMap[i].id
							}else{
								var url = "map,"+this.layerInMap[i].id_sous_cat_couche + ',' + this.layerInMap[i].id_sous_cat + ',' + this.layerInMap[i].id_cat 
							}
							
						} else {
							if(this.layerInMap[i].typeInf =="sous_cartes_pdf"){
								var url = "map,"+this.layerInMap[i].id_sous_cat_couche + ',false' + this.layerInMap[i].id_cat+ ',' + this.layerInMap[i].id
							}else{
								var url = "map,"+this.layerInMap[i].id_sous_cat_couche + ',false' + this.layerInMap[i].id_cat
							}
							
						}
					urls.push({
						'url':url,
						'rang':this.layerInMap[i].zIndex_inf
					})
				}
			}
		}
		var urls_classé = urls.sort(dynamicSort("rang"));
	
		var coord = map.getView().getCenter()
		var location = coord[0].toFixed(4) + ',' + coord[1].toFixed(4) + ',' + map.getView().getZoom()
		
		var url_share =  this.url_frontend +'/map?share=state&nbre='+urls_classé.length+'&path='+location
		for (var index = 0; index < urls_classé.length; index++) {
			url_share = url_share+ '&path'+index+'='+urls_classé[index].url;
			
		}
		console.log(url_share,urls_classé)
		var notif = this.notif.open(url_share.substring(0,40)+'...', 'Partager', {
			duration: 7000
		});
		
		notif.onAction().subscribe(() => {
			$('#share_div').show()
			this.url_share = url_share
			setTimeout(() => {
				$('#share_div').hide()
			}, 5000)
		});
	}

	displayAllFromStateOfMap(){
		this.activatedRoute.queryParams.subscribe(params => {
			let share = params['share'];
			let nbre = params['nbre']-1;

			if(share == 'state'){

				var path_index = 0

				while (path_index <= nbre) {
					if( params['path'+path_index]){
				
						var path = params['path'+path_index].split(',')

						var type_data = path[0]
						var key_couche = path[1]
						var key_sous = path[2]
						var key_groupe = path[3]

						if (type_data == 'data') {
		
							for (var i = 0; i < this.thematiques.length; i++) {
								if (this.thematiques[i].id_thematique == key_groupe) {
		
									if (this.thematiques[i].sous_thematiques && key_sous != false) {
		
										for (var j = 0; j < this.thematiques[i].sous_thematiques.length; j++) {
											if (this.thematiques[i].sous_thematiques[j].key == key_sous) {
		
												for (var k = 0; k < this.thematiques[i].sous_thematiques[j].couches.length; k++) {
													if (this.thematiques[i].sous_thematiques[j].couches[k].key_couche == key_couche) {
														this.thematiques[i].sous_thematiques[j].couches[k].checked = true
														this.displayDataOnMap(this.thematiques[i].sous_thematiques[j].couches[k], this.thematiques[i])
		
													}
		
												}
		
											}
										}
									} else {
										if (this.thematiques[i].id_thematique == key_groupe) {
											for (var j = 0; j < this.thematiques[i].couches.length; j++) {
		
												if (this.thematiques[i].couches[j].key_couche == key_couche) {
													this.thematiques[i].couches[j].checked = true
													this.displayDataOnMap(this.thematiques[i].couches[j], this.thematiques[i])
		
												}
		
											}
										}
									}
								}
							}
		
						}else if (type_data == 'map') {
					
							if(path[4]){
								var id_mapPdf = path[4]
							}

							for (var i = 0; i < this.cartes.length; i++) {

								if (this.cartes[i].id_cartes == key_groupe) {

									if (this.cartes[i].sous_cartes && key_sous != false) {
										for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
											if (this.cartes[i].sous_cartes[j].key == key_sous) {
												for (var k = 0; k < this.cartes[i].sous_cartes[j].couches.length; k++) {
													if (this.cartes[i].sous_cartes[j].couches[k].key_couche == key_couche && !id_mapPdf) {
														this.cartes[i].sous_cartes[j].couches[k].checked = true
														this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k], this.cartes[i])

													}else if (this.cartes[i].sous_cartes[j].couches[k].key_couche == key_couche && id_mapPdf){
														for (var index = 0; index < this.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
															if(this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['id'] == id_mapPdf){
																this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].checked = true
																this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index], this.cartes[i])
															}
															
														}
													}
												}
											}
										}
									} else {
										for (var j = 0; j < this.cartes[i].couches.length; j++) {
											if (this.cartes[i].couches[j].key_couche == key_couche && !id_mapPdf) {
												this.cartes[i].couches[j].checked = true
												this.displayDataOnMap(this.cartes[i].couches[j], this.cartes[i])

											}else if (this.cartes[i].couches[j].key_couche == key_couche && id_mapPdf){
												for (var index = 0; index < this.cartes[i].couches[j].cartes_pdf.length; index++) {
													if(this.cartes[i].couches[j].cartes_pdf[index]['id'] == id_mapPdf){
														this.cartes[i].couches[j].cartes_pdf[index].checked = true
														this.displayDataOnMap(this.cartes[i].couches[j].cartes_pdf[index], this.cartes[i])
													}
													
												}
											}
										}
									}

								}
							}

						}
					}
					if(path_index == nbre){
						var location = params['path'].split(',')
						console.log(location, location[2])
						this.data_right_click['coord'] = [parseFloat(location[0]), parseFloat(location[1])]
						map.getView().setZoom(parseFloat(location[2]))
						map.getView().setCenter(this.data_right_click['coord'])
						this.getCarateristics()
					}
					path_index++
				}

				
			}
			
		})
	}

	shareMapPdf(mapPdf){
		console.log(mapPdf)
		if (mapPdf.id_sous_cat) {
			var url = mapPdf.id_sous_cat_couche + ',' + mapPdf.id_sous_cat + ',' + mapPdf.id_cat+','+ mapPdf.id
		} else {
			var url = mapPdf.id_sous_cat_couche + ',false' + mapPdf.id_cat+','+ mapPdf.id
		}

		var url_share = this.url_frontend + '/map?share=map' + '&path=' + url
		
				var notif = this.notif.open(url_share, 'Partager', {
					duration: 7000
				});
		
				notif.onAction().subscribe(() => {
					$('#share_div').show()
					this.url_share = url_share
					setTimeout(() => {
						$('#share_div').hide()
					}, 5000)
				});
	}  
	

	shareFeature(feature) {
		var donne = {}
		for (var index = 0; index < feature.length; index++) {
			if (feature[index]['type'] == 'share') {
				donne = feature[index]
			}
		}

		

		console.log(feature,donne) 
		if (donne["index"] == "share_osm") {
			var url_share = this.url_frontend + '/map?share=feature&type=osm&path='+donne["val"]
		}else if(donne["index"] == "share_limites"){
			var url_share = this.url_frontend + '/map?share=limites&path='+donne["val"]
		}else if(donne["index"] == "share_feature"){
			var url_share = this.url_frontend + '/map?share=feature&type=feature&path='+donne["val"]
		}

		var notif = this.notif.open(url_share, 'Partager', {
			duration: 10000
		});

		notif.onAction().subscribe(() => {
			$('#share_div').show()
			this.url_share = url_share
			setTimeout(() => {
				$('#share_div').hide()
			}, 5000)
		});
	}

	undescore2space(donne): any {

		return donne.replace(/_/g, ' ')
	}

	space2underscore(donne): any {
		return donne.replace(/ /g, '_')
	}

	constructMapBind() {

		for (var i = 0; i < this.cartes.length; i++) {
			if (this.cartes[i].sous_cartes) {
				for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
					for (var k = 0; k < this.cartes[i].sous_cartes[j].couches.length; k++) {
						if (this.cartes[i].sous_cartes[j].couches[k].principal && !this.cartes[i].sous_cartes[j].couches[k]['constructMapBind']) {
							var target = 'map' + this.cartes[i].sous_cartes[j].couches[k].key_couche + 'true' + this.cartes[i].sous_cartes[j].key
							this.cartes[i].sous_cartes[j].couches[k]['constructMapBind'] = true
							this.displayDataOfBindOnMap(this.cartes[i].sous_cartes[j].couches[k], target)
						}

					}
				}
			} else {
				for (var j = 0; j < this.cartes[i].couches.length; j++) {
					if (this.cartes[i].couches[j].principal && !this.cartes[i].couches[j]['constructMapBind']) {
						var target = 'map' + this.cartes[i].couches[j].key_couche + 'false' + this.cartes[i].id_cartes
						this.cartes[i].couches[j]['constructMapBind'] = true
						this.displayDataOfBindOnMap(this.cartes[i].couches[j], target)
					}
				}
			}
		}
	}

	zoom(type) {

		if (type == 'plus') {

			map.getView().setZoom(map.getView().getZoom() + 1)

		} else {

			map.getView().setZoom(map.getView().getZoom() - 1)

		}

	}

	zoomToExtent() {

		map.removeInteraction(this.draw);
		this.deZoomToExtentStatus = false

		if (!this.zoomToExtentStatus) {

			this.draw = new interaction.DragBox({

			});

			map.addInteraction(this.draw);

			var sourceZoom = new source.Vector();

			var vector = new layer.Vector({
				source: sourceZoom
			});

			this.draw.on('boxend', (evt) => {
				var geom = evt.target.getGeometry();
				var feat = new Feature({ geometry: geom });
				sourceZoom.addFeature(feat);

				var src = vector.getSource();
				var extent = vector.getSource().getExtent();

				map.getView().fit(extent, { 'size': map.getSize() });

				src.clear();
			});

			this.zoomToExtentStatus = true

		} else {

			map.removeInteraction(this.draw);
			this.zoomToExtentStatus = false

		}

	}

	deZoomToExtent() {

		map.removeInteraction(this.draw);
		this.zoomToExtentStatus = false

		if (!this.deZoomToExtentStatus) {

			this.draw = new interaction.DragBox({

			});

			map.addInteraction(this.draw);

			var sourceZoom = new source.Vector();

			var vector = new layer.Vector({
				source: sourceZoom
			});

			this.draw.on('boxend', (evt) => {
				var geom = evt.target.getGeometry();
				var feat = new Feature({ geometry: geom });
				sourceZoom.addFeature(feat);

				var src = vector.getSource();
				var extent = vector.getSource().getExtent();

				map.getView().setZoom(map.getView().getZoom() - 1);

				src.clear();
			});

			this.deZoomToExtentStatus = true

		} else {

			map.removeInteraction(this.draw);
			this.deZoomToExtentStatus = false

		}

	}

	openModalComment() {
		const dialogRef = this.dialog.open(commentComponent, {
			width: '60%',
			height: '80%'
		});

		dialogRef.afterClosed().subscribe(result => {
			$('#spinner_loading').show()

			var donne = {
				'data': [],
				'coordinates': this.data_right_click['coord'],
				'table': 'tourisme_loisirs_commentaires',
				'shema': 'tourisme_et_loisirs',
				'geom': 'Point'
			}

			donne.data[0] = {
				'ind': 'nom',
				'val': result.nom
			}

			donne.data[1] = {
				'ind': 'email',
				'val': result.email
			}

			donne.data[2] = {
				'ind': 'description',
				'val': result.description
			}


			donne.data[3] = {
				'ind': 'date',
				'val': new Date()
			}
			console.log(result, donne)

			this.geoportailService.addEntite(donne).then((data: Object[]) => {
				$('#spinner_loading').hide()
				console.log(data)

				var notif = this.notif.open('Votre commentaire a bien été enregistré', 'Fermer', {
					duration: 3000
				});

			})
		})
	}

	openModal(type) {

		const dialogRef = this.dialog.open(modalComponent, {
			width: '400px',
			data: { type: type }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result.projection == 'WGS84') {
				var coord_wgs84 = []
				coord_wgs84[0] = parseFloat(result.longitude)
				coord_wgs84[1] = parseFloat(result.latitude)
				var coord = proj.transform([coord_wgs84[0], coord_wgs84[1]], 'EPSG:4326', 'EPSG:3857')

				console.log(coord)

				var point_geojson = turf.point(coord);
				var bbox_cam = turf.bboxPolygon(this.extent_cameroun);
				var bbox_point = turf.bboxPolygon(turf.bbox(point_geojson));
				//console.log(point_geojson,bbox_cam)
				var bool = turf.booleanContains(bbox_cam, point_geojson)
				if (bool) {

					map.setView(new View({
						center: coord,
						zoom: 17,
					}))

					$('#setCoordOverlay').show()
					var setCoordOverlay = new Overlay({
						position: coord,
						element: document.getElementById('setCoordOverlay')
					});

					map.addOverlay(setCoordOverlay);

					$('#setCoordOverlay').on('mousemove', (evt) => {
						$('#setCoordOverlay i').show()
					})

					$('#setCoordOverlay').on('mouseout', (evt) => {
						$('#setCoordOverlay i').hide()
					})
				} else {
					var notif = this.notif.open("Vos coordonnées sont en déhors du Cameroun", 'Fermer', {
						duration: 2000
					});
				}

			}
		})
	}

	close_setCoordOverlay() {
		$('#setCoordOverlay').hide()
	}

	rollBack() {

		this.updateStory = false;
		if (this.pos != 0) {
			this.pos--;
			map.getView().setCenter([this.centerStory[this.pos][0], this.centerStory[this.pos][1]]);
			var tr = map.getView().setZoom(this.zoomStory[this.pos]);
			if (tr != null)
				this.updateStory = true;
		} else {
			this.updateStory = true;
		}

	}

	globalView() {
		map.getView().fit(this.extent_cameroun, { 'size': map.getSize(), 'duration': 1000 });
	}

	rollFront() {

		this.updateStory = false;
		var len = this.zoomStory.length;
		if (this.pos != len - 1) {
			this.pos++;
			map.getView().setCenter([this.centerStory[this.pos][0], this.centerStory[this.pos][1]]);
			var tr = map.getView().setZoom(this.zoomStory[this.pos]);
			if (tr != null)
				this.updateStory = true;
		} else {
			this.updateStory = true;
		}

	}

	slideTo(typeMenu, data): any {

		this.typeMenu = typeMenu

		if (this.typeMenu == 'menuCarte') {

			this.groupMenuActive = data

			document.getElementsByClassName('slide2')[0].scrollTop = 0

			var derniere_position_de_scroll_connue = 0;
			var ticking = false;

			var faitQuelquechose = function (position_scroll) {

				var height = $('.header_bar').height() + $('.title_rollback_slide2').height()
				for (var i = 0; i < document.getElementsByClassName('sous_themes_cartes').length; i++) {


					if (document.getElementsByClassName('sous_themes_cartes')[i].getBoundingClientRect().top - (height + $('.sous_themes_cartes').height()) < 3) {


						document.getElementsByClassName('sous_themes_cartes')[i].className = 'sous_themes_cartes_active'



						if (document.getElementsByClassName('sous_themes_cartes_active').length > 1) {

							document.getElementsByClassName('sous_themes_cartes_active')[0].className = 'sous_themes_cartes'

						}
						var rang = document.getElementsByClassName('sous_themes_cartes_active')[0].id.split('_')[1]

						document.getElementsByClassName('sous_themes_cartes_active')[0]['style']['top'] = height - 5 + 'px'

					}
				}

				for (var i = 0; i < document.getElementsByClassName('sous_themes_block').length; i++) {

					if (document.getElementsByClassName('sous_themes_block')[i].getBoundingClientRect().top > (height + $('.sous_themes_cartes').height())) {

						var rang = document.getElementsByClassName('sous_themes_block')[i].id.split('_')[1]

						document.getElementById('sousthemescartes_' + rang).className = 'sous_themes_cartes'

					}
				}
			}

			document.getElementsByClassName('slide2')[0].addEventListener('scroll', (e) => {
				derniere_position_de_scroll_connue = document.getElementsByClassName('slide2')[0].scrollTop;

				if (!ticking) {
					window.requestAnimationFrame(() => {

						faitQuelquechose(derniere_position_de_scroll_connue);


						ticking = false;
					});
				}
				ticking = true;
			});

		} else if (this.typeMenu == 'menuThematique') {

			this.groupMenuActive = data

		} else if (this.typeMenu == 'analyse_spatial') {
			this.groupMenuActive = {
				'nom': 'Telechargement des données'
			}
		}
		if (!this.opened_left || this.opened_left == undefined) {
			this.toggle_left('')
		}
		
		$('.slide2').css('left', '0px');
		$('.title_rollback_slide2').css('left', '5px');
		$('.slide2').css('bottom', '0px');
		// $('.mat-drawer').css('overflow-y', 'inherit');
		// $('.slide2').css('overflow-y', 'initial');


	}

	slideBack(): any {
		$('.slide2').css('left', '-260px');
		$('.title_rollback_slide2').css('left', '-260px');
		$('.sous_themes_cartes_active').css('position', 'unset');
		// $('.mat-drawer').css('overflow-y', 'auto');
	}


	hexToRgb(hex): any {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	drawToolsFunction(type): any {

		var rgb = this.hexToRgb(this.primaryColor);

		map.removeInteraction(this.draw);

		if (this.type_edit_draw != undefined) {
			this.EditDraw(this.type_edit_draw)
		}

		if (this.type_draw != type) {

			this.type_draw = type

			if (type == 'text') {

				var source_text = new source.Vector();

				var vector_text = new layer.Vector({
					source: source_text
				})

				this.draw = new interaction.Draw({
					source: source_text,
					type: 'Point',
					style: new style.Style({
						stroke: new style.Stroke({
							color: this.primaryColor,
							width: 4
						}),
						image: new style.Circle({
							radius: 5,
							stroke: new style.Stroke({
								color: this.primaryColor
							}),
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.1]
							})
						})
					})

				});
				map.addInteraction(this.draw);

				this.draw.on("drawend", (e) => {
					var id = this.count_draw[type].length
					var geom = e.feature.getGeometry().getCoordinates();
					var coord = geom

					this.commentBox.setPosition(coord);


					$("#text-comment").val(null);
					$("#text-comment").data('id', id);
					$("#text-comment").data('type', type);
					$("#text-comment").data('coord', coord);

					$("#comment").show();
				})


			} else {


				this.draw = new interaction.Draw({
					source: this.source_draw,
					type: type,
					style: new style.Style({
						stroke: new style.Stroke({
							color: this.primaryColor,
							width: 4
						}),
						image: new style.Circle({
							radius: 5,
							stroke: new style.Stroke({
								color: this.primaryColor
							}),
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.1]
							})
						})
					})
				});

				map.addInteraction(this.draw);


				this.draw.on("drawend", (e) => {

					var id = this.count_draw[type].length
					var geom = e.feature.getGeometry().getCoordinates();

					if (type == 'Point') {
						var coord = geom
					} else if (type == 'Polygon') {
						var coord = geom[0][1]
					} else {
						var coord = geom[0]
					}

					this.commentBox.setPosition(coord);
					$("#comment").show();
					$("#text-comment").val(null);
					$("#text-comment").data('id', id);
					$("#text-comment").data('type', type);


					var feature = e.feature;
					feature.set('descripion', "");
					feature.set('type', type);
					feature.set('id', id);

					feature.setStyle(new style.Style({
						fill: new style.Fill({
							color: [rgb.r, rgb.g, rgb.b, 0.1]
						}),
						stroke: new style.Stroke({
							color: this.primaryColor,
							width: 4
						}),
						image: new style.Circle({
							radius: 6,
							fill: new style.Fill({
								color: this.primaryColor
							})
						})
					}))

					this.count_draw[type].push({ "id": id, "comment": null, "type": type, "geometry": geom, "hexa_code": this.primaryColor });

				});

			}
		} else {

			this.type_draw = undefined

			$("#comment").hide();

		}

	}

	saveComment_draw(comment) {

		var id = $("#text-comment").data('id')
		var type = $("#text-comment").data('type')

		if (type == 'text') {

			var feature;
			for (var i = 0; i < this.source_draw.getFeatures().length; i++) {
				if (this.source_draw.getFeatures()[i].get('id') == id && this.source_draw.getFeatures()[i].get('type') == type) {
					feature = this.source_draw.getFeatures()[i]
					var color = this.count_draw[type][id].hexa_code
					this.count_draw[type][id].comment = comment
					feature.set('descripion', comment);
					feature.setStyle(new style.Style({
						image: new style.Circle({
							radius: 1,
							stroke: new style.Stroke({
								color: color
							}),
						}),
						text: new style.Text({
							font: 'bold 18px Calibri,sans-serif',
							fill: new style.Fill({
								color: color
							}),
							text: comment,
							stroke: new style.Stroke({ color: '#fff', width: 2 }),
						})

					}))
				}
			}

			if (!feature) {
				var coord = $("#text-comment").data('coord')

				feature = new Feature({
					geometry: new geom.Point(coord),
				});

				feature.set('descripion', comment);
				feature.set('type', 'text');
				feature.set('id', id);

				feature.setStyle(new style.Style({
					image: new style.Circle({
						radius: 1,
						stroke: new style.Stroke({
							color: this.primaryColor
						}),
					}),
					text: new style.Text({
						font: 'bold 18px Calibri,sans-serif',
						fill: new style.Fill({
							color: this.primaryColor
						}),
						text: comment,
						stroke: new style.Stroke({ color: '#fff', width: 2 }),
					})

				}))

				this.source_draw.addFeatures([feature])

				this.count_draw[type].push({ "id": id, "comment": comment, "type": type, "geometry": coord, "hexa_code": this.primaryColor });
			}

		}

		this.count_draw[type][id]['comment'] = comment

		$("#comment").hide();


	}

	closeComment_draw() {
		$("#comment").hide(); //simple-snack-bar span
	}

	selectText(containerid) {
		if (Document['selection']) { // IE 
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

			var notif = this.notif.open("Vous n'avez aucun dessin", 'Fermer', {
				duration: 2500
			});

			notif.onAction().subscribe(() => {

				console.log('The snack-bar action was triggered!');
			});


		} else {

			if (this.edit_draw_button) {
				map.removeInteraction(this.select)
				map.removeInteraction(this.modify)

				if (this.type_edit_draw != undefined) {
					this.EditDraw(this.type_edit_draw)
				}

				this.type_edit_draw = undefined
				$("#comment").hide();
				$("#colorPicker").hide();

			} else {

				map.removeInteraction(this.draw);

				if (this.type_draw != undefined) {
					this.drawToolsFunction(this.type_draw)
				}


			}

			this.edit_draw_button = !this.edit_draw_button


		}



	}

	EditDraw(type) {

		map.removeInteraction(this.select)
		map.removeInteraction(this.modify)

		if (this.type_draw != undefined) {
			this.drawToolsFunction(this.type_draw)
		}

		var id;
		var color;
		var type_geom;

		if (this.count_draw['Point'].length > 0) {

			for (var i = 0; i < this.count_draw['Point'].length; i++) {
				if (this.count_draw['Point'][i].modeEdit) {
					id = this.count_draw['Point'][i].id
					color = this.count_draw['Point'][i].hexa_code
					this.count_draw['Point'][i].modeEdit = false
					type_geom = 'Point'
				}
			}

		}

		if (this.count_draw['LineString'].length > 0) {
			for (var i = 0; i < this.count_draw['LineString'].length; i++) {
				if (this.count_draw['LineString'][i].modeEdit) {
					id = this.count_draw['LineString'][i].id
					color = this.count_draw['LineString'][i].hexa_code
					this.count_draw['LineString'][i].modeEdit = false
					type_geom = 'LineString'
				}
			}
		}

		if (this.count_draw['Polygon'].length > 0) {
			for (var i = 0; i < this.count_draw['Polygon'].length; i++) {
				if (this.count_draw['Polygon'][i].modeEdit) {
					id = this.count_draw['Polygon'][i].id
					color = this.count_draw['Polygon'][i].hexa_code
					this.count_draw['Polygon'][i].modeEdit = false
					type_geom = 'Polygon'

				}
			}
		}

		if (this.count_draw['text'].length > 0) {
			for (var i = 0; i < this.count_draw['text'].length; i++) {
				if (this.count_draw['text'][i].modeEdit) {
					id = this.count_draw['text'][i].id
					color = this.count_draw['text'][i].hexa_code
					this.count_draw['text'][i].modeEdit = false
					type_geom = 'text'
				}
			}
		}

		if (color) {

			var rgb = this.hexToRgb(color);


			map.getLayers().forEach(function (leyer) {
				if (leyer.get('name') == 'draw') {

					for (var i = 0; i < leyer.get('source').getFeatures().length; i++) {

						if (leyer.get('source').getFeatures()[i].get('id') == id && leyer.get('source').getFeatures()[i].get('type') == type_geom) {

							if (leyer.get('source').getFeatures()[i].get('type') == 'text') {

								leyer.get('source').getFeatures()[i].setStyle(new style.Style({
									fill: new style.Fill({
										color: [rgb.r, rgb.g, rgb.b, 0.1]
									}),
									stroke: new style.Stroke({
										color: color,
										width: 4
									}),
									image: new style.Circle({
										radius: 1,
										fill: new style.Fill({
											color: color
										})
									}),
									text: new style.Text({
										font: 'bold 18px Calibri,sans-serif',
										fill: new style.Fill({
											color: color
										}),
										text: leyer.get('source').getFeatures()[i].get('descripion'),
										stroke: new style.Stroke({ color: '#fff', width: 2 }),
									})
								}))

							} else {

								leyer.get('source').getFeatures()[i].setStyle(
									new style.Style({
										fill: new style.Fill({
											color: [rgb.r, rgb.g, rgb.b, 0.1]
										}),
										stroke: new style.Stroke({
											color: color,
											width: 4
										}),
										image: new style.Circle({
											radius: 6,
											fill: new style.Fill({
												color: color
											})
										})
									})
								)

							}

						}
					}

				}
			});

		}

		if (this.type_edit_draw != type) {




			if (type == 'geometry') {

				this.select = new interaction.Select({
					wrapX: false,
					style: new style.Style({
						stroke: new style.Stroke({
							color: '#F9B70F',
							width: 4
						}),
						image: new style.Circle({
							radius: 11,
							fill: new style.Fill({
								color: '#E40E2F'
							})
						})
					})
				});

				this.modify = new interaction.Modify({
					features: this.select.getFeatures(),
					style: new style.Style({
						stroke: new style.Stroke({
							color: '#F9B70F',
							width: 4
						}),
						image: new style.Circle({
							radius: 6,
							fill: new style.Fill({
								color: '#E40E2F'
							})
						})
					})
				})

				map.addInteraction(this.select)
				map.addInteraction(this.modify)

				this.modify.once("modifystart", function (e) {


				})

				this.modify.on("modifyend", (e) => {

					e.features.forEach((feature) => {
						this.count_draw[feature.get('type')][feature.get('id')].geometry = feature.getGeometry().getCoordinates()
					})

				})


				this.select.on('select', (e) => {
					//console.log(78,this.select.getFeatures().getArray())
					// this.select.setActive(false)

					var id;
					var color;
					var type_geom;

					if (this.count_draw['Point'].length > 0) {

						for (var i = 0; i < this.count_draw['Point'].length; i++) {
							if (this.count_draw['Point'][i].modeEdit) {
								id = this.count_draw['Point'][i].id
								color = this.count_draw['Point'][i].hexa_code
								this.count_draw['Point'][i].modeEdit = false
								type_geom = 'Point'
							}
						}

					}

					if (this.count_draw['LineString'].length > 0) {
						for (var i = 0; i < this.count_draw['LineString'].length; i++) {
							if (this.count_draw['LineString'][i].modeEdit) {
								id = this.count_draw['LineString'][i].id
								color = this.count_draw['LineString'][i].hexa_code
								this.count_draw['LineString'][i].modeEdit = false
								type_geom = 'LineString'
							}
						}
					}

					if (this.count_draw['Polygon'].length > 0) {
						for (var i = 0; i < this.count_draw['Polygon'].length; i++) {
							if (this.count_draw['Polygon'][i].modeEdit) {
								id = this.count_draw['Polygon'][i].id
								color = this.count_draw['Polygon'][i].hexa_code
								this.count_draw['Polygon'][i].modeEdit = false
								type_geom = 'Polygon'

							}
						}
					}

					if (this.count_draw['text'].length > 0) {
						for (var i = 0; i < this.count_draw['text'].length; i++) {
							if (this.count_draw['text'][i].modeEdit) {
								id = this.count_draw['text'][i].id
								color = this.count_draw['text'][i].hexa_code
								this.count_draw['text'][i].modeEdit = false
								type_geom = 'text'
							}
						}
					}

					if (color) {

						var rgb = this.hexToRgb(color);


						map.getLayers().forEach(function (leyer) {
							if (leyer.get('name') == 'draw') {

								for (var i = 0; i < leyer.get('source').getFeatures().length; i++) {

									if (leyer.get('source').getFeatures()[i].get('id') == id && leyer.get('source').getFeatures()[i].get('type') == type_geom) {

										if (leyer.get('source').getFeatures()[i].get('type') == 'text') {

											leyer.get('source').getFeatures()[i].setStyle(new style.Style({
												fill: new style.Fill({
													color: [rgb.r, rgb.g, rgb.b, 0.1]
												}),
												stroke: new style.Stroke({
													color: color,
													width: 4
												}),
												image: new style.Circle({
													radius: 1,
													fill: new style.Fill({
														color: color
													})
												}),
												text: new style.Text({
													font: 'bold 18px Calibri,sans-serif',
													fill: new style.Fill({
														color: color
													}),
													text: leyer.get('source').getFeatures()[i].get('descripion'),
													stroke: new style.Stroke({ color: '#fff', width: 2 }),
												})
											}))

										} else {

											leyer.get('source').getFeatures()[i].setStyle(new style.Style({
												fill: new style.Fill({
													color: [rgb.r, rgb.g, rgb.b, 0.1]
												}),
												stroke: new style.Stroke({
													color: color,
													width: 4
												}),
												image: new style.Circle({
													radius: 6,
													fill: new style.Fill({
														color: color
													})
												})
											}))

										}


									}


								}

							}
						});

					}

					for (var i = 0; i < this.count_draw[this.select.getFeatures().getArray()[0].get('type')].length; i++) {
						if (this.count_draw[this.select.getFeatures().getArray()[0].get('type')][i].id == this.select.getFeatures().getArray()[0].get('id')) {
							this.count_draw[this.select.getFeatures().getArray()[0].get('type')][i].modeEdit = true

						}
					}

					this.select.getFeatures().getArray()[0].setStyle(

						new style.Style({
							fill: new style.Fill({
								color: [0, 0, 0, 0.1]
							}),
							stroke: new style.Stroke({
								color: '#E40E2F',
								width: 4
							}),
							image: new style.Circle({
								radius: 6,
								fill: new style.Fill({
									color: '#E40E2F'
								})
							})
						}))
				})

			} else if (type == 'comment') {

				this.select = new interaction.Select({
					wrapX: false,
					style: new style.Style({
						stroke: new style.Stroke({
							color: '#F9B70F',
							width: 4
						}),
						image: new style.Circle({
							radius: 11,
							fill: new style.Fill({
								color: '#E40E2F'
							})
						})
					})
				});

				map.addInteraction(this.select)

				this.select.on('select', (e) => {

					console.log(this.select.getFeatures().getArray())
					var type_geom = this.select.getFeatures().getArray()[0].get('type')
					var id = this.select.getFeatures().getArray()[0].get('id')
					var geom = this.select.getFeatures().getArray()[0].getGeometry().getCoordinates()

					var comment = this.count_draw[type_geom][id]['comment']


					if (type_geom == 'Point' || type_geom == 'text') {
						var coord = geom
					} else if (type_geom == 'Polygon') {
						var coord = geom[0][1]
					} else {
						var coord = geom[0]
					}

					this.commentBox.setPosition(coord);
					$("#comment").show();
					$("#text-comment").val(comment);
					$("#text-comment").data('id', id);
					$("#text-comment").data('type', type_geom);
					$("#text-comment").data('coord', coord);

					console.log($("#comment"))

				})

			} else if (type == 'delete') {

				this.select = new interaction.Select({
					wrapX: false,
					style: new style.Style({
						stroke: new style.Stroke({
							color: '#F9B70F',
							width: 4
						}),
						image: new style.Circle({
							radius: 11,
							fill: new style.Fill({
								color: '#E40E2F'
							})
						})
					})
				});

				map.addInteraction(this.select)

				this.select.on('select', (e) => {


					var type_geom = this.select.getFeatures().getArray()[0].get('type')
					var id = this.select.getFeatures().getArray()[0].get('id')
					var geom = this.select.getFeatures().getArray()[0].getGeometry().getCoordinates()

					var comment = this.count_draw[type_geom][id]['comment']

					this.count_draw[type_geom][id]['visible'] = false

					this.source_draw.removeFeature(this.select.getFeatures().getArray()[0])

					this.select.getFeatures().clear();

				})

			} else if (type == 'color') {

				this.select = new interaction.Select({
					wrapX: false,
					style: new style.Style({
						stroke: new style.Stroke({
							color: '#F9B70F',
							width: 4
						}),
						image: new style.Circle({
							radius: 11,
							fill: new style.Fill({
								color: '#E40E2F'
							})
						})
					})
				});

				map.addInteraction(this.select)

				this.select.on('select', (e) => {

					$("#colorPicker").hide();
					var type_geom = this.select.getFeatures().getArray()[0].get('type')
					var id = this.select.getFeatures().getArray()[0].get('id')
					var geom = this.select.getFeatures().getArray()[0].getGeometry().getCoordinates()


					if (type_geom == 'Point' || type_geom == 'text') {
						var coord = geom
					} else if (type_geom == 'Polygon') {
						var coord = geom[0][1]
					} else {
						var coord = geom[0]
					}

					this.colorDraw = this.count_draw[type_geom][id]['hexa_code']
					this.colorPickerBox.setPosition(coord);
					$("#colorPicker").show();


					$("#draw-color").data('id', id);
					$("#draw-color").data('type', type_geom);
					$("#draw-color").data('coord', coord);



				})


			}

			this.type_edit_draw = type

		} else {

			this.type_edit_draw = undefined
			$("#comment").hide();
			$("#colorPicker").hide();

		}



	}

	saveColorPicker() {

		var id = $("#draw-color").data('id')
		var type = $("#draw-color").data('type')

		for (var i = 0; i < this.source_draw.getFeatures().length; i++) {
			if (this.source_draw.getFeatures()[i].get('id') == id && this.source_draw.getFeatures()[i].get('type') == type) {
				var feature = this.source_draw.getFeatures()[i]
				var comment = this.count_draw[type][id].comment
				var color = this.colorDraw
				this.count_draw[type][id].hexa_code = color
				var rgb = this.hexToRgb(color);

				if (type == 'text') {

					feature.setStyle(new style.Style({
						image: new style.Circle({
							radius: 1,
							stroke: new style.Stroke({
								color: color
							}),
						}),
						text: new style.Text({
							font: 'bold 18px Calibri,sans-serif',
							fill: new style.Fill({
								color: color
							}),
							text: comment,
							stroke: new style.Stroke({ color: '#fff', width: 2 }),
						})

					}))

				} else {

					feature.setStyle(
						new style.Style({
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.1]
							}),
							stroke: new style.Stroke({
								color: color,
								width: 4
							}),
							image: new style.Circle({
								radius: 6,
								fill: new style.Fill({
									color: color
								})
							})
						})
					)

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
			'Point': [],
			'LineString': [],
			'Polygon': [],
			'text': []
		}
	}

	downloadAllDraw() {


		const buttonheet_compare = this.bottomSheet.open(buttonsheetComponent, {
			data: { type: 'compare', data: this.layerInMap }
		});

		// buttonheet_compare.afterClosed().subscribe(result => {
		//   	console.log('The dialog was closed :',result);
		// });

	}

	displayGeoSignet() {
		if (this.geoSignets.length > 0) {

			const buttonheet_geosi = this.bottomSheet.open(buttonsheetGeosiComponent, {
				data: { data: this.geoSignets }
			});

			buttonheet_geosi.afterDismissed().subscribe((result) => {
				console.log(result)
				if (!result) {
					//this.modeCompare = false

				} else {

					for (var index = 0; index < this.geoSignets.length; index++) {
						if (this.geoSignets[index]['id'] == parseFloat(result)) {
							var coord = this.geoSignets[index]['coord']
							var zoom = this.geoSignets[index]['zoom']
						}

					}

					map.getView().setZoom(zoom + 1)
					map.getView().setCenter(coord)

				}
			})

		} else {
			var notif = this.notif.open("Vous n'avez aucun géosignets", 'Fermer', {
				duration: 2500
			});
		}
	}

	shareAllDraw() {


		var donnes = []

		for (var i = 0; i < this.count_draw.LineString.length; i++) {
			this.count_draw.LineString[i].geom = { "type": "LineString", "coordinates": this.count_draw.LineString[i].geometry }
			if (!this.count_draw.LineString[i].visible) {
				donnes.push(this.count_draw.LineString[i])
			}

		}

		for (var i = 0; i < this.count_draw.Polygon.length; i++) {
			this.count_draw.Polygon[i].geom = { "type": "Polygon", "coordinates": this.count_draw.Polygon[i].geometry }
			if (!this.count_draw.Polygon[i].visible) {
				donnes.push(this.count_draw.Polygon[i])
			}

		}

		for (var i = 0; i < this.count_draw.Point.length; i++) {
			this.count_draw.Point[i].geom = { "type": "Point", "coordinates": this.count_draw.Point[i].geometry }
			if (!this.count_draw.Point[i].visible) {
				donnes.push(this.count_draw.Point[i])
			}

		}

		for (var i = 0; i < this.count_draw.text.length; i++) {
			this.count_draw.text[i].geom = { "type": "Point", "coordinates": this.count_draw.text[i].geometry }
			if (!this.count_draw.text[i].visible) {
				donnes.push(this.count_draw.text[i])
			}

		}

		console.log(this.count_draw, donnes)

		if (donnes.length > 0) {
			$('#spinner_loading').show()
			this.geoportailService.saveDraw({ 'donnes': donnes }).then((data: Object[]) => {

				$('#spinner_loading').hide()

				if (data['status'] == 'ok') {
					var url_share = this.url_frontend + '/map?share=draw&id=' + data['code_dessin']

					var notif = this.notif.open(url_share, 'Partager', {
						duration: 7000
					});

					notif.onAction().subscribe(() => {
						$('#share_div').show()
						this.url_share = url_share
						setTimeout(() => {
							$('#share_div').hide()
						}, 5000)
						//this.selectText('simple-snack-bar span')
					});

				} else {

				}

			})
		} else {

			var notif = this.notif.open("Vous n'avez aucun déssins", 'Fermer', {
				duration: 10000
			});
		}




	}

	displayShareDraw(id) {
		$('#spinner_loading').show()

		this.geoportailService.getDraw({ 'code_dessin': id }).then((data: Object[]) => {
			$('#spinner_loading').hide()

			if (data['status'] == 'ok') {

				var dessins = {
					'point': [],
					'polygon': [],
					'linestring': [],
					'text': []
				}



				for (var index = 0; index < data['dessins'].length; index++) {
					var element = data['dessins'][index];

					if (element['type_dessin'] == 'Point') {
						var i = dessins['point'].length
						dessins['point'].push('element')

					} else if (element['type_dessin'] == 'Polygon') {
						var i = dessins['polygon'].length
						dessins['polygon'].push(element)

					} else if (element['type_dessin'] == "LineString") {
						var i = dessins['linestring'].length
						dessins['linestring'].push(element)

					} else if (element['type_dessin'] == "text") {
						var i = dessins['text'].length
						dessins['text'].push(element)

					}


					var type = element['type_dessin']
					var primaryColor = element['hexa_code']
					var rgb = this.hexToRgb(primaryColor);


					var feature = (new Format.GeoJSON()).readFeature(element.geometry)
					feature.set('descripion', element['descripion']);
					feature.set('type', type);
					feature.set('id', i);



					if (element['type_dessin'] == "text") {

						feature.setStyle(new style.Style({
							image: new style.Circle({
								radius: 1,
								stroke: new style.Stroke({
									color: primaryColor
								}),
							}),
							text: new style.Text({
								font: 'bold 18px Calibri,sans-serif',
								fill: new style.Fill({
									color: primaryColor
								}),
								text: element['descripion'],
								stroke: new style.Stroke({ color: '#fff', width: 2 }),
							})

						}))

					} else {

						feature.setStyle(new style.Style({
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.1]
							}),
							stroke: new style.Stroke({
								color: primaryColor,
								width: 4
							}),
							image: new style.Circle({
								radius: 6,
								fill: new style.Fill({
									color: primaryColor
								})
							})
						}))
					}

					this.count_draw[type].push({ "id": i, "comment": element['descripion'], "type": type, "geometry": JSON.parse(element.geometry).coordinates, "hexa_code": primaryColor });
					this.source_draw.addFeature(feature)

				}

				setTimeout(() => {
					console.log(this.source_draw.getExtent())
					map.getView().fit(this.source_draw.getExtent(), { 'size': map.getSize(), 'duration': 1000 });
				}, 5000)

				console.log(this.count_draw)

			} else {

			}

		})

	}

	expansionOpen() {


		if (this.edit_draw_button) {
			map.removeInteraction(this.select)
			map.removeInteraction(this.modify)

			if (this.type_edit_draw != undefined) {
				this.EditDraw(this.type_edit_draw)
			}

			this.type_edit_draw = undefined
			$("#comment").hide();
			$("#colorPicker").hide();

		} else {

			map.removeInteraction(this.draw);

			if (this.type_draw != undefined) {
				this.drawToolsFunction(this.type_draw)
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
			this.source_mesure.clear()

			if (document.querySelectorAll('.tooltip.tooltip-static').length > 0) {
				$('.tooltip.tooltip-static').hide()
			}

			this.mesure_type = undefined
		}

	}

	expansionClose(menu) {

		if (menu == 'dessin') {

			if (this.edit_draw_button) {
				map.removeInteraction(this.select)
				map.removeInteraction(this.modify)

				if (this.type_edit_draw != undefined) {
					this.EditDraw(this.type_edit_draw)
				}

				this.type_edit_draw = undefined
				$("#comment").hide();
				$("#colorPicker").hide();

			} else {

				map.removeInteraction(this.draw);

				if (this.type_draw != undefined) {
					this.drawToolsFunction(this.type_draw)
				}


			}
		} else if (menu == 'mesure') {

			if (this.mesure_type != undefined) {

				this.sketch = null;
				this.helpTooltipElement = null;
				this.measureTooltipElement = null;
				map.removeOverlay(this.measureTooltip);
				map.removeOverlay(this.helpTooltip);
				map.removeInteraction(this.draw);
				OBservable.unByKey(this.listener);
				OBservable.unByKey(this.event_mesure);
				this.source_mesure.clear()

				if (document.querySelectorAll('.tooltip.tooltip-static').length > 0) {
					$('.tooltip.tooltip-static').hide()
				}

				this.mesure_type = undefined
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
				this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement)
			}

			this.helpTooltipElement = document.createElement('div');
			this.helpTooltipElement.className = 'tooltip hidden';
			this.helpTooltip = new Overlay({
				element: this.helpTooltipElement,
				offset: [15, 0],
				positioning: 'center-left'
			});

			map.addOverlay(this.helpTooltip);

			if (this.measureTooltipElement) {
				this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
			}

			this.measureTooltipElement = document.createElement('div');
			this.measureTooltipElement.className = 'tooltip tooltip-measure';
			this.measureTooltip = new Overlay({
				element: this.measureTooltipElement,
				offset: [0, -15],
				positioning: 'bottom-center'
			});

			map.addOverlay(this.measureTooltip);

			var pointerMoveHandler = (evt) => {
				if (evt.dragging) {
					return;
				}
				/** @type {string} */
				var helpMsg = 'Click to start drawing';

				if (this.sketch) {

					var geom = (this.sketch.getGeometry());
					if (geom.getType() == 'Polygon') {
						helpMsg = this.continuePolygonMsg;
					} else if (geom.getType() == 'LineString') {
						helpMsg = this.continueLineMsg;
					}
				}

				this.helpTooltipElement.innerHTML = helpMsg;
				this.helpTooltip.setPosition(evt.coordinate);

				this.helpTooltipElement.classList.remove('hidden');
			};

			this.event_mesure = map.on('pointermove', pointerMoveHandler);

			map.getViewport().addEventListener('mouseout', () => {
				if (this.mesure_type != type && this.helpTooltipElement) {
					this.helpTooltipElement.classList.add('hidden');
				}
			});

			var formatLength = function (line) {
				var length = Sphere.getLength(line);
				var output;
				if (length > 1000) {
					output = (Math.round(length / 1000 * 100) / 100) +
						' ' + 'km';
				} else {
					output = (Math.round(length * 100) / 100) +
						' ' + 'm';
				}
				return output;
			};

			var formatArea = function (polygon) {
				var area = Sphere.getArea(polygon);
				var output;
				if (area > 10000) {
					output = (Math.round(area / 1000000 * 100) / 100) +
						' ' + 'km<sup>2</sup>';
				} else {
					output = (Math.round(area * 100) / 100) +
						' ' + 'm<sup>2</sup>';
				}

				return output;
			};


			this.draw = new interaction.Draw({
				source: this.source_mesure,
				type: type,
				style: new style.Style({
					fill: new style.Fill({
						color: 'rgba(255, 255, 255, scale)'
					}),
					stroke: new style.Stroke({
						color: 'rgba(0, 0, 0, 0.5)',
						lineDash: [10, 10],
						width: 2
					}),
					image: new style.Circle({
						radius: 5,
						stroke: new style.Stroke({
							color: 'rgba(0, 0, 0, 0.7)'
						}),
						fill: new style.Fill({
							color: 'rgba(255, 255, 255, 0.2)'
						})
					})
				})
			});


			this.draw.on('drawstart',
				(evt) => {

					// set this.sketch
					this.sketch = evt.feature;

					/** @type {Coordinate|undefined} */
					var tooltipCoord = evt.coordinate;

					this.listener = this.sketch.getGeometry().on('change', (evt) => {

						var geom = evt.target;
						var output;

						if (geom.getType() == 'Polygon') {
							output = formatArea(geom);
							tooltipCoord = geom.getInteriorPoint().getCoordinates();
						} else if (geom.getType() == 'LineString') {
							output = formatLength(geom);
							tooltipCoord = geom.getLastCoordinate();
						}


						this.measureTooltipElement.innerHTML = output;
						this.measureTooltip.setPosition(tooltipCoord);
					});
				});

			this.draw.on('drawend', () => {
				this.measureTooltipElement.className = 'tooltip tooltip-static';
				this.measureTooltip.setOffset([0, -7]);
				// unset this.sketch
				this.sketch = null;
				// unset tooltip so that a new one can be created
				this.measureTooltipElement = null;
				if (this.measureTooltipElement) {
					this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
				}
				this.measureTooltipElement = document.createElement('div');
				this.measureTooltipElement.className = 'tooltip tooltip-measure';
				this.measureTooltip = new Overlay({
					element: this.measureTooltipElement,
					offset: [0, -15],
					positioning: 'bottom-center'
				});
				map.addOverlay(this.measureTooltip);
				OBservable.unByKey(this.listener);
			});

			map.addInteraction(this.draw);

			this.mesure_type = type

		} else {


			this.sketch = null;
			this.helpTooltipElement = null;
			this.measureTooltipElement = null;
			map.removeOverlay(this.measureTooltip);
			map.removeOverlay(this.helpTooltip);
			map.removeInteraction(this.draw);
			OBservable.unByKey(this.listener);
			OBservable.unByKey(this.event_mesure);
			this.source_mesure.clear()

			if (document.querySelectorAll('.tooltip.tooltip-static').length > 0) {
				$('.tooltip.tooltip-static').hide()
			}

			this.mesure_type = undefined

		}


	}


	displayDataOnMap(data, groupe) {
		console.log(data)
		//console.log(this.cartes,this.thematiques)
		var donne_count = {
			'type': '',
		}
		if (data.type == 'xyz' && data.typeInf != "sous_cartes_pdf") {
			donne_count.type = 'cartes'
			donne_count['id_couche'] = data.key_couche
			if (this.cartes[data["rang_thema"]].sous_cartes) {
				donne_count['sous'] = true
			} else {
				donne_count['sous'] = false
			}

		} else if ((data.type_couche == 'wms' || data.type == 'wms') && data.typeInf != "sous_cartes_pdf") {
			if (data.type_couche) {
				donne_count.type = 'thematiques'
				donne_count['id_couche'] = data.key_couche

				if (this.thematiques[data["rang_thema"]].sous_thematiques) {
					donne_count['sous'] = true
				} else {
					donne_count['sous'] = false
				}

			} else {
				donne_count.type = 'cartes'
				donne_count['id_couche'] = data.key_couche
				if (this.cartes[data["rang_thema"]].sous_cartes) {
					donne_count['sous'] = true
				} else {
					donne_count['sous'] = false
				}
			}
		} else if (data.typeInf == "sous_cartes_pdf") {
			donne_count.type = 'pdf'
			donne_count['id_couche'] = data.id
		} else if ((data.type_couche == 'requete' || data.type_couche == 'api' || data.type_couche == 'couche') && data.typeInf != "sous_cartes_pdf") {
			donne_count.type = 'thematiques'
			donne_count['id_couche'] = data.key_couche

			if (this.thematiques[data["rang_thema"]].sous_thematiques) {
				donne_count['sous'] = true
			} else {
				donne_count['sous'] = false
			}

		}


		if (donne_count.type != '' && data.checked) {
			console.log(donne_count)

			this.geoportailService.addCountVieuwData(donne_count).then((data: Object[]) => {
				console.log(data)
			})
		}

		if (groupe && groupe.shema) {
			data.shema = groupe.shema
		}

		if (data.checked) {
			var couche_valid = true
			data.visible = true
			if (data.bbox) {
				var bbox = data.bbox.split(',')

				var Amin = proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
				var Amax = proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

				var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]]
				var a = Extent.boundingExtent([Amin, Amax])

				map.getView().fit(a, { 'size': map.getSize(), 'duration': 1000 });

			}

			if (data.zmin) {

				if (map.getView().getZoom() < data.zmin) {
					map.getView().setZoom(data.zmin)
				}
			}


			if (data.zmax) {

				if (map.getView().getZoom() > data.zmax) {
					map.getView().setZoom(data.zmax)
				}
			}
			
			if (data.type == 'xyz') {
				var tiles = new layer.Tile({
					source: new source.XYZ({
						url: data.url,
						// tileLoadFunction: function (imageTile, src) {
						//      imageTile.getImage().src = src;
						//  },
						crossOrigin: "anonymous",
						attributions: [new Attribution({
							html: " <a  target='_blank'  href='https://www.openstreetmap.org/copyright'> © OpenStreetMap</a>contributors "
						})]
					})
				})

				tiles.set('name', this.space2underscore(data.nom))
				tiles.set('type', data.type)
				tiles.set('key_couche', data.key_couche);
				tiles.set('id_cat', data.id_cat);
				tiles.setZIndex(this.zIndexMax++)
				map.addLayer(tiles);

				data.type_couche_inf = 'cartes'
				data.zIndex_inf = this.zIndexMax

			} else if (data.type_couche == 'wms' || data.type == 'wms') {
				if (data.url != null && data.url != '' && data.url != undefined) {
					 data.url = data.url.replace(/ /g,"")
					if (data.type_couche) {
						var type = data.type_couche
						data.type_couche_inf = 'thematiques'
					} else {
						var type = data.type
						data.type_couche_inf = 'cartes'
					}

					if(data.service_wms==null || data.service_wms == true){
						var wms = new source.TileWMS({
							url: data.url,
							params: { 'LAYERS': data.identifiant, 'TILED': true },
							serverType: 'mapserver',
							crossOrigin: 'anonymous'
						});
						var tiles = new layer.Tile({
							source: wms,
							visible: true
						})

						if (data.opacity) {
							tiles.setOpacity(data.opacity / 100)
						}

						if (data.interrogeable) {
							console.log(data)
							tiles.set('interrogeable', true)
						} else {
							tiles.set('interrogeable', false)
						}

						tiles.set('name', this.space2underscore(data.nom))
						tiles.set('type', type)
						tiles.set('type_couche_inf', data.type_couche_inf)
						tiles.set('key_couche', data.key_couche);
						tiles.set('id_cat', data.id_cat);
						tiles.setZIndex(this.zIndexMax++)
						map.addLayer(tiles);
					}else{ 
						 var vectorSource = new source.Vector({
							loader: (extent, resolution, projection) => {
								
								bbox =map.getView().calculateExtent(map.getSize())
							
								var Amin = proj.transform([bbox[0], bbox[1]], 'EPSG:3857', 'EPSG:4326')
								var Amax = proj.transform([bbox[2], bbox[3]], 'EPSG:3857', 'EPSG:4326')
								
								var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]]
					
								var url_wfs = data.url+"&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&typeName="+data.identifiant+"&outputFormat=GeoJSON&bbox="+extend3857.join(',')
								
								$('#spinner_loading').show()
								this.geoportailService.getUrl(url_wfs).then((donne: Object[]) => {
									$('#spinner_loading').hide()

									var features = (new Format.GeoJSON()).readFeatures(donne, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })
									for (var index = 0; index < features.length; index++) {
										features[index].set('data', features[index].getProperties())
									}
									vectorSource.addFeatures(features)
								})
							},
							strategy: loadingstrategy.bbox,
							format: new Format.GeoJSON(),
						});

						var clusterSource = new source.Cluster({
							distance: 80,
							source: vectorSource
						});
						
						var rgb = this.hexToRgb(this.primaryColor);
						
						var styleCache = {};
						var url_prefix = this.url_prefix
						var LayThe = new layer.Vector({
							source: clusterSource,
							style: function (feature) {
								var size = feature.get('features').length;
								if (size != 1) {
									var styleDefault = styleCache[size];
									if (!styleDefault) {
										styleDefault = new style.Style({

											image: new style.Circle({
												radius: 10,
												stroke: new style.Stroke({
													color: '#fff',
													width: 2
												}),
												fill: new style.Fill({
													color: [rgb.r, rgb.g, rgb.b, 1]
												})
											}),
											text: new style.Text({
												text: size.toString(),
												fill: new style.Fill({
													color: '#fff'

												}),
												font: '10px sans-serif'
											}),
										});
										styleCache[size] = styleDefault;
									}

								} else {
									var styleDefaultII = new style.Style({
										image: new style.Icon({
											scale: 0.2,
											src: url_prefix + data.img
										})
									});

									return styleDefaultII ;
								}

								return styleDefault;
							},
							visible: true
						});



						var styleCacheCopy = {};
						var LayTheCopy = new layer.Vector({
							source: clusterSource,
							style: function (feature) {
								var size = feature.get('features').length;
								var styleDefault = styleCacheCopy[size];
								if (!styleDefault) {
									styleDefault = new style.Style({

										image: new style.Icon({
											scale: 0.2,
											src: url_prefix + data.img
										}),
									});
									
									styleCacheCopy[size] = styleDefault;
								}

								return styleDefault;
							},
							visible: true
						});


						LayTheCopy.set('name', this.space2underscore(data.nom))
						LayThe.set('name', this.space2underscore(data.nom))
						LayTheCopy.set('type', 'wfs')
						LayThe.set('type', 'wfs')
						LayTheCopy.set('type_couche_inf', data.type_couche_inf)
						LayThe.set('type_couche_inf', data.type_couche_inf)
						LayTheCopy.set('key_couche', data.key_couche);
						LayThe.set('key_couche', data.key_couche);
						LayTheCopy.set('id_cat', data.id_cat);
						LayThe.set('id_cat', data.id_cat);
						LayTheCopy.setZIndex(this.zIndexMax++)
						LayThe.setZIndex(this.zIndexMax++)
						map.addLayer(LayTheCopy);
						map.addLayer(LayThe);
					}

					

					


					data.zIndex_inf = this.zIndexMax
				} else {
					couche_valid = false
					this.notif.open("Cette couche n'a pas encore été completement définie", 'Fermer', {
						duration: 5000
					});
				}
			} else if (data.type == 'pdf' && data.geom) {

				var coord = data.geom.split(',')
				var point = [parseFloat(coord[0]), parseFloat(coord[1])]

				var newMarker = new Feature({
					geometry: new geom.Point(proj.transform([parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857')),
					data: data,
				});

				var markerSource = new source.Vector({
					features: [newMarker]
				});


				var LayTheCopy = new layer.Vector({
					source: markerSource,
					style: new style.Style({
						image: new style.Icon({
							// scale: 0.22,
							src: this.url_prefix + data.image_src
						}),
						text: new style.Text({
							font: '17px Calibri,sans-serif',
							text: data['cartes_pdf'].length.toString(),
							fill: new style.Fill({ color: '#000' }),
							stroke: new style.Stroke({ color: '#000', width: 1 }),
							offsetX: 0,
							offsetY: -5,
							//rotation: rotation
						})
					}),
					visible: true
				});



				LayTheCopy.set('name', this.space2underscore(data.nom))
				LayTheCopy.set('type', data.type)
				LayTheCopy.setZIndex(this.zIndexMax++)
				LayTheCopy.set('key_couche', data.key_couche);
				LayTheCopy.set('id_cat', data.id_cat);
				map.addLayer(LayTheCopy);

				var extent = markerSource.getExtent();

				map.getView().fit(extent, { 'size': map.getSize(), 'maxZoom': 12 });

				data.type_couche_inf = 'cartes'
				data.zIndex_inf = this.zIndexMax

			} else if (data.type_couche == 'requete' && data.status == true) {
				if (data.file_json) {
					$('#spinner_loading').show()
					this.zIndexMax++

					var url = this.url_prefix + 'upload/json/' + data.file_json
					var post = {
						'file': data.file_json
					}
					this.geoportailService.getJsonFIle(post).then((donne: Object[]) => {
						if (donne.length != 0) {
							this.gestionCarto(data, donne, this.zIndexMax, data.type_couche)
						} else {
							couche_valid = false
							this.notif.open("Cette couche est vide", 'Fermer', {
								duration: 5000
							});

						}

						$('#spinner_loading').hide()

					})
					data.type_couche_inf = 'thematiques'
					data.zIndex_inf = this.zIndexMax
				} else {
					couche_valid = false

					this.notif.open("Cette couche n'a pas encore été completement définie", 'Fermer', {
						duration: 5000
					});
				}
			} else if (data.type_couche == 'couche') {
				$('#spinner_loading').show()
				this.zIndexMax++

				var url = this.url_prefix + "/api/v1/RestFull/DataJsonApi/" + data.shema + "/" + data.id_couche + ""

				this.thematiqueService.GetDataQuery(url).then((donne: Object[]) => {
					if (donne.length != 0) {
						this.gestionCarto(data, donne, this.zIndexMax, data.type_couche)
					} else {
						couche_valid = false
						this.notif.open("Cette couche est vide", 'Fermer', {
							duration: 5000
						});
					}

					$('#spinner_loading').hide()

				})
				data.type_couche_inf = 'thematiques'
				data.zIndex_inf = this.zIndexMax

			} else if (data.type_couche == 'api') {
				this.zIndexMax++
				$('#spinner_loading').show()
				this.thematiqueService.GetDataQuery(data.url).then((donne: Object[]) => {

					this.gestionCarto(data, donne, this.zIndexMax, data.type_couche)
					$('#spinner_loading').hide()
				})

				data.type_couche_inf = 'thematiques'
				data.zIndex_inf = this.zIndexMax
			} else if (data.type == 'mappilary') {

				var strokestyle = new style.Style({
					stroke: new style.Stroke({
						color: 'rgba(53, 175, 109,0.7)',
						width: 4
					})
				});
				//console.log(new source.VectorTile({}))

				var LayTheCopy_vector = new layer.VectorTile()

				var source_vector = new source.VectorTile({
					format: new Format.MVT(),
					tileGrid: tilegrid.createXYZ({ maxZoom: 22 }),
					// tilePixelRatio: 16,
					// opacity: 0.7,
					projection: 'EPSG:3857',
					url: 'https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'
				})

				LayTheCopy_vector.setSource(source_vector)

				LayTheCopy_vector.setStyle(strokestyle)

				LayTheCopy_vector.set('name', this.space2underscore(data.nom))
				LayTheCopy_vector.set('type', data.type)
				LayTheCopy_vector.setZIndex(this.zIndexMax++)
				map.addLayer(LayTheCopy_vector);

				data.type_couche_inf = 'mappilary'
				data.zIndex_inf = this.zIndexMax

			} else {
				couche_valid = false
				this.notif.open("Cette couche est en cours de définition", 'Fermer', {
					duration: 5000
				});
			}

			if (couche_valid) {
					if (this.layerInMap.length < 3 && this.layerInMap.length != 0 && document.documentElement.clientWidth >= 767 && !this.opened_right) {
						
						this.toggle_right(0, '')
					}

				data.index_inf = this.layerInMap.length
				this.layerInMap.push(data)

			} else {
				data.checked = false
			}


		} else {

			if (this.layerInCompare.length != 0) {

				for (var i = 0; i < this.layerInCompare.length; i++) {
					if (this.space2underscore(this.layerInCompare[i].nom) == this.space2underscore(data.nom)) {
						this.closeModeCompare()
					}
				}
			}

			if (this.modeMappilary && this.space2underscore(data.nom) == 'mappilary') {
				this.modeMappilary = false
			}



			for (var i = 0; i < this.layerInMap.length; i++) {
				if (this.space2underscore(this.layerInMap[i].nom) == this.space2underscore(data.nom)) {
					//this.layerInMap[i].checked = false
					var zindex = this.layerInMap[i].zIndex_inf
					this.layerInMap.splice(i, 1)

				}
			}

			data.visible = false


			var lay = []
			map.getLayers().forEach((layer) => {
				if (layer.get('name') == this.space2underscore(data.nom)) {
					lay.push(layer)
					//layer.setVisible(false)          
				}

				if (layer.get('type') == 'mappilaryPoint' && this.space2underscore(data.nom) == 'mappilary') {
					lay.push(layer)
				}

				if (data.name_analyse && this.space2underscore(data.name_analyse) == layer.get('name') && layer.get('type') == 'analyse_spatiale') {
					lay.push(layer)
					document.getElementById(data.name_analyse).parentElement['style']['display'] = 'none'
					console.log(lay)
				}

			})

			for (var i = 0; i < lay.length; i++) {
				map.removeLayer(lay[i])
			}

			map.getLayers().forEach((layer) => {
				layer.setZIndex(layer.getZIndex() - 1)
			})

			var z = []
			for (var i = 0; i < this.layerInMap.length; i++) {
				if (this.layerInMap[i].zIndex_inf > zindex) {

					this.layerInMap[i].zIndex_inf = this.layerInMap[i].zIndex_inf - 1
				}

				z.push(this.layerInMap[i].zIndex_inf)
			}

			var max = z.reduce(function (a, b) {
				return Math.max(a, b);
			});

			this.zIndexMax = max
		}


	}

	displayDataOfBindOnMap(data, target1) {

		setTimeout(() => {
			console.log(data, target1, 1)
			if (data.type == 'xyz') {

				var mapGhost = new Map({
					target: target1,
					controls: [],
					view: view
				});

				console.log($('#' + target1), 2)
				var tiles = new layer.Tile({
					source: new source.XYZ({
						url: data.url,
						// tileLoadFunction: function (imageTile, src) {
						//      imageTile.getImage().src = src;
						//  },
						crossOrigin: "anonymous"
					})
				})
				tiles.set('name', this.space2underscore(data.nom))
				mapGhost.addLayer(tiles);

			} else if (data.type_couche == 'wms' || data.type == 'wms') {

				var mapGhost = new Map({
					target: target1,
					controls: [],
					view: view
				});

				var wms = new source.TileWMS({
					url: data.url,
					params: { 'LAYERS': data.identifiant, 'TILED': true },
					serverType: 'mapserver',
					crossOrigin: 'anonymous'
				});
				var tiles = new layer.Tile({
					source: wms,
					visible: true
				})

				tiles.set('name', this.space2underscore(data.nom))
				mapGhost.addLayer(tiles);

			}
		}, 3000)
	}

	toogleVisibilityLayer(data) {
		console.log(data)

		if (data.visible) {
			map.getLayers().forEach((layer) => {
				if (layer.get('name') == this.space2underscore(data.nom)) {
					//map.removeLayer(layer)   
					layer.setVisible(false)
				}

				if (layer.get('type') == 'mappilaryPoint' && this.space2underscore(data.nom) == 'mappilary') {
					layer.setVisible(false)
				}

				if (data.name_analyse && this.space2underscore(data.name_analyse) == layer.get('name') && layer.get('type') == 'analyse_spatiale') {
					layer.setVisible(false)
					document.getElementById(data.name_analyse).parentElement['style']['display'] = 'none'
				}



			})
		} else {
			map.getLayers().forEach((layer) => {
				if (layer.get('name') == this.space2underscore(data.nom)) {
					//map.removeLayer(layer)   
					layer.setVisible(true)
				}

				if (layer.get('type') == 'mappilaryPoint' && this.space2underscore(data.nom) == 'mappilary') {
					layer.setVisible(true)
				}

				if (data.name_analyse && this.space2underscore(data.name_analyse) == layer.get('name') && layer.get('type') == 'analyse_spatiale') {
					layer.setVisible(true)

					document.getElementById(data.name_analyse).parentElement['style']['display'] = 'block'
				}

			})
		}




		if (data.isInMapVieuw == false && data.bbox && data.visible == false && data.type == 'wms') {
			map.getView().setZoom(data.zmin)

			if (data.inLayerTree == false) {
				var bbox = data.bbox.split(',')

				var Amin = proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
				var Amax = proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

				var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]]
				var a = Extent.boundingExtent([Amin, Amax])

				map.getView().fit(a, { 'size': map.getSize() });
			}
		}

		if (data.isInMapVieuw == false && data.bbox == null && data.url == 'http://wms.geocameroun.xyz/wms' && data.visible == false && data.type == 'wms') {
			map.getView().setZoom(data.zmin)
			data.isInMapVieuw = true
		}

		if (data.isInMapVieuw == false && data.bbox == null && data.visible == false && data.type == 'pdf') {

			var coord = data.geom.split(',')
			var pt = [parseFloat(coord[0]), parseFloat(coord[1])]
			var point = proj.transform([parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857')

			map.getView().setCenter(point)
			data.isInMapVieuw = true
		}

	}

	displayInlayerTree(): any {

		for (var i = 0; i < this.cartes.length; i++) {
			if (this.cartes[i].sous_cartes) {
				for (var j = 0; j < this.cartes[i].sous_cartes.length; j++) {
					for (var k = 0; k < this.cartes[i].sous_cartes[j].couches.length; k++) {

						if (this.cartes[i].sous_cartes[j].couches[k].bbox) {
							var bbox = this.cartes[i].sous_cartes[j].couches[k].bbox.split(',')

							var Amin = proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
							var Amax = proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

							var extentData = Extent.boundingExtent([Amin, Amax])

							var bool = Extent.containsExtent(map.getView().calculateExtent(map.getSize()), extentData)

							if (bool == false) {
								var bool = Extent.intersects(map.getView().calculateExtent(map.getSize()), extentData)
							}



							if (this.cartes[i].sous_cartes[j].couches[k].zmin) {

								if (this.cartes[i].sous_cartes[j].couches[k].zmin <= map.getView().getZoom() && map.getView().getZoom() < this.cartes[i].sous_cartes[j].couches[k].zmax) {
									var boolZoom = true
								} else {
									var boolZoom = false
								}

							}

							this.zone.run(() => {

								this.cartes[i].sous_cartes[j].couches[k].inLayerTree = bool

								if (this.cartes[i].sous_cartes[j].couches[k].checked && bool == false) {

									this.displayDataOnMap(this.cartes[i].sous_cartes[j].couches[k], '')

									this.cartes[i].sous_cartes[j].couches[k].checked = false
									this.cartes[i].sous_cartes[j].couches[k].visible = false
								}

								if (this.cartes[i].sous_cartes[j].couches[k].checked) {


									if (this.cartes[i].sous_cartes[j].couches[k].visible) {

										if (boolZoom == false || bool == false) {

											this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
										}

										this.cartes[i].sous_cartes[j].couches[k].visible = boolZoom
										this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = boolZoom

									} else if (!this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw && boolZoom && bool) {

										this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
										//this.cartes[i].sous_cartes[j].couches[k].inLayerTreeZoomActive = true
										this.cartes[i].sous_cartes[j].couches[k].visible = true

									}

								}

							})

						}

						if (this.cartes[i].sous_cartes[j].couches[k].url == 'http://wms.geocameroun.xyz/wms' && this.cartes[i].sous_cartes[j].couches[k].type == 'wms') {

							var identifiant = this.cartes[i].sous_cartes[j].couches[k].identifiant

							if (identifiant == 'SCAN_500k' || identifiant == 'SCAN_200k' || identifiant == 'SCAN_1500k' || identifiant == 'SCAN_50k') {

								if (this.cartes[i].sous_cartes[j].couches[k].zmin <= map.getView().getZoom() && map.getView().getZoom() <= this.cartes[i].sous_cartes[j].couches[k].zmax) {
									var boolZoom = true
								} else {
									var boolZoom = false
								}

								/*this.cartes[i].sous_cartes[j].couches[k].inLayerTree = boolZoom 
									// pour faire disparaitre en fonction du zoom dans le layertree
								*/

								if (this.cartes[i].sous_cartes[j].couches[k].checked == true) {

									if (boolZoom == false && this.cartes[i].sous_cartes[j].couches[k].visible == true) {

										this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = false
										this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
										this.cartes[i].sous_cartes[j].couches[k].visible = false


									} else if (boolZoom == true && this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw == false) {
										this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = true

										this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
										this.cartes[i].sous_cartes[j].couches[k].visible = true

									}

								}

							}

						}

						if (this.cartes[i].sous_cartes[j].couches[k].type == 'pdf') {

							var coord = this.cartes[i].sous_cartes[j].couches[k].geom.split(',')
							var pt = [parseFloat(coord[0]), parseFloat(coord[1])]
							var point = proj.transform([parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857')


							var bool = Extent.containsCoordinate(map.getView().calculateExtent(map.getSize()), point)

							this.cartes[i].sous_cartes[j].couches[k].inLayerTree = bool

							if (this.cartes[i].sous_cartes[j].couches[k].checked == true) {

								if (bool == false && this.cartes[i].sous_cartes[j].couches[k].visible == true) {
									this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = false
									this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
									this.cartes[i].sous_cartes[j].couches[k].visible = false

								} else if (bool == true && this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw == false) {
									this.cartes[i].sous_cartes[j].couches[k].isInMapVieuw = true

									this.toogleVisibilityLayer(this.cartes[i].sous_cartes[j].couches[k])
									this.cartes[i].sous_cartes[j].couches[k].visible = true
								}
							}

						}
					}
				}
			} else {
				for (var j = 0; j < this.cartes[i].couches.length; j++) {

					if (this.cartes[i].couches[j].bbox) {
						var bbox = this.cartes[i].couches[j].bbox.split(',')

						var Amin = proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
						var Amax = proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

						var extentData = Extent.boundingExtent([Amin, Amax])

						var bool = Extent.containsExtent(map.getView().calculateExtent(map.getSize()), extentData)

						if (bool == false) {
							var bool = Extent.intersects(map.getView().calculateExtent(map.getSize()), extentData)
						}



						if (this.cartes[i].couches[j].zmin) {

							if (this.cartes[i].couches[j].zmin <= map.getView().getZoom() && map.getView().getZoom() < this.cartes[i].couches[j].zmax) {
								var boolZoom = true
							} else {
								var boolZoom = false
							}

						}

						this.zone.run(() => {

							this.cartes[i].couches[j].inLayerTree = bool

							if (this.cartes[i].couches[j].checked && bool == false) {

								this.displayDataOnMap(this.cartes[i].couches[j], '')

								this.cartes[i].couches[j].checked = false
								this.cartes[i].couches[j].visible = false
							}

							if (this.cartes[i].couches[j].checked) {

								this.cartes[i].couches[j].isInMapVieuw = boolZoom

								if (this.cartes[i].couches[j].visible) {

									if (boolZoom == false || bool == false) {

										this.toogleVisibilityLayer(this.cartes[i].couches[j])
									}

									this.cartes[i].couches[j].visible = boolZoom

								} else if (!this.cartes[i].couches[j].visible && boolZoom && bool) {

									this.toogleVisibilityLayer(this.cartes[i].couches[j])
									//this.cartes[i].couches[j].inLayerTreeZoomActive = true
									this.cartes[i].couches[j].visible = true

								}

							}

						})

					}

					if (this.cartes[i].couches[j].url == 'http://wms.geocameroun.xyz/wms' && this.cartes[i].couches[j].type == 'wms') {

						var identifiant = this.cartes[i].couches[j].identifiant

						if (identifiant == 'SCAN_500k' || identifiant == 'SCAN_200k' || identifiant == 'SCAN_1500k' || identifiant == 'SCAN_50k') {

							if (this.cartes[i].couches[j].zmin <= map.getView().getZoom() && map.getView().getZoom() <= this.cartes[i].couches[j].zmax) {
								var boolZoom = true
							} else {
								var boolZoom = false
							}

							/*this.cartes[i].couches[j].inLayerTree = boolZoom*/

							if (this.cartes[i].couches[j].checked == true) {

								if (boolZoom == false && this.cartes[i].couches[j].visible == true) {

									this.cartes[i].couches[j].isInMapVieuw = false
									this.toogleVisibilityLayer(this.cartes[i].couches[j])
									this.cartes[i].couches[j].visible = false


								} else if (boolZoom == true && this.cartes[i].couches[j].isInMapVieuw == false) {
									this.cartes[i].couches[j].isInMapVieuw = true

									this.toogleVisibilityLayer(this.cartes[i].couches[j])
									this.cartes[i].couches[j].visible = true

								}

							}

						}

					}

					if (this.cartes[i].couches[j].type == 'pdf') {

						var coord = this.cartes[i].couches[j].geom.split(',')
						var pt = [parseFloat(coord[0]), parseFloat(coord[1])]
						var point = proj.transform([parseFloat(coord[0]), parseFloat(coord[1])], 'EPSG:4326', 'EPSG:3857')


						var bool = Extent.containsCoordinate(map.getView().calculateExtent(map.getSize()), point)

						this.cartes[i].couches[j].inLayerTree = bool

						if (this.cartes[i].couches[j].checked == true) {

							if (bool == false && this.cartes[i].couches[j].visible == true) {
								this.cartes[i].couches[j].isInMapVieuw = false
								this.toogleVisibilityLayer(this.cartes[i].couches[j])
								this.cartes[i].couches[j].visible = false

							} else if (bool == true && this.cartes[i].couches[j].isInMapVieuw == false) {
								this.cartes[i].couches[j].isInMapVieuw = true

								this.toogleVisibilityLayer(this.cartes[i].couches[j])
								this.cartes[i].couches[j].visible = true
							}
						}

					}
				}
			}
		}

		for (var i = 0; i < this.layerInMap.length; i++) {
			if (this.layerInMap[i].typeInf == 'sous_cartes_pdf' && this.layerInMap[i].zmin && this.layerInMap[i].zmax && this.layerInMap[i].bbox) {
				console.log(78778)

				var bbox = this.layerInMap[i].bbox.split(',')

				var Amin = proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
				var Amax = proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

				var extentData = Extent.boundingExtent([Amin, Amax])

				var bool = Extent.containsExtent(map.getView().calculateExtent(map.getSize()), extentData)

				if (bool == false) {
					var bool = Extent.intersects(map.getView().calculateExtent(map.getSize()), extentData)
				}

				if (this.layerInMap[i].zmin <= map.getView().getZoom() && map.getView().getZoom() < this.layerInMap[i].zmax) {
					var boolZoom = true
				} else {
					var boolZoom = false
				}

				this.zone.run(() => {


					if (this.layerInMap[i].checked && bool == false) {

						this.displayDataOnMap(this.layerInMap[i], '')
					    /*this.layerInMap[i].checked =  false
					    this.layerInMap[i].visible =  false
					    this.layerInMap[i].isInMapVieuw =  false*/
					}

					if (this.layerInMap[i].checked) {


						if (this.layerInMap[i].visible) {

							if (boolZoom == false || bool == false) {

								this.toogleVisibilityLayer(this.layerInMap[i])
							}

							this.layerInMap[i].visible = boolZoom

							this.layerInMap[i].isInMapVieuw = boolZoom

						} else if (!this.layerInMap[i].isInMapVieuw && boolZoom && bool) {

							this.toogleVisibilityLayer(this.layerInMap[i])

							this.layerInMap[i].visible = true

						}

					}


				})

			}
		}

	}

	changeOpacity(couche, e) {

		couche.opacity = e.value

		map.getLayers().forEach((layer) => {
			if (layer.get('name') == this.space2underscore(couche.nom)) {

				layer.setOpacity(couche.opacity / 100)
			}

		})
	}

	gestionCarto(couche, data, z, typeGestion): any {

		var type_geometry = couche.geom
		console.log(couche)
		if (type_geometry == "point") {


			var k = 0
			var features = []

			for (var index = 0; index < data.length; index++) {

				if (typeGestion == 'api' || typeGestion == 'couche') {

					for (var i = 0; i < data[index].length; i++) {
						if (data[index][i]['index'] == 'geometry') {
							var geometry = JSON.parse(data[index][i]['val']);
						}
					}

				} else if (typeGestion == 'requete') {
					var geometry = JSON.parse(data[index].geometry);
				}



				
				if (geometry.coordinates.length == 1) {
					var coord = proj.transform(geometry.coordinates[0], 'EPSG:4326', 'EPSG:3857')
				} else {
					var coord = proj.transform(geometry.coordinates, 'EPSG:4326', 'EPSG:3857')
				}

				//console.log(coord,new geom.Point(coord))

				var newMarker = new Feature({
					geometry: new geom.Point(coord),
					data: data[index],
				});


				features[k] = newMarker;
				k++


			};



			var markerSource = new source.Vector({
				features: features
			});

			var clusterSource = new source.Cluster({
				distance: 80,
				source: markerSource
			});



			var styleCache = {};
			var url_prefix = this.url_prefix
			var LayThe = new layer.Vector({
				source: clusterSource,
				style: function (feature) {
					var size = feature.get('features').length;
					if (size != 1) {
						var styleDefault = styleCache[size];
						if (!styleDefault) {
							styleDefault = new style.Style({

								image: new style.Circle({
									radius: 10,
									stroke: new style.Stroke({
										color: '#fff',
										width: 2
									}),
									fill: new style.Fill({
										color: '#1CAC77'
									})
								}),
								text: new style.Text({
									text: size.toString(),
									fill: new style.Fill({
										color: '#fff'

									}),
									font: '10px sans-serif'
								})
							});
							styleCache[size] = styleDefault;
						}

					} else {
						var styleDefaultII = new style.Style({
							image: new style.Icon({
								scale: 0.2,
								src: url_prefix + couche.img
							})
						});

						return styleDefaultII;
					}

					return styleDefault;
				},
				visible: true
			});



			var styleCacheCopy = {};
			var LayTheCopy = new layer.Vector({
				source: clusterSource,
				style: function (feature) {
					var size = feature.get('features').length;
					var styleDefault = styleCacheCopy[size];
					if (!styleDefault) {
						styleDefault = new style.Style({

							image: new style.Icon({
								scale: 0.2,
								src: url_prefix + couche.img
							})
						});
						styleCacheCopy[size] = styleDefault;
					}

					return styleDefault;
				},
				visible: true
			});

			LayTheCopy.setZIndex(z)
			LayThe.setZIndex(z)

			LayTheCopy.set('type', couche.type_couche);
			LayThe.set('type', couche.type_couche);
			LayTheCopy.set('name', this.space2underscore(couche.nom));
			LayThe.set('name', this.space2underscore(couche.nom));

			LayTheCopy.set('id_cat', couche.id_cat);
			LayThe.set('key_couche', couche.key_couche);
			LayTheCopy.set('key_couche', couche.key_couche);
			LayThe.set('id_cat', couche.id_cat);


			map.addLayer(LayTheCopy);
			map.addLayer(LayThe);
			map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 17, 'duration': 1000 });

		} else if (type_geometry == "Polygon") {

			if (couche.img !== null && couche.img !== undefined) {
				var cnv = document.createElement('canvas');
				var ctx = cnv.getContext('2d');
				var img = new Image();
				img.src = this.url_prefix + couche.img;

				img.onload = () => {

					var markerSource = new source.Vector();

					$.each(data, (index, val) => {


						if (typeGestion == 'api' || typeGestion == 'couche') {

							for (var i = 0; i < data[index].length; i++) {
								if (data[index][i]['index'] == 'geometry') {
									var geometry = JSON.parse(data[index][i]['val']);
								}
							}

						} else if (typeGestion == 'requete') {
							var geometry = JSON.parse(data[index].geometry);
						}

						if (geometry.coordinates.length == 1) {
							if (geometry.coordinates[0].length == 1) {
								var coord = geometry.coordinates[0][0]
							} else {
								var coord = geometry.coordinates[0]
							}

						} else {
							var coord = geometry.coordinates[0][0]
						}

						var a = this.convertepolygon(coord)
						var newMarker = new Feature({
							geometry: new geom.Polygon([a]),
							data: data[index],
							ptestyle: { 'img': ctx.createPattern(img, 'repeat') }
						});

						markerSource.addFeature(newMarker);

					});

					var LayThe = new layer.Vector({
						source: markerSource,
						visible: true,
						style: stylePolygon
					});

					if (couche.opacity) {
						LayThe.setOpacity(couche.opacity)
					}

					LayThe.setZIndex(z)
					map.addLayer(LayThe);

					var b = this.space2underscore(couche.nom)
					LayThe.set('name', b);
					LayThe.set('type', couche.type_couche);
					LayThe.set('key_couche', couche.key_couche);
					LayThe.set('id_cat', couche.id_cat);
					map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 17, 'duration': 1000 });

				}
			} else {

				var markerSource = new source.Vector();

				$.each(data, (index, val) => {

					if (typeGestion == 'api' || typeGestion == 'couche') {

						for (var i = 0; i < data[index].length; i++) {
							if (data[index][i]['index'] == 'geometry') {
								var geometry = JSON.parse(data[index][i]['val']);
							}
						}

					} else if (typeGestion == 'requete') {
						var geometry = JSON.parse(data[index].geometry);
					}


					if (geometry.coordinates.length == 1) {
						if (geometry.coordinates[0].length == 1) {
							var coord = geometry.coordinates[0][0]
						} else {
							var coord = geometry.coordinates[0]
						}
					} else {
						var coord = geometry.coordinates[0][0]
					}

					var a = this.convertepolygon(coord)
					var newMarker = new Feature({
						geometry: new geom.Polygon([a]),
						data: data[index],
						ptestyle: { 'remplir_couleur': couche.remplir_couleur }
					});


					markerSource.addFeature(newMarker);


				});

				var LayThe = new layer.Vector({
					source: markerSource,
					visible: true,
					style: stylePolygon

				});

				if (couche.opacity) {
					LayThe.setOpacity(couche.opacity)
				}

				LayThe.setZIndex(z)
				map.addLayer(LayThe);
				LayThe.set('name', this.space2underscore(couche.nom));
				LayThe.set('type', couche.type_couche);
				LayThe.set('key_couche', couche.key_couche);
				LayThe.set('id_cat', couche.id_cat);
				map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 17, 'duration': 1000 });


			}

		} else if (type_geometry == "LineString") {

			var markerSource = new source.Vector();

			$.each(data, (index, val) => {

				if (typeGestion == 'api' || typeGestion == 'couche') {

					for (var i = 0; i < data[index].length; i++) {
						if (data[index][i]['index'] == 'geometry') {
							var geometry = JSON.parse(data[index][i]['val']);
						}
					}

				} else if (typeGestion == 'requete') {
					var geometry = JSON.parse(data[index].geometry);
				}
				
				if (geometry.coordinates.length == 1) {
					var coord = geometry.coordinates[0]
				} else {
					var coord = geometry.coordinates
				}

				//data[index].contour_couleur = couche.contour_couleur

				var newMarker = new Feature({
					geometry: new geom.LineString(this.converteline(coord)),
					data: data[index],
					ptestyle: { 'contour_couleur': couche.contour_couleur }
				});


				markerSource.addFeature(newMarker);


			});

			var LayThe = new layer.Vector({
				source: markerSource,
				style: styleLigne,
				visible: true
			});

			LayThe.setZIndex(z)

			map.addLayer(LayThe);
			LayThe.set('name', this.space2underscore(couche.nom));
			LayThe.set('type', couche.type_couche);
			LayThe.set('key_couche', couche.key_couche);
			LayThe.set('id_cat', couche.id_cat);
			map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 17, 'duration': 1000 });

		}


	}

	convertepolygon(features) {

		var data = [];

		for (var i = 0; i < features.length; i++) {

			data.push(proj.transform([parseFloat(features[i][0]), parseFloat(features[i][1])], 'EPSG:4326', 'EPSG:3857'))
		}

		return data;

	}

	converteline(features) {

		var data = [];

		for (var i = 0; i < features.length; i++) {

			data.push(proj.transform(features[i], 'EPSG:4326', 'EPSG:3857'))
		}

		return data;

	}

	openProperties(height) {
		$('#displayProperties').css('top', '0px')
		$('.displayPropertiesBody').css('max-height', height)

		$('#displayProperties').css('-webkit-transform', 'translate(0px)')
		$('#displayProperties').css('transform', 'translate(0px)')

		this.positionProperties = { x: 0, y: 0 }

		$('#displayProperties').css('transition', '0s')
		$('#displayProperties').css('-webkit-transition', '0s')


	}

	closeProperties() {
		var h = $('#displayProperties').height() + 10

		$('#displayProperties').css('transition', '0.5s')

		this.positionProperties = { x: 0, y: 0 }

		$('#displayProperties').css('-webkit-transform', 'translate(0px)')
		$('#displayProperties').css('transform', 'translate(0px)')

		$('#displayProperties').css('top', -h + 'px')
		this.desactivate_an_icon()
		this.masque_source.clear()
	}

	onStop(event, classe, rang) {

		if (this.yTree) {
			$('.' + classe).css('-webkit-transform', 'translate(0px)')
			$('.' + classe).css('transform', 'translate(0px)')

			var factorS = this.yTree / 155

			var factor = parseInt(factorS.toString())

			for (var i = 0; i < this.layerInMap.length; i++) {

				if (this.layerInMap[i].index_inf == rang && factor != 0) {



					if (this.yTree > 0) {

						/// tous ceux dont il a depasse
						for (var k = i + 1; k <= i + factor; k++) {

							if (this.layerInMap[k]) {
								this.layerInMap[k].zIndex_inf = this.layerInMap[k].zIndex_inf + 1
							}

						}

						this.layerInMap[i].zIndex_inf = this.layerInMap[i].zIndex_inf - factor


					} else if (this.yTree < 0) {

						/// tous ceux dont il a depasse
						for (var k = i - 1; k >= i + factor; k--) {
							if (this.layerInMap[k]) {
								this.layerInMap[k].zIndex_inf = this.layerInMap[k].zIndex_inf - 1
							}
						}


						this.layerInMap[i].zIndex_inf = this.layerInMap[i].zIndex_inf - factor
					}

					this.resetZindex()

				}

			}
			this.yTree = undefined
		}

	}

	onMoving(event, i) {

		this.yTree = event.y

	}

	onMovingProperties(event, bool) {

		if (bool) {
			this.positionProperties = { x: event.x, y: event.y }
		}

	}

	onMovingProperties_pdf(event, i, bool) {
		if (bool) {
			this.displayPropertiesDivs[i]['position'] = { x: event.x, y: event.y }
		}
	}
	minimisePropertiesPdf(i) {
		this.displayPropertiesDivs[i]['position'] = { x: 0, y: 0 }
		this.displayPropertiesDivs[i]['maximise'] = false

		var a = i * 155 + 300

		console.log(".displayProperties" + i, a + 'px !important', $(".displayProperties" + i))
		//document.querySelector(".displayProperties"+i).style.left = a+'px !important'


		$(".displayProperties" + i).css('left', a + 'px')
	}

	maximisePropertiesPdf(i) {
		this.displayPropertiesDivs[i]['maximise'] = true
		$(".displayProperties" + i).css('left', '0px !important')
	}

	resetZindex() {

		var z;

		for (var i = 0; i < this.layerInMap.length; i++) {

			map.getLayers().forEach((layer) => {
				if (layer.get('name') == this.space2underscore(this.layerInMap[i]['nom'])) {

					layer.setZIndex(this.layerInMap[i]['zIndex_inf'])

				}

				if (layer.get('name') == 'mappilary') {
					z = layer.getZIndex()
				}

			})
		}

		map.getLayers().forEach((layer) => {

			if (layer.get('type') == 'mappilaryPoint') {
				layer.setZIndex(z)
			}

		})
	}

	toogleCompare() {
		var swipe = document.getElementById('swipe')
		if (!this.modeCompare) {

			const buttonheet_compare = this.bottomSheet.open(buttonsheetComponent, {
				data: { type: 'compare', data: this.layerInMap }
			});

			this.modeCompare = true

			buttonheet_compare.afterDismissed().subscribe((result) => {


				if (!result) {
					this.modeCompare = false
					$('#swipe').hide()
				} else {

					$('#swipe').show()

					var index1 = parseFloat(result['layer1'])
					var index2 = parseFloat(result['layer2'])

					var layer1;
					var layer2;

					map.getLayers().forEach((layer) => {
						if (layer.get('name') == this.space2underscore(this.layerInMap[index1]['nom'])) {
							layer1 = layer
							layer.setVisible(true)
						} else if (layer.get('name') == this.space2underscore(this.layerInMap[index2]['nom'])) {
							layer2 = layer
							layer.setVisible(true)
						} else if (layer.get('type') == 'xyz' || layer.get('type') == 'wms') {
							layer.setVisible(false)

						}

					})

					for (var i = 0; i < this.layerInMap.length; i++) {
						if (this.layerInMap[i]['type'] == 'xyz' || this.layerInMap[i]['type'] == 'wms') {
							this.layerInMap[i]['visible'] = false
						}

					}

					this.toogleVisibilityLayer(this.layerInMap[index1])
					this.toogleVisibilityLayer(this.layerInMap[index2])

					this.layerInMap[index1]['visible'] = true
					this.layerInMap[index2]['visible'] = true

					this.layerInCompare[0] = this.layerInMap[index1]
					this.layerInCompare[1] = this.layerInMap[index2]

					if (layer1.getZIndex() > layer2.getZIndex()) {
						var lay1 = layer1
					} else {
						var lay1 = layer2

					}


					this.precompose = lay1.on('precompose', function (event) {
						var ctx = event.context;
						var width = ctx.canvas.width * (swipe['value'] / 100);

						ctx.save();
						ctx.beginPath();
						ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
						ctx.clip();
					});

					this.postcompose = lay1.on('postcompose', function (event) {
						var ctx = event.context;
						ctx.restore();
					});

					this.swipeEvent = swipe.addEventListener('input', function () {
						console.log(1)
						map.render();
					}, false);


				}

			});

		} else {

			this.closeModeCompare()

		}

	}

	closeModeCompare() {

		this.layerInCompare = []

		OBservable.unByKey(this.precompose);
		OBservable.unByKey(this.postcompose);
		OBservable.unByKey(this.swipeEvent);

		this.modeCompare = false

		$('#swipe').hide()

	}

	openDescription(couche, index) {

		if (couche.statusDescription_inf) {

			var elm = document.getElementById(' descriptionLayerBox' + index)
			elm.style.right = '0px'
			elm.style.left = '100%'
			$('#descriptionLayerBoxClose' + index).hide();

		} else {

			var elm = document.getElementById(' descriptionLayerBox' + index)
			elm.style.right = '-5px'
			elm.style.left = '-5px'


			$('#descriptionLayerBoxClose' + index).show()

		}

		couche.statusDescription_inf = !couche.statusDescription_inf

	}

	toogleMappilary() {

		if (!this.modeMappilary) { //Zmax = 15

			var data = {
				'type': 'mappilary',
				'nom': 'mappilary',
				'type_couche_inf': 'mappilary',
				'checked': true,
				'img': 'assets/images/icones/mapillary-couche.png'
			}

			this.displayDataOnMap(data, '')

			this.modeMappilary = !this.modeMappilary

			if (map.getView().getZoom() > 14) {
				this.displayMappilaryPoint()
			}

			map.on('moveend', () => {

				this.displayMappilaryPoint()
			})

		} else {

			var data = {
				'type': 'mappilary',
				'nom': 'mappilary',
				'type_couche_inf': 'mappilary',
				'checked': true,
				'img': 'assets/images/icones/mapillary-couche.png'
			}

			this.displayDataOnMap(data, '')

		}


	}

	displayMappilaryPoint() {

		if (this.modeMappilary && map.getView().getZoom() > 14) {

			var bboxMap = map.getView().calculateExtent(map.getSize()).toString().split(',')

			var Amin = proj.transform([parseFloat(bboxMap[0]), parseFloat(bboxMap[1])], 'EPSG:3857', 'EPSG:4326')
			var Amax = proj.transform([parseFloat(bboxMap[2]), parseFloat(bboxMap[3])], 'EPSG:3857', 'EPSG:4326')


			var bboxUrl = Amin[0] + ',' + Amin[1] + ',' + Amax[0] + ',' + Amax[1]

			var url = "https://a.mapillary.com/v3/images/?&bbox=" + bboxUrl + "&client_id=TG1sUUxGQlBiYWx2V05NM0pQNUVMQTo2NTU3NTBiNTk1NzM1Y2U2"
			var url_sequence = "https://a.mapillary.com/v3/sequences?bbox=" + bboxUrl + "&client_id=TG1sUUxGQlBiYWx2V05NM0pQNUVMQTo2NTU3NTBiNTk1NzM1Y2U2"
			var pointMappilary;
			$.get(url_sequence, (data) => {

				var layer_mappilary;
				var layer_mappilaryPoint;

				map.getLayers().forEach((layer) => {

					if (layer.get('name') == 'mappilary') {
						layer_mappilary = layer
					}

					if (layer.get('name') == 'mappilaryPoint') {
						//layer.getSource().clear() 
						layer_mappilaryPoint = layer
					}

				})



				var point = []
				for (var i = 0; i < data.features.length; i++) {

					for (var j = 0; j < data.features[i].geometry.coordinates.length; j++) {

						var coord = proj.transform(data.features[i].geometry.coordinates[j], 'EPSG:4326', 'EPSG:3857')

						var newMarker = new Feature({
							geometry: new geom.Point(coord),
							data: { 'i': i, 'j': j, 'type': 'point' },
						});

						point.push(newMarker)

					}

				}

				var vectorFeature = (new Format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })


				var vectorSource = new source.Vector({
					features: point
				});

				vectorSource.addFeatures(vectorFeature)

				var vectorLayer = new layer.Vector({
					source: vectorSource,
					style: new style.Style({
						image: new style.Circle({
							radius: 4,
							fill: new style.Fill({
								color: '#fff'
							}),
							stroke: new style.Stroke({
								color: 'rgba(53, 175, 109,0.7)',
								width: 3
							})
						}),
						stroke: new style.Stroke({
							color: 'rgba(53, 175, 109,0.7)',
							width: 4
						})

					})

				})

				if (layer_mappilaryPoint) {
					//map.removeLayer(layer_mappilaryPoint)
					layer_mappilaryPoint.getSource().clear()
					layer_mappilaryPoint.setSource(vectorSource)
				}

				vectorLayer.set('name', 'mappilaryPoint')
				vectorLayer.set('type', 'mappilaryPoint')
				vectorLayer.setZIndex(layer_mappilary.getZIndex())

				map.addLayer(vectorLayer)

				this.zone.run(() => {
					this.responseMappilary = data
				})

			});

		}

	}

	toogleProfilAlti() {

		map.removeInteraction(this.draw);

		if (this.altimetrie.active == false) {
			this.altimetrie.active = true
			this.draw = new interaction.Draw({
				source: this.source_draw,
				type: 'LineString',
				style: new style.Style({
					stroke: new style.Stroke({
						color: this.primaryColor,
						width: 4
					}),
					image: new style.Circle({
						radius: 5,
						stroke: new style.Stroke({
							color: 'black'
						}),
						fill: new style.Fill({
							color: [0, 0, 0, 0.1]
						})
					})
				})
			});

			map.addInteraction(this.draw);

			this.draw.on("drawend", (e) => {


				var coord = e.feature.getGeometry().getCoordinates();



				//this.profil_alti_overlay.setPosition(coord);
				$("#profil_alti").show();
				///$("#text-comment").val(null);*/

				var feature = e.feature;

				feature.set('type', 'srtm');

				feature.setStyle(new style.Style({

					stroke: new style.Stroke({
						color: this.primaryColor,
						width: 6
					})

				}))

				var geom_4326 = [];

				for (var i = 0; i < coord.length; i++) {

					geom_4326.push(proj.transform(coord[i], 'EPSG:3857', 'EPSG:4326'))
				}


				map.removeInteraction(this.draw);
				this.profil_alti_active = false

				this.geoportailService.drapeline({ 'donnes': geom_4326 }).then((data: any) => {


					this.zone.run(() => {
						this.profil_alti_active = true
					})
					var drape = JSON.parse(data)

					//var profil = [[781931.923728387,426134.63210391,727],[781913.854584949,426181.252979657,730],[781895.785441512,426227.873855404,737],[781877.716298074,426274.494731151,741],[781859.647154636,426321.115606898,744],[781841.578011198,426367.736482645,746],[781823.508867761,426414.357358392,735],[781805.439724323,426460.97823414,731],[781787.370580885,426507.599109887,723],[781769.301437447,426554.219985634,718],[781751.23229401,426600.840861381,714],[781733.163150572,426647.461737128,715],[781715.094007134,426694.082612875,721],[781697.024863696,426740.703488622,726],[781678.955720259,426787.324364369,737],[781660.886576821,426833.945240116,742],[781642.817433383,426880.566115863,750],[781624.748289945,426927.18699161,753],[781606.679146508,426973.807867358,753],[781588.61000307,427020.428743105,754],[781570.540859632,427067.049618852,757],[781552.471716194,427113.670494599,755],[781534.402572757,427160.291370346,752],[781516.333429319,427206.912246093,746],[781498.264285881,427253.53312184,745],[781480.195142443,427300.153997587,731],[781462.125999006,427346.774873334,729],[781444.056855568,427393.395749081,722],[781425.98771213,427440.016624829,715],[781407.918568692,427486.637500576,712],[781389.849425255,427533.258376323,712],[781371.780281817,427579.87925207,719],[781353.711138379,427626.500127817,724],[781335.641994941,427673.121003564,729],[781317.572851504,427719.741879311,737],[781299.503708066,427766.362755058,740],[781281.434564628,427812.983630805,742],[781263.36542119,427859.604506552,748],[781245.296277753,427906.225382299,750],[781227.227134315,427952.846258047,751],[781209.157990877,427999.467133794,754],[781191.088847439,428046.088009541,755],[781173.019704002,428092.708885288,751],[781154.950560564,428139.329761035,737],[781136.881417126,428185.950636782,736],[781118.812273688,428232.571512529,729],[781100.743130251,428279.192388276,726],[781082.673986813,428325.813264023,724],[781064.604843375,428372.43413977,719],[781046.535699937,428419.055015517,714],[781028.4665565,428465.675891265,714],[781010.397413062,428512.296767012,723],[780992.328269624,428558.917642759,729],[780974.259126186,428605.538518506,731],[780956.189982749,428652.159394253,735],[780938.120839311,428698.78027,735],[780920.051695873,428745.401145747,730],[780901.982552435,428792.022021494,729],[780883.913408998,428838.642897241,718],[780865.84426556,428885.263772988,716],[780847.775122122,428931.884648736,717],[780829.705978684,428978.505524483,716],[780811.636835247,429025.12640023,717],[780793.567691809,429071.747275977,720],[780775.498548371,429118.368151724,732],[780757.429404933,429164.989027471,735],[780739.360261496,429211.609903218,744],[780721.291118058,429258.230778965,745],[780703.22197462,429304.851654712,746],[780685.152831182,429351.472530459,747],[780667.083687745,429398.093406206,741],[780649.014544307,429444.714281954,731],[780630.945400869,429491.335157701,723],[780612.876257431,429537.956033448,729],[780594.807113994,429584.576909195,744],[780576.737970556,429631.197784942,746],[780558.668827118,429677.818660689,751],[780540.59968368,429724.439536436,750],[780522.530540243,429771.060412183,750],[780504.461396805,429817.68128793,744],[780486.392253367,429864.302163677,733],[780468.323109929,429910.923039424,726],[780450.253966492,429957.543915172,724],[780432.184823054,430004.164790919,722],[780414.115679616,430050.785666666,724],[780396.046536178,430097.406542413,726],[780377.977392741,430144.02741816,731],[780359.908249303,430190.648293907,735],[780341.839105865,430237.269169654,735],[780323.769962427,430283.890045401,738],[780305.70081899,430330.510921148,736],[780287.631675552,430377.131796895,740],[780269.562532114,430423.752672643,741],[780251.493388676,430470.37354839,740],[780233.424245239,430516.994424137,739],[780215.355101801,430563.615299884,740],[780197.285958363,430610.236175631,742],[780179.216814925,430656.857051378,741],[780161.147671488,430703.477927125,738],[780143.07852805,430750.098802872,740],[780125.009384612,430796.719678619,736],[780106.940241174,430843.340554366,734],[780088.871097737,430889.961430113,735],[780070.801954299,430936.582305861,736],[780052.732810861,430983.203181608,736],[780034.663667423,431029.824057355,734],[780016.594523986,431076.444933102,736],[779998.525380548,431123.065808849,741],[779980.45623711,431169.686684596,742],[779962.387093672,431216.307560343,746],[779944.317950235,431262.92843609,746],[779926.248806797,431309.549311837,752],[779908.179663359,431356.170187584,756],[779890.110519921,431402.791063331,761],[779872.041376484,431449.411939079,763],[779853.972233046,431496.032814826,765],[779835.903089608,431542.653690573,773],[779817.83394617,431589.27456632,770],[779799.764802733,431635.895442067,771],[779781.695659295,431682.516317814,770],[779763.626515857,431729.137193561,766],[779745.557372419,431775.758069308,764],[779727.488228982,431822.378945055,765],[779709.419085544,431868.999820802,765],[779691.349942106,431915.62069655,769],[779673.280798668,431962.241572297,770],[779655.211655231,432008.862448044,772],[779637.142511793,432055.483323791,775],[779619.073368355,432102.104199538,771],[779601.004224917,432148.725075285,773],[779582.93508148,432195.345951032,763],[779564.865938042,432241.966826779,764],[779546.796794604,432288.587702526,771],[779528.727651166,432335.208578273,774],[779510.658507729,432381.82945402,787],[779492.589364291,432428.450329768,790],[779474.520220853,432475.071205515,801],[779456.451077415,432521.692081262,802],[779438.381933978,432568.312957009,800],[779420.31279054,432614.933832756,809],[779402.243647102,432661.554708503,812],[779384.174503664,432708.17558425,811],[779366.105360227,432754.796459997,818],[779348.036216789,432801.417335744,822],[779329.967073351,432848.038211491,824],[779311.897929913,432894.659087238,823],[779293.828786476,432941.279962986,820],[779275.759643038,432987.900838733,812],[779257.6904996,433034.52171448,811],[779239.621356162,433081.142590227,803],[779221.552212725,433127.763465974,802],[779203.483069287,433174.384341721,794],[779185.413925849,433221.005217468,791],[779167.344782411,433267.626093215,782],[779149.275638974,433314.246968962,779],[779131.206495536,433360.867844709,773],[779113.137352098,433407.488720457,765],[779095.06820866,433454.109596204,766],[779076.999065223,433500.730471951,772],[779058.929921785,433547.351347698,778],[779040.860778347,433593.972223445,786],[779022.791634909,433640.593099192,790],[779004.722491472,433687.213974939,787],[778986.653348034,433733.834850686,782],[778968.584204596,433780.455726433,780],[778950.515061158,433827.07660218,779],[778932.445917721,433873.697477927,774],[778914.376774283,433920.318353675,762],[778896.307630845,433966.939229422,751],[778878.238487407,434013.560105169,737],[778860.16934397,434060.180980916,739],[778842.100200532,434106.801856663,744],[778824.031057094,434153.42273241,743],[778805.961913656,434200.043608157,742],[778787.892770219,434246.664483904,741],[778769.823626781,434293.285359651,743],[778751.754483343,434339.906235398,746],[778733.685339905,434386.527111145,752],[778715.616196468,434433.147986893,760],[778697.54705303,434479.76886264,762],[778679.477909592,434526.389738387,765],[778661.408766154,434573.010614134,763],[778643.339622717,434619.631489881,766],[778625.270479279,434666.252365628,772],[778607.201335841,434712.873241375,764],[778589.132192403,434759.494117122,766],[778571.063048966,434806.114992869,766],[778552.993905528,434852.735868616,765],[778534.92476209,434899.356744364,768],[778516.855618652,434945.977620111,774],[778498.786475215,434992.598495858,778],[778480.717331777,435039.219371605,777],[778462.648188339,435085.840247352,768],[778444.579044901,435132.461123099,771],[778426.509901464,435179.081998846,778],[778408.440758026,435225.702874593,783],[778390.371614588,435272.32375034,782],[778372.30247115,435318.944626087,786],[778354.233327713,435365.565501835,790],[778336.164184275,435412.186377582,792],[778318.095040837,435458.807253329,794],[778300.025897399,435505.428129076,796],[778281.956753962,435552.049004823,797],[778263.887610524,435598.66988057,800],[778245.818467086,435645.290756317,806],[778227.749323648,435691.911632064,817],[778209.680180211,435738.532507811,846],[778191.611036773,435785.153383558,856],[778173.541893335,435831.774259305,878],[778155.472749897,435878.395135053,880],[778137.40360646,435925.0160108,882],[778116.110184439,435902.805973202,870],[778093.761962382,435858.078386961,850],[778071.413740326,435813.35080072,823],[778049.06551827,435768.62321448,817],[778026.717296213,435723.895628239,793],[778004.369074157,435679.168041998,792],[777982.020852101,435634.440455757,792],[777959.672630044,435589.712869517,800],[777937.324407988,435544.985283276,800],[777914.976185932,435500.257697035,793],[777892.627963875,435455.530110795,792],[777870.279741819,435410.802524554,792],[777847.931519763,435366.074938313,795],[777825.583297706,435321.347352072,790],[777803.23507565,435276.619765832,787],[777780.886853594,435231.892179591,781],[777758.538631537,435187.16459335,776],[777736.190409481,435142.437007109,770],[777713.842187425,435097.709420869,772],[777691.493965368,435052.981834628,774],[777669.145743312,435008.254248387,776],[777646.797521256,434963.526662147,781],[777624.449299199,434918.799075906,790],[777602.101077143,434874.071489665,795],[777579.752855087,434829.343903424,807],[777557.40463303,434784.616317184,816],[777535.056410974,434739.888730943,831],[777512.708188918,434695.161144702,845],[777490.359966861,434650.433558462,849],[777468.011744805,434605.705972221,858],[777445.663522749,434560.97838598,859],[777423.315300692,434516.250799739,860],[777400.967078636,434471.523213499,857],[777378.61885658,434426.795627258,859],[777356.270634523,434382.068041017,862],[777333.922412467,434337.340454777,848],[777311.574190411,434292.612868536,832],[777289.225968354,434247.885282295,811],[777266.877746298,434203.157696054,805],[777244.529524242,434158.430109814,803],[777222.181302185,434113.702523573,785],[777199.833080129,434068.974937332,789],[777177.484858073,434024.247351092,799],[777155.136636016,433979.519764851,801],[777132.78841396,433934.79217861,798],[777110.440191904,433890.064592369,800],[777088.091969847,433845.337006129,791],[777065.743747791,433800.609419888,784],[777043.395525735,433755.881833647,778],[777021.047303678,433711.154247407,784],[776998.699081622,433666.426661166,781],[776976.350859566,433621.699074925,786],[776954.002637509,433576.971488684,789],[776931.654415453,433532.243902444,807],[776909.306193397,433487.516316203,821],[776886.95797134,433442.788729962,830],[776864.609749284,433398.061143722,844],[776842.261527228,433353.333557481,890],[776819.913305171,433308.60597124,907],[776797.565083115,433263.878384999,936],[776775.216861059,433219.150798759,947],[776752.868639002,433174.423212518,964],[776730.520416946,433129.695626277,987],[776708.17219489,433084.968040037,988],[776685.823972833,433040.240453796,994],[776663.475750777,432995.512867555,990],[776641.127528721,432950.785281314,979],[776618.779306664,432906.057695074,983],[776596.431084608,432861.330108833,973],[776574.082862552,432816.602522592,966],[776551.734640495,432771.874936351,961],[776529.386418439,432727.147350111,957],[776507.038196383,432682.41976387,946],[776484.689974326,432637.692177629,926],[776462.34175227,432592.964591389,914],[776439.993530214,432548.237005148,889],[776417.645308157,432503.509418907,870],[776395.297086101,432458.781832666,840],[776372.948864045,432414.054246426,834],[776350.600641988,432369.326660185,842],[776328.252419932,432324.599073944,847],[776305.904197876,432279.871487704,874],[776283.555975819,432235.143901463,896],[776261.207753763,432190.416315222,911],[776238.859531707,432145.688728981,947],[776216.51130965,432100.961142741,967],[776194.163087594,432056.2335565,1003],[776171.814865538,432011.505970259,1008],[776149.466643481,431966.778384019,1004],[776127.118421425,431922.050797778,992],[776104.770199369,431877.323211537,975],[776082.421977312,431832.595625296,967],[776060.073755256,431787.868039056,955],[776037.7255332,431743.140452815,952],[776015.377311143,431698.412866574,951],[775993.029089087,431653.685280334,928],[775970.680867031,431608.957694093,913],[775948.332644974,431564.230107852,895],[775925.984422918,431519.502521611,890],[775903.636200862,431474.774935371,877],[775881.287978805,431430.04734913,863],[775858.939756749,431385.319762889,843],[775836.591534693,431340.592176649,838],[775814.243312636,431295.864590408,825],[775791.89509058,431251.137004167,807],[775769.546868524,431206.409417926,802],[775747.198646467,431161.681831686,792],[775724.850424411,431116.954245445,789],[775702.502202355,431072.226659204,779],[775680.153980298,431027.499072963,772],[775657.805758242,430982.771486723,767],[775635.457536186,430938.043900482,766],[775613.109314129,430893.316314241,755],[775590.761092073,430848.588728001,756],[775568.412870017,430803.86114176,777],[775546.06464796,430759.133555519,796],[775523.716425904,430714.405969278,800],[775501.368203848,430669.678383038,824],[775479.019981791,430624.950796797,841],[775456.671759735,430580.223210556,862],[775434.323537679,430535.495624316,882],[775411.975315622,430490.768038075,921],[775389.627093566,430446.040451834,935],[775367.27887151,430401.312865593,961],[775344.930649453,430356.585279353,978],[775322.582427397,430311.857693112,990],[775300.234205341,430267.130106871,996],[775277.885983284,430222.402520631,1000],[775255.537761228,430177.67493439,997],[775233.189539172,430132.947348149,1003],[775210.841317115,430088.219761908,1010],[775188.493095059,430043.492175668,1002],[775166.144873003,429998.764589427,985],[775143.796650946,429954.037003186,984],[775121.44842889,429909.309416946,962],[775099.100206834,429864.581830705,956],[775076.751984777,429819.854244464,939],[775054.403762721,429775.126658223,916],[775032.055540665,429730.399071983,884],[775009.707318608,429685.671485742,853],[774987.359096552,429640.943899501,840],[774965.010874496,429596.216313261,818],[774942.662652439,429551.48872702,809],[774920.314430383,429506.761140779,788],[774897.966208327,429462.033554538,778],[774875.61798627,429417.305968298,766],[774853.269764214,429372.578382057,752],[774830.921542158,429327.850795816,740],[774808.573320101,429283.123209576,734],[774786.225098045,429238.395623335,741],[774763.876875989,429193.668037094,753],[774741.528653932,429148.940450853,756],[774719.180431876,429104.212864613,753],[774696.83220982,429059.485278372,752],[774674.483987763,429014.757692131,747],[774652.135765707,428970.030105891,744],[774629.787543651,428925.30251965,743],[774607.439321594,428880.574933409,739],[774585.091099538,428835.847347168,734],[774562.742877482,428791.119760928,732],[774540.394655425,428746.392174687,732],[774518.046433369,428701.664588446,723],[774495.698211313,428656.937002205,716],[774473.349989256,428612.209415965,711],[774451.0017672,428567.481829724,709],[774428.653545144,428522.754243483,709],[774406.305323087,428478.026657243,707],[774383.957101031,428433.299071002,715],[774361.608878975,428388.571484761,722],[774339.260656918,428343.84389852,724],[774316.912434862,428299.11631228,737],[774294.564212806,428254.388726039,741],[774272.215990749,428209.661139798,756]]	
					var profil = drape['coordinates']
					var x = [];
					var y = [];
					var xy = []
					for (var index = 0; index < profil.length; index++) {
						xy.push([profil[index][0], profil[index][1]])
						x.push(index * 50)
						y.push(profil[index][2])
					}

					if (this.chart_drape) {
						this.chart_drape.destroy();
					}

					var k = 0
					var features = []

					for (var index = 0; index < xy.length; index++) {

						//var coord = proj.transform(xy[index], 'EPSG:32632', 'EPSG:3857')

						var newMarker = new Feature({
							geometry: new geom.Point(xy[index]),
							index: index,
							style: new style.Style({
								image: new style.Circle({
									radius: 0,
									fill: new style.Fill({
										color: '#fff'
									}),
									stroke: new style.Stroke({
										color: 'rgba(53, 175, 109,0.7)',
										width: 3
									})
								}),
								stroke: new style.Stroke({
									color: 'rgba(53, 175, 109,0.7)',
									width: 0
								})

							})
						});

						features[k] = newMarker;
						k++

					};


					var markerSource = new source.Vector({
						features: features
					});

					var vectorLayer = new layer.Vector({
						source: markerSource,
						style: new style.Style({
							image: new style.Circle({
								radius: 0,
								fill: new style.Fill({
									color: '#fff'
								}),
								stroke: new style.Stroke({
									color: 'rgba(53, 175, 109,0.7)',
									width: 0
								})
							}),
							stroke: new style.Stroke({
								color: 'rgba(53, 175, 109,0.7)',
								width: 0
							})

						})
					})

					vectorLayer.setZIndex(this.vector_draw.getZIndex())


					vectorLayer.set('type', 'drape_points');
					vectorLayer.set('name', 'drape_points');

					map.addLayer(vectorLayer);

					this.chart_drape = new Chart('canvas', {
						type: 'line',
						data: {
							labels: x,
							datasets: [
								{
									data: y,
									borderColor: this.primaryColor,
									fill: true,
									pointRadius: 2,
								}
							]
						},
						options: {
							legend: {
								display: false
							},
							scales: {
								xAxes: [{
									display: true,
									ticks: {
										maxTicksLimit: 12
									}
								}],
								yAxes: [{
									display: true,

								}],
							}
						}
					});

					var style_inactive = new style.Style({
						image: new style.Circle({
							radius: 0,
							fill: new style.Fill({
								color: '#fff'
							}),
							stroke: new style.Stroke({
								color: 'rgba(53, 175, 109,0.7)',
								width: 0
							})
						}),
						stroke: new style.Stroke({
							color: 'rgba(53, 175, 109,0.7)',
							width: 0
						})

					})

					var style_active = new style.Style({
						image: new style.Circle({
							radius: 6,
							fill: new style.Fill({
								color: '#fff'
							}),
							stroke: new style.Stroke({
								color: 'rgba(53, 175, 109,0.7)',
								width: 3
							})
						}),
						stroke: new style.Stroke({
							color: 'rgba(53, 175, 109,0.7)',
							width: 4
						})

					})
					//.addEventListener("mouseover")
					document.getElementById('canvas').addEventListener("mousemove", (evt) => {
						var firstPoint = this.chart_drape.getElementsAtEvent(evt)[0]

						if (firstPoint) {
							var label = this.chart_drape.data.labels[firstPoint._index];
							var value = this.chart_drape.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
							console.log(label, value)
							map.getLayers().forEach(function (leyer) {
								if (leyer.get('name') == 'drape_points') {

									for (var i = 0; i < leyer.get('source').getFeatures().length; i++) {

										if (label / 50 == leyer.get('source').getFeatures()[i].get('index')) {
											//console.log(leyer.get('source').getFeatures()[firstPoint._index])
											leyer.get('source').getFeatures()[i].setStyle(style_active)
										} else {
											leyer.get('source').getFeatures()[i].setStyle(style_inactive)
										}
									}
								}
							})

						} else {
							map.getLayers().forEach(function (leyer) {
								if (leyer.get('name') == 'drape_points') {
									for (var i = 0; i < leyer.get('source').getFeatures().length; i++) {
										leyer.get('source').getFeatures()[i].setStyle(style_inactive)

									}
								}
							})
						}


					});

				})
				//this.count_draw[type].push({ "id": id, "comment": null, "type": type, "geometry": geom, "hexa_code": this.primaryColor });

			});

		} else {
			this.source_draw.clear();
			this.altimetrie.active = false
			$("#profil_alti").hide()

			var lay = []
			map.getLayers().forEach((layer) => {
				if (layer.get('name') == 'drape_points') {
					lay.push(layer)
				}
			})

			for (var i = 0; i < lay.length; i++) {
				map.removeLayer(lay[i])
			}
		}
	}

	displayMetadataLink(couche) {

		if (Array.isArray(couche.metadata)) {
			return false
		} else {
			return true
		}
	}

	openMetadata(data) {
		var element = []

		for (var index = 0; index < data.metadata.tags.length; index++) {
			element.push(data.metadata.tags[index].tags);

		}

		data.metadata.tags_ = element.toString()

		var metadata = data.metadata
		const MetaData = this.dialog.open(modalMetadata, {
			width: '60%',
			height: '80%',
			data: { metadata: metadata, nom: data.nom, url_prefix: this.url_prefix }
		});

		MetaData.afterClosed().subscribe(result => {
			console.log('The dialog was closed :', result);
		});
	}

	getTooltip(id) {

		var text1 = $('#' + id).text()

		return text1
	}

	displayResultGeocode(item) {

		this.geocode_variable = {
			'type': item.type_query,
			'data': item
		}
		console.log(this.geocode_variable)
		map.getLayers().forEach((layer) => {
			if (layer.get('name') == 'querry') {
				layer.get('source').clear()
			}

		})

		if (this.geocode_variable.type == 'nominatim') {

			var tags = {
				'cle': item.class.toLowerCase().replace(/ /g, ''),
				'val': item.type.toLowerCase().replace(/ /g, '')
			}
			// console.log(item)
			var i;
			for (var index = 0; index < this.tags_couche.length; index++) {

				if (this.tags_couche[index]['cle'].toLowerCase().replace(/ /g, '') == tags.cle && this.tags_couche[index]['val'].toLowerCase().replace(/ /g, '') == tags.val) {
					i = index
					break
				} else if (this.tags_couche[index]['cle'].toLowerCase().replace(/ /g, '') == tags.cle && this.tags_couche[index]['val'].toLowerCase().replace(/ /g, '') == '') {
					i = index
				}

			}

			if (this.geocode_variable.data.icon) {
				if (this.geocode_variable.data.osm_type == 'node' || this.geocode_variable.data.osm_type == 'relation') {
					var type_geom = 'point'
				} else {
					var type_geom = 'Polygon'
				}
			} else {
				var type_geom = 'LineString'
			}

			if (i) {
				var resultat = {
					icone: this.tags_couche[i]['couche'].img,
					type_query: this.geocode_variable.type,
					type_geom: type_geom,
					type_geom_smartworld: this.tags_couche[i]['couche'].geom,
					result_smartworld: true,
					data: this.geocode_variable.data
				}
				console.log(resultat, 'resultat')

			} else {
				var resultat = {
					icone: this.geocode_variable.data.icon,
					type_query: this.geocode_variable.type,
					type_geom: type_geom,
					type_geom_smartworld: this.tags_couche[0]['couche'].geom,
					result_smartworld: false,
					data: this.geocode_variable.data
				}

				console.log(resultat, 'resultat')
			}

			this.displayResultGeocodeOnMap(resultat)
		} else if (this.geocode_variable.type == 'cartes') {

			if (!this.geocode_variable.data.checked) {
				if (this.geocode_variable.data.url_raster || this.geocode_variable.data.url_tile || this.geocode_variable.data.url) {
					/*if (this.geocode_variable.data.url_raster) {
						this.geocode_variable.data.url = this.geocode_variable.data.url_raster
					} else if (this.geocode_variable.data.url_tile) {
						this.geocode_variable.data.url = this.geocode_variable.data.url_tile
					}*/

					var groupe = this.cartes[this.geocode_variable.data.rang_thema]
					this.geocode_variable.data.checked = true
					this.displayDataOnMap(item, groupe)

				} else {
					this.notif.open("Cette carte n'a pas encore été numérisée", 'Fermer', {
						duration: 2500
					});
				}

			} else {
				this.notif.open("Cette carte est déja dans vos couches en cours", 'Fermer', {
					duration: 2500
				});
			}


		} else if (this.geocode_variable.type == 'thematiques') {
			if (!this.geocode_variable.data.checked) {
				var groupe = this.thematiques[this.geocode_variable.data.rang_thema]
				this.geocode_variable.data.checked = true
				this.displayDataOnMap(item, groupe)

			} else {
				this.notif.open("Cette donnée est déja dans vos couches en cours", 'Fermer', {
					duration: 2500
				});
			}
		} else if (this.geocode_variable.type == 'limites') {
			var donne = this.geocode_variable.data
			this.displayLimitesAdministratives(donne)
		} else if (this.geocode_variable.type == 'adresses') {

			var donne = this.geocode_variable.data
			var coord_4326 = JSON.parse(donne.geometry).coordinates
			var coord = proj.transform(coord_4326, 'EPSG:4326', 'EPSG:3857')

			this.data_right_click['coord'] = coord
			this.getCarateristics()
		} else if (this.geocode_variable.type == 'position') {
			var donne = this.geocode_variable.data
			var o = donne['origine']
			var k = turf.lengthToDegrees(0.015, 'kilometers')
			var polygon = turf.polygon([[
				[o[0], o[1]],
				[o[0], o[1] + k],
				[o[0] + k, o[1] + k],
				[o[0] + k, o[1]],
				[o[0], o[1]]
			]])

			var position_feaure = new Format.GeoJSON().readFeatures(polygon, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' });

			// var vectorFeature = (new Format.GeoJSON()).readFeatures(data, { dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857' })


			var vectorSource = new source.Vector({
				features: position_feaure
			});

			var primaryColor = this.primaryColor
			var vectorLayer = new layer.Vector({
				source: vectorSource,
				style: new style.Style({
					fill: new style.Fill({
						color: 'rgba(255, 255, 255,0.4)'
					}),
					stroke: new style.Stroke({
						color: primaryColor,
						width: 2
					})
				})
			})

			vectorLayer.setZIndex(99)
			vectorLayer.set('type', 'querry');
			vectorLayer.set('name', 'querry');
			map.addLayer(vectorLayer);
			map.getView().fit(vectorSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 18, 'duration': 1000 });
		}



	}

	displayLimitesAdministratives(donne){ 
		var formatArea = function (polygon) {
			var area = Sphere.getArea(polygon);
			var output;
			if (area > 10000) {
				output = (Math.round(area / 1000000 * 100) / 100) +
					' ' + 'km²';
			} else {
				output = (Math.round(area * 100) / 100) +
					' ' + 'm²';
			}

			return output;
		};
		$('#spinner_loading').show()
		this.geoportailService.getLimiteById({ 'id': donne.id, 'table': donne.type }).then((data: Object[]) => {
			$('#spinner_loading').hide()
			if (data["status"] == 'ok') {
				donne.name = data["data"].name
				donne.ref = data["data"].ref
				var a ={}
				a['type_query_action']='setWord_geocode'
				a['value']=donne.type_display+' : '+donne.name+' ('+donne.ref+')'
				this.communicationComponent.updateData(Object.create(a))
				

				var newMarker = new Format.GeoJSON().readFeatures(JSON.parse(data["data"]['st_asgeojson']), {
					dataProjection: 'EPSG:4326',
					featureProjection: 'EPSG:3857'
				});
				newMarker[0].set('data', donne)

				var markerSource = new source.Vector({
					features: newMarker
				});

				var rgb = this.hexToRgb(this.primaryColor);
				var primaryColor = this.primaryColor


				if (donne.ref) {
					var texte = donne.type_display + ' : \n' + data["data"].name + ' (' + data["data"].ref + '), ' + formatArea(newMarker[0].getGeometry())
				} else {
					var texte = donne.type_display + ' : \n' + data["data"].name + ' , ' + formatArea(newMarker[0].getGeometry())
				}
				var LayThe = new layer.Vector({
					source: markerSource,
					style: function (feature) {
						var styleDefaultII = new style.Style({
							stroke: new style.Stroke({
								color: primaryColor,
								width: 2
							}),
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.4]
							}),
							text: new style.Text({
								font: '15px Calibri,sans-serif',//formatArea
								text: texte,
								fill: new style.Fill({ color: '#000' }),
								stroke: new style.Stroke({ color: '#000', width: 1 }),
								offsetX: 0,
								offsetY: 0,
								//rotation: rotation
							})
						})
						return styleDefaultII
					},
					visible: true
				});


				LayThe.setZIndex(99)

				LayThe.set('type', 'querry');

				LayThe.set('name', 'querry');

				map.addLayer(LayThe);
				map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 19, 'duration': 1000 });
			}
		})
	}

	displayResultGeocodeOnMap(donne) {
		console.log(donne)

		var rgb = this.hexToRgb(this.primaryColor);
		var primaryColor = this.primaryColor

		if (donne.type_query == 'nominatim') {
			if (donne.result_smartworld) {
				if (donne.type_geom == donne.type_geom_smartworld) {
					var type_geom = donne.type_geom
				} else {
					var type_geom = donne.type_geom_smartworld
				}
			} else {
				var type_geom = donne.type_geom
			}

			if (donne.icone) {
				if (donne.result_smartworld) {
					var url = this.url_prefix + donne.icone;
					var scale = 0.2
				} else {
					var url = '' + donne.icone;
					var scale = 1.5
				}
			}
		}else{
			var type_geom = donne.type_geom
			var url = this.url_prefix + donne.icone;
			var scale = 0.2
		}

		if (type_geom == 'point') {

			var feat = []
			var coord;
			if (donne.type_query == 'nominatim') {

				coord = proj.transform([parseFloat(this.geocode_variable.data.lon), parseFloat(this.geocode_variable.data.lat)], 'EPSG:4326', 'EPSG:3857')

				if (donne.data.polygonpoints && donne.data.type == "administrative") {
					var coord_polys = this.convertepolygon(donne.data.polygonpoints)

					var newMarker = new Feature({
						geometry: new geom.Polygon([coord_polys]),
					});

					feat.push(newMarker)
				}
			} else {
				coord = proj.transform([parseFloat(donne["coord"][0]), parseFloat(donne["coord"][1])], 'EPSG:4326', 'EPSG:3857') 
			}


			var newMarker = new Feature({
				geometry: new geom.Point(coord),
				data: donne.data,
			});
			feat.push(newMarker)

			var markerSource = new source.Vector({
				features: feat
			});



			var LayThe = new layer.Vector({
				source: markerSource,
				style: function (feature) {
					console.log(feature.getGeometry().getType())
					if (feature.getGeometry().getType() == 'Point') {
						var styleDefaultII = new style.Style({
							image: new style.Icon({
								scale: scale,
								src: url
							})
						});
					} else {

						var styleDefaultII = new style.Style({
							stroke: new style.Stroke({
								color: primaryColor,
								width: 2
							}),
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.4]
							}),
						})

					}

					return styleDefaultII;
				},
				visible: true
			});


		} else if (type_geom == 'Polygon') {
			var coord_poly;
			if (donne.type_query == 'nominatim') {
				coord_poly = this.convertepolygon(donne.data.polygonpoints)
			} else {
				coord_poly = this.convertepolygon(donne.coord)
			}

			console.log(coord_poly)

			if (donne.icone) {

				var cnv = document.createElement('canvas');
				var ctx = cnv.getContext('2d');
				var img = new Image();
				img.src = url
				donne.data.img = url
				img.onload = () => {

					var newMarker = new Feature({
						geometry: new geom.Polygon([coord_poly]),
						data: donne.data,
						ptestyle: { 'img': ctx.createPattern(img, 'repeat') }
					});

					var markerSource = new source.Vector({
						features: [newMarker]
					});

					var LayThe = new layer.Vector({
						source: markerSource,
						style: stylePolygon,
						visible: true
					});

					LayThe.setZIndex(99)

					LayThe.set('type', 'querry');

					LayThe.set('name', 'querry');

					map.addLayer(LayThe);
					map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 17, 'duration': 1000 });

				}

			} else {

				var newMarker = new Feature({
					geometry: new geom.Polygon([coord_poly]),
					data: donne.data,
				});

				var markerSource = new source.Vector({
					features: [newMarker]
				});

				var LayThe = new layer.Vector({
					source: markerSource,
					style: function (feature) {

						var styleDefaultII = new style.Style({
							stroke: new style.Stroke({
								color: primaryColor,
								width: 2
							}),
							fill: new style.Fill({
								color: [rgb.r, rgb.g, rgb.b, 0.4]
							}),
						})

						return styleDefaultII
					},
					visible: true
				});
			}

		} else if (type_geom == "LineString") {
			var coord_poly;
			if (donne.type_query == 'nominatim') {
				coord_poly = this.convertepolygon(donne.data.polygonpoints)
			} else {
				coord_poly = this.convertepolygon(donne.coord)
			}
			
			var newMarker = new Feature({
				geometry: new geom.LineString(coord_poly),
				data: donne.data,
			});

			var markerSource = new source.Vector({
				features: [newMarker]
			});

			var LayThe = new layer.Vector({
				source: markerSource,
				style: function (feature) {

					var styleDefaultII = new style.Style({
						stroke: new style.Stroke({
							color: primaryColor,
							width: 5
						})
					})

					return styleDefaultII
				},
				visible: true
			});

		}

		if (LayThe) {
			LayThe.setZIndex(99)

			LayThe.set('type', 'querry');

			LayThe.set('name', 'querry');

			map.addLayer(LayThe);
			console.log(markerSource.getExtent())
			map.getView().fit(markerSource.getExtent(), { 'size': map.getSize(), 'maxZoom': 15, 'duration': 1000 });
		}
	}

	displayComments() {
		this.commentLayer.checked = !this.commentLayer.checked
		this.displayDataOnMap(this.commentLayer, { shema: this.commentLayer.shema })

	}

	printMap(){
	
		$('#loading_print').show()

		var createPDFObject = (imgData, type, format, compress) =>{
			try{
				
				var extents =map.getView().calculateExtent(map.getSize());
				var center=getCenterOfExtent(extents);
				var WGS84=proj.transform([center[0], center[1]], 'EPSG:3857', 'EPSG:4326');
				var lMargin=15; 
				var rMargin=15; 
				var pdfInMM=550;  
				var d = new Date();
				var dd=d.getDate();
				var doc = new jsPDF('p', 'pt', 'a4', false);
				doc.setFontSize(15);
				doc.setDrawColor(0);
				doc.setFillColor(255, 255, 255);
				doc.rect(0, 0, 595.28,  841.89, 'F');
				if(this.printMapObjet.titre != ''){
					doc.text(35, 170,"Titre : "+this.printMapObjet.titre +"");
				}else{
					doc.text(35, 170,"Carte du GéoPortail - GeoCameroun");
				}
				doc.setFontSize(25);
				doc.setTextColor(28,172,119);
				// doc.text(110, 50,"GeoCameroun");
				doc.setFontSize(10);
				doc.setTextColor(0,0,0);
				// doc.text(110, 65,"Infrastrucutre de données spatiales");
				doc.setFontSize(14);
				doc.text(465, 55,""+d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear()+"");
				doc.addImage(imgData["png1"], 20,20,250,50);
				doc.addImage(imgData["png0"], format, 20, 200,550,350, undefined, compress);
				doc.rect(20, 120, 550, 500, 'D');
				doc.setFontSize(10);
				doc.text(400, 570,"Centroïde de la carrte en WGS84");
				doc.text(400, 585,"Longitude : "+WGS84[0].toFixed(4));
				doc.text(400, 600,"Laltitude : "+WGS84[1].toFixed(4));
				doc.text(60, 570,"Échelle :1/"+getmetricscal().toFixed(4));
				doc.rect(20, 650, 550, 100, 'D');
				doc.setFontSize(9);
				if(this.printMapObjet.description != ''){
				 	var lines =doc.splitTextToSize(""+this.printMapObjet.description+"", (pdfInMM-lMargin-rMargin));
				    doc.text(29,670,lines);
				}
				
				doc.text(25, 800,"Copyright © "+d.getFullYear()+" GeoCameroun, www.geocameroun.cm");
				console.log(2,this.printMapObjet)
				doc.save('carte_GC_'+d.getDate()+"_"+d.getMonth()+"_"+d.getFullYear()+'_.pdf');
				this.printMapObjet={
					'titre':'',
					'description':'',
				}
				$('#loading_print').hide()
			}catch(e){console.log(e)
				$('#loading_print').hide()
				alert('Un problème est survenu lors de la création de votre carte')
				//  $('.search').hide(); 
				//  $("#Err").html("une erreur est survenue lors de l'impression");
				//   document.getElementById("DivMsgErr").style.top = "0px";
			}
	
		}
	
		function getCenterOfExtent(ext){
			var X = ext[0] + (ext[2]-ext[0])/2;
			var Y = ext[1] + (ext[3]-ext[1])/2;
			return [X, Y];
		}  
	
		function getmetricscal(){
	
			var px=$(".ol-scale-line-inner").css("width");
	
			var numpx=px.replace( /\D+/g, '');
			var distancecarte=numpx*0.264583*0.1;
	
			var scale=$(".ol-scale-line-inner").text();
			var numscale=scale.replace( /\D+/g, '');
	
			var unit= scale.replace(/[0-9]/g, '');
	
			if(unit==" km"){
	
			numscale=numscale*100000;
	
	
			}else if(unit==" m"){
	
			numscale=numscale*100;
	
			}
	
			var dem=numscale/distancecarte;
	
			return dem  
		} 
	
		map.once('postcompose', (event)=> {
			
		 var canvas = event.context.canvas;
		 var label="png"
		 var type="base64"
		 var format="png"
   
		 var images = {
   
			   png0: canvas.toDataURL('image/png'),
			   png1:'data:image/png;base64,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'   
		   }
			  
			   createPDFObject(images, label + " " + type, format,'none');				
   
	   });
   
	   map.renderSync();

	
	}

	
}




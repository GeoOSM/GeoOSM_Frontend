import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { geoportailService } from '../../service/geoportail.service'
import { communicationComponent } from '../../service/communicationComponent.service'
import { environment } from '../../../environments/environment';
import * as $ from 'jquery';
import { debounceTime, tap, finalize, switchMap } from 'rxjs/operators';
declare var turf: any;

@Component({
  selector: 'app-downloads',
  templateUrl: './downloads.component.html',
  styleUrls: ['./downloads.component.scss']
})
export class DownloadsComponent implements OnInit {

  @Input() config_projet: any
  @Input() thematiques: any
  @Input() roi_projet_geojson: any
  @Input() layerInMap: any
  @Output() displayDownloadsResultFun = new EventEmitter()

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
  myControl = new FormControl();
  filter_option_expression = {
    'name': ''
  }
  url_prefix = environment.url_prefix
  constructor(
    public geoportailService: geoportailService,
    public communicationComponent: communicationComponent
  ) { }

  ngOnInit() {
    console.log(this.layerInMap)
    var lay = []
    try {

      for (let index = 0; index < this.layerInMap.length; index++) {
        const element = this.layerInMap[index];
        if (element.type_couche_inf == "thematiques") {
          var a = {
            couche_analyse: this.communicationComponent.get_couche_by_key_and_id_cat(element['id_cat'], element['key_couche']),
            thematiques_analyse: this.communicationComponent.get_thematique_by_rang(element.rang_thema)
          }
          if (a.couche_analyse && a.thematiques_analyse) {
            lay.push(a)
          }
        }
      }

    }
    catch (error) {

    }

    if (lay.length > 0) {
      this.analyse_spatial['thematiques_analyses'] = lay
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

  initialiseSearchOfLimit() {
    if (!this.autocomplteActive) {
      this.myControl
        .valueChanges
        .pipe(
          debounceTime(300),
          tap(() => { this.recherche_is_loading = true; this.analyse_spatial['emprises'] = []; this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = [] }),
          switchMap(value => {
            if (typeof value === 'string' && value.length > 1) {
              return this.geoportailService.searchLimiteObservable({
                // 'table':this.paramsForqueryAutocomplete.table,
                'word': value.toString()
              })
                .pipe(
                  finalize(() => this.recherche_is_loading = false),
                )
            }

          }
          )
        )
        .subscribe((reponses: any) => {
          this.recherche_is_loading = false
          var new_name = []
          this.analyse_spatial['emprises'] = []
          var data = JSON.parse(reponses['_body'])
          console.log(data)

          var limites = []
          var limite_display = []

          for (let index = 0; index < this.config_projet['limites'].length; index++) {
            const element = this.config_projet['limites'][index];
            limite_display.push(element['nom'])
            limites.push(element['nom_table'])
          }

          for (var i = 0; i < limites.length; i++) {
            var element = limites[i];
            for (var index = 0; index < data[limites[i]].length; index++) {
              // var sdsd = data[limites[i]][index]['name'] + ', (' + data[limites[i]][index]['ref'] + ')'+' - '+limite_display[i];
              // new_name.push(sdsd)
              this.analyse_spatial['emprises'].push({
                type: limites[i],
                type_display: limite_display[i],
                name: data[limites[i]][index]['name'],
                id: data[limites[i]][index]['id'],
                ref: data[limites[i]][index]['ref']
              })

            }
          }

          // this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = this.analyse_spatial['emprises_formate']
          // this.analyse_spatial['emprises_formate'] = new_name

        });
    }

    this.autocomplteActive = true
  }


  displayFn(data) {
    if (data instanceof Object) {
      try {
        return data.name;
      } catch (error) {
        return ''
      }

    } else {
      return ''
    }

  }

  /**
   * si recheche autocomplet en cours
   */
  recherche_is_loading = false
  /**
   * si l'evenement de recherche des limites administratives est deja activé
   */
  autocomplteActive = false
  /**
   * stocker la table ou faire la recherche autocomplete
   */
  paramsForqueryAutocomplete: { table: string }
  chooseCouche_function() {
    this.analyse_spatial["emprisesChoisiId"] = undefined

    this.myControl.reset()
    if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] != "tout" && this.analyse_spatial['type_emprise_spatiale'] != "draw") {
      this.paramsForqueryAutocomplete = { 'table': this.analyse_spatial['type_emprise_spatiale'] }
      this.initialiseSearchOfLimit()

      // this.geoportailService.getListLimit({ 'table': this.analyse_spatial['type_emprise_spatiale'] }).then((data: Object[]) => {
      //   var new_name = []
      //   for (var index = 0; index < data.length; index++) {
      //     var element = data[index]['name'] + ', (' + data[index]['ref'] + ')';
      //     new_name.push(element)
      //   }
      //   this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = data
      //   this.analyse_spatial['emprises'] = data
      //   this.analyse_spatial['emprises_formate'] = new_name

      //   this.myControl.valueChanges.subscribe((x) => {
      //     this.filter_option_expression.name = x;
      //   });

      // })

    } else if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] == "tout") {
      // this.analyse_spatial[this.analyse_spatial['type_emprise_spatiale']] = 'tout'
      this.analyse_spatial['emprises'] = 'tout'
      this.analyse_spatial['emprisesChoisiId'] = 'tout'
      this.analyse_spatial['type_emprise_spatiale'] = 'tout'
      this.analyse_spatial['emprisesChoisiName'] = 'tout'
    }
  }

  removeSpecialCharacter(data) {
    return data.replace(/[^a-zA-Z0-9]/g, '_');
  }

  calculate_analyse_spatial(event) {
    console.log(event, event.option.value)
    var value = event.option.value
    this.analyse_spatial['emprisesChoisiId'] = value.id
    this.analyse_spatial['emprisesChoisiName'] = value.name
    this.analyse_spatial['table'] = value.type

    // var nom_limite = ''
    // for (var index = 0; index < event["option"]["viewValue"].split(',').length; index++) {
    //   //console.log(5)
    //   if (index <= event["option"]["viewValue"].split(',').length - 2) {
    //     nom_limite = nom_limite + event["option"]["viewValue"].split(',')[index]
    //   }
    // }
    // this.filter_option_expression.name = nom_limite

    // for (var index = 0; index < this.analyse_spatial['emprises'].length; index++) {
    //   //console.log( this.removeSpecialCharacter(this.analyse_spatial['emprises'][index]['name']) == this.removeSpecialCharacter(this.analyse_spatial['emprisesChoisi']) )
    //   if (this.removeSpecialCharacter(this.analyse_spatial['emprises'][index]['name']) == this.removeSpecialCharacter(nom_limite)) {
    //     this.analyse_spatial['emprisesChoisiId'] = this.analyse_spatial['emprises'][index]['id']
    //     this.analyse_spatial['emprisesChoisiName'] = this.analyse_spatial['emprises'][index]['name']
    //   }
    // }

    console.log(this.analyse_spatial)
  }

  disabled_couche(couche): boolean {
    // console.log(couche)
    if (couche['wms_type'] == 'osm' && (couche['number'] == 0 || couche['number'] == null)) {
      return true
    } else {
      return false
    }

  }

  disableOptionAnalyseSpatial(data) {
    if (data.type == 'xyz') {
      return true
    } else if (data.type_couche == 'wms' || data.type == 'wms') {
      if (data.cles_vals_osm != undefined && (data.cles_vals_osm.length > 0 || (data.categorie && data.categorie.mode_sql)) > 0 && !this.disabled_couche(data)) {
        return false
      } else {
        return true
      }
    } else if (data.type_couche == 'requete' && data.status == true && data.file_json) {
      return true
    } else if (data.type_couche == 'couche') {
      return true
    } else if (data.type_couche == 'api' && data.url) {
      return true
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

      } else {
        if (couche.identifiant) {
          this.analyse_spatial['query'].push({
            'url': couche.url,
            'projet_qgis': environment.pojet_nodejs,
            'methode': 'qgis',
            'index': index,
            'nom': couche.nom,
            'id_cat': couche.params_files.id_cat,
            'type': couche.type_couche,
            'identifiant': couche.identifiant,
            'id_them': couche.id_cat,
            'key_couche': couche.key_couche,
          })
        }
      }
    }

    if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] != "draw" && this.analyse_spatial['type_emprise_spatiale'] != "tout") {

      this.geoportailService.getLimitById({ 'table': this.analyse_spatial['table'], id: this.analyse_spatial["emprisesChoisiId"] }).then((data: Object[]) => {
        this.analyse_spatial['geometry'] = JSON.parse(data["geometry"])

        var params = {
          'querry': this.analyse_spatial['query'],
          'lim_adm': this.analyse_spatial['table'],
          'id_lim': this.analyse_spatial["emprisesChoisiId"],
          // 'geometry': this.analyse_spatial['geometry']
        }
        this.downloadResult(params, this.analyse_spatial)

      })
    } else if (this.analyse_spatial['type_emprise_spatiale'] && this.analyse_spatial['type_emprise_spatiale'] == "tout") {
      var coordinates_poly = []
      for (var k = 0; k < this.roi_projet_geojson['coordinates'].length; k++) {
        var element = this.roi_projet_geojson['coordinates'][k];
        if (element.length == 1) {
          coordinates_poly.push(element[0])
        } else {
          coordinates_poly.push(element)
        }
      }
      this.analyse_spatial['geometry'] = this.roi_projet_geojson
      var params = {
        'querry': this.analyse_spatial['query'],
        'geometry': 'tout'
      }

      var reponse = []
      for (let index = 0; index < this.analyse_spatial['query'].length; index++) {
        const element = this.analyse_spatial['query'][index];

        var couche = this.communicationComponent.get_couche_by_key_and_id_cat(element['id_them'], element['key_couche'])
        var params_files: any = couche['params_files']
        console.log(couche, nom_shp)
        var nom_shp = environment.url_service + '/' + environment.path_qgis + '/' + environment.pojet_nodejs + '/gpkg/' + params_files.nom_cat.replace(/[^a-zA-Z0-9]/g, '_') + '_' + params_files.sous_thematiques + '_' + params_files.key_couche + '_' + params_files.id_cat + '.gpkg'




        element['number'] = couche.number
        element['nom'] = couche.nom
        element['nom_file'] = nom_shp

      }

      this.displayDownloadsResultFun.next({
        params: params,
        analyse_spatial: this.analyse_spatial,
      })
    }
  }

  downloadResult(params, analyse_spatial) {
    this.geoportailService.analyse_spatiale(params).then((data: Object[]) => {
      $('#loading_calcul').hide()
      var numbers = []
      var labels = []
      for (var index = 0; index < data.length; index++) {
        numbers.push(data[index]['number'])
        labels.push(data[index]['nom'] + ' (' + data[index]['number'] + ') ')
        analyse_spatial["query"][data[index]['index']]["number"] = data[index]['number']
        if (!params['geometry']) {
          var url = this.url_prefix + data[index]['nom_file'];
        } else if (params['geometry']) {
          var url = environment.url_service + data[index]['nom_file'];
        }
        analyse_spatial["query"][data[index]['index']]["nom_file"] = url
      }

      this.displayDownloadsResultFun.next({
        params: params,
        analyse_spatial: this.analyse_spatial,
      })

    })
  }



}

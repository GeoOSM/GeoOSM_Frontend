import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { modalMetadata } from '../../modal/modal.metadata';
import { MatSnackBar, MatBottomSheet, MatBottomSheetRef, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { communicationComponent } from '../.../../../service/communicationComponent.service'
import { TranslateService } from '@ngx-translate/core';
import * as $ from 'jquery';

@Component({
  selector: 'app-fiche-descriptive',
  templateUrl: './fiche-descriptive.component.html',
  styleUrls: ['./fiche-descriptive.component.scss']
})
export class FicheDescriptiveComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public MetaData: MatDialog,
    private communicationComponent: communicationComponent,
  ) {
   
  }
  
  @Input() positionProperties:any;
  @Input() typeDataFeature:any;
  @Input() dataFeature:any;

  @Output() displayDataOnMap_action = new EventEmitter();
  @Output() closeProperties_action = new EventEmitter();
  @Output() shareFeature_action = new EventEmitter();

  url_share:string = undefined
  url_prefix = environment.url_prefix

  osm_features_special={}
  

  ngOnInit() {
    $.get('assets/config_tags.json', (data) => {
      this.osm_features_special = data
    })
  }

  ngOnChanges(){
    console.log('ngOnChanges')
    $('#share_div_pte').hide()
    this.url_share = undefined
  }

  isShareFeatures(feature) {
		for (var index = 0; index < feature.length; index++) {
			if (feature[index]['type'] == 'share') {
				return true
			}
		}
  }

  shareFeature(data){
    this.url_share= this.communicationComponent.getUrlShareFeature(data)
      $('#share_div_pte').show()
			// setTimeout(() => {
			// 	$('#share_div_pte').hide()
			// }, 5000)
    // this.shareFeature_action.next(data)
  }

  displayDataOnMap(data){
    this.displayDataOnMap_action.next(data)
  }

  closeProperties(){
    this.closeProperties_action.next()
  }

  get_title_couche(){
    var title;
    for (let index = 0; index < this.dataFeature.length; index++) {
      const element = this.dataFeature[index];
      if (element['index'] == 'title_couche_thematique') {
        title = element['val']
      }
    }
    return title
  }
  openUrl(url){
    window.open(url,'_blank')
  }
  
}

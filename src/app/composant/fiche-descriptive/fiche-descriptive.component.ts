import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { modalMetadata } from '../../modal/modal.metadata';
import { MatSnackBar, MatBottomSheet, MatBottomSheetRef, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { communicationComponent } from '../.../../../service/communicationComponent.service'
import { TranslateService } from '@ngx-translate/core';

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


  url_prefix = environment.url_prefix
  ngOnInit() {
  }


  isShareFeatures(feature) {
		for (var index = 0; index < feature.length; index++) {
			if (feature[index]['type'] == 'share') {
				return true
			}
		}
  }

  shareFeature(data){
    this.shareFeature_action.next(data)
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
  
}

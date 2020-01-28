import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { modalMetadata } from '../../modal/modal.metadata';
import { MatSnackBar, MatBottomSheet, MatBottomSheetRef, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {communicationComponent} from '../.../../../service/communicationComponent.service'

@Component({
  selector: 'app-couche-en-cours',
  templateUrl: './couche-en-cours.component.html',
  styleUrls: ['./couche-en-cours.component.scss']
})
export class CoucheEnCoursComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public MetaData: MatDialog,
    private communicationComponent:communicationComponent
  ) { }

  @Input() type;
  @Input() couche;
  @Input() i;


  @Output() changeOpacity_action = new EventEmitter();
  @Output() toogleVisibilityLayer_action = new EventEmitter();
  @Output() displayDataOnMap_action = new EventEmitter();
  
  url_prefix = environment.url_prefix

  ngOnInit() {
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

  toogleVisibilityLayer(couche){
    this.toogleVisibilityLayer_action.emit(couche)
  }

  changeOpacity(couche,$event){
    var data = {
      'couche':couche,
      'event':$event
    }

    this.changeOpacity_action.emit(data)

  }

  displayDataOnMap(couche){
    this.displayDataOnMap_action.emit(couche)
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
import { modalMetadata } from '../../modal/modal.metadata';
import { MatSnackBar, MatBottomSheet, MatBottomSheetRef, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { communicationComponent } from '../.../../../service/communicationComponent.service'
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-couche-en-cours',
  templateUrl: './couche-en-cours.component.html',
  styleUrls: ['./couche-en-cours.component.scss']
})
export class CoucheEnCoursComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public MetaData: MatDialog,
    private communicationComponent: communicationComponent,
    public translate: TranslateService
  ) {
    translate.addLangs(['fr']);
    translate.setDefaultLang('fr');
  }

  @Input() type;
  @Input() couche;
  @Input() i;


  @Output() changeOpacity_action = new EventEmitter();
  @Output() toogleVisibilityLayer_action = new EventEmitter();
  @Output() displayDataOnMap_action = new EventEmitter();
  @Output() share_action = new EventEmitter();

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

    console.log(data)
    if (this.displayMetadataLink(data)) {

      for (var index = 0; index < data.metadata.tags.length; index++) {
        element.push(data.metadata.tags[index].tags);

      }

      data.metadata.tags_ = element.toString()

      var metadata = data.metadata
      const MetaData = this.dialog.open(modalMetadata, {
        minWidth: "350px",
        // height: '80%',
        data: { exist:true,metadata: metadata, nom: data.nom, url_prefix: this.url_prefix }
      });

      MetaData.afterClosed().subscribe(result => {
        console.log('The dialog was closed :', result);
      });
    }else{
      var metadata = data.metadata
      const MetaData = this.dialog.open(modalMetadata, {
        minWidth: "350px",
        data: { exist:false,metadata: metadata, nom: data.nom, url_prefix: this.url_prefix }
      });
    }
  }

  toogleVisibilityLayer(couche) {
    this.toogleVisibilityLayer_action.emit(couche)
  }

  changeOpacity(couche, $event) {
    var data = {
      'couche': couche,
      'event': $event
    }

    this.changeOpacity_action.emit(data)

  }

  displayDataOnMap(couche) {
    this.displayDataOnMap_action.emit(couche)
  }

  share(type, couche, sous, group) {
    var data = {
      "type": type,
      "couche": couche,
      "sous": sous,
      "group": group,
    }
    this.share_action.emit(data)
  }

}

import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';


import { geoportailService } from "../service/geoportail.service";

export interface MetaData {
  metadata
  nom
  url_prefix
}

@Component({
  selector: 'modal-metadata',
  templateUrl: './modal.metadata.html',
})
export class modalMetadata {

  url_prefix
  data_metadata

  constructor(
    public dialogRef: MatDialogRef<modalMetadata>,
    @Inject(MAT_DIALOG_DATA) public data: MetaData,
    private builder: FormBuilder,
    private geoportailService: geoportailService,
  ) { }


  ngOnInit() {
    this.url_prefix = this.data['url_prefix']

    if (this.data['exist']) {
      var partenaire = []
      for (var index = 0; index < this.data['metadata'].partenaire.length; index++) {
        partenaire.push(this.data['metadata'].partenaire[index].id_user);
      }

      this.geoportailService.getUsers({ 'donnes': partenaire }).then((data: any) => {
        for (var index = 0; index < data.length; index++) {
          this.data['metadata'].partenaire[index]['img'] = data[index]['src_photo']
          this.data['metadata'].partenaire[index]['nom'] = data[index]['nom']
          this.data['metadata'].partenaire[index]['email'] = data[index]['email']
        }

      })

      
    }

    this.data_metadata = this.data
    console.log(this.data_metadata)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
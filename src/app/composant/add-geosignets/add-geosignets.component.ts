import {Component, Inject,OnInit} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import { DialogData } from '../../buttonSheet/buttonheet.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-add-geosignets',
  templateUrl: './add-geosignets.component.html',
  styleUrls: ['./add-geosignets.component.scss']
})
export class AddGeosignetsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AddGeosignetsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private builder: FormBuilder,
    public translate: TranslateService
   ) {}

  	public signet = this.builder.group({
        nom: ["", Validators.required],
    });

  ngOnInit() {

  }

  valider(){
    console.log(this.signet.valid,this.signet)
    if (this.signet.valid) {
      this.dialogRef.close({
        "statut":true,
        "nom":this.signet.controls['nom'].value
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close({
      "statut":false
    });
  }

}

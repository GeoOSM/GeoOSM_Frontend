import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';

export interface DialogData {
  type: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './modal.component.html',
})
export class modalComponent {

  constructor(
    public dialogRef: MatDialogRef<modalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private builder: FormBuilder
   ) {}

  	public searchGpsForm = this.builder.group({
        projection: ["WGS84", Validators.required],
        longitude: ["", Validators.required],
        latitude: ["", Validators.required]
    });

    ngOnInit() {
    	console.log(this.data['type'])
    }

    valider(){
      console.log(this.searchGpsForm.valid,this.searchGpsForm)
      if (this.searchGpsForm.valid) {
        this.dialogRef.close({
          "statut":true,
          "data":this.searchGpsForm.value
        });
      }
    }
    
    onNoClick(): void {
      this.dialogRef.close({
        "statut":false
      });
    }

}
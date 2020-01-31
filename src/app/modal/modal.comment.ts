import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { TranslateService } from '@ngx-translate/core';

export interface DialogData {
//   type: string;
}

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: './modal.comment.html',
})
export class commentComponent {

    public Editor = ClassicEditor
  constructor(
    public dialogRef: MatDialogRef<commentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private builder: FormBuilder,
    public translate: TranslateService
   ) {}

  	public searchGpsForm = this.builder.group({
        nom: ["", Validators.required],
        email: ["", Validators.required],
        description: ["", Validators.required]
    });

    ngOnInit() {
    	// console.log("this.data['type']")
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
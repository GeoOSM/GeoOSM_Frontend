import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
    private builder: FormBuilder
    
   ) {}

  	public searchGpsForm = this.builder.group({
        nom: ["", Validators.required],
        email: ["", Validators.required],
        description: ["", Validators.required]
    });

    ngOnInit() {
    	console.log("this.data['type']")
    }

  /*onNoClick(): void {
    this.dialogRef.close();
  }*/

}
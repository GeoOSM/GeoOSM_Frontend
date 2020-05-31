import {Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import {environment} from '../../environments/environment'


@Component({
  selector: 'modal-question',
  templateUrl: './question.modal.html',
})
export class modalQuestion {

  url_prefix
  environment

  constructor(
    public dialogRef: MatDialogRef<modalQuestion>,
   ) {
     this.environment = environment
   }

  
    ngOnInit() {
    

    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
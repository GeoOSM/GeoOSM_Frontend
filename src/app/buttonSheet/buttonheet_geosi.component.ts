import { Component, OnInit , ViewChild,NgZone,Inject} from '@angular/core';
import {take} from 'rxjs/operators';
import {MatBottomSheet, MatBottomSheetRef,MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as $ from 'jquery';


export interface DialogData {
  data: any;
}

@Component({
  selector: 'bottom-sheet-overview-geosignet-sheet',
  templateUrl: 'buttonheet_geosi.component.html',
})
export class buttonsheetGeosiComponent {

	signets = []
	typeButton

  constructor(
  	private bottomSheetRef: MatBottomSheetRef<buttonsheetGeosiComponent>,
  	@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
  	private ngZone: NgZone,
  	 private builder: FormBuilder
  	) {}


  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    console.log(event)
  }

   ngOnInit() {
    	
    	//this.typeButton = this.data['type']
    	this.signets = this.data['data']
        console.log(this.signets)
    	
    }

    selectioner(id){
        this.bottomSheetRef.dismiss(id);
    }

  

}
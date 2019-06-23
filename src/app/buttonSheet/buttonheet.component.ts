import { Component, OnInit , ViewChild,NgZone,Inject} from '@angular/core';
import {take} from 'rxjs/operators';
import {MatBottomSheet, MatBottomSheetRef,MAT_BOTTOM_SHEET_DATA} from '@angular/material';
import { FormGroup, FormControl, FormBuilder, FormArray, Validators } from '@angular/forms';
import * as $ from 'jquery';

import { extent as Extent } from 'openlayers';
import { Map } from 'openlayers';
import { proj } from 'openlayers';

export interface DialogData {
  data: any;
  type: string;
}

@Component({
  selector: 'bottom-sheet-overview-example-sheet',
  templateUrl: 'buttonheet.component.html',
})
export class buttonsheetComponent {

	layer = []
	typeButton

  constructor(
  	private bottomSheetRef: MatBottomSheetRef<buttonsheetComponent>,
  	@Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
  	private ngZone: NgZone,
  	 private builder: FormBuilder
  	) {}

 	public chooseLayer = this.builder.group({
        layer1: ["", Validators.required],
        layer2: ["", Validators.required],
        
    });


  openLink(event: MouseEvent): void {
    this.bottomSheetRef.dismiss();
    event.preventDefault();
    console.log(event)
  }

   ngOnInit() {
    	
    	this.typeButton = this.data['type']
    	this.layer = this.data['data']

    	/*for (var i = 0; i < this.data['data'].length; i++) {
    		if (this.data['data'][i].type == 'xyz' || this.data['data'][i].type == 'wms') {
    			this.layer.push(this.data['data'][i])
			}
    	}*/
    	
    	
    }

    compare(){
    	

    	var index1= this.chooseLayer.value['layer1']
    	var index2= this.chooseLayer.value['layer2']

    	var layer1= this.data['data'][index1]
    	var layer2= this.data['data'][index2]

    
    	if (layer1.bbox && layer2.bbox) {

    		var bbox1 = layer1.bbox.split(',') 

			var Amin1 = proj.transform([parseFloat(bbox1[0]),parseFloat(bbox1[1])], 'EPSG:4326', 'EPSG:3857') 
			var Amax1 = proj.transform([parseFloat(bbox1[2]),parseFloat(bbox1[3])], 'EPSG:4326', 'EPSG:3857')

			var extentData1 = Extent.boundingExtent( [Amin1,Amax1] )

			var bbox2 = layer1.bbox.split(',') 

			var Amin2 = proj.transform([parseFloat(bbox2[0]),parseFloat(bbox2[1])], 'EPSG:4326', 'EPSG:3857') 
			var Amax2 = proj.transform([parseFloat(bbox2[2]),parseFloat(bbox2[3])], 'EPSG:4326', 'EPSG:3857')

			var extentData2 = Extent.boundingExtent( [Amin2,Amax2] )

			var bool = Extent.containsExtent( extentData1,extentData2 )

			if (bool ==  false) {
					var bool = Extent.intersects( extentData1,extentData2  ) 
			}

			if (!bool) {
				alert('Impossible : les bbox des couches sont distants !')
			}else{
				this.bottomSheetRef.dismiss(this.chooseLayer.value);
			}

    	}else if (layer1.zmax && layer2.zmax && layer1.zmin && layer2.zmin) {
    		

    			if (parseFloat(layer1.zmax) > parseFloat(layer2.zmax) && parseFloat(layer1.zmin) > parseFloat(layer2.zmin)) { 
    				alert('Impossible de comparer ces deux cartes: les echelles sont distantes !')
    			}else if(parseFloat(layer1.zmax) < parseFloat(layer2.zmax) && parseFloat(layer1.zmin) < parseFloat(layer2.zmin)){ 
    				alert('Impossible de comparer ces deux cartes: les echelles sont distantes !')
    			}else{ 	
    				this.bottomSheetRef.dismiss(this.chooseLayer.value);
    			}
    	}else{
    		this.bottomSheetRef.dismiss(this.chooseLayer.value);
    	}		

    	
    }

  

}
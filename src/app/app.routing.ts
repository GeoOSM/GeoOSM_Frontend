import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { MapComponent } from './map/map.component';


const routes: Routes =[
    // { path: 'home',  component: HomeComponent },
    { path: 'map',   component: MapComponent },
    { path: '', redirectTo: 'map', pathMatch: 'full' }
];

@NgModule({ 
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  exports: [

  ],
})
export class AppRoutingModule { }
 
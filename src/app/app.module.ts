import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app.routing";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpModule } from "@angular/http";
import { HttpClientModule, HttpClient } from "@angular/common/http";
import { NgwWowModule } from "ngx-wow";

import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { HomeComponent } from "./home/home.component";
import { HeaderComponent, NgForIfEmpty } from "./header/header.component";

import { buttonsheetComponent } from "./buttonSheet/buttonheet.component";
import { buttonsheetGeosiComponent } from "./buttonSheet/buttonheet_geosi.component";
import { modalComponent } from "./modal/modal.component";
import { modalMetadata } from "./modal/modal.metadata";
import { commentComponent } from "./modal/modal.comment";
import { modalQuestion } from "./modal/question.modal";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";

import { ColorPickerModule } from "ngx-color-picker";
// https://www.npmjs.com/package/ngx-color-picker

import { cartesService } from "./service/cartes.service";
import { thematiqueService } from "./service/thematiques.service";
import { geoportailService } from "./service/geoportail.service";
import { communicationComponent } from "./service/communicationComponent.service";

import { donneFilterPipe } from "./filter/app.filter";
import { donneOptionFilterPipe } from "./filter/option.filter";
import { OrderBy } from "./filter/orderby";
import { AngularDraggableModule } from "angular2-draggable";
// https://xieziyu.github.io/angular2-draggable/#/draggable/usage/events
import { ShContextMenuModule } from "ng2-right-click-menu";
// https://www.npmjs.com/package/ng2-right-click-menu
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
// https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/angular.html:
import { ShareButtonsModule } from "@ngx-share/buttons";
// https://murhafsousli.github.io/ngx-sharebuttons/#/share-buttons-component
import { FlexLayoutModule } from "@angular/flex-layout";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from "@angular/material";
import { ThematiqueComponent } from "./composant/thematique/thematique.component";
import { CarteComponent } from "./composant/carte/carte.component";
import { CoucheThematiqueComponent } from "./composant/thematique/couche-thematique/couche-thematique.component";
import { CoucheCarteComponent } from "./composant/carte/couche-carte/couche-carte.component";
import { CoucheEnCoursComponent } from "./composant/couche-en-cours/couche-en-cours.component";
import { CaracteristiquesLieuComponent } from "./composant/caracteristiques-lieu/caracteristiques-lieu.component";
import { AddGeosignetsComponent } from "./composant/add-geosignets/add-geosignets.component";
import { FicheDescriptiveComponent } from "./composant/fiche-descriptive/fiche-descriptive.component";
import { ThematiqueCityComponent } from "./composant/thematique/thematique-city/thematique-city.component";
import { ThematiqueCityAbidjanComponent } from "./composant/thematique/thematique-city-abidjan/thematique-city-abidjan.component";
import { CarteCityComponent } from "./composant/carte/carte-city/carte-city.component";
import { RessourcesCityComponent } from "./composant/ressources/ressources-city/ressources-city.component";
import { DownloadsComponent } from "./composant/downloads/downloads.component";

@NgModule({
  exports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatBottomSheetModule,
    MatTreeModule,
  ],
})
export class DemoMaterialModule {}

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    HomeComponent,
    HeaderComponent,
    buttonsheetComponent,
    buttonsheetGeosiComponent,
    modalComponent,
    modalMetadata,
    commentComponent,
    modalQuestion,
    donneFilterPipe,
    donneOptionFilterPipe,
    NgForIfEmpty,
    OrderBy,
    ThematiqueComponent,
    CarteComponent,
    CoucheThematiqueComponent,
    CoucheCarteComponent,
    CoucheEnCoursComponent,
    CaracteristiquesLieuComponent,
    AddGeosignetsComponent,
    FicheDescriptiveComponent,
    ThematiqueCityComponent,
    ThematiqueCityAbidjanComponent,
    CarteCityComponent,
    RessourcesCityComponent,
    DownloadsComponent,
  ],
  entryComponents: [
    buttonsheetGeosiComponent,
    buttonsheetComponent,
    modalComponent,
    modalMetadata,
    commentComponent,
    modalQuestion,
    AddGeosignetsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    DemoMaterialModule,
    MatButtonModule,
    MatCheckboxModule,
    ColorPickerModule,
    HttpModule,
    ShContextMenuModule,
    CKEditorModule,
    AngularDraggableModule,
    ShareButtonsModule,
    HttpClientModule,
    FlexLayoutModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    // NgwWowModule.forRoot(),
  ],
  providers: [
    cartesService,
    thematiqueService,
    geoportailService,
    communicationComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

// ng g c composant/thematique --module=app.module.ts

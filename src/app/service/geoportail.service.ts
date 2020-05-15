import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
@Injectable()
export class geoportailService {

  results:Object[];
  loading:boolean;
  private headers: Headers = new Headers({});
  private headers_nodejs: Headers = new Headers({});
    url_prefix = environment.url_prefix

  constructor(private http:Http) { 
    this.results = [];
    this.loading = false; 
    this.headers.append('Content-Type','application/x-www-form-urlencoded');
    this.headers.append('Content-Type','application/json');
    this.headers_nodejs.append('Content-Type','application/json');
  }

   getUrl(url) {
    let promise = new Promise((resolve, reject) => {
      this.http.get(url)
        .toPromise()
        .then(
          res => {  
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  getInternalFile(word) {
    let promise = new Promise((resolve, reject) => {
      this.http.get(word,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res);
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getJsonFIle(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'geoportail/getJsonFIle/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  
  saveDraw(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/geoportail/saveDraw/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getDraw(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/geoportail/getDraw/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  
  drapeline(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/geoportail/drapeline/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  getAlti(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/geoportail/getAlti/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getUsers(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/geoportail/getUsers/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  queryNominatim(word) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = "https://nominatim.openstreetmap.org/search?q="+word+"&format=json&polygon=1&addressdetails=1";
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  formatNominatimResponse(osmtype,osmid) {
    // https://nominatim.openstreetmap.org/details.php?osmtype=R&osmid=3832073&format=json
    let promise = new Promise((resolve, reject) => {
      let apiURL = " https://nominatim.openstreetmap.org/details.php?osmtype="+osmtype+"&osmid="+osmid+"&format=json";
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  addEntite(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/addEntite/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  searchLimite(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/searchLimite/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  searchLimiteObservable(data): Observable<any>  {
    let apiURL = this.url_prefix+'/searchLimite/';
    return this.http.post(apiURL,data,{headers: this.headers})
    .pipe(
      tap((response:any) => {
      })
      );
  }

  searchLimiteInTable(data): Observable<any>  {
    let apiURL = this.url_prefix+'/searchLimiteInTable/';
    return this.http.post(apiURL,data,{headers: this.headers})
    .pipe(
      tap((response:any) => {
      })
      );
  }

  getLimiteById(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/getLimiteById/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getListLimit(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/getListLimit/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  

  getLimitById(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/getLimitById/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getPositionFromAdress(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = 'https://cuy.sogefi.cm/adressage/getPosition/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  
  getZoneInteret() {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'/getZoneInteret/';
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
 
  getPositionFromPosition(word) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = 'https://cuy.sogefi.cm:8444/'+word;
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  addCountVieuwData(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'geoportail/addCountVieuwData/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getVisitiors() {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'geoportail/getVisitiors/';
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getConfigProjet() {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'config_bd_projet/';
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
  
  analyse_spatiale(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = ''
      if(!data['geometry']){
        apiURL = this.url_prefix+'thematique/donwload/';
      }else if(data['geometry']){
        apiURL =environment.url_service+'analyse_spatiale/';
      }
      
      this.http.post(apiURL,data,{headers: this.headers_nodejs})
        .toPromise()
        .then(
          res => {  
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getPositionFromWord(word) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = 'https://cuy.sogefi.cm:8444/prend_mot/'+word;
      this.http.get(apiURL,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }

  getFeatureFromLayerById(data) {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'geoportail/getFeatureFromLayerById/';
      this.http.post(apiURL,data,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => { // Error
          reject(msg);
          }
        );
    });
    return promise;
  }
}

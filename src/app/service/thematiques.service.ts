import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
@Injectable()
export class thematiqueService {

   results:Object[];
  loading:boolean;
  private headers: Headers = new Headers({});
  url_prefix =environment.url_prefix

  constructor(private http:Http) { 
    this.results = [];
    this.loading = false; 
    this.headers.append('Content-Type','application/x-www-form-urlencoded');
    this.headers.append('Content-Type','application/json');
  }

  

  Getthematiques() {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'geoportail/getCatalogue/';
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



  GetDataQuery(url) {
    let promise = new Promise((resolve, reject) => {
     
      this.http.get(url,{headers: this.headers})
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

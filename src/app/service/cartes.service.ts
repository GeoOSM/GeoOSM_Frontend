import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';

@Injectable()
export class cartesService {

  results:Object[];
  loading:boolean;
  private headers: Headers = new Headers({});
    url_prefix = "http://adminoccitanie.geocameroun.cm/" //"http://localhost:8000/"

  constructor(private http:Http) { 
    this.results = [];
    this.loading = false; 
    this.headers.append('Content-Type','application/x-www-form-urlencoded');
    this.headers.append('Content-Type','application/json');
  }

  

  Getcartes() {
    let promise = new Promise((resolve, reject) => {
      let apiURL = this.url_prefix+'api/v1/RestFull/catalogAdminCartes/';
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

  getData(url) {
    let promise = new Promise((resolve, reject) => {
     
      this.http.get(url,{headers: this.headers})
        .toPromise()
        .then(
          res => {  
           
            resolve(res.json());
          },
          msg => {
          reject(msg);
          }
        );
    });
    return promise;
  }
  

}

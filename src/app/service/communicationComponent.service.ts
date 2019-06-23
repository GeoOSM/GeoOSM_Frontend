import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Subject }    from 'rxjs';

@Injectable()
export class communicationComponent {
    private dataObs = new Subject();
    private dataThematiques = new Subject();
    private dataCartes = new Subject();

    getData() {
        return this.dataObs;
    }

    getDataThematiques() {
        return this.dataThematiques;
    }

    getDataCartes() {
        return this.dataCartes;
    }

    updateData(data: boolean) {
        this.dataObs.next(data);
    }

    updateDataThematiques(data: boolean) {
        this.dataThematiques.next(data);
    }

    updateDataCartes(data: boolean) {
        this.dataCartes.next(data);
    }
}
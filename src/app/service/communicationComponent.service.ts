import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Subject, BehaviorSubject }    from 'rxjs';

@Injectable()
export class communicationComponent {
    private dataObs = new Subject();
    private dataThematiques = new Subject();
    private dataCartes = new Subject();
    public all_thematiques =  new BehaviorSubject([]);

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

    updateDataThematiques(data) {
        this.dataThematiques.next(data);
        this.all_thematiques.next(data)
       
    }

    updateDataCartes(data: boolean) {
        this.dataCartes.next(data);
    }

    get_thematique_by_rang(rang){
        // console.log(rang,this.all_thematiques.value )
        
        for (let index = 0; index < this.all_thematiques.value.length; index++) {
            const thematique = this.all_thematiques.value[index];
            if (thematique.id == rang) {
                return thematique
            }
        }
      
    }
}
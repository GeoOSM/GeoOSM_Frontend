import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Subject, BehaviorSubject }    from 'rxjs';
import {environment} from '../../environments/environment'
@Injectable()
export class communicationComponent {
    private dataObs = new Subject();
    private dataThematiques = new Subject();
    private dataCartes = new Subject();
    public all_thematiques =  new BehaviorSubject([]);
    public all_cartes =  new BehaviorSubject([]);

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

    updateDataCartes(data) {
        this.dataCartes.next(data);
        this.all_cartes.next(data)
    }

    get_thematique_by_rang(rang){
        
        for (let index = 0; index < this.all_thematiques.value.length; index++) {
            const thematique = this.all_thematiques.value[index];
            if (thematique.id == rang) {
                return thematique
            }
        }
    }

    get_thematique_by_id_cat(id_cat){
        
        for (let index = 0; index < this.all_thematiques.value.length; index++) {
            const thematique = this.all_thematiques.value[index];
            if (thematique.id_thematique == id_cat) {
                return thematique
            }
        }
    }

    get_sous_thematique_by_key(rang,id_sous_cat){
        var thematique = this.get_thematique_by_rang(rang)
        if (thematique['sous_thematiques']) {
            for (let index = 0; index < thematique['sous_thematiques'].length; index++) {
                const sous_thematique = thematique['sous_thematiques'][index];
                if (sous_thematique['key'] ==id_sous_cat ) {
                    return sous_thematique
                }
            }
        }else{
            return undefined
        }
       
    }

    get_carte_by_rang(rang){
        
        for (let index = 0; index < this.all_cartes.value.length; index++) {
            const carte = this.all_cartes.value[index];
            if (carte.id == rang) {
                return carte
            }
        }
    }

    get_sous_carte_by_key(rang,id_sous_cat){
        var carte = this.get_carte_by_rang(rang)
        if (carte['sous_cartes']) {
            for (let index = 0; index < carte['sous_cartes'].length; index++) {
                const sous_carte = carte['sous_cartes'][index];
                if (sous_carte['key'] ==id_sous_cat ) {
                    return sous_carte
                }
            }
        }else{
            return undefined
        }
       
    }

    get_couche_by_key_and_id_cat(id_cat,key_couche){
        var thematique = this.get_thematique_by_id_cat(id_cat)
        var response;
        if (thematique['sous_thematiques']) {
            for (let j = 0; j < thematique['sous_thematiques'].length; j++) {
                const element = thematique['sous_thematiques'][j];
                for (let index = 0; index < thematique['sous_thematiques'][j]['couches'].length; index++) {
                    const couche = thematique['sous_thematiques'][j]['couches'][index];
                    if (couche['key_couche'] == key_couche) {
                        var response =  couche
                    }
                }
            }
        }else{
            for (let index = 0; index < thematique['couches'].length; index++) {
                const couche = thematique['couches'][index];
                if (couche['key_couche'] == key_couche) {
                    var response =  couche
                }
            }
        }

        if (response) {
            return response
        }else{
            return
        }
        
    }
    url_frontend = environment.url_frontend
    getUrlShareFeature(feature:any):string{
        var donne = {}
		for (var index = 0; index < feature.length; index++) {
			if (feature[index]['type'] == 'share') {
				donne = feature[index]
			}
		}

		if (donne["index"] == "share_osm") {
			var url_share = this.url_frontend + '/map?share=feature&type=osm&path=' + donne["val"]
		} else if (donne["index"] == "share_limites") {
			var url_share = this.url_frontend + '/map?share=limites&path=' + donne["val"]
		} else if (donne["index"] == "share_feature") {
			var url_share = this.url_frontend + '/map?share=feature&type=feature&path=' + donne["val"]
        }
        return url_share;
    }
}
# GeOsm Frontend - Angular v5

## Pré requis
Avant de continuer, vous devez avoir installé **Node JS**

## Installation

##### 1. Déploiement
```sh
$ cd GeoOSM_Frontend
$ npm i
```
pour tester le projet :
```sh
$ ng serve
```
et le projet sera lancé sur **localhost:4200**
##### 2. Modification du projet
Dans le fichier **/src/app/map/map.component.ts**:

url_prefix: "**www.serveur_php.geoosm**",
url_frontend:"http://localhost:4200",
url_service:adresse à laquelle vous allez déployer le projet frontend,
global_logo:"path/logo/appli",
drapeau:"path/drapeau",
nom:"nom du projet",
indicatif_pays:"identifiant pour la recherche nominatim",
pojet_nodejs:"projet dans node js",
primaryColor:"coouleur principal n'importe quel format",
removeFonction:['itineraire'] fonctionnalité à retirer,
default_language:"fr",
avaible_language:['fr',"en"],
projetOsmCm:false, projet de l'initialtive d'OSM Cameroun
defaultLayers:[],
production: false

##### 3. Changer vos couleurs et logo
##### 3. "BUild" votre projet
Quand vous finissez de customiser votre projet:
```sh
$ npx ng build
```
Et dans le dossier **dist**, vous trouverez votre projet Web avec un **index.html** prêt !
##### 4. Configurer Apache ou Nginx pour déployer votre projet sur le net



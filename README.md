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
- Modifier la variable **url_prefix** avec votre "**www.serveur_php.geoosm**"
- Modifier la variable **url_frontend** avec l'adresse à laquelle vous allez déployer le projet frontend

Dans tous les fichiers du dossier **/src/app/service/**:
- Modifier la variable **url_prefix** avec votre "**www.serveur_php.geoosm**"
- Modifier la variable **apiURL** avec votre "**www.serveur_nodejs+python.geoosm**"

##### 3. Changer vos couleurs et logo
##### 3. "BUild" votre projet
Quand vous finissez de customiser votre projet:
```sh
$ npx ng build
```
Et dans le dossier **dist**, vous trouverez votre projet Web avec un **index.html** prêt !
##### 4. Configurer Apache ou Nginx pour déployer votre projet sur le net



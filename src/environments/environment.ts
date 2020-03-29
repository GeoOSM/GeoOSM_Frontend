// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// export const environment = {
//   url_prefix: "http://adminf.geocameroun.cm/",
//   url_frontend:"http://portailf.geocameroun.cm",
//   url_service:"http://servicef.geocameroun.cm/",
//   global_logo:"assets/images/Pays/MALI.svg",
//   indicatif_pays:"fr",
//   pojet_nodejs:"france",
//   primaryColor:"#023f5f",
//   default_language:"fr",
//   avaible_language:['fr',"en"],
//   production: false
// };
// nom_file: "http://servicef.geocameroun.cm//var/www/geosm/analyse/Banque.gpkg"
export const environment = {
  url_prefix: "http://adminf.geocameroun.cm/",
  url_frontend:"http://localhost:4200",
  url_service:"http://servicef.geocameroun.cm/",
  global_logo:"",
  drapeau:"",
  nom:"",
  indicatif_pays:"fr",
  pojet_nodejs:"france",
  primaryColor:"#1F8FEA",
  removeFonction:['itineraire'],
  default_language:"fr",
  avaible_language:['fr',"en"],
  projetOsmCm:false,
  defaultLayers:[],
  production: false
};

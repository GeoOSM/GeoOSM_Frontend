#! /usr/bin/env node
var http = require('http');
var https = require('https'); 
var fs = require("fs");
var privateKey  = fs.readFileSync('/home/admin237/cuy.sogefi.cm.key', 'utf8');
var certificate = fs.readFileSync('/home/admin237/cuy.sogefi.cm.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var unrar = require("node-unrar-js");
var express = require('express');
var ogr2ogr = require('ogr2ogr');
var BodyParser = require('body-parser');
var zip = new   require('node-zip')();
var cors = require('cors');
var {PythonShell} = require('python-shell')
// #https://www.npmjs.com/package/python-shell
var app = express();
var MBTiles = require('mbtiles');
const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'postgres',
  host: '217.70.189.38',
  database: 'geocameroun3',
  password: 'postgres237',
  port: 5432,
})

var multer  = require('multer')
// https://github.com/expressjs/multer#memorystorage npm install --save multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/geocameroun_admin/public/assets/pdf/')
  },
  filename: function (req, file, cb) { 
  	 var extension = file.originalname.split('.')[file.originalname.split('.').length-1]
  	 var name = file.originalname.replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.'+extension
  	 var nom = name.replace(/ /g,'_')
  	
    cb(null, name )
  }
})

var storage_mbtiles = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, '/var/www/smartworld/raster/')
	},
	filename: function (req, file, cb) { 
		 var extension = file.originalname.split('.')[file.originalname.split('.').length-1]
		 var name = file.originalname.replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.'+extension
		 var nom = name.replace(/ /g,'_')
		
	  cb(null, name )
	}
  })
var upload = multer({ storage: storage })
var upload_raster = multer({ storage: storage_mbtiles })


app.use(cors());
app.use(BodyParser.json());

app.use(BodyParser.urlencoded({ extended: true }));

var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200
}



var dir_project = '/var/www/cuy/public/assets/nodejs/'
var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth() + 1;
var curr_year = d.getFullYear();


app.get('/importation/*', cors(corsOptions), function (req, res) {

	url = req.params[0]
	var index = url.indexOf("/")
	var extention = url.slice(0, index)
	var lien = url.slice(index)


	if (extention.toLowerCase() == 'rar') {
		console.log(extention, lien)
		var extractor = unrar.createExtractorFromFile(lien, "/home/admin237/unrar/");
		var files = extractor.extractAll();

		if (files[0].state == 'SUCCESS') {
			for (var i = 0; i < files[1].files.length; i++) {
				if (files[1].files[i].fileHeader.name.indexOf(".shp") != -1) {

					var shapefile = ogr2ogr('/home/admin237/unrar/' + files[1].files[i].fileHeader.name)
						.format('GeoJSON')
						.project("EPSG:4326")
						.skipfailures()
						.stream()

					shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {


						fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
							if (err) throw err;
							// console.log(data);
							res.send(data)
						});

					}))



				}
			}

		}
	} else if (extention.toLowerCase() == 'geojson' || extention.toLowerCase() == 'json') {

		fs.readFile(lien, { encoding: 'utf-8' }, (err, data) => {
			if (err) throw err;
			res.send(data)
		});

	} else if (extention.toLowerCase() == 'zip') {
		console.log(extention, lien)
		var shapefile = ogr2ogr(lien)
			.format('GeoJSON')
			.project("EPSG:4326")
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {

			fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
				if (err) throw err;
				// console.log(data);
				res.send(data)
			});

		}))

	} else {

		var shapefile = ogr2ogr(lien)
			.format('GeoJSON')
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {

			fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
				if (err) throw err;
				res.send(data)
			});

		}))

	}


})

app.get('/shape/:datapoint/:datapolygon/:dataline', cors(corsOptions), function (req, res) {

	//var type = 'DXF'
	var type = 'ESRI Shapefile'
	//res.send(req.params.datapoint + ',' + req.params.datapolygon + ','+ req.params.dataline)
	var shapefile = ogr2ogr(req.params.datapoint)
		.format(type)
		.skipfailures()
		.stream()

	shapefile.pipe(fs.createWriteStream(dir_project + 'DessinPoint.zip').on('finish', function () {


		var shapefile = ogr2ogr(req.params.datapolygon)
			.format(type)
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream(dir_project + 'DessinPolygone.zip').on('finish', function () {


			var shapefile = ogr2ogr(req.params.dataline)
				.format(type)
				.skipfailures()
				.stream()

			shapefile.pipe(fs.createWriteStream(dir_project + 'DessinLine.zip').on('finish', function () {



				res.send("ok")



			}))

		}))

	}))
})

app.get('/dxf/:datapoint/:datapolygon/:dataline', cors(corsOptions), function (req, res) {

	var type = 'DXF'
	var shapefile = ogr2ogr(req.params.datapoint)
		.format(type)
		.skipfailures()
		.destination(dir_project + 'Point.dxf')

	shapefile.exec(function (er, data) {
		if (er) console.error(er)

		var shapefile = ogr2ogr(req.params.datapolygon)
			.format(type)
			.skipfailures()
			.destination(dir_project + 'Polygone.dxf')

		shapefile.exec(function (er, data) {
			if (er) console.error(er)

			var shapefile = ogr2ogr(req.params.dataline)
				.format(type)
				.skipfailures()
				.destination(dir_project + 'Line.dxf')

			shapefile.exec(function (er, data) {
				if (er) console.error(er)
				res.send('ok')

			})

		})
	})

})

app.get('/tiles_geocameroun/:folder/:z/:x/:y.*', function(req, res) {
    
    var mbtilesLocation = '/home/admin237/server_tiles/mbtiles/'+ req.params['folder']+'/tiles.mbtiles';
    new MBTiles(mbtilesLocation, function(err, mbtiles) {
     
    var extension = req.params[0];
    switch (extension) {
      case "png": {
        mbtiles.getTile(req.params['z'], req.params['x'], req.params['y'], function(err, tile, headers) {
          if (err) {
            res.status(404).send('Tile rendering error: ' + err + '\n');
          } else {
            res.header("Content-Type", "image/png")
            res.send(tile);
          }
        });
        break;
      }
      case "grid.json": {
        mbtiles.getGrid(req.params['z'], req.params['x'], req.params['y'], function(err, grid, headers) {
          if (err) {
            res.status(404).send('Grid rendering error: ' + err + '\n');
          } else {
            res.header("Content-Type", "text/json")
            res.send(grid);
          }
        });
        break;
      }
    }
  
  });
});


app.get('/generateAllShapeFromOsmBuilder/',cors(corsOptions),function (req,res) {

	const pool = new Pool({
		user: 'postgres',
		host: '217.70.189.38',
		database: 'geocameroun3',
		password: 'postgres237',
		port: 5432,
	  })

	pool.query('SELECT * from public.categorie where sql is not null', (err, response) => {
		pool.end()
		
		var query = response.rows
		var i = 0

		/*var shapefile = ogr2ogr('PG:host=217.70.189.38 port=5432 user=osm dbname=geocameroun3 password=osm237')
		.format('ESRI Shapefile')
		.options(["--config", "CPL_DEBUG", "ON","-sql",'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = 1 and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( highway = \'unclassified\' ) ' ])
		.project('EPSG:4326')
		.timeout(60000)
		.onStderr(function(data) {
			console.log('azerty',data);
		})
		.skipfailures()
		.stream();*/
		
		var executeOgr2ogr =function (i) {
			
				var type = 'ESRI Shapefile'
				
				var shapefile = ogr2ogr('PG:host=217.70.189.38 port=5432 user=osm dbname=geocameroun3 password=osm237')
					.format(type)
					.options(["--config", "CPL_DEBUG", "ON","-sql",query[i].sql])
					.project('EPSG:4326')
					.timeout(60000)
					.onStderr(function(data) {
						//console.log('azerty',data);
					})
					.skipfailures()
					.stream();
				
				var nom_shp = query[i].nom_cat.replace(/[^a-zA-Z0-9]/g,'_')+'_'+query[i].sous_thematiques+'_'+query[i].key_couche+'_'+query[i].id_cat
				console.log(i)
				shapefile.pipe(fs.createWriteStream('/var/www/smartworld/gpkg/' +nom_shp +'.zip').on('finish', function () {
					
					if (i == query.length-1) {
						res.send("ok")
					}else{
						i++
						executeOgr2ogr(i)
					}
					 
				}))
			}

			if(query.length > 0){
				executeOgr2ogr(i)
			}else{
				res.send("ok")
			}
			
	})
})


app.get('/generateShapeFromOsmBuilder/:id_cat/:addtowms',cors(corsOptions),function (req,res) {
	
	const pool = new Pool({
		user: 'postgres',
		host: '217.70.189.38',
		database: 'geocameroun3',
		password: 'postgres237',
		port: 5432,
	  })

		pool.query('SELECT * from public.categorie where id_cat = '+ req.params["id_cat"] , (err, response) => {
			pool.end()
			
			var query = response.rows[0]

			var type = 'ESRI Shapefile'
			
			var shapefile = ogr2ogr('PG:host=217.70.189.38 port=5432 user=osm dbname=geocameroun3 password=osm237')
				.format(type)
				.options(["--config", "CPL_DEBUG", "ON","-sql",query.sql])
				.project('EPSG:4326')
				.timeout(60000)
				.onStderr(function(data) {
					//console.log('azerty',data);
				})
				.skipfailures()
				.stream();
			
			var nom_shp = query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_')+'_'+query.sous_thematiques+'_'+query.key_couche+'_'+query.id_cat
			
			shapefile.pipe(fs.createWriteStream('/var/www/smartworld/gpkg/' +nom_shp +'.zip').on('finish', function () {
				if (req.params["addtowms"] == 'false') {
					res.send({
						'status' : 'ok',
						'addtowms':false
					}) 
				} else if( req.params["addtowms"] == 'true') {
					
					let options = {
						mode: 'text',
						pythonPath: 'python',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: ["/var/www/smartworld/smartworld4.qgs","/var/www/smartworld/gpkg/" +nom_shp +".zip", query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_')]
					};

					PythonShell.run('/var/www/smartworld/smartworld.py', options, function (err, results) {
						
						if (err) throw err;
						
						
						if( Array.isArray(results) && results[0] == 'ok' ){
							
							const pool1 = new Pool({
								user: 'postgres',
								host: '217.70.189.38',
								database: 'geocameroun3',
								password: 'postgres237',
								port: 5432,
							})
							var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map=/var/www/smartworld/smartworld4.qgs'
							console.log(query.sous_thematiques,'oui ou non')
							if (query.sous_thematiques) { 
								var query_update = 'UPDATE public."couche-sous-thematique" SET url= \' '+ url +'\', identifiant= \''+ query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query.key_couche
							} else {
								var query_update = 'UPDATE public."couche-thematique" SET url= \' '+ url +' \', identifiant= \''+ query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query.key_couche
							}

							//console.log(query_update)
							pool1.query( query_update , (err, response) => {
								pool1.end()
								//console.log('sql =',response, 'results: ', results,query_update)
								res.send({
									'status' : 'ok',
									'addtowms':true,
									'identifiant':query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_'),
									'projet_qgis':url
								})
							})

						}else{
							
							res.send(results)
						}
						
					});
				}	
			
			}))
			
			
		})


})


app.post('/download', cors(corsOptions), upload.single('file'), function (req, res, next) {
	var file = req.file
	var extension = file.filename.split('.')[file.filename.split('.').length-1]
  	 var nom = file.filename

	res.send({'status':'ok','file':'assets/pdf/'+nom})
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})

app.post('/downloadRaster', cors(corsOptions), upload_raster.single('file'), function (req, res, next) {
	var file = req.file
	var extension = file.filename.split('.')[file.filename.split('.').length-1]
  	 var name = file.filename
	   var nom = name
	   var file = '/var/www/smartworld/raster/'+nom
	   //console.log(1,req.body)
	   let options = {
			mode: 'text',
			pythonPath: 'python',
			pythonOptions: ['-u'], // get print results in real-time
			args: ["/var/www/smartworld/smartworld4.qgs",file, nom.replace(/[^a-zA-Z0-9]/g,'_')]
		};
		
	PythonShell.run('/var/www/smartworld/smartworld_add_raster.py', options, function (err, results) {
		
		if (err) throw err;
		//console.log( results,3)
		if( Array.isArray(results) && results[0] == 'ok' ){
			var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map=/var/www/smartworld/smartworld4.qgs'
			
				res.send({
					'status' : 'ok',
					'identifiant':nom.replace(/[^a-zA-Z0-9]/g,'_'),
					'projet_qgis':url,
					'url_raster':file
				})

		}else{
			
			res.send(results)
		}
	})

	
 
})




var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(3000);
httpsServer.listen(8443);
// app.listen(3000)



//'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = 1 and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( highway = \'unclassified\' ) '


//'"select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = 1 and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( highway = \'unclassified\' ) "'





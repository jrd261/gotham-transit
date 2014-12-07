var config = require('./config.json');
var express = require('express');
var http = require('http');
var app = express();
var path = require('path');
var aws = require('aws-sdk');
var xml2js = require('xml2js');
var md5 = require('MD5');
var bodyParser = require('body-parser');
var db = new aws.DynamoDB(config.DynamoDBOptions);


/* App Configuration */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'jade');


/* Middleware */
app.use('/static', express.static(__dirname + '/public'));
app.use(bodyParser.json());


/* Initialize In-Memory Cache */
var cache = {
	timestamp: 0,
	lines: [],
};


/* Create Table If It Doesn't Exist */
db.describeTable({TableName: "gothamTransitFavorites"}, function(error, data){
	if(!error){
		return
	}
	var options = {
		"TableName": "gothamTransitFavorites",
		"AttributeDefinitions": [{
			"AttributeName": "id",
			"AttributeType": "S"
		}],
		"KeySchema": [{
			"AttributeName": "id",
			"KeyType": "HASH"
		}],
		"ProvisionedThroughput": {
			"ReadCapacityUnits": 1,
			"WriteCapacityUnits": 1
		}
	};
	db.createTable(options, function(error, data){});
});


/* Refresh MTA Status */
function refreshStatus(callback){
	var currentTimestamp = new Date().getTime();
	if(currentTimestamp - cache.timestamp < 5 * 60 * 1000){
		callback(null);
		return
	}
	console.log('Refreshing MTA Status')
	var options = {
		hostname: 'web.mta.info',
		path: '/status/serviceStatus.txt'
	}
	var payload = '';
	function onResponseData(chunk){
		payload += chunk;
	}
	function onResponseEnd(){
		xml2js.parseString(payload, onParseEnd)
	}
	function onParseEnd(error, raw){
		if(error){
			callback(error);
			return
		}
		onParseSuccess(raw)
	}
	function onParseSuccess(raw){
		var service = raw.service;
		var lines = [];
		var stypes = ['BT', 'LIRR', 'MetroNorth', 'bus', 'subway'];
		for (var i=0; i<stypes.length; i++){
			var line = service[stypes[i]][0].line;
			for(var j=0; j<line.length; j++){
				lines.push({
					id: md5(line[j].name[0]),
					name: line[j].name[0].toLowerCase(),
					type: stypes[i].toLowerCase(),
					time: service.timestamp[0],
					status: line[j].status[0].toLowerCase(),
					text: line[j].text[0],
				});
			}
		}
		console.log('MEA Status Refreshed')
		cache.lines = lines;
		callback(null);
	}
	function onRequestStart(response){
		response.on('data', onResponseData);
		response.on('end', onResponseEnd);
	}
	function onRequestError(error){
		callback(error);
	}
	var request = http.request(options, onRequestStart);
	request.on('error', onRequestError)
	request.end();
}


/* Endpoints */
app.get('/', function(request, response){
	response.render('index');
});
app.get('/status', function(request, response){
	refreshStatus(function(error){
		if(error){
			console.log(error);
			response.status(500);
			return
		}
		response.json(cache.lines);
	});
});
app.get('/favorites/:id', function(request, response){
	var id = request.param('id');
	if(!id){
		return response.json([]);
	}
	Favorites.get(id, function(error, favorites){
		console.log(error)
		console.log(favorites)
		if(error){
			return response.json([]);
		}
		return response.json(favorites.items);
	});
});
app.post('/favorites/:id', function(request, response){
	var id = request.param('id');
	if(!id){
		return response.json([]);
	}
	var items = request.body;
	if(!items){
		items = [];
	}
	var favorites = new Favorites({id:id, items:items});
	favorites.put(function(error){
		console.log(error)
		if(error){
			return response.json([]);
		}
		return response.json(items);
	});
});


/* Favorites Model */
function Favorites(options){
	this.id = options.id || 'default';
	this.items = options.items || [];
}
Favorites.get = function(id, callback){
	var options = {
		TableName: 'gothamTransitFavorites',
		Key: {
			id: {
				S: id
			}
		}
	}
	db.getItem(options, function(error, data){
		if(error){
			return callback(error);
		}
		if(!data.Item){
			return callback(true);
		}
  		return callback(null, new Favorites(JSON.parse(data.Item.favorites.S)));
	});
}
Favorites.prototype.put = function(callback){
	var options = {
		TableName: 'gothamTransitFavorites',
		Item: {
			id: {S: this.id},
			favorites: {S: JSON.stringify({
				id: this.id,
				items: this.items
			})}
		}
	}
	db.putItem(options, callback);
}


/* Launch Application */
http.createServer(app).listen(app.get('port'));
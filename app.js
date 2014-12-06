var express = require('express');
var http = require('http');
var app = express();
var path = require('path');
var aws = require('aws-sdk');
var xml2js = require('xml2js');
//var $ = require('node-jquery');
//var db = aws.DynamoDB({region: 'us-east-1'});
var passport = require('passport');
var session = require('express-session')

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname , 'views'));
app.set('view engine', 'jade');

app.use('/static', express.static(__dirname + '/public'));

app.use(session({secret: 'I Am Batman.'}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res){
	res.render('index');
});

app.get('/status', function(req, res){
	var options = {
		hostname: 'web.mta.info',
		path: '/status/serviceStatus.txt'
	};
	var body = '';
	var req = http.request(options, function(res_){
		res_.on('data', function(chunk){
			body += chunk;
		});
		var data = {};
		res_.on('end', function(){
			xml2js.parseString(body, function(err, raw){
				var service = raw.service;
				data.time = service.timestamp[0];
				data.code = service.responsecode[0];
				var stypes = ['BT', 'LIRR', 'MetroNorth', 'bus', 'subway'];
				data.lines = [];
				for (var i=0; i<stypes.length; i++){
					var line = service[stypes[i]][0].line;
					for(var j=0; j<line.length; j++){
						var item = line[j];
						var d = {};
						d.name = item.name[0];
						d.type = stypes[i]
						d.time = item.Date[0] + item.Time[0];
						d.status = item.status[0];
						d.text = item.text[0];
						data.lines.push(d);
					}
				}
				res.json(data);
			});

		});
	}).end();
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
	console.log('PATH IS ' + __dirname);
});



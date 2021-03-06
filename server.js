const express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require('redis');

var redisClient = redis.createClient(6379, "127.0.0.1");

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('pages/heatmap-detailed', {"lat": req.query.lat,
        "lng": req.query.lng,
        "zoom": req.query.zoom});
});

app.get('/globe', function(req, res) {
	res.render('pages/globe');
});

app.get('/heatmap-basic', function(req, res) {
	res.render('pages/heatmap-basic');
});

app.get('/heatmap-detailed', function(req, res) {
	res.render('pages/heatmap-detailed',
	{"lat": req.query.lat,
	"lng": req.query.lng,
	"zoom": req.query.zoom});
});

app.get('/heatmap-detailed/clear-history', function (req, res) {
	coordinatesHistory = [];
	res.render('pages/heatmap-detailed', {
				   "lat": req.query.lat,
				   "lng": req.query.lng,
				   "zoom": req.query.zoom
			   });
});

app.get('/chart', function(req, res) {
	res.render('pages/chart');
});

const maxCoordinates = 5000;
let coordinatesHistory = [];

coordinatesHistory.push = function () {
	if (this.length >= maxCoordinates) {
		this.shift();
	}
	return Array.prototype.push.apply(this, arguments);
}

io.sockets.on("connection",function(socket){
	socket.emit("history",coordinatesHistory);
})

// When a message comes from Redis, send down websocket to client
redisClient.on('message', function(channel, message) {	
	var coord = JSON.parse(message);
	coordinatesHistory.push(coord)
	io.emit('message', coord);
});

// subscribe to listen to events from Redis Pub/Sub channel
redisClient.on("ready", function () {		
	redisClient.subscribe("loc2");
});

// start, either on the Beanstalk port, or 3000 for local development
var port = process.env.PORT || 3000;
http.listen(port, function() {
	console.log('Server listening on port ' + port);
});
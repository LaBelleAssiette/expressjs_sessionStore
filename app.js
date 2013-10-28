/*

*/

var request = require('request'),
async = require('async'),
exec = require('child_process').exec;

var REQUEST_TIME = 1000,
REQUEST_CONCURRENCY = 5;

var jar = [], mongo, mongodb, redis;

function print(type, d) {
	var elaspe = (new Date()- d) / 1000;
	console.log('[ ' + type + ' ] ' + Math.round(REQUEST_TIME / elaspe) + ' req/s');
}

for(var i = 0; i <= 1000; i++) {
	jar.push(request.jar());
}

mongo = exec('node connect-mongo.js');
mongodb = exec('node connect-mongodb.js');
redis = exec('node connect-redis.js');
memorystore = exec('node memorystore.js');

async.waterfall([
	function (nextStore) {
		var d = new Date();
		async.times(REQUEST_CONCURRENCY, function (nc, nextConcurrency) {
			async.timesSeries(REQUEST_TIME / REQUEST_CONCURRENCY, function (n, next) {
				var r = request.defaults({jar: jar[n]});
				r('http://localhost:8801/login', function () {
					r('http://localhost:8801/', function (err, response, body) {
						next(null);
					});
				});
			}, function () {
				nextConcurrency(null);
			});
		}, function () {
			print('Connect-mongo', d);
			nextStore(null);
		});
	},
	function (nextStore) {
		var d = new Date();
		async.times(REQUEST_CONCURRENCY, function (nc, nextConcurrency) {
			async.timesSeries(REQUEST_TIME / REQUEST_CONCURRENCY, function (n, next) {
				var r = request.defaults({jar: jar[n]});
				r('http://localhost:8802/login', function () {
					r('http://localhost:8802/', function (err, response, body) {
						next(null);
					});
				});
			}, function () {
				nextConcurrency(null);
			});
		}, function () {
			print('Connect-mongodb', d);
			nextStore(null);
		});
	},
	function (nextStore) {
		var d = new Date();
		async.times(REQUEST_CONCURRENCY, function (nc, nextConcurrency) {
			async.timesSeries(REQUEST_TIME / REQUEST_CONCURRENCY, function (n, next) {
				var r = request.defaults({jar: jar[n]});
				r('http://localhost:8803/login', function () {
					r('http://localhost:8803/', function (err, response, body) {
						next(null);
					});
				});
			}, function () {
				nextConcurrency(null);
			});
		}, function () {
			print('Connect-redis', d);
			nextStore(null);
		});
	},
	function (nextStore) {
		var d = new Date();
		async.times(REQUEST_CONCURRENCY, function (nc, nextConcurrency) {
			async.timesSeries(REQUEST_TIME / REQUEST_CONCURRENCY, function (n, next) {
				var r = request.defaults({jar: jar[n]});
				r('http://localhost:8804/login', function () {
					r('http://localhost:8804/', function (err, response, body) {
						next(null);
					});
				});
			}, function () {
				nextConcurrency(null);
			});
		}, function () {
			print('MemoryStore', d);
			nextStore(null);
		});
	}
], function () {
	mongo.kill();
	mongodb.kill();
	redis.kill();
	memorystore.kill();
	process.exit(1);
});

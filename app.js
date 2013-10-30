var request = require('request'),
program = require('commander'),
async = require('async'),
exec = require('child_process').exec;

require('http').globalAgent.maxSockets = 4086;

var jar = [], mongo, mongodb, redis;

function print(type, d) {
	var elaspe = (new Date()- d) / 1000;
	console.log('[' + type + ']\t' + Math.round(REQUEST_TIME / elaspe) + ' req/s');
}

program.version('0.0.1').option('-n [number]', 'Number of requests to perform').option('-c [NUMBER]', 'Number of multiple requests to make at a time').parse(process.argv);

var REQUEST_TIME = program.N || 1000,
REQUEST_CONCURRENCY = program.C || 5;

console.log('* Run %d requests / %d at a time', REQUEST_TIME, REQUEST_CONCURRENCY);

for(var i = 0; i <= REQUEST_TIME; i++) {
	jar.push(request.jar());
}

mongo = exec('node connect-mongo.js');
mongodb = exec('node connect-mongodb.js');
redis = exec('node connect-redis.js');
memorystore = exec('node memorystore.js');
console.log('* Servers started, begin benchmark');

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
			print('  Connect-mongo  ', d);
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
			print(' Connect-mongodb ', d);
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
			print('  Connect-redis  ', d);
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
			print('   MemoryStore   ', d);
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

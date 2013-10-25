var express = require('express');
var signature = require("cookie-signature");
var MongoStore = require('connect-mongodb');

var Db = require('mongodb').Db,
Server = require('mongodb').Server,
server_config = new Server('localhost', 27017, {auto_reconnect: true, native_parser: true}),
db = new Db('express_connect-mongodb', server_config, {});

var PORT = 8802,
SECRET = 'mysecretkey';

var app = express();

app.use(express.cookieParser());
app.use(express.session({
	secret: SECRET,
	store: new MongoStore({db: db})
}));

app.get('/login', function (req, res) {
	req.session.name = 'connect-mongo';
	req.session.age = Math.round(Math.random() * 100);
	res.redirect('/');
});

app.get('/', function (req, res) {
	if (req.session.name) {
		res.send('s:' + signature.sign(req.sessionID, SECRET));
	} else {
		res.send('No session')
	}
});

app.listen(PORT, function () {
	console.log('Server ready on ' + PORT);
});

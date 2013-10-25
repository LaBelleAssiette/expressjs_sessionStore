var express = require('express');
var signature = require("cookie-signature");
var MongoStore = require('connect-mongo')(express);

var PORT = 8801,
SECRET = 'mysecretkey';

var app = express();

app.use(express.cookieParser());
app.use(express.session({
	secret: SECRET,
	store: new MongoStore({
		db: 'express_connect-mongo'
	})
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

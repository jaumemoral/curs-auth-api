var express = require('express');
var basicAuth = require('basic-auth');
var app = express();
var twoFactor = require('node-2fa');
var bodyParser = require('body-parser')

var secrets={};

var auth = function (req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  };

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  };

  if ((user.name === 'jaume' || user.name === 'joan') && user.pass === 'bar') {
    return next();
  } else {
    return unauthorized(res);
  };
};

// Aixo es per poder tenir parmetres via POST
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.get('/', auth, function (req, res) {
  res.send('Hola '+basicAuth(req).name+'<form action="/secret" method="post"><input type="submit" value="genera"></form><br><a href="/verify">Verifica</a>');
});

app.post('/secret', auth, function (req, res) {  
  var newSecret=twoFactor.generateSecret({name: 'App curs REST', account: basicAuth(req).name});
  secrets[basicAuth(req).name] = newSecret;
  res.send ('<h1>Ok</h1><img src="'+newSecret.qr+'"/>')
});

app.get('/verify', auth, function (req, res) {  
  res.send ('<form action="/verify" method="post"><input type="text" name="token"><input type="submit"></form>')
});

app.post('/verify', auth, function (req, res) {      
  var ok = twoFactor.verifyToken(secrets[basicAuth(req).name].secret, req.body.token);
  if (ok)
  	res.send ('Token '+req.body.token+ ' OK');
  else 
  	res.send ('Token '+req.body.token+ ' KO');
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
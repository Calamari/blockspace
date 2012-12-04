/*jslint node: true */
"use strict";

var express = require('express'),
    app     = express();

app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser());
app.use(express.methodOverride());

// setup asset pipeline
app.use(require('connect-assets')());
js.root  = 'javascripts';
css.root  = 'stylesheets';

app.get('/', function(req, res) {
  res.render('index.ejs');
});

app.listen(8124);
console.log("server started on localhost:8124");

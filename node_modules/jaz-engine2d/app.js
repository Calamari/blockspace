"use strict";

var express   = require('express'),
    app       = express.createServer(),
    util      = require('util'),
    findit    = require('findit'),
    jaz       = require('jaz-toolkit');

/**
 * Gets the config for actual environment
 */
app.__defineGetter__('config', function() {
  return require(__dirname + '/config/config.js')[process.env['environment']];
});


app.isStarted = false;
app._startQueue = [];
app.onStart = function(cb) {
  if (app.isStarted) {
    cb(app);
  } else {
    app._startQueue.push(cb);
  }
};

app._started = function() {
  app.isStarted = true;
  app._startQueue.forEach(function(cb) {
    cb(app);
  });
};


// run all initializers
function loadInitializers(cb) {
  util.puts('Starting initializers.');
  var files = findit.sync(__dirname + '/initializers'),
      i     = 0;

  checkNextFile();
  function checkNextFile() {
    if (i >= files.length) { return cb(); }
    require(files[i])(app, function next(err) {
      if (err) {
        util.puts("ERROR: Initializer " + files[i] + " did not run properly.");
        throw err;
        process.exit();
      } else {
        ++i;
        checkNextFile();
      }
    }, function wait() {
      if (i == files.length-1) {
        util.puts("ERROR: Initializer " + files[i] + " was last and still tried to wait.");
        process.exit();
      } else {
        files.push(files[i]);
        ++i;
        checkNextFile();
      }
    });
  }
}
loadInitializers(function() {
  require(__dirname + '/configure')(app);

  app.get('/', function(req, res) {
    res.render('index.ejs', {});
  });

  app._started();
});

module.exports = app;

/**
 TODOs:
  offer a commandline interface through REPL
  check if sass gem can be imported into npm install procedure
**/

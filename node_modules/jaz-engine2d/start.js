#!/usr/local/bin/node

// default environment is development
process.env['environment'] = process.env['environment'] || 'development';
process.env['TMP'] = __dirname + '/tmp/'

var app  = require('./app.js'),
    util = require('util');

app.onStart(function() {
  app.listen(app.config.server.port, app.config.server.host);
  util.puts('Starting Server on ' + app.config.server.host + ':' + app.config.server.port);

  // Examples for socket connections at the moment
  // app.emitSocket('news', { hallo: "Du!", conns: app.socketConnections });
  // app.onSocket('test', test);
  // app.offSocket('test', test);
});

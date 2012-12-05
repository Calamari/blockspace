var express        = require('express'),
    connectAssets  = require('connect-assets');

module.exports = function(app) {
  app.configure(function() {
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.logger());

    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/libs'));

    app.set('views', __dirname + '/views');

    app.use(app.router);
  });

  app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function() {
    // TODO: this has to be done further above (not again down here)
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
  });
};

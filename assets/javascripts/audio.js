/*globals Base, Vector */
/*
  Clone after completely buffered: http://phoboslab.org/log/2011/03/multiple-channels-for-html5-audio
 */
;(function(win, doc, undef) {
  "use strict";

  var audios = {},
      AudioLoader = function(file, cb) {
        console.log("LOAD", file, audios[file]);
        if (!audios[file]) {
          var element = _createTag(file, ['mp3', 'ogg']);
          element.addEventListener('canplaythrough', function(ev) {
            audios[file].loaded = true;
            audios[file].clones.forEach(function() {
              cb(audios[file].element.cloneNode(true));
            });
            audios[file].clones = [];
          }, false);
          audios[file] = {
            element: element,
            loaded: false,
            clones: []
          };
        } else {
          if (audios[file].loaded) {
            cb(audios[file].element.cloneNode(true));
          } else {
            audios[file].clones.push(cb);
          }
        }
      },
      _createTag = function(file, types) {
        var element = doc.createElement('audio'),
            source;
        types.forEach(function(type) {
          source = doc.createElement('source');
          source.src = file + '.' + type;
          element.appendChild(source);
        });

//        element.src = file + '.ogg';
        element.preload = 'auto';
        return element;
      };

  var BODY = doc.getElementsByTagName('body')[0];
  var Audio = Base.extend({
    constructor: function(file, types) {
      var self = this;
      new AudioLoader(file, function(element) {
        self._element = element;
      });
      if (types === undef) {
        types = ['mp3', 'ogg'];
      }
      //this._createTag(file, types);
      //this._element.load();
    },
    _createTag: function(file, types) {
      var element = doc.createElement('audio'),
          source;
      types.forEach(function(type) {
        source = doc.createElement('source');
        source.src = file + '.' + type;
        //source.preload = 'auto'; // NOT NEEDED WITH .load()
        element.appendChild(source);
      });
      this._element = element;
    },
    play: function() {
      if (this._element) {
        this.stop();
        this._element.play();
      }
    },
    stop: function() {
      if (this._element) {
        this.pause();
        this._element.currentTime = 0;
      }
    },
    pause: function() {
      if (this._element) {
        this._element.pause();
      }
    }
  });

  win.Audio = Audio;
}(window, document));

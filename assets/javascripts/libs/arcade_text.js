/*globals Base */

;(function(win, doc, undef) {
  "use strict";
  var ArcadeFont = {
    alphabet: {
      'A': '28,54,99,99,127,99,99',
      'B': '63,99,99,63,99,99,63',
      'C': '62,99,3,3,3,99,62',
      'D': '31,51,99,99,99,51,31',
      'E': '127,3,3,63,3,3,127',
      'F': '63,3,3,31,3,3,3,0',
      'G': '62,99,3,115,99,99,62',
      'H': '99,99,99,127,99,99,99,0',
      'I': '30,12,12,12,12,12,30,0',
      'J': '96,96,96,96,96,99,62',
      'K': '99,51,27,15,27,51,99',
      'L': '3,3,3,3,3,3,127',
      'M': '99,119,127,107,99,99,99',
      'N': '99,103,111,127,123,115,99',
      'O': '62,99,99,99,99,99,62',
      'P': '63,99,99,99,63,3,3',
      'Q': '62,99,99,99,123,51,94',
      'R': '63,99,99,63,27,51,99',
      'S': '62,99,3,127,96,99,62',
      'T': '63,12,12,12,12,12,12',
      'U': '99,99,99,99,99,99,62',
      'V': '99,99,99,99,54,28,8',
      'W': '99,99,99,107,127,119,99',
      'X': '99,119,62,28,62,119,99',
      'Y': '51,51,51,30,12,12,12',
      'Z': '127,112,56,28,14,7,127',
      ' ': '0,0,0,0,0,0,0',
      '1': '12,14,12,12,12,12,63',
      '2': '62,99,112,60,6,3,127',
      '3': '126,48,24,60,96,99,62',
      '4': '56,60,54,51,127,48,48',
      '5': '127,3,63,96,96,99,62',
      '6': '62,99,3,63,99,99,62',
      '7': '127,96,48,24,12,12,12',
      '8': '62,99,99,62,99,99,62',
      '9': '62,99,99,126,96,99,62',
      '0': '62,99,99,99,99,99,62'
    },

    // space between letters
    gutter: 2,

    blueprint: function(text) {
      var blueprint = [],
          letter, letterCode, line, g, i, l, j;
      text = text.toUpperCase();
      for (i in text) {
        letterCode = this.alphabet[text[i]].split(',');

        for (j = 0, l = letterCode.length; j<l; ++j) {
          line = EightBit.decodeNumber(letterCode[j], 7);
          if (!blueprint[j]) {
            blueprint[j] = '';
          }
          blueprint[j] += line;
          for (g = this.gutter; g--;) {
            blueprint[j] += '0';
          }
        }
      }
      return blueprint.join('\n');
    }
  };
  var EightBit = {
    encode: function(str) {
      var codes = [],
          lines = str.split('\n'),
          i, l;
      for (i = 0, l = lines.length; i<l; ++i) {
        codes.push(this.encodeLine(lines[i]));
      }
      return codes.join(',');
    },

    decode: function(code, base) {
      var result = [],
          lines = code.split(','),
          i, l;
      for (i = 0, l = lines.length; i<l; ++i) {
        result.push(this.decodeNumber(lines[i], base));
      }
      return result.join('\n');
    },

    encodeLine: function(line) {
      var x = 0;
      for (var i in line) {
        x += line[i] === '1' ? Math.pow(2, i) : 0;
      }
      return x;
    },

    decodeNumber: function(nr, base) {
      var line = '',
          i, p;
      for (i = base; i--;) {
        p = Math.pow(2, i);
        if (p <= nr) {
          nr -= p;
          line = '1' + line;
        } else {
          line = '0' + line;
        }
      }
      return line;
    }
  };

  var ArcadeText = function(text, options) {
    var blueprint = ArcadeFont.blueprint(text.toString()),
        drawn     = false;
    options = Object.extend({
      gutter: ArcadeFont.gutter,
      canvas: doc.createElement('canvas'),
      color: '255,255,255',
      pixelSize: 2,
      x: 0,
      y: 0
    }, options || {});

    // calculate canvas Size
    options.canvas.width = 6 * text.length * (options.pixelSize + options.gutter);
    options.canvas.height = 7 * options.pixelSize;

    // draws the text onto own canvas
    function draw() {
      if (drawn) { return; }
      var ctx = options.canvas.getContext('2d'),
          rows = blueprint.split('\n'),
          row, pixel;
      ctx.clearRect(0, 0, options.canvas.width, options.canvas.height);
      ctx.fillStyle = 'rgba(' + options.color + ', ' + 1 + ')';
      for (var y=0,yl=rows.length; y<=yl; ++y) {
        row = rows[y] || '';
        for (var x=0,xl=row.length; x<=xl; ++x) {
          pixel = row[x];
          if (pixel === '1') {
            ctx.fillRect(Math.round(options.pixelSize * x), Math.round(options.pixelSize * y), options.pixelSize, options.pixelSize);
          }
        }
      }
      drawn = true;
    }

    return {
      text: function(newText) {
        text = newText;
        blueprint = ArcadeFont.blueprint(text.toString());
        drawn = false;
      },
      draw: function(context) {
        draw();
        if (context !== undef) {
          context.drawImage(options.canvas, options.x, options.y);
        }
        return options.canvas;
      },
      width: options.canvas.width,
      height: options.canvas.height
    };
  };

  win.ArcadeFont = ArcadeFont;
  win.ArcadeText = ArcadeText;
}(window, document));
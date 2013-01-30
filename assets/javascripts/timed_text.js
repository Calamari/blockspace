/*globals Base, Vector, Canvas */

;(function(win) {
  "use strict";
  var TimedText = function(text, config) {
    var chars      = 0,
        arcadeText = new ArcadeText(' ', config),
        interval   = setInterval(function() {
          arcadeText.text(text.substring(0, ++chars));
          if (chars >= text.length) {
            clearInterval(interval);
          }
        }, config.ms || 45);
    return {
      text: arcadeText,
      draw: arcadeText.draw.bind(arcadeText)
    };
  };
  win.TimedText = TimedText;
}(window));

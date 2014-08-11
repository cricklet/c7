define(function (require) {
  var Butler = require('lib/pixelbutler')
    , Music  = require('music')
    , $      = require('lib/jquery')
    ;

  var Game = function () {
  }

  Game.prototype.start = function () {
    $('#game').css('background-color', 'red');

    var music = new Music();
    music.play();

    $.keypress(function (e) {
      if (String.fromCharCode(e.keyCode) == 'm') {
        music.mute();
      }
    });
  }

  return Game;
});

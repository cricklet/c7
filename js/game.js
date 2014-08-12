define(function (require) {
  var Butler = require('lib/pixelbutler');
  var Music  = require('music');
  var $      = require('lib/jquery');

  var Game = function () {
  }

  Game.prototype.start = function () {
    var $game = $('#game');
    $game.css('background-color', 'red');

    var music = new Music();
    music.play();

    $(document).keypress(function (e) {
      if (String.fromCharCode(e.keyCode) == 'm') {
        music.toggleMute();
      }
    });
  }

  return Game;
});

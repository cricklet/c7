define(function (require) {
  var Music  = require('music');
  var World  = require('world');
  var $      = require('lib/jquery');

  var FPS = 60.0;
  var DT  = 1000.0 / FPS;

  var Game = function () {
    this.world = new World($('#game'));
    this.music = new Music();

    this.paused = false;
    $(document).keydown(function (e) {
      var key = String.fromCharCode(e.keyCode).toLowerCase();
      if (key == 'p') {
        this.paused = !this.paused;
      }
    }.bind(this));
  }

  Game.prototype.start = function () {
    var lastTime = Date.now();
    var frameCount = 0;
    var frameStart = Date.now();

    this.loop = function () {
      // calculate next wait
      var time = Date.now();
      var wait = DT - (time - lastTime);

      // calculate FPS
      frameCount += 1;
      if (time > frameStart + 1000) {
        console.log(frameCount + " fps");
        frameCount = 0;
        frameStart = time;
      }

      // run the game
      if (!this.paused) {
        this.world.draw();
      }

      lastTime = time;
      setTimeout(this.loop.bind(this), wait);
    }

    this.loop();
  }

  Game.prototype.step = function (dt) {
  }

  return Game;
});

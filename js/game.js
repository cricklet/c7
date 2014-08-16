define(function (require) {
  var Piano = require('piano');
  var Audio = require('audio');
  var World = require('world');
  var PianoController = require('piano_controller');

  var B = require('lib/backbone');
  var _ = require('lib/underscore')
  var $ = require('lib/jquery');

  var FPS = 60.0;
  var DT  = 1000.0 / FPS;

  function run (callback, state) {
    var lastTime = Date.now();
    var frameCount = 0;
    var frameStart = Date.now();

    function loop () {
      // calculate FPS
      frameCount += 1;
      if (Date.now() > frameStart + 1000) {
        console.log(frameCount + " fps");
        frameCount = 0;
        frameStart = Date.now();
      }

      // run the game
      if (!state.paused) {
        callback(DT);
      }

      setTimeout(loop, DT);
    }

    loop();
  }

  function step (world, dt) {
    world.draw();
  }

  function setupState (state) {
    $(document).keydown(function (e) {
      var key = String.fromCharCode(e.keyCode).toLowerCase();
      if (key == 'p') {
        state.paused = !state.paused;
      }
    });
  }

  var Game = function () {
    var world = new World($('#game'));
    var audio = new Audio();
    var piano = new Piano(audio.getMaster(), audio.getGain());
    var pianoController = new PianoController(piano);

    var state = {
      paused: false,
      destroyed: false
    }

    setupState(state);

    world.on('playNote', function (tone) {
      piano.allNotesUp(tone.midi);
      piano.noteDown(tone.midi);
    });

    run (function (dt) {
      step (world, dt);
    }, state);
  }

  _.extend(Game.prototype, B.Events);

  return Game;
});

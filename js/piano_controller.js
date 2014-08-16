define(function (require) {
  var Piano = require('piano');
  var _     = require('lib/underscore');

  var KEYS = ['q','2','w','3','e','r','5','t','6','y','7','u','i'];
  var MIDI_ROOT = 60;

  function setupPiano (piano) {
    $(document).keydown(function (e) {
      var key = String.fromCharCode(e.keyCode).toLowerCase();

      if (KEYS.indexOf(key) != -1) {
        var midi = _.indexOf(KEYS, key) + MIDI_ROOT;
        piano.noteDown(midi);
      }
    });

    $(document).keyup(function (e) {
      var key = String.fromCharCode(e.keyCode).toLowerCase();

      if (KEYS.indexOf(key) != -1) {
        var midi = _.indexOf(KEYS, key) + MIDI_ROOT;
        piano.noteUp(midi);
      }
    });
  }

  var PianoController = function (piano) {
    setupPiano(piano);
  }

  return PianoController;
});

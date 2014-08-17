define(function (require) {
  var jsynth = require('lib/jsynth');
  var _      = require('lib/underscore');


  /****************************************************************************
  * Helpers for generating sounds.
  * Generators return null when they are finished.
  */
  function adsrEnvelopeFactory (attack, decay, sustainLevel, release) {
    var stopTime = -1;

    var attackEnvelope = function (time) {
      return time / attack;
    }

    var decayEnvelope = function (time) {
      return 1 - time * (1 - sustainLevel) / decay;
    }

    var releaseEnvelope = function (time) {
      return sustainLevel * (1 - time / release);
    }

    return function (time, sustained) {
      if (time < attack) return attackEnvelope(time);
      time -= attack;

      if (time < decay) return decayEnvelope(time);
      time -= decay;

      if (sustained) {
        return sustainLevel;

      } else {
        if (stopTime == -1) stopTime = time;
        time -= stopTime;

        if (time < release) return releaseEnvelope(time)
      }

      return null
    }
  }

  function sineGeneratorFactory (freq) {
    return function (time) {
      return Math.sin(time * 2 * Math.PI * freq)
    };
  }

  /****************************************************************************
  * Plays a single note.
  */
  function midiToFreq (midi) {
    return Math.pow(2, (midi - 69.0) / 12.0) * 440;
  }

  function generatorFactory (m,a,d,s,r) {
    var f = midiToFreq(m);
    adsrEnv = adsrEnvelopeFactory(a,d,s,r);
    sineGen = sineGeneratorFactory(f);
    return function (t, sustained) {
      var sine = sineGen(t);
      var adsr = adsrEnv(t, sustained);

      if (adsr === null || sine === null) {
        return null;
      } else {
        return adsr * sine;
      }
    }
  }

  /****************************************************************************
  * Controller
  */
  var Piano = function (context, output) {
    var gen = generatorFactory(midiToFreq(40), 0.2, 0.4, 0.8, 0.2)

    synth = jsynth(context, function (t) {
      var val = gen(t, true);
      return val;
    });
    synth.connect(output)

  }

  Piano.prototype.allNotesUp = function (except) {
  }

  Piano.prototype.noteUp = function (midi) {
  }

  Piano.prototype.noteDown = function (midi) {
  }

  return Piano;
});

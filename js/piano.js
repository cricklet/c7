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
  function generatorFactory (f,a,d,s,r) {
    adsrEnv = adsrEnvelopeFactory(a,d,s,r);
    sineGen = sineGeneratorFactory(f);
    return function (t, sustained) {
      var sine = sineGen(t);
      var adsr = adsrEnv(t);

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
  function midiToFreq (midi) {
    return Math.pow(2, (midi - 69.0) / 12.0) * 440;
  }

  function synthesizeNotes(t, notes) {
    var overall = 0;
    for (var midi in notes) {
      var note = notes[midi];
      if (!note.start) {
        note.start = t;
      }

      var val  = note.generator(t - note.start, note.sustained);
      if (val === null) {
        note.remove = true;
      } else {
        overall += val;
      }

      return overall;
    }

    return overall;
  }

  function removeOldNotes (notes) {
    var remove = [];

    for (var midi in notes) {
      var note = notes[midi];
      if (note.remove) {
        remove.push(midi);
      }
    }

    for (var i in remove) {
      delete notes[remove[i]];
    }
  }

  var Piano = function (context, output) {
    var notes = {};

    synth = jsynth(context, function (t) {
      synthesizeNotes(t, notes)
    });
    synth.connect(output)

    this.notes = notes;
  }

  Piano.prototype.allNotesUp = function (except) {
    for (var midi in this.notes) {
      this.notes[midi].sustained = false;
    }

    removeOldNotes(this.notes);
  }

  Piano.prototype.noteUp = function (midi) {
    if (midi in this.notes) {
      this.notes[midi].sustained = false;
    }

    removeOldNotes(this.notes);
  }

  Piano.prototype.noteDown = function (midi) {
    if (midi in this.notes) {
      return;
    }

    removeOldNotes(this.notes);

    var freq = midiToFreq(midi);
    this.notes[midi] = {
      generator: generatorFactory(freq, 0.1, 0.4, 0.8, 0.2),
      sustained: true
    };
  }

  return Piano;
});

define(function (require) {
  var jsynth = require('lib/jsynth');
  var _      = require('lib/underscore');


  /****************************************************************************
   * Helpers for generating sounds.
   */
  var adsrEnvelope = function (attack, decay, sustainLevel, release) {
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

      return 0;
    }
  }

  var sineGenerator = function (freq) {
    return function (time) {
      return Math.sin(time * 2 * Math.PI * freq)
    };
  }

  /****************************************************************************
   * Plays a single note.
   */
  var Note = function (f,a,d,s,r) {
    this.sustained = true;
    this.adsr = adsrEnvelope(a,d,s,r);
    this.sine = sineGenerator(f);
  }

  Note.prototype.off = function (t) {
    this.sustained = false;
  }

  Note.prototype.generator = function (t) {
    return this.adsr(t, this.sustained) * this.sine(t);
  }

  var midiToFreq = function (midi) {
    return Math.pow(2, (midi - 69.0) / 12.0) * 440;
  }

  /****************************************************************************
   * Plays multiple notes
   */
  var Piano = function (context, output) {
    this.context = context;
    this.output = output;
    this.notes = {};
  }

  Piano.prototype.allNotesUp = function (except) {
    var newNotes = {};
    if (except in this.notes) {
      newNotes[except] = this.notes[except];
      delete this.notes[except];
    }

    for (var midi in this.notes) {
      this.notes[midi].off();
    }

    this.notes = newNotes;
  }

  Piano.prototype.noteUp = function (midi) {
    if (midi in this.notes) {
      this.notes[midi].off();
      delete this.notes[midi];
    }
  }

  Piano.prototype.noteDown = function (midi) {
    var freq = midiToFreq(midi);
    var note = new Note(freq, 0.1, 0.4, 0.8, 0.2);
    var generator = note.generator.bind(note);

    synth = jsynth(this.context, generator);
    synth.connect(this.output)

    this.notes[midi] = note;
  }

  return Piano;
});

define(function (require) {
  var jsynth = require('lib/jsynth');
  var _      = require('lib/underscore');

  /* A note looks like this:
   * {
   *   sustained: true,
   *   done: true,
   *   adsr: {...},
   *   midi: 50,
   *   freq: midiToFreq(50),
   *   ...
   * }
   */

  function midiToFreq (midi) {
    return Math.pow(2, (midi - 69.0) / 12.0) * 440;
  }

  /****************************************************************************
  * Helpers for generating sounds.
  * Generators return null when they are finished.
  */
  function attackEnvelope (time, attack) {
    return time / attack;
  }

  function decayEnvelope (time, sustain, decay) {
    return 1 - time * (1 - sustain) / decay;
  }

  function releaseEnvelope (time, sustain, release) {
    return sustain * (1 - time / release);
  }

  function adsrEnvelope (t, note) {
    var sustained = note.sustained;

    var opts    = note.adsr;
    var attack  = opts.attack;
    var decay   = opts.decay;
    var sustain = opts.sustain;
    var release = opts.release;

    if (t < attack) return attackEnvelope(t, attack);
    t -= attack;

    if (t < decay) return decayEnvelope(t, sustain, decay);
    t -= decay;

    if (sustained) return sustain;

    if (opts._stop === undefined) opts._stop = t;
    t -= opts._stop;

    if (t < release) return releaseEnvelope(t, sustain, release);

    return null
  }

  function sineGenerator (time, note) {
    return Math.sin(time * 2 * Math.PI * note.freq)
  }

  /****************************************************************************
  * Plays a single note.
  */
  function generate (time, note) {
    var effect = adsrEnvelope(time, note);
    var signal = sineGenerator(time, note);

    if (effect === null || signal === null) {
      return null;
    } else {
      return effect * signal;
    }
  }

  /****************************************************************************
  * Controller
  */
  var Piano = function (context, output) {
    synth = jsynth(context, this.generate.bind(this));
    synth.connect(output)

    this.notes = [];
    setInterval(this.cleanNotes.bind(this), 500);
  }

  Piano.prototype.generate = function (t) {
    var overall = 0;
    for (var i in this.notes) {
      var note = this.notes[i];

      if (note.done) continue;

      if (note._start === undefined) note._start = t;

      var val = generate(t - note._start, note);

      if (val === null) {
        note.done = true;
      } else {
        overall += val;
      }
    }

    return overall;
  }

  Piano.prototype.cleanNotes = function () {
    this.notes = _.filter(this.notes, function (note) {
      return note.done !== true;
    });
  }

  Piano.prototype.allNotesUp = function (exceptMidi) {
    for (var i in this.notes) {
      var note = this.notes[i];
      if (note.midi !== exceptMidi) note.sustained = false;
    }
  }

  Piano.prototype.noteUp = function (midi) {
    for (var i in this.notes) {
      var note = this.notes[i];
      if (note.midi === midi) note.sustained = false;
    }
  }

  Piano.prototype.noteDown = function (midi) {
    var alreadyDown = _.some(this.notes, function (note) {
      return note.midi === midi && note.sustained;
    });

    if (alreadyDown) return;

    var note = {
      midi: midi,
      freq: midiToFreq(midi),
      sustained: true,
      done: false,
      adsr: {
        attack:  0.2,
        decay:   0.4,
        sustain: 0.5,
        release: 0.4
      }
    };

    this.notes.push(note);
  }

  return Piano;
});

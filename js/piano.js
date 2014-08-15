define(function (require) {
  var jsynth = require('lib/jsynth');
  var _      = require('lib/underscore');

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

  var SustainController = function (f,a,d,s,r) {
    this.sustained = true;
    this.adsr = adsrEnvelope(a,d,s,r);
    this.sine = sineGenerator(f);
  }

  SustainController.prototype.off = function (t) {
    this.sustained = false;
  }

  SustainController.prototype.generator = function (t) {
    return this.adsr(t, this.sustained) * this.sine(t);
  }

  var midiToFreq = function (midi) {
    return Math.pow(2, (midi - 69.0) / 12.0) * 440;
  }

  var Piano = function (context, output) {
    this.context = context;
    this.output = output;
    this.controllers = {};
  }

  Piano.prototype.noteUp = function (midi) {
    if (midi in this.controllers) {
      this.controllers[midi].off();
      delete this.controllers[midi];
    }
  }

  Piano.prototype.noteDown = function (midi) {
    if (midi in this.controllers) {
      return;
    }

    var freq = midiToFreq(midi);
    var controller = new SustainController(freq, 0.1, 0.4, 0.8, 0.2);
    var generator = controller.generator.bind(controller);

    synth = jsynth(this.context, generator);
    synth.connect(this.output)

    this.controllers[midi] = controller;
  }

  return Piano;
});

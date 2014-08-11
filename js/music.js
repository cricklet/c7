define(function (require) {
  var T = require('lib/timbre')
    , _ = require('lib/underscore')
    ;

  var Music = function () {
    this.synth = T("SynthDef").play();
    this.synth.def = function(opts) {
      var VCO = T("sin", {freq:opts.freq});
      return VCO;
    };
  }

  Music.prototype.mute = function () {
  }

  Music.prototype.play = function () {
    return;
    var s = this.synth;
    s.noteOn(80);

    setTimeout(function () {
      s.noteOff(80);
    }, 1000);
  }

  return Music;
});

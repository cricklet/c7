define(function (require) {
  var jsynth = require('lib/jsynth');
  var _      = require('lib/underscore');

  var GAIN_VAL = 0.2;

  var Music = function () {
    var master = new webkitAudioContext();
    var masterGain = master.createGain();
    masterGain.gain.value = GAIN_VAL;
    masterGain.connect(master.destination);

    this.master = master;
    this.masterGain = masterGain;
  }

  Music.prototype.toggleMute = function () {
    if (this.masterGain.gain.value != 0) {
      this.masterGain.gain.value = 0;
    } else {
      this.masterGain.gain.value = GAIN_VAL;
    }
  }

  Music.prototype.play = function () {
    var sineGenerator = function (time){
      return Math.sin(time * 2 * Math.PI * 440)
    }

    synth = jsynth(this.master, sineGenerator);
    synth.connect(this.masterGain)
  }

  return Music;
});

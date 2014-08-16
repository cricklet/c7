define(function (require) {

  var GAIN_VAL = 0.4;

  function setupMuting (gain) {
    function toggleMute () {
      if (gain.gain.value != 0) {
        gain.gain.value = 0;
      } else {
        gain.gain.value = GAIN_VAL;
      }
    }

    $(document).keydown(function (e) {
      var key = String.fromCharCode(e.keyCode).toLowerCase();
      if (key == 'm') {
        toggleMute();
      }
    });
  }

  var Audio = function () {
    this.master = new webkitAudioContext();
    this.masterGain = this.master.createGain();
    this.masterGain.gain.value = GAIN_VAL;
    this.masterGain.connect(this.master.destination);

    setupMuting(this.masterGain);
  }

  Audio.prototype.getMaster = function () {
    return this.master;
  }

  Audio.prototype.getGain = function () {
    return this.masterGain;
  }

  return Audio;

});

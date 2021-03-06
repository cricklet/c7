define(function (require) {return function (context, fn, bufSize) {
    if (typeof context === 'function') {
      fn = context;
      context = new webkitAudioContext() ;
    }

    if(!bufSize) bufSize = 4096;

    var self = context.createScriptProcessor(bufSize, 1, 1);

    self.fn = fn

    self.i = self.t = 0

    window._SAMPLERATE = self.sampleRate = self.rate = context.sampleRate;

    self.duration = Infinity;

    self.recording = false;

    self.onaudioprocess = function(e){
      var output = e.outputBuffer.getChannelData(0)
      ,   input = e.inputBuffer.getChannelData(0);
      self.tick(output, input);
    };

    self._input = []

    self.tick = function (output, input) { // a fill-a-buffer function

      output = output || self._buffer;

      input = input || self._input

      for (var i = 0; i < output.length; i += 1) {

          self.t = self.i / self.rate;

          self.i += 1;

          output[i] = self.fn(self.t, self.i, input);

          if(self.i >= self.duration) {
            self.stop()
            break;
          }

      }

      return output

    };

    self.stop = function(){

      self.disconnect();

      self.playing = false;

      if(self.recording) {}
    };

    self.play = function(opts){

      if (self.playing) return;

      self.connect(self.context.destination);

      self.playing = true;

      return

    };

    self.record = function(){

    };

    self.reset = function(){
      self.i = self.t = 0
    };

    self.createSample = function(duration){
      self.reset();
      var buffer = self.context.createBuffer(1, duration, self.context.sampleRate)
      var blob = buffer.getChannelData(0);
      self.tick(blob);
      return buffer
    };

    return self;
}});

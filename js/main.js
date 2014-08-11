requirejs.config({
  baseUrl: 'js/',
  shim: {
    'lib/jquery': {
      exports: '$'
    }
  , 'lib/timbre': {
      exports: 'T'
    },
  }
});

requirejs(['game'], function (Game) {
  new Game().start();
});

'use strict';
(function() {
  /**
   * Initialize polyfills.
   */
  function initializePolyfills() {
    // requestAnimationFrame polyfill
    window.requestAnimationFrame = (function() {
      return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function( callback ) {
            window.setTimeout(callback, 1000 / 60);
          };
    })();

    // getUserMedia polyfill
    window.getUserMedia = (function() {
      return window.getUserMedia ||
          (navigator.mediaDevices || {}).getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;
    })();
  }

  /**
   * Initialize utils.
   */
  function initializeUtils() {
    const body = document.getElementsByTagName('body')[0];
    window.utils = window.utils || {};
    /**
     * Return random number between  min and max.
     * @param {Number} min - minimum value.
     * @param {Number} max - maximum value.
     * @param {Boolean} float - tell to use float number.
     * @return {Number} random nnumber.
     */
    window.utils.random = function(min, max, float) {
      return float
        ? Math.random() * (max - min) + min
        : Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /**
     * Return true if canvas is supported.
     * @return {Boolean} true if canvas is supported.
     */
    window.utils.isCanvasSupported = function() {
      const elem = document.createElement('canvas');
      const isCanvasSupported = !!(elem.getContext && elem.getContext('2d'));
      return isCanvasSupported;
    };

    /**
     * Return window innerWidth.
     * @return {Number} innerWidth.
     */
    window.utils.getInnerWidth = function() {
      const doc = document.documentElement;
      const width = window.innerWidth || doc.clientWidth || body.clientWidth;
      return width;
    };

    /**
     * Return window innerHeight.
     * @return {Number} innerHeight.
     */
    window.utils.getInnerHeight = function() {
      const doc = document.documentElement;
      const width = window.innerHeight|| doc.clientHeight|| body.clientHeight;
      return width;
    };
  }

  initializePolyfills();
  initializeUtils();
})();

'use strict';
(function(){
  var canvas = document.getElementById('stars');

  if (canvas.getContext) {
    var	ctx = canvas.getContext('2d'),
    	mouse = { x: 0, y: 0 },
    	m = {},
    	r = 0,
    	particles = [];

    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);

    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;

    function random(min, max, float){
    	return float
    		? Math.random() * (max - min) + min
    		: Math.floor(Math.random() * (max - min + 1)) + min
    }

    function pushParticles () {
      for(var i=0; i<random(1000, 5000); i++){
      	particles.push({
      		x: random(-300, canvas.width + 300),
      		y: random(-300, canvas.height + 300),
      		s: random(1, 3)
      	})
      }
    }
    pushParticles();

    document.addEventListener('mousemove', function(e) {
    	mouse.x = e.clientX;
    	mouse.y = e.clientY;
    });

    document.addEventListener('touchmove', function(e) {
      try {
        mouse.x = e.touches[0].clientX;
      	mouse.y = e.touches[0].clientY;
      } catch(error) {
        console.error(error);
      }
    })


    function render(){
    	ctx.clearRect(0, 0, canvas.width, canvas.height);

    	for(var i=0; i<particles.length; i++){
    		var p = particles[i];

    		var x = p.x + ((((canvas.width / 2) - mouse.x) * p.s) * 0.1);
    		var y = p.y + ((((canvas.height / 2) - mouse.y) * p.s) * 0.1);

    		ctx.fillStyle = '#fff';
    		ctx.beginPath();
    		ctx.fillRect(x, y, p.s, p.s);
    		ctx.closePath();
    	}
    }

    // requestAnimFrame polyfill
    window.requestAnimFrame = (function(){
    	return	window.requestAnimationFrame ||
    			window.webkitRequestAnimationFrame ||
    			window.mozRequestAnimationFrame ||
    			function( callback ){
    				window.setTimeout(callback, 1000 / 60);
    			};
    })();

    // create the animation loop
    (function animloop(){
    	requestAnimFrame(animloop);
    	render();
    })();
  }

  window.addEventListener('resize', function(event){
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    particles.length = 0;
    pushParticles();
    render();
  });

})();

(function(){
  navigator.getUserMedia = navigator.getUserMedia || (navigator.mediaDevices || {}).getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  if (!navigator.getUserMedia) {
    alert('Your device does not support camera access');
    return;
  }

  function isCanvasSupported(){
    var elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  }
  if (!isCanvasSupported()) {
    alert('Your device does not support canvas');
    return;
  }

  if (!window.FaceDetector) {
    alert('Your device does not support FaceDetector');
    return;
  }

  var doc = document.documentElement,
    body = document.getElementsByTagName('body')[0],
    width = window.innerWidth || doc.clientWidth || body.clientWidth,
    height = window.innerHeight|| doc.clientHeight|| body.clientHeight,
    canvas = document.getElementById('video'),
    videoWidth = height > width ? width * 1.5 : width/2,
    videoHeight = height > width ? height * 1.5 : height/2,
    faceDetector = new FaceDetector(),
    control = document.getElementById('control'),
    stream, video;
    console.log(videoWidth, videoHeight);
    canvas.width = videoWidth;
    canvas.height = videoHeight;

  control.addEventListener('click', function() {
    if (control.value === 'start') {
      control.value = 'stop';
      control.classList.add('button-red');
      start();
    } else {
      control.value = 'start';
      control.classList.remove('button-red');
      video.pause();
    }
  });

  function start() {
    navigator.getUserMedia({audio: false, video: {width: videoWidth, height: videoHeight}},
        function(st) {
          var ctx = canvas.getContext('2d');
          video = document.createElement('video');
          stream = st;
          video.srcObject = stream;
          video.addEventListener('loadeddata', function() {
            video.play();  // start playing
            update(); //Start rendering
          });
          function update(){
            if (video.paused) {
              return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
            var image = new Image();
            image.src = canvas.toDataURL();
            image.onload = function() {
              faceDetector.detect(image)
              .then(handleDetectedFaces)
              .catch(faceDetectionError);
            }
          }
          function handleDetectedFaces(detectedFaces) {
            console.log(detectedFaces);
            if (detectedFaces && detectedFaces.length) {
              detectedFaces.forEach(function(face) {
                if (face.boundingBox) {
                  ctx.beginPath();
                  ctx.rect(face.boundingBox.x, face.boundingBox.y, face.boundingBox.width, face.boundingBox.height);
                  ctx.lineWidth = 5;
                  ctx.strokeStyle = 'black';
                  ctx.stroke();
                  ctx.closePath();
                }
              });
            }
            setTimeout(function () {
              requestAnimationFrame(update); // wait for the browser to be ready to present another animation fram.
            }, 10);
          }
          function faceDetectionError(error) {
            console.error(error);
            requestAnimationFrame(update); // wait for the browser to be ready to present another animation fram.
          }
        },
        function(err) {
          alert('The following error occurred: ' + err.name);
          console.error(err);
        }
    );
  }
})();

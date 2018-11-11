(function(utils) {
  if (!navigator.getUserMedia) {
    alert('Your device does not support camera access');
    return;
  }

  if (!utils.isCanvasSupported()) {
    alert('Your device does not support canvas');
    return;
  }

  if (!window.FaceDetector) {
    alert('Your device does not support FaceDetector');
    return;
  }

  const innerWidth = utils.getInnerWidth();
  const innerHeight = utils.getInnerHeight();
  const videoWidth = (function(width, height) {
    return height > width ? width * 1.5 : width/2;
  })(innerWidth, innerHeight);
  const videoHeight = (function(width, height) {
    return height > width ? height * 1.5 : height/2;
  })(innerWidth, innerHeight);
  const faceDetector = new window.FaceDetector();
  const canvas = document.getElementById('video');
  const control = document.getElementById('control');
  const ctx = canvas.getContext('2d');
  let video;

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

  /**
   * Update video on canvas
   */
  function updateCanvas() {
    if (video.paused) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    const image = new Image();
    image.src = canvas.toDataURL();
    image.onload = function() {
      faceDetector.detect(image)
          .then(handleDetectedFaces)
          .catch(faceDetectionError);
    };
  }

  /**
   * Handle detected faces
   * @param {Object} detectedFaces object.
   */
  function handleDetectedFaces(detectedFaces) {
    if (detectedFaces && detectedFaces.length) {
      detectedFaces.forEach(drawFace);
    }
    // wait for the browser to be ready to present animation frame.
    setTimeout(function() {
      requestAnimationFrame(updateCanvas);
    }, 10);
  }

  /**
   * Draw face on canvas.
   * @param {Object} face object.
   */
  function drawFace(face) {
    if (face && face.boundingBox) {
      const box = face.boundingBox;
      ctx.beginPath();
      ctx.rect(box.x, box.y, box.width, box.height);
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'black';
      ctx.stroke();
      ctx.closePath();
    }
  }

  /**
   * Show error and perform face detection again.
   * @param {Object} error object.
   */
  function faceDetectionError(error) {
    // wait for the browser to be ready to present another animation frame.
    requestAnimationFrame(updateCanvas);
  }

  /**
   * Start video capturing, displaying it on canvas and detecting faces.
   */
  function start() {
    navigator.getUserMedia(
        {
          audio: false,
          video: {
            width: videoWidth,
            height: videoHeight,
          },
        },
        function(stream) {
          video = document.createElement('video');
          video.srcObject = stream;
          video.addEventListener('loadeddata', function() {
            video.play(); // start playing
            updateCanvas(); // Start rendering
          });
        },
        function(err) {
          alert('The following error occurred: ' + err.name);
        }
    );
  }
})(window.utils);

'use strict';
(function(utils) {
  const canvas = document.getElementById('stars');
  let ctx; let mouse; let particles;

  /**
   * Add random number of particles to the array.
   */
  function pushParticles() {
    for (let i = 0; i < utils.random(1000, 5000); i++) {
      particles.push({
        x: utils.random(-300, canvas.width + 300),
        y: utils.random(-300, canvas.height + 300),
        s: utils.random(1, 3),
      });
    }
  }

  /**
   * Draw particles on canvas.
   */
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i=0; i<particles.length; i++) {
      const p = particles[i];

      const x = p.x + ((((canvas.width / 2) - mouse.x) * p.s) * 0.1);
      const y = p.y + ((((canvas.height / 2) - mouse.y) * p.s) * 0.1);

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.fillRect(x, y, p.s, p.s);
      ctx.closePath();
    }
  }

  if (canvas.getContext) {
    ctx = canvas.getContext('2d');
    mouse = {x: 0, y: 0};
    particles = [];

    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);

    mouse.x = canvas.width / 2;
    mouse.y = canvas.height / 2;

    pushParticles();

    document.addEventListener('mousemove', function(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.addEventListener('touchmove', function(e) {
      mouse.x = ((e.touches || [])[0] || {}).clientX || 0;
      mouse.y = ((e.touches || [])[0] || {}).clientY || 0;
    });

    // create the animation loop
    (function animloop() {
      requestAnimationFrame(animloop);
      render();
    })();
  }

  window.addEventListener('resize', function(event) {
    canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
    canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
    particles.length = 0;
    pushParticles();
    render();
  });
})(window.utils);

export interface SampleAnimation {
  id: string;
  title: string;
  prompt: string;
  html: string;
}

export const SAMPLE_ANIMATIONS: SampleAnimation[] = [
  {
    id: "bouncing-ball",
    title: "Bouncing Red Ball",
    prompt: "A bouncing red ball with realistic squash-and-stretch gravity physics and soft ground shadow",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f172a;
      min-height: 100vh;
      overflow: hidden;
      font-family: sans-serif;
    }
    canvas {
      width: 600px;
      height: 400px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="600" height="400"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const ball = {
      x: 300,
      y: 100,
      radius: 35,
      vy: 0,
      gravity: 0.45,
      bounce: -0.82,
      groundY: 340,
      scaleX: 1,
      scaleY: 1
    };

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Floor
      ctx.beginPath();
      ctx.moveTo(40, ball.groundY + ball.radius);
      ctx.lineTo(560, ball.groundY + ball.radius);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Physics update
      ball.vy += ball.gravity;
      ball.y += ball.vy;

      // Ground collision with squash & stretch
      if (ball.y >= ball.groundY) {
        ball.y = ball.groundY;
        ball.vy *= ball.bounce;
        ball.scaleX = 1.35;
        ball.scaleY = 0.65;
      } else {
        // Recover shape
        ball.scaleX += (1 - ball.scaleX) * 0.12;
        ball.scaleY += (1 - ball.scaleY) * 0.12;
      }

      // Draw Shadow
      const shadowScale = Math.max(0.2, (ball.groundY - ball.y) / 250);
      const shadowWidth = (ball.radius * 1.6) * (1.8 - shadowScale);
      const shadowAlpha = Math.max(0.1, 0.6 - shadowScale * 0.4);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ball.x, ball.groundY + ball.radius + 3, shadowWidth * ball.scaleX, 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = \`rgba(0, 0, 0, \${shadowAlpha})\`;
      ctx.fill();
      ctx.restore();

      // Draw Ball with Radial Gradient
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.scale(ball.scaleX, ball.scaleY);

      const grad = ctx.createRadialGradient(-10, -12, 4, 0, 0, ball.radius);
      grad.addColorStop(0, '#fca5a5');
      grad.addColorStop(0.3, '#ef4444');
      grad.addColorStop(0.8, '#b91c1c');
      grad.addColorStop(1, '#7f1d1d');

      ctx.beginPath();
      ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
      ctx.shadowBlur = 18;
      ctx.fill();

      // Specular highlight reflection
      ctx.beginPath();
      ctx.ellipse(-10, -14, 10, 6, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      ctx.restore();

      requestAnimationFrame(animate);
    }

    animate();
  </script>
</body>
</html>`
  },
  {
    id: "solar-system",
    title: "Solar System Orbiting",
    prompt: "A glowing solar system with orbiting planets, orbital trail rings, and starry background",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #030712;
      min-height: 100vh;
      overflow: hidden;
    }
    canvas {
      width: 600px;
      height: 400px;
      background: #030712;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8);
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="600" height="400"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const cx = 300;
    const cy = 200;

    // Stars
    const stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random()
    }));

    // Planets
    const planets = [
      { r: 48, speed: 0.038, size: 5, color: '#94a3b8' },
      { r: 76, speed: 0.026, size: 8, color: '#fb923c' },
      { r: 110, speed: 0.019, size: 9, color: '#38bdf8', moon: true },
      { r: 145, speed: 0.014, size: 7, color: '#ef4444' },
      { r: 185, speed: 0.009, size: 14, color: '#facc15', rings: true }
    ];

    let t = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background stars
      stars.forEach(s => {
        ctx.fillStyle = \`rgba(255, 255, 255, \${0.3 + 0.7 * Math.sin(t * 0.05 + s.alpha * 10)})\`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Orbit Lines
      planets.forEach(p => {
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Draw Sun
      const sunGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 28);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#fef08a');
      sunGrad.addColorStop(0.7, '#f59e0b');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Planets
      planets.forEach((p, idx) => {
        const angle = t * p.speed;
        const px = cx + Math.cos(angle) * p.r;
        const py = cy + Math.sin(angle) * p.r;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.rings) {
          ctx.beginPath();
          ctx.ellipse(px, py, p.size * 2, p.size * 0.6, 0.3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (p.moon) {
          const mAngle = t * 0.08;
          const mx = px + Math.cos(mAngle) * 15;
          const my = py + Math.sin(mAngle) * 15;
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fill();
        }
      });

      t += 1;
      requestAnimationFrame(animate);
    }

    animate();
  </script>
</body>
</html>`
  },
  {
    id: "matrix-rain",
    title: "Matrix Digital Rain",
    prompt: "Matrix digital green code rain streaming down a dark screen with glowing heads",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    canvas {
      width: 600px;
      height: 400px;
      background: #000;
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="600" height="400"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const chars = '0123456789ABCDEFｦｱｳｴｵｶｷｹｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -30));

    function draw() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = \`\${fontSize}px monospace\`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character glowing white
        ctx.fillStyle = '#e2fdf0';
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 8;
        ctx.fillText(char, x, y);

        // Regular trail character green
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#22c55e';
        ctx.fillText(char, x, y - fontSize);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    setInterval(draw, 33);
  </script>
</body>
</html>`
  },
  {
    id: "neon-jellyfish",
    title: "Pulsing Neon Jellyfish",
    prompt: "A pulsating neon jellyfish floating through deep sea particles with organic tentacle kinematics",
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #030712;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      overflow: hidden;
    }
    canvas {
      width: 600px;
      height: 400px;
      background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
      border-radius: 12px;
    }
  </style>
</head>
<body>
  <canvas id="canvas" width="600" height="400"></canvas>
  <script>
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let time = 0;
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * 600,
      y: Math.random() * 400,
      speed: Math.random() * 0.4 + 0.1,
      r: Math.random() * 1.5 + 0.5
    }));

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.04;

      // Floating particles
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < 0) p.y = canvas.height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fill();
      });

      const jx = 300 + Math.sin(time * 0.5) * 40;
      const jy = 190 + Math.cos(time * 0.7) * 30;
      const pulse = 1 + Math.sin(time * 2) * 0.18;

      // Tentacles
      const numTentacles = 8;
      for (let i = 0; i < numTentacles; i++) {
        const offsetX = (i - (numTentacles - 1) / 2) * 9 * pulse;
        ctx.beginPath();
        ctx.moveTo(jx + offsetX, jy + 10);

        for (let seg = 1; seg <= 14; seg++) {
          const segY = jy + 10 + seg * 9;
          const wave = Math.sin(time * 2.5 - seg * 0.4 + i * 0.5) * (seg * 1.8);
          ctx.lineTo(jx + offsetX + wave, segY);
        }

        ctx.strokeStyle = i % 2 === 0 ? 'rgba(168, 85, 247, 0.55)' : 'rgba(236, 72, 153, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Jellyfish Cap/Bell
      ctx.save();
      ctx.translate(jx, jy);
      ctx.scale(pulse, 2 - pulse);

      const bellGrad = ctx.createRadialGradient(0, -10, 5, 0, 0, 48);
      bellGrad.addColorStop(0, 'rgba(236, 72, 153, 0.8)');
      bellGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.5)');
      bellGrad.addColorStop(1, 'rgba(59, 130, 246, 0.1)');

      ctx.beginPath();
      ctx.moveTo(-45, 10);
      ctx.bezierCurveTo(-45, -45, 45, -45, 45, 10);
      ctx.bezierCurveTo(20, 2, -20, 2, -45, 10);
      ctx.closePath();

      ctx.fillStyle = bellGrad;
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 25;
      ctx.fill();

      // Rim highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.restore();

      requestAnimationFrame(animate);
    }

    animate();
  </script>
</body>
</html>`
  }
];

const canvas = document.querySelector('#confetti');
const ctx = canvas.getContext('2d');
let pieces = [];
let animationFrame;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function celebrate(amount = 140) {
  const colors = ['#f2c9d6', '#d9cff8', '#7764bb', '#f5d1b8', '#211a46', '#f6c95f'];
  pieces = Array.from({ length: amount }, () => ({
    x: innerWidth / 2 + (Math.random() - .5) * 180,
    y: innerHeight * .35,
    vx: (Math.random() - .5) * 12,
    vy: Math.random() * -11 - 3,
    gravity: .2 + Math.random() * .14,
    size: Math.random() * 8 + 5,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - .5) * .25,
    color: colors[Math.floor(Math.random() * colors.length)],
    life: 1
  }));
  cancelAnimationFrame(animationFrame);
  drawConfetti();
}

function drawConfetti() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces.forEach(piece => {
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.vy += piece.gravity;
    piece.vx *= .995;
    piece.rotation += piece.spin;
    if (piece.y > innerHeight * .72) piece.life -= .018;
    ctx.save();
    ctx.globalAlpha = Math.max(piece.life, 0);
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * .6);
    ctx.restore();
  });
  pieces = pieces.filter(piece => piece.life > 0 && piece.y < innerHeight + 40);
  if (pieces.length) animationFrame = requestAnimationFrame(drawConfetti);
  else ctx.clearRect(0, 0, innerWidth, innerHeight);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(item => observer.observe(item));

document.querySelector('#celebrateBtn').addEventListener('click', () => {
  celebrate();
  document.querySelector('#wish').scrollIntoView({ behavior: 'smooth' });
});

document.querySelector('#wishBtn').addEventListener('click', event => {
  document.querySelector('.cake').classList.add('blown');
  event.currentTarget.textContent = 'Wish granted ♡';
  celebrate(220);
});

const toast = document.querySelector('#toast');
document.querySelector('#shareBtn').addEventListener('click', async () => {
  const shareData = {
    title: 'Happy 25th Birthday, Clara!',
    text: 'A little birthday surprise for Clara Devinda Jaya Sutrisno ♡',
    url: location.href
  };
  try {
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(location.href);
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }
  } catch (error) {
    if (error.name !== 'AbortError') console.warn(error);
  }
});

let audioContext;
let playing = false;
document.querySelector('#soundBtn').addEventListener('click', event => {
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  const notes = [261.63, 329.63, 392, 523.25, 392, 440, 523.25];
  notes.forEach((frequency, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * .18);
    gain.gain.linearRampToValueAtTime(.09, now + index * .18 + .02);
    gain.gain.exponentialRampToValueAtTime(.001, now + index * .18 + .45);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now + index * .18);
    osc.stop(now + index * .18 + .46);
  });
  playing = !playing;
  event.currentTarget.classList.toggle('playing', playing);
  setTimeout(() => event.currentTarget.classList.remove('playing'), 1800);
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setTimeout(() => celebrate(90), 650);

const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
let progress = 0;
const progressInterval = setInterval(() => {
  progress += Math.random() * 6;
  if (progress > 100) progress = 100;
  loaderBar.style.width = progress + '%';
}, 60);

window.addEventListener('load', () => {
  loaderBar.style.width = '100%';
  setTimeout(() => {
    clearInterval(progressInterval);
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 700);
});

document.body.style.overflow = 'hidden';

const cursor = document.getElementById('cursorDot');
window.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('a, .cube, .hobby-card, .stat-card, .btn').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

const particleContainer = document.getElementById('particles');
const symbols = ['☕','🤎','✦'];
for (let i = 0; i < 22; i++) {
  const bean = document.createElement('span');
  bean.className = 'bean';
  bean.textContent = symbols[Math.floor(Math.random() * symbols.length)];
  bean.style.left = Math.random() * 100 + 'vw';
  bean.style.fontSize = 12 + Math.random() * 16 + 'px';
  const duration = 14 + Math.random() * 16;
  bean.style.animationDuration = duration + 's';
  bean.style.animationDelay = (Math.random() * duration) + 's';
  particleContainer.appendChild(bean);
}

const tiltCard = document.querySelector('.about-card-inner');
const tiltWrapper = document.querySelector('.tilt-card');
if (tiltWrapper) {
  tiltWrapper.addEventListener('mousemove', (e) => {
    const rect = tiltWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
  });
  tiltWrapper.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

const skillBars = document.querySelectorAll('.skill-bar span');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('filled');
    }
  });
}, { threshold: 0.4 });
skillBars.forEach(bar => skillObserver.observe(bar));

const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

revealEls.forEach(el => observer.observe(el));


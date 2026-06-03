/* ===== CURSOR ===== */
const dot  = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100;

// FIX: Only run custom cursor on non-touch devices
const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (isTouch) {
  document.documentElement.style.cursor = 'auto';
  if (dot)  dot.style.display  = 'none';
  if (ring) ring.style.display = 'none';
} else {
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  function animateCursor() {
    if (dot)  { dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'; }
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverEls = 'a, button, input, select, textarea, .service-card, .tool-card, .stat-card, .float-card, .process-step';
  document.querySelectorAll(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ===== NAV SCROLL + BACK TO TOP + FLOATING RESUME ===== */
let lastScrollY    = 0;
let scrollUpDistance = 0;
let scrollTicking  = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const currentY    = window.scrollY;
      const nav         = document.getElementById('nav');
      const aida        = document.getElementById('aida-banner');
      const backTop     = document.getElementById('back-top');
      const resumeFloat = document.getElementById('resume-float');

 if (currentY > lastScrollY && currentY > 80) {
        // Scrolling DOWN — hide immediately
        if (aida) aida.style.transform = `translateY(-${nav.offsetHeight}px)`;
        nav.classList.add('nav-hidden');
        scrollUpDistance = 0;
      } else if (currentY < lastScrollY) {
        // Scrolling UP — only show after 80px
        scrollUpDistance += lastScrollY - currentY;
        if (scrollUpDistance >= 200) {
          if (aida) aida.style.transform = 'translateY(0)';
          nav.classList.remove('nav-hidden');
        }
      }

      if (nav.scrollY > 20) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      if (backTop) {
        currentY > 500 ? backTop.classList.add('visible') : backTop.classList.remove('visible');
      }
      if (resumeFloat) {
        currentY > 300 ? resumeFloat.classList.add('visible') : resumeFloat.classList.remove('visible');
      }

      lastScrollY   = currentY;
      scrollTicking = false;
    });
    scrollTicking = true;
  }
}, { passive: true });

// Also handle the scrolled class separately (it uses scrollY directly)
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) {
    window.scrollY > 20 ? nav.classList.add('scrolled') : nav.classList.remove('scrolled');
  }
}, { passive: true });

/* ===== HAMBURGER ===== */
const ham       = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobile-nav');
let mobOpen = false;

function openMob() {
  mobOpen = true;
  ham.classList.add('open');
  mobileNav.style.display = 'flex';
  requestAnimationFrame(() => requestAnimationFrame(() => mobileNav.classList.add('open')));
  document.body.classList.add('mob-open');
}

function closeMob() {
  mobOpen = false;
  ham.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.classList.remove('mob-open');
  setTimeout(() => { if (!mobOpen) mobileNav.style.display = 'none'; }, 350);
}

ham.addEventListener('click', () => mobOpen ? closeMob() : openMob());

document.addEventListener('click', e => {
  if (mobOpen && !mobileNav.contains(e.target) && !ham.contains(e.target)) closeMob();
});

/* ===== SCROLL REVEAL ===== */
const revealEls = document.querySelectorAll('.reveal');
const ro = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el       = entry.target;
      const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
      const idx      = siblings.indexOf(el);
      el.style.transitionDelay = (idx * 0.08) + 's';
      el.classList.add('visible');
      ro.unobserve(el);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => ro.observe(el));

/* ===== GMAIL CONTACT FORM ===== */
function sendToGmail() {
  const fname   = document.getElementById('fname')   ? document.getElementById('fname').value.trim()   : '';
  const lname   = document.getElementById('lname')   ? document.getElementById('lname').value.trim()   : '';
  const email   = document.getElementById('femail')  ? document.getElementById('femail').value.trim()  : '';
  const service = document.getElementById('fservice')? document.getElementById('fservice').value       : '';
  const message = document.getElementById('fmessage')? document.getElementById('fmessage').value.trim(): '';

  // FIX: Validate first name too — no more "from Visitor"
  if (!fname) { alert('Please enter your first name so Xyrus knows who you are.'); return; }
  if (!email)  { alert('Please enter your email address so Xyrus can reply to you.'); return; }
  if (!message){ alert('Please write a message before sending.'); return; }

  const fullName = [fname, lname].filter(Boolean).join(' ');
  const subject  = service
    ? `[Portfolio Inquiry] ${service} — from ${fullName}`
    : `[Portfolio Inquiry] from ${fullName}`;

  const body = [
    `Hi Xyrus,`,
    ``,
    message,
    ``,
    `---`,
    `From: ${fullName}`,
    `Reply to: ${email}`,
    service ? `Service interested in: ${service}` : '',
    `Sent via: xyrusjamesservidor.com`,
  ].filter(l => l !== undefined && l !== '').join('\n');

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=xy.servidor.va@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, '_blank');

  const toast = document.getElementById('toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
}

/* ===== ACTIVE NAV HIGHLIGHT ===== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + cur ? 'var(--accent)' : '';
  });
}, { passive: true });

/* ===== AIDA TOGGLE ===== */
function setHeroPadding() {
  const banner     = document.getElementById('aida-banner');
  const toggleBar  = banner ? banner.querySelector('.aida-toggle-bar') : null;
  const toggleBarH = toggleBar ? toggleBar.offsetHeight : 46;
  document.documentElement.style.setProperty('--aida-h', toggleBarH + 'px');
}

function toggleAida() {
  const content = document.getElementById('aida-content');
  const icon    = document.getElementById('aida-icon');
  const banner  = document.getElementById('aida-banner');
  const isOpen  = content.classList.contains('open');

  if (isOpen) {
    content.classList.remove('open');
    icon.classList.remove('open');
    banner.classList.remove('aida-expanded');
    document.body.classList.remove('aida-open');
  } else {
    content.classList.add('open');
    icon.classList.add('open');
    banner.classList.add('aida-expanded');
    document.body.classList.add('aida-open');
  }
  setTimeout(setHeroPadding, 500);
}

function closeAida() {
  const content = document.getElementById('aida-content');
  const icon    = document.getElementById('aida-icon');
  const banner  = document.getElementById('aida-banner');
  content.classList.remove('open');
  icon.classList.remove('open');
  banner.classList.remove('aida-expanded');
  document.body.classList.remove('aida-open');
  setTimeout(setHeroPadding, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const content = document.getElementById('aida-content');
  const icon    = document.getElementById('aida-icon');
  const banner  = document.getElementById('aida-banner');
  if (content) content.classList.remove('open');
  if (icon)    icon.classList.remove('open');
  if (banner)  banner.classList.remove('aida-expanded');
  document.body.classList.remove('aida-open');
  setHeroPadding();
});

window.addEventListener('resize', setHeroPadding);

/* ===== FOREST CANVAS ===== */
const forestCanvas = document.getElementById('forest-canvas');
const fCtx         = forestCanvas.getContext('2d');

function resizeForest() {
  forestCanvas.width  = window.innerWidth;
  forestCanvas.height = window.innerHeight;
}
resizeForest();
window.addEventListener('resize', resizeForest);

const forestImg = new Image();
forestImg.src   = 'nature.png';

let fMouseX = window.innerWidth  / 2;
let fMouseY = window.innerHeight / 2;
document.addEventListener('mousemove', e => { fMouseX = e.clientX; fMouseY = e.clientY; });

const fLeaves = Array.from({ length: 30 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  size: 6 + Math.random() * 10,
  speedX: 0.3 + Math.random() * 0.5,
  speedY: -0.1 + Math.random() * 0.3,
  rot: Math.random() * Math.PI * 2,
  rotSpeed: (Math.random() - 0.5) * 0.04,
  color: ['#5a9a3a','#3d7a28','#7bc44a','#a8d060','#4e8c2f'][Math.floor(Math.random() * 5)],
  wobble: Math.random() * Math.PI * 2,
  wobbleSpeed: 0.02 + Math.random() * 0.02
}));

const fFlies = Array.from({ length: 25 }, () => ({
  x: Math.random() * window.innerWidth,
  y: Math.random() * window.innerHeight,
  vx: (Math.random() - 0.5) * 0.6,
  vy: (Math.random() - 0.5) * 0.6,
  alpha: Math.random(),
  alphaDir: (Math.random() > 0.5 ? 1 : -1) * 0.015,
  size: 2 + Math.random() * 2.5
}));

const fBirds = Array.from({ length: 5 }, (_, i) => ({
  x: -60 - i * 140,
  y: 60 + Math.random() * 120,
  speed: 0.8 + Math.random() * 0.7,
  wingPhase: Math.random() * Math.PI * 2,
  scale: 0.6 + Math.random() * 0.5
}));

let fT = 0;
// FIX: Track animation state so we can pause when tab is hidden
let forestAnimId  = null;
let forestPaused  = false;

function drawFLeaf(x, y, size, rot, color) {
  fCtx.save();
  fCtx.translate(x, y);
  fCtx.rotate(rot);
  fCtx.beginPath();
  fCtx.moveTo(0, -size);
  fCtx.bezierCurveTo(size*0.6, -size*0.5, size*0.6, size*0.5, 0, size*0.3);
  fCtx.bezierCurveTo(-size*0.6, size*0.5, -size*0.6, -size*0.5, 0, -size);
  fCtx.fillStyle  = color;
  fCtx.globalAlpha = 0.82;
  fCtx.fill();
  fCtx.restore();
}

function drawFBird(x, y, wingPhase, scale) {
  fCtx.save();
  fCtx.translate(x, y);
  fCtx.scale(scale, scale);
  const flap = Math.sin(wingPhase) * 6;
  fCtx.strokeStyle = 'rgba(20,15,5,0.75)';
  fCtx.lineWidth   = 1.5;
  fCtx.beginPath();
  fCtx.moveTo(-14, 0);
  fCtx.quadraticCurveTo(-7, flap, 0, 0);
  fCtx.quadraticCurveTo(7,  flap, 14, 0);
  fCtx.stroke();
  fCtx.restore();
}

function drawFLightRay() {
  const rx = fMouseX / window.innerWidth;
  fCtx.save();
  fCtx.globalAlpha = 0.07 + rx * 0.06;
  const grad = fCtx.createLinearGradient(fMouseX * 0.3, 0, fMouseX * 0.6 + 60, window.innerHeight);
  grad.addColorStop(0, 'rgba(255,240,180,0.9)');
  grad.addColorStop(1, 'rgba(255,240,180,0)');
  fCtx.fillStyle = grad;
  fCtx.beginPath();
  fCtx.moveTo(fMouseX * 0.2, 0);
  fCtx.lineTo(fMouseX * 0.2 + 40, 0);
  fCtx.lineTo(window.innerWidth * 0.5 + rx * 100, window.innerHeight);
  fCtx.lineTo(window.innerWidth * 0.3 + rx * 80,  window.innerHeight);
  fCtx.closePath();
  fCtx.fill();
  fCtx.restore();
}

function drawFWindRipple() {
  fCtx.save();
  fCtx.globalAlpha  = 0.09;
  fCtx.strokeStyle  = 'rgba(200,240,200,1)';
  fCtx.lineWidth    = 1;
  for (let i = 0; i < 3; i++) {
    const ox = (fMouseX / window.innerWidth - 0.5) * 30 + i * 18;
    fCtx.beginPath();
    fCtx.moveTo(fMouseX - 60 + ox, fMouseY - 20 + i * 15);
    fCtx.bezierCurveTo(fMouseX - 20 + ox, fMouseY - 30 + i * 15, fMouseX + 20 + ox, fMouseY - 10 + i * 15, fMouseX + 60 + ox, fMouseY - 20 + i * 15);
    fCtx.stroke();
  }
  fCtx.restore();
}

function forestFrame() {
  fT++;
  const W = forestCanvas.width;
  const H = forestCanvas.height;
  fCtx.clearRect(0, 0, W, H);

  if (forestImg.complete && forestImg.naturalWidth > 0) {
    fCtx.drawImage(forestImg, 0, 0, W, H);
  }

  fCtx.save();
  fCtx.globalAlpha = 0.35;
  fCtx.fillStyle   = 'rgba(5,20,5,1)';
  fCtx.fillRect(0, 0, W, H);
  fCtx.restore();

  drawFWindRipple();

  fLeaves.forEach(leaf => {
    leaf.wobble += leaf.wobbleSpeed;
    const windX  = (fMouseX / W - 0.5) * 1.2;
    leaf.x      += leaf.speedX + windX + Math.sin(leaf.wobble) * 0.5;
    leaf.y      += leaf.speedY + Math.cos(leaf.wobble) * 0.3;
    leaf.rot    += leaf.rotSpeed;
    if (leaf.x > W + 20) leaf.x = -20;
    if (leaf.y > H + 20) leaf.y = -20;
    if (leaf.y < -20)    leaf.y = H + 20;
    drawFLeaf(leaf.x, leaf.y, leaf.size, leaf.rot, leaf.color);
  });
  fCtx.globalAlpha = 1;

  fBirds.forEach(bird => {
    bird.x        += bird.speed;
    bird.y        += Math.sin(fT * 0.01 + bird.wingPhase) * 0.3;
    bird.wingPhase += 0.12;
    if (bird.x > W + 80) bird.x = -80;
    drawFBird(bird.x, bird.y, bird.wingPhase, bird.scale);
  });

  fFlies.forEach(fly => {
    const dx   = fMouseX - fly.x;
    const dy   = fMouseY - fly.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 140) { fly.vx += (dx / dist) * 0.04; fly.vy += (dy / dist) * 0.04; }
    fly.vx    *= 0.97; fly.vy *= 0.97;
    fly.x     += fly.vx;  fly.y  += fly.vy;
    fly.alpha += fly.alphaDir;
    if (fly.alpha > 1 || fly.alpha < 0.1) fly.alphaDir *= -1;
    if (fly.x < 0 || fly.x > W) fly.vx *= -1;
    if (fly.y < 0 || fly.y > H) fly.vy *= -1;
    fCtx.save();
    fCtx.globalAlpha = fly.alpha * 0.85;
    const grd = fCtx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.size * 3);
    grd.addColorStop(0, 'rgba(220,255,120,1)');
    grd.addColorStop(1, 'rgba(180,255,80,0)');
    fCtx.fillStyle = grd;
    fCtx.beginPath();
    fCtx.arc(fly.x, fly.y, fly.size * 3, 0, Math.PI * 2);
    fCtx.fill();
    fCtx.restore();
  });

  // FIX: Store the ID so we can cancel it on visibility change
  forestAnimId = requestAnimationFrame(forestFrame);
}

// FIX: Pause animation when tab is hidden, resume when visible again
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (forestAnimId) { cancelAnimationFrame(forestAnimId); forestAnimId = null; }
    forestPaused = true;
  } else {
    if (forestPaused) {
      forestPaused = false;
      forestAnimId = requestAnimationFrame(forestFrame);
    }
  }
});

forestImg.onload  = () => { forestAnimId = requestAnimationFrame(forestFrame); };
forestImg.onerror = () => { forestAnimId = requestAnimationFrame(forestFrame); };
if (forestImg.complete) { forestAnimId = requestAnimationFrame(forestFrame); }

/* ===== FLOATING RESUME BUTTON ===== */
const resumeFloat = document.getElementById('resume-float');
if (resumeFloat && !isTouch) {
  resumeFloat.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  resumeFloat.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
}

/* ===== NAV DROPDOWNS — FIX: single listener block only ===== */
document.querySelectorAll('.nav-item-drop').forEach(item => {
  const toggle = item.querySelector('.nav-drop-toggle');

  // Single click handler — e.preventDefault() only on desktop where CSS hover is handling display
  toggle.addEventListener('click', (e) => {
    // On mobile there's no hover, so we need the click to both toggle AND allow anchor nav
    // Only preventDefault on larger screens where hover already handles the dropdown
    if (window.innerWidth > 768) {
      e.preventDefault();
    }
    // Close other open dropdowns
    document.querySelectorAll('.nav-item-drop.open').forEach(other => {
      if (other !== item) other.classList.remove('open');
    });
    item.classList.toggle('open');
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (!item.contains(e.target)) item.classList.remove('open');
  });

  // Cursor hover on drop items (only relevant on non-touch)
  if (!isTouch) {
    item.querySelectorAll('.drop-item').forEach(link => {
      link.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      link.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }
});

/* ===== OPEN AIDA FROM NAV ===== */
function openAidaFromNav() {
  const content = document.getElementById('aida-content');
  const icon    = document.getElementById('aida-icon');
  if (content && !content.classList.contains('open')) {
    content.classList.add('open');
    icon.classList.add('open');
    setTimeout(setHeroPadding, 500);
  }
  setTimeout(() => {
    const banner = document.getElementById('aida-banner');
    if (banner) banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 300);
}

/* ===== FAQ ACCORDION ===== */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

if (!isTouch) {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    btn.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

/* ===== SKILL BAR ANIMATION ===== */
const skillBars       = document.querySelectorAll('.skill-bar-fill');
const skillBarObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target;
      const pct  = fill.getAttribute('data-pct');
      setTimeout(() => { fill.style.width = pct + '%'; }, 200);
      skillBarObserver.unobserve(fill);
    }
  });
}, { threshold: 0.3 });
skillBars.forEach(bar => skillBarObserver.observe(bar));

/* ── Sample data ── */
const emailSamples = [
  { src: 'inboxorganize.png',   num: '01', title: 'Inbox Organization' },
  { src: 'template.png',      num: '02', title: 'Email Templates' },
  { src: 'filtering.jpg',   num: '03', title: 'Filters & Automation' },
  { src: 'calendar.png',      num: '04', title: 'Calendar Coordination' },
  { src: 'response.jpg',          num: '05', title: 'Professional Email Response' },
];
 
/* ── Modal open/close ── */
function openEmailModal() {
  const modal = document.getElementById('email-modal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.classList.add('mob-open');
}
 
function closeEmailModal(e) {
  if (e && e.target !== document.getElementById('email-modal')) return;
  const modal = document.getElementById('email-modal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.classList.remove('mob-open');
}
 
/* ── Lightbox state ── */
let lbIndex   = 0;
let lbScale   = 1;
let lbPanX    = 0;
let lbPanY    = 0;
let lbDragging = false;
let lbDidDrag  = false;
let lbDragStartX = 0;
let lbDragStartY = 0;
let lbPanStartX  = 0;
let lbPanStartY  = 0;
 
const LB_MIN_SCALE = 0.5;
const LB_MAX_SCALE = 4;
const LB_STEP      = 0.4;
 
function openLightbox(index) {
  lbIndex = index;
  lbScale = 1; lbPanX = 0; lbPanY = 0;
 
  const lb    = document.getElementById('lightbox');
  const img   = document.getElementById('lb-img');
  const s     = emailSamples[index];
 
  img.src = s.src;
  img.alt = s.title;
  document.getElementById('lb-cap-num').textContent   = s.num;
  document.getElementById('lb-cap-title').textContent = s.title;
  document.getElementById('lightbox-counter').textContent = `${index + 1} / ${emailSamples.length}`;
  document.getElementById('lb-zoom-label').textContent = '100%';
 
  lbApplyTransform();
  lb.classList.add('open');
  document.body.classList.add('mob-open');
}
 
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.classList.remove('mob-open');
  const modal = document.getElementById('email-modal');
  if (modal) { modal.classList.add('open'); document.body.classList.add('mob-open'); }
  if (!isTouch) {
  if (dot)  dot.style.display  = '';
  if (ring) ring.style.display = '';
}
}
 
function closeLightboxOnBg(e) {
  if (lbDragging || lbDidDrag) return;
  if (e.target === document.getElementById('lightbox')) {
    closeLightbox();
  }
}
 
function lbPrev() {
  lbIndex = (lbIndex - 1 + emailSamples.length) % emailSamples.length;
  lbLoadCurrent();
}
 
function lbNext() {
  lbIndex = (lbIndex + 1) % emailSamples.length;
  lbLoadCurrent();
}
 
function lbLoadCurrent() {
  lbScale = 1; lbPanX = 0; lbPanY = 0;
  const s   = emailSamples[lbIndex];
  const img = document.getElementById('lb-img');
  img.style.transition = 'opacity .2s';
  img.style.opacity = '0';
  setTimeout(() => {
    img.src = s.src;
    img.alt = s.title;
    img.style.opacity = '1';
  }, 150);
  document.getElementById('lb-cap-num').textContent   = s.num;
  document.getElementById('lb-cap-title').textContent = s.title;
  document.getElementById('lightbox-counter').textContent = `${lbIndex + 1} / ${emailSamples.length}`;
  document.getElementById('lb-zoom-label').textContent = '100%';
  lbApplyTransform();
}
 
function lbApplyTransform() {
  const img = document.getElementById('lb-img');
  img.style.transform = `scale(${lbScale}) translate(${lbPanX / lbScale}px, ${lbPanY / lbScale}px)`;
  document.getElementById('lb-zoom-label').textContent = Math.round(lbScale * 100) + '%';
}
 
function lbZoomIn() {
  lbScale = Math.min(lbScale + LB_STEP, LB_MAX_SCALE);
  lbApplyTransform();
}
 
function lbZoomOut() {
  lbScale = Math.max(lbScale - LB_STEP, LB_MIN_SCALE);
  if (lbScale <= 1) { lbPanX = 0; lbPanY = 0; }
  lbApplyTransform();
}
 
function lbZoomReset() {
  lbScale = 1; lbPanX = 0; lbPanY = 0;
  lbApplyTransform();
}
 
/* Mouse wheel zoom */
document.addEventListener('wheel', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb.classList.contains('open')) return;
  e.preventDefault();
  if (e.deltaY < 0) lbZoomIn();
  else lbZoomOut();
}, { passive: false });
 
/* Drag to pan */
const lbWrap = document.getElementById('lb-img-wrap');
if (lbWrap) {
  lbWrap.addEventListener('mousedown', (e) => {
    if (lbScale <= 1) return;
    lbDragging  = true;
    lbDidDrag   = false;
    lbDragStartX = e.clientX;
    lbDragStartY = e.clientY;
    lbPanStartX  = lbPanX;
    lbPanStartY  = lbPanY;
    lbWrap.classList.add('grabbing');
  });
 
  document.addEventListener('mousemove', (e) => {
    if (!lbDragging) return;
    lbDidDrag = true;
    lbPanX = lbPanStartX + (e.clientX - lbDragStartX);
    lbPanY = lbPanStartY + (e.clientY - lbDragStartY);
    lbApplyTransform();
  });
 
  document.addEventListener('mouseup', () => {
    lbDragging = false;
    if (lbWrap) lbWrap.classList.remove('grabbing');
    // Reset didDrag after a tiny delay so the click event fires first
    setTimeout(() => { lbDidDrag = false; }, 50);
  });
 
  /* Touch pinch zoom */
  let lbTouchDist = 0;
  lbWrap.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lbTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });
 
  lbWrap.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = newDist - lbTouchDist;
      lbTouchDist = newDist;
      lbScale = Math.min(Math.max(lbScale + delta * 0.01, LB_MIN_SCALE), LB_MAX_SCALE);
      lbApplyTransform();
    }
  }, { passive: false });
}
 
/* Keyboard navigation */
document.addEventListener('keydown', (e) => {
  const lb    = document.getElementById('lightbox');
  const modal = document.getElementById('email-modal');
 
  if (lb && lb.classList.contains('open')) {
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lbPrev();
    if (e.key === 'ArrowRight')  lbNext();
    if (e.key === '+' || e.key === '=') lbZoomIn();
    if (e.key === '-')           lbZoomOut();
    if (e.key === '0')           lbZoomReset();
    return;
  }
 
  if (modal && modal.classList.contains('open') && e.key === 'Escape') {
    modal.classList.remove('open');
    document.body.classList.remove('mob-open');
  }
});

// ============================================
// MINIMAL PARTICLE CANVAS ANIMATION
// ============================================
const canvas = document.getElementById('backgroundCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 50; // Reduced for better performance

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.3 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.fillStyle = `rgba(102, 126, 234, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize particles
for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

// Connect nearby particles with subtle lines
function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                const opacity = (1 - distance / 120) * 0.15;
                ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
            }
        }
    }
}

// Smooth animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
}

animate();

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// ============================================
// SMOOTH & CREATIVE MOUSE FOLLOWER
// (Desktop-with-a-mouse only. On touch devices, or once the layout
// drops to the mobile sidebar breakpoint, the follower is fully
// disabled instead of just hidden with CSS, so it never has to be
// "unstuck" with a reload after resizing/rotating the device.)
// ============================================
const cursorFollower = document.getElementById('cursorFollower');
let mouseX = 0;
let mouseY = 0;
let followerX = 0;
let followerY = 0;
let ringX = 0;
let ringY = 0;

// Create outer ring for cursor
const cursorRing = document.createElement('div');
cursorRing.style.position = 'fixed';
cursorRing.style.width = '40px';
cursorRing.style.height = '40px';
cursorRing.style.border = '2px solid rgba(102, 126, 234, 0.6)';
cursorRing.style.borderRadius = '50%';
cursorRing.style.pointerEvents = 'none';
cursorRing.style.zIndex = '9998';
cursorRing.style.willChange = 'transform';
cursorRing.style.mixBlendMode = 'difference';
cursorRing.style.left = '0';
cursorRing.style.top = '0';
document.body.appendChild(cursorRing);

// Create trail effect
const trailDots = [];
const trailLength = 6; // Reduced for better performance

for (let i = 0; i < trailLength; i++) {
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.width = '8px';
    dot.style.height = '8px';
    dot.style.borderRadius = '50%';
    dot.style.background = `rgba(102, 126, 234, ${0.7 - i * 0.1})`;
    dot.style.pointerEvents = 'none';
    dot.style.zIndex = '9997';
    dot.style.willChange = 'transform';
    dot.style.left = '0';
    dot.style.top = '0';
    document.body.appendChild(dot);
    trailDots.push({ element: dot, x: 0, y: 0 });
}

const hoverElements = document.querySelectorAll('button, a, .portfolio-item, .filter-btn, .service-item, .testimonial-card, .stat');

function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

function onHoverEnter() {
    cursorFollower.style.width = '36px';
    cursorFollower.style.height = '36px';
    cursorFollower.style.opacity = '0.7';
    cursorRing.style.width = '60px';
    cursorRing.style.height = '60px';
    cursorRing.style.borderColor = 'rgba(118, 75, 162, 0.8)';
}

function onHoverLeave() {
    cursorFollower.style.width = '24px';
    cursorFollower.style.height = '24px';
    cursorFollower.style.opacity = '0.5';
    cursorRing.style.width = '40px';
    cursorRing.style.height = '40px';
    cursorRing.style.borderColor = 'rgba(102, 126, 234, 0.6)';
}

function onMouseDown() {
    cursorFollower.style.transform = 'scale(0.7)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(0.7)';
}

function onMouseUp() {
    cursorFollower.style.transform = 'scale(1)';
    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
}

let cursorFrameId = null;

function animateFollower() {
    // Faster, smoother following
    const mainSpeed = 0.25; // Increased speed
    const ringSpeed = 0.2;   // Ring follows slightly slower

    // Main follower
    followerX += (mouseX - followerX) * mainSpeed;
    followerY += (mouseY - followerY) * mainSpeed;

    // Ring follower
    ringX += (mouseX - ringX) * ringSpeed;
    ringY += (mouseY - ringY) * ringSpeed;

    // Use transform for better performance
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    // Update trail dots with smooth delay
    trailDots.forEach((dot, index) => {
        const delay = 0.15 - (index * 0.02); // Smoother progression
        dot.x += (followerX - dot.x) * delay;
        dot.y += (followerY - dot.y) * delay;
        dot.element.style.transform = `translate(${dot.x}px, ${dot.y}px) translate(-50%, -50%)`;
    });

    cursorFrameId = requestAnimationFrame(animateFollower);
}

// Only real "fine pointer" desktops (a mouse, not a finger) get the
// custom cursor, and only above the sidebar breakpoint. This is
// re-checked on every resize/orientation change instead of once on
// load, which is what used to leave the follower half-alive and
// laggy until a manual reload.
const desktopCursorQuery = window.matchMedia('(min-width: 1025px) and (pointer: fine)');
let customCursorActive = false;

function enableCustomCursor() {
    if (customCursorActive) return;
    customCursorActive = true;

    document.body.style.cursor = 'none';
    document.querySelectorAll('a, button, input, textarea, .portfolio-item, .filter-btn').forEach(el => {
        el.style.cursor = 'none';
    });

    cursorFollower.style.display = '';
    cursorRing.style.display = '';
    trailDots.forEach(dot => { dot.element.style.display = ''; });

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', onHoverEnter);
        element.addEventListener('mouseleave', onHoverLeave);
    });
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);

    if (cursorFrameId === null) {
        animateFollower();
    }
}

function disableCustomCursor() {
    if (!customCursorActive) return;
    customCursorActive = false;

    document.body.style.cursor = '';
    document.querySelectorAll('a, button, input, textarea, .portfolio-item, .filter-btn').forEach(el => {
        el.style.cursor = '';
    });

    cursorFollower.style.display = 'none';
    cursorRing.style.display = 'none';
    trailDots.forEach(dot => { dot.element.style.display = 'none'; });

    document.removeEventListener('mousemove', onMouseMove);
    hoverElements.forEach(element => {
        element.removeEventListener('mouseenter', onHoverEnter);
        element.removeEventListener('mouseleave', onHoverLeave);
    });
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);

    if (cursorFrameId !== null) {
        cancelAnimationFrame(cursorFrameId);
        cursorFrameId = null;
    }
}

function syncCustomCursor() {
    if (desktopCursorQuery.matches) {
        enableCustomCursor();
    } else {
        disableCustomCursor();
    }
}

syncCustomCursor();
// Modern browsers fire 'change' on the MediaQueryList itself, which is
// cheaper and more reliable than listening to every 'resize' event.
if (desktopCursorQuery.addEventListener) {
    desktopCursorQuery.addEventListener('change', syncCustomCursor);
} else {
    desktopCursorQuery.addListener(syncCustomCursor); // Safari < 14 fallback
}

// ============================================
// MOBILE MENU FUNCTIONALITY
// ============================================
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileHeader = document.getElementById('mobileHeader');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuToggle.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
    });
}

// Mobile navigation buttons
const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
mobileNavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            mobileMenu.classList.remove('active');
            menuToggle.textContent = '☰';
        }
    });
});

// Show mobile header on smaller screens
function updateMobileHeader() {
    if (window.innerWidth < 1024) {
        mobileHeader.classList.add('active');
    } else {
        mobileHeader.classList.remove('active');
        mobileMenu.classList.remove('active');
    }
}

window.addEventListener('resize', updateMobileHeader);
updateMobileHeader();

// ============================================
// DESKTOP NAVIGATION
// ============================================
const navButtons = document.querySelectorAll('.nav-btn');
navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const section = e.target.dataset.section;
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            navButtons.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ACTIVE NAV
// ============================================
const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.section === id) {
                    btn.classList.add('active');
                }
            });
        }
    });
}, { threshold: 0.3 });

sections.forEach(section => observer.observe(section));

// ============================================
// PORTFOLIO FILTER FUNCTIONALITY
// ============================================
const filterButtons = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.dataset.filter;

        portfolioItems.forEach(item => {
            if (filterValue === 'all' || item.dataset.category === filterValue) {
                item.style.display = 'block';
                item.style.animation = 'fadeInUp 0.6s ease';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

// ============================================
// CONTACT FORM SUBMISSION
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// SMOOTH SCROLL REVEAL ANIMATION
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for reveal animation
document.querySelectorAll('.service-item, .portfolio-item, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObserver.observe(el);
});

// ============================================
// SUBTLE PARALLAX EFFECT FOR HERO IMAGE
// (Desktop only. This is what was pushing the profile photo down
// into the Portfolio section on phones: the translateY offset kept
// growing with scroll position but the hero section's own height
// doesn't change, so on short mobile viewports the image visually
// drifted into whatever section came after it. Below the tablet
// breakpoint we simply never touch the image's transform.)
// ============================================
let ticking = false;
const parallaxQuery = window.matchMedia('(min-width: 1025px)');

function updateParallax() {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image img');

    if (heroImage) {
        if (parallaxQuery.matches && scrolled < window.innerHeight) {
            heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
        } else {
            heroImage.style.transform = '';
        }
    }

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
}, { passive: true });

// Reset immediately if the viewport crosses the breakpoint (resize,
// device rotation) instead of waiting for the next scroll event.
if (parallaxQuery.addEventListener) {
    parallaxQuery.addEventListener('change', updateParallax);
} else {
    parallaxQuery.addListener(updateParallax);
}

// ============================================
// SMOOTH PAGE LOADING ANIMATION
// ============================================
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

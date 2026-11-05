'use strict';
/* ============================================
   BIRTHDAY SURPRISE — script.js
   ============================================ */


/* ─── 1. LOADING SCREEN ─────────────────────
   Fakes a progress bar, then fades out.
   Music starts after the loading screen is dismissed.
──────────────────────────────────────────── */
(function initLoader() {
    const loader = document.getElementById('loader');
    const fill = document.getElementById('loaderFill');
    const startButton = document.getElementById('loaderStart');

    let progress = 0;
    let loadingFinished = false;
    let loadingReady = false;
    const interval = setInterval(() => {
        progress += Math.random() * 18 + 8;
        if (progress >= 100) { progress = 100; clearInterval(interval); }
        fill.style.width = progress + '%';
    }, 120);

    const showStartButton = () => {
        if (loadingReady || loadingFinished) return;
        loadingReady = true;
        clearInterval(interval);
        fill.style.width = '100%';
        loader.classList.add('ready');
        startButton.disabled = false;
    };

    const finishLoading = () => {
        if (loadingFinished || !loadingReady) return;
        loadingFinished = true;
        loader.classList.add('hidden');
        document.dispatchEvent(new Event('loadingcomplete'));
    };

    startButton.addEventListener('click', finishLoading);

    // Wait until page resources are ready before asking the user to start.
    window.addEventListener('load', () => {
        setTimeout(showStartButton, 450);
    });

    // Do not block the page if a resource prevents the load event from firing.
    setTimeout(showStartButton, 3000);
})();


/* ─── 2. FLOATING PARTICLES ─────────────────
──────────────────────────────────────────── */
(function initParticles() {
    const container = document.getElementById('particles');
    const EMOJIS = ['❤️', '💕', '✨', '🌸', '💖', '⭐', '💫', '🎀', '🌺', '💝', '🦋', '🌟'];
    const COUNT = 28;

    for (let i = 0; i < COUNT; i++) {
        const el = document.createElement('span');
        el.classList.add('particle');
        el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const size = Math.random() * 16 + 10;
        el.style.cssText = `
      font-size: ${size}px;
      left: ${Math.random() * 100}%;
      animation-duration: ${Math.random() * 18 + 12}s;
      animation-delay: -${Math.random() * 20}s;
    `;
        container.appendChild(el);
    }
})();


/* ─── 3. LAZY VIDEO LOADER ──────────────────
   Videos are NOT loaded on page start.
   When a .lazy-video scrolls into view:
   1. src is set from data-src
   2. video.play() is called (muted, so allowed)
   When it scrolls out: video.pause() to save CPU.
──────────────────────────────────────────── */
(function initLazyVideos() {
    const videos = document.querySelectorAll('video.lazy-video');
    if (!videos.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            const card = video.closest('.video-card');

            if (entry.isIntersecting) {
                // Load src the first time
                if (!video.src && video.dataset.src) {
                    video.src = video.dataset.src;
                    video.load();
                }
                video.play().then(() => {
                    if (card) card.classList.add('playing');
                }).catch(() => { }); // Autoplay blocked — user can scroll again or tap
            } else {
                video.pause();
                if (card) card.classList.remove('playing');
            }
        });
    }, {
        threshold: 0.25,   // 25% visible before triggering
        rootMargin: '80px' // start loading slightly before entering view
    });

    videos.forEach(v => observer.observe(v));
})();


/* ─── 4. IMAGE SHIMMER REMOVAL ──────────────
   Remove shimmer ::before once image has loaded.
──────────────────────────────────────────── */
(function initImageLoad() {
    document.querySelectorAll('.photo-wrapper img').forEach(img => {
        const wrapper = img.parentElement;
        const mark = () => wrapper.classList.add('loaded');
        if (img.complete && img.naturalWidth > 0) { mark(); return; }
        img.addEventListener('load', mark);
        img.addEventListener('error', mark); // also remove shimmer on 404
    });
})();


/* ─── 5. LETTER MODAL ───────────────────────
──────────────────────────────────────────── */
(function initModal() {
    const modal = document.getElementById('letterModal');
    const btnOpen = document.getElementById('btnOpenLetter');
    const btnClose = document.getElementById('btnCloseModal');

    const open = () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    const close = () => { modal.classList.remove('active'); document.body.style.overflow = ''; };

    btnOpen.addEventListener('click', open);
    btnClose.addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ─── 6. MUSIC PLAYER ───────────────────────
──────────────────────────────────────────── */
(function initMusicPlayer() {
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('btnPlayPause');
    const disc = document.getElementById('playerDisc');
    const volEl = document.getElementById('volumeSlider');
    const volIcon = document.querySelector('.volume-icon');
    const status = document.getElementById('playerStatus');
    let playbackPending = false;

    audio.volume = parseFloat(volEl.value);

    const setPlaying = (playing) => {
        btn.textContent = playing ? '⏸' : '▶';
        btn.title = playing ? 'Jeda musik' : 'Putar musik';
        btn.setAttribute('aria-label', btn.title);
        disc.classList.toggle('spinning', playing);
    };

    const playAudio = async () => {
        if (playbackPending || !audio.paused) return;
        playbackPending = true;
        status.textContent = 'Mencoba memutar musik…';
        try {
            await audio.play();
            setPlaying(true);
            status.textContent = 'Sedang diputar';
        } catch {
            setPlaying(false);
            status.textContent = 'Ketuk ▶ untuk memutar';
        } finally {
            playbackPending = false;
        }
    };

    btn.addEventListener('click', () => {
        if (audio.paused) {
            playAudio();
        } else {
            audio.pause();
            setPlaying(false);
            status.textContent = 'Dijeda';
        }
    });

    audio.addEventListener('play', () => {
        setPlaying(true);
        status.textContent = 'Memuat musik…';
    });

    audio.addEventListener('playing', () => {
        setPlaying(true);
        status.textContent = 'Sedang diputar';
    });

    audio.addEventListener('error', () => {
        setPlaying(false);
        status.textContent = 'Musik tidak dapat dimuat';
    });

    audio.addEventListener('pause', () => {
        if (audio.ended) return;
        setPlaying(false);
    });

    volEl.addEventListener('input', () => {
        const v = parseFloat(volEl.value);
        audio.volume = v;
        volIcon.textContent = v === 0 ? '🔇' : v < 0.4 ? '🔉' : '🔊';
    });

    document.addEventListener('loadingcomplete', playAudio, { once: true });
})();


/* ─── 7. SCROLL-REVEAL (Wish Cards) ─────────
──────────────────────────────────────────── */
(function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting, target }) => {
            if (!isIntersecting) return;
            const delay = parseInt(target.dataset.delay || '0', 10);
            setTimeout(() => target.classList.add('visible'), delay);
            observer.unobserve(target);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.wish-card').forEach(c => observer.observe(c));
})();


/* ─── 8. CANDLE BLOW + CONFETTI ─────────────
──────────────────────────────────────────── */
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');
let pieces = [], animId;

(function initCandleBlow() {
    const btn = document.getElementById('btnBlow');
    const flames = document.querySelectorAll('.flame');
    let blown = false;

    btn.addEventListener('click', () => {
        if (blown) return;
        blown = true;
        flames.forEach((f, i) => setTimeout(() => f.classList.add('out'), i * 280));
        setTimeout(() => {
            launchConfetti();
            btn.textContent = 'Selamat Ulang Tahun';
            btn.disabled = true;
        }, flames.length * 280 + 200);
    });
})();

function launchConfetti() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const COLORS = ['#ff6eb4', '#ffd700', '#c850c0', '#9b5de5', '#fff', '#ff4d8d', '#ffe066', '#b388ff'];
    pieces = Array.from({ length: 160 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vy: Math.random() * 3 + 2,
        vx: (Math.random() - 0.5) * 3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.18,
    }));
    cancelAnimationFrame(animId);
    drawConfetti();
    setTimeout(() => { cancelAnimationFrame(animId); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 5000);
}

function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach(c => {
        c.y += c.vy; c.x += c.vx; c.angle += c.spin;
        if (c.y < canvas.height) alive = true;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
    });
    if (alive) animId = requestAnimationFrame(drawConfetti);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

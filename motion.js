/* Independent scene modules: entrance, hero, gallery, blueprint.
   Extend the page by appending sections and registering a new scene in setupMotion. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  try { const preference = localStorage.getItem('gummy-motion'); if (preference) reduced = preference === 'off'; } catch {}
  let heroTimeline, scrollContext, entryTimeline, entryComplete = false, disposed = false;
  const loader = $('#loader');
  const available = !!window.gsap && !!window.ScrollTrigger;
  const controls = [$('.site-header'), $('main'), $('footer')];
  const setInert = (value) => controls.forEach(el => el.inert = value);
  const setMotionButton = () => { $('#motion-toggle').textContent = reduced ? 'Motion off' : 'Motion on'; $('#motion-toggle').setAttribute('aria-pressed', String(reduced)); document.body.classList.toggle('reduced-motion', reduced); };
  const splitStory = () => {
    const p = $('.story-copy');
    const text = p.textContent.trim();
    p.setAttribute('aria-label', text);
    p.innerHTML = text.split(/\s+/).map(word => `<span class="word" aria-hidden="true">${word}</span>`).join(' ');
  };
  const createGummies = () => {
    const holder = $('.gummy-pop');
    for (let i = 0; i < 12; i++) {
      const img = new Image(); img.src = '/assets/gummy.webp'; img.alt = ''; img.className = 'pop-candy';
      img.style.left = `${4 + (i * 8.07) % 90}%`;
      img.style.filter = `hue-rotate(${[0,65,150,220][i % 4]}deg) drop-shadow(5px 10px 6px #8a318d33)`;
      holder.append(img);
    }
  };
  function playHero() {
    if (!available || reduced || disposed) return;
    heroTimeline?.kill();
    const height = $('.hero').clientHeight;
    const mobile = innerWidth <= 600;
    const restY = mobile ? 20 : Math.max(0, (height - 800) / 3);
    gsap.set('.claw-stage', { y: -height - 500, rotation: 0, autoAlpha: 1 });
    gsap.set('.hero-pack', { autoAlpha: 0 });
    gsap.set('.pop-candy', { y: 0, rotation: 0, scale: .7, autoAlpha: 1 });
    gsap.set('.hero-finish', { autoAlpha: 0, y: 20 });
    $('#replay').disabled = true;
    heroTimeline = gsap.timeline({ onComplete: () => $('#replay').disabled = false });
    heroTimeline.to('.claw-stage', { y: height - (mobile ? 280 : 320), duration: 1.8, ease: 'power2.inOut' })
      .set('.hero-pack', { autoAlpha: 1 })
      .to('.claw-stage', { rotation: -8, duration: .3, ease: 'power1.inOut' })
      .to('.claw-stage', { y: restY, duration: 1.7, ease: 'power2.inOut' })
      .addLabel('pop', '-=.6');
    $$('.pop-candy').forEach((el, i) => {
      const lift = height * (.42 + ((i * 17) % 40) / 100);
      heroTimeline.to(el, { y: -lift, rotation: -55 + i * 31, scale: .75 + i % 3 * .2, duration: .8 + i % 4 * .12, ease: 'power2.out' }, `pop+=${i * .075}`);
      heroTimeline.to(el, { y: -lift + 30, duration: .8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, `pop+=${1.2 + i * .04}`);
    });
    heroTimeline.to('.claw-stage', { y: -height - 550, rotation: 5, duration: 1.35, ease: 'power2.in' }, 'pop+=2.6')
      .to('.pop-candy', { y: 200, rotation: '+=140', duration: 1.2, stagger: .045, ease: 'power2.in' }, 'pop+=3.4')
      .to('.hero-finish', { autoAlpha: 1, y: 0, duration: .65, ease: 'power2.out' }, 'pop+=4.2');
  }
  function animateSteam(chamber) {
    const steam = $('.steam', chamber);
    gsap.fromTo(steam, { y: 0, opacity: .9, scale: .5 }, { y: -100, opacity: 0, scale: 1.8, duration: 1.1, ease: 'power1.out' });
  }
  function setupMotion() {
    setMotionButton();
    if (!available) { document.body.classList.add('reduced-motion'); return; }
    scrollContext?.revert(); heroTimeline?.kill();
    gsap.set('.hero-finish', { clearProps: 'all' });
    gsap.set('.claw-stage', { autoAlpha: reduced ? 0 : 1 });
    gsap.set('.pop-candy', { y: 0 });
    $('#replay').disabled = reduced;
    gsap.set('.blueprint-products', { autoAlpha: 1 });
    if (reduced) return;
    scrollContext = gsap.context(() => {
      gsap.fromTo('.story-copy .word', { opacity: .22 }, { opacity: 1, stagger: .07, ease: 'none', scrollTrigger: { trigger: '.story-copy', start: 'top 83%', end: 'bottom 48%', scrub: .5 } });
      const mm = gsap.matchMedia();
      mm.add('(min-width: 601px)', () => {
        const track = $('.chamber-track');
        const distance = () => Math.max(0, track.scrollWidth - innerWidth + innerWidth * .05);
        const gallery = gsap.to(track, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: '.classics-pin', start: 'top top', end: () => '+=' + Math.max(900, distance() * 1.8), pin: true, scrub: .75, invalidateOnRefresh: true, onUpdate: self => { $('.gallery-progress i').style.width = `${33 + self.progress * 67}%`; } } });
        $$('.chamber').forEach((chamber, i) => {
          const config = i === 0 ? { trigger: '.classics', start: 'top 60%', toggleActions: 'play none none reverse' } : { trigger: chamber, containerAnimation: gallery, start: 'left 90%', toggleActions: 'play none none reverse' };
          gsap.from($('.chamber-pack', chamber), { y: -620, rotation: i % 2 ? 8 : -8, duration: 1.2, ease: 'bounce.out', scrollTrigger: config, onComplete: () => animateSteam(chamber) });
        });
        const blueprint = gsap.timeline({ scrollTrigger: { trigger: '.blueprint-pin', start: 'top top', end: '+=1400', scrub: .7, pin: true } });
        blueprint.to('.blueprint-art', { rotation: 4, duration: 1.5 }, 0)
          .to('.facts', { autoAlpha: 0, y: -25, duration: .7 }, .6)
          .fromTo('.blue-product-left', { x: -innerWidth * .6, rotation: -30, autoAlpha: 0 }, { x: 0, rotation: -16, autoAlpha: 1, duration: 1.1 }, 1.3)
          .fromTo('.blue-product-right', { x: innerWidth * .6, rotation: 30, autoAlpha: 0 }, { x: 0, rotation: 15, autoAlpha: 1, duration: 1.1 }, 2.2)
          .from('.blueprint-payoff', { autoAlpha: 0, y: 20, duration: .5 }, 3.1)
          .to({}, { duration: .6 });
      });
      mm.add('(max-width: 600px)', () => {
        $$('.chamber').forEach(chamber => gsap.from($('.chamber-pack', chamber), { y: -600, duration: 1.2, ease: 'bounce.out', scrollTrigger: { trigger: chamber, start: 'top 75%', once: true }, onComplete: () => animateSteam(chamber) }));
        gsap.from('.blue-product-left', { x: -220, opacity: 0, duration: 1, scrollTrigger: { trigger: '.blueprint-products', start: 'top 85%', end: 'center 65%', scrub: .6 } });
        gsap.from('.blue-product-right', { x: 220, opacity: 0, duration: 1, scrollTrigger: { trigger: '.blueprint-products', start: 'top 75%', end: 'center 55%', scrub: .6 } });
      });
    });
    ScrollTrigger.refresh();
  }
  function finishEntry(animateHero = true) {
    if (entryComplete) return;
    entryComplete = true;
    entryTimeline?.kill();
    loader.hidden = true;
    document.body.classList.remove('loading');
    setInert(false);
    if (loader.contains(document.activeElement)) $('.wordmark').focus({ preventScroll: true });
    if (available) { ScrollTrigger.refresh(); if (animateHero && !reduced && scrollY < 200) playHero(); else gsap.set('.claw-stage', { autoAlpha: 0 }); }
  }
  async function startEntry() {
    if (!available || reduced || location.hash) { finishEntry(false); return; }
    loader.hidden = false; document.body.classList.add('loading'); setInert(true);
    const oldFocus = document.activeElement;
    $('#skip-intro').focus({ preventScroll: true });
    const critical = ['factory.webp', 'claw.webp', 'gummy.webp', 'watermelon.png', 'chamber.webp'];
    let loaded = 0;
    const progress = { value: 0 };
    const update = () => {
      const value = Math.round(progress.value);
      $('.pixel-progress>div').style.width = `${value}%`;
      $('.pixel-progress').setAttribute('aria-valuenow', value);
      $('.load-number').textContent = `${value}%`;
    };
    await Promise.all(critical.map(src => new Promise(resolve => {
      const im = new Image(); let done = false;
      const complete = () => { if (done) return; done = true; loaded++; if (!entryComplete) gsap.to(progress, { value: loaded / critical.length * 100, duration: .35, onUpdate: update }); resolve(); };
      im.onload = complete; im.onerror = complete; im.src = '/assets/' + src;
      setTimeout(complete, 7000);
    })));
    if (entryComplete) return;
    entryTimeline = gsap.timeline({ delay: .7, onComplete: () => { finishEntry(); if (oldFocus && oldFocus !== document.body) oldFocus.focus({ preventScroll: true }); } });
    entryTimeline.to('.loader-copy', { opacity: 0, y: 15, duration: .4 })
      .to('.loader-scene', { scale: 7, duration: 1.45, ease: 'power3.in' }, '-=.1')
      .to('.factory-doors', { opacity: 1, duration: .15 }, '-=.7')
      .to('.factory-doors i:first-child', { rotationY: -95, duration: .65, ease: 'power2.inOut' }, '-=.7')
      .to('.factory-doors i:last-child', { rotationY: 95, duration: .65, ease: 'power2.inOut' }, '<')
      .to('.glass-door', { opacity: 1, duration: .2 }, '-=.25')
      .to('.loader-scene', { opacity: 0, duration: .2 })
      .set(loader, { background: 'transparent' })
      .to('.glass-left', { xPercent: -102, duration: .8, ease: 'power2.inOut' })
      .to('.glass-right', { xPercent: 102, duration: .8, ease: 'power2.inOut' }, '<');
  }
  splitStory(); createGummies();
  if (available) gsap.registerPlugin(ScrollTrigger);
  setupMotion(); startEntry();
  $('#skip-intro').addEventListener('click', () => { finishEntry(); $('#replay').focus({ preventScroll: true }); });
  $('#replay').addEventListener('click', playHero);
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !entryComplete) finishEntry(); });
  $('#motion-toggle').addEventListener('click', () => {
    reduced = !reduced; try { localStorage.setItem('gummy-motion', reduced ? 'off' : 'on'); } catch {}
    setupMotion();
    if (!reduced && scrollY < $('.hero').clientHeight) playHero();
  });
  motionQuery.addEventListener('change', event => { reduced = event.matches; setupMotion(); if (reduced) finishEntry(false); });
  document.addEventListener('visibilitychange', () => { if (!heroTimeline) return; document.hidden ? heroTimeline.pause() : heroTimeline.resume(); });
  window.addEventListener('pagehide', () => { disposed = true; heroTimeline?.kill(); entryTimeline?.kill(); scrollContext?.revert(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { disposed = false; setupMotion(); } });
  document.fonts.ready.then(() => available && ScrollTrigger.refresh());
  $('#year').textContent = new Date().getFullYear();
})();

/* Independent scene modules: entrance, hero, gallery, blueprint.
   Extend the page by appending sections and registering a new scene in setupMotion. */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  let heroTimeline, scrollContext, entryTimeline, entryComplete = false, disposed = false, heroPhase = 'idle';
  let entrySeen = false;
  try { entrySeen = sessionStorage.getItem('gummy-entry-seen') === 'yes'; } catch {}
  const loader = $('#loader');
  const available = !!window.gsap && !!window.ScrollTrigger;
  const controls = [$('.skip-link'), $('.site-header'), $('main'), $('footer')];
  const setInert = (value) => controls.forEach(el => el.inert = value);
  const setMotionPreference = () => document.body.classList.toggle('reduced-motion', reduced);
  const splitStory = () => {
    const p = $('.story-copy');
    const text = p.textContent.trim();
    p.setAttribute('aria-label', text);
    p.innerHTML = text.split(/\s+/).map(word => `<span class="word" aria-hidden="true">${word}</span>`).join(' ');
  };
  const createGummies = () => {
    const holder = $('.gummy-pop');
    for (let i = 0; i < 12; i++) {
      const img = new Image(); img.src = '/assets/pink-gummy-new.png'; img.alt = ''; img.className = 'pop-candy';
      img.style.left = `${4 + (i * 8.07) % 90}%`;
      img.style.filter = 'drop-shadow(5px 10px 6px #8a318d33)';
      holder.append(img);
    }
  };
  function layoutHero(showPouch = false) {
    const hero = $('.hero');
    const geometry = GummyScene.heroGeometry(hero.clientWidth, hero.clientHeight);
    gsap.set('.claw-stage', { y: 0, rotation: 0, scale: 1, autoAlpha: 1 });
    gsap.set('.claw', { left: geometry.clawX, top: 0, width: geometry.clawWidth, height: geometry.clawHeight, x: 0, y: geometry.offscreenY, xPercent: 0, yPercent: 0, rotation: 0, scale: 1 });
    gsap.set('.hero-pack', { left: geometry.packX, top: 0, width: geometry.packWidth, height: geometry.packHeight, x: 0, y: geometry.centerY, xPercent: 0, yPercent: 0, rotation: showPouch ? 12 : 0, transformOrigin: '49.598% 49.938%', scale: 1, autoAlpha: showPouch ? 1 : 0 });
    return geometry;
  }
  function playHero() {
    if (!available || reduced || disposed) return;
    heroTimeline?.kill();
    const geometry = layoutHero();
    const height = $('.hero').clientHeight;
    const { descent, lift, release, exit } = GummyScene.timing;
    gsap.set('.hero-pack', { y: geometry.pickupY, autoAlpha: 0 });
    gsap.set('.pop-candy', { y: 0, rotation: 0, scale: .7, autoAlpha: 1 });
    heroPhase = 'running';
    heroTimeline = gsap.timeline({ onComplete: () => { heroPhase = 'complete'; } });
    heroTimeline
      // At descent end the actual image's top is exactly the hero's top (y=0).
      .to('.claw', { y: 0, duration: descent, ease: 'power2.inOut' }, 0)
      .set('.hero-pack', { autoAlpha: 1 }, descent)
      // Both translations share the same duration/ease, preserving the seal contact.
      .to('.claw', { y: geometry.clawReleaseY, duration: lift, ease: 'power2.inOut' }, descent)
      .to('.hero-pack', { y: geometry.centerY, duration: lift, ease: 'power2.inOut' }, descent)
      .addLabel('centered', descent + lift)
      .addLabel('pop', descent + lift - .6)
      // Keep its center pinned; tilt only once the claw releases.
      .to('.claw', { y: geometry.offscreenY, duration: exit, ease: 'power2.in' }, `centered+=${release}`)
      .to('.hero-pack', { rotation: 12, duration: .7, ease: 'power2.out' }, `centered+=${release + .2}`);
    $$('.pop-candy').forEach((el, i) => {
      const liftHeight = height * (.42 + ((i * 17) % 40) / 100);
      const rise = .65 + (i % 4) * .08;
      const fall = .6 + (i % 3) * .07;
      let at = descent + lift - .6 + i * .075;
      for (let jump = 0; jump < 3; jump++) {
        // Each launch starts only after the previous fall has cleared the bottom.
        heroTimeline.to(el, { y: -liftHeight * [1, .92, 1.06][jump], rotation: -55 + i * 31 + jump * 120, scale: .75 + (i % 3) * .2, duration: rise, ease: 'power2.out' }, at);
        at += rise;
        heroTimeline.to(el, { y: 0, rotation: '+=80', duration: fall, ease: 'power2.in' }, at);
        at += fall + .09;
      }
      heroTimeline.set(el, { autoAlpha: 0 }, at - .09);
    });
  }
  function addSteamBurst(timeline, chamber, impact) {
    const width = chamber.clientWidth;
    const ring = $('.pressure-ring', chamber);
    const flash = $('.pressure-flash', chamber);
    timeline.fromTo(ring, { scale: .25, opacity: 1 }, { scale: 1.45, opacity: 0, duration: .6, ease: 'power2.out', immediateRender: false }, impact);
    timeline.fromTo(flash, { opacity: .95, scale: .8 }, { opacity: 0, scale: 1.2, duration: .4, ease: 'power2.out', immediateRender: false }, impact);
    $$('.steam-plume', chamber).forEach((plume, i) => {
      const side = i % 2 ? 1 : -1;
      const spread = side * width * (.13 + (i % 4) * .055);
      const rise = -width * (.23 + (i % 3) * .15);
      const at = impact + (i % 3) * .035;
      timeline.fromTo(plume, { x: 0, y: 0, scale: .25, opacity: 0 }, { x: spread * .25, y: rise * .12, scale: .9, opacity: .95, duration: .1 }, at)
        .to(plume, { x: spread, y: rise, scale: 1.7 + (i % 3) * .25, opacity: 0, duration: 1.15 + (i % 3) * .12, ease: 'power2.out' }, at + .1);
    });
  }
  function setupClassics() {
    const { drop, recoil } = GummyScene.timing;
    const packs = $$('.chamber-pack');
    const landing = gsap.timeline({ scrollTrigger: { trigger: '.chamber-track', start: 'top 78%', once: true } });
    // A single array tween, no stagger: all four launch and make first impact together.
    landing.fromTo(packs, { y: (_, el) => -el.closest('.chamber-window').clientHeight, scaleY: 1 }, { y: 0, duration: drop, ease: 'power2.in', stagger: 0 }, 0)
      .to(packs, { scaleY: .92, transformOrigin: '50% 100%', duration: .09, stagger: 0 }, drop)
      .to(packs, { scaleY: 1, duration: recoil, ease: 'elastic.out(1, .4)', stagger: 0 }, drop + .09);
    $$('.chamber').forEach(chamber => addSteamBurst(landing, chamber, drop));
  }
  function setupBlueprint() {
    const reveal = gsap.timeline({ scrollTrigger: {
      trigger: '.blueprint-pin', start: 'top top',
      end: () => '+=' + Math.max(1100, innerHeight * 1.7),
      pin: true, scrub: .65, invalidateOnRefresh: true
    } });
    reveal.fromTo('.blueprint-section .facts', { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: .35 }, 0)
      .fromTo('.blueprint-art', { '--reveal': '-6%' }, { '--reveal': '106%', duration: 2.7, ease: 'none' }, .25)
      .fromTo('.blueprint-payoff', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: .35 }, 2.75)
      .to({}, { duration: .35 });
  }
  function setupMotion() {
    setMotionPreference();
    if (!available) { document.body.classList.add('reduced-motion'); return; }
    scrollContext?.revert(); heroTimeline?.kill();
    layoutHero(heroPhase === 'complete');
    gsap.set('.claw-stage', { autoAlpha: reduced ? 0 : 1 });
    gsap.set('.pop-candy', { y: 0 });
    if (reduced) return;
    scrollContext = gsap.context(() => {
      gsap.fromTo('.story-copy .word', { opacity: .22 }, { opacity: 1, stagger: .07, ease: 'none', scrollTrigger: { trigger: '.story-copy', start: 'top 83%', end: 'bottom 48%', scrub: .5 } });
      setupBlueprint();
      setupClassics();
      window.gummyExpansionMotion?.();
    });
    ScrollTrigger.refresh();
  }
  function finishEntry(animateHero = true) {
    if (entryComplete) return;
    entryComplete = true;
    try { sessionStorage.setItem('gummy-entry-seen', 'yes'); } catch {}
    entryTimeline?.kill();
    loader.hidden = true;
    document.body.classList.remove('loading');
    setInert(false);
    if (loader.contains(document.activeElement)) $('.wordmark').focus({ preventScroll: true });
    if (available) { ScrollTrigger.refresh(); if (animateHero && !reduced && scrollY < 200) playHero(); else gsap.set('.claw-stage', { autoAlpha: 0 }); }
  }
  function startEntry() {
    if (entrySeen || location.hash) { finishEntry(!reduced); return; }
    loader.hidden = false;
    document.body.classList.add('loading');
    setInert(true);
    $('#enter-factory').focus({ preventScroll: true });
    // Prepare the transition immediately so even an early click animates entry.
    // Loading assets never starts the transition or dismisses the screen.
    if (available && !reduced) {
      entryTimeline = gsap.timeline({ paused: true, onComplete: () => finishEntry() });
      entryTimeline.to('.loader-copy', { opacity: 0, y: 12, duration: .25 }, 0)
        .to('.loader-scene', { scale: 3.4, filter: 'blur(18px)', duration: 1.25, ease: 'power2.inOut' }, 0)
        .to(loader, { opacity: 0, duration: .75, ease: 'power1.inOut' }, .5);
    }
  }
  $('#enter-factory').addEventListener('click', () => {
    if (entryComplete) return;
    $('#enter-factory').disabled = true;
    if (entryTimeline && !reduced) entryTimeline.play(); else finishEntry(!reduced);
  });
  splitStory(); createGummies();
  if (available) gsap.registerPlugin(ScrollTrigger);
  setupMotion(); startEntry();
  motionQuery.addEventListener('change', event => { reduced = event.matches; if (reduced && heroPhase === 'running') heroPhase = 'idle'; setupMotion(); if (reduced && entryTimeline) { entryTimeline.kill(); entryTimeline = null; gsap.set([loader, $('.loader-copy'), $('.loader-scene')], { clearProps: 'opacity,transform,filter' }); $('#enter-factory').disabled = false; } else if (entryComplete && heroPhase !== 'complete' && scrollY < 200) playHero(); });
  document.addEventListener('visibilitychange', () => { if (!heroTimeline) return; document.hidden ? heroTimeline.pause() : heroTimeline.resume(); });
  window.addEventListener('pagehide', () => { disposed = true; heroTimeline?.kill(); entryTimeline?.kill(); scrollContext?.revert(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { disposed = false; if (heroPhase === 'running') heroPhase = 'idle'; setupMotion(); if (entryComplete && heroPhase === 'idle' && scrollY < 200) playHero(); } });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!available || disposed) return;
      if (heroPhase === 'running' && !reduced) {
        const elapsed = heroTimeline.time();
        playHero();
        heroTimeline.seek(elapsed, false);
      } else {
        layoutHero(heroPhase === 'complete');
        gsap.set('.claw-stage', { autoAlpha: 0 });
      }
        ScrollTrigger.refresh();
    }, 180);
  });
  $('.wordmark').addEventListener('click', () => {
    if (entryComplete && heroPhase === 'idle' && !reduced) playHero();
  });
  document.fonts.ready.then(() => available && ScrollTrigger.refresh());
  $('#year').textContent = new Date().getFullYear();
})();

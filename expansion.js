/* Independent controls for factory expansion. No autoplay carousels. */
(() => {
 'use strict';
 const $ = s => document.querySelector(s);
 const $$ = s => [...document.querySelectorAll(s)];
 const reduced = () => document.body.classList.contains('reduced-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
 const track = $('.review-track');
 const reports = $$('.report');
 let review = 0;
 const updateReview = () => { review = reports.reduce((best, el, i) => Math.abs(el.getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft)) < Math.abs(reports[best].getBoundingClientRect().left - track.getBoundingClientRect().left - parseFloat(getComputedStyle(track).paddingLeft)) ? i : best, 0); $('#review-position').textContent = `${review + 1} / ${reports.length}`; $('#review-prev').disabled = review === 0; $('#review-next').disabled = review === reports.length - 1; };
 const goReview = delta => { review = Math.max(0, Math.min(reports.length - 1, review + delta)); track.scrollTo({left: reports[review].offsetLeft - reports[0].offsetLeft, behavior: reduced() ? 'instant' : 'smooth'}); };
 $('#review-prev').addEventListener('click', () => goReview(-1));
 $('#review-next').addEventListener('click', () => goReview(1));
 track.addEventListener('scroll', updateReview, {passive:true});
 track.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {e.preventDefault();goReview(e.key === 'ArrowRight' ? 1 : -1);} });
 updateReview();
 const slides = $$('.feature-slide'), dots = $$('.feature-dots button');
 let current = 0, featureTween;
 function showSlide(index) {
  if (index === current) return;
  featureTween?.kill();
  current = index;
  slides.forEach((slide, i) => {slide.hidden = i !== index;slide.style.opacity = '';slide.style.transform = '';});
  dots.forEach((dot, i) => {dot.classList.toggle('active',i === index);dot.setAttribute('aria-pressed', String(i === index));});
  $('#feature-announcement').textContent = `Slide ${index + 1} of 3: ${slides[index].querySelector('h2').textContent}`;
  if (window.gsap && !reduced()) featureTween = gsap.fromTo(slides[index], {opacity:0,y:12},{opacity:1,y:0,duration:.45,clearProps:'all'});
  window.ScrollTrigger?.refresh();
 }
 dots.forEach((dot,index) => dot.addEventListener('click',() => showSlide(index)));
 $('.feature-dots').addEventListener('keydown',event => {let next;if(event.key === 'ArrowRight') next=(current+1)%3;else if(event.key === 'ArrowLeft') next=(current+2)%3;else if(event.key === 'Home') next=0;else if(event.key === 'End') next=2;else return;event.preventDefault();showSlide(next);dots[next].focus();});
 const dialog = $('#game-dialog');
 $$('.arcade-card').forEach(button => button.addEventListener('click', () => {$('#game-dialog-title').textContent=button.dataset.game;dialog.showModal();}));
 $('.dialog-close').addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', e => {if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 $('#game-newsletter').addEventListener('click', () => {dialog.close();setTimeout(()=>$('#newsletter-email').focus({preventScroll:true}),100);});
 const form = $('#newsletter-form'), status = $('#newsletter-status');
 form.addEventListener('submit',async event => {
  event.preventDefault();if(!form.reportValidity()) return;
  const button = form.querySelector('button');button.disabled=true;button.textContent='Subscribing…';status.textContent='';
  try {
   const response = await fetch('/api/subscribe',{method:'POST',signal:AbortSignal.timeout(15000),headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.querySelector('[name=email]').value.trim(),consent:form.querySelector('[name=consent]').checked,website:form.querySelector('[name=website]').value})});
   const result = await response.json();
   if(!response.ok) throw new Error(result.error || 'We couldn’t save your sign-up. Please try again.');
   status.textContent='You’re on the list! Thanks for adding a little glow to your inbox.';form.reset();
  }catch(error){status.textContent=error.message.includes('JSON')||error instanceof TypeError||error.name==='TimeoutError'?'We couldn’t connect. Your email hasn’t been saved. Please try again.':error.message;}
  finally{button.disabled=false;button.textContent='Subscribe';}
 });
 window.gummyExpansionMotion = () => {
  if(reduced()||!window.gsap||!window.ScrollTrigger)return;
  gsap.utils.toArray('.monitor-grid .lab-monitor,.arcade-grid .arcade-card').forEach((el,i)=>gsap.from(el,{y:32,opacity:0,duration:.7,delay:(i%4)*.08,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 93%',once:true}}));
  gsap.from('.pipeline-media',{scale:1.08,ease:'none',scrollTrigger:{trigger:'.pipeline',start:'top bottom',end:'bottom top',scrub:.8}});
 };
})();

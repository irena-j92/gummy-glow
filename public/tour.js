import {tourProgress} from './flavors.js';
import {floorAt,creationReveal} from './tour-math.js';
import {makePackingMotion} from './packing-motion.js';
import {makeDescriptionMotion} from './description-motion.js';
import {makeSectionMotion,makeHeadlineMotion,makeChamberArrival} from './section-motion.js';
import {makeHorizontalTrack} from './horizontal-track.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const media=matchMedia('(prefers-reduced-motion: reduce)');
const floors=$$('[data-floor]');
const state={labProgress:0,labReveal:-.06,webglUnavailable:false,pipeProgress:0,pipeVisible:false,pipePaused:false,burst:0,reduced:media.matches,delivered:false};
let view,context,packingMotion,descriptionMotion,heroTimeline,labMotion,labMarquee,labFloat,labInView=false,scrollFrame=0,resizeTimer,selectedFloor=null,selectionTimer,lastScroll=scrollY,activeFloor=-1,disposed=false;
let motionOverride=false;
try{motionOverride=localStorage.getItem('gummy-glow-less-motion')==='yes';}catch{}
state.reduced=media.matches||motionOverride;
const gs=window.gsap, ST=window.ScrollTrigger;
const available=!!gs&&!!ST;
if(available)gs.registerPlugin(ST);

function fitHeroHeading(){
 const heading=$('#hero-title'),width=$('.machine-window').clientWidth;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext?.('2d');if(!ctx)return;
 ctx.font='400 100px Anton';
 const advance=ctx.measureText(heading.textContent).width/100;
 heading.style.fontSize=GummyScene.headingFontSize(width,advance,heading.textContent.length)+'px';
}
function layoutHero(show=true){
 fitHeroHeading();
 if(!available){$('.hero-pack').style.opacity='1';$('#hero-title').style.opacity='1';$('#hero-title').style.visibility='visible';return;}
 const hero=$('.machine-window')||$('.hero'),g=GummyScene.heroGeometry(hero.clientWidth,hero.clientHeight);
 gs.set('.claw',{left:g.clawX,top:0,width:g.clawWidth,height:g.clawHeight,x:0,y:g.offscreenY,rotation:0,autoAlpha:0});
 gs.set('.hero-pack',{left:g.packX,top:0,width:g.packWidth,height:g.packHeight,x:0,y:g.centerY,xPercent:0,yPercent:0,rotation:show?12:0,scale:1,transformOrigin:'49.598% 49.938%',autoAlpha:show?1:0});
 gs.set('#hero-title',{xPercent:show?0:110,autoAlpha:show?1:0});
 const pops=GummyScene.heroPopGeometry(hero.clientWidth,hero.clientHeight);
 $$('.pop-candy').forEach((el,i)=>{const p=pops[i];gs.set(el,{left:p.left,top:0,width:p.width,height:p.height,y:p.bottom,autoAlpha:0});el.style.filter='blur('+p.blur+'px)';});
 return g;
}
function finishDelivery(){
 heroTimeline?.kill();state.delivered=true;layoutHero(true);
 if(available)gs.set('.claw,.pop-candy',{autoAlpha:0});
 requestView();
}
function playHero(){
 if(!available||state.reduced){finishDelivery();return;}
 const g=layoutHero(false),{descent,lift,release,exit}=GummyScene.timing,height=($('.machine-window')||$('.hero')).clientHeight;
 state.delivered=false;
 gs.set('.claw',{autoAlpha:1});gs.set('.hero-pack',{y:g.pickupY});gs.set('.pop-candy',{autoAlpha:0,scale:.7});
 heroTimeline=gs.timeline();
 heroTimeline.fromTo('#hero-title',{xPercent:110,autoAlpha:0},{xPercent:0,autoAlpha:1,duration:1.2,ease:'power2.out'},.45);
 heroTimeline.to('.claw',{y:0,duration:descent,ease:'power2.inOut'},0)
  .set('.hero-pack',{autoAlpha:1},descent)
  .to('.claw',{y:g.clawReleaseY,duration:lift,ease:'power2.inOut'},descent)
  .to('.hero-pack',{y:g.centerY,duration:lift,ease:'power2.inOut'},descent)
  .to('.claw',{y:g.offscreenY,duration:exit,ease:'power2.in'},descent+lift+release)
  .to('.hero-pack',{rotation:12,duration:.7,ease:'power2.out'},descent+lift+release+.2)
  .call(()=>{state.delivered=true;requestView();},[],descent+lift+release+.9);
 const pops=GummyScene.heroPopGeometry(($('.machine-window')||$('.hero')).clientWidth,height);
 $$('.pop-candy').forEach((el,i)=>{
  const p=pops[i];let at=descent+lift-.6+i*.085;
  heroTimeline.set(el,{autoAlpha:1},at);
  const rise=.65+(i%4)*.08,fall=.6+(i%3)*.07;
  for(let j=0;j<3;j++){
   heroTimeline.to(el,{y:p.apex,rotation:-55+i*31+j*120,scale:1,duration:rise,ease:'power2.out'},at);at+=rise;
   heroTimeline.to(el,{y:p.bottom,rotation:'+=80',duration:fall,ease:'power2.in'},at);at+=fall+.09;
  }
  heroTimeline.set(el,{autoAlpha:0},at-.09);
 });
}
function requestView(){view?.request();}
function syncLabMotion(){
 const running=labInView&&!document.hidden&&!state.reduced&&!disposed;
 [labMotion,labMarquee].forEach(animation=>running?animation?.play():animation?.pause());
 if(state.labReveal<1.02)labFloat?.pause(0);else if(running)labFloat?.play();else labFloat?.pause();
}
function updateCreation(){
 state.labReveal=creationReveal(state.labProgress);
 $('.blueprint-art').style.setProperty('--reveal',state.labReveal*100+'%');
 syncLabMotion();
}
function setSelectedFloor(value){$$('[data-target-floor]').forEach(a=>a.dataset.targetFloor===value?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current'));}
function updateFloor(){
 scrollFrame=0;
 const navigationReady=$('#story').getBoundingClientRect().top<=innerHeight*.35;
 document.body.classList.toggle('nav-visible',navigationReady);
 for(const surface of [$('.site-header'),$('.elevator-panel')]){
  surface.inert=!navigationReady;surface.setAttribute('aria-hidden',String(!navigationReady));
 }
 const stops=floors.map(f=>f.getBoundingClientRect().top+scrollY);
 const next=floorAt(stops,scrollY,innerHeight);
 if(next!==activeFloor){activeFloor=next;$('#current-floor').textContent=String(Number(floors[next].dataset.floor));$('#current-floor-button').setAttribute('href','#'+floors[next].id);$('#current-floor-button').setAttribute('aria-label','Return to floor '+Number(floors[next].dataset.floor)+': '+floors[next].dataset.floorName);$('#current-room').textContent=floors[next].dataset.floorName;
  if(next>0)$('#journey-cue').textContent='Explore this floor';

 }
 document.body.dataset.activeFloor=floors[next].dataset.floor;
 if(selectedFloor===floors[next].dataset.floor)selectedFloor=null;
 setSelectedFloor(selectedFloor||floors[next].dataset.floor);
 const progress=tourProgress(scrollY,document.documentElement.scrollHeight,innerHeight);
 $('.elevator-meter i').style.transform=`scaleX(${progress})`;
 $('.elevator-meter').setAttribute('aria-valuenow',String(Math.round(progress*100)));
 if(Math.abs(scrollY-lastScroll)>2)$('#travel-direction').textContent=scrollY>lastScroll?'↓':'↑';
 lastScroll=scrollY;
 document.documentElement.style.setProperty('--travel',`${state.reduced?0:scrollY*.3}px`);
 const pipeRect=$('.pipe-visual').getBoundingClientRect();
 if(!state.reduced&&!view&&pipeRect.top<innerHeight+300&&pipeRect.bottom> -300)ensureWebGL();
 requestView();
}
function setupMotion(){
 const anchor=activeFloor>=0?floors[activeFloor]:null,anchorTop=anchor?.getBoundingClientRect().top;
 descriptionMotion?.dispose();descriptionMotion=null;packingMotion?.dispose();packingMotion=null;context?.revert();context=null;$('.classics').classList.remove('classics-arrived');labMotion=null;labMarquee=null;labFloat=null;labInView=false;
 state.reduced=media.matches||motionOverride;
 document.body.classList.toggle('less-motion',state.reduced);
 document.body.classList.toggle('motion-on',!state.reduced);
 $('#motion-toggle').setAttribute('aria-pressed',String(state.reduced));
 $('#motion-toggle').textContent=state.reduced?'Motion reduced':'Less motion';
 $('#blueprint').classList.toggle('creation-lock',available&&!state.reduced);
 if(!available||state.reduced){state.labProgress=1;state.labReveal=1.06;$('.blueprint-art').style.setProperty('--reveal','106%');finishDelivery();document.body.classList.remove('show-webgl','live-pipeline','live-lab');}
 else{
  state.labProgress=0;state.labReveal=-.06;$('.blueprint-art').style.setProperty('--reveal','-6%');
  context=gs.context(()=>{
   const enterLab=()=>{labInView=true;syncLabMotion();},leaveLab=()=>{labInView=false;syncLabMotion();};
   gs.fromTo(state,{labProgress:0},{labProgress:1,ease:'none',onUpdate:updateCreation,scrollTrigger:{trigger:'.creation-stage',pin:'.creation-stage',start:()=>$('.creation-stage').clientHeight>innerHeight?'top top':'center center',end:()=>'+='+innerHeight*2.8,scrub:.45,invalidateOnRefresh:true,anticipatePin:1,onEnter:enterLab,onEnterBack:enterLab,onLeave:leaveLab,onLeaveBack:leaveLab}});
   labFloat=gs.to('.blueprint-frame',{y:-10,duration:2.6,ease:'sine.inOut',repeat:-1,yoyo:true,paused:true});

   labMarquee=gs.to('.lab-marquee>div',{xPercent:-50,duration:24,ease:'none',repeat:-1,paused:true});
   labMotion=gs.timeline({repeat:-1,repeatDelay:.6,paused:true});
   labMotion.to('.lab-wall-claw',{yPercent:24,duration:2.4,ease:'sine.inOut',stagger:.3}).to('.lab-wall-claw',{yPercent:-24,duration:2.4,ease:'sine.inOut',stagger:.3});
   gs.fromTo('.chamber-pack',{yPercent:-190,scaleY:1},{yPercent:0,scaleY:1,duration:.8,ease:'power2.in',stagger:0,onComplete:()=>$('.classics').classList.add('classics-arrived'),onReverseComplete:()=>$('.classics').classList.remove('classics-arrived'),scrollTrigger:{trigger:'.chamber-track',start:'top 78%',toggleActions:'play none none reverse'}});
   makeChamberArrival({gs,stage:$('.creation-stage'),shell:$('.chamber-shell')});
   makeSectionMotion({gs,resolve:$$});makeHeadlineMotion({gs,resolve:$$});

   ST.create({trigger:'.pipeline',start:'top bottom',end:'bottom top',onUpdate:s=>{state.pipeProgress=s.progress;requestView();}});
  });ST.sort();ST.refresh();
  if(state.delivered)layoutHero(true);
 }
 descriptionMotion=makeDescriptionMotion({gs,ST,section:$('#story'),stage:$('.story-stage'),copy:$('.story-copy'),gummies:$$('.story-gummy'),reduced:state.reduced||!available});
 ST?.sort();ST?.refresh();
 packingMotion=makePackingMotion({gs,ST,stage:$('.packing-stage'),bin:$('.packing-bin'),pouches:$$('.packing-pouch'),status:$('#packing-status'),reduced:state.reduced||!available});
 if(anchor&&Number.isFinite(anchorTop))window.scrollTo({top:Math.max(0,scrollY+anchor.getBoundingClientRect().top-anchorTop),behavior:'instant'});
 updateFloor();requestView();

}
let webglPending=false,webglUnavailable=false;
async function ensureWebGL(){
 if(webglPending||webglUnavailable||view)return;
 webglPending=true;
 try{
  const {createFactoryView}=await import('./tour-webgl.js');
  view=await createFactoryView(state);requestView();
 }catch{webglUnavailable=true;state.webglUnavailable=true;$('#pipe-status').textContent='The factory line is shown as an illustration.';}
 finally{webglPending=false;}
}
function scrollToPoint(y){
 window.scrollTo({top:Math.max(0,y),behavior:state.reduced?'instant':'smooth'});
}
document.addEventListener('click',e=>{
 const anchor=e.target.closest('a[href^="#"]');if(!anchor)return;
 const id=anchor.getAttribute('href').slice(1),target=document.getElementById(id);if(!target)return;
 e.preventDefault();selectedFloor=target.dataset.floor||target.dataset.floorGroup||null;if(selectedFloor)setSelectedFloor(selectedFloor);clearTimeout(selectionTimer);selectionTimer=setTimeout(()=>{selectedFloor=null;updateFloor();},1600);const y=id==='reception'?0:target.getBoundingClientRect().top+scrollY;
 scrollToPoint(y);history.replaceState(null,'','#'+id);
 // Focus the destination without snapping past the animated transition.
 target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
});
$('#motion-toggle').addEventListener('click',()=>{
 // System reduced-motion preference is always respected.
 motionOverride=!state.reduced;
 try{localStorage.setItem('gummy-glow-less-motion',motionOverride?'yes':'no');}catch{}
 setupMotion();
});
media.addEventListener('change',setupMotion);
makeHorizontalTrack($('.classics-scroll'),()=>state.reduced);
const reviewTrack=$('#review-track'),reviewNotes=$$('.review-note');
reviewTrack.addEventListener('keydown',e=>{
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 e.preventDefault();
 const step=reviewNotes[1].offsetLeft-reviewNotes[0].offsetLeft;
 const left=Math.max(0,Math.min(reviewTrack.scrollWidth-reviewTrack.clientWidth,reviewTrack.scrollLeft+(e.key==='ArrowRight'?step:-step)));
 reviewTrack.scrollTo({left,behavior:state.reduced?'instant':'smooth'});
});
let reviewDrag=null;
reviewTrack.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse'||e.button!==0)return;
 reviewDrag={id:e.pointerId,x:e.clientX,left:reviewTrack.scrollLeft};
 reviewTrack.setPointerCapture?.(e.pointerId);
});
reviewTrack.addEventListener('pointermove',e=>{
 if(!reviewDrag||e.pointerId!==reviewDrag.id)return;
 const delta=reviewDrag.x-e.clientX;if(Math.abs(delta)<4)return;
 e.preventDefault();reviewTrack.classList.add('dragging');
 reviewTrack.scrollLeft=Math.max(0,Math.min(reviewTrack.scrollWidth-reviewTrack.clientWidth,reviewDrag.left+delta));
});
function stopReviewDrag(){reviewDrag=null;reviewTrack.classList.remove('dragging');}
reviewTrack.addEventListener('pointerup',stopReviewDrag);reviewTrack.addEventListener('pointercancel',stopReviewDrag);reviewTrack.addEventListener('lostpointercapture',stopReviewDrag);
for(let i=0;i<GummyScene.popLayout.length;i++){const img=new Image();img.src='/assets/optimized/hero-pink-gummy.webp';img.alt='';img.className='pop-candy';$('.gummy-pop').append(img);}
$('#year').textContent=new Date().getFullYear();
setupMotion();
if(scrollY<20&&!location.hash&&!state.reduced)playHero();else finishDelivery();
window.addEventListener('scroll',()=>{if(!state.delivered&&scrollY>$('.hero').clientHeight)finishDelivery();if(!scrollFrame)scrollFrame=requestAnimationFrame(updateFloor);},{passive:true});
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(disposed)return;finishDelivery();ST?.refresh();view?.resize();packingMotion?.resize?.();updateFloor();},160);});
document.fonts?.ready.then(()=>{fitHeroHeading();ST?.refresh();updateFloor();});
window.addEventListener('pagehide',()=>{disposed=true;heroTimeline?.pause();packingMotion?.pause();syncLabMotion();view?.suspend();});
window.addEventListener('pageshow',e=>{if(e.persisted){disposed=false;finishDelivery();ST?.refresh();syncLabMotion();packingMotion?.resume();view?.request();}});
document.addEventListener('visibilitychange',()=>{syncLabMotion();if(document.hidden){heroTimeline?.pause();packingMotion?.pause();view?.suspend();}else{heroTimeline?.resume();packingMotion?.resume();requestView();}});

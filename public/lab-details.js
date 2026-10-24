import {makeHorizontalTrack} from './horizontal-track.js';
import {makeStickCreation} from './stick-creation.js';
const media=matchMedia('(prefers-reduced-motion: reduce)');
const reduced=()=>media.matches||document.body.classList.contains('less-motion');
makeHorizontalTrack(document.querySelector('.benefits-scroll'),reduced,'.benefit-fact');
let motion,lastReduced;
const sync=()=>{
 if(lastReduced===reduced())return;
 lastReduced=reduced();motion?.dispose();
 motion=makeStickCreation({gs:window.gsap,ST:window.ScrollTrigger,stage:document.querySelector('.newbies-scene'),windows:[...document.querySelectorAll('.stick-window')],reduced:lastReduced});
 window.ScrollTrigger?.sort();window.ScrollTrigger?.refresh();
};
const mutation=new MutationObserver(sync);mutation.observe(document.body,{attributes:true,attributeFilter:['class']});
media.addEventListener('change',sync);sync();
const marquee=document.querySelector('.glow-marquee');let visible=false;
const syncMarquee=()=>{marquee.dataset.active=String(visible&&!document.hidden);};
const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMarquee();},{rootMargin:'100px'});observer.observe(marquee);
document.addEventListener('visibilitychange',syncMarquee);
window.addEventListener('pagehide',event=>{if(!event.persisted){motion?.dispose();mutation.disconnect();observer.disconnect();media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',syncMarquee);}});

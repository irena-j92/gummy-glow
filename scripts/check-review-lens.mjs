import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {createReviewLens,lensPlacement} from '../public/review-lens.js';
// Independently project a known local point through a rotated/scaled GSAP card.
for(const angle of [-6,0,6])for(const scale of [.88,1]){
 const a=Math.cos(angle*Math.PI/180)*scale,b=Math.sin(angle*Math.PI/180)*scale,matrix={a,b,c:-b,d:a,e:0,f:130},origin=[200,250],width=400,height=500;
 const project=([x,y])=>[a*(x-200)-b*(y-250)+200,b*(x-200)+a*(y-250)+380];
 const corners=[[0,0],[400,0],[400,500],[0,500]].map(project),q=project([153,231]);
 const rect={left:100+Math.min(...corners.map(p=>p[0])),top:300+Math.min(...corners.map(p=>p[1]))};
 const placement=lensPlacement({rect,width,height,matrix,origin,x:100+q[0],y:300+q[1],size:218});
 assert.ok(Math.abs(placement.x+q[0]*1.7-109)<1e-9);assert.ok(Math.abs(placement.y+q[1]*1.7-109)<1e-9);
}
const {document,window}=parseHTML(readFileSync('public/index.html','utf8'));
const track=document.querySelector('#review-track'),section=document.querySelector('#reviews'),paper=track.querySelector('blockquote'),note=paper.closest('.review-note');
let id=0,observer,hidden=false;const frames=new Map(),listeners=new Map();
Object.defineProperty(document,'hidden',{get:()=>hidden});
const media=matches=>({matches,listeners:new Set(),addEventListener(_,f){this.listeners.add(f);},removeEventListener(_,f){this.listeners.delete(f);},change(matches){this.matches=matches;this.listeners.forEach(f=>f());}}),fine=media(true),reduced=media(false);
const win={innerWidth:1440,innerHeight:900,matchMedia:q=>q.includes('hover')?fine:reduced,getComputedStyle:()=>({width:'400px',height:'500px',transform:'none',transformOrigin:'200px 250px'}),DOMMatrixReadOnly:class{constructor(){Object.assign(this,{a:1,b:0,c:0,d:1,e:0,f:0});}},MutationObserver:class{constructor(f){this.fn=f;observer=this;}observe(){}disconnect(){this.disconnected=true;}},requestAnimationFrame:f=>(frames.set(++id,f),id),cancelAnimationFrame:i=>frames.delete(i),addEventListener(k,f){if(!listeners.has(k))listeners.set(k,new Set());listeners.get(k).add(f);},removeEventListener(k,f){listeners.get(k)?.delete(f);}};
note.getBoundingClientRect=()=>({left:100,top:100,right:500,bottom:600,width:400,height:500});
const controller=createReviewLens({track,section,win,doc:document}),lens=section.querySelector('.review-lens');
const flush=()=>{const pending=[...frames.values()];frames.clear();pending.forEach(f=>f());};
function move(type='mouse'){const e=new window.Event('pointermove',{bubbles:true});Object.assign(e,{clientX:300,clientY:300,pointerType:type});paper.dispatchEvent(e);}
const emit=key=>listeners.get(key)?.forEach(f=>f());
move();move();assert.equal(frames.size,1,'Pointer events share one frame');flush();
assert.ok(lens.classList.contains('is-visible'));assert.ok(track.classList.contains('lens-active'));assert.equal(lens.getAttribute('aria-hidden'),'true');assert.ok(lens.hasAttribute('inert'));assert.equal(lens.querySelectorAll('.review-note').length,1);assert.equal(lens.querySelector('blockquote').textContent,paper.textContent);assert.equal(track.querySelectorAll('.review-note').length,4,'Original carousel unchanged');assert.match(lens.querySelector('.review-lens-layer').style.transform,/scale\(1.7\)/);
track.dispatchEvent(new window.Event('pointerdown'));assert.ok(!lens.classList.contains('is-visible'));move();assert.equal(frames.size,0,'Lens stays hidden while dragging');emit('pointerup');move();flush();assert.ok(lens.classList.contains('is-visible'));
track.dispatchEvent(new window.Event('scroll'));assert.equal(frames.size,1);flush();
emit('blur');assert.ok(!lens.classList.contains('is-visible'));move('touch');assert.equal(frames.size,0);
fine.change(false);move();assert.equal(frames.size,0);fine.change(true);reduced.change(true);move();assert.equal(frames.size,0);reduced.change(false);
move();flush();hidden=true;document.dispatchEvent(new window.Event('visibilitychange'));assert.ok(!lens.classList.contains('is-visible'));hidden=false;
move();flush();document.body.classList.add('less-motion');observer.fn();assert.ok(!lens.classList.contains('is-visible'));document.body.classList.remove('less-motion');
move();assert.equal(frames.size,1);controller.dispose();assert.equal(frames.size,0);assert.ok(!section.querySelector('.review-lens'));assert.ok(observer.disconnected);assert.ok([...listeners.values()].every(v=>v.size===0));assert.equal(fine.listeners.size,0);assert.equal(reduced.listeners.size,0);move();assert.equal(frames.size,0);
console.log('PASS: lens maps rotated/scaled cards, one pointer frame, matching review copy, drag/scroll, touch/reduced-motion gating, hidden tab, focus loss and complete cleanup.');

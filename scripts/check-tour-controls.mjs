import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {flavors,restorePick,tourProgress} from '../public/flavors.js';
import {clamp,floorAt,creationReveal} from '../public/tour-math.js';
import {makePackingMotion} from '../public/packing-motion.js';
import {makeDescriptionMotion} from '../public/description-motion.js';
import {makeSectionMotion,makeHeadlineMotion,makeChamberArrival,makePipelineHold} from '../public/section-motion.js';
import {makeHorizontalTrack} from '../public/horizontal-track.js';
// Execute the actual controller with local DOM/storage/motion adapters.
// These are contract checks, not a browser layout or frame-rate benchmark.
class Element{
 constructor(tag='div',attrs={},parent=null){this.tag=tag;this.attrs={...attrs};this.children=[];this.parent=parent;this.listeners={};this.inline='';this.style={setProperty:(k,v)=>this.style[k]=v};this.disabled=false;this.rectTop=0;this.offsetLeft=0;this.scrollLeft=0;this.scrollWidth=390;this.clientWidth=390;this.clientHeight=844;this.classes=new Set((attrs.class||'').split(' ').filter(Boolean));this.classList={contains:k=>this.classes.has(k),toggle:(k,v)=>{v??=!this.classes.has(k);v?this.classes.add(k):this.classes.delete(k);},add:(...ks)=>ks.forEach(k=>this.classes.add(k)),remove:(...ks)=>ks.forEach(k=>this.classes.delete(k))};}
 get id(){return this.attrs.id||'';}
 get dataset(){return Object.fromEntries(Object.entries(this.attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5).replace(/-([a-z])/g,(_,a)=>a.toUpperCase()),v]));}
 get className(){return [...this.classes].join(' ');}set className(v){this.classes=new Set(v.split(' '));}
 get textContent(){return this.inline+this.children.map(c=>c.textContent).join('');}set textContent(v){this.inline=String(v);this.children=[];}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k]??null;}removeAttribute(k){delete this.attrs[k];}
 remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);this.parent=null;}
 append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n);}}replaceChildren(...nodes){this.children=[];this.inline='';this.append(...nodes);}
 addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}trigger(k,event={}){for(const fn of this.listeners[k]||[])fn({target:this,...event});}
 getBoundingClientRect(){return {left:0,top:this.rectTop-world.scrollY,bottom:this.rectTop-world.scrollY+this.clientHeight,height:this.clientHeight,width:this.clientWidth};}
 scrollTo({left}){this.scrollLeft=left;}
 focus(){document.activeElement=this;}
 matches(selector){if(selector[0]==='#')return this.attrs.id===selector.slice(1);if(selector[0]==='.')return this.classes.has(selector.slice(1));if(selector[0]==='[')return Object.hasOwn(this.attrs,selector.slice(1,-1));if(selector==='a[href^="#"]')return this.tag==='a'&&this.attrs.href?.startsWith('#');return this.tag===selector;}
 closest(s){let n=this;while(n){if(n.matches(s))return n;n=n.parent;}return null;}
}
const root=new Element('document');let parent=root;
for(const token of fs.readFileSync('public/index.html','utf8').matchAll(/<[^>]+>|[^<]+/g)){
 const t=token[0];if(t.startsWith('</')){parent=parent.parent||root;continue;}if(t.startsWith('<!'))continue;
 if(t.startsWith('<')){const tag=t.match(/^<(\w+)/)?.[1];if(!tag)continue;const attrs=Object.fromEntries([...t.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1],m[2]]));const n=new Element(tag,attrs,parent);parent.append(n);if(!['meta','link','img','input','br'].includes(tag))parent=n;}else parent.inline+=t;
}
const all=()=>{const list=[];function walk(n){list.push(n);n.children.forEach(walk);}walk(root);return list;};
function query(s){const parts=s.split(' ');return all().filter(n=>{if(!n.matches(parts.at(-1)))return false;let p=n.parent;for(let i=parts.length-2;i>=0;i--){while(p&&!p.matches(parts[i]))p=p.parent;if(!p)return false;p=p.parent;}return true;});}
const document={querySelector:s=>query(s)[0]||null,querySelectorAll:query,getElementById:id=>query('#'+id)[0],createElement:tag=>new Element(tag),createTextNode:text=>{const n=new Element('#text');n.inline=text;return n;},listeners:{},addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);},fonts:{ready:Promise.resolve()},hidden:false,documentElement:new Element('html')};document.body=query('body')[0];document.documentElement.scrollHeight=6000;query('.creation-tunnel')[0].clientHeight=844*3.8;query('.lab-window')[0].rectTop=1600;query('.review-note').forEach((n,i)=>n.offsetLeft=i*800);query('#review-track')[0].scrollWidth=2790;
const storage=new Map([['gummy-glow-less-motion','yes'],['gummy-glow-pick','invalid']]);let storageFails=false;
const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>{if(storageFails)throw Error();storage.set(k,v);},removeItem:k=>{if(storageFails)throw Error();storage.delete(k);}};
const media={matches:false,listeners:[],addEventListener:(k,fn)=>media.listeners.push(fn)};
const triggers=[],timelines=[],sets=[],fromTos=[];
const gsap={registerPlugin(){},set(s,p){sets.push({s,p});},context(fn){fn();return {revert(){}};},fromTo(s,f,p){fromTos.push({s,f,p});return {kill(){}};},to(){return {play(){this.playing=true;},pause(){this.playing=false;}};},timeline(){const tl={tracks:[],fromTo(s,f,p,t){this.tracks.push({method:'fromTo',s,f,p,t});return this;},invalidate(){return this;},restart(){this.playing=true;return this;},progress(){return 0;},kill(){this.killed=true;},play(){this.playing=true;},pause(){this.playing=false;},resume(){},to(s,p,t){this.tracks.push({method:'to',s,p,t});return this;},set(s,p,t){this.tracks.push({method:'set',s,p,t});return this;},call(fn,args,t){this.tracks.push({method:'call',fn,t});return this;}};timelines.push(tl);return tl;}};
const ScrollTrigger={create(opts){const t={...opts,end:1000,kill(){}};triggers.push(t);return t;},refresh(){},sort(){}};
const world={document,localStorage,matchMedia:()=>media,innerWidth:390,innerHeight:844,scrollY:0,location:{hash:''},history:{replaceState(){}},requestAnimationFrame:()=>1,cancelAnimationFrame(){},setTimeout,clearTimeout,Image:class extends Element{constructor(){super('img');}},Date,console,flavors,restorePick,tourProgress,clamp,floorAt,creationReveal,makePackingMotion,makeDescriptionMotion,makeSectionMotion,makeHeadlineMotion,makeChamberArrival,makePipelineHold,makeHorizontalTrack,gsap,ScrollTrigger,addEventListener(){},removeEventListener(){},scrollTo({top}){world.scrollY=top;}};world.window=world;
const ctx=vm.createContext(world);
vm.runInContext(fs.readFileSync('public/scene-math.js','utf8'),ctx);
const source=fs.readFileSync('public/tour.js','utf8').replace(/^import .*;\n/gm,'');
vm.runInContext(source,ctx);
const $=s=>document.querySelector(s),run=s=>vm.runInContext(s,ctx);
assert.equal($('#motion-toggle').getAttribute('aria-pressed'),'true');
$('#story').rectTop=1600;run('updateFloor()');assert.equal($('.site-header').inert,true);assert.equal($('.elevator-panel').inert,true);world.scrollY=1450;run('updateFloor()');assert.equal($('.site-header').inert,false);assert.equal($('.elevator-panel').inert,false,'Circular controls are usable already on floor 0');world.scrollY=0;run('updateFloor()');
assert.equal($('#review-prev'),null);assert.equal($('#review-next'),null);assert.equal($('#review-position'),null);
for(let i=0;i<4;i++)$('#review-track').trigger('keydown',{key:'ArrowRight',preventDefault(){}});
assert.equal($('#review-track').scrollLeft,2400,'Keyboard scroll reaches the fourth review without navigation buttons');
for(let i=0;i<4;i++)$('#review-track').trigger('keydown',{key:'ArrowLeft',preventDefault(){}});
assert.equal($('#review-track').scrollLeft,0);$('#review-track').trigger('pointerdown',{pointerType:'mouse',button:0,pointerId:1,clientX:400});$('#review-track').trigger('pointermove',{pointerId:1,clientX:100,preventDefault(){}});assert.equal($('#review-track').scrollLeft,300,'Mouse drag works without arrow buttons');$('#review-track').trigger('pointerup');assert.equal(run('reviewDrag'),null);$('#review-track').scrollLeft=0;
run('view={request(){},resize(){},suspend(){}}');$('#motion-toggle').trigger('click');assert.equal(run('state.reduced'),false);assert.ok(!triggers.some(t=>t.pin&&['reception','story'].includes(t.trigger?.id)),'The hero and description stay unpinned');assert.equal(triggers.find(t=>t.trigger===$('#pipeline')).pin,$('.production-run'),'The connected assembly is pinned without spacing between its floors');const creationPin=fromTos.find(t=>t.p.scrollTrigger?.trigger==='.creation-tunnel').p.scrollTrigger;assert.equal(creationPin.pin,undefined,'Creation uses a native sticky hold instead of competing GSAP pins');assert.equal(creationPin.trigger,'.creation-tunnel');assert.equal(creationPin.end(),'+='+world.innerHeight*2.8);assert.ok($('#story').classes.has('description-motion'));assert.ok(triggers.some(t=>t.trigger===$('#story')&&t.animation),'Description has a scroll-controlled timeline');
run('playHero()');assert.equal(sets.filter(n=>n.s==='.pop-candy').at(-1).p.autoAlpha,0,'Gummies start invisible below the window');assert.equal(sets.filter(n=>n.s==='.pop-candy').at(-1).p.autoAlpha,0);assert.equal(run('state.delivered'),false);const deliveryTimeline=timelines.at(-1);assert.equal(deliveryTimeline.tracks.filter(t=>t.s==='.hero-pack'&&t.method==='to').length,2,'Only lift and settling tilt move the hero pouch');run('finishDelivery()');assert.equal(run('state.delivered'),true);assert.ok(deliveryTimeline.killed,'Leaving the hero resolves delivery safely');
const popTracks=timelines.at(-1).tracks.filter(t=>t.method==='to'&&t.s instanceof Element&&t.s.className==='pop-candy');assert.equal(popTracks.length,48,'8 reference-positioned gummies preserve three rise/fall cycles');const launches=deliveryTimeline.tracks.filter(t=>t.method==='set'&&t.s instanceof Element&&t.s.className==='pop-candy'&&t.p.autoAlpha===1);assert.equal(launches.length,8);assert.ok(launches.every(t=>t.t>0),'Each gummy becomes visible only at its staggered launch');assert.ok(popTracks.filter((t,i)=>i%2===1).every(t=>t.p.y>844),'Every fall returns below the visible window');
const clawTracks=run('labMotion.tracks');assert.ok(clawTracks.every(t=>t.s==='.lab-wall-claw'&&Object.keys(t.p).every(k=>!['x','xPercent','rotation'].includes(k))),'Chamber claws move vertically with fixed wall attachment');
assert.equal(creationReveal(.1),-.06,'Blueprint holds at the start');assert.ok(creationReveal(.35)>.45&&creationReveal(.35)<.55);assert.ok(creationReveal(.92)>1.05);
const labTrigger=creationPin;labTrigger.onEnter();assert.equal(run('labMotion.playing'),true);run('state.labProgress=.1;updateCreation()');assert.equal(run('labFloat.playing'),false,'No float while showing blueprint');run('state.labProgress=.35;updateCreation()');assert.equal(run('labFloat.playing'),false,'No float during the downward scan');run('state.labProgress=.95;updateCreation()');assert.equal(run('labFloat.playing'),true,'Completed gray pouch floats');run('state.labProgress=.4;updateCreation()');assert.equal(run('labFloat.playing'),false,'Scrolling back stops floating before restoring blueprint');run('state.labProgress=.95;updateCreation()');assert.equal(run('labFloat.playing'),true);document.hidden=true;run('syncLabMotion()');assert.equal(run('labMotion.playing'),false);assert.equal(run('labFloat.playing'),false,'Float pauses in a hidden tab');document.hidden=false;labTrigger.onLeave();assert.equal(run('labMotion.playing'),false);
query('[data-floor]').forEach((n,i)=>n.rectTop=[0,3000,4200,5300,6500,7900,9200,10300][i]);world.scrollY=4000;run('updateFloor()');assert.equal($('#current-floor').textContent,'2');assert.equal($('#current-floor-button').getAttribute('href'),'#comparison');assert.equal(query('.stage-button')[1].getAttribute('href'),'#blueprint');assert.equal($('#story').dataset.floorGroup,'0');assert.ok($('#blueprint').classes.has('creation-lock'));world.scrollY=2200;run('updateFloor()');assert.equal($('#current-floor').textContent,'0','Description keeps reception active');assert.equal(query('.stage-button')[0].getAttribute('aria-current'),'location');assert.equal(fromTos.filter(t=>t.p.ease==='back.out(1.12)').length,9,'Content reveals exclude the stationary pipeline');assert.ok(deliveryTimeline.tracks.some(t=>t.s==='#hero-title'&&t.method==='fromTo'&&t.f.xPercent===110&&t.p.xPercent===0),'Heading enters from the right and stops centered');
const originalPipelineHold=run('pipelineHold');
for(const progress of [0,.5,1]){
 run(`pipelineHold={start:6500,end:7344,progress:${progress}}`);$('#pipeline').rectTop=6500+progress*844;$('#newbies').rectTop=7900+progress*844;$('#classics').rectTop=5300+progress*844;
 assert.equal(run('destinationY(document.querySelector("#newbies"))'),8744,'Newbies navigation includes the complete hold, before/during/after pinning');assert.equal(run('destinationY(document.querySelector("#pipeline"))'),6500);assert.equal(run('destinationY(document.querySelector("#classics"))'),5300);
}
world.savedPipelineHold=originalPipelineHold;run('pipelineHold=savedPipelineHold');$('#pipeline').rectTop=6500;$('#newbies').rectTop=7900;$('#classics').rectTop=5300;
for(const button of query('.stage-button')){
 for(const click of document.listeners.click)click({target:button,preventDefault(){}});
 assert.equal(button.getAttribute('aria-current'),'location');
 for(const group of ['.machine-stages'])assert.equal(query(group+' a').filter(a=>a.getAttribute('aria-current')).length,1,'One glowing floor per group');
 assert.equal(document.activeElement.id||document.activeElement.attrs.id,button.attrs.href.slice(1));
}
run('clearTimeout(selectionTimer);selectedFloor=null');world.scrollY=0;run('updateFloor()');assert.equal(query('.stage-button')[0].getAttribute('aria-current'),'location');
assert.equal($('#pipe-run'),null);assert.equal($('#pipe-pause'),null);assert.equal($('#packing-replay'),null);
media.matches=true;media.listeners.forEach(fn=>fn());assert.equal(run('state.reduced'),true);assert.ok(!$('#story').classes.has('description-motion'),'Reduced motion removes the expanded sticky range');
$('#motion-toggle').trigger('click');assert.equal(run('state.reduced'),true,'System reduced motion cannot be overridden');
console.log('PASS: button-free review keyboard/native-scroll support and motion controls, six header floor clicks and a single current-floor circle, destination focus, offscreen/hidden lab pause, early-scroll delivery, original 3-cycle animation, active floor and removed packing/pipeline controls.');

export const testEnvironment={world,document};

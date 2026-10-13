import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import * as realThree from '../public/vendor/three.module.js';
import {makePouch} from '../public/pouch-model.js';
import {pouchPose} from '../public/tour-math.js';

function environment({width=1440,height=900,reduce=false,seen=false}={}) {
 const {window:w}=parseHTML(readFileSync('public/index.html','utf8')),d=w.document;
 const frames=new Map(),timers=[],triggers=[],timelines=[],preferences=[];let frameId=0,focus;
 Object.assign(w,{gummy3DReady:false,gummyPouchReady:false,gummyPouchProgress:0,gummyJourneyStart:undefined,gummyEntryComplete:false,console,innerWidth:width,innerHeight:height,devicePixelRatio:2,scrollY:0,location:{hash:''},history:{replaceState(){}},setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},requestAnimationFrame:fn=>{const id=++frameId;frames.set(id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),getComputedStyle:()=>({paddingLeft:'0'})});
 w.scrollTo=({top})=>{w.scrollY=top;};w.sessionStorage={getItem:()=>seen?'yes':null,setItem(){}};
 w.Image=function(){return d.createElement('img');};d.fonts={ready:Promise.resolve()};
 Object.defineProperty(d,'hidden',{value:false,writable:true});Object.defineProperty(d.documentElement,'scrollHeight',{value:15000});
 w.matchMedia=()=>{const preference={matches:reduce,listeners:[],addEventListener(_,fn){this.listeners.push(fn)}};preferences.push(preference);return preference;};
 const nodes=[...d.querySelectorAll('section[data-floor]')];
 const extra=()=>triggers.filter(t=>!t.killed&&t.vars.trigger==='.hero').reduce((n,t)=>n+t.end,0);
 nodes.forEach((el,i)=>{el.getBoundingClientRect=()=>({top:i===0&&extra()>w.scrollY?0:i*1000+(i?extra():0)-w.scrollY,left:0,width:width,height:height});});
 for(const el of d.querySelectorAll('h1,h2,.wordmark,button,a'))el.focus=()=>{focus=el;};
 Object.defineProperty(d,'activeElement',{get:()=>focus||d.body});
 for(const el of d.querySelectorAll('#pouch-canvas,#pipeline-canvas,#shaft-canvas,.hero,.chamber,.chamber-window')){
  Object.defineProperty(el,'clientWidth',{get:()=>w.innerWidth});Object.defineProperty(el,'clientHeight',{get:()=>w.innerHeight});
 }
 const track=d.querySelector('.review-track');track.getBoundingClientRect=()=>({left:0});
 [...d.querySelectorAll('.report')].forEach((el,i)=>{el.getBoundingClientRect=()=>({left:i*800-(track.scrollLeft||0)});Object.defineProperty(el,'offsetLeft',{value:i*800});});
 track.scrollTo=({left})=>{track.scrollLeft=left;track.dispatchEvent(new w.Event('scroll'));};
 const dialog=d.querySelector('dialog');dialog.showModal=()=>{dialog.open=true;};dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new w.Event('close'));};
 let contextTriggers;
 w.ScrollTrigger={create(vars){const t={vars,killed:false,end:0,refresh(){this.end=typeof vars.end==='function'?parseFloat(vars.end().slice(2)):0;},kill(){this.killed=true;}};t.refresh();triggers.push(t);contextTriggers?.push(t);return t;},refresh(){triggers.filter(t=>!t.killed).forEach(t=>t.refresh());},sort(){}};
 const set=(target,vars)=>{const elements=typeof target==='string'?[...d.querySelectorAll(target)]:Array.isArray(target)?target:[target];for(const el of elements){if(!el)continue;el.props={...el.props,...vars};if(vars.clearProps)for(const key of vars.clearProps.split(','))el.style.removeProperty(key);if(vars.opacity!==undefined)el.style.opacity=String(vars.opacity);}};
 w.gsap={set,registerPlugin(){},utils:{toArray:s=>[...d.querySelectorAll(s)]},context(fn){const own=[];contextTriggers=own;fn();contextTriggers=undefined;return{revert(){own.forEach(t=>t.kill());}};},from(){},fromTo(){return{kill(){}};},timeline(opts={}){const t={opts,calls:[],played:false,kill(){},play(){this.played=true;},pause(){},resume(){},time(){return 0;},seek(){}};for(const method of ['to','fromTo','set','addLabel','call'])t[method]=(...args)=>{t.calls.push({method,args});return t;};timelines.push(t);return t;}};
 const context=vm.createContext(w);
 return{w,d,context,triggers,timelines,timers,preferences,frames,run(file){vm.runInContext(readFileSync('public/'+file,'utf8'),context);},flush(now=16){const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn(now));},hero(){return triggers.findLast(t=>!t.killed&&t.vars.trigger==='.hero');},changeReduce(value){for(const p of preferences){p.matches=value;p.listeners.forEach(fn=>fn({matches:value}));}}};
}

const app=environment();for(const file of ['expansion.js','scene-math.js','motion.js','factory-tour.js'])app.run(file);
assert.equal(app.d.querySelector('#loader').hidden,false);
assert.equal(app.d.querySelector('.hero-pack').props.autoAlpha,0);
app.d.querySelector('#enter-factory').click();const entry=app.timelines.find(t=>t.opts.paused);assert.equal(entry.played,true);entry.opts.onComplete();
const delivery=app.timelines.find(t=>t.calls.some(c=>c.method==='addLabel'&&c.args[0]==='centered'));
const ready=delivery.calls.find(c=>c.method==='call');assert.equal(ready.args[2],4.58);
app.w.gummy3DReady=true;app.w.dispatchEvent(new app.w.Event('gummy:webgl-ready'));
app.w.scrollY=300;app.hero().vars.onUpdate();assert.equal(app.w.gummyPouchProgress,0,'Early scroll does not tear an undelivered pouch');
ready.args[0]();assert.equal(app.w.gummyJourneyStart,300);assert.equal(app.w.gummyPouchProgress,0);
app.w.scrollY=800;app.hero().vars.onUpdate();assert.ok(app.w.gummyPouchProgress>.3&&app.w.gummyPouchProgress<.5);
assert.equal(app.d.querySelector('#journey-cue').textContent,'Open the pouch');
app.w.dispatchEvent(new app.w.Event('gummy:pouch-ready'));assert.equal(app.w.gummyJourneyStart,300,'Resize/repeated delivery preserves journey progress');
app.d.querySelector('#next-floor').click();app.w.dispatchEvent(new app.w.Event('scroll'));app.flush();assert.equal(app.d.querySelector('#current-floor').textContent,'01');
app.d.querySelector('#floor-map-toggle').click();assert.equal(app.d.querySelector('#floor-map').hidden,false);
app.d.querySelector('[data-target-floor="03"]').click();app.w.dispatchEvent(new app.w.Event('scroll'));app.flush();assert.equal(app.d.querySelector('#current-floor').textContent,'03');assert.equal(app.d.querySelector('#floor-map').hidden,true);assert.equal(app.d.activeElement.id,'flavor-title');
for(const key of ['elderflower','pumpkin','blueberry','watermelon']){app.d.querySelector(`[data-sample="${key}"]`).click();assert.equal(app.d.querySelector('#taste-link').getAttribute('href'),'/collection/#'+key);assert.equal(app.d.querySelectorAll('[data-sample][aria-pressed="true"]').length,1);}
app.d.querySelector('[data-game="Memory"]').click();let cards=[...app.d.querySelectorAll('.memory-tile')];assert.equal(cards.length,8);
cards[0].click();cards.find(c=>c.dataset.key!==cards[0].dataset.key).click();app.d.querySelector('#memory-reset').click();app.timers.forEach(fn=>fn());cards=[...app.d.querySelectorAll('.memory-tile')];assert.equal(app.d.querySelectorAll('.memory-tile.flipped').length,0);
for(const key of ['watermelon','elderflower','pumpkin','blueberry'])cards.filter(c=>c.dataset.key===key).forEach(c=>c.click());assert.equal(app.d.querySelector('#memory-matches').textContent,'4 / 4 pairs');
app.d.querySelector('#review-next').click();assert.equal(app.d.querySelector('#review-position').textContent,'2 / 2');app.d.querySelectorAll('.feature-dots button')[2].click();assert.equal(app.d.querySelector('#feature-3').hidden,false);
app.changeReduce(true);assert.equal(app.d.querySelector('#current-floor').textContent,'03','Reduced-motion switch keeps the current floor');assert.equal(app.hero(),undefined);assert.equal(app.d.querySelector('.pouch-dissolve').style.opacity,undefined);

// A late texture can add a hero pin, but must retain the current floor position.
const late=environment();late.run('factory-tour.js');late.w.scrollY=3000;late.w.dispatchEvent(new late.w.Event('scroll'));late.flush();assert.equal(late.d.querySelector('#current-floor').textContent,'03');late.w.gummy3DReady=true;late.w.dispatchEvent(new late.w.Event('gummy:webgl-ready'));assert.equal(late.d.querySelector('#current-floor').textContent,'03');assert.equal(late.d.querySelector('#flavor-lab').getBoundingClientRect().top,0);

async function engine(width,height) {
 const env=environment({width,height});const renderers=[],observers=[],paths=[];
 class Renderer {constructor(){this.domElement=env.d.createElement('canvas');this.draws=0;renderers.push(this);}setPixelRatio(v){this.ratio=v;}setSize(w,h){this.width=w;this.height=h;}setClearColor(){}render(scene,camera){this.draws++;this.camera=camera;if(this.broken)throw Error('Simulated context failure');}}
 class TextureLoader {async loadAsync(path){paths.push(path);return new realThree.Texture();}}
 class Observer {constructor(fn,options){this.fn=fn;this.options=options;observers.push(this);}observe(host){this.host=host;}disconnect(){}activate(){this.fn([{isIntersecting:true}]);}}
 Object.assign(env.w,{THREE:{...realThree,WebGLRenderer:Renderer,TextureLoader},makePouch,pouchPose,IntersectionObserver:Observer});
 const source=readFileSync('public/factory-webgl.js','utf8').replace(/^import .*;\n/gm,'');vm.runInContext(source,env.context);
 const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};await settle();
 assert.equal(renderers.length,width<700?1:2,'Initial page does not allocate pipeline context');
 assert.equal(paths.length,1,'Initial texture load is limited to the pouch');
 observers.filter(o=>o.options.rootMargin==='100px').forEach(o=>o.activate());env.flush();assert.equal(env.frames.size,0,'Static scenes stop rendering when idle');
 const lazy=observers.find(o=>o.options.rootMargin==='800px');lazy.activate();await settle();observers.filter(o=>o.host?.id==='pipeline-canvas'&&o.options.rootMargin==='100px').forEach(o=>o.activate());env.flush(32);
 assert.ok(env.d.querySelector('.pipeline').classList.contains('has-live-pipes'));
 assert.equal(renderers.length,width<700?2:3);
 assert.equal(env.frames.size,1,'Only visible moving pipes request continuous frames');
 env.d.hidden=true;env.d.dispatchEvent(new env.w.Event('visibilitychange'));assert.equal(env.frames.size,0,'Hidden tabs stop rendering');
 env.d.hidden=false;env.d.dispatchEvent(new env.w.Event('visibilitychange'));env.flush(64);
 const pipes=renderers.find(r=>r.domElement.parentElement.id==='pipeline-canvas');pipes.domElement.dispatchEvent(new env.w.Event('webglcontextlost'));
 assert.equal(env.d.querySelector('.pipeline').classList.contains('has-live-pipes'),false,'Context loss restores pipeline poster');
 const pouch=renderers[0];pouch.broken=true;env.w.dispatchEvent(new env.w.Event('scroll'));env.flush(80);assert.equal(env.w.gummy3DReady,false,'Draw failure restores pouch image');
 env.w.innerWidth=width+20;env.w.innerHeight=height+30;env.w.dispatchEvent(new env.w.Event('resize'));assert.ok(Number.isFinite(pouch.camera.aspect));
 for(const r of renderers){assert.ok(r.ratio<=1.65);assert.ok(r.width>0&&r.height>0);}
}
for(const [w,h] of [[320,600],[390,844],[768,1024],[1440,900]])await engine(w,h);
console.log('Passed: delivery-gated scroll, resize continuity, late-pin position, elevator navigation/focus, flavor selection, memory restart/full round, reviews, carousel, reduced motion, and render scheduling/fallbacks at four viewports. GPU rendering and visual layout are not simulated.');

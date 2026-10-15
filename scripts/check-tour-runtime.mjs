import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {testEnvironment} from './check-tour-controls.mjs';
import * as realThree from '../public/vendor/three.module.js';
import {makePouch} from '../public/pouch-model.js';
import {makeGrayLab} from '../public/lab-model.js';
import {makeReferencePipes} from '../public/pipe-model.js';
import {pipeGummies} from '../public/pipe-style.js';
// Run the actual scene engine using real Three.js objects and a rendering adapter.
// This verifies scene lifecycle and geometry, without claiming GPU/browser QA.
async function engine(width,height,failStage=false){
 const {document:d,world}=testEnvironment;
 const frames=new Map(),renderers=[],observers=[],paths=[],listeners={};let id=0;
 const host=d.querySelector('#factory-canvas');host.replaceChildren();
 const hero=d.querySelector('.machine-window'),lab=d.querySelector('.lab-window'),pipe=d.querySelector('.pipe-visual');lab.rectTop=1600;const chamberWidth=width>760?Math.min(1000,width-64):width-24;lab.clientWidth=chamberWidth*.83;lab.clientHeight=chamberWidth*1059/1485*.73;hero.clientWidth=width;hero.clientHeight=height;hero.rectTop=0;pipe.clientWidth=Math.min(width,1400);pipe.clientHeight=pipe.clientWidth*1000/1600;pipe.rectTop=2500;world.scrollY=0;
 const state={reduced:false,delivered:true,labReveal:.5,pipeProgress:0,pipeVisible:false,pipePaused:false,burst:0};
 class Renderer{
  constructor(){this.domElement=d.createElement('canvas');this.draws=0;renderers.push(this);}
  setPixelRatio(r){this.ratio=r;}getPixelRatio(){return this.ratio;}setViewport(...v){this.viewport=v;}setScissor(...v){this.scissor=v;}setScissorTest(){}clear(){}setSize(w,h){this.width=w;this.height=h;}setClearColor(){}
  render(scene,camera){if(this.broken)throw Error('Simulated GPU failure');this.draws++;this.scene=scene;this.camera=camera;}
  dispose(){this.disposed=true;}
 }
 const loadedMaps=[];class TextureLoader{async loadAsync(path){paths.push(path);if(failStage&&path==='/assets/pipeline-stage.svg')throw new Error('Missing stage');const texture=new realThree.Texture();texture.userData.asset=path;texture.addEventListener('dispose',()=>{texture.userData.released=true;});loadedMaps.push(texture);return texture;}}
 class Observer{constructor(fn,options){this.fn=fn;this.options=options;observers.push(this);}observe(el){this.host=el;}disconnect(){this.disconnected=true;}activate(value=true){this.fn([{isIntersecting:value}]);}}
 const sandbox={document:d,window:null,innerWidth:width,innerHeight:height,devicePixelRatio:2,console,THREE:{...realThree,WebGLRenderer:Renderer,TextureLoader},makePouch,makeGrayLab,makeReferencePipes,pipeGummies,IntersectionObserver:Observer,requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:n=>frames.delete(n),addEventListener:(event,fn)=>(listeners[event]??=[]).push(fn),GummyScene:world.GummyScene};sandbox.window=sandbox;
 const context=vm.createContext(sandbox);
 const source=readFileSync('public/tour-webgl.js','utf8').replace(/^import .*;\n/gm,'').replace('export async function','async function');
 vm.runInContext(source,context);const create=vm.runInContext('createFactoryView',context);
 const view=await create(state);const renderer=renderers[0];
 const flush=now=>{const work=[...frames.values()];frames.clear();work.forEach(fn=>fn(now));};
 const settle=async()=>{for(let i=0;i<15;i++)await Promise.resolve();};
 assert.equal(renderers.length,1,'Only one shared WebGL context');assert.deepEqual(paths,[],'Creation uses the DOM image, without a second WebGL copy');
 flush(16);assert.equal(renderer.draws,0,'Reception remains the original image animation without a WebGL pouch');assert.equal(frames.size,0);assert.ok(!d.body.classes.has('show-webgl'));
assert.equal(renderer.width,width);assert.ok(renderer.ratio<=(width<760?1.25:1.5));
 observers.find(o=>o.options.rootMargin==='300px').activate();await settle();
 assert.equal(paths.length,4);assert.equal(paths[0],'/assets/pipeline-stage.svg');assert.deepEqual(paths.slice(1),pipeGummies.map(g=>g.asset));if(failStage){assert.ok(state.webglUnavailable);assert.ok(loadedMaps.every(t=>t.userData.released),'Partial glass texture load is released');assert.ok(!d.body.classes.has('live-pipeline'));view.dispose();assert.ok(renderer.disposed);return;}assert.equal(renderers.length,1,'Pipes share the existing context');
 lab.rectTop=800;world.scrollY=800;view.request();flush(24);assert.equal(renderer.draws,0,'Chamber scan and float never hand off to WebGL');assert.ok(!d.body.classes.has('live-lab'));lab.rectTop=-2000;world.scrollY=2500;observers.find(o=>o.options.rootMargin==='0px').activate();flush(32);
 assert.ok(renderer.viewport.every(Number.isFinite));assert.ok(renderer.scissor.every(Number.isFinite));
 assert.ok(d.body.classes.has('live-pipeline'));assert.equal(frames.size,1,'Visible running pipes request another frame');
 const rig=renderer.scene.children.find(n=>n.isGroup&&n.children.some(c=>c.name==='clear-gummy-pipe'));assert.ok(rig);assert.equal(rig.children.filter(n=>n.isSprite).length,36);
 assert.equal(rig.children.filter(n=>n.isInstancedMesh).length,0,'Transparent pipe rings have been removed');assert.equal(rig.children.find(n=>n.name==='clear-gummy-pipe').material.opacity,1);assert.equal(rig.children.filter(n=>n.name==='fluid-only-pipe').length,3);assert.ok(!rig.children.find(n=>n.name==='plastic-temperature-dial'));for(const sprite of rig.children.filter(n=>n.isSprite)){assert.equal(sprite.material.map.userData.asset,pipeGummies[sprite.userData.gummyType].asset);assert.ok(sprite.scale.x>=.4);assert.equal(sprite.material.toneMapped,false);}rig.traverse(n=>{if(n.geometry)for(const number of n.geometry.attributes.position.array)assert.ok(Number.isFinite(number));});
 assert.ok(rig.children.find(n=>n.name==='glass-refraction-backdrop').material.map,'Transmission has a real scene backdrop');assert.ok(Object.prototype.toString.call(renderer.scene.environment.image.data)==='[object Float32Array]','Reflections retain HDR values');assert.ok(renderer.scene.environment.image.data.some(v=>v>1),'Bright softboxes are not clamped');
 assert.ok(renderer.camera.isOrthographicCamera,'Reference pipes use a stable orthographic composition');
 const liquid=rig.children.find(n=>n.name==='visible-liquid-flow'),shell=rig.children.find(n=>n.name==='fluid-only-pipe');assert.ok(liquid);assert.equal(shell.material.opacity,1);const flowTime=liquid.material.uniforms.flowTime.value;
 const point=rig.children.find(n=>n.isSprite).position.clone();state.pipePaused=true;flush(48);assert.equal(frames.size,0);
 view.request();flush(64);assert.ok(rig.children.find(n=>n.isSprite).position.equals(point),'Paused candies keep their position');assert.equal(liquid.material.uniforms.flowTime.value,flowTime,'Liquid also pauses');
 state.pipePaused=false;view.request();flush(80);assert.equal(frames.size,1);assert.ok(liquid.material.uniforms.flowTime.value>flowTime);assert.ok(!rig.children.find(n=>n.isSprite).position.equals(point),'Gummies resume moving');
 view.suspend();assert.equal(frames.size,0);state.reduced=true;view.request();flush(96);assert.equal(frames.size,0);assert.ok(!d.body.classes.has('show-webgl'));assert.ok(!d.body.classes.has('live-pipeline'));
 state.reduced=false;d.hidden=true;view.request();assert.equal(frames.size,0,'Hidden document requests no frames');d.hidden=false;view.request();flush(112);
 renderer.broken=true;flush(128);assert.equal(frames.size,0);assert.ok(state.webglUnavailable);assert.ok(!d.body.classes.has('live-pipeline'));assert.ok(!d.body.classes.has('show-pouch'));assert.ok(!d.body.classes.has('live-lab'));assert.equal(d.querySelector('#pipe-pause'),null);
 view.dispose();assert.ok(renderer.disposed);assert.equal(host.children.length,0);assert.ok(observers.every(o=>o.disconnected));assert.ok(loadedMaps.every(t=>t.userData.released));
}
await engine(1440,900);await engine(390,844);await engine(390,844,true);
console.log('PASS: actual Three.js pipeline engine at desktop/mobile sizes, DOM-only chamber, one context, lazy pipe geometry, 36 blurry gummies in the candy maze, ring-free glass, gummies from the top inlets, three liquid-only outlets, photo gummy textures, no thermometer, paused/hidden/reduced frame shutdown, rendering failure fallback and disposal.');

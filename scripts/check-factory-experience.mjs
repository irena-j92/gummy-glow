import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseHTML} from 'linkedom';
import {createFactoryPass,createHatchMotion} from '../public/factory-experience.js';

const {document,window}=parseHTML(fs.readFileSync('public/index.html','utf8'));
let reduced=false;const gs={fromTo(){return {kill(){}};},set(){}};
assert.equal(document.querySelector('.flavor-story'),null);
assert.equal(document.querySelector('#comparison').nextElementSibling.className,'benefits-floor');
assert.equal(document.querySelectorAll('.benefit-icon').length,0);

let observerSync,disconnected=false,openerFocus=0;const dialog=document.querySelector('#factory-pass'),opener=document.querySelector('#current-floor-button');
dialog.showModal=()=>dialog.open=true;dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new window.Event('close'));};opener.focus=()=>openerFocus++;
const pass=createFactoryPass({doc:document,win:{MutationObserver:class{constructor(fn){observerSync=fn;}observe(){}disconnect(){disconnected=true;}}},gs,reduced:()=>reduced});
document.body.dataset.activeFloor='5';observerSync();assert.equal(dialog.querySelector('[aria-current="location"]').getAttribute('href'),'#newbies');
opener.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));assert.equal(dialog.open,true);assert.ok(document.body.classList.contains('pass-open'));
dialog.querySelector('.factory-pass-close').dispatchEvent(new window.Event('click'));assert.equal(dialog.open,false);assert.equal(openerFocus,1);assert.ok(!document.body.classList.contains('pass-open'));
opener.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));dialog.querySelector('[href="#blueprint"]').dispatchEvent(new window.Event('click',{bubbles:true}));assert.equal(dialog.open,false);assert.equal(openerFocus,1,'Floor navigation does not steal destination focus back to the opener');
pass.dispose();assert.equal(disconnected,true);

const module={exports:{}};vm.runInNewContext(fs.readFileSync('public/assets/gsap.min.js','utf8'),{module,exports:module.exports,setTimeout,clearTimeout,console,Date});const core=module.exports.gsap;
const left={xPercent:0},right={xPercent:0},configs=[],animations=[];const stage={clientHeight:800};
const hatch=createHatchMotion({gs:{context(fn){fn();return {revert(){animations.forEach(t=>t.kill());}};},fromTo(target,from,to){const {scrollTrigger,...props}=to;configs.push(scrollTrigger);const tween=core.fromTo(target,from,{...props,duration:1,paused:true});animations.push(tween);return tween;}},ST:{},stage,panels:[left,right],viewportHeight:()=>900});
animations.forEach(t=>t.progress(.5));assert.equal(left.xPercent,-51);assert.equal(right.xPercent,51);animations.forEach(t=>t.progress(1));assert.equal(left.xPercent,-102);assert.equal(right.xPercent,102);animations.forEach(t=>t.progress(0));assert.equal(left.xPercent,0);assert.equal(right.xPercent,0);assert.equal(configs[0].end(),'center center');stage.clientHeight=1100;assert.equal(configs[0].end(),'top top');hatch.revert();assert.equal(createHatchMotion({gs,ST:{},stage,panels:[left,right],reduced:true}),null);core.ticker.sleep();
console.log('PASS: facts after the table without illustrations, removed flavor selector, native factory-pass navigation/focus and real GSAP reversible elevator doors.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';
import {makeHorizontalTrack} from '../public/horizontal-track.js';
import {makeReferencePipes} from '../public/pipe-model.js';
import {pipeLayout} from '../public/pipe-layout.js';
const {document,window}=parseHTML(fs.readFileSync('public/index.html','utf8'));
const track=document.querySelector('.classics-scroll');
Object.assign(track,{scrollWidth:1590,clientWidth:1200,scrollLeft:0});
track.scrollTo=({left,behavior})=>{track.scrollLeft=left;track.lastBehavior=behavior;};
let gap=30,leading=30;
[...track.querySelectorAll('.chamber')].forEach((chamber,i)=>{chamber.getBoundingClientRect=()=>({width:360,left:leading+i*(360+gap)-track.scrollLeft});});
let captures=0;track.setPointerCapture=()=>captures++;
makeHorizontalTrack(track,()=>true);
const emit=(name,props={})=>{const e=new window.Event(name,{bubbles:true,cancelable:true});Object.assign(e,props);track.dispatchEvent(e);return e;};
emit('keydown',{key:'ArrowRight'});assert.equal(track.scrollLeft,390,'One column scroll fully reveals the fourth chamber');assert.equal(track.lastBehavior,'instant');
emit('keydown',{key:'ArrowRight'});assert.equal(track.scrollLeft,390,'The last chamber stays inside the maximum scroll');emit('keydown',{key:'Home'});assert.equal(track.scrollLeft,0);emit('keydown',{key:'End'});assert.equal(track.scrollLeft,390);emit('keydown',{key:'ArrowLeft'});assert.equal(track.scrollLeft,0);
emit('pointerdown',{pointerType:'mouse',button:0,pointerId:1,clientX:500});emit('pointermove',{pointerId:1,clientX:498,preventDefault(){}});assert.equal(captures,0,'A normal product click is not captured');emit('pointerup');assert.ok(!emit('click').defaultPrevented);
emit('pointerdown',{pointerType:'mouse',button:0,pointerId:2,clientX:500});emit('pointermove',{pointerId:2,clientX:400});assert.equal(track.scrollLeft,100);assert.equal(captures,1);emit('pointerup');assert.ok(emit('click').defaultPrevented,'Dragging never accidentally opens a product');assert.ok(!emit('click').defaultPrevented,'A subsequent real click works');
emit('pointerdown',{pointerType:'touch',button:0,pointerId:3,clientX:500});emit('pointermove',{pointerId:3,clientX:0});assert.equal(track.scrollLeft,100,'Touch is left to native horizontal scrolling');
gap=12;leading=0;Object.assign(track,{scrollWidth:1476,clientWidth:462,scrollLeft:0});emit('keydown',{key:'ArrowRight'});assert.equal(track.scrollLeft,372,'Mobile keyboard step includes the new gutter');emit('keydown',{key:'End'});assert.equal(track.scrollLeft,1014,'All four chambers remain reachable on mobile');
const products=[...track.querySelectorAll('.chamber-product-link')];assert.equal(products.length,4);assert.deepEqual(products.map(a=>a.getAttribute('href')),['/products/watermelon-trance/','/products/blueberry-bomb/','/products/pumpkin-energy/','/products/elderflower-lullaby/']);assert.deepEqual([...track.querySelectorAll('.chamber')].map(n=>n.getAttribute('data-cabinet')),['0','3','2','1'],'Baked-in flavor labels follow their reordered pouches');assert.equal(track.querySelectorAll('.chamber-art .classics-cabinet-image').length,4);assert.equal(track.querySelector('.classics-wall-image'),null,'No continuous image bridges the new cabinet gaps');assert.ok(fs.existsSync('public/assets/classics-cabinet-mask.svg'));assert.equal(track.querySelectorAll('.chamber-glass').length,4);assert.ok(products.every(a=>a.getAttribute('href').startsWith('/products/')));
assert.equal(document.querySelector('.classics-display').getAttribute('href'),'/collection/');assert.equal(document.querySelector('.classics-display-image').getAttribute('src'),'/assets/classics-display.webp');assert.equal(document.querySelectorAll('#classics .view-all').length,0);
// Resolve the actual CSS proportions against real inlet geometry at desktop widths.
const css=fs.readFileSync('public/classics-wall.css','utf8');
const chamberFraction=Number(css.match(/#classics \.chamber\{[^}]*flex:0 0 ([\d.]+)%/)[1])/100;
const gutterFraction=Number(css.match(/--chamber-gap:([\d.]+)%/)[1])/100;
const leadingFraction=Number(css.match(/\.chamber:first-child\{margin-left:([\d.]+)%/)[1])/100;
const model=makeReferencePipes();
for(const viewport of [761,1024,1440,1920]){
 const width=Math.min(1400,viewport);
 for(let i=0;i<3;i++){
  const chamberCenter=(leadingFraction+i*(chamberFraction+gutterFraction)+chamberFraction/2)*width;
  const inlet=model.curves[i].getPointAt(0),pipeCenter=(inlet.x+5)/10*width;
  assert.ok(Math.abs(chamberCenter-pipeCenter)<1e-8,'Large Classics chamber and its inlet share a center');
 }
 assert.ok(Math.abs((pipeLayout.feedXs[1]/pipeLayout.width-.5)*width)<1e-8,'Blueberry is centered on the page');
}
console.log('PASS: enlarged chamber/inlet alignment at four desktop widths, centered Blueberry and matching artwork, horizontal Elderflower access, mobile keyboard steps, bounds, Home/End, drag/click protection, native touch, glass overlays and collection display.');

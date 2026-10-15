import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {makeSectionMotion,makeHeadlineMotion,makeChamberArrival,sectionReveals} from '../public/section-motion.js';
const {document}=parseHTML(fs.readFileSync('public/index.html','utf8'));
const module={exports:{}};vm.runInNewContext(fs.readFileSync('public/assets/gsap.min.js','utf8'),{module,exports:module.exports,setTimeout,clearTimeout,console,Date});
const core=module.exports.gsap,entries=[];
const gs={fromTo(targets,from,to){const {scrollTrigger,...properties}=to;const tween=core.fromTo(targets,from,{...properties,paused:true});entries.push({targets,tween,scrollTrigger});return tween;}};
makeSectionMotion({gs,resolve:selector=>[...document.querySelectorAll(selector)].map(()=>({y:0,scale:1,opacity:1}))});
assert.equal(entries.length,8);assert.ok(!entries.some(e=>e.scrollTrigger.trigger==='#pipeline'),'The pipeline has no bounce, scale or opacity entrance');assert.deepEqual(entries.map(e=>e.scrollTrigger.trigger),sectionReveals.map(s=>s.trigger));
for(const {targets,tween,scrollTrigger} of entries){
 assert.equal(scrollTrigger.toggleActions,'play none none reverse');assert.ok(targets.length>=1);
 tween.seek(0);assert.ok(targets.every(t=>t.y===130&&t.opacity===0&&t.scale===.88));
 tween.seek(.35);if(targets.length>1)assert.ok(targets[0].opacity>targets[1].opacity,'Stagger creates a deliberate order');
 tween.seek(tween.duration());assert.ok(targets.every(t=>t.y===0&&t.opacity===1&&t.scale===1));
 tween.seek(0);assert.ok(targets.every(t=>t.opacity===0&&t.y===130),'Reverse restores the jump start');tween.kill();
}
let reducedCalls=0;makeSectionMotion({gs:{fromTo(){reducedCalls++;}},resolve:()=>[],reduced:true});assert.equal(reducedCalls,0);
const headlines=[{rotationX:0,transformPerspective:0,transformOrigin:''}],angles=[];
makeHeadlineMotion({gs:{fromTo(target,from,to){const {scrollTrigger,...props}=to;const tween=core.fromTo(target,from,{...props,paused:true,duration:1});angles.push({tween,scrollTrigger});}},resolve:()=>headlines});
assert.equal(angles.length,1);assert.equal(angles[0].scrollTrigger.scrub,.6);angles[0].tween.seek(0);assert.equal(headlines[0].rotationX,-9);assert.equal(headlines[0].transformOrigin,'50% 50%');angles[0].tween.seek(.5);assert.equal(headlines[0].rotationX,0);angles[0].tween.seek(1);assert.equal(headlines[0].rotationX,9);angles[0].tween.seek(0);assert.equal(headlines[0].rotationX,-9);angles[0].tween.kill();
makeHeadlineMotion({gs:{fromTo(){reducedCalls++;}},resolve:()=>headlines,reduced:true});assert.equal(reducedCalls,0);
const shell={y:0,scale:1,opacity:1},stage={clientHeight:800};let arrivalConfig;
const arrival=makeChamberArrival({gs:{fromTo(target,from,to){arrivalConfig=to.scrollTrigger;const {scrollTrigger,...props}=to;return core.fromTo(target,from,{...props,duration:1,paused:true});}},stage,shell,viewportHeight:()=>900});
arrival.seek(0);assert.equal(shell.y,810);arrival.seek(.5);assert.equal(shell.y,405);arrival.seek(1);assert.equal(shell.y,0);assert.equal(shell.scale,1);assert.equal(shell.opacity,1);arrival.seek(0);assert.equal(shell.y,810);assert.equal(arrivalConfig.end(),'center center');stage.clientHeight=1100;assert.equal(arrivalConfig.end(),'top top');assert.equal(arrivalConfig.start,'top bottom');assert.equal(arrivalConfig.scrub,.65);arrival.kill();
assert.equal(makeChamberArrival({gs,stage,shell,reduced:true}),null);
core.ticker.sleep();console.log('PASS: actual GSAP jump/scale/opacity/stagger motion on eight content sections (pipeline remains still) and centered scroll-linked headline perspectives, valid selectors, reverse restoration and reduced-motion bypass.');

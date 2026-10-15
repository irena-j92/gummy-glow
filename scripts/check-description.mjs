import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {makeDescriptionMotion} from '../public/description-motion.js';
// Execute the shipped GSAP timeline, rather than duplicating its transform math.
const module={exports:{}};
vm.runInNewContext(fs.readFileSync('public/assets/gsap.min.js','utf8'),{module,exports:module.exports,setTimeout,clearTimeout,console,Date});
const gs=module.exports.gsap;
function section(){const classes=new Set();return {classes,classList:{toggle(k,v){v?classes.add(k):classes.delete(k);},remove(k){classes.delete(k);}}};}
function run(width,height){
 const floor=section(),stage={clientWidth:width,clientHeight:height,opacity:1,clearProps:""};
 const copy={x:0,y:0,scale:1,rotationX:0,rotationY:0,skewX:0,opacity:1,transformOrigin:'',transformPerspective:0,force3D:false};
 const gummies=[1.5,1.4,1.2,1,.4,.65].map((depth,i)=>({dataset:{depth:String(depth),turn:String(i%2?20:-18)},x:0,y:0,scale:1,rotation:0,opacity:1,force3D:false}));
 let trigger;
 const ST={create(opts){trigger={...opts,kill(){this.killed=true;}};return trigger;}};
 const motion=makeDescriptionMotion({gs,ST,section:floor,stage,copy,gummies});
 assert.ok(floor.classes.has('description-motion'));assert.equal(trigger.animation,motion.timeline);assert.equal(trigger.start,'top top');assert.equal(trigger.end,'bottom bottom');assert.equal(trigger.pin,undefined,'Native sticky scene never intercepts scrolling');
 motion.timeline.seek(.12);assert.equal(stage.opacity,1);assert.equal(copy.scale,1);assert.equal(copy.opacity,1);assert.equal(copy.y,0,'Text remains readable before the perspective move');
 motion.timeline.seek(.5);assert.ok(copy.scale>1.3&&copy.scale<1.7);assert.ok(copy.rotationX>10);assert.equal(copy.rotationY,0);assert.equal(copy.skewX,0);assert.equal(copy.transformOrigin,'50% 50%');assert.ok(copy.y<0);assert.ok(copy.opacity>.55);assert.ok(Math.abs(gummies[0].y)>Math.abs(gummies[4].y),'Foreground travels faster than the central gummy');
 motion.timeline.seek(1);assert.equal(stage.opacity,1,'Navy holds after the description disappears');assert.equal(copy.opacity,0);assert.ok(copy.y< -height*.9);assert.equal(copy.scale,2.12);assert.ok(gummies.every(n=>n.opacity===0&&n.y< -height),'Final frame is clear');
 motion.timeline.seek(1.56);assert.equal(stage.opacity,1);assert.equal(copy.opacity,0);assert.ok(gummies.every(n=>n.opacity===0),'Cleared navy persists through the extra scroll hold');motion.timeline.seek(1.67);assert.ok(stage.opacity>0&&stage.opacity<1,'Creation crossfade begins only after the hold');motion.timeline.seek(1.77);assert.equal(stage.opacity,0);const css=fs.readFileSync('public/description-motion.css','utf8');const sectionVh=Number(css.match(/description-floor.description-motion\{height:(\d+)svh/)[1]);assert.ok(Math.abs((1.57-.98)/motion.timeline.duration()*(sectionVh-100)/100-1)<.02,'Navy hold reserves one screen-length of native scrolling');
 motion.timeline.seek(0);assert.equal(stage.opacity,1,'Reverse restores the background');assert.equal(copy.opacity,1);assert.equal(copy.scale,1);assert.equal(copy.rotationX,0);assert.equal(copy.y,0);assert.ok(gummies.every(n=>n.opacity===1&&n.y===0),'Reverse scrolling restores initial composition');
 stage.clientHeight=height*.8;motion.timeline.invalidate().seek(1);assert.ok(Math.abs(copy.y+stage.clientHeight*.93)<.01,'Resize remeasures viewport-dependent translation');
 motion.dispose();assert.ok(trigger.killed);assert.ok(!floor.classes.has('description-motion'));
 const staticFloor=section();let calls=0;
 const still=makeDescriptionMotion({gs,ST:{create(){calls++;}},section:staticFloor,stage,copy,gummies,reduced:true});
 assert.equal(still.timeline,null);assert.equal(calls,0);assert.ok(!staticFloor.classes.has('description-motion'),'Reduced motion does not reserve animation scroll space');
 still.dispose();
}
run(1440,900);run(390,844);gs.ticker.sleep();
console.log('PASS: real GSAP description at desktop/mobile sizes: readable hold, perspective tilt, zoom/upward fade, six depth-separated gummies, one-screen navy hold, delayed creation exit, exact reverse restoration, resize, disposal and reduced motion.');

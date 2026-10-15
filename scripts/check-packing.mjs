import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {makePackingMotion} from '../public/packing-motion.js';
// Run the shipped GSAP timeline on numeric targets. Browser/GPU appearance is not inferred.
const module={exports:{}};
vm.runInNewContext(fs.readFileSync('public/assets/gsap.min.js','utf8'),{module,exports:module.exports,setTimeout,clearTimeout,console,Date});
const gs=module.exports.gsap,triggers=[];
const ST={create(opts){const trigger={...opts,kill(){this.killed=true;}};triggers.push(trigger);return trigger;}};
const stage={clientHeight:700},bin={xPercent:0,autoAlpha:1},status={textContent:''};
const pouches=Array.from({length:12},(_,i)=>({dataset:{angle:String(i%2?8:-8)},offsetTop:i%3*20,clientHeight:260,xPercent:0,yPercent:0,zIndex:0,y:0,scale:1,rotation:0,filter:'blur(0px)',autoAlpha:1}));
const packing=makePackingMotion({gs,ST,stage,bin,pouches,status});
packing.timeline.seek(0);assert.equal(bin.autoAlpha,0);assert.ok(bin.xPercent>100);assert.ok(pouches.every(p=>p.autoAlpha===0));
packing.timeline.seek(1.25);assert.equal(bin.autoAlpha,1);assert.equal(bin.xPercent,0);assert.ok(pouches.every(p=>p.autoAlpha===0),'Box stops before pouch drops');
packing.timeline.seek(2);assert.ok(pouches[0].scale>1);assert.ok(pouches[0].y<0);assert.notEqual(pouches[0].filter,'blur(0px)');assert.ok(Number.parseFloat(pouches[0].filter.slice(5))<=6,'Falling pouches use a restrained blur');assert.equal(pouches[11].autoAlpha,0,'Drops are staggered');
packing.timeline.seek(5.5,false);assert.ok(pouches.every(p=>p.y===0&&p.scale===1&&p.autoAlpha===1&&p.filter==='blur(0px)'));assert.equal(status.textContent,'Packed with all four flavors.');assert.ok(pouches.every((p,i)=>p.xPercent===-50&&p.yPercent===-50&&p.zIndex===i+1),'Final centered poses use stable stack order');
triggers[0].onLeave();assert.equal(packing.timeline.paused(),true);packing.replay();assert.ok(packing.timeline.progress()<.01);packing.pause();assert.equal(packing.timeline.paused(),true);triggers[0].onEnterBack();assert.equal(packing.timeline.paused(),false);
packing.dispose();assert.ok(triggers[0].killed);
const still=makePackingMotion({gs,ST,stage,bin,pouches,status,reduced:true});assert.equal(still.timeline,null);assert.equal(bin.xPercent,0);assert.ok(pouches.every(p=>p.scale===1&&p.autoAlpha===1));
gs.ticker.sleep();
const html=fs.readFileSync('public/index.html','utf8');
const matches=[...html.matchAll(/class="packing-pouch"[^>]*data-angle="(-?\d+)" style="left:(\d+)%;top:(\d+)%/g)];
assert.equal(matches.length,12);
for(const m of matches){
 const angle=Number(m[1])*Math.PI/180,x=Number(m[2])/100,y=Number(m[3])/100;
 const w=.19,h=w*803/498;
 const halfX=(w*Math.abs(Math.cos(angle))+h*Math.abs(Math.sin(angle)))/2;
 const halfY=(h*Math.abs(Math.cos(angle))+w*Math.abs(Math.sin(angle)))/2/(2/3);
 assert.ok(x-halfX>.113&&x+halfX<.888,'Settled pouch fits inside top-view tray width');
 assert.ok(y-halfY>.160&&y+halfY<.835,'Settled pouch fits inside top-view tray height');
}
console.log('PASS: real GSAP box initially hidden, right-to-left arrival, pause before drops, overhead scale/blur descent, stagger, twelve flat pouches inside the measured top-view tray, replay, offscreen pause/resume and reduced-motion packed view.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={window:{}};
vm.runInNewContext(fs.readFileSync('public/scene-math.js','utf8'),scope);
const {heroGeometry,timing}=scope.window.GummyScene;
for(const [w,h] of [[320,600],[390,844],[768,1024],[1024,768],[1440,900],[1920,1080]]) {
 const g=heroGeometry(w,h),p=g.packWidth/498;
 assert.ok(Math.abs(g.packX+247*p-w/2)<.001,'Visible pouch horizontal center');
 assert.ok(Math.abs(g.centerY+401*p-h/2)<.001,'Visible pouch vertical center');
 assert.ok(g.clawWidth<=770 && g.packHeight<=560,'Responsive sizes respect desktop targets');
 if(w>=1024&&h>=800){assert.equal(g.clawWidth,770);assert.equal(g.packHeight,560);assert.ok(g.packWidth>=340&&g.packWidth<=360);}
 for(const progress of [0,.25,.5,.75,1]) {
  const clawY=g.clawReleaseY*progress;
  const pouchY=g.pickupY+(g.centerY-g.pickupY)*progress;
  const seal=pouchY+2*p,tip=clawY+1436*g.scale;
  assert.ok(tip>seal && tip<seal+75*p,'Prong tips overlap the top seal throughout lift');
  const leftTip=g.clawX+350*g.scale,rightTip=g.clawX+670*g.scale;
  assert.ok(leftTip>g.packX+3*p&&leftTip<g.packX+120*p,'Left tip grips left seal edge');
  assert.ok(rightTip<g.packX+491*p&&rightTip>g.packX+378*p,'Right tip grips right seal edge');
 }
 assert.ok(g.offscreenY+g.clawHeight<0,'Claw fully clears hero after release');
}
const html=fs.readFileSync('public/index.html','utf8');
const classics=html.match(/<section id="classics"[\s\S]*?<\/section>/)[0];
assert.equal((classics.match(/class="chamber"/g)||[]).length,4);
for(const flavor of ['watermelon','elderflower','pumpkin','blueberry'])assert.ok(classics.includes(`/assets/${flavor}.png`));
assert.ok(!classics.includes('class="lightbox"'));
assert.ok(!classics.includes('gallery-progress'));
const motion=fs.readFileSync('public/motion.js','utf8');
const sprites=motion.slice(motion.indexOf('const createGummies'),motion.indexOf('function layoutHero'));
assert.ok(sprites.includes("img.src = '/assets/pink-gummy-new.png'"));assert.ok(!sprites.includes('hue-rotate'));
assert.equal(timing.descent+timing.lift,3.5);
console.log('Passed: six viewport geometries, visible pouch centering, two-tip seal overlap throughout lift, requested desktop sizes and complete exit, four flavors, integrated titles, pink-only sprites.');

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';
import {floorAt} from '../public/tour-math.js';
import {flavors,restorePick,tourProgress} from '../public/flavors.js';
import {makeGrayLab} from '../public/lab-model.js';
import {parseHTML} from 'linkedom';
import * as THREE from '../public/vendor/three.module.js';
const html=fs.readFileSync('public/index.html','utf8');
const collection=fs.readFileSync('public/collection/index.html','utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]));
assert.equal([...html.matchAll(/data-floor="/g)].length,8);
assert.equal([...html.matchAll(/data-target-floor="/g)].length,6);
assert.equal([...html.matchAll(/<h1\b/g)].length,1);
for(const [,path] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)){
 if(path==='/collection/')continue;assert.ok(fs.existsSync('public'+path),path);
}
for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.has(id),id);
for(const [,id] of collection.matchAll(/href="\/#([^"]+)"/g))assert.ok(ids.has(id),'Collection return target: '+id);
assert.ok(html.includes('action="/api/subscribe"'));assert.ok(!html.includes('https://'));
for(const key of Object.keys(flavors)){
 assert.equal(restorePick(key),key);assert.ok(collection.includes('id="'+key+'"'));
 assert.ok(fs.existsSync('public/assets/optimized/'+key+'.webp'));
 assert.ok(fs.existsSync('public/assets/optimized/'+flavors[key].gummy+'.webp'));
}
for(const invalid of ['__proto__','toString','',null,'bad'])assert.equal(restorePick(invalid),null);
assert.equal(tourProgress(-10,1000,600),0);assert.equal(tourProgress(500,400,600),1);assert.equal(tourProgress(200,1000,600),.5);
const scope={window:{}};vm.runInNewContext(fs.readFileSync('public/scene-math.js','utf8'),scope);
const {heroGeometry,heroPopGeometry,headingFontSize,timing}=scope.window.GummyScene;
for(const [w,h] of [[320,320*1144/1375*.761],[390,390*1144/1375*.761],[768,768*1144/1375*.761],[1024,1024*1144/1375*.761],[1440,1440*1144/1375*.761],[1920,1920*1144/1375*.761]]){
 const g=heroGeometry(w,h),p=g.packWidth/498;
 assert.ok(Math.abs(g.packX+247*p-w/2)<.001);assert.ok(Math.abs(g.centerY+401*p-h/2)<.001);
 assert.ok(g.packWidth<w);assert.ok(g.packHeight*798/803<=h*.751);assert.ok(Math.abs(g.packHeight*798/803-Math.min(680,h*.75,w*.76*798/488))<.001,'Restored pouch remains slightly smaller and responsive');
 for(let i=0;i<=20;i++){
  const t=i/20,seal=g.pickupY+(g.centerY-g.pickupY)*t+2*p,tip=g.clawReleaseY*t+1436*g.scale;
  assert.ok(tip>seal&&tip<seal+75*p,'Both layers remain gripped through lift');
 }
 assert.ok(g.offscreenY+g.clawHeight<0);const pops=heroPopGeometry(w,h);assert.equal(pops.length,8);assert.ok(pops.every(p=>p.bottom>h&&p.apex<h&&Number.isFinite(p.left)));assert.ok(Math.abs((pops[2].left+pops[2].width/2)/w-.326)<1e-9,'Interior gummy uses measured reference center');const size=headingFontSize(w,6.4,12);assert.ok(Math.abs(size*(6.4-11*.035)-w*.985)<.001);
}
assert.equal(timing.descent+timing.lift,3.5);
const model=makeGrayLab(new THREE.Texture());
model.rig.traverse(n=>{if(n.isMesh)for(const v of n.geometry.attributes.position.array)assert.ok(Number.isFinite(v));});
const {document}=parseHTML(html);
assert.equal(document.querySelector('.machine-stages').previousElementSibling.className,'machine-screen');assert.equal(document.querySelector('#story').getAttribute('data-floor-group'),'0');assert.equal(document.querySelector('#blueprint').getAttribute('data-floor'),'01');assert.ok(document.querySelector('.creation-intro h2'));assert.equal(document.querySelector('#blueprint').nextElementSibling.className,'brand-details');assert.ok(document.querySelector('.creation-stage .chamber-shell'));assert.equal(document.querySelectorAll('.pop-candy').length,0,'Hero particles are initialized hidden by the controller');
assert.ok(document.querySelector('.machine-screen .machine-window .hero-pack'));
assert.equal(document.querySelectorAll('.lab-wall-claw img[src="/assets/claw-chamber.webp"]').length,2);
assert.ok(!document.querySelector('.pouch-dissolve'));assert.ok(!document.querySelector('.lab-wall-rail'));assert.ok(!document.querySelector('#review-position'));assert.ok(!document.querySelector('.review-controls'));assert.equal(document.querySelectorAll('.machine-stages .stage-button').length,6);assert.equal(document.querySelector('.comparison-table-art').getAttribute('src'),'/assets/comparison-table.svg');assert.equal(document.querySelector('.blueprint-photo').getAttribute('src'),'/assets/optimized/gray-pouch.webp');
assert.equal(document.querySelectorAll('.comparison-table tbody tr').length,10);
assert.equal(document.querySelectorAll('.comparison-table tbody th[scope="row"]').length,10);
assert.equal(document.querySelectorAll('.review-note').length,4);assert.equal(document.querySelectorAll('.gummy-rating img').length,5);assert.equal(document.querySelectorAll('.current-floor-button').length,1);for(const id of ['#packing-replay','#pipe-pause','#pipe-run'])assert.equal(document.querySelector(id),null);assert.equal(document.querySelectorAll('#classics .eyebrow,#classics .section-heading p,#newbies .eyebrow,#newbies p').length,0);assert.ok(document.querySelector('.footer-logo').getAttribute('aria-label').includes('back to top'));assert.ok(document.querySelector('.footer-bottom').textContent.includes('All rights reserved.'));assert.ok(!document.querySelector('footer').textContent.includes('private brand prototype'));assert.ok(!document.querySelector('footer').textContent.includes('little more'));assert.equal(document.querySelectorAll('.story-gummy').length,6);assert.equal(new Set([...document.querySelectorAll('.story-gummy')].map(n=>n.getAttribute('src'))).size,4);assert.ok(document.querySelector('#story .story-stage .story-copy'));assert.ok(!document.querySelector('.story-copy [aria-hidden]'),'Original paragraph remains accessible without hidden word splitting');
assert.ok(document.querySelector('#reviews-heading').innerHTML.includes('<br>'));
assert.ok(!document.querySelector('.taste-console'));
assert.equal(document.querySelectorAll('#classics .chamber-pack').length,4);
assert.equal(document.querySelectorAll('#newbies .lab-monitor').length,3);
assert.equal(document.querySelectorAll('.packing-pouch').length,12);
assert.equal(document.querySelectorAll('.packing-tray').length,1);
assert.equal(document.querySelector('#newbies'),document.querySelector('#pipeline').nextElementSibling);assert.equal(document.querySelector('#reviews'),document.querySelector('.production-run').nextElementSibling);assert.deepEqual([...document.querySelector('.production-run').children].map(n=>n.id),['classics','pipeline','newbies']);assert.deepEqual([...document.querySelectorAll('[data-floor]')].map(n=>Number(n.getAttribute('data-floor'))),[0,1,2,3,4,5,6,7]);


assert.equal(floorAt([0,1000,2000,3000],1800,800),2);
let firstLoad=0;for(const path of ['public/lab-updates.css','public/lab-details.js','public/stick-creation.js','public/factory-experience.css','public/factory-experience.js','public/tour.js','public/tour.css','public/machine-layout.css','public/reference-sections.css','public/production-floor.css','public/packing-motion.js','public/description-motion.js','public/description-motion.css','public/stage-refinement.css','public/floor-polish.css','public/classics-wall.css','public/footer.css','public/footer.js','public/factory-details.css','public/community-gallery.css','public/community-gallery.js','public/review-lens.js','public/horizontal-track.js','public/navigation.js','public/shop.js','public/bag.js','public/catalog.js','public/assets/navigation.svg','public/section-motion.js','public/assets/gsap.min.js','public/assets/ScrollTrigger.min.js','public/scene-math.js','public/assets/hero-machine-polished.webp','public/assets/floor-bank-polished.webp','public/assets/header-background.webp','public/assets/optimized/watermelon.webp','public/assets/optimized/claw.webp','public/assets/optimized/hero-pattern.webp','public/assets/optimized/hero-pink-gummy.webp','public/assets/anton-latin-400-normal.woff2','public/assets/outfit-latin-400-normal.woff2','public/assets/outfit-latin-600-normal.woff2'])firstLoad+=zlib.gzipSync(fs.readFileSync(path)).length;
assert.ok(firstLoad<650000,'Higher-quality photographic header remains below 650 KB compressed');
console.log('PASS: 8 floors with description on reception, restored Classics/Newbies and 12 packing pouches, local links/assets, collection return links, invalid-storage recovery, 6 responsive claw geometries, supplied grayscale creation plane, separate floor buttons and supplied wall claws, floor/progress boundaries. Initial homepage resources: '+Math.round(firstLoad/1024)+' KiB compressed (excludes lazy Three.js and below-fold assets).');

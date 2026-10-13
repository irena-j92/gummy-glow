import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pouchPose,pouchPoint,floorAt} from '../public/tour-math.js';
import {makePouch} from '../public/pouch-model.js';
import * as THREE from '../public/vendor/three.module.js';
// Check the real geometry throughout the opening, not just the animation config.
const model=makePouch(new THREE.Texture());
for(const progress of [0,.1,.25,.5,.7,.9,1]) {
 const pose=pouchPose(progress);model.open(pose.open);
 assert.ok(pose.scale>=1&&pose.scale<=14);
 model.group.traverse(node=>{if(!node.isMesh)return;for(const value of node.geometry.attributes.position.array)assert.ok(Number.isFinite(value));});
}
for(const u of [0,.25,.5,.75,1]) {
 const front=pouchPoint(u,1,1,1),back=pouchPoint(u,1,-1,1);
 assert.equal(front[0],back[0]);assert.equal(front[1],back[1]);assert.ok(front[2]>back[2]);
}
assert.ok(pouchPoint(.5,1,1,1)[2]-pouchPoint(.5,1,-1,1)[2]>.7,'Opening has actual depth');
assert.equal(pouchPose(0).fade,1);assert.equal(pouchPose(1).fade,0);
assert.equal(pouchPose(1).open,1);assert.equal(pouchPose(1).tear,1);
assert.equal(floorAt([0,1000,2000],1200,800),1);assert.equal(floorAt([0,1000,2000],1900,800),2);
const html=readFileSync('public/index.html','utf8');
assert.equal((html.match(/data-floor="/g)||[]).length,11);
assert.equal((html.match(/data-target-floor="/g)||[]).length,11);
for(const path of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
 const url=path[1];if(url.endsWith('/')||url.startsWith('/collection'))continue;
 assert.doesNotThrow(()=>readFileSync('public'+url),url);
}
assert.ok(html.includes('id="newsletter-form"'));
console.log('Passed: real 3D pouch geometry at seven poses, interior depth, tear/zoom endpoints, 11 floor destinations, local asset paths and newsletter form.');

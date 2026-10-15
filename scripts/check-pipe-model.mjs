import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {makeReferencePipes} from '../public/pipe-model.js';
import {Texture,ShaderLib} from '../public/vendor/three.module.js';
import {pipeFluidColors,pipeGummies,pipeDimensions} from '../public/pipe-style.js';
import {pipeLayout,upperPipePaths,lowerPipePaths} from '../public/pipe-layout.js';
assert.ok(readFileSync('public/assets/pipeline-stage.svg','utf8').includes('fill="#fc8cf6"'),'Glass backdrop matches Classics pink');assert.ok(/\.reference-pipeline\{[^}]*background:#fc8cf6/.test(readFileSync('public/reference-sections.css','utf8')),'The pipeline section itself uses Classics pink');
const gummyMaps=pipeGummies.map(()=>new Texture());const model=makeReferencePipes({gummyMaps});
const glass=model.rig.children.find(n=>n.name==='clear-gummy-pipe').material;assert.ok(glass.isMeshPhysicalMaterial);assert.equal(glass.opacity,1);assert.ok(glass.transmission>.9);assert.equal(glass.metalness,0);assert.ok(glass.ior>=1.5&&glass.ior<1.6);assert.ok(glass.thickness>0&&glass.thickness<pipeDimensions.outer);assert.equal(glass.attenuationColor.getHex(),0xffffff,'Neutral glass preserves gummy colors');assert.ok(model.rig.children.find(n=>n.name==='clear-gummy-pipe-front-reflections'));
assert.ok(Math.abs((.36-pipeDimensions.outer)*2*140-10)<1e-9,'Diameter is 10 CSS px slimmer at the maximum desktop width');
assert.ok(pipeLayout.bendRadius>pipeDimensions.outer*160,'Elbows must not fold into the enlarged tube');
for(let i=0;i<3;i++){
 const upper=upperPipePaths[i],lower=lowerPipePaths[i];
 assert.equal([...upper,...lower].filter(s=>s.length===8).length,6,'Six bends per complete pipe, including the blue route');
 for(const bend of upper.filter(s=>s.length===8))assert.ok(Math.min(Math.abs(bend[6]-bend[0]),Math.abs(bend[7]-bend[1]))>pipeDimensions.outer*160,'Every actual elbow clears the outer wall, including clamped corners');
 assert.deepEqual(upper.at(-1).slice(-2),lower[0].slice(0,2),'Glass joins without a step or gap at the liquid transition');
 assert.equal(lower.length,1,'Lower liquid outlets stay straight');
}
assert.equal(model.outlets.length,3);assert.equal(model.curves.length,3);assert.equal(model.candy.length,36);
assert.equal(model.rig.children.filter(n=>n.isInstancedMesh).length,0);assert.ok(!model.rig.children.some(n=>/striped-sleeve|silver-flex-coil|clear-recirculation-loop/.test(n.name)));assert.ok(!model.rig.children.find(n=>n.name==='flavor-reservoir'));assert.equal(model.fittings.length,0);for(const curve of model.curves)for(const point of curve.getSpacedPoints(100))assert.ok(point.toArray().every(Number.isFinite));
assert.ok(!model.rig.children.some(n=>/temperature|thermometer/.test(n.name)));assert.ok(!model.rig.children.some(n=>n.name.endsWith('-reflection')));assert.equal(model.feeds.length,0);assert.ok(!pipeGummies.some(g=>g.asset.includes('teal')));
for(const edge of model.rig.children.filter(n=>n.name==='pipe-silhouette-stroke')){assert.equal(edge.material.color.getHex(),0xffffff);assert.equal(edge.material.opacity,.8);assert.equal(edge.material.toneMapped,false);}
for(const gummy of model.candy){assert.equal(gummy.material.map,gummyMaps[gummy.userData.gummyType]);assert.ok(gummy.scale.x>=.4);const shader={fragmentShader:ShaderLib.sprite.fragmentShader};gummy.material.onBeforeCompile(shader);assert.ok(shader.fragmentShader.includes('softColor'));assert.ok(!shader.fragmentShader.includes('#include <map_fragment>'));}
for(const [i,outlet] of model.outlets.entries()){
 const endpoint=outlet.curve.getPointAt(1);assert.ok(endpoint.y<-pipeLayout.height/(2*(pipeLayout.width/10)),'Three pipes leave through the bottom');
 for(const viewport of [320,390,768,1024,1440,1920]){
  const width=Math.min(1400,viewport),screenX=(endpoint.x+5)/10*width;
  assert.ok(Math.abs(screenX-pipeLayout.outletFractions[i]*width)<1e-9,'Each port follows its measured stick/chamber center');
 }
 assert.equal(outlet.liquid.material.uniforms.fluidColor.value.getHex(),pipeFluidColors[i]);assert.equal(outlet.shell.geometry.parameters.radius,pipeDimensions.outer);assert.ok(outlet.shell.geometry.parameters.radius>.135);
}
for(const [i,curve] of model.curves.entries()){const start=curve.getPointAt(0);assert.ok(Math.abs((start.x+5)*160-pipeLayout.feedXs[i])<1e-6);if(i)assert.ok(pipeLayout.feedXs[i]-pipeLayout.feedXs[i-1]>200);assert.ok(start.y>pipeLayout.height/320,'Inlets extend beyond the top edge');}
for(const clock of [0,1,10,100]){
 model.update(clock);assert.equal(model.liquid.material.uniforms.flowTime.value,clock);
 for(const gummy of model.candy){const y=pipeLayout.height/2-gummy.position.y*(pipeLayout.width/10);if(gummy.visible){assert.ok(y+gummy.scale.y*pipeLayout.width/20<pipeLayout.splitY,'Gummy silhouette never spills into the fluid-only section');assert.ok(y>=pipeLayout.inletY,'Gummies follow the pipe from its offscreen entry');}assert.ok(gummy.position.toArray().every(Number.isFinite));}
}
// At every sampled phase each route already carries visible gummies before its first bend.
for(let clock=0;clock<40;clock+=.5){
 model.update(clock);
 for(let type=0;type<3;type++)assert.ok(model.candy.some(g=>{const y=pipeLayout.height/2-g.position.y*160;return g.userData.gummyType===type&&g.visible&&g.material.opacity>.9&&y>=0&&y<220;}),'Each pipe has gummies in the top straight run throughout the cycle');
}
model.rig.traverse(n=>{if(n.geometry)for(const v of n.geometry.attributes.position.array)assert.ok(Number.isFinite(v));if(n.isInstancedMesh)for(const v of n.instanceMatrix.array)assert.ok(Number.isFinite(v));assert.ok(!/valve|ventil|handwheel/i.test(n.name));});
console.log('PASS: three bottom ports aligned at six viewport widths, separate upper blurred gummies/lower fluid, white 80% outlines, photographic gummies, no decorative swirls or inner lines, restored physical glass, large gummies visible from all three inlets, no top liquid, no thermometer or silver rings, finite mesh/instance transforms and no valves.');

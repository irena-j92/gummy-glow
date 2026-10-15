import * as THREE from './vendor/three.module.js';

// Use the supplied model-like photograph verbatim; the scan is the only effect.
export function makeGrayLab(texture) {
 const rig=new THREE.Group(),group=new THREE.Group();
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(3.24*833/1223,3.24),material);mesh.name='supplied-gray-pouch';group.add(mesh);rig.add(group);
 const reveal={value:-.06},bottom={value:0},height={value:1};
 material.onBeforeCompile=shader=>{
  shader.uniforms.labReveal=reveal;shader.uniforms.labBottom=bottom;shader.uniforms.labHeight=height;
  shader.fragmentShader='uniform float labReveal; uniform float labBottom; uniform float labHeight;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','#include <opaque_fragment>\nfloat scan=(gl_FragCoord.y-labBottom)/labHeight; gl_FragColor.a*=smoothstep(1.0-labReveal-.025,1.0-labReveal+.025,scan);');
 };
 material.customProgramCacheKey=()=> 'gummy-supplied-gray-scan-v2';
 function update({revealProgress=0,pixelBottom=0,pixelHeight=1}) {
  reveal.value=revealProgress;bottom.value=pixelBottom;height.value=Math.max(1,pixelHeight);
 }
 return {rig,pouch:{group},update};
}

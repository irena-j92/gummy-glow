import * as THREE from './vendor/three.module.js';
import {pouchPoint} from './tour-math.js';

export function makePouch(texture) {
  const group=new THREE.Group();
  const body=new THREE.Group(); group.add(body);
  const printed=new THREE.MeshStandardMaterial({map:texture,roughness:.44,metalness:.05,side:THREE.DoubleSide});
  const pink=new THREE.MeshStandardMaterial({color:0xfc8cf6,roughness:.38,metalness:.12,side:THREE.DoubleSide});
  const foil=new THREE.MeshStandardMaterial({color:0xe9daf5,roughness:.3,metalness:.65,side:THREE.DoubleSide});
  const surfaces=[];
  for(const side of [1,-1]) {
    const geo=new THREE.PlaneGeometry(2,2.82,40,52);
    const uv=geo.attributes.uv;
    const coordinates=[];
    for(let i=0;i<uv.count;i++) {
      const u=uv.getX(i),v=uv.getY(i);
      coordinates.push([u,v]);
      uv.setXY(i,u,(v*2.82)/3.24);
    }
    const mesh=new THREE.Mesh(geo,side===1?printed:pink);
    body.add(mesh); surfaces.push({mesh,coordinates,side});
    // Separate unprinted foil just inside each printed wall.
    const inner=new THREE.Mesh(geo.clone(),foil); inner.scale.z=.97;
    body.add(inner); surfaces.push({mesh:inner,coordinates,side,inner:true});
  }
  // Closed side seals, retaining the volume of a flexible stand-up pouch.
  for(const sign of [-1,1]) {
    const seam=new THREE.Mesh(new THREE.BoxGeometry(.025,2.82,.075),pink);
    seam.position.set(sign,-.21,0); body.add(seam);
  }
  const bottom=new THREE.Mesh(new THREE.BoxGeometry(1.97,.025,.12),pink);
  bottom.position.y=-1.62; body.add(bottom);
  const strip=new THREE.Group(); group.add(strip);
  const stripGeometry=new THREE.PlaneGeometry(2,.42,32,4);
  const uv=stripGeometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setY(i,.87037+uv.getY(i)*.12963);
  const top=new THREE.Mesh(stripGeometry,printed); top.position.set(0,1.41,.036); strip.add(top);
  const back=new THREE.Mesh(stripGeometry.clone(),pink); back.position.set(0,1.41,-.036); strip.add(back);
  const opening=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshBasicMaterial({color:0x151046,side:THREE.DoubleSide}));
  opening.rotation.x=-Math.PI/2; opening.position.y=1.18; opening.scale.set(.93,.001,1); body.add(opening);
  let last=-1;
  function open(value) {
    if(Math.abs(last-value)<.0001)return;last=value;
    for(const {mesh,coordinates,side,inner} of surfaces) {
      const pos=mesh.geometry.attributes.position;
      coordinates.forEach(([u,v],i)=>{const p=pouchPoint(u,v,side,value);if(inner)p[2]*=.96;pos.setXYZ(i,...p);});
      pos.needsUpdate=true;mesh.geometry.computeVertexNormals();
    }
    opening.scale.y=Math.max(.001,value*.36);opening.visible=value>.02;
  }
  open(0);
  return {group,strip,open};
}

import * as THREE from './vendor/three.module.js';
import {makePouch} from './pouch-model.js';
import {pouchPose} from './tour-math.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const textureLoader=new THREE.TextureLoader();
const scenes=[];
let alive=true,raf=0,last=0;
const textures=[];
const load=async path=>{const t=await textureLoader.loadAsync(path);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.push(t);return t;};
function environment() {
  const w=128,h=64,data=new Uint8Array(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++) {
    const light=Math.pow(Math.max(0,Math.cos((x/w-.2)*Math.PI*2)),18)*180+Math.pow(Math.max(0,Math.cos((x/w-.7)*Math.PI*2)),24)*150;
    const i=(y*w+x)*4;data[i]=Math.min(255,80+light);data[i+1]=Math.min(255,62+light);data[i+2]=Math.min(255,130+light);data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,w,h);t.mapping=THREE.EquirectangularReflectionMapping;t.needsUpdate=true;textures.push(t);return t;
}
function create(host,alpha=true) {
  const renderer=new THREE.WebGLRenderer({alpha,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.65));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;
  renderer.setClearColor(0,0);host.append(renderer.domElement);
  const scene=new THREE.Scene();scene.environment=environment();
  scene.add(new THREE.HemisphereLight(0xffffff,0xb99cff,3));
  const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,5);scene.add(key);
  const rim=new THREE.DirectionalLight(0xffb3f5,2);rim.position.set(4,1,3);scene.add(rim);
  const camera=new THREE.PerspectiveCamera(35,1,.01,100);
  camera.position.z=7;
  const view={host,renderer,scene,camera,visible:false,animated:false,dirty:true,lost:false,update(){},resize(){
    const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
    renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.25:1.65));
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }};
  view.resize();
  const observer=new IntersectionObserver(entries=>{view.visible=!view.lost&&entries[0].isIntersecting;if(view.visible)wake();},{rootMargin:'100px'});
  observer.observe(host);view.observer=observer;scenes.push(view);
  view.fail=()=>{
    view.lost=true;view.visible=false;host.classList.remove('webgl-ready');host.style.opacity='0';
    if(host.id==='pouch-canvas'){
      document.body.classList.remove('pouch-webgl');window.gummy3DReady=false;
      window.dispatchEvent(new Event('gummy:webgl-unavailable'));
    }
    if(host.id==='pipeline-canvas')document.querySelector('.pipeline').classList.remove('has-live-pipes');
  };
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();view.fail();});
  return view;
}
function wake(){scenes.forEach(v=>{v.dirty=true;});if(alive&&!raf&&!document.hidden)raf=requestAnimationFrame(frame);}
function frame(now) {
  raf=0;if(!alive||document.hidden)return;
  const delta=Math.min(.05,(now-last)/1000||.016);last=now;
  for(const v of scenes)if(!v.lost&&v.visible&&(v.dirty||v.animated)){
    try{v.update(now*.001,delta);v.renderer.render(v.scene,v.camera);v.dirty=false;}
    catch(error){v.fail();console.info('Using image scene fallback',error.message);}
  }
  if(!reduced.matches&&scenes.some(v=>v.visible&&v.animated))raf=requestAnimationFrame(frame);
}
async function heroScene() {
  const host=document.querySelector('#pouch-canvas');
  const view=create(host), texture=await load('/assets/watermelon.png');
  const model=makePouch(texture);view.scene.add(model.group);
  let progress=window.gummyPouchProgress||0,delivered=!!window.gummyPouchReady,pointer={x:0,y:0};
  const resizeCanvas=view.resize;
  const fit=()=>{
    resizeCanvas();const pixels=Math.min(560,host.clientHeight*.72,host.clientWidth*.82/360*560);
    const worldHeight=3.24*host.clientHeight/pixels;
    view.camera.position.z=worldHeight/(2*Math.tan(THREE.MathUtils.degToRad(35/2)));
  };view.resize=fit;fit();
  window.addEventListener('gummy:pouch-ready',()=>{delivered=true;wake();});
  window.addEventListener('gummy:pouch-progress',e=>{progress=e.detail;wake();});
  document.querySelector('.hero').addEventListener('pointermove',e=>{pointer.x=(e.clientX/innerWidth-.5)*.12;pointer.y=(e.clientY/innerHeight-.5)*.05;wake();});
  view.update=()=>{
    const p=delivered?progress:0,pose=pouchPose(p),active=delivered&&p>.001&&!reduced.matches;
    host.style.opacity=active?String(pose.fade):'0';
    document.body.classList.toggle('pouch-webgl',active);
    model.open(pose.open);model.strip.position.set(pose.tear*2.3,pose.tear*.8,pose.tear*.9);
    model.strip.rotation.z=-pose.tear*.7;model.strip.visible=pose.tear<.98;
    model.group.rotation.set(pose.rotationX,pointer.x*(1-pose.turn),pose.rotationZ);
    model.group.scale.setScalar(pose.scale);
    // Keep the opening in the camera center as the camera enters the pouch.
    model.group.position.y=-1.18*Math.cos(pose.rotationX)*pose.zoom*pose.scale;
    model.group.position.z=-1.18*Math.sin(pose.rotationX)*pose.zoom*pose.scale;
    model.group.rotation.y+=pointer.y*(1-pose.zoom);
  };
  host.classList.add('webgl-ready');window.gummy3DReady=true;window.dispatchEvent(new Event('gummy:webgl-ready'));wake();
}

async function pipelineScene() {
  const host=document.querySelector('#pipeline-canvas'),view=create(host);view.animated=true;
  view.camera.position.set(0,0,10);
  const rig=new THREE.Group();view.scene.add(rig);
  const glass=new THREE.MeshPhysicalMaterial({color:0xfad3ff,roughness:.12,metalness:.05,transparent:true,opacity:.24,clearcoat:1,depthWrite:false,side:THREE.DoubleSide});
  const chrome=new THREE.MeshStandardMaterial({color:0xf8ccfa,roughness:.22,metalness:.75});
  const curves=[];
  for(let i=0;i<3;i++) {
    const y=(i-1)*1.7;
    const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-7,y+.8,-.2),new THREE.Vector3(-3,y+.8,0),new THREE.Vector3(-1.8,y-.4,.7),new THREE.Vector3(1.6,y-.4,.7),new THREE.Vector3(3,y+.8,0),new THREE.Vector3(7,y+.8,-.2)]);
    curves.push(curve);
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(curve,100,.38,12,false),glass));
    for(const t of [.14,.35,.65,.86]) {
      const collar=new THREE.Mesh(new THREE.TorusGeometry(.39,.047,8,32),chrome);
      collar.position.copy(curve.getPointAt(t));collar.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),curve.getTangentAt(t));rig.add(collar);
    }
  }
  const assets=['pink-gummy-new.png','teal-gummy.png','orange-gummy-glow.png','star-gummy.png'];
  const maps=await Promise.all(assets.map(a=>load('/assets/'+a)));
  const candy=[];
  for(let i=0;i<18;i++) {
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:maps[i%4],transparent:true,depthWrite:false}));
    sprite.scale.set(.46,.54,1);rig.add(sprite);candy.push(sprite);
  }
  let scrollProgress=0;
  window.addEventListener('gummy:pipe-progress',e=>{scrollProgress=e.detail;wake();});
  view.update=time=>{
    candy.forEach((c,i)=>{const t=(i/6+(reduced.matches?0:time*.048)+scrollProgress*.3)%1;c.position.copy(curves[i%3].getPointAt(t));c.material.rotation=Math.sin(time+i)*.25;});
    rig.rotation.y=Math.sin(scrollProgress*Math.PI)*.14;rig.rotation.z=.06;
  };
  const resize=view.resize;view.resize=()=>{resize();view.camera.position.z=innerWidth<700?19:10;};view.resize();
  host.classList.add('webgl-ready');document.querySelector('.pipeline').classList.add('has-live-pipes');wake();
}

function shaftScene() {
  const host=document.querySelector('#shaft-canvas'),v=create(host);
  const metal=new THREE.MeshStandardMaterial({color:0xffd7f8,metalness:.8,roughness:.25});
  const light=new THREE.MeshBasicMaterial({color:0xfc8cf6});
  const rig=new THREE.Group();v.scene.add(rig);
  const beams=[];
  for(const side of [-1,1]) {
    const rail=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,34,8),metal);rail.position.set(side*3.7,0,0);rig.add(rail);
    for(let j=0;j<18;j++) {
      const m=new THREE.Mesh(new THREE.BoxGeometry(.15,.035,.07),j%3?metal:light);m.position.set(side*3.7,j-9,0);rig.add(m);beams.push({m,base:j-9});
    }
  }
  const decks=[...document.querySelectorAll('section[data-floor]')].slice(1).map(section=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(1,.035,.1),metal);v.scene.add(m);return {m,section};
  });
  v.camera.position.z=10;
  v.update=()=>{
    const x=Math.tan(THREE.MathUtils.degToRad(17.5))*10*v.camera.aspect*.955;
    rig.children.forEach(m=>{m.position.x=Math.sign(m.position.x)*x;});
    const fullHeight=Math.tan(THREE.MathUtils.degToRad(17.5))*10*2;
    decks.forEach(({m,section})=>{const top=section.getBoundingClientRect().top;m.visible=top>-40&&top<innerHeight+40;m.position.y=(.5-top/innerHeight)*fullHeight;m.scale.x=x*2;m.position.z=.06;});
    const travel=(scrollY/innerHeight)*1.8;
    beams.forEach(({m,base})=>{m.position.y=((base+travel+20)%18)-9;});
  };v.visible=true;wake();
}
async function boot() {
  if(reduced.matches)return;
  try{await heroScene();}catch(e){scenes.find(v=>v.host.id==='pouch-canvas')?.fail();console.info('Using image pouch fallback',e.message);}
  // Pipes are a later floor: allocate their context and textures only nearby.
  const observer=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||reduced.matches)return;
    observer.disconnect();
    pipelineScene().catch(e=>{
      scenes.find(v=>v.host.id==='pipeline-canvas')?.fail();
      console.info('Using pipeline poster fallback',e.message);
    });
  },{rootMargin:'800px'});
  observer.observe(document.querySelector('#pipeline-canvas'));
  try{if(innerWidth>=700)shaftScene();}catch(e){console.info('Using static factory frame',e.message);}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else wake();});
window.addEventListener('resize',()=>{scenes.forEach(v=>v.resize());wake();});
window.addEventListener('scroll',wake,{passive:true});
reduced.addEventListener('change',()=>{if(reduced.matches){document.body.classList.remove('pouch-webgl');for(const v of scenes)if(v.host.id==='pouch-canvas')v.host.style.opacity='0';}else if(!scenes.length)boot();wake();});
window.addEventListener('pagehide',()=>{alive=false;cancelAnimationFrame(raf);});
window.addEventListener('pageshow',e=>{if(e.persisted){alive=true;wake();}});
boot();

import * as THREE from './vendor/three.module.js';
import {makeReferencePipes} from './pipe-model.js';
import {pipeGummies} from './pipe-style.js';
export async function createFactoryView(state){
 const host=document.querySelector('#factory-canvas'),pipe=document.querySelector('.pipe-visual');
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:innerWidth>760,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1:1.25));
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.setClearColor(0,0);host.append(renderer.domElement);
 const scene=new THREE.Scene();
 const textures=[],geometries=new Set(),materials=new Set();
 let frameId=0,lastTime=0,clock=0,lastBurst=0,burstUntil=0,disposed=false,lost=false,pipeLoaded=false,pipeLoading=false;
 // Neutral HDR studio softboxes give real glass bright reflections and dark contrast.
 // Built locally: no large HDR asset or additional animation/render context.
 const w=128,h=64,data=new Float32Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/w,v=y/h,wrap=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
  const softbox=(cx,cy,sx,sy,power)=>power*Math.exp(-Math.pow(wrap(u,cx)/sx,8)-Math.pow((v-cy)/sy,8));
  const light=softbox(.2,.35,.09,.28,4)+softbox(.72,.46,.035,.37,2.5),ceiling=.07+.16*Math.max(0,1-v*1.7),bounce=.10*Math.pow(v,3);
  const i=(y*w+x)*4;data[i]=ceiling+light+bounce;data[i+1]=ceiling+light+bounce*.5;data[i+2]=ceiling+light+bounce*.85;data[i+3]=1;
 }
 const env=new THREE.DataTexture(data,w,h,THREE.RGBAFormat,THREE.FloatType);env.mapping=THREE.EquirectangularReflectionMapping;env.needsUpdate=true;textures.push(env);scene.environment=env;
 scene.add(new THREE.HemisphereLight(0xffffff,0xb5a0ae,1.8));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(-3,4,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xffb3f5,1.6);rim.position.set(4,1,3);scene.add(rim);
 let pipeModel;
 const pipeCamera=new THREE.OrthographicCamera(-5,5,610/144,-610/144,.05,100);pipeCamera.position.z=10;
 async function buildPipes(){
  if(pipeLoaded||pipeLoading||disposed||lost)return;pipeLoading=true;
  try{
   if(disposed)return;
   const loaded=await Promise.allSettled(['/assets/pipeline-stage.svg',...pipeGummies.map(g=>g.asset)].map(path=>new THREE.TextureLoader().loadAsync(path)));
   const maps=loaded.filter(result=>result.status==='fulfilled').map(result=>result.value);
   if(disposed||lost||loaded.some(result=>result.status==='rejected')){maps.forEach(map=>map.dispose());if(!disposed&&!lost)throw new Error('Glass scene assets unavailable');return;}
   const [stageMap,...gummyMaps]=maps;maps.forEach(map=>{map.colorSpace=THREE.SRGBColorSpace;});textures.push(...maps);
   pipeModel=makeReferencePipes({stageMap,gummyMaps});textures.push(...pipeModel.textures);scene.add(pipeModel.rig);pipeModel.rig.visible=false;
   pipeLoaded=true;request();
  }catch{state.webglUnavailable=true;document.querySelector('#pipe-status').textContent='The factory line is shown as an illustration.';}
  finally{pipeLoading=false;}
 }
 const observer=new IntersectionObserver(entries=>{state.pipeVisible=entries[0].isIntersecting;if(state.pipeVisible)buildPipes();request();},{rootMargin:'0px'});
 observer.observe(pipe);
 const preloadObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){buildPipes();preloadObserver.disconnect();}},{rootMargin:'300px'});preloadObserver.observe(pipe);
 function resize(){
  if(disposed)return;
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1:1.25));renderer.setSize(innerWidth,innerHeight,false);
  request();
 }
 function request(){if(!frameId&&!disposed&&!lost&&!document.hidden)frameId=requestAnimationFrame(frame);}
 function frame(now){
  frameId=0;if(disposed||lost||document.hidden)return;
  const delta=Math.min(.05,(now-lastTime)/1000||.016);lastTime=now;
  const pipeRect=pipe.getBoundingClientRect();
  const drawPipe=!state.reduced&&pipeLoaded&&pipeRect.top<innerHeight&&pipeRect.bottom>0;
  if(pipeModel)pipeModel.rig.visible=drawPipe;
  document.body.classList.toggle('show-webgl',drawPipe);
  document.body.classList.toggle('live-pipeline',drawPipe);
  let viewport=null;
  if(drawPipe){
   viewport=pipeRect;
   const halfHeight=5*pipeRect.height/pipeRect.width;
   pipeCamera.left=-5;pipeCamera.right=5;pipeCamera.top=halfHeight;pipeCamera.bottom=-halfHeight;pipeCamera.updateProjectionMatrix();
   if(state.burst!==lastBurst){lastBurst=state.burst;burstUntil=now+1500;}
   if(!state.pipePaused)clock+=delta*(now<burstUntil?3:1);
   pipeModel.update(clock);
   host.style.opacity=pipe.style.opacity||'1';
  }else host.style.opacity='0';
  if(drawPipe){try{
   renderer.setScissorTest(false);renderer.setViewport(0,0,innerWidth,innerHeight);renderer.clear();
   if(viewport){
    renderer.setViewport(viewport.left,innerHeight-viewport.bottom,viewport.width,viewport.height);
    const x=Math.max(0,viewport.left),y=Math.max(0,innerHeight-viewport.bottom);
    renderer.setScissor(x,y,Math.max(1,Math.min(innerWidth,viewport.left+viewport.width)-x),Math.max(1,Math.min(innerHeight,innerHeight-viewport.top)-y));renderer.setScissorTest(true);
   }
   renderer.render(scene,pipeCamera);
  }catch{fail();return;}}
  if(drawPipe&&!state.pipePaused&&!state.reduced)request();
 }
 function fail(){lost=true;state.webglUnavailable=true;suspend();document.body.classList.remove('show-webgl','live-pipeline');host.style.opacity='0';document.querySelector('#pipe-status').textContent='The factory line is shown as an illustration.';}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fail();});
 function suspend(){cancelAnimationFrame(frameId);frameId=0;lastTime=0;}
 function dispose(){
  if(disposed)return;disposed=true;suspend();observer.disconnect();preloadObserver.disconnect();
  scene.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)(Array.isArray(n.material)?n.material:[n.material]).forEach(m=>materials.add(m));});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();
 }
 window.addEventListener('pagehide',e=>{if(!e.persisted)dispose();});resize();
 return {request,resize,suspend,dispose};
}

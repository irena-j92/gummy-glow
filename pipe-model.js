import * as THREE from './vendor/three.module.js';
import {pipeFluidColors,pipeGummies,pipeDimensions,softenGummyImage} from './pipe-style.js';
import {pipeLayout,upperPipePaths,lowerPipePaths,bypassPipePaths} from './pipe-layout.js';

// Three lower ports feed the Watermelon, Blueberry and Pumpkin stick chambers.
export function makeReferencePipes({stageMap=null,gummyMaps=[]}={}){
 const rig=new THREE.Group(),curves=[],candy=[],outlets=[];
 rig.name='three-port-factory-pipeline';
 const unit=pipeLayout.width/10;
 const point=(x,y,z=0)=>new THREE.Vector3(x/unit-5,(pipeLayout.height/2-y)/unit,z);
 function path(segments,z=0){const curve=new THREE.CurvePath();for(const s of segments)curve.add(s.length===4?new THREE.LineCurve3(point(s[0],s[1],z),point(s[2],s[3],z)):new THREE.CubicBezierCurve3(...[0,2,4,6].map(i=>point(s[i],s[i+1],z))));return curve;}
 // Rebuilt from the Simple Glass.max reference: dielectric transmission, not faded plastic.
 // Parameters are a web approximation, not decoded legacy Max/Raytrace values.
 const glass=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.045,metalness:0,transmission:.96,thickness:.12,ior:1.52,attenuationColor:0xffffff,attenuationDistance:3,transparent:true,opacity:1,clearcoat:0,depthWrite:false,side:THREE.FrontSide,envMapIntensity:1.55});
 glass.name='reference-clear-glass';
 const insideGlass=glass.clone();insideGlass.transmission=0;insideGlass.thickness=0;insideGlass.opacity=.045;insideGlass.side=THREE.BackSide;insideGlass.name='inner-glass-wall';
 // Transparent contents are rendered after Three's transmission pass. A light front
 // reflection layer keeps those soft candy/liquid layers visually enclosed by glass.
 const frontReflection=new THREE.MeshPhysicalMaterial({color:0x08080c,roughness:.045,metalness:0,ior:1.52,transparent:true,opacity:.14,depthWrite:false,side:THREE.FrontSide,envMapIntensity:2});
 frontReflection.name='glass-front-reflections';
 // The transmission pass needs a real scene backdrop, rather than the DOM background.
 if(stageMap){const backing=new THREE.Mesh(new THREE.PlaneGeometry(10,pipeLayout.height/unit),new THREE.MeshBasicMaterial({map:stageMap,toneMapped:false}));backing.name='glass-refraction-backdrop';backing.position.z=-.65;rig.add(backing);}

 function tube(curve,material,radius,name,order=3,radialSegments=24){const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(240,curve.renderSegments||curve.curves?.length*12||240),radius,radialSegments,false),material);mesh.name=name;mesh.renderOrder=order;rig.add(mesh);return mesh;}
 // Two slim edge curves draw a solid silhouette without filling the glass interior.
 const outline=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false,toneMapped:false});
 class SilhouetteCurve extends THREE.Curve{
  constructor(base,sign){super();this.base=base;this.sign=sign;this.renderSegments=Math.max(400,base.curves?.length*24||400);}
  getPoint(t,target=new THREE.Vector3()){
   const tangent=this.base.getTangentAt(t),normal=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
   return this.base.getPointAt(t,target).addScaledVector(normal,pipeDimensions.outer*this.sign).add(new THREE.Vector3(0,0,.004));
  }
 }
 function clearTube(curve,name){
  const outer=tube(curve,glass,pipeDimensions.outer,name),inner=tube(curve,insideGlass,pipeDimensions.inner,name+'-inner',2);
  tube(curve,frontReflection,pipeDimensions.outer-.0001,name+'-front-reflections',3);
  for(const sign of [-1,1])tube(new SilhouetteCurve(curve,sign),outline,.0075,'pipe-silhouette-stroke',4,4);
  return {outer,inner};
 }
 upperPipePaths.forEach(segments=>{const curve=path(segments);curves.push(curve);clearTube(curve,'clear-gummy-pipe');});
 bypassPipePaths.forEach(segments=>{const curve=path(segments,-.20);curves.push(curve);clearTube(curve,'clear-recirculation-loop');});
 const time={value:0},fluidColors=pipeFluidColors;
 const liquidMaterials=fluidColors.map((color,i)=>new THREE.ShaderMaterial({uniforms:{flowTime:time,fluidColor:{value:new THREE.Color(color)},phase:{value:i*1.7}},transparent:true,depthWrite:false,toneMapped:false,
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float flowTime;uniform vec3 fluidColor;uniform float phase;varying vec2 vUv;
   void main(){float wave=.5+.5*sin(vUv.x*18.-flowTime*2.2+phase);vec3 color=fluidColor*(.84+.16*wave);gl_FragColor=vec4(color,.95);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }`
 }));
 lowerPipePaths.forEach((segments,i)=>{
  const curve=path(segments),shells=clearTube(curve,'fluid-only-pipe');
  const liquid=tube(curve,liquidMaterials[i],pipeDimensions.liquid,'visible-liquid-flow',1);
  shells.outer.userData.outletIndex=i;shells.outer.userData.normalizedX=pipeLayout.outletFractions[i];liquid.userData.outletIndex=i;
  outlets.push({curve,shell:shells.outer,liquid,normalizedX:pipeLayout.outletFractions[i]});
 });
 // Use the real supplied gummy photographs, not generic colored blob textures.
 for(let i=0;i<36;i++){
  const type=i%pipeGummies.length,photo=pipeGummies[type],sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:gummyMaps[type]||null,color:0xffffff,transparent:true,depthWrite:false,toneMapped:false}));
  softenGummyImage(sprite.material);sprite.name='upper-pipe-blurred-gummy';sprite.userData.gummyType=type;
  sprite.scale.set(.4,.4*photo.height/photo.width,1);sprite.material.rotation=(i%4-1.5)*.25;sprite.renderOrder=1;rig.add(sprite);candy.push(sprite);
 }
 function update(clock){time.value=clock;const perCurve=Math.ceil(candy.length/curves.length);candy.forEach((sprite,i)=>{const curve=curves[i%curves.length],t=(Math.floor(i/curves.length)/perCurve+clock*.025)%1;sprite.position.copy(curve.getPointAt(t));const imageY=pipeLayout.height/2-sprite.position.y*unit;sprite.visible=imageY>=pipeLayout.inletY&&imageY<pipeLayout.splitY-54;sprite.material.opacity=.98*Math.max(0,Math.min(1,(pipeLayout.splitY-54-imageY)/24));});}
 update(0);
 return {rig,curves,candy,outlets,feeds:[],fittings:[],liquid:outlets[0].liquid,shell:outlets[0].shell,textures:[],update};
}

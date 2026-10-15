// Shared visual inputs for the WebGL scene and its static/reduced-motion fallback.
// Reduce the diameter by 10 CSS px at the 1400 px desktop scene width.
// All layers scale together; narrower viewports preserve the same proportions.
const radiusReduction=10/(2*140);
export const pipeDimensions=Object.freeze({outer:.36-radiusReduction,inner:.32-radiusReduction,liquid:.302-radiusReduction});
export const pipeFluidColors=Object.freeze([0xf43cdb,0x348fe7,0xff8f26]);
export const pipeGummies=Object.freeze([
 {asset:'/assets/pipe-gummies/pink.png',width:192,height:191},
 {asset:'/assets/pipe-gummies/star.png',width:185,height:192},
 {asset:'/assets/pipe-gummies/orange.png',width:192,height:175}
]);

export function softenGummyImage(material){
 material.customProgramCacheKey=()=> 'soft-photo-gummy-v1';
 material.onBeforeCompile=shader=>{
  // Small normalized-UV kernel preserves the star/triangle/swirl silhouettes.
  // Premultiplied accumulation avoids dark halos at transparent image edges.
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
   vec2 offsets[9];
   offsets[0]=vec2(0.0);offsets[1]=vec2(.055,0.0);offsets[2]=vec2(-.055,0.0);offsets[3]=vec2(0.0,.055);offsets[4]=vec2(0.0,-.055);
   offsets[5]=vec2(.04,.04);offsets[6]=vec2(-.04,.04);offsets[7]=vec2(.04,-.04);offsets[8]=vec2(-.04,-.04);
   vec4 softColor=vec4(0.0);
   for(int sampleIndex=0;sampleIndex<9;sampleIndex++){
    vec4 texel=texture2D(map,vMapUv+offsets[sampleIndex]);float weight=sampleIndex==0?.24:(sampleIndex<5?.12:.07);
    softColor+=vec4(texel.rgb*texel.a,texel.a)*weight;
   }
   diffuseColor*=vec4(softColor.rgb/max(softColor.a,.0001),softColor.a);
  #endif`);
 };
 return material;
}

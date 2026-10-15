export const clamp = (v, a=0, b=1) => Math.min(b, Math.max(a, v));
export const smooth = (a,b,v) => { const t=clamp((v-a)/(b-a)); return t*t*(3-2*t); };
export function pouchPose(progress) {
  const p=clamp(progress), tear=smooth(.04,.30,p), open=smooth(.20,.50,p), turn=smooth(.40,.70,p), zoom=smooth(.66,1,p);
  return {tear,open,turn,zoom,rotationX:turn*1.32,rotationZ:-(1-turn)*Math.PI/15,scale:1+zoom*13,fade:1-smooth(.84,.98,p)};
}
export function pouchPoint(u,v,side=1,open=0) {
  const x=(u*2-1)*(1-.035*Math.sin(v*Math.PI));
  const y=-1.62+v*2.82;
  const edge=Math.pow(Math.max(0,1-(u*2-1)**2),.65);
  const volume=.035+.22*Math.sin(v*Math.PI)*edge;
  const mouth=open*.36*Math.pow(v,7)*edge;
  const crease=.012*Math.sin(v*58+u*12)*Math.sin(u*Math.PI);
  return [x,y,side*(volume+mouth+crease)];
}
export function floorAt(stops, scroll, viewport) {
  let found=0;
  for(let i=0;i<stops.length;i++) if(stops[i]<=scroll+viewport*.38) found=i;
  return found;
}

// Hold the blueprint, scan down, then allow the completed pouch to float.
export function creationReveal(progress){return -.06+1.12*clamp((progress-.14)/.42);}

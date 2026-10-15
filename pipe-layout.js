// Shared pipe routes: six broad elbows per run, including the blue gummy pipe.
// Keep the minimum bend radius wider than the tube's 51.89 px radius.
export const pipeLayout=Object.freeze({width:1600,height:1000,splitY:790,inletY:-80,feedXs:[280,800,1320],bendRadius:72,outletFractions:[247/1442,733/1442,1219/1442]});
export const outletXs=pipeLayout.outletFractions.map(f=>f*pipeLayout.width);
export function roundRoute(points,radius=pipeLayout.bendRadius){
 const clean=points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.001),segments=[];let at=clean[0];
 for(let i=1;i<clean.length-1;i++){
  const p=clean[i],prev=clean[i-1],next=clean[i+1],a=Math.hypot(p[0]-prev[0],p[1]-prev[1]),b=Math.hypot(next[0]-p[0],next[1]-p[1]),r=Math.min(radius,a*.45,b*.45);
  const u=[(p[0]-prev[0])/a,(p[1]-prev[1])/a],v=[(next[0]-p[0])/b,(next[1]-p[1])/b],entry=[p[0]-u[0]*r,p[1]-u[1]*r],exit=[p[0]+v[0]*r,p[1]+v[1]*r],k=.5522847498;
  if(Math.hypot(entry[0]-at[0],entry[1]-at[1])>.001)segments.push([...at,...entry]);
  segments.push([...entry,entry[0]+u[0]*r*k,entry[1]+u[1]*r*k,exit[0]-v[0]*r*k,exit[1]-v[1]*r*k,...exit]);at=exit;
 }
 const end=clean.at(-1);if(Math.hypot(end[0]-at[0],end[1]-at[1])>.001)segments.push([...at,...end]);return segments;
}
export const upperPipePaths=[
 roundRoute([[pipeLayout.feedXs[0],pipeLayout.inletY],[pipeLayout.feedXs[0],260],[110,260],[110,450],[440,450],[440,640],[outletXs[0],640],[outletXs[0],pipeLayout.splitY]]),
 roundRoute([[pipeLayout.feedXs[1],pipeLayout.inletY],[pipeLayout.feedXs[1],280],[980,280],[980,470],[620,470],[620,650],[outletXs[1],650],[outletXs[1],pipeLayout.splitY]]),
 roundRoute([[pipeLayout.feedXs[2],pipeLayout.inletY],[pipeLayout.feedXs[2],260],[1510,260],[1510,450],[1160,450],[1160,640],[outletXs[2],640],[outletXs[2],pipeLayout.splitY]])
];
export const bypassPipePaths=[];
export const lowerPipePaths=outletXs.map(x=>roundRoute([[x,pipeLayout.splitY],[x,1040]]));

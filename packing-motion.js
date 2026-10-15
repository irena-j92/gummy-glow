// Overhead packing: an empty tray stops, then pouches fall toward the camera plane.
export function makePackingMotion({gs,ST,stage,bin,pouches,status,reduced=false}){
 let entered=false,visible=false;
 const showPacked=()=>{
  gs?.set(bin,{xPercent:0,autoAlpha:1});
  pouches.forEach((p,i)=>{
   if(gs)gs.set(p,{xPercent:-50,yPercent:-50,y:0,scale:1,rotation:Number(p.dataset.angle),filter:'blur(0px)',autoAlpha:1,zIndex:i+1});
   else Object.assign(p.style,{opacity:'1',visibility:'visible',filter:'none',zIndex:String(i+1),transform:'translate(-50%,-50%) rotate('+Number(p.dataset.angle)+'deg)'});
  });
  status.textContent='Packed with all four flavors.';
 };
 if(reduced||!gs||!ST){showPacked();return {replay(){},pause(){},resume(){},dispose(){},timeline:null};}
 status.textContent='Bringing in the tray…';
 const timeline=gs.timeline({paused:true}),start=1.25,step=.19,drop=1.25,settle=.28;
 timeline.fromTo(bin,{xPercent:175,autoAlpha:0},{xPercent:0,autoAlpha:1,duration:1.25,ease:'power2.out'},0)
  .call(()=>{status.textContent='Tray in position.';},[],1.25)
  .call(()=>{status.textContent='Filling with a little glow…';},[],start);
 pouches.forEach((p,i)=>{
  const at=start+i*step,angle=Number(p.dataset.angle);
  timeline.fromTo(p,{xPercent:-50,yPercent:-50,y:()=>-Math.max(60,stage.clientHeight*.24),scale:3.2,rotation:angle-18,filter:'blur(6px)',autoAlpha:0,zIndex:30+i},{y:0,scale:1,rotation:angle,filter:'blur(0px)',duration:drop,ease:'power2.in'},at)
   .to(p,{autoAlpha:1,duration:.14,ease:'power2.out'},at)
   .set(p,{zIndex:i+1},at+drop)
   .to(p,{scale:1.035,duration:.1,ease:'power2.out'},at+drop)
   .to(p,{scale:1,duration:.18,ease:'power2.inOut'},at+drop+.1);
 });
 timeline.call(()=>{status.textContent='Packed with all four flavors.';},[],start+(pouches.length-1)*step+drop+settle);
 const enter=()=>{visible=true;entered=true;timeline.play();},leave=()=>{visible=false;timeline.pause();};
 const trigger=ST.create({trigger:stage,start:'top 35%',end:'bottom top',onEnter:enter,onEnterBack:enter,onLeave:leave,onLeaveBack:leave});
 return {timeline,replay(){entered=true;status.textContent='Bringing in the tray…';timeline.invalidate().restart();},pause(){timeline.pause();},resume(){if(visible&&entered)timeline.play();},resize(){const progress=timeline.progress();timeline.invalidate().progress(progress);},dispose(){trigger.kill();timeline.kill();}};
}

// One scroll-controlled scene, using the supplied four-frame motion reference.
export function makeDescriptionMotion({gs,ST,section,stage,copy,gummies,reduced=false}){
 const active=!!gs&&!!ST&&!reduced;
 section.classList.toggle('description-motion',active);
 if(!active)return {timeline:null,dispose(){section.classList.remove('description-motion');}};
 const timeline=gs.timeline({paused:true});
 gs.set(stage,{opacity:1});
 gs.set(copy,{x:0,y:0,scale:1,rotationX:0,rotationY:0,skewX:0,opacity:1,transformOrigin:'50% 50%',transformPerspective:1200,force3D:true});
 timeline.to(copy,{scale:1.7,rotationX:32,rotationY:0,skewX:0,y:()=>-stage.clientHeight*.28,opacity:.55,duration:.5,ease:'power2.inOut'},.18)
  .to(copy,{scale:2.12,rotationX:44,rotationY:0,y:()=>-stage.clientHeight*.93,opacity:0,duration:.28,ease:'power2.in'},.68);
 gummies.forEach((gummy,i)=>{
  const depth=Number(gummy.dataset.depth),turn=Number(gummy.dataset.turn);
  gs.set(gummy,{x:0,y:0,scale:1,rotation:0,opacity:1,force3D:true});
  timeline.to(gummy,{y:()=>-stage.clientHeight*(.24+depth*.17),x:()=>stage.clientWidth*(i%2?-.025:.025),scale:1+depth*.08,rotation:turn,duration:.52,ease:'power2.inOut'},.14)
   .to(gummy,{y:()=>-stage.clientHeight*(1.2+depth*.14),scale:1+depth*.14,rotation:turn*1.6,opacity:0,duration:.32,ease:'power2.in'},.66);
 });
 // One extra screen-length of native scroll keeps the cleared stage navy.
 // 0.59 / 1.77 × 300svh = 100svh; the earlier motion keeps its scroll speed.
 timeline.to({hold:0},{hold:1,duration:.59,ease:'none'},.98);
 timeline.to(stage,{opacity:0,duration:.20,ease:'power1.inOut'},1.57);
 const trigger=ST.create({trigger:section,animation:timeline,start:'top top',end:'bottom bottom',scrub:.55,invalidateOnRefresh:true});
 return {timeline,dispose(){trigger.kill();timeline.kill();gs.set(stage,{clearProps:'opacity'});section.classList.remove('description-motion');}};
}

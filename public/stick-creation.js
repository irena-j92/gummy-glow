// A scroll-linked scan grows each supplied stick upward; its wand orbits the scan edge.
export function makeStickCreation({gs,ST,stage,windows,reduced=false}){
 if(!stage||!windows.length)return null;
 const reveal=p=>{
  windows.forEach((window,i)=>{
   const amount=Math.max(0,Math.min(1,(p-i*.08)/.76));
   window.querySelector('.stick-product').style.clipPath=`inset(${(1-amount)*100}% 0% 0% 0%)`;
   const wand=window.querySelector('.creation-spark');
   wand.style.top=`${(1-amount)*100}%`;
   wand.style.left=`${50+Math.sin(amount*Math.PI*8+i*.9)*43}%`;
   wand.style.opacity=amount>0&&amount<1?'1':'0';
   wand.style.transform=`scale(${.75+Math.cos(amount*Math.PI*8)*.25})`;
  });
 };
 if(reduced||!gs||!ST){reveal(1);return {dispose(){},timeline:null};}
 const scan={progress:0};
 const timeline=gs.fromTo(scan,{progress:0},{progress:1,ease:'none',onUpdate:()=>reveal(scan.progress),scrollTrigger:{trigger:stage,pinnedContainer:'.production-run',start:'top 78%',end:'bottom 48%',scrub:.5,invalidateOnRefresh:true}});
 reveal(0);
 return {timeline,dispose(){timeline.scrollTrigger?.kill();timeline.kill();reveal(1);}};
}

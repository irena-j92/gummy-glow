// Native horizontal scrolling, with keyboard steps and mouse dragging over links.
export function makeHorizontalTrack(track,reduced=()=>false,itemSelector='.chamber'){
 let drag=null,suppressClick=false;
 track.addEventListener('keydown',event=>{
  if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  const max=Math.max(0,track.scrollWidth-track.clientWidth);
  const chambers=track.querySelectorAll(itemSelector),first=chambers[0]?.getBoundingClientRect(),second=chambers[1]?.getBoundingClientRect();
  const step=(second&&first&&second.left-first.left)||first?.width||track.clientWidth/3;
  const next=event.key==='Home'?0:event.key==='End'?max:track.scrollLeft+(event.key==='ArrowRight'?step:-step);
  event.preventDefault();track.scrollTo({left:Math.min(max,Math.max(0,next)),behavior:reduced()?'instant':'smooth'});
 });
 track.addEventListener('pointerdown',event=>{
  if(event.pointerType!=='mouse'||event.button!==0)return;
  drag={id:event.pointerId,x:event.clientX,left:track.scrollLeft,moved:false};suppressClick=false;
 });
 track.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  if(event.buttons===0){finish();return;}
  const delta=drag.x-event.clientX;if(!drag.moved&&Math.abs(delta)<5)return;
  if(!drag.moved){drag.moved=true;track.setPointerCapture?.(event.pointerId);track.classList.add('dragging');}
  event.preventDefault();track.scrollLeft=Math.max(0,Math.min(track.scrollWidth-track.clientWidth,drag.left+delta));
 });
 const finish=()=>{if(drag?.moved)suppressClick=true;drag=null;track.classList.remove('dragging');};
 track.addEventListener('pointerup',finish);track.addEventListener('pointercancel',finish);track.addEventListener('lostpointercapture',finish);
 track.addEventListener('dragstart',event=>event.preventDefault());
 track.addEventListener('click',event=>{if(!suppressClick)return;suppressClick=false;event.preventDefault();event.stopPropagation();},true);
}

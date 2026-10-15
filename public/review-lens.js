// Map the transformed review's original border box into a circular 1.7× reading lens.
export function lensPlacement({rect,width,height,matrix,origin,x,y,size=224,zoom=1.7}){
 const {a,b,c,d,e,f}=matrix,[ox,oy]=origin;
 const corners=[[0,0],[width,0],[width,height],[0,height]].map(([px,py])=>[a*(px-ox)+c*(py-oy)+e+ox,b*(px-ox)+d*(py-oy)+f+oy]);
 const baseX=rect.left-Math.min(...corners.map(p=>p[0])),baseY=rect.top-Math.min(...corners.map(p=>p[1]));
 return {x:size/2-zoom*(x-baseX),y:size/2-zoom*(y-baseY),zoom};
}
export function createReviewLens({track,section,win=window,doc=document}){
 const fine=win.matchMedia('(hover: hover) and (pointer: fine)'),reduced=win.matchMedia('(prefers-reduced-motion: reduce)');
 const lens=doc.createElement('div');lens.className='review-lens';lens.setAttribute('aria-hidden','true');lens.setAttribute('inert','');
 const glass=doc.createElement('div');glass.className='review-lens-glass';const layer=doc.createElement('div');layer.className='review-lens-layer';glass.append(layer);lens.append(glass);section.append(lens);
 let active=null,copy=null,point=null,frame=0,dragging=false,disposed=false;
 const allowed=()=>fine.matches&&!reduced.matches&&!doc.body.classList.contains('less-motion')&&!doc.hidden;
 function hide(){active=null;copy=null;point=null;lens.classList.remove('is-visible');track.classList.remove('lens-active');layer.replaceChildren();if(frame){win.cancelAnimationFrame(frame);frame=0;}}
 function render(){
  frame=0;if(!active||!point||!allowed()||dragging){hide();return;}
  const rect=active.getBoundingClientRect(),style=win.getComputedStyle(active),width=parseFloat(style.width)||active.offsetWidth,height=parseFloat(style.height)||active.offsetHeight;
  if(point.x<rect.left||point.x>rect.right||point.y<rect.top||point.y>rect.bottom){hide();return;}
  const matrix=new win.DOMMatrixReadOnly(style.transform==='none'?undefined:style.transform),origin=style.transformOrigin.split(' ').slice(0,2).map(Number.parseFloat),size=224;
  const placement=lensPlacement({rect,width,height,matrix,origin,x:point.x,y:point.y,size:size-6});
  copy.style.width=width+'px';copy.style.height=height+'px';copy.style.transform=style.transform;copy.style.transformOrigin=style.transformOrigin;copy.style.opacity='1';
  layer.style.transform=`translate3d(${placement.x}px,${placement.y}px,0) scale(${placement.zoom})`;
  const left=Math.max(8,Math.min(win.innerWidth-size-8,point.x-size/2)),top=Math.max(8,Math.min(win.innerHeight-size-8,point.y-size/2));
  lens.style.transform=`translate3d(${left}px,${top}px,0)`;lens.classList.add('is-visible');track.classList.add('lens-active');
 }
 function request(){if(!frame&&!disposed&&active)frame=win.requestAnimationFrame(render);}
 function move(event){
  if(event.pointerType==='touch'||!allowed()||dragging){hide();return;}
  const note=event.target.closest('.review-note');if(!note||!track.contains(note)){hide();return;}
  if(note!==active){active=note;copy=note.cloneNode(true);copy.removeAttribute('aria-label');copy.removeAttribute('id');for(const el of copy.querySelectorAll('[id]'))el.removeAttribute('id');layer.replaceChildren(copy);}
  point={x:event.clientX,y:event.clientY};request();
 }
 function down(){dragging=true;hide();}function up(){dragging=false;}function cancel(){dragging=false;hide();}function visibility(){if(doc.hidden)hide();}
 track.addEventListener('pointermove',move);track.addEventListener('pointerleave',hide);track.addEventListener('pointerdown',down);track.addEventListener('lostpointercapture',up);win.addEventListener('pointerup',up);win.addEventListener('pointercancel',up);
 track.addEventListener('scroll',request,{passive:true});win.addEventListener('scroll',request,{passive:true});win.addEventListener('resize',hide);win.addEventListener('blur',cancel);doc.addEventListener('visibilitychange',visibility);fine.addEventListener('change',hide);reduced.addEventListener('change',hide);
 const observer=new win.MutationObserver(()=>{if(!allowed())hide();});observer.observe(doc.body,{attributes:true,attributeFilter:['class']});
 return {hide,dispose(){disposed=true;hide();observer.disconnect();lens.remove();track.removeEventListener('pointermove',move);track.removeEventListener('pointerleave',hide);track.removeEventListener('pointerdown',down);track.removeEventListener('lostpointercapture',up);win.removeEventListener('pointerup',up);win.removeEventListener('pointercancel',up);track.removeEventListener('scroll',request);win.removeEventListener('scroll',request);win.removeEventListener('resize',hide);win.removeEventListener('blur',cancel);doc.removeEventListener('visibilitychange',visibility);fine.removeEventListener('change',hide);reduced.removeEventListener('change',hide);}};
}
if(typeof document!=='undefined'){
 const track=document.querySelector('#review-track'),section=document.querySelector('#reviews');
 if(track&&section)createReviewLens({track,section});
}

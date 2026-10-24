export function createFactoryPass({doc=document,win=window,gs,reduced=()=>false}){
 const opener=doc.querySelector('#current-floor-button'),dialog=doc.querySelector('#factory-pass');if(!opener||!dialog)return null;
 const links=[...dialog.querySelectorAll('.factory-pass-stop')],motion=dialog.querySelector('.factory-pass-motion');let navigating=false,animation,lastFloor;
 opener.setAttribute('aria-haspopup','dialog');opener.setAttribute('aria-controls','factory-pass');
 const sync=()=>{const floor=Number(doc.body.dataset.activeFloor||0);if(floor===lastFloor)return;lastFloor=floor;links.forEach(link=>Number(link.dataset.passFloor)===floor?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current'));opener.setAttribute('aria-label','Open factory pass. Current floor '+floor);};
 const open=event=>{if(typeof dialog.showModal!=='function')return;event.preventDefault();event.stopPropagation();navigating=false;dialog.showModal();doc.body.classList.add('pass-open');motion.textContent=reduced()?'Full motion':'Reduce motion';if(gs&&!reduced()&&event.detail!==0){animation?.kill();animation=gs.fromTo(dialog,{xPercent:16,opacity:0},{xPercent:0,opacity:1,duration:.55,ease:'back.out(1.12)'});}else gs?.set(dialog,{xPercent:0,opacity:1});};
 const close=()=>dialog.close();
 const onLink=event=>{if(event.target.closest('.factory-pass-stop')){navigating=true;dialog.close();}};
 const onClose=()=>{animation?.kill();doc.body.classList.remove('pass-open');if(!navigating)opener.focus({preventScroll:true});};
 const onMotion=()=>{doc.querySelector('#motion-toggle').click();motion.textContent=reduced()?'Full motion':'Reduce motion';};
 opener.addEventListener('click',open);dialog.querySelector('.factory-pass-close').addEventListener('click',close);dialog.addEventListener('click',onLink);dialog.addEventListener('close',onClose);motion.addEventListener('click',onMotion);
 const observer=new win.MutationObserver(sync);observer.observe(doc.body,{attributes:true,attributeFilter:['data-active-floor']});sync();
 return {dispose(){animation?.kill();observer.disconnect();opener.removeEventListener('click',open);dialog.querySelector('.factory-pass-close').removeEventListener('click',close);dialog.removeEventListener('click',onLink);dialog.removeEventListener('close',onClose);motion.removeEventListener('click',onMotion);}};
}

export function createHatchMotion({gs,ST,stage,panels,reduced=false,viewportHeight=()=>window.innerHeight}){
 if(reduced||!gs||!ST||!stage||!panels.length)return null;
 return gs.context(()=>panels.forEach((panel,i)=>gs.fromTo(panel,{xPercent:0},{xPercent:i?102:-102,ease:'none',scrollTrigger:{trigger:stage,start:'top 65%',end:()=>stage.clientHeight>viewportHeight()?'top top':'center center',scrub:.5,invalidateOnRefresh:true}})),stage);
}

if(typeof document!=='undefined'){
 const media=matchMedia('(prefers-reduced-motion: reduce)'),reduced=()=>media.matches||document.body.classList.contains('less-motion');
 const pass=createFactoryPass({doc:document,win:window,gs:window.gsap,reduced});let hatch,lastReduced;
 const sync=()=>{const minimal=reduced();if(lastReduced===minimal)return;lastReduced=minimal;document.body.classList.toggle('experience-on',!minimal&&!!window.gsap&&!!window.ScrollTrigger);hatch?.revert();hatch=createHatchMotion({gs:window.gsap,ST:window.ScrollTrigger,stage:document.querySelector('.creation-tunnel'),panels:[...document.querySelectorAll('.lab-hatch-panel')],reduced:minimal});window.ScrollTrigger?.sort();window.ScrollTrigger?.refresh();};
 const observer=new MutationObserver(sync);observer.observe(document.body,{attributes:true,attributeFilter:['class']});media.addEventListener('change',sync);sync();
 window.addEventListener('pagehide',event=>{if(!event.persisted){observer.disconnect();media.removeEventListener('change',sync);hatch?.revert();pass?.dispose();}});
}

import {makeHorizontalTrack} from './horizontal-track.js';

export function bindCommunityGallery(root,{reduced=()=>false}={}){
 const track=root.querySelector('.social-scroll'),dialog=root.querySelector('#photo-dialog');
 if(!track||!dialog)return null;
 makeHorizontalTrack(track,reduced,'.photo-hanger');
 const links=[...track.querySelectorAll('.photo-post')],image=dialog.querySelector('.photo-dialog-image'),status=dialog.querySelector('.photo-dialog-status');
 let index=0,opener=null;
 function show(next){index=(next+links.length)%links.length;const link=links[index],photo=link.querySelector('img');image.src=link.getAttribute('href');image.alt=photo.alt;status.textContent=`${index+1} / ${links.length}`;}
 links.forEach((link,i)=>link.addEventListener('click',event=>{
  if(event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||typeof dialog.showModal!=='function')return;
  event.preventDefault();opener=link;show(i);dialog.showModal();root.body.classList.add('photo-viewing');
 }));
 dialog.querySelector('.photo-dialog-close').addEventListener('click',()=>dialog.close());
 dialog.querySelector('.photo-dialog-prev').addEventListener('click',()=>show(index-1));
 dialog.querySelector('.photo-dialog-next').addEventListener('click',()=>show(index+1));
 dialog.addEventListener('keydown',event=>{if(!dialog.open)return;if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();show(index+(event.key==='ArrowRight'?1:-1));}});
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{root.body.classList.remove('photo-viewing');opener?.focus({preventScroll:true});image.removeAttribute('src');});
 return {show};
}
if(typeof document!=='undefined')bindCommunityGallery(document,{reduced:()=>document.body.classList.contains('less-motion')||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches});

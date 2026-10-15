import {products,plans,findProduct,galleryFor,filterProducts} from './catalog.js';
import {quantity,readBag,saveBag,addToBag,updateBag,bagCount} from './bag.js';

export function initShop(document,storage){
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 let bag=readBag(storage),returnFocus=null,persisted=true;
 const dialog=$('#bag-dialog'),lines=$('#bag-lines');
 function renderBag(){
  $$('[data-bag-count]').forEach(n=>n.textContent=String(bagCount(bag)));
  $$('.bag-open').forEach(b=>b.setAttribute('aria-label','Open your bag, '+bagCount(bag)+' items'));
  lines.replaceChildren();
  if(!bag.length){const empty=document.createElement('p');empty.className='bag-empty';empty.textContent='Your next little glow starts here.';const a=document.createElement('a');a.href='/collection/';a.textContent='Explore all products';empty.append(a);lines.append(empty);}
  bag.forEach((line,index)=>{
   const p=findProduct(line.id),article=document.createElement('article');article.className='bag-line';
   const imageLink=document.createElement('a');imageLink.className='bag-image';imageLink.href=p.url;imageLink.style.setProperty('--product-color',p.color);const img=document.createElement('img');img.src=p.image;img.alt=p.title;imageLink.append(img);
   const copy=document.createElement('div'),name=document.createElement('h3'),a=document.createElement('a');a.href=p.url;a.textContent=p.title;name.append(a);const plan=document.createElement('p');plan.textContent=plans[line.plan].label+' · '+p.formatLabel;
   const controls=document.createElement('div');controls.className='bag-line-controls';
   function control(action,label,text,disabled=false){const b=document.createElement('button');b.type='button';b.dataset.bagAction=action;b.dataset.line=String(index);b.setAttribute('aria-label',label);b.textContent=text;b.disabled=disabled;controls.append(b);return b;}
   control('dec','Decrease '+p.title+' quantity','−',line.quantity===1);const count=document.createElement('span');count.textContent=String(line.quantity);count.setAttribute('aria-label','Quantity '+line.quantity);controls.append(count);control('inc','Increase '+p.title+' quantity','+',line.quantity===99);control('remove','Remove '+p.title,'Remove').className='bag-remove';copy.append(name,plan,controls);article.append(imageLink,copy);lines.append(article);
  });
  $('#bag-total').textContent=bagCount(bag)+' item'+(bagCount(bag)===1?'':'s')+' in your preview bag';
  $('#bag-storage-status').textContent=persisted?'Saved on this device.':'Kept for this visit. This browser could not save your bag.';
 }
 function persist(){persisted=saveBag(storage,bag);renderBag();}
 function openBag(trigger){returnFocus=trigger||document.activeElement;renderBag();if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');}
 function closeBag(){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');returnFocus?.focus();}
 $$('.bag-open').forEach(b=>b.addEventListener('click',()=>openBag(b)));
 $('#bag-close').addEventListener('click',closeBag);$('#bag-browse').addEventListener('click',closeBag);dialog.addEventListener('close',()=>returnFocus?.focus());
 lines.addEventListener('click',e=>{
  const button=e.target.closest('button[data-bag-action]');if(!button)return;
  const index=Number(button.dataset.line);if(!bag[index])return;
  const action=button.dataset.bagAction;
  if(action==='remove')bag=bag.filter((_,i)=>i!==index);else bag=updateBag(bag,index,bag[index].quantity+(action==='inc'?1:-1));
  persist();$('#shop-announcement').textContent='Your bag now contains '+bagCount(bag)+' items.';
  lines.querySelector(`button[data-line="${Math.min(index,bag.length-1)}"][data-bag-action="${action==='remove'?'remove':action}"]`)?.focus();
 });
 renderBag();
 const product=findProduct(document.body.dataset.product);
 if(product){
  const gallery=galleryFor(product);let imageIndex=0,touchX=null,selectedPlan='quarterly';
  function showImage(index){imageIndex=(index+gallery.length)%gallery.length;const image=gallery[imageIndex];$('#gallery-image').src=image.src;$('#gallery-image').alt=image.alt;$('.gallery-stage').classList.toggle('scene',image.scene);$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.gallery)===imageIndex)));$('#gallery-caption').textContent=image.label+' · '+(imageIndex+1)+' / '+gallery.length;}
  $$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>showImage(Number(b.dataset.gallery))));$('#gallery-prev').addEventListener('click',()=>showImage(imageIndex-1));$('#gallery-next').addEventListener('click',()=>showImage(imageIndex+1));
  $('.gallery-stage').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();showImage(imageIndex+(e.key==='ArrowRight'?1:-1));}});
  $('.gallery-stage').addEventListener('pointercancel',()=>{touchX=null;});
  $('.gallery-stage').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchX=e.clientX;});$('.gallery-stage').addEventListener('pointerup',e=>{if(touchX!==null&&Math.abs(e.clientX-touchX)>40)showImage(imageIndex+(e.clientX<touchX?1:-1));touchX=null;});
  const input=$('#product-quantity');
  function setQuantity(value){input.value=String(quantity(value));$('#quantity-minus').disabled=Number(input.value)===1;$('#quantity-plus').disabled=Number(input.value)===99;}
  input.addEventListener('change',()=>setQuantity(input.value));$('#quantity-plus').addEventListener('click',()=>setQuantity(Number(input.value)+1));$('#quantity-minus').addEventListener('click',()=>setQuantity(Number(input.value)-1));setQuantity(input.value);
  $$('input[name="plan"]').forEach(r=>r.addEventListener('change',()=>{if(!Object.hasOwn(plans,r.value))return;selectedPlan=r.value;$$('input[name="plan"]').forEach(option=>{option.checked=option.value===selectedPlan;option.closest('.plan-option').classList.toggle('selected',option.checked);});}));
  $('#product-form').addEventListener('submit',e=>{e.preventDefault();setQuantity(input.value);bag=addToBag(bag,product.id,selectedPlan,input.value);persist();$('#shop-announcement').textContent=product.title+' is in your preview bag.';openBag($('#add-to-bag'));});
 }
 if($('#catalog-grid')){
  let format='all';const grid=$('#catalog-grid'),cards=new Map($$('[data-catalog-product]').map(c=>[c.dataset.catalogProduct,c]));
  function applyFilters(){const visible=filterProducts({format,search:$('#product-search').value,sort:$('#product-sort').value}),ids=new Set(visible.map(p=>p.id));cards.forEach((c,id)=>c.hidden=!ids.has(id));grid.append(...visible.map(p=>cards.get(p.id)),...products.filter(p=>!ids.has(p.id)).map(p=>cards.get(p.id)));$('#catalog-count').textContent=visible.length+' product'+(visible.length===1?'':'s');$('#catalog-empty').hidden=visible.length>0;$$('[data-format]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.format===format)));}
  $$('[data-format]').forEach(b=>b.addEventListener('click',()=>{format=b.dataset.format;applyFilters();}));$('#product-search').addEventListener('input',applyFilters);$('#product-sort').addEventListener('change',applyFilters);$('#clear-filters').addEventListener('click',()=>{format='all';$('#product-search').value='';$('#product-sort').value='factory';applyFilters();$('#product-search').focus();});applyFilters();
 }
 return {getBag:()=>bag.map(line=>({...line})),openBag,closeBag};
}
if(typeof document!=='undefined'){let storage;try{storage=globalThis.localStorage;}catch{}initShop(document,storage);}

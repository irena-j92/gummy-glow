import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {parseHTML} from 'linkedom';
import {products,plans,filterProducts} from '../public/catalog.js';
import {normalizeBag,quantity,bagCount,addToBag,readBag} from '../public/bag.js';
import {initShop} from '../public/shop.js';
import worker from '../dist/server/index.js';
assert.equal(products.length,7);assert.equal(products.filter(p=>p.format==='stick').length,3);
assert.equal(filterProducts({format:'pouch'}).length,4);assert.equal(filterProducts({format:'stick'}).length,3);assert.equal(filterProducts({search:'WATERMELON'}).length,2);assert.equal(filterProducts({search:'missing'}).length,0);
assert.equal(quantity(-1),1);assert.equal(quantity(1000),99);assert.deepEqual(normalizeBag([{id:'fake',plan:'once',quantity:1},{id:'watermelon',plan:'__proto__',quantity:2}]),[]);
assert.equal(addToBag([{id:'watermelon',plan:'once',quantity:98}],'watermelon','once',5)[0].quantity,99);
const saved=new Map(),storage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)};
function setup(path){
 const {document,window}=parseHTML(readFileSync(path,'utf8'));
 document.querySelectorAll('select').forEach(s=>{let value=s.querySelector('option').value;Object.defineProperty(s,'value',{get:()=>value,set:v=>value=v,configurable:true});});
 const dialog=document.querySelector('#bag-dialog');dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>{dialog.removeAttribute('open');dialog.dispatchEvent(new window.Event('close'));};
 const api=initShop(document,storage);return {document,window,api};
}
function click(view,selector){view.document.querySelector(selector).dispatchEvent(new view.window.Event('click',{bubbles:true}));}
for(const p of products){
 const path='public/products/'+p.slug+'/index.html';assert.ok(existsSync(path));assert.ok(existsSync('public'+p.image));const html=readFileSync(path,'utf8'),{document}=parseHTML(html);
 assert.equal(document.querySelectorAll('h1').length,1);assert.equal(document.querySelectorAll('[data-gallery]').length,4);assert.equal(document.querySelectorAll('input[name=plan]').length,3);assert.equal(document.querySelectorAll('.plan-option.selected').length,1);
 for(const a of document.querySelectorAll('a[href^="/products/"]'))assert.ok(products.some(x=>x.url===a.getAttribute('href')));
 for(const img of document.querySelectorAll('img[src^="/"]'))assert.ok(existsSync('public'+img.getAttribute('src')));
 for(const suffix of ['','no-slash']){
  const response=await worker.fetch(new Request('https://gummy.test'+(suffix?p.url.slice(0,-1):p.url)),{});assert.equal(response.status,200);assert.ok((await response.text()).includes(p.title));
 }
 assert.equal((await worker.fetch(new Request('https://gummy.test'+p.url,{method:'HEAD'}),{})).status,200);
}
let view=setup('public/products/watermelon-trance/index.html'),d=view.document;
click(view,'#gallery-prev');assert.equal(d.querySelector('#gallery-caption').textContent,'Packed · 4 / 4');click(view,'#gallery-next');assert.equal(d.querySelector('#gallery-caption').textContent,'Product · 1 / 4');
const key=new view.window.Event('keydown');key.key='ArrowRight';d.querySelector('.gallery-stage').dispatchEvent(key);assert.equal(d.querySelector('[data-gallery="1"]').getAttribute('aria-pressed'),'true');assert.equal(d.querySelectorAll('[data-gallery][aria-pressed=true]').length,1);
const radio=d.querySelector('input[value="once"]');radio.dispatchEvent(new view.window.Event('change'));assert.equal(d.querySelectorAll('.plan-option.selected').length,1);assert.ok(radio.closest('.plan-option').classList.contains('selected'));
click(view,'#quantity-plus');assert.equal(d.querySelector('#product-quantity').value,'2');d.querySelector('#product-form').dispatchEvent(new view.window.Event('submit',{cancelable:true}));assert.equal(view.api.getBag()[0].plan,'once');assert.equal(view.api.getBag()[0].quantity,2);assert.ok(d.querySelector('#bag-dialog').hasAttribute('open'));
click(view,'#bag-close');assert.ok(!d.querySelector('#bag-dialog').hasAttribute('open'));
view=setup('public/products/blueberry-bomb-sticks/index.html');d=view.document;assert.equal(d.querySelector('[data-bag-count]').textContent,'2');d.querySelector('#product-form').dispatchEvent(new view.window.Event('submit',{cancelable:true}));assert.equal(view.api.getBag().length,2);assert.equal(bagCount(view.api.getBag()),3);
click(view,'button[data-bag-action="inc"][data-line="1"]');assert.equal(bagCount(view.api.getBag()),4);click(view,'button[data-bag-action="remove"][data-line="0"]');assert.equal(view.api.getBag()[0].id,'blueberry-stick');assert.equal(view.api.getBag()[0].quantity,2);
view=setup('public/index.html');d=view.document;assert.equal(d.querySelector('[data-bag-count]').textContent,'2','The new landing navigation restores the catalog bag');click(view,'.bag-open');assert.ok(d.querySelector('#bag-dialog').hasAttribute('open'));assert.equal(d.querySelectorAll('.bag-line').length,1);click(view,'#bag-close');assert.ok(!d.querySelector('#bag-dialog').hasAttribute('open'));
view=setup('public/collection/index.html');d=view.document;click(view,'[data-format="stick"]');assert.equal([...d.querySelectorAll('[data-catalog-product]')].filter(c=>!c.hidden).length,3);assert.equal(d.querySelector('#catalog-count').textContent,'3 products');
d.querySelector('#product-search').value='watermelon';d.querySelector('#product-search').dispatchEvent(new view.window.Event('input'));assert.equal(d.querySelector('#catalog-count').textContent,'1 product');
d.querySelector('#product-search').value='unknown';d.querySelector('#product-search').dispatchEvent(new view.window.Event('input'));assert.equal(d.querySelector('#catalog-empty').hidden,false);click(view,'#clear-filters');assert.equal(d.querySelector('#catalog-count').textContent,'7 products');
d.querySelector('#product-sort').value='name';d.querySelector('#product-sort').dispatchEvent(new view.window.Event('change'));assert.equal(d.querySelector('#catalog-grid').firstElementChild.id,'blueberry');
const unavailable={getItem(){throw Error('unavailable')},setItem(){throw Error('unavailable')}};assert.deepEqual(readBag(unavailable),[]);const failView=parseHTML(readFileSync('public/products/pumpkin-energy/index.html','utf8')),failDoc=failView.document;failDoc.querySelector('#bag-dialog').showModal=()=>{};const fail=initShop(failDoc,unavailable);failDoc.querySelector('#product-form').dispatchEvent(new failView.window.Event('submit',{cancelable:true}));assert.equal(fail.getBag().length,1);assert.ok(failDoc.querySelector('#bag-storage-status').textContent.includes('this visit'));
assert.equal((await worker.fetch(new Request('https://gummy.test/products/not-a-product/'),{})).status,404);
console.log('PASS: seven product routes with GET/HEAD and slash variants, three stick assets, plan selection, gallery wrap/keyboard, quantity, bag merge/persistence/update/remove, unavailable storage, catalog format/search/sort/empty state, and unknown product 404.');

import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFile} from 'node:fs/promises';
import worker from '../dist/server/index.js';
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(await readFile('drizzle/0000_dizzy_joshua_kane.sql','utf8'));
const DB={prepare(sql){return{bind(...args){return{async run(){return sqlite.prepare(sql).run(...args)}}}}}};
const submit=(data,env={DB},headers={})=>worker.fetch(new Request('https://gummy.test/api/subscribe',{method:'POST',headers:{'content-type':'application/json',origin:'https://gummy.test',...headers},body:JSON.stringify(data)}),env);
assert.equal((await submit({email:' TEST@example.com ',consent:true})).status,200);
assert.equal((await submit({email:'test@example.com',consent:true})).status,200);
assert.equal(sqlite.prepare('select count(*) as n from newsletter_subscribers').get().n,1);
assert.equal(sqlite.prepare('select email from newsletter_subscribers').get().email,'test@example.com');
assert.equal((await submit({email:'bad',consent:true})).status,400);
assert.equal((await submit({email:'a@example.com',consent:false})).status,400);
assert.equal((await submit({email:'a@example.com',consent:true},{DB},{origin:'https://other.test'})).status,403);
assert.equal((await submit({email:'a@example.com',consent:true},{})).status,503);
assert.equal((await submit(null)).status,400);
assert.equal((await submit({email:'bot@example.com',consent:true,website:'spam'})).status,200);
assert.equal(sqlite.prepare('select count(*) as n from newsletter_subscribers').get().n,1);
for(const path of ['/','/collection/','/collection']){const r=await worker.fetch(new Request('https://gummy.test'+path),{});assert.equal(r.status,200);assert.match(await r.text(),/GUMMY/);}
assert.equal((await worker.fetch(new Request('https://gummy.test/missing'),{})).status,404);
console.log('Passed: valid sign-up, durable insert, normalized deduplication, consent, email validation, cross-origin rejection, unavailable storage, malformed input, honeypot, page routes, and 404.');

// Exercise the actual footer controller against the Worker, without sending emails.
const {parseHTML}=await import('linkedom');
const {bindNewsletter}=await import('../public/footer.js');
const {document,window}=parseHTML(await readFile('public/index.html','utf8'));
const form=document.querySelector('#footer-signup'),input=form.querySelector('[name="email"]'),button=form.querySelector('[type="submit"]'),status=form.querySelector('[role="status"]');
form.action='https://gummy.test/api/subscribe';form.reportValidity=()=>true;
form.reset=()=>{input.value='';form.querySelector('[name="website"]').value='';};
let calls=0,release,mode='success';
bindNewsletter(form,{fetcher:async(url,options)=>{
 calls++;assert.equal(url,form.action);assert.equal(options.credentials,'same-origin');
 if(mode==='network')throw new TypeError('Failed to fetch');
 if(mode==='wait')await new Promise(resolve=>{release=resolve;});
 return worker.fetch(new Request(url,{...options,headers:{...options.headers,origin:'https://gummy.test'}}),mode==='storage'?{}:{DB});
}});
const flush=async()=>{for(let i=0;i<30;i++)await new Promise(resolve=>setImmediate(resolve));};
const send=()=>form.dispatchEvent(new window.Event('submit',{cancelable:true}));
input.value='footer@example.com';mode='wait';send();send();
assert.equal(calls,1,'Pending submission cannot be duplicated');assert.ok(button.disabled);assert.equal(form.getAttribute('aria-busy'),'true');release();await flush();
assert.match(status.textContent,/You’re on the list/);assert.equal(input.value,'');assert.ok(!button.disabled);assert.ok(!form.hasAttribute('aria-busy'));
assert.equal(sqlite.prepare('select count(*) as n from newsletter_subscribers').get().n,2);
input.value='retry@example.com';mode='storage';send();await flush();assert.match(status.textContent,/couldn’t save/);assert.equal(input.value,'retry@example.com');assert.ok(!button.disabled);
mode='network';send();await flush();assert.match(status.textContent,/couldn’t connect/);assert.equal(input.value,'retry@example.com');
mode='success';send();await flush();assert.match(status.textContent,/You’re on the list/);assert.equal(sqlite.prepare('select count(*) as n from newsletter_subscribers').get().n,3);
console.log('PASS: footer signup → actual Worker, duplicate prevention, success reset, storage/network failure and retry; in-memory database only.');

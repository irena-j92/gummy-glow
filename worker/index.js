// Site assets are served by the platform; only subscription writes reach the API.
import { pages } from './pages.js';
const reply = (data, status=200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}});
async function saveSubscription(db, email) {
 await db.prepare('INSERT INTO newsletter_subscribers (email, consent_version, created_at) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(email,'gummy-news-v1',Date.now()).run();
}
export default {
 async fetch(request, env) {
  const url = new URL(request.url);
  if (url.pathname === '/api/subscribe') {
   if (request.method !== 'POST') return reply({error:'Please submit the sign-up form.'},405);
   const origin=request.headers.get('origin');
   if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return reply({error:'Please subscribe from the Gummy Glow website.'},403);
   if (Number(request.headers.get('content-length') || 0) > 4096) return reply({error:'This request is too large.'},413);
   let data;
   try {
    const raw=await request.text();
    if(raw.length>4096)return reply({error:'This request is too large.'},413);
    data=request.headers.get('content-type')?.includes('application/json')?JSON.parse(raw):Object.fromEntries(new URLSearchParams(raw));
   } catch { return reply({error:'Please enter a valid email address.'},400); }
   if (!data || typeof data !== 'object' || typeof data.email !== 'string') return reply({error:'Please enter a valid email address.'},400);
   if(data.website)return reply({ok:true});
   const email=data.email.trim().toLowerCase();
   if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({error:'Please enter a valid email address.'},400);
   if(data.consent!==true && data.consent!=='on') return reply({error:'Please confirm you’d like to receive our news.'},400);
   try {
    await saveSubscription(env.DB,email);
    return reply({ok:true});
   } catch(error) {
    console.error('Newsletter subscription storage unavailable',error?.name);
    return reply({error:'We couldn’t save your sign-up right now. Please try again shortly.'},503);
   }
  }
  if(request.method!=='GET' && request.method!=='HEAD')return new Response('Method not allowed',{status:405});
  const path=url.pathname === '/collection' ? '/collection/' : url.pathname;
  if(pages[path])return new Response(request.method==='HEAD'?null:pages[path],{headers:{'Content-Type':'text/html; charset=utf-8'}});
  if(env.ASSETS)return env.ASSETS.fetch(request);
  return new Response('Not found',{status:404});
 }
};

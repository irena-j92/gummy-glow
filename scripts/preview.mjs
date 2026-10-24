// Local preview only: serve source assets and the built Worker routes without production bindings.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import worker from '../dist/server/index.js';
const root=resolve('public');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff':'font/woff','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://terminal.local:4173'),file=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  if(extname(file)){
   if(!(await stat(file)).isFile())throw Error('Not a file');
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:await readFile(file));return;
  }
  try{
   const page=await readFile(resolve(file,'index.html'));
   res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:page);return;
  }catch{}
  const request=new Request(url,{method:req.method});
  const response=await worker.fetch(request,{});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(4173,'0.0.0.0');

import {writeFileSync,readFileSync} from 'node:fs';
import {pipeFluidColors,pipeGummies,pipeDimensions} from '../public/pipe-style.js';
import {pipeLayout,upperPipePaths,lowerPipePaths} from '../public/pipe-layout.js';
import {makeReferencePipes} from '../public/pipe-model.js';
const unit=pipeLayout.width/10,outerWidth=pipeDimensions.outer*unit*2,liquidWidth=pipeDimensions.liquid*unit*2;
const fluidHex=pipeFluidColors.map(color=>'#'+color.toString(16).padStart(6,'0'));
const path=segments=>segments.map((s,i)=>(i?'':`M${s[0]} ${s[1]}`)+(s.length===4?`L${s[2]} ${s[3]}`:`C${s.slice(2).join(' ')}`)).join('');
const upper=upperPipePaths.map(path),lower=lowerPipePaths.map(path);
const defs=`<defs>
<filter id="glass-depth" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="${outerWidth*.05}"/></filter>
<filter id="soft-gummy" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.5"/></filter>
<filter id="lift" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="3" dy="5" stdDeviation="5" flood-color="#98687f" flood-opacity=".1"/></filter>
${pipeGummies.map((g,i)=>`<symbol id="pipe-gummy-${i}" viewBox="0 0 ${g.width} ${g.height}"><image width="${g.width}" height="${g.height}" href="data:image/png;base64,${readFileSync('public'+g.asset).toString('base64')}"/></symbol>`).join('')}
<mask id="upper-gummy-mask">${upper.map(d=>`<path d="${d}" fill="none" stroke="white" stroke-width="${pipeDimensions.inner*unit*2}"/>`).join('')}</mask></defs>`;
const model=makeReferencePipes();model.update(2.2);
let scene='<g mask="url(#upper-gummy-mask)">'+model.candy.filter(p=>p.visible).map(p=>{const w=p.scale.x*unit,h=p.scale.y*unit;return `<g transform="translate(${(p.position.x+5)*unit} ${pipeLayout.height/2-p.position.y*unit}) rotate(${p.material.rotation*180/Math.PI})"><use href="#pipe-gummy-${p.userData.gummyType}" x="${-w/2}" y="${-h/2}" width="${w}" height="${h}" filter="url(#soft-gummy)" opacity="${p.material.opacity}"/></g>`;}).join('')+'</g>';
const liquid=(d,i)=>`<path d="${d}" stroke="${fluidHex[i]}" stroke-opacity=".95" stroke-width="${liquidWidth}" fill="none"/>`;
scene+=lower.map(liquid).join('');
// A transparent body and broad soft reflection bands approximate cylindrical glass.
scene+=[...upper,...lower].map(d=>`<path d="${d}" fill="none" stroke="white" stroke-opacity=".06" stroke-width="${outerWidth}"/>`).join('');
const coord=value=>Number(value.toFixed(2));
const sample=curve=>curve.getPoints(600).map((p,i)=>`${i?'L':'M'}${coord((p.x+5)*unit)} ${coord(pipeLayout.height/2-p.y*unit)}`).join('');
for(const edge of model.rig.children.filter(n=>n.name==='pipe-silhouette-stroke')){
 const {base,sign}=edge.geometry.parameters.path;
 const band=Array.from({length:601},(_,i)=>{const t=i/600,p=base.getPointAt(t),v=base.getTangentAt(t),length=Math.hypot(v.x,v.y)||1;p.x-=v.y/length*pipeDimensions.outer*.68*sign;p.y+=v.x/length*pipeDimensions.outer*.68*sign;return `${i?'L':'M'}${coord((p.x+5)*unit)} ${coord(pipeLayout.height/2-p.y*unit)}`;}).join('');
 scene+=`<path d="${band}" fill="none" stroke="${sign<0?'#fff':'#596074'}" stroke-opacity="${sign<0?.4:.18}" stroke-width="${outerWidth*.28}" filter="url(#glass-depth)"/>`;
}
scene+=model.rig.children.filter(n=>n.name==='pipe-silhouette-stroke').map(n=>`<path d="${sample(n.geometry.parameters.path)}" fill="none" stroke="white" stroke-opacity=".8" stroke-width="2.4"/>`).join('');
// Only the refraction pass samples this uniform plate; the visible SVG is transparent.
writeFileSync('public/assets/pipeline-stage.svg','<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#fc8cf6"/></svg>\n');
writeFileSync('public/assets/pipeline-three-port.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">${defs}${scene}</svg>\n`);
console.log('Generated reflective ring-free glass pipes, clear spaced inlets and vivid lower liquid.');

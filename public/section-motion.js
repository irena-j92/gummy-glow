export const sectionReveals=[
 {trigger:'#blueprint',start:'top 30%',selectors:['.creation-intro .eyebrow','.creation-intro h2','.creation-intro p']},
 {trigger:'.benefits-floor',selectors:['.benefit-fact']},
 {trigger:'#comparison',selectors:['.comparison-heading span','.comparison-board']},
 {trigger:'#classics',pinnedContainer:'.production-run',selectors:['#classics h2','#classics .classics-display']},
 {trigger:'#newbies-title',pinnedContainer:'.production-run',selectors:['#newbies h2','.lab-monitor','.newbies-cta']},
 {trigger:'#reviews',selectors:['.reviews-heading h2','.review-rating','.review-note']},
 {trigger:'#community',selectors:['#community h2','.photo-hanger']},
 {trigger:'#glow-delivery',selectors:['.delivery-copy','.delivery-image']},
 {trigger:'#dispatch',selectors:['.footer-top','.footer-logo','.footer-bottom']}
];
export function makeSectionMotion({gs,resolve,reduced=false}){
 if(reduced||!gs)return;
 for(const group of sectionReveals){
  const targets=group.selectors.flatMap(resolve);
  if(!targets.length)continue;
  gs.fromTo(targets,{y:48,scale:1,opacity:0},{y:0,scale:1,opacity:1,duration:.65,ease:'back.out(1.12)',stagger:.08,scrollTrigger:{trigger:group.trigger,pinnedContainer:group.pinnedContainer,start:group.start||'top 83%',toggleActions:'play none none reverse',invalidateOnRefresh:true}});
 }
}

// A small rotation about the centered horizontal axis gives headlines one consistent plane.
export function makeHeadlineMotion({gs,resolve,reduced=false}){
 if(reduced||!gs)return;
 for(const title of resolve('.headline-tilt')){
  gs.fromTo(title,{rotationX:-9,transformPerspective:1000,transformOrigin:'50% 50%'},{rotationX:9,ease:'none',scrollTrigger:{trigger:title,pinnedContainer:title.closest?.('.production-run')||undefined,start:'top bottom',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
 }
}

// The whole chamber arrives as one elevator car; the existing scan starts at its landing.
export function makeChamberArrival({gs,stage,shell,viewportHeight=()=>window.innerHeight,reduced=false}){
 if(reduced||!gs||!stage||!shell)return null;
 return gs.fromTo(shell,{y:()=>viewportHeight()*.9,scale:1,opacity:1},{y:0,scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:stage,start:'top bottom',end:()=>stage.clientHeight>viewportHeight()?'top top':'center center',scrub:.65,invalidateOnRefresh:true}});
}

// Hold the whole floor steady while the independent gummy/liquid loop keeps running.
// Pin the connected assembly so its spacer sits after Newbies, never between the pipes and chambers.
export function makePipelineHold({ST,section,assembly,viewportHeight=()=>window.innerHeight,onUpdate,reduced=false}){
 if(reduced||!ST||!section)return null;
 return ST.create({trigger:section,pin:assembly||section,pinSpacing:true,start:'top top',end:()=>'+='+viewportHeight(),anticipatePin:1,invalidateOnRefresh:true,onUpdate});
}

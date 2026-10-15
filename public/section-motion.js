export const sectionReveals=[
 {trigger:'#blueprint',start:'top 30%',selectors:['.creation-intro .eyebrow','.creation-intro h2','.creation-intro p']},
 {trigger:'#comparison',selectors:['.comparison-heading span','.comparison-board']},
 {trigger:'#classics',selectors:['#classics h2','#classics .classics-display']},
 {trigger:'#newbies',selectors:['#newbies h2','.newbies-chambers','.lab-monitor','.newbies-cta']},
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
  gs.fromTo(targets,{y:130,scale:.88,opacity:0},{y:0,scale:1,opacity:1,duration:.85,ease:'back.out(1.35)',stagger:.1,scrollTrigger:{trigger:group.trigger,start:group.start||'top 83%',toggleActions:'play none none reverse',invalidateOnRefresh:true}});
 }
}

// A small rotation about the centered horizontal axis gives headlines one consistent plane.
export function makeHeadlineMotion({gs,resolve,reduced=false}){
 if(reduced||!gs)return;
 for(const title of resolve('.headline-tilt')){
  gs.fromTo(title,{rotationX:-9,transformPerspective:1000,transformOrigin:'50% 50%'},{rotationX:9,ease:'none',scrollTrigger:{trigger:title,start:'top bottom',end:'bottom top',scrub:.6,invalidateOnRefresh:true}});
 }
}

// The whole chamber arrives as one elevator car; the existing scan starts at its landing.
export function makeChamberArrival({gs,stage,shell,viewportHeight=()=>window.innerHeight,reduced=false}){
 if(reduced||!gs||!stage||!shell)return null;
 return gs.fromTo(shell,{y:()=>viewportHeight()*.9,scale:1,opacity:1},{y:0,scale:1,opacity:1,ease:'none',scrollTrigger:{trigger:stage,start:'top bottom',end:()=>stage.clientHeight>viewportHeight()?'top top':'center center',scrub:.65,invalidateOnRefresh:true}});
}

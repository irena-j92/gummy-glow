(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const floors=$$('section[data-floor]'),links=$$('[data-target-floor]');
  const panel=$('.elevator-panel'),map=$('#floor-map'),toggle=$('#floor-map-toggle');
  let active=-1,lastScroll=scrollY,ticking=false,heroPin,motionContext;
  const journeyLength=()=>Math.max(1000,innerHeight*(innerWidth<600?1.25:1.5));
  const setMap=open=>{map.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.querySelector('span').textContent=open?'−':'+';};
  toggle.addEventListener('click',()=>setMap(map.hidden));
  document.addEventListener('click',e=>{if(!panel.contains(e.target))setMap(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!map.hidden){setMap(false);toggle.focus();}});
  function goToFloor(index) {
    const target=floors[index];if(!target)return;
    setMap(false);
    if(index===0){window.gummyJourneyStart=0;heroPin?.refresh();}
    const y=index===0?0:target.getBoundingClientRect().top+scrollY;
    window.scrollTo({top:y,behavior:reduced.matches?'instant':'smooth'});
    history.replaceState(null,'','#'+target.id);
    const heading=target.querySelector('h1,h2');
    if(heading){heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});}
    if(index===0)window.dispatchEvent(new Event('gummy:floor-reception'));
  }
  links.forEach((a,index)=>a.addEventListener('click',e=>{e.preventDefault();goToFloor(index);}));
  $('#next-floor').addEventListener('click',e=>{e.preventDefault();goToFloor(Math.min(active+1,floors.length-1));});
  $('.wordmark').addEventListener('click',()=>{window.gummyJourneyStart=0;heroPin?.refresh();});
  function updateFloor() {
    ticking=false;
    let next=0;
    floors.forEach((f,i)=>{if(f.getBoundingClientRect().top<=innerHeight*.38)next=i;});
    if(next!==active){
      active=next;
      $('#current-floor').textContent=floors[next].dataset.floor;
      $('#current-room').textContent=floors[next].dataset.floorName;
      links.forEach((a,i)=>{if(i===next)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
      document.body.dataset.activeFloor=floors[next].dataset.floor;
      const nextLink=$('#next-floor');nextLink.hidden=next===floors.length-1;nextLink.href='#'+floors[Math.min(next+1,floors.length-1)].id;
      if(next>0)$('#journey-cue').textContent='Explore this floor';
    }
    if(next===0)updateJourneyCue(window.gummyPouchProgress||0);
    const total=document.documentElement.scrollHeight-innerHeight;
    $('.elevator-meter i').style.transform=`scaleX(${total>0?scrollY/total:0})`;
    const direction=Math.abs(scrollY-lastScroll)>1?(scrollY>lastScroll?'DESCENDING':'ASCENDING'):null;
    if(direction)$('#travel-direction').textContent=direction;
    lastScroll=scrollY;
  }
  window.addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateFloor);}},{passive:true});
  window.addEventListener('resize',updateFloor);updateFloor();
  const onEntry=()=>{panel.inert=false;document.body.classList.add('factory-entered');};
  window.addEventListener('gummy:entry',onEntry);
  if(window.gummyEntryComplete)onEntry();else panel.inert=true;

  function updateJourneyCue(progress) {
    const text=reduced.matches?'Scroll to explore':!window.gummyPouchReady?'Claw delivery':!window.gummy3DReady?'Scroll to explore':progress<.04?'Scroll to open':progress<.3?'Peel the seal':progress<.5?'Open the pouch':progress<.7?'Look inside':'Enter the lab';
    if(active===0&&$('#journey-cue').textContent!==text)$('#journey-cue').textContent=text;
  }
  function publishJourney() {
    const start=window.gummyJourneyStart??0;
    const p=window.gummyPouchReady?Math.max(0,Math.min(1,(scrollY-start)/journeyLength())):0;
    window.gummyPouchProgress=p;
    window.dispatchEvent(new CustomEvent('gummy:pouch-progress',{detail:p}));
    const fade=1-Math.min(1,p*3.2);
    gsap.set('.hero h1,.hero-pattern',{opacity:fade});
    gsap.set('.pouch-dissolve',{opacity:Math.max(0,(p-.78)/.22)});
    updateJourneyCue(p);
  }
  function setupMotion() {
    const anchor=active>0?floors[active]:null;
    const before=anchor?.getBoundingClientRect().top;
    motionContext?.revert();heroPin=undefined;
    window.gsap?.set('.hero h1,.hero-pattern,.pouch-dissolve',{clearProps:'opacity'});
    const restoreAnchor=()=>{
      if(anchor&&before!==undefined){const drift=anchor.getBoundingClientRect().top-before;if(Math.abs(drift)>1)window.scrollTo({top:scrollY+drift,behavior:'instant'});}
    };
    if(reduced.matches||!window.gsap||!window.ScrollTrigger){restoreAnchor();updateFloor();return;}
    motionContext=gsap.context(()=>{
      if(window.gummy3DReady) {
        heroPin=ScrollTrigger.create({trigger:'.hero',start:'top top',end:()=>'+='+(journeyLength()+(window.gummyJourneyStart||0)),pin:true,anticipatePin:1,refreshPriority:20,invalidateOnRefresh:true,
          onUpdate:publishJourney,onLeave:publishJourney});
      }
      floors.slice(1).forEach(f=>{
        gsap.from(f.querySelector('.floor-threshold'),{y:22,opacity:0,duration:.55,ease:'power2.out',scrollTrigger:{trigger:f,start:'top 90%',toggleActions:'play none none reverse'}});
      });
      $$('.story-gummy').forEach((c,i)=>gsap.fromTo(c,{y:80+(i%3)*20},{y:-100-(i%3)*20,ease:'none',scrollTrigger:{trigger:'#story',start:'top bottom',end:'bottom top',scrub:1}}));
      gsap.fromTo('.story h2',{y:50,opacity:.4},{y:-20,opacity:1,ease:'none',scrollTrigger:{trigger:'#story',start:'top 90%',end:'top 20%',scrub:1}});
      gsap.from('.taste-console',{y:50,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:'.taste-console',start:'top 85%',once:true}});
      gsap.from('.report',{y:50,rotation:i=>i%2?3:-3,opacity:0,duration:.8,stagger:.12,scrollTrigger:{trigger:'.review-track',start:'top 85%',once:true}});
      ScrollTrigger.create({trigger:'.pipeline',start:'top bottom',end:'bottom top',onUpdate:self=>window.dispatchEvent(new CustomEvent('gummy:pipe-progress',{detail:self.progress}))});
      gsap.fromTo('.newbies-chambers',{scale:.94},{scale:1,ease:'none',scrollTrigger:{trigger:'.newbies-lab',start:'top bottom',end:'top 20%',scrub:.8}});
    });
    ScrollTrigger.sort();ScrollTrigger.refresh();
    restoreAnchor();updateFloor();
  }
  window.addEventListener('gummy:pouch-ready',()=>{
    if(heroPin&&scrollY<=heroPin.end&&window.gummyJourneyStart==null){window.gummyJourneyStart=Math.max(0,scrollY);heroPin.refresh();publishJourney();}
    updateJourneyCue(window.gummyPouchProgress||0);
  });
  window.addEventListener('gummy:webgl-ready',setupMotion);
  window.addEventListener('gummy:webgl-unavailable',setupMotion);
  reduced.addEventListener('change',setupMotion);
  setupMotion();

  const samples={
    watermelon:{title:'WATERMELON TRANCE',notes:'Bright, fruity, and a little bit dreamy. A little summer, every day.',gummy:'pink-gummy-new.png',color:'#fc8cf6'},
    elderflower:{title:'ELDERFLOWER LULLABY',notes:'Soft floral notes with a fresh little twist. Flower power for your routine.',gummy:'teal-gummy.png',color:'#94edcf'},
    pumpkin:{title:'PUMPKIN ENERGY',notes:'Warm, mellow, and full of sunny personality. Your pocketful of sunshine.',gummy:'orange-gummy-glow.png',color:'#ffa851'},
    blueberry:{title:'BLUEBERRY BOMB',notes:'Bold berry flavor with a playful little punch. Delightfully blue.',gummy:'star-gummy.png',color:'#80c9ff'}
  };
  let current='watermelon',sampleTween;
  $$('[data-sample]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.sample;if(key===current)return;current=key;
    const s=samples[key];sampleTween?.kill();
    $('#taste-pouch').src=`/assets/${key}.png`;$('#taste-pouch').alt=s.title+' pouch';
    $('#taste-gummy').src='/assets/'+s.gummy;$('#taste-title').textContent=s.title;
    $('#taste-notes').textContent=s.notes;$('#taste-link').href='/collection/#'+key;
    $('.taste-console').style.setProperty('--taste',s.color);
    $$('[data-sample]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});
    $('#taste-announcement').textContent=s.title+'. '+s.notes;
    if(window.gsap&&!reduced.matches)sampleTween=gsap.fromTo('#taste-pouch,#taste-gummy',{y:20,rotation:-8,opacity:0},{y:0,rotation:0,opacity:1,duration:.55,stagger:.06,ease:'back.out(1.4)',clearProps:'transform,opacity'});
  }));

  // An actual memory game for the existing arcade, with no network or account.
  const dialog=$('#game-dialog'),grid=$('.memory-grid');
  let chosen=[],matches=0,moves=0,locked=false,round=0;
  function shuffle(array) {
    for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[array[i],array[j]]=[array[j],array[i]];}return array;
  }
  function resetMemory() {
    round++;chosen=[];matches=0;moves=0;locked=false;
    $('#memory-moves').textContent='0 moves';$('#memory-matches').textContent='0 / 4 pairs';$('#memory-status').textContent='Find the four matching gummy pairs.';
    const keys=shuffle([...Object.keys(samples),...Object.keys(samples)]);
    grid.replaceChildren();
    keys.forEach((key,i)=>{
      const b=document.createElement('button');b.type='button';b.className='memory-tile';b.dataset.key=key;
      b.setAttribute('aria-label',`Card ${i+1}, face down`);b.setAttribute('aria-pressed','false');
      const back=document.createElement('span');back.textContent='G';back.className='memory-back';
      const image=new Image();image.src='/assets/'+samples[key].gummy;image.alt='';
      b.append(back,image);grid.append(b);
      b.addEventListener('click',()=>{
        if(locked||b.disabled||chosen.includes(b))return;
        b.classList.add('flipped');b.setAttribute('aria-pressed','true');b.setAttribute('aria-label',samples[key].title);
        chosen.push(b);if(chosen.length<2)return;
        moves++;$('#memory-moves').textContent=moves+(moves===1?' move':' moves');
        const [a,c]=chosen;
        if(a.dataset.key===c.dataset.key){
          matches++;a.disabled=c.disabled=true;a.classList.add('matched');c.classList.add('matched');chosen=[];
          $('#memory-matches').textContent=matches+' / 4 pairs';
          $('#memory-status').textContent=matches===4?`All goodness matched in ${moves} moves!`:'A sweet match. Keep going.';
        }else{
          locked=true;const game=round;
          setTimeout(()=>{if(game!==round)return;[a,c].forEach(x=>{x.classList.remove('flipped');x.setAttribute('aria-pressed','false');x.setAttribute('aria-label','Card, face down');});chosen=[];locked=false;},850);
        }
      });
    });
  }
  $('#memory-reset').addEventListener('click',resetMemory);
  $$('.arcade-card').forEach(b=>b.addEventListener('click',()=>{
    const playing=b.dataset.game==='Memory';$('#memory-lab').hidden=!playing;
    dialog.querySelector(':scope > p').hidden=playing;
    $('#game-newsletter').hidden=playing;
    dialog.querySelector(':scope > img').hidden=playing;
    dialog.querySelector(':scope > .eyebrow').textContent=playing?'THE MEMORY LAB':'NEXT UP AT THE FACTORY';
    dialog.classList.toggle('playing-memory',playing);if(playing)resetMemory();
  }));
  dialog.addEventListener('close',()=>{round++;});
  window.addEventListener('pagehide',()=>motionContext?.revert());
  window.addEventListener('pageshow',e=>{if(e.persisted)setupMotion();});
})();

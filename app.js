const menuButton=document.querySelector('.menu-toggle');
const menu=document.querySelector('.nav-links');
function closeMenu(){menu?.classList.remove('is-open');menuButton?.setAttribute('aria-expanded','false');if(menuButton){menuButton.textContent='MENU';menuButton.setAttribute('aria-label','Ouvrir le menu');}}
menuButton?.addEventListener('click',()=>{const expanded=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!expanded));menu.classList.toggle('is-open',!expanded);menuButton.textContent=expanded?'MENU':'FERMER';menuButton.setAttribute('aria-label',expanded?'Ouvrir le menu':'Fermer le menu');});
menu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.classList.contains('is-open')){closeMenu();menuButton?.focus();}});
document.addEventListener('click',e=>{if(!e.target.closest('.nav'))closeMenu();});
window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
const projectCards=[...document.querySelectorAll('.project')];
const filterButtons=[...document.querySelectorAll('.filter')];
const showMore=document.querySelector('.show-more');
const phoneProjects=window.matchMedia('(max-width:760px)');
const projectPageSize=()=>phoneProjects.matches?3:6;
let selectedCategory='highlight',visibleLimit=projectPageSize();
function matchingProjects(){
 const matching=projectCards.filter(card=>selectedCategory==='all'||card.dataset.categories.split(' ').includes(selectedCategory));
 return selectedCategory==='highlight'?matching.slice(0,6):matching;
}
function renderProjects(animate=false){
 const available=matchingProjects();
 projectCards.forEach(card=>card.hidden=true);
 available.slice(0,visibleLimit).forEach((card,index)=>{
  card.hidden=false;
  if(animate&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
   card.getAnimations().forEach(animation=>animation.cancel());
   card.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:440,delay:index*65,easing:'cubic-bezier(.2,.7,.3,1)',fill:'backwards'});
  }
 });
 filterButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===selectedCategory)));
 const count=document.querySelector('.result-count');
 const shown=Math.min(available.length,visibleLimit);
 if(count)count.textContent=available.length+' projet'+(available.length>1?'s':'')+(available.length>shown?' · '+shown+' affichés':'');
 if(showMore){showMore.hidden=available.length<=projectPageSize();showMore.textContent=visibleLimit>=available.length?'Voir moins':'Voir plus';showMore.setAttribute('aria-expanded',String(visibleLimit>projectPageSize()));}
}
filterButtons.forEach(button=>button.addEventListener('click',()=>{
 const filterBar=button.closest('.filters');
 const above=filterBar.getBoundingClientRect().top-(siteHeader?.offsetHeight||87);
 selectedCategory=button.dataset.filter;visibleLimit=projectPageSize();renderProjects(true);
 if(above<=2){const section=document.querySelector('#projects');window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top-(siteHeader?.offsetHeight||87),behavior:'instant'});}
}));
showMore?.addEventListener('click',()=>{
 const available=matchingProjects();
 const collapsing=visibleLimit>=available.length;
 const previousVisible=Math.min(visibleLimit,available.length);
 visibleLimit=collapsing?projectPageSize():visibleLimit+projectPageSize();renderProjects();
 if(collapsing){const section=document.querySelector('#projects');window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top-(siteHeader?.offsetHeight||87),behavior:'instant'});showMore.focus({preventScroll:true});}
 else available[previousVisible]?.focus({preventScroll:true});
});
phoneProjects.addEventListener('change',()=>{visibleLimit=projectPageSize();renderProjects();});
renderProjects();

const viewer=document.querySelector('.image-viewer');
const galleryLinks=[...document.querySelectorAll('.gallery-link')];
let galleryIndex=0;
let previousFocus=null;
const galleryDots=galleryLinks.map((link,index)=>{
 const dot=document.createElement('button');dot.type='button';dot.className='viewer-dot';dot.setAttribute('aria-label','Afficher l’image '+(index+1));dot.addEventListener('click',()=>showImage(index));viewer?.querySelector('.viewer-dots')?.append(dot);return dot;
});
function showImage(index){
 if(!galleryLinks.length)return;
 galleryIndex=(index+galleryLinks.length)%galleryLinks.length;
 const link=galleryLinks[galleryIndex],img=viewer.querySelector('img');
 viewer.classList.toggle('viewer-cropped',Boolean(link.closest('.charte-crop')));
 img.onload=()=>viewer.classList.toggle('viewer-landscape',img.naturalWidth>img.naturalHeight);
 img.src=link.href;img.alt=link.querySelector('img').alt;
 viewer.querySelector('.viewer-caption').textContent=link.dataset.caption;
 viewer.querySelector('.viewer-count').textContent=(galleryIndex+1)+' / '+galleryLinks.length;
 galleryDots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===galleryIndex)));
}
galleryLinks.forEach((link,index)=>link.addEventListener('click',event=>{if(!viewer?.showModal)return;event.preventDefault();previousFocus=link;showImage(index);viewer.showModal();document.body.classList.add('viewer-open');}));
viewer?.querySelector('.viewer-close').addEventListener('click',()=>viewer.close());
viewer?.querySelector('.viewer-prev').addEventListener('click',()=>showImage(galleryIndex-1));
viewer?.querySelector('.viewer-next').addEventListener('click',()=>showImage(galleryIndex+1));
viewer?.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
viewer?.addEventListener('close',()=>{document.body.classList.remove('viewer-open');previousFocus?.focus();});
viewer?.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showImage(galleryIndex+1);}if(event.key==='ArrowLeft'){event.preventDefault();showImage(galleryIndex-1);}});
// Mobile gallery navigation replaces the side buttons with a horizontal swipe.
let galleryTouch=null;
const viewerStage=viewer?.querySelector('.viewer-stage');
viewerStage?.addEventListener('touchstart',event=>{if(event.touches.length===1)galleryTouch={x:event.touches[0].clientX,y:event.touches[0].clientY};else galleryTouch=null;},{passive:true});
viewerStage?.addEventListener('touchend',event=>{if(!galleryTouch||!event.changedTouches.length)return;const dx=event.changedTouches[0].clientX-galleryTouch.x,dy=event.changedTouches[0].clientY-galleryTouch.y;galleryTouch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)showImage(galleryIndex+(dx<0?1:-1));},{passive:true});
viewerStage?.addEventListener('touchcancel',()=>{galleryTouch=null;},{passive:true});
document.querySelectorAll('.mobile-mockup-grid').forEach(track=>track.addEventListener('keydown',event=>{if(event.target!==track||!['ArrowLeft','ArrowRight'].includes(event.key)||!window.matchMedia('(max-width:760px)').matches)return;event.preventDefault();const item=track.querySelector('.editorial-image');track.scrollBy({left:(item?.getBoundingClientRect().width||240)*(event.key==='ArrowRight'?1:-1),behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}));
document.querySelectorAll('.story-carousel').forEach(carousel=>{
 const track=carousel.querySelector('.story-track');
 const originals=[...track.querySelectorAll('.story-slide')];
 const count=originals.length;
 if(count>1){track.prepend(originals[count-1].cloneNode(true));track.append(originals[0].cloneNode(true));}
 const slides=[...track.querySelectorAll('.story-slide')];
 const dots=[...carousel.querySelectorAll('.story-dot')];
 const previous=carousel.querySelector('.story-previous'),next=carousel.querySelector('.story-next');
 const status=carousel.querySelector('.story-position');
 const reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
 let physical=count>1?1:0,settleTimer,lastSettled=0,userNavigated=false;
 const logical=position=>count>1?(position-1+count)%count:0;
 function update(){
  physical=Math.max(0,Math.min(slides.length-1,Math.round(track.scrollLeft/(track.clientWidth||1))));
  const active=logical(physical);
  dots.forEach((dot,i)=>dot.setAttribute('aria-current',String(i===active)));
  status.textContent=(active+1)+' / '+count;
  slides.forEach((slide,i)=>{slide.inert=i!==physical;slide.setAttribute('aria-hidden',String(i!==physical));if(i!==physical)slide.querySelectorAll('video').forEach(video=>video.pause());});
 }
 function jump(position){track.scrollTo({left:position*track.clientWidth,behavior:'instant'});physical=position;update();}
 function settle(){
  if(count<2)return;
  if(Math.abs(track.scrollLeft-physical*track.clientWidth)>2)return;
  if(physical===0)jump(count);else if(physical===count+1)jump(1);
  const active=logical(physical);
  if(userNavigated&&active!==lastSettled){const video=slides[physical].querySelector('video');if(video){video.muted=true;video.play().catch(()=>{});}}
  lastSettled=active;
 }
 function go(position){
  if(count<2)return;
  userNavigated=true;
  track.scrollTo({left:Math.max(0,Math.min(count+1,position))*track.clientWidth,behavior:reducedMotion.matches?'instant':'smooth'});
 }
 previous.hidden=next.hidden=count<2;
 previous.addEventListener('click',()=>go(physical-1));next.addEventListener('click',()=>go(physical+1));
 dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i+1)));
 ['pointerdown','touchstart','wheel'].forEach(name=>track.addEventListener(name,()=>{userNavigated=true;},{passive:true}));
 track.addEventListener('scroll',()=>{update();clearTimeout(settleTimer);settleTimer=setTimeout(settle,160);},{passive:true});
 track.addEventListener('scrollend',settle);
 track.addEventListener('keydown',event=>{
  if(event.target!==track)return;
  const targets={ArrowLeft:physical-1,ArrowRight:physical+1,Home:1,End:count};
  if(event.key in targets){event.preventDefault();go(targets[event.key]);}
 });
 let firstLayout=true;
 new ResizeObserver(()=>{jump(firstLayout?(count>1?1:0):(count>1?logical(physical)+1:0));firstLayout=false;}).observe(track);
});
// Use two compact controls instead of the browser's video toolbar.
const videoIcon=paths=>'<svg viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">'+paths+'</svg>';
const playIcon=videoIcon('<path fill="currentColor" d="M7 4v16l13-8z"/>');
const pauseIcon=videoIcon('<path fill="currentColor" d="M6 4h4v16H6zm8 0h4v16h-4z"/>');
const soundIcon=videoIcon('<path fill="currentColor" d="M3 9v6h4l5 4V5L7 9z"/><path fill="none" stroke="currentColor" stroke-width="2" d="M15 8a6 6 0 010 8m3-11a10 10 0 010 14"/>');
const mutedIcon=videoIcon('<path fill="currentColor" d="M3 9v6h4l5 4V5L7 9z"/><path fill="none" stroke="currentColor" stroke-width="2" d="m16 9 5 6m0-6-5 6"/>');
document.querySelectorAll('.video-player').forEach(player=>{
 const video=player.querySelector('video');video.controls=false;
 const hasAudio=video.dataset.hasAudio!=='false';if(!hasAudio)video.muted=true;
 const controls=document.createElement('div');controls.className='video-controls';
 const play=document.createElement('button'),mute=document.createElement('button');
 play.type=mute.type='button';mute.disabled=!hasAudio;controls.append(play,mute);player.append(controls);
 function update(){play.innerHTML=video.paused?playIcon:pauseIcon;play.setAttribute('aria-label',video.paused?'Lire la vidéo':'Mettre la vidéo en pause');mute.innerHTML=video.muted?mutedIcon:soundIcon;mute.setAttribute('aria-label',!hasAudio?'Cette vidéo ne contient pas de son':video.muted?'Activer le son':'Couper le son');mute.setAttribute('aria-pressed',String(video.muted));}
 play.addEventListener('click',()=>{if(video.paused)video.play().catch(()=>{play.setAttribute('aria-label','Réessayer la lecture');});else video.pause();});
 mute.addEventListener('click',()=>{video.muted=!video.muted;});
 ['play','pause','ended','volumechange'].forEach(name=>video.addEventListener(name,update));
 video.addEventListener('play',()=>document.querySelectorAll('.video-player video').forEach(other=>{if(other!==video)other.pause();}));
 update();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('.video-player video').forEach(video=>video.pause());});

const siteHeader=document.querySelector('header');
if(siteHeader){new ResizeObserver(()=>document.documentElement.style.setProperty('--header-height',siteHeader.offsetHeight+'px')).observe(siteHeader);}
const sectionNav=[...document.querySelectorAll('.nav-links a')];
const sections=sectionNav.map(link=>document.querySelector(link.hash)).filter(Boolean);
let navHoldUntil=0;
function selectNav(id){sectionNav.forEach(link=>{if(link.hash==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
sectionNav.forEach(link=>link.addEventListener('click',()=>{if(document.querySelector(link.hash)){navHoldUntil=performance.now()+900;selectNav(link.hash.slice(1));}}));
function updateSectionNav(){
 if(!sections.length||performance.now()<navHoldUntil)return;
 const threshold=(siteHeader?.offsetHeight||87)+80;
 let current='';
 for(const section of sections){const marker=section.querySelector('.badge')||section;if(marker.getBoundingClientRect().top<=threshold)current=section.id;}
 if(window.scrollY>0&&window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-8)current='contact';
 selectNav(current);
}
let navFrame=false;
window.addEventListener('scroll',()=>{if(!navFrame){navFrame=true;requestAnimationFrame(()=>{navFrame=false;updateSectionNav();});}},{passive:true});
window.addEventListener('hashchange',()=>selectNav(location.hash.slice(1)));
window.addEventListener('resize',updateSectionNav);
if(location.hash&&document.querySelector(location.hash)){selectNav(location.hash.slice(1));navHoldUntil=performance.now()+900;}else updateSectionNav();

const backToTop=document.querySelector('.back-to-top');
function updateBackToTop(){if(backToTop){backToTop.hidden=window.scrollY<160;}}
window.addEventListener('scroll',updateBackToTop,{passive:true});
backToTop?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});document.querySelector('.brand')?.focus({preventScroll:true});});
updateBackToTop();

// Pause videos whenever their visible area is left; normal videos never auto-resume.
if('IntersectionObserver' in window){
 const videoVisibility=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.intersectionRatio<.6)entry.target.pause();}),{threshold:[0,.6]});
 document.querySelectorAll('.video-player video').forEach(video=>videoVisibility.observe(video));
}
// Progressive scroll reveals keep all content available without JavaScript.
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -24px 0px'});
 const targets=document.querySelectorAll('.about-copy,.about-graphic,.section-heading,.skill-detail,.project,.detail-heading,.project-metadata,.editorial-text,.editorial-image,.hug-text,.hug-visual,.project-contributors,.contact-panel,.video-examples,.story-carousel');
 targets.forEach(element=>{element.classList.add('scroll-reveal');revealObserver.observe(element);});
 document.addEventListener('focusin',event=>event.target.closest('.scroll-reveal')?.classList.add('is-revealed'));
}
// Keep the selected heading at the same screen position when another panel closes.
const skillDetails=[...document.querySelectorAll('.skill-detail')];
skillDetails.forEach(detail=>{
 const summary=detail.querySelector('summary');
 summary.addEventListener('click',event=>{
  event.preventDefault();
  const previousTop=summary.getBoundingClientRect().top,previousScroll=window.scrollY;
  const opening=!detail.open;
  skillDetails.forEach(other=>{other.open=other===detail&&opening;});
  const delta=summary.getBoundingClientRect().top-previousTop;
  window.scrollTo({top:previousScroll+delta,behavior:'instant'});
 });
});

// Email remains usable through mailto when dialog support or JavaScript is absent.
const contactDialog=document.querySelector('.contact-dialog');
let contactReturnFocus=null;
document.querySelectorAll('.contact-trigger').forEach(trigger=>trigger.addEventListener('click',event=>{
 if(!contactDialog?.showModal)return;
 event.preventDefault();contactReturnFocus=trigger;
 contactDialog.querySelector('.copy-status').textContent='';
 contactDialog.querySelector('.copy-email').textContent='Copier l’adresse';
 contactDialog.showModal();contactDialog.querySelector('#contact-dialog-title').focus();
}));
contactDialog?.querySelector('.contact-close').addEventListener('click',()=>contactDialog.close());
contactDialog?.addEventListener('click',event=>{if(event.target===contactDialog){const r=contactDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)contactDialog.close();}});
contactDialog?.addEventListener('close',()=>contactReturnFocus?.focus({preventScroll:true}));
contactDialog?.querySelector('.copy-email').addEventListener('click',async()=>{
 const address=contactDialog.querySelector('#contact-email');
 const status=contactDialog.querySelector('.copy-status');
 try{
  if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(address.value);
  else{address.focus();address.select();if(!document.execCommand('copy'))throw new Error('Copy unavailable');}
  status.textContent='Adresse copiée !';contactDialog.querySelector('.copy-email').textContent='Copié !';
 }catch{address.focus();address.select();status.textContent='Sélectionnez l’adresse pour la copier.';}
});


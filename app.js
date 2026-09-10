const cards = [...document.querySelectorAll('.audio-card')];
const filters = [...document.querySelectorAll('.filter')];
const format = value => `${Math.floor(value/60).toString().padStart(2,'0')}:${Math.floor(value%60).toString().padStart(2,'0')}`;
function state(card, playing) {
 const button=card.querySelector('.play-button');
 card.classList.toggle('is-playing',playing);
 button.querySelector('img').src=`assets/icons/${playing?'pause':'play'}.svg`;
 button.setAttribute('aria-label',`${playing?'Поставить на паузу':'Воспроизвести'}: ${card.querySelector('strong').textContent}`);
 button.setAttribute('aria-pressed',String(playing));
}
cards.forEach(card=>{
 const audio=card.querySelector('audio'),button=card.querySelector('.play-button'),wave=card.querySelector('.wave'),time=card.querySelector('time');
 const original=time.textContent;
 state(card,false);
 button.addEventListener('click',async()=>{
  if(!audio.paused){audio.pause();return;}
  cards.forEach(other=>{if(other!==card)other.querySelector('audio').pause();});
  card.querySelector('.audio-error')?.remove();
  try { await audio.play(); } catch(e) {
   if(e.name==='AbortError')return;
   state(card,false);const message=document.createElement('p');message.className='audio-error';message.setAttribute('role','status');message.textContent='Не удалось загрузить запись. Нажмите ещё раз.';card.append(message);
  }
 });
 audio.addEventListener('play',()=>state(card,true));
 audio.addEventListener('pause',()=>state(card,false));
 audio.addEventListener('ended',()=>{state(card,false);time.textContent=original;});
 audio.addEventListener('timeupdate',()=>{
  if(!audio.ended)time.textContent=audio.currentTime?format(audio.currentTime):original;
  [...wave.children].forEach((bar,i)=>bar.classList.toggle('played',i/wave.children.length<audio.currentTime/audio.duration));
 });
 wave.removeAttribute('aria-hidden');wave.setAttribute('role','slider');wave.tabIndex=0;
 wave.setAttribute('aria-label','Позиция записи: '+card.querySelector('strong').textContent);
 wave.setAttribute('aria-valuemin','0');wave.setAttribute('aria-valuemax','100');wave.setAttribute('aria-valuenow','0');
 audio.addEventListener('timeupdate',()=>wave.setAttribute('aria-valuenow',String(Math.round(100*audio.currentTime/audio.duration)||0)));
 wave.addEventListener('click',e=>{if(Number.isFinite(audio.duration)){const rect=wave.getBoundingClientRect();audio.currentTime=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width))*audio.duration;}});
 wave.addEventListener('keydown',e=>{if(!Number.isFinite(audio.duration))return;if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();audio.currentTime=e.key==='Home'?0:e.key==='End'?audio.duration:Math.max(0,Math.min(audio.duration,audio.currentTime+(e.key==='ArrowRight'?5:-5)));}});
});
filters.forEach(filter=>{
 filter.setAttribute('aria-pressed',String(filter.classList.contains('is-active')));
 filter.addEventListener('click',()=>{
  filters.forEach(item=>{item.classList.toggle('is-active',item===filter);item.setAttribute('aria-pressed',String(item===filter));});
  cards.forEach(card=>{card.hidden=filter.dataset.filter!=='all'&&card.dataset.language!==filter.dataset.filter;if(card.hidden)card.querySelector('audio').pause();});
 });
});

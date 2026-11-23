import {LitElement,html,svg,nothing,unsafeCSS,type TemplateResult} from 'lit';
import charte from './ui/hestia-charte.css';
import heating from './heating.css';
import './editor';
import {follow,type Connection} from './stream';

/* Hestia Chauffage's card, after the cards' mock-up validated by Frank on 20 Nov. 2026:
   1 · la maison: the house in one sentence, every room, the night's cold (card: maison, by default)
   2 · le poêle: its flame, its day, its smoke, the plug, the pellets (card: poele)
   3 · une pièce: its temperature, its set point, its demand, its day (card: piece, piece: <id>), or one line (court: true)
   4 · le planning: the day of each room and of the stove, from the planning Hestia or Scheduler (card: planning)
   Every figure comes from the integration (hestia_heating/subscribe, day): the card only puts it into words. */

type Hass={callWS:<T>(msg:Record<string,unknown>)=>Promise<T>;connection:Connection;themes?:{darkMode?:boolean}};
type Badge={texte:string;ton:string};
type Room={id:string;nom:string;temperature:number|null;consigne:number|null;etat:string;poele:boolean;demande_pct:number|null;puissance_w:number;
 pente:number|null;fenetre:boolean;badge:Badge;raison:string|null;planning:string|null;prochain:{a:string;texte:string}|null;type:string|null};
type Stove={nom:string;etat:string;en_feu:boolean;depuis:string|null;flamme:number|null;flamme_reglee:number|null;flamme_max:number;fumees:number|null;
 prise:string|null;prise_w:number|null;demande_pct:number|null;ecritures:number|null;ecritures_max:number|null;alarme:boolean|null;alarme_texte:string|null};
type Pellets={stock_sacs:number|null;stock_kg:number|null;jours:number|null};
type Lane={id:string;nom:string;segments:{de:number;a:number;ton:string}[];source?:string|null;bloque?:boolean};
type Planning={source:string|null;jour_nom:string;labo?:boolean;essai?:boolean;maintenant_min:number;lignes:Lane[];
 prochains:{a:string;heure:string;texte:string}[]};
type View={pret:boolean;maison:{etat:string;titre:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number};
 pieces:Room[];poele:Stove|null;granules:Pellets|null;dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning};
type Day={maintenant_min:number;series:Record<string,[number,number|null][]>};
type Config={type:string;card?:string;piece?:string;court?:boolean;name?:string};
const CARDS=['maison','poele','piece','planning'];

const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
const watts=(w:number|null|undefined)=>w==null?'—':w>=500?`${num(w/1000)} kW`:`${num(w,0)} W`;
const hm=(d:Date)=>d.getMinutes()?`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`:`${d.getHours()} h`;
const DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function when(iso:string){const d=new Date(iso),now=new Date(),t=new Date(now);t.setDate(t.getDate()+1);
 if(d.toDateString()===now.toDateString())return hm(d);if(d.toDateString()===t.toDateString())return `demain ${hm(d)}`;return `${DAYS[d.getDay()]} ${hm(d)}`;}
const STOVE_WORD:Record<string,string>={eteint:'éteint',allumage:'allumage',chauffe:'chauffe',nettoyage:'nettoyage',extinction:'extinction',alarme:'alarme',inconnu:'inconnu'};
const LANE_WORD:Record<string,string>={poele:'poêle en chauffe',confort:'confort',eco:'éco',hors_gel:'hors gel',boost:'boost',arret:'arrêt'};

/* The day's curves: one line per series, its own scale or the shared one (temperatures). A gap (no value) cuts the
   line; the last run reaches « now » only when the series still has a value at its end. */
const W=400,H=80;
function runs(points:[number,number|null][],end?:number){
 const out:[number,number][][]=[];let cur:[number,number][]|null=null;
 for(const [m,v] of points){if(v==null){cur=null;continue;}if(!cur){cur=[];out.push(cur);}cur.push([m,v]);}
 const last=points.at(-1),run=out.at(-1);
 if(run&&last?.[1]!=null&&end!=null&&end>run.at(-1)![0])run.push([end,run.at(-1)![1]]);
 return out;
}
function paths(points:[number,number|null][],lo:number,hi:number,step=false,end?:number){
 const x=(m:number)=>(m/1440*W).toFixed(1),y=(v:number)=>(H-6-(v-lo)/(hi-lo||1)*(H-12)).toFixed(1);
 const line=(run:[number,number][])=>run.map(([m,v],i)=>i===0?`M${x(m)} ${y(v)}`:step?`H${x(m)}V${y(v)}`:`L${x(m)} ${y(v)}`).join('');
 const all=runs(points,end);
 return {line:all.map(line).join(''),area:all.map(r=>`M${x(r[0][0])} ${H}`+line(r).replace(/^M/,'L')+`V${H}Z`).join('')};
}
function chart(lines:{pts:[number,number|null][];cls:string;step?:boolean;fill?:boolean;lo?:number;hi?:number}[],now:number,label:string):TemplateResult{
 const vals=lines.filter(l=>l.lo==null).flatMap(l=>l.pts.map(p=>p[1])).filter((x):x is number=>x!=null);
 const lo=vals.length?Math.floor(Math.min(...vals)-.5):15,hi=vals.length?Math.ceil(Math.max(...vals)+.5):22;
 return html`<svg class="chart" viewBox="0 0 ${W} ${H+14}" role="img" aria-label=${label}>
  ${[0,360,720,1080].map(m=>svg`<line class="grid" x1=${m/1440*W} x2=${m/1440*W} y1="0" y2=${H}></line><text x=${m/1440*W+2} y=${H+12}>${m/60} h</text>`)}
  ${lines.map(l=>{const p=paths(l.pts,l.lo??lo,l.hi??hi,l.step,now);
   return p.line?svg`${l.fill?svg`<path class=${l.cls+' area'} d=${p.area}></path>`:nothing}<path class=${l.cls} d=${p.line}></path>`:nothing;})}
  <line class="now" x1=${now/1440*W} x2=${now/1440*W} y1="0" y2=${H}></line></svg>`;
}

class HestiaHeatingCard extends LitElement {
 static styles=[unsafeCSS(charte),unsafeCSS(heating)];
 static properties={_view:{state:true},_day:{state:true},_error:{state:true}};
 declare _view?:View;declare _day?:Day;declare _error?:string;
 private _hass?:Hass;private _config:Config={type:'custom:hestia-heating-card',card:'maison'};private _stop?:()=>void;private _again?:number;
 private _dayAt=0;private _dayFor='';

 static getStubConfig(){return {card:'maison'};}
 static getConfigElement(){return document.createElement('hestia-heating-card-editor');}
 setConfig(config:Config){
  const card=config.card??'maison';
  if(!CARDS.includes(card))throw new Error(`card: ${card} ? (${CARDS.join(', ')})`);
  this._config={...config,card};
 }
 getCardSize(){const c=this._config.card;return c==='piece'&&this._config.court?2:c==='planning'?6:5;}
 getGridOptions(){const c=this._config.card;return c==='planning'?{columns:'full',rows:'auto'}:{columns:12,rows:'auto',min_columns:6};}
 set hass(hass:Hass){
  const other=this._hass?.connection!==hass.connection;
  this._hass=hass;
  this.setAttribute('theme',hass.themes?.darkMode===false?'light':'dark');
  if(other||!this._stop)this._follow();
 }
 connectedCallback(){super.connectedCallback();this._follow();}
 disconnectedCallback(){super.disconnectedCallback();this._unfollow();}
 private _unfollow(){this._stop?.();this._stop=undefined;window.clearTimeout(this._again);}
 private _follow(){
  this._unfollow();
  if(!this._hass||!this.isConnected)return;
  this._stop=follow(this._hass.connection,v=>{this._view=v as unknown as View;this._error=undefined;this._maybeDay();},
   e=>{this._stop=undefined;this._error=e.message??'Hestia Chauffage ne répond pas.';this._again=window.setTimeout(()=>this._follow(),30000);},
   ()=>{this._stop=undefined;this._again=window.setTimeout(()=>this._follow(),2000);});
 }
 /** The day's curves (stove, room): asked when the card shows, then every two minutes at most. */
 private _maybeDay(){
  const c=this._config,target=c.card==='poele'?'poele':c.card==='piece'&&!c.court&&c.piece?`piece/${c.piece}`:'';
  if(!target||!this._hass)return;
  if(target===this._dayFor&&Date.now()-this._dayAt<120_000)return;
  this._dayFor=target;this._dayAt=Date.now();
  this._hass.callWS<Day>({type:'hestia_heating/day',cible:target}).then(d=>{this._day=d;}).catch(()=>{/* no recorder: no curve */});
 }
 private _open(path:string){history.pushState(null,'','/hestia/chauffage'+(path?'/'+path:''));window.dispatchEvent(new CustomEvent('location-changed',{bubbles:true,composed:true}));}
 private _info(path:string,label:string){return html`<button class="nw-info" aria-label=${label} @click=${()=>this._open(path)}></button>`;}
 private _chip(b:Badge){return html`<span class=${'nw-chip '+b.ton}>${b.texte}</span>`;}

 render(){
  const v=this._view;
  if(this._error)return html`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;
  if(!v||!v.pret)return html`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;
  const c=this._config.card;
  return html`<ha-card>${c==='poele'?this._stove(v):c==='piece'?this._room(v):c==='planning'?this._planning(v):this._house(v)}</ha-card>`;
 }

 /* 1 · La maison */
 private _house(v:View){
  const h=v.maison,out=v.dehors,next=v.planning.prochains,now=new Date(),g=v.granules;
  const line=html`${h.temperature!=null?html`La maison est à <b>${deg(h.temperature)}</b>. `:nothing}${out?.nuit_min!=null?html`Cette nuit <b>${deg(out.nuit_min)}</b> dehors. `:nothing}${next.length?html`Ensuite : ${next.slice(0,2).map(n=>`${n.texte} ${when(n.a)}`).join(', ')}.`:nothing}`;
  return html`<div class="head"><h2 class="nw-title">${this._config.name||'Chauffage'}</h2>${this._info('','Ouvrir l’onglet Chauffage')}</div>
   <div class=${'band '+h.etat}><div class="kicker">Maintenant <i>${hm(now)}</i></div><div class="title">${h.titre}</div><div class="line">${line}</div></div>
   <div class="rooms">${v.pieces.map(r=>html`<button class="room" @click=${()=>this._open('pieces/'+r.id)}><span class="n">${r.nom}</span>
    ${r.etat==='chauffe'&&!r.poele&&r.demande_pct!=null&&!r.fenetre?html`<span class="demand" role="img" aria-label=${`Demande ${r.demande_pct} %`}><i style=${`width:${r.demande_pct}%`}></i></span>`:this._chip(r.badge)}
    <span class="t">${r.temperature!=null?num(r.temperature):'—'}${r.consigne!=null?html` <small>/ ${num(r.consigne)}</small>`:nothing}</span></button>`)}</div>
   <div class="nw-stats"><div><span>En chauffe</span><b>${h.en_chauffe} sur ${h.pieces}</b></div><div><span>Électrique</span><b>${watts(h.electrique_w)}</b></div>
    ${g?.jours!=null?html`<div><span>Granulés</span><b>${g.jours} jours</b></div>`:out?.demain_max!=null?html`<div><span>Demain après-midi</span><b>${deg(out.demain_max)}</b></div>`:html`<div><span>Pièces</span><b>${h.pieces}</b></div>`}</div>`;
 }

 /* 2 · Le poêle */
 private _stove(v:View){
  const s=v.poele;
  if(!s)return html`<div class="head"><h2 class="nw-title">${this._config.name||'Poêle'}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;
  const max=s.flamme_max,real=s.flamme,asked=s.flamme_reglee,d=this._day,g=v.granules,room=v.pieces.find(r=>r.poele);
  const say=s.en_feu&&s.demande_pct!=null?`Le thermostat demande ${s.demande_pct} %${s.depuis?`. Depuis ${hm(new Date(s.depuis))}`:''}.`:s.depuis?`${STOVE_WORD[s.etat][0].toUpperCase()+STOVE_WORD[s.etat].slice(1)} depuis ${hm(new Date(s.depuis))}.`:'';
  return html`<div class="head"><h2 class="nw-title">${this._config.name||s.nom}</h2>${this._chip({texte:STOVE_WORD[s.etat],ton:s.etat==='alarme'?'alert':s.en_feu?'stove':'off'})}${this._info('poele','Ouvrir la page du poêle')}</div>
   <div class="nw-panel flame-row"><div><div class="nw-value"><b>${real!=null?`Flamme ${real}`:'Flamme —'}</b><span>sur ${max}</span></div><div class="nw-say">${say}</div></div>
    <div class="flames" aria-hidden="true">${Array.from({length:max},(_,i)=>i+1).map(i=>html`<i class=${(real!=null&&i<=real?'on':'')+(asked===i?' ask':'')} style=${`height:${14+i*(32/max)}px`}></i>`)}</div></div>
   ${d&&(d.series.flamme?.length||d.series.temperature?.length)?html`${chart([{pts:d.series.flamme??[],cls:'flame',step:true,fill:true,lo:0,hi:max},{pts:d.series.temperature??[],cls:'salon'}],d.maintenant_min,'Flamme du poêle et température de la pièce aujourd’hui')}
    <div class="nw-legend"><span><i class="sw flame"></i>flamme</span><span><i class="sw salon"></i>${room?room.nom.toLowerCase():'pièce'}</span></div>`:nothing}
   <div class="nw-stats" style="--n:4"><div><span>Fumées</span><b>${deg(s.fumees)}</b></div>
    ${s.prise?html`<div><span>Prise</span><b>${watts(s.prise_w)}</b></div>`:html`<div><span>Alarme</span><b>${s.alarme?s.alarme_texte??'oui':'aucune'}</b></div>`}
    <div><span>Stock</span><b>${g?.stock_sacs!=null?`${num(g.stock_sacs,0)} sacs`:'—'}</b></div>
    <div><span>Ordres du jour</span><b>${s.ecritures!=null?`${s.ecritures}${s.ecritures_max?` / ${s.ecritures_max}`:''}`:'—'}</b></div></div>`;
 }

 /* 3 · Une pièce, longue ou courte */
 private _room(v:View){
  const r=v.pieces.find(x=>x.id===this._config.piece)??v.pieces[0];
  if(!r)return html`<div class="head"><h2 class="nw-title">${this._config.name||'Pièce'}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;
  const name=this._config.name||r.nom;
  if(this._config.court)return html`<div class="short" role="button" tabindex="0" @click=${()=>this._open('pieces/'+r.id)}>
    <div class="temp">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div><div><b>${name}</b><span class="nw-say">${r.raison??(r.consigne!=null?`Consigne ${deg(r.consigne)}`:'')}</span></div>${this._chip(r.badge)}</div>`;
  const d=this._day,slope=r.pente!=null&&Math.abs(r.pente)>=.05?`${r.pente>0?'↗':'↘'} ${r.pente>0?'+':''}${num(r.pente)} °C par heure`:null;
  return html`<div class="head"><h2 class="nw-title">${name}</h2>${this._chip(r.badge)}${this._info('pieces/'+r.id,'Ouvrir la page de la pièce')}</div>
   <div class="reading"><div><div class="temp">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div>${slope?html`<div class="slope">${slope}</div>`:nothing}</div>
    ${r.consigne!=null?html`<div class="target"><span class="nw-label">Consigne</span><b>${deg(r.consigne)}</b><span class="nw-say">${r.planning??''}${r.prochain?` jusqu’à ${when(r.prochain.a)}`:''}</span></div>`:nothing}</div>
   ${r.demande_pct!=null&&!r.poele?html`<div class="nw-panel"><div class="flame-row"><span class="nw-label">Demande du thermostat</span><b>${r.demande_pct} %</b></div>
    <div class="bar"><i style=${`width:${r.demande_pct}%`}></i></div><div class="nw-say">${r.raison??''}</div></div>`:r.raison?html`<div class="nw-say">${r.raison}</div>`:nothing}
   ${d&&d.series.temperature?.length?html`${chart([{pts:d.series.temperature,cls:'temp'},{pts:d.series.consigne??[],cls:'target',step:true}],d.maintenant_min,`Température et consigne de ${r.nom} aujourd’hui`)}
    <div class="nw-legend"><span><i class="sw temp"></i>température</span><span><i class="sw target"></i>consigne</span></div>`:nothing}`;
 }

 /* 4 · Le planning */
 private _planning(v:View){
  const p=v.planning,now=p.maintenant_min/14.4,next=p.prochains;
  const head=html`<div class="head"><h2 class="nw-title">${this._config.name||'Planning du jour'}</h2><span class="nw-chip calm">${p.jour_nom}</span>${this._info('planning','Ouvrir la page du planning')}</div>`;
  if(!p.lignes.length)return html`${head}<p class="empty">Aucun créneau pour l’instant : ils se règlent dans l’onglet Chauffage, page Planning.</p>`;
  const tones=[...new Set(p.lignes.flatMap(l=>l.segments.map(s=>s.ton)))];
  return html`${head}<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(h=>html`<span style=${`left:${h/24*100}%`}>${h} h</span>`)}</div></div>
   ${p.lignes.map(l=>html`<div class="lane"><span class="n">${l.nom}${l.source?html`<small class=${l.bloque?'bad':''}>${l.source}${l.bloque?' · deux plannings':''}</small>`:nothing}</span><div class="track" role="img" aria-label=${l.nom}>${l.segments.map(s=>html`<i class=${'t-'+s.ton} style=${`left:${s.de/14.4}%;width:${(s.a-s.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${now}%`}></span></div></div>`)}</div>
   <div class="nw-legend">${tones.map(t=>html`<span><i class=${'sw t-'+t}></i>${LANE_WORD[t]??t}</span>`)}</div>
   <div class="nw-stats"><div><span>Prochain changement</span><b>${next[0]?`${when(next[0].a)} · ${next[0].texte}`:'—'}</b></div>
    <div><span>Ensuite</span><b>${next[1]?`${when(next[1].a)} · ${next[1].texte}`:'—'}</b></div><div><span>Réglé par</span><b>${p.source??'—'}</b></div></div>
   ${p.labo||p.essai?html`<p class="note">${p.labo?'Thermostats recopiés d’une autre maison : les plannings Hestia ne leur envoient rien.':'Un planning Hestia est en essai : il montre ce qu’il ferait, sans rien envoyer.'}</p>`:nothing}`;
 }
}

if(!customElements.get('hestia-heating-card'))customElements.define('hestia-heating-card',HestiaHeatingCard);
const w=window as unknown as {customCards?:unknown[]};
w.customCards=w.customCards??[];
if(!w.customCards.some(c=>(c as {type?:string}).type==='hestia-heating-card'))
 w.customCards.push({type:'hestia-heating-card',name:'Hestia Chauffage',description:'Le chauffage de la maison : qui chauffe, chaque pièce, le poêle, le planning.',preview:true});

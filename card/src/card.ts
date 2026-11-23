import {LitElement,html,svg,nothing,unsafeCSS,type TemplateResult} from 'lit';
import charte from './ui/hestia-charte.css';
import heating from './heating.css';
import './editor';
import {follow,type Connection} from './stream';

/* Hestia Chauffage's card, after the cards' mock-up validated by Frank on 20 Nov. 2026:
   1 · la maison: the house in one sentence, every room, the night's cold (card: maison, by default)
   2 · le poêle: its flame, its day, its smoke, the plug, the pellets (card: poele)
   3 · une pièce: its temperature, its set point, its demand, its day, its modes (card: piece, piece: <id>), or one line
       (court: true). A tap on it opens its thermostat (tap_action: page, the room's page in the tab; none, nothing)
   4 · le planning: the day of each room and of the stove, from the planning Hestia or Scheduler (card: planning)
   Every figure comes from the integration (hestia_heating/subscribe, day): the card only puts it into words. */

type Hass={callWS:<T>(msg:Record<string,unknown>)=>Promise<T>;callService:(domain:string,service:string,data:Record<string,unknown>)=>Promise<unknown>;
 connection:Connection;themes?:{darkMode?:boolean}};
type Badge={texte:string;ton:string};
type Room={id:string;nom:string;temperature:number|null;consigne:number|null;etat:string;poele:boolean;demande_pct:number|null;puissance_w:number;
 pente:number|null;fenetre:boolean;badge:Badge;raison:string|null;planning:string|null;prochain:{a:string;texte:string}|null;type:string|null;
 principal:string|null;preset:string|null;modes?:string[];recopie?:boolean};
type Stove={nom:string;etat:string;en_feu:boolean;depuis:string|null;flamme:number|null;flamme_reglee:number|null;flamme_max:number;fumees:number|null;
 prise:string|null;prise_w:number|null;demande_pct:number|null;ecritures:number|null;ecritures_max:number|null;alarme:boolean|null;alarme_texte:string|null};
type Pellets={stock_sacs:number|null;stock_kg:number|null;jours:number|null};
type Lane={id:string;nom:string;segments:{de:number;a:number;ton:string}[];source?:string|null;bloque?:boolean};
type Planning={source:string|null;jour_nom:string;labo?:boolean;essai?:boolean;maintenant_min:number;lignes:Lane[];
 prochains:{a:string;heure:string;texte:string}[]};
type View={pret:boolean;maison:{etat:string;titre:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number};
 pieces:Room[];poele:Stove|null;granules:Pellets|null;dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning};
type Day={maintenant_min:number;series:Record<string,[number,number|null][]>};
type Config={type:string;card?:string;piece?:string;court?:boolean;name?:string;tap_action?:string};
const CARDS=['maison','poele','piece','planning'];
/** A tap on a room's card: its thermostat (Home Assistant's own window, by default), its page in the tab, or nothing. */
export const TAPS=['thermostat','page','none'];

const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
const watts=(w:number|null|undefined)=>w==null?'—':w>=500?`${num(w/1000)} kW`:`${num(w,0)} W`;
const hm=(d:Date)=>d.getMinutes()?`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`:`${d.getHours()} h`;
const DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function when(iso:string){const d=new Date(iso),now=new Date(),t=new Date(now);t.setDate(t.getDate()+1);
 if(d.toDateString()===now.toDateString())return hm(d);if(d.toDateString()===t.toDateString())return `demain ${hm(d)}`;return `${DAYS[d.getDay()]} ${hm(d)}`;}
const STOVE_WORD:Record<string,string>={eteint:'éteint',allumage:'allumage',chauffe:'chauffe',nettoyage:'nettoyage',extinction:'extinction',alarme:'alarme',inconnu:'inconnu'};
const LANE_WORD:Record<string,string>={poele:'poêle en chauffe',confort:'confort',eco:'éco',hors_gel:'hors gel',boost:'boost',arret:'arrêt'};
/* A room's modes, as its thermostat names them (Versatile Thermostat's presets first), in this order, and their colour. */
const MODE_WORD:Record<string,string>={frost:'Hors gel',eco:'Éco',comfort:'Confort',boost:'Boost',away:'Absent',sleep:'Nuit',home:'Présent',activity:'Activité'};
const MODE_TONE:Record<string,string>={frost:'off',eco:'cold',comfort:'heat',boost:'act',away:'off',sleep:'cold',home:'heat',activity:'act'};
const ORDER=Object.keys(MODE_WORD);
const modeRank=(m:string)=>{const i=ORDER.indexOf(m);return i<0?ORDER.length:i;};
// A mode pressed shows as chosen until the thermostat says so, at most this long.
const PENDING_MS=10_000;

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
function paths(points:[number,number|null][],lo:number,hi:number,step=false,end?:number,band?:number){
 const x=(m:number)=>(m/1440*W).toFixed(1),y=(v:number)=>(band?H-(v-lo)/(hi-lo||1)*band:H-6-(v-lo)/(hi-lo||1)*(H-12)).toFixed(1);
 const line=(run:[number,number][])=>run.map(([m,v],i)=>i===0?`M${x(m)} ${y(v)}`:step?`H${x(m)}V${y(v)}`:`L${x(m)} ${y(v)}`).join('');
 const all=runs(points,end);
 return {line:all.map(line).join(''),area:all.map(r=>`M${x(r[0][0])} ${H}`+line(r).replace(/^M/,'L')+`V${H}Z`).join('')};
}
/* `band`: a series drawn low in the chart, on that many pixels (a thermostat's demand, under the temperature). */
function chart(lines:{pts:[number,number|null][];cls:string;step?:boolean;fill?:boolean;lo?:number;hi?:number;band?:number}[],now:number,label:string):TemplateResult{
 const vals=lines.filter(l=>l.lo==null).flatMap(l=>l.pts.map(p=>p[1])).filter((x):x is number=>x!=null);
 const lo=vals.length?Math.floor(Math.min(...vals)-.5):15,hi=vals.length?Math.ceil(Math.max(...vals)+.5):22;
 return html`<svg class="chart" viewBox="0 0 ${W} ${H+14}" role="img" aria-label=${label}>
  ${[0,360,720,1080].map(m=>svg`<line class="grid" x1=${m/1440*W} x2=${m/1440*W} y1="0" y2=${H}></line><text x=${m/1440*W+2} y=${H+12}>${m/60} h</text>`)}
  ${lines.map(l=>{const p=paths(l.pts,l.lo??lo,l.hi??hi,l.step,now,l.band);
   return p.line?svg`${l.fill?svg`<path class=${l.cls+' area'} d=${p.area}></path>`:nothing}<path class=${l.cls} d=${p.line}></path>`:nothing;})}
  <line class="now" x1=${now/1440*W} x2=${now/1440*W} y1="0" y2=${H}></line></svg>`;
}

class HestiaHeatingCard extends LitElement {
 static styles=[unsafeCSS(charte),unsafeCSS(heating)];
 static properties={_view:{state:true},_day:{state:true},_error:{state:true},_pending:{state:true},_refused:{state:true}};
 declare _view?:View;declare _day?:Day;declare _error?:string;
 /** The mode just pressed, until the thermostat says it; what went wrong with the last press. */
 declare _pending?:{id:string;mode:string;at:number};declare _refused?:string;
 private _hass?:Hass;private _config:Config={type:'custom:hestia-heating-card',card:'maison'};private _stop?:()=>void;private _again?:number;
 private _dayAt=0;private _dayFor='';

 static getStubConfig(){return {card:'maison'};}
 static getConfigElement(){return document.createElement('hestia-heating-card-editor');}
 setConfig(config:Config){
  const card=config.card??'maison';
  if(!CARDS.includes(card))throw new Error(`card: ${card} ? (${CARDS.join(', ')})`);
  if(config.tap_action!=null&&!TAPS.includes(config.tap_action))throw new Error(`tap_action: ${config.tap_action} ? (${TAPS.join(', ')})`);
  this._config={...config,card};
 }
 getCardSize(){const c=this._config.card;return c==='piece'&&this._config.court?2:c==='planning'||c==='piece'?6:5;}
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
  if(c==='piece'){
   const r=this._roomOf(v),tap=r&&this._tapAction(r);
   return html`<ha-card class=${tap?'tap':''} @click=${tap?(e:MouseEvent)=>this._tap(e,r!):nothing}>${this._room(v)}</ha-card>`;
  }
  return html`<ha-card>${c==='poele'?this._stove(v):c==='planning'?this._planning(v):this._house(v)}</ha-card>`;
 }

 /* A room's card: a tap opens its thermostat, its page in the tab, or nothing (the card's settings, « Clic sur la
    carte »). A press on a mode or on « i » is not a tap on the card. */
 private _roomOf(v:View){return v.pieces.find(x=>x.id===this._config.piece)??v.pieces[0];}
 private _tapAction(r:Room){const t=this._config.tap_action??'thermostat';return t==='thermostat'&&!r.principal?'page':t==='none'?'':t;}
 private _tap(e:Event,r:Room){
  if(e.composedPath().some(n=>n instanceof HTMLElement&&n!==e.currentTarget&&(n.tagName==='BUTTON'||n.tagName==='A')))return;
  const t=this._tapAction(r);
  if(t==='thermostat')this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:r.principal},bubbles:true,composed:true}));
  else if(t==='page')this._open('pieces/'+r.id);
 }
 private _key(e:KeyboardEvent,r:Room){if(e.key==='Enter'||e.key===' '){e.preventDefault();this._tap(e,r);}}

 /* A room's modes: the thermostat's own presets. The press is the user's, sent from this browser as Home Assistant's
    own thermostat card does; never to a thermostat copied from another house (a lab), where it would reach that
    house. */
 private _modes(r:Room){
  const modes=[...(r.modes??[])].filter(m=>m!=='none').sort((a,b)=>modeRank(a)-modeRank(b));
  if(!modes.length||!r.principal)return nothing;
  const p=this._pending,pending=p&&p.id===r.principal&&Date.now()-p.at<PENDING_MS&&r.preset!==p.mode?p.mode:null,on=pending??r.preset;
  const locked=!!r.recopie;
  // A press here, even on a greyed button, is never a tap on the card.
  return html`<div class="modes" role="group" aria-label="Mode du thermostat" style=${`--n:${Math.min(modes.length,4)}`} @click=${(e:Event)=>e.stopPropagation()}>
   ${modes.map(m=>html`<button type="button" class=${'mode '+(MODE_TONE[m]??'heat')+(m===on?' on':'')} aria-pressed=${m===on} ?disabled=${locked}
     title=${locked?'Thermostat recopié d’une autre maison : rien ne lui est envoyé.':''} @click=${()=>this._setMode(r,m)}>${MODE_WORD[m]??m}</button>`)}</div>
   ${locked?html`<p class="note">Thermostat recopié d’une autre maison : les modes se choisissent là-bas.</p>`:this._refused?html`<p class="note bad">${this._refused}</p>`:nothing}`;
 }
 private async _setMode(r:Room,mode:string){
  if(!this._hass||!r.principal||r.recopie||mode===r.preset)return;
  this._pending={id:r.principal,mode,at:Date.now()};this._refused=undefined;
  window.setTimeout(()=>{if(this._pending?.at&&Date.now()-this._pending.at>=PENDING_MS)this._pending=undefined;},PENDING_MS+50);
  try{await this._hass.callService('climate','set_preset_mode',{entity_id:r.principal,preset_mode:mode});}
  catch(e){this._pending=undefined;this._refused=`Le thermostat n’a pas pris « ${MODE_WORD[mode]??mode} » : ${(e as {message?:string}).message??'pas de réponse'}.`;}
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
  const r=this._roomOf(v);
  if(!r)return html`<div class="head"><h2 class="nw-title">${this._config.name||'Pièce'}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;
  const name=this._config.name||r.nom,tap=this._tapAction(r);
  const what=tap==='thermostat'?`Ouvrir le thermostat de ${r.nom}`:`Ouvrir la page de ${r.nom}`;
  if(this._config.court)return html`<div class="short" role=${tap?'button':nothing} tabindex=${tap?0:nothing} aria-label=${tap?what:nothing}
    @keydown=${tap?(e:KeyboardEvent)=>this._key(e,r):nothing}>
    <div class="temp">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div><div><b>${name}</b><span class="nw-say">${r.raison??(r.consigne!=null?`Consigne ${deg(r.consigne)}`:'')}</span></div>${this._chip(r.badge)}</div>`;
  const d=this._day,slope=r.pente!=null&&Math.abs(r.pente)>=.05?`${r.pente>0?'↗':'↘'} ${r.pente>0?'+':''}${num(r.pente)} °C par heure`:null;
  return html`<div class="head"><h2 class="nw-title">${name}</h2>${this._chip(r.badge)}${this._info('pieces/'+r.id,'Ouvrir la page de la pièce')}</div>
   <div class="reading"><div role=${tap?'button':nothing} tabindex=${tap?0:nothing} aria-label=${tap?what:nothing} @keydown=${tap?(e:KeyboardEvent)=>this._key(e,r):nothing}><div class="temp">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div>${slope?html`<div class="slope">${slope}</div>`:nothing}</div>
    ${r.consigne!=null?html`<div class="target"><span class="nw-label">Consigne</span><b>${deg(r.consigne)}</b><span class="nw-say">${r.planning??''}${r.prochain?` jusqu’à ${when(r.prochain.a)}`:''}</span></div>`:nothing}</div>
   ${r.demande_pct!=null&&!r.poele?html`<div class="nw-panel"><div class="flame-row"><span class="nw-label">Demande du thermostat</span><b>${r.demande_pct} %</b></div>
    <div class="bar"><i style=${`width:${r.demande_pct}%`}></i></div><div class="nw-say">${r.raison??''}</div></div>`:r.raison?html`<div class="nw-say">${r.raison}</div>`:nothing}
   ${d&&d.series.temperature?.length?this._roomDay(r,d):nothing}
   ${this._modes(r)}`;
 }
 /** The room's day: its temperature (and its area), its set point in steps, and low in the chart when its thermostat
     heated (its demand, 0 to 100 %). */
 private _roomDay(r:Room,d:Day){
  const demand=(d.series.demande??[]).some(p=>(p[1]??0)>0)&&!r.poele;
  return html`${chart([...(demand?[{pts:d.series.demande,cls:'demand',step:true,fill:true,lo:0,hi:100,band:18}]:[]),
    {pts:d.series.temperature,cls:'temp',fill:true},{pts:d.series.consigne??[],cls:'target',step:true}],d.maintenant_min,`Température et consigne de ${r.nom} aujourd’hui`)}
   <div class="nw-legend"><span><i class="sw temp"></i>température</span><span><i class="sw target"></i>consigne</span>${demand?html`<span><i class="sw demand"></i>chauffe</span>`:nothing}</div>`;
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

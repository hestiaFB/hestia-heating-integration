import {LitElement,html,svg,nothing,unsafeCSS,type TemplateResult} from 'lit';
import charte from './ui/hestia-charte.css';
import heating from './heating.css';
import './editor';
import {follow,type Connection} from './stream';
import {wheel,hours,center,heaterArt,stoveArt,sample,TRACE_MIN,type Pt,type Mark,type Hour,type Detail,type Span} from './clock';

/* Hestia Chauffage's card, after the cards' mock-up validated by Frank on 20 Nov. 2026, and the clock of 24 Nov. 2026:
   1 · la maison: the house in one sentence, every room, the night's cold (card: maison, by default)
   2 · le poêle: its clock (the planning, the room's temperature, the flame), what Hestia does, its buttons, the fire
       and its settings, then the pellets, the money and the upkeep in a drawer (card: poele)
   3 · une pièce: its clock (the planning, its temperature, its heating), whether it heats, its modes, then the money,
       the use and the comfort in a drawer (card: piece, piece: <id>), or one line (court: true). A tap on it opens its
       thermostat (tap_action: page, the room's page in the tab; none, nothing)
   4 · le planning: the day of each room and of the stove, from the planning Hestia or Scheduler (card: planning)
   The stove's and a room's cards also come compact (compacte: true, 1.0): the clock small, beside its sentence, without
   its legend; about half the height.
   Every figure comes from the integration (hestia_heating/subscribe, day, historique): the card only puts it into
   words. Its buttons are the user's own presses, sent from this browser as Home Assistant's own cards do, and never
   to a thermostat or a stove copied from another house (a lab), where they would reach that house. */

type Hass={callWS:<T>(msg:Record<string,unknown>)=>Promise<T>;callService:(domain:string,service:string,data:Record<string,unknown>)=>Promise<unknown>;
 connection:Connection;themes?:{darkMode?:boolean}};
type Badge={texte:string;ton:string};
type Next={a:string;texte:string;ton?:string|null};
type Room={id:string;nom:string;temperature:number|null;consigne:number|null;etat:string;poele:boolean;demande_pct:number|null;puissance_w:number;
 pente:number|null;fenetre:boolean;fenetre_depuis?:string|null;humidite?:number|null;badge:Badge;raison:string|null;planning:string|null;
 prochain:Next|null;type:string|null;principal:string|null;preset:string|null;modes?:string[];recopie?:boolean;appoint?:number|null};
type Order={service:string;entity_id:string;donnees?:Record<string,unknown>};
type FirePot={kg:number|null;seuil_kg:number;a_nettoyer:boolean;bientot?:boolean;texte:string;jours?:number|null};
type Use={debit_kg_h:number;kg_jour:number;kg_saison:number;prix_kg:number|null;cout_jour:number|null;cout_heure:number|null;brasier?:FirePot};
type Stove={nom:string;modele?:string|null;etat:string;en_feu:boolean;depuis:string|null;flamme:number|null;flamme_reglee:number|null;flamme_max:number;
 fumees:number|null;prise:string|null;prise_w:number|null;demande_pct:number|null;consigne?:number|null;ecritures:number|null;ecritures_max:number|null;
 alarme:boolean|null;alarme_texte:string|null;allume?:boolean|null;conso?:Use;pilote?:{mode:string;titre?:string;texte?:string;flamme?:number|null;flamme_manuelle?:boolean};
 boutons?:{allumer?:Order;eteindre?:Order};ventilation?:string|null;copie?:boolean;entites?:Record<string,string>;
 flamme_min?:number;ventilation_niveaux?:string[];ventilation_choix?:string;eco_stop?:boolean|null;eco_stop_delai?:number|null;consigne_poele?:number|null;air?:number|null;
 flamme_basse?:{entity_id:string;nom:string;on:boolean|null}|null;prise_switch?:{entity_id:string;on:boolean|null}|null;
 phrase?:{texte:string;ton:string}};
/** Hestia sets the flame (« Flamme : Automatique », 1.0.0b3). */
const flameByHestia=(s:Stove)=>s.pilote?.mode==='flamme'||s.pilote?.mode==='entier'&&!s.pilote.flamme_manuelle;
type Pellets={stock_sacs:number|null;stock_kg:number|null;jours:number|null;kg_par_jour?:number|null};
type Lane={id:string;nom:string;segments:{de:number;a:number;ton:string}[];source?:string|null;bloque?:boolean};
type Planning={source:string|null;jour?:string;jour_nom:string;labo?:boolean;essai?:boolean;maintenant_min:number;lignes:Lane[];
 prochains:{a:string;heure:string;texte:string}[]};
type View={pret:boolean;maison:{etat:string;titre:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number};
 pieces:Room[];poele:Stove|null;granules:Pellets|null;dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning;prix_kwh?:number|null};
/** The clock's day: the last 24 hours, in minutes from `debut_min` (a minute of the day); each hour's kWh or kilos
    (0.8.0b3), by the minute its hour starts. */
type Day={maintenant_min:number;debut_min?:number;fenetre_min?:number;series:Record<string,Pt[]>;
 energie?:{unite:string|null;heures:[number,number][]}};
/** The drawers' days: a room's kWh or the stove's kilos, per day, the oldest first; today is the day so far. */
type History={unite:string|null;stat:string|null;aujourdhui:string;jours:{jour:string;valeur:number|null}[];mois:number|null};
type Config={type:string;card?:string;piece?:string;court?:boolean;compacte?:boolean;name?:string;tap_action?:string};
const CARDS=['maison','poele','piece','planning'];
/** A tap on a room's card: its thermostat (Home Assistant's own window, by default), its page in the tab, or nothing. */
export const TAPS=['thermostat','page','none'];

const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
const watts=(w:number|null|undefined)=>w==null?'—':w>=500?`${num(w/1000)} kW`:`${num(w,0)} W`;
const eur=(v:number)=>v>=100?`${num(v,0)} €`:`${v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
const cap=(t:string)=>t?t[0].toUpperCase()+t.slice(1):t;
const hm=(d:Date)=>d.getMinutes()?`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`:`${d.getHours()} h`;
const DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
const DAY_SHORT=['di','lu','ma','me','je','ve','sa'];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function when(iso:string){const d=new Date(iso),now=new Date(),t=new Date(now);t.setDate(t.getDate()+1);
 if(d.toDateString()===now.toDateString())return hm(d);if(d.toDateString()===t.toDateString())return `demain ${hm(d)}`;return `${DAYS[d.getDay()]} ${hm(d)}`;}
/* A time the integration gives in the house's own time zone, read as it is written (the browser may be elsewhere). */
const isoMinute=(iso:string)=>+iso.slice(11,13)*60+ +iso.slice(14,16);
const isoHm=(iso:string)=>{const m=isoMinute(iso);return m%60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`:`${m/60} h`;};
const isoWhen=(iso:string,today?:string)=>!today||iso.slice(0,10)===today?isoHm(iso):`demain ${isoHm(iso)}`;
const dateOf=(day:string)=>{const [y,m,d]=day.split('-').map(Number);return new Date(y,m-1,d);};
const STOVE_WORD:Record<string,string>={eteint:'éteint',allumage:'allumage',chauffe:'chauffe',nettoyage:'nettoyage',extinction:'extinction',alarme:'alarme',inconnu:'inconnu'};
const LANE_WORD:Record<string,string>={poele:'poêle en chauffe',confort:'confort',eco:'éco',hors_gel:'hors gel',boost:'boost',arret:'arrêt'};
/* The planning's word for an hour to come, in the middle of the clock. */
const AHEAD_WORD:Record<string,string>={poele:'En chauffe',confort:'Confort',eco:'Éco',hors_gel:'Hors gel',boost:'Boost',arret:'Arrêt'};
const TYPE_WORD:Record<string,string>={radiateur:'Radiateur électrique',vanne:'Radiateur à eau',clim:'Climatisation',pac:'Pompe à chaleur',
 poele:'Poêle',autre:'Chauffage'};
/* A room's modes, as its thermostat names them (Versatile Thermostat's presets first), in this order, and their colour. */
const MODE_WORD:Record<string,string>={frost:'Hors gel',eco:'Éco',comfort:'Confort',boost:'Boost',away:'Absent',sleep:'Nuit',home:'Présent',activity:'Activité'};
const MODE_TONE:Record<string,string>={frost:'off',eco:'cold',comfort:'heat',boost:'act',away:'off',sleep:'cold',home:'heat',activity:'act'};
const ORDER=Object.keys(MODE_WORD);
const modeRank=(m:string)=>{const i=ORDER.indexOf(m);return i<0?ORDER.length:i;};
// A mode pressed shows as chosen until the thermostat says so, at most this long.
const PENDING_MS=10_000;
// A press that cannot be taken back (the stove on or off, « J’ai nettoyé ») asks again, this long.
const CONFIRM_MS=5_000;
// One kilo of pellets gives 4.176 kWh (engine/granules.py): the same heat, bought as electricity.
const KWH_PER_KG=4.176;
const HISTORY_MS=600_000;

const GEAR=svg`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
const CHEVRON=svg`<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>`;
const WAVES=svg`<svg class="wv" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M8 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M12 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2"></path></svg>`;
const POWER=svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"></path></svg>`;
const BRUSH=svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l6 6M17 7l-6 6M5 21l4.5-1.5 4-4-3-3-4 4z"></path></svg>`;
const CLOCK=svg`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`;
const RELAY=svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v10M8 7v10M12 7v10M16 7v10M20 7v10M2 19h20M2 5h20"></path></svg>`;

class HestiaHeatingCard extends LitElement {
 static styles=[unsafeCSS(charte),unsafeCSS(heating)];
 static properties={_view:{state:true},_day:{state:true},_hist:{state:true},_error:{state:true},_pending:{state:true},_refused:{state:true},
  _drawers:{state:true},_tabs:{state:true},_confirm:{state:true},_busy:{state:true},_hover:{state:true},_pin:{state:true}};
 declare _view?:View;declare _day?:Day;declare _hist?:History;declare _error?:string;
 /** The mode just pressed, until the thermostat says it; what went wrong with the last press. */
 declare _pending?:{id:string;mode:string;at:number};declare _refused?:string;
 /** The drawers opened or closed and the tab shown in each (this card only), the press waiting for its second tap,
     the press being sent. */
 declare _drawers:Record<string,boolean>;declare _tabs:Record<string,string>;declare _confirm?:string;declare _busy?:string;
 /** The clock's hour under the pointer (or the keyboard's focus), the one pinned by a tap, the last one shown. */
 declare _hover?:number;declare _pin?:number;private _last?:number;
 private _hass?:Hass;private _config:Config={type:'custom:hestia-heating-card',card:'maison'};private _stop?:()=>void;private _again?:number;
 private _dayAt=0;private _dayFor='';private _histAt=0;private _histFor='';
 constructor(){super();this._drawers={};this._tabs={};}

 static getStubConfig(){return {card:'maison'};}
 static getConfigElement(){return document.createElement('hestia-heating-card-editor');}
 setConfig(config:Config){
  const card=config.card??'maison';
  if(!CARDS.includes(card))throw new Error(`card: ${card} ? (${CARDS.join(', ')})`);
  if(config.tap_action!=null&&!TAPS.includes(config.tap_action))throw new Error(`tap_action: ${config.tap_action} ? (${TAPS.join(', ')})`);
  this._config={...config,card};
 }
 getCardSize(){const c=this._config.card,small=!!this._config.compacte;
  return c==='piece'&&this._config.court?2:c==='piece'?small?6:11:c==='poele'?small?7:13:c==='planning'?6:5;}
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
 /** The clock's last 24 hours (stove, room): asked when the card shows, then every two minutes at most; the drawers'
     days every ten minutes at most. */
 private _maybeDay(){
  const c=this._config,v=this._view,room=c.card==='piece'&&!c.court&&v?this._roomOf(v):undefined;
  const target=c.card==='poele'?'poele':room?`piece/${room.id}`:'';
  if(!target||!this._hass)return;
  // Another room or the stove: never show the last one's day in the meantime.
  if(target!==this._dayFor){this._day=undefined;this._hover=this._pin=undefined;}
  if(target!==this._histFor)this._hist=undefined;
  if(target!==this._dayFor||Date.now()-this._dayAt>=120_000){
   this._dayFor=target;this._dayAt=Date.now();
   this._hass.callWS<Day>({type:'hestia_heating/day',cible:target,heures:24}).then(d=>{this._day=d;}).catch(()=>{/* no recorder: no curve */});
  }
  if(target!==this._histFor||Date.now()-this._histAt>=HISTORY_MS){
   this._histFor=target;this._histAt=Date.now();
   this._hass.callWS<History>({type:'hestia_heating/historique',cible:target}).then(h=>{this._hist=h;}).catch(()=>{/* no statistics: no days */});
  }
 }
 private _open(path:string){history.pushState(null,'','/hestia/chauffage'+(path?'/'+path:''));window.dispatchEvent(new CustomEvent('location-changed',{bubbles:true,composed:true}));}
 private _info(path:string,label:string){return html`<button class="nw-info" aria-label=${label} @click=${()=>this._open(path)}></button>`;}
 private _chip(b:Badge){return html`<span class=${'nw-chip '+b.ton}>${b.texte}</span>`;}
 private _more(entityId:string){this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId},bubbles:true,composed:true}));}

 render(){
  const v=this._view;
  if(this._error)return html`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;
  if(!v||!v.pret)return html`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;
  const c=this._config.card;
  if(c==='piece'){
   const r=this._roomOf(v),tap=r&&this._tapAction(r),clock=r&&!this._config.court;
   return html`<ha-card class=${(tap?'tap ':'')+(clock?'clock':'')} @click=${tap?(e:MouseEvent)=>this._tap(e,r!):nothing}>${this._room(v)}</ha-card>`;
  }
  if(c==='poele')return html`<ha-card class=${v.poele?'clock':''}>${this._stove(v)}</ha-card>`;
  return html`<ha-card>${c==='planning'?this._planning(v):this._house(v)}</ha-card>`;
 }

 /* The clock cards' pieces: the head (name, what heats, two pills, the settings' button), a drawer, its tabs, a press
    that asks again before it is sent. */
 private _head(title:string,sub:unknown,pills:unknown,path:string,label:string){
  return html`<div class="chead"><div class="ttl"><h2 class="nw-title">${title}</h2>${sub?html`<div class="sub">${sub}</div>`:nothing}</div>
   <div class="pills">${pills}</div>
   <button class="gear" aria-label=${label} title="Réglages" @click=${()=>this._open(path)}>${GEAR}</button></div>`;
 }
 private _drawer(key:string,title:string,say:string,byDefault:boolean,body:()=>unknown,cls=''){
  const open=this._drawers[key]??byDefault;
  // A press in a drawer is never a tap on the card.
  return html`<div class=${'dbox '+cls} @click=${(e:Event)=>e.stopPropagation()}>
   <button class="drawer" aria-expanded=${open?'true':'false'} @click=${()=>{this._drawers={...this._drawers,[key]:!open};}}>
    <span class="dt">${title}${say?html`<span class="ds">${say}</span>`:nothing}</span>${CHEVRON}</button>
   ${open?html`<div class="dbody">${body()}</div>`:nothing}</div>`;
 }
 private _tabbar(key:string,tabs:[string,string][],label:string){
  const on=this._tab(key,tabs);
  return html`<div class="tabs" role="tablist" aria-label=${label}>${tabs.map(([id,l])=>html`<button class="tab" role="tab"
   aria-selected=${id===on?'true':'false'} @click=${()=>{this._tabs={...this._tabs,[key]:id};}}>${l}</button>`)}</div>`;
 }
 private _tab(key:string,tabs:[string,string][]){const t=this._tabs[key];return tabs.some(x=>x[0]===t)?t:tabs[0][0];}
 private async _press(key:string,run:()=>Promise<unknown>,confirm=false){
  if(confirm&&this._confirm!==key){
   this._confirm=key;
   window.setTimeout(()=>{if(this._confirm===key)this._confirm=undefined;},CONFIRM_MS);
   return;
  }
  this._confirm=undefined;this._busy=key;this._refused=undefined;
  try{await run();}
  catch(e){this._refused=`Ce n’est pas passé : ${(e as {message?:string}).message??'pas de réponse'}.`;}
  finally{this._busy=undefined;}
 }
 private _service(o:Order){
  const [domain,service]=o.service.split('.');
  return this._hass!.callService(domain,service,{...(o.donnees??{}),entity_id:o.entity_id});
 }
 private _toSettings(){return html`<button class="link" @click=${()=>this._open('reglages')}>Ouvrir les réglages</button>`;}

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

 /* The clock's window (the last 24 hours, cached two minutes): where its minutes start, its length, now, its series.
    Until it is read, an empty day that ends now. */
 private _window(v:View):{d?:Day;series:Record<string,Pt[]>;span:Span}{
  const d=this._day,now=v.planning.maintenant_min;
  return {d,series:d?.series??{},span:{start:d?.debut_min??now,length:d?.fenetre_min??1440,now}};
 }
 /** The clock's hover and tap: the hour shown, the one pinned, and what changes them. */
 private _picker(){
  return {pick:this._pin??this._hover,pin:this._pin,last:this._last,
   onHover:(k?:number)=>{if(k!=null)this._last=k;this._hover=k;},onPin:(k?:number)=>{if(k!=null)this._last=k;this._pin=k;}};
 }
 /** An hour's time in the middle: « 11 h – maintenant », « 13 h – 14 h · à venir », « hier, 18 h – 19 h ». */
 private _range(h:Hour){
  const hh=(k:number)=>`${k%24} h`;
  return h.current?`${hh(h.k)} – maintenant`:h.ahead?`${hh(h.k)} – ${hh(h.k+1)} · à venir`:`${h.yesterday?'hier, ':''}${hh(h.k)} – ${hh(h.k+1)}`;
 }
 /** An hour to come: its planning, and yesterday at the same hour. */
 private _ahead(h:Hour,was:string|null):Detail{
  return {range:this._range(h),value:h.ton?AHEAD_WORD[h.ton]??cap(h.ton):'Rien de prévu',word:true,
   lines:[`hier : ${h.temp!=null?`${num(h.temp)}°`:'—'}`,was??''],};
 }
 /** The middle's value and its two first lines that are known, in this order. */
 private _past(h:Hour,lines:(string|null)[]):Detail{
  const kept=lines.filter((x):x is string=>!!x);
  return {range:this._range(h),value:h.temp!=null?`${num(h.temp)}°`:'—',lines:[kept[0]??'',kept[1]??'']};
 }
 private _plan(h:Hour){return h.ton?`${LANE_WORD[h.ton]??h.ton} au planning`:null;}
 /** What comes next, in the house's own time: « confort à 20 h 30 », « éco demain 6 h 30 ». */
 private _next(n:Next,v:View){const w=isoWhen(n.a,v.planning.jour);return `${n.texte} ${w.startsWith('demain')?w:'à '+w}`;}
 private _soon(n:Next|null|undefined){return n&&Date.parse(n.a)-Date.now()<86_400_000?n:null;}
 private _tile(value:string,key:string,unit=''){
  return html`<div class="tile"><b class="v">${value}${unit?html`<small class="u">${unit}</small>`:nothing}</b><span class="k">${key}</span></div>`;
 }
 /** Days as bars, today's last and highlighted; their values under them (up to a week), then the days' letters. */
 private _bars(days:{jour:string;valeur:number|null}[],label:(x:number)=>string,aria:string){
  const max=Math.max(0,...days.map(d=>d.valeur??0)),last=days.length-1;
  return html`<div class="bars" role="img" aria-label=${aria} style=${`--n:${days.length}`}>
   <div class="cols">${days.map((d,i)=>html`<span class=${i===last?'today':''} style=${`height:${max&&d.valeur?Math.max(4,Math.round(d.valeur/max*72)):0}px`}></span>`)}</div>
   ${days.length<=7?html`<div class="vals">${days.map((d,i)=>html`<span class=${i===last?'today':''}>${d.valeur!=null?label(d.valeur):'—'}</span>`)}</div>`:nothing}
   <div class="days">${days.map((d,i)=>html`<span>${i===last?'auj.':DAY_SHORT[dateOf(d.jour).getDay()]}</span>`)}</div></div>`;
 }
 private _dayList(days:{jour:string;valeur:number|null}[],words:(x:number)=>string){
  return days.map(d=>`${DAYS[dateOf(d.jour).getDay()]} ${d.valeur!=null?words(d.valeur):'—'}`).join(', ');
 }

 /* 2 · Le poêle: its clock, what Hestia does, its buttons; the fire and its settings (open); the pellets, the money and
    the upkeep (closed). */
 private _stove(v:View){
  const s=v.poele;
  if(!s)return html`<div class="head"><h2 class="nw-title">${this._config.name||'Poêle'}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;
  const room=v.pieces.find(r=>r.poele),{d,series,span}=this._window(v);
  // « Flamme : Automatique » (1.0.0b3): Hestia sets the flame, in « Flamme » or in « Entier » unless the flame is left
  // to the user there.
  const auto=flameByHestia(s),max=s.flamme_max||5,level=s.en_feu?s.flamme??0:0;
  const lane=v.planning.lignes.find(l=>l.id==='poele'),segments=lane?.segments??[],tones=[...new Set(segments.map(x=>x.ton))];
  const flame=series.flamme??[];
  // The last start within the trace, and the stop the planning has next while the stove burns.
  const lit=this._lastStart(flame,span.length),next=this._soon(room?.prochain);
  // Since 1.0.0b4 the stove's lane says its thermostat's modes: a stop is the next Hors gel or Arrêt.
  const stop=s.en_feu&&next&&(next.ton==='hors_gel'||next.ton==='arret')?next:null;
  const marks:Mark[]=[...(lit!=null?[{at:span.start+lit,cls:'lit'}]:[]),...(stop?[{at:isoMinute(stop.a),cls:'stop'}]:[])];
  const t=room?.temperature??null,where=room?room.nom:'la pièce';
  const state=s.etat==='alarme'?'alarme':s.en_feu&&level?`flamme ${level} sur ${max}`:STOVE_WORD[s.etat]??s.etat;
  const sub=s.etat==='alarme'?'en alarme':s.en_feu?s.consigne!=null?`consigne ${num(s.consigne)}°`:`flamme ${level}`:
   s.etat==='eteint'?'poêle éteint':STOVE_WORD[s.etat]??'';
  // The stove's set point in whole steps (1.0.0b6): over every hour its thermostat held a set point the stove burnt to
  // for a quarter of an hour at least today (Boost's 21,5 °C), not only in the bits it burnt; never its frost guard
  // (14 °C), which says nothing of the room.
  const flames=sample(flame,0,span.length),cons=sample(series.consigne??[],0,span.length);
  const burnt=new Map<number,number>();
  cons.forEach(([,c],i)=>{if(c!=null&&(flames[i][1]??0)>0)burnt.set(c,(burnt.get(c)??0)+1);});
  const sets=cons.map(([m,c],i):Pt=>[m,c!=null&&((flames[i][1]??0)>0||(burnt.get(c)??0)>=3)?c:null]);
  const kg=d?.energie?.unite==='kg'?d.energie.heures:[],price=s.conso?.prix_kg??null;
  const series_={temp:series.temperature??[],heat:flame.map(([m,x]):Pt=>[m,x==null?null:x/max]),level:flame,sets,energy:kg};
  const hrs=hours(span,segments,series_);
  const say=(h:Hour):Detail=>{
   const off=h.burn==null||h.burn<.05;
   if(h.ahead)return this._ahead(h,h.burn==null?null:off?'poêle éteint':`flamme ${num(h.level??0,0)}`);
   const kilos=h.energy!=null?`${num(h.energy,2)} kg${price!=null?` · ${eur(h.energy*price)}`:''}`:null;
   if(off)return this._past(h,['poêle éteint',this._plan(h)]);
   const minutes=Math.round((h.burn??0)*(h.to-h.from)/5)*5;
   return this._past(h,[`flamme ${num(h.level??0,0)}${(h.burn??0)<.95?` · ${minutes} min`:` sur ${max}`}`,kilos,
    h.set!=null?`consigne ${num(h.set)}°`:null,this._plan(h)]);
  };
  const clock=wheel({span,segments,series:series_,hours:hrs,kind:'flame',max,marks,say,...this._picker(),
   label:`Horloge du jour : ${where} à ${deg(t)}, poêle ${state}${stop?`, arrêt prévu à ${isoHm(stop.a)}`:''}.`},
   center(stoveArt(level,max,s.en_feu),t!=null?`${num(t)}°`:'—',sub));
  const why=this._why(s,room,auto,level);
  if(this._config.compacte)return html`<div class="top compact">
   ${this._head(this._config.name||s.nom,s.phrase?html`<span class=${'say '+s.phrase.ton}>${s.phrase.texte}</span>`:
    `Poêle à granulés${s.modele?` · ${s.modele}`:''}`,html`
    <span class=${'pill '+(s.etat==='alarme'?'alert':s.en_feu?'stove':'off')}>${state}</span>`,'poele','Réglages du poêle')}
   <div class="pair">${clock}<div class="side">${why?html`<p class="why">${why}</p>`:nothing}
    <span class=${'pill '+(auto?'calm':'off')}><i class="dot"></i>${auto?'Flamme auto':'Flamme à la main'}</span></div></div>
   ${this._stoveButtons(s,auto)}
  </div>
  ${this._fireDrawer(v,s,room)}
  ${this._pelletDrawer(v,s)}`;
  return html`<div class="top">
   ${this._head(this._config.name||s.nom,s.phrase?html`<span class=${'say '+s.phrase.ton}>${s.phrase.texte}</span>`:
    `Poêle à granulés${s.modele?` · ${s.modele}`:''}`,html`
    <span class=${'pill '+(auto?'calm':'off')}><i class="dot"></i>${auto?'Flamme auto':'Flamme à la main'}</span>
    <span class=${'pill '+(s.etat==='alarme'?'alert':s.en_feu?'stove':'off')}>${state}</span>`,'poele','Réglages du poêle')}
   ${clock}
   <div class="legend">${tones.map(x=>html`<span><i class=${'sw t-'+x}></i>${LANE_WORD[x]??x}</span>`)}
    ${(series.temperature??[]).length?html`<span><i class="sw line"></i>${where.toLowerCase()}</span>`:nothing}
    ${sets.some(p=>p[1]!=null)?html`<span><i class="sw set"></i>consigne</span>`:nothing}
    ${hrs.some(h=>!h.ahead&&(h.heat??0)>=.02)?html`<span><i class="sw ramp flame"></i>flamme</span>`:nothing}
    ${hrs.some(h=>h.ahead&&(h.heat??0)>=.02)?html`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:nothing}
    ${lit!=null?html`<span><i class="sw ring lit"></i>allumage</span>`:nothing}${stop?html`<span><i class="sw ring stop"></i>arrêt prévu</span>`:nothing}</div>
   ${d?html`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:nothing}
   ${why?html`<p class="why">${why}</p>`:nothing}
   ${this._stoveButtons(s,auto)}
  </div>
  ${this._fireDrawer(v,s,room)}
  ${this._pelletDrawer(v,s)}`;
 }
 /** The minute (from the window's start) the stove last lit within the clock's trace; null if it did not, or if it
     burnt since the trace's start. */
 private _lastStart(flame:Pt[],length:number){
  const from=Math.max(0,length-TRACE_MIN);let last:number|null=null,prev=false;
  for(const [m,x] of sample(flame,from,length)){const on=(x??0)>0;if(on&&!prev)last=m;prev=on;}
  return last===from?null:last;
 }
 /* The sentence under the clock: what Hestia does when it drives the stove (« Gestion auto »), else what the stove does. */
 private _why(s:Stove,room:Room|undefined,auto:boolean,level:number){
  if(s.etat==='alarme')return s.phrase?'':`Le poêle est en alarme${s.alarme_texte?` : ${s.alarme_texte}`:''}.`;
  if(auto&&s.pilote?.texte)return s.pilote.texte;
  const since=s.depuis?` depuis ${hm(new Date(s.depuis))}`:'';
  const now=s.en_feu&&level?`Flamme ${level}.${room&&room.temperature!=null?` ${room.nom} : ${deg(room.temperature)}${s.consigne!=null?`, consigne ${deg(s.consigne)}`:''}.`:''}`:
   `${({eteint:'Poêle éteint',allumage:'Le poêle s’allume',chauffe:'En chauffe',nettoyage:'Le poêle se nettoie',extinction:'Le poêle s’éteint'} as Record<string,string>)[s.etat]??'Le poêle ne dit pas son état'}${since}.`;
  return (s.pilote&&!auto?'Flamme à la main : Hestia ne la change pas. ':'')+now;
 }
 /* « Éteindre » or « Allumer » (the profile's own orders), « Flamme auto » (Hestia sets the flame, « Gestion auto »
    before 1.0.0b3), « J’ai nettoyé » (Hestia's count only). The first two and « J’ai nettoyé » ask again before they are
    sent; nothing is sent to a stove copied from another house. */
 private _stoveButtons(s:Stove,auto:boolean){
  const lit=s.allume??(s.en_feu||s.etat==='allumage'),order=s.boutons?.[lit?'eteindre':'allumer'];
  const locked=!!s.copie,pot=s.conso?.brasier,ask=this._confirm,why=locked?'Poêle recopié d’une autre maison : rien ne lui est envoyé.':'';
  return html`<div class="btns" @click=${(e:Event)=>e.stopPropagation()}>
   ${order?html`<button class=${'btn'+(ask==='power'?' ask':'')} ?disabled=${locked||this._busy==='power'} title=${why}
     @click=${()=>this._press('power',()=>this._service(order),true)}>${POWER}${ask==='power'?lit?'Vraiment éteindre ?':'Vraiment allumer ?':lit?'Éteindre':'Allumer'}</button>`:nothing}
   <button class=${'btn auto'+(auto?' on':'')} aria-pressed=${auto?'true':'false'} ?disabled=${locked||this._busy==='auto'} title=${why}
     @click=${()=>this._press('auto',()=>this._hass!.callWS({type:'hestia_heating/gestion_auto',actif:!auto}))}><span class="switch"><i></i></span>Flamme auto</button>
   ${pot?html`<button class=${'btn pot'+(pot.a_nettoyer?' due':pot.bientot?' soon':'')+(ask==='clean'?' ask':'')} ?disabled=${this._busy==='clean'}
     style=${`--fill:${this._potFill(pot)}%`} aria-label=${`${this._potWord(pot)}. J’ai nettoyé le brasier`} title=${pot.texte}
     @click=${()=>this._press('clean',()=>this._hass!.callWS({type:'hestia_heating/brasier_nettoye'}),true)}>${BRUSH}<span class="pot-say"><b>${this._potWord(pot)}</b>
     <small>${ask==='clean'?'Remettre à zéro ?':'J’ai nettoyé'}</small></span></button>`:nothing}
  </div>
  ${locked?html`<p class="note">Poêle recopié d’une autre maison : ses boutons sont grisés, rien ne lui est envoyé.</p>`:this._refused?html`<p class="note bad">${this._refused}</p>`:nothing}`;
 }
 /* The fire pot on the card's face (1.0.0b6): how full it is, and the days left at the pace since its cleaning; the
    button that says it is also « J’ai nettoyé ». */
 private _potFill(pot:FirePot){return pot.a_nettoyer?100:pot.kg!=null&&pot.seuil_kg?Math.max(0,Math.min(100,Math.round(pot.kg/pot.seuil_kg*100))):0;}
 private _potWord(pot:FirePot){
  if(pot.a_nettoyer)return 'Brasier à nettoyer';
  if(pot.kg==null)return 'Brasier pas encore compté';
  const days=pot.jours==null?'':pot.jours<1?' · moins d’un jour':pot.jours<1.5?' · encore 1 jour':` · encore ${num(pot.jours,0)} jours`;
  return `Brasier ${this._potFill(pot)} %${days}`;
 }
 private _fireDrawer(v:View,s:Stove,room:Room|undefined){
  const c=s.conso,rate=s.en_feu&&c?.debit_kg_h?c.debit_kg_h:null,hour=rate&&c?.cout_heure!=null?`${eur(c.cout_heure)} de l’heure`:null;
  const say=[s.fumees!=null?`fumées ${num(s.fumees,0)} °C`:null,rate?`${num(rate,2)} kg/h`:s.en_feu?null:'à l’arrêt',hour].filter(Boolean).join(' · ');
  return this._drawer('feu','Le feu et les réglages',say,!this._config.compacte,()=>{
   const locked=!!s.copie,low=s.flamme_basse,plug=s.prise_switch,next=this._soon(room?.prochain);
   const chips=[
    low?html`<button class=${'chip'+(low.on?' on stove':'')} aria-pressed=${low.on?'true':'false'} ?disabled=${locked||this._busy==='low'} title=${low.nom}
      @click=${()=>this._press('low',()=>this._hass!.callService(low.entity_id.split('.')[0],low.on?'turn_off':'turn_on',{entity_id:low.entity_id}))}><i class="dot"></i>Flamme réduite</button>`:null,
    plug?html`<button class=${'chip'+(plug.on?' on calm':'')} ?disabled=${locked} title="Ouvrir la prise"
      @click=${()=>this._more(plug.entity_id)}><i class="dot"></i>${plug.on?'Prise allumée':plug.on===false?'Prise coupée':'Prise'}</button>`:null,
   ].filter(Boolean);
   const rows=[
    next?html`<div class="row">${CLOCK}<span><b>Planning.</b> ${room?.planning?`${cap(room.planning)} maintenant, puis `:'Ensuite : '}${this._next(next,v)}.</span></div>`:null,
    room?.appoint!=null?html`<div class="row cold">${RELAY}<span><b>Radiateur d’appoint.</b> Réglé à ${deg(room.appoint)} : il prend le relais si le poêle ne suffit pas.</span></div>`:null,
   ].filter(Boolean);
   return html`<div class="tiles">${this._tile(room?.temperature!=null?num(room.temperature):'—',`${room?room.nom.toLowerCase():'pièce'}, °C`,s.consigne!=null?`→ ${num(s.consigne)}`:'')}
     ${this._tile(s.fumees!=null?num(s.fumees,0):'—','fumées','°C')}${this._tile(rate?num(rate,2):'—',hour??'granulés','kg/h')}</div>
    ${this._controls(s)}
    ${chips.length?html`<div class="chips">${chips}</div>`:nothing}${rows.length?html`<div class="rows boxed">${rows}</div>`:nothing}`;
  },'fire');
 }
 /** The stove's settings on its card (1.0.0b3), as in Réglages › Poêle à granulés: the flame (Automatique or a
     power from 1 to 5), the fan (by the stove, by Hestia, or a speed) and the ÉCO Stop. The user presses them: a power
     or a speed goes to the stove at once, as from its app; greyed out on a stove copied from another house. */
 private _controls(s:Stove){
  const locked=!!s.copie,ids=s.entites??{},auto=flameByHestia(s),busy=!!this._busy;
  const lo=s.flamme_min??1,hi=s.flamme_max||5,set=s.flamme_reglee;
  const settings=(reglages:Record<string,unknown>)=>this._hass!.callWS({type:'hestia_heating/set_settings',reglages});
  const power=(n:number)=>this._press('flame',async()=>{
   if(auto)await this._hass!.callWS({type:'hestia_heating/gestion_auto',actif:false});
   await this._hass!.callService('number','set_value',{entity_id:ids.flamme,value:n});});
  const levels=s.ventilation_niveaux??[],fanBy=s.ventilation_choix??'auto',fanNow=s.ventilation;
  const fanAuto=()=>this._press('fan',async()=>{await settings({pilote_ventilation:'auto'});
   if(fanNow&&fanNow.toLowerCase()!=='auto'){const modes=(this._hass as unknown as {states?:Record<string,{attributes:Record<string,unknown>}>}).states?.[ids.ventilation]?.attributes.fan_modes as string[]|undefined;
    await this._hass!.callService('climate','set_fan_mode',{entity_id:ids.ventilation,fan_mode:(modes??[]).find(m=>String(m).toLowerCase()==='auto')??'AUTO'});}});
  const speed=(n:string)=>this._press('fan',async()=>{if(fanBy!=='manuel')await settings({pilote_ventilation:'manuel'});
   await this._hass!.callService('climate','set_fan_mode',{entity_id:ids.ventilation,fan_mode:n});});
  const eco=s.eco_stop,delay=s.eco_stop_delai??5;
  const ecoSay=eco?`Le poêle s’éteint seul si sa sonde reste ${num(delay,0)} min au-dessus de ${s.consigne_poele!=null?`${num(s.consigne_poele)} °C`:'sa consigne'}${s.air!=null?` (elle lit ${num(s.air)} °C)`:''}, même sans Home Assistant.`
   :'Le poêle ne s’éteint jamais seul : il descend à la flamme 1 et continue de brûler.';
  const seg=(on:boolean,label:string,run:()=>void,dis=false)=>html`<button class=${'seg'+(on?' on':'')} aria-pressed=${on?'true':'false'} ?disabled=${locked||busy||dis} @click=${run}>${label}</button>`;
  return html`<div class="ctl" @click=${(e:Event)=>e.stopPropagation()}>
   ${ids.flamme?html`<div class="ctl-row"><b>Flamme</b><span class="segs">${seg(auto,'Auto',()=>void this._press('auto',()=>this._hass!.callWS({type:'hestia_heating/gestion_auto',actif:true})),!!s.copie)}${seg(!auto,'Manuel',()=>void this._press('auto',()=>this._hass!.callWS({type:'hestia_heating/gestion_auto',actif:false})))}</span>
    <span class="steps">${Array.from({length:hi-lo+1},(_,i)=>i+lo).map(n=>html`<button class=${'step'+(set===n?' on':'')} aria-label=${`Puissance ${n}`} ?disabled=${locked||busy} @click=${()=>void power(n)}>${n}</button>`)}</span></div>`:nothing}
   ${ids.ventilation&&levels.length?html`<div class="ctl-row"><b>Ventilation</b><span class="segs">${seg(fanBy==='auto','Par le poêle',()=>void fanAuto())}${seg(fanBy==='flamme','Par Hestia',()=>void this._press('fan',()=>settings({pilote_ventilation:'flamme'})))}${seg(fanBy==='manuel','Manuel',()=>void this._press('fan',()=>settings({pilote_ventilation:'manuel'})))}</span>
    <span class="steps">${levels.map(n=>html`<button class=${'step'+(fanNow===n?' on':'')} aria-label=${`Vitesse ${n}`} ?disabled=${locked||busy} @click=${()=>void speed(n)}>${n}</button>`)}</span></div>`:nothing}
   ${ids.eco_stop&&eco!=null?html`<div class="ctl-row"><b>ÉCO Stop</b><span class="segs">${seg(eco,'Activé',()=>void this._press('eco',async()=>{await this._hass!.callService('switch','turn_on',{entity_id:ids.eco_stop});await settings({poele_eco_stop:true});}))}${seg(!eco,'Coupé',()=>void this._press('eco',async()=>{await this._hass!.callService('switch','turn_off',{entity_id:ids.eco_stop});await settings({poele_eco_stop:false});}))}</span>
    <p class="ctl-say">${ecoSay}</p></div>`:nothing}
  </div>`;
 }
 private _pelletDrawer(v:View,s:Stove){
  const g=v.granules,c=s.conso,pot=c?.brasier,h=this._hist?.unite==='kg'?this._hist:undefined;
  const until=g?.jours!=null?this._dayIn(g.jours):null;
  const potPct=pot?.kg!=null&&pot.seuil_kg?Math.round(pot.kg/pot.seuil_kg*100):null;
  const say=[until?`jusqu’au ${until}`:null,c?.cout_jour!=null?`${eur(c.cout_jour)} aujourd’hui`:c?`${num(c.kg_jour,1)} kg aujourd’hui`:null,
   pot?.a_nettoyer?'brasier à nettoyer':pot?.jours!=null?`brasier dans ${pot.jours<1?'moins d’un jour':pot.jours<1.5?'1 jour':`${num(pot.jours,0)} jours`}`:
   potPct!=null?`brasier ${potPct} %`:pot?'brasier pas encore compté':null].filter(Boolean).join(' · ');
  const TABS:[string,string][]=[['granules','Granulés'],['argent','Argent'],['entretien','Entretien']];
  return this._drawer('granules','Granulés · Argent · Entretien',say,false,()=>{
   const tab=this._tab('poele',TABS);
   return html`${this._tabbar('poele',TABS,'Détails du poêle')}<div role="tabpanel" class="panel">${
    tab==='granules'?this._pellets(g,c,h,until):tab==='argent'?this._stoveMoney(v,c,h):this._upkeep(s)}</div>`;
  },'pellets');
 }
 private _dayIn(days:number){const d=new Date();d.setDate(d.getDate()+days);return `${d.getDate()===1?'1er':d.getDate()} ${MONTHS[d.getMonth()]}`;}
 private _sacks(n:number){
  const full=Math.floor(n+.05),part=n-full>.05;
  if(!full)return part?'un sac entamé':'plus aucun sac';
  return `${full} sac${full>1?'s':''}${part?' et un entamé':''}`;
 }
 private _sackArt(n:number){
  const full=Math.floor(n+.05),part=n-full>.05?n-full:0,count=Math.min(12,full+(part?1:0));
  const SACK='M7 2h12l-1.5 4c3 2 4.5 5.5 4.5 10v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4c0-4.5 1.5-8 4.5-10z';
  return html`<svg class="sacks" viewBox="0 0 150 90" role="img" aria-label=${this._sacks(n)}><defs><linearGradient id="hcSack" x1="0" y1="1" x2="0" y2="0">
   <stop offset="0" class="full"></stop><stop offset=${part.toFixed(2)} class="full"></stop><stop offset=${part.toFixed(2)} class="empty"></stop><stop offset="1" class="empty"></stop></linearGradient></defs>
   ${Array.from({length:count},(_,i)=>svg`<path class=${'sack'+(part&&full<12&&i===count-1?' part':'')} fill=${part&&full<12&&i===count-1?'url(#hcSack)':nothing} transform=${`translate(${(i%6)*24+(i>=6?12:0)} ${i<6?58:30})`} d=${SACK}></path>`)}</svg>`;
 }
 private _pellets(g:Pellets|null,c:Use|undefined,h:History|undefined,until:string|null){
  const days=h?.stat?h.jours:[],top=days.reduce<{jour:string;valeur:number|null}|null>((a,d)=>d.valeur!=null&&(a==null||d.valeur>(a.valeur??0))?d:a,null);
  return html`${g?.stock_sacs!=null?html`<div class="stock"><div><div class="nw-label">${until?'Il en reste jusqu’au':'Il en reste'}</div>
     <div class="big">${until??this._sacks(g.stock_sacs)}</div>
     <div class="small">${[until?cap(this._sacks(g.stock_sacs)):null,g.kg_par_jour!=null?`au rythme de la saison : ${num(g.kg_par_jour)} kg par jour`:null].filter(Boolean).join(', ')}</div></div>
     ${this._sackArt(g.stock_sacs)}</div>`
    :html`<p class="note left">Le stock se lit avec l’intégration Suivi Stock Pellet : sans elle, Hestia compte seulement ce qui brûle.</p>
     ${c?html`<div class="tiles">${this._tile(num(c.kg_jour,1),'aujourd’hui','kg')}${this._tile(num(c.kg_saison,0),'cette saison','kg')}${this._tile(c.debit_kg_h?num(c.debit_kg_h,2):'—','en ce moment','kg/h')}</div>`:nothing}`}
   ${top?html`<div class="bhead"><span>Les 14 derniers jours</span><span>le plus : ${DAYS[dateOf(top.jour).getDay()]}, ${num(top.valeur!,1)} kg</span></div>
    ${this._bars(days,x=>num(x,1),`Granulés brûlés par jour : ${this._dayList(days,x=>`${num(x,1)} kg`)}`)}`:nothing}`;
 }
 private _stoveMoney(v:View,c:Use|undefined,h:History|undefined){
  const PER:[string,string][]=[['jour','Aujourd’hui'],['semaine','7 jours'],['saison','Saison']],per=this._tab('periode',PER);
  const week=h?.stat?h.jours.slice(-7).reduce((a,d)=>a+(d.valeur??0),0):null;
  const kg=per==='jour'?c?.kg_jour??null:per==='semaine'?week:c?.kg_saison??null,pk=c?.prix_kg??null,pe=v.prix_kwh??null;
  const seg=html`<div class="tabs" role="group" aria-label="Période">${PER.map(([id,l])=>html`<button class="tab" aria-pressed=${id===per?'true':'false'}
   @click=${()=>{this._tabs={...this._tabs,periode:id};}}>${l}</button>`)}</div>`;
  if(pk==null||pe==null)return html`${seg}<p class="note left">${pk==null?'Le prix des granulés manque : donnez le prix et le poids d’un sac dans les réglages. ':''}${
   pe==null?'Le prix du kWh manque, pour comparer à l’électricité.':''}</p>${this._toSettings()}`;
  if(kg==null)return html`${seg}<p class="note">Pas encore de compte pour cette période.</p>`;
  const stove=kg*pk,elec=kg*KWH_PER_KG*pe,top=Math.max(stove,elec)||1,saved=elec-stove;
  return html`${seg}<div class="versus">
    <span>Le poêle</span><span class="vb"><i class="pellet" style=${`width:${stove/top*100}%`}></i></span><b>${eur(stove)}</b>
    <span>À l’électricité</span><span class="vb"><i class="elec" style=${`width:${elec/top*100}%`}></i></span><b>${eur(elec)}</b></div>
   <div class="saved"><b class=${saved>=0?'good':'bad'}>${eur(Math.abs(saved))} ${saved>=0?'gagnés':'de plus'}</b>
    <span>${per==='jour'?'aujourd’hui, pour la même chaleur':per==='semaine'?'sur les 7 derniers jours':'depuis le début de la saison'}</span></div>
   <p class="note left">${num(kg,kg>=100?0:1)} kg de granulés à ${num(pk,3)} € le kg, face à la même chaleur à l’électricité, à ${num(pe,4)} € le kWh.</p>`;
 }
 private _upkeep(s:Stove){
  const pot=s.conso?.brasier,C=2*Math.PI*26,part=pot?.kg!=null&&pot.seuil_kg?Math.min(1,pot.kg/pot.seuil_kg):0;
  const tone=pot?.a_nettoyer?'alert':pot?.bientot?'act':'stove',kg=pot?.kg!=null?num(pot.kg,1):'—';
  return html`${pot?html`<div class="pot"><div class="pring"><svg viewBox="0 0 64 64" role="img" aria-label=${`Brasier : ${kg} kg brûlés sur ${num(pot.seuil_kg,0)}`}>
     <circle class="bg" cx="32" cy="32" r="26"></circle><circle class=${'fg '+tone} cx="32" cy="32" r="26" style=${`stroke-dasharray:${(C*part).toFixed(1)} ${C.toFixed(1)}`}></circle></svg>
     <span>${kg}</span></div><div class="pt"><b>Brasier</b><span>${pot.texte}</span></div></div>`:nothing}
   <div class="rows">
    <div class="row"><b>Alarme</b><span>${s.alarme?`${s.alarme_texte??'Le poêle signale une alarme'}.`:'Aucune en ce moment.'}</span></div>
    ${s.prise_w!=null?html`<div class="row"><b>Prise</b><span>${watts(s.prise_w)} en ce moment.</span></div>`:nothing}
   </div>`;
 }

 /* 3 · Une pièce, longue (son horloge) ou courte (une ligne) */
 private _room(v:View){
  const r=this._roomOf(v);
  if(!r)return html`<div class="head"><h2 class="nw-title">${this._config.name||'Pièce'}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;
  const name=this._config.name||r.nom,tap=this._tapAction(r);
  const what=tap==='thermostat'?`Ouvrir le thermostat de ${r.nom}`:`Ouvrir la page de ${r.nom}`;
  if(this._config.court)return html`<div class="short" role=${tap?'button':nothing} tabindex=${tap?0:nothing} aria-label=${tap?what:nothing}
    @keydown=${tap?(e:KeyboardEvent)=>this._key(e,r):nothing}>
    <div class="temp">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div><div><b>${name}</b><span class="nw-say">${r.raison??(r.consigne!=null?`Consigne ${deg(r.consigne)}`:'')}</span></div>${this._chip(r.badge)}</div>`;
  const {d,series,span}=this._window(v),lane=v.planning.lignes.find(l=>l.id===r.id),segments=lane?.segments??[];
  const tones=[...new Set(segments.map(x=>x.ton))];
  // The thermostat's demand, one stroke an hour, only when it heated: a stove's room shows its flame on the stove's card.
  const demand=!r.poele&&(series.demande??[]).some(p=>(p[1]??0)>0);
  // Its set point over the day; a thermostat without its history keeps today's.
  const sets:Pt[]=series.consigne?.length?series.consigne:r.consigne!=null?[[0,r.consigne]]:[];
  const next=this._soon(r.prochain),stove=r.type==='poele'?v.poele:null;
  const art=stove?stoveArt(stove.en_feu?stove.flamme??0:0,stove.flamme_max||5,stove.en_feu):heaterArt(r.type,r.etat);
  const sub=next?this._next(next,v):r.consigne!=null?`consigne ${num(r.consigne)}°`:'';
  const kwh=d?.energie?.unite==='kWh'?d.energie.heures:[],price=v.prix_kwh??null;
  const series_={temp:series.temperature??[],heat:demand?(series.demande??[]).map(([m,x]):Pt=>[m,x==null?null:x/100]):[],sets,energy:kwh};
  const hrs=hours(span,segments,series_);
  const say=(h:Hour):Detail=>{
   const heat=demand&&h.heat!=null?`chauffe ${Math.round(h.heat*100)} %`:null;
   if(h.ahead)return this._ahead(h,heat);
   return this._past(h,[heat,h.energy!=null?`${num(h.energy,2)} kWh${price!=null?` · ${eur(h.energy*price)}`:''}`:null,
    h.set!=null?`consigne ${num(h.set)}°`:null,this._plan(h)]);
  };
  const clock=wheel({span,segments,series:series_,hours:hrs,kind:'demand',marks:next?[{at:isoMinute(next.a),cls:'next'}]:[],say,
   ...this._picker(),tap:tap?{label:what,run:(e:Event)=>this._tap(e,r)}:undefined,
   label:`Horloge du jour : ${r.nom} à ${deg(r.temperature)}${r.consigne!=null?`, consigne ${deg(r.consigne)}`:''}${next?`, ${this._next(next,v)}`:''}.`},
   center(art,r.temperature!=null?`${num(r.temperature)}°`:'—',sub));
  if(this._config.compacte)return html`<div class="top compact">
   ${this._head(name,TYPE_WORD[r.type??'']??'',html`${this._heatPill(r)}`,'pieces/'+r.id,`Réglages de ${r.nom}`)}
   <div class="pair">${clock}<div class="side">${r.raison?html`<p class="say">${r.raison}</p>`:nothing}${this._modePill(r)}</div></div>
   ${this._modes(r)}
  </div>
  ${this._roomDrawer(v,r)}`;
  return html`<div class="top">
   ${this._head(name,TYPE_WORD[r.type??'']??'',html`${this._heatPill(r)}${this._modePill(r)}`,'pieces/'+r.id,`Réglages de ${r.nom}`)}
   ${clock}
   <div class="legend">${tones.map(x=>html`<span><i class=${'sw t-'+x}></i>${LANE_WORD[x]??x}</span>`)}
    ${(series.temperature??[]).length?html`<span><i class="sw line"></i>température</span>`:nothing}
    ${sets.some(p=>p[1]!=null)?html`<span><i class="sw set"></i>consigne</span>`:nothing}
    ${hrs.some(h=>!h.ahead&&(h.heat??0)>=.02)?html`<span><i class="sw ramp demand"></i>% de chauffe</span>`:nothing}
    ${hrs.some(h=>h.ahead&&(h.heat??0)>=.02)?html`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:nothing}
    ${next?html`<span><i class="sw ring next"></i>prochain changement</span>`:nothing}</div>
   ${d?html`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:nothing}
   ${r.raison?html`<p class="say">${r.raison}</p>`:nothing}
   ${this._modes(r)}
  </div>
  ${this._roomDrawer(v,r)}`;
 }
 /* Whether the room heats now, and how much (its thermostat's demand); else what keeps it from heating. */
 private _heatPill(r:Room){
  if(r.badge.ton==='alert'||r.badge.ton==='act'||r.etat==='arret'||r.etat==='inconnu')
   return html`<span class=${'pill '+r.badge.ton} role="status">${r.badge.texte}</span>`;
  if(r.etat==='chauffe'&&r.poele)return html`<span class="pill stove" role="status"><span class="beat">${WAVES}</span>${r.badge.texte}</span>`;
  if(r.etat==='chauffe'||r.etat==='rafraichit'){
   const cool=r.etat==='rafraichit',pct=r.demande_pct,word=cool?'Rafraîchit':'Chauffe';
   return html`<span class=${'pill '+(cool?'cold':'heat')} role="status" aria-label=${pct!=null?`${word}, demande ${pct} %`:word}>
    <span class="beat">${WAVES}</span>${word}${pct!=null?html` ${pct} %<span class="gauge"><i style=${`width:${Math.min(100,pct)}%`}></i></span>`:nothing}</span>`;
  }
  return html`<span class="pill off" role="status">${WAVES}Ne chauffe pas</span>`;
 }
 private _modePill(r:Room){
  const preset=r.preset&&r.preset!=='none'?r.preset:null,word=preset?MODE_WORD[preset]??preset:r.planning;
  if(!word)return nothing;
  return html`<span class=${'pill '+(preset?MODE_TONE[preset]??'heat':'calm')}><i class="dot"></i>${word.toLowerCase()}${r.planning?' · planning':''}</span>`;
 }
 private _roomDrawer(v:View,r:Room){
  const h=this._hist?.unite==='kWh'?this._hist:undefined,price=v.prix_kwh??null,today=h?.stat?h.jours.at(-1)?.valeur??null:null,heat=this._heatToday(r);
  const say=[today!=null&&price!=null?`${eur(today*price)} aujourd’hui`:null,today!=null?`${num(today)} kWh`:heat?`${heat.time} de chauffe`:null,
   r.humidite!=null?`humidité ${num(r.humidite,0)} %`:null].filter(Boolean).join(' · ');
  const TABS:[string,string][]=[['argent','Argent'],['conso','Conso'],['confort','Confort']];
  return this._drawer('piece','Argent · Conso · Confort',say,false,()=>{
   const tab=this._tab('piece',TABS);
   return html`${this._tabbar('piece',TABS,'Détails de la pièce')}<div role="tabpanel" class="panel">${
    tab==='argent'?this._roomMoney(h,price):tab==='conso'?this._roomUse(h,heat):this._roomComfort(v,r)}</div>`;
  });
 }
 /** The heating since midnight, from the thermostat's demand: 50 % for an hour count half an hour. */
 private _heatToday(r:Room){
  const d=this._day;
  if(!d||r.poele||!d.series.demande?.length||d.fenetre_min==null)return null;
  const end=d.fenetre_min,from=Math.max(0,end-d.maintenant_min);
  let mins=0;for(const [,x] of sample(d.series.demande,from,end-5))mins+=(x??0)/100*5;
  const m=Math.round(mins);
  return {time:m>=60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`:`${m} min`,duty:Math.round(mins/Math.max(5,d.maintenant_min)*100)};
 }
 private _roomMoney(h:History|undefined,price:number|null){
  if(!h)return html`<p class="note">Les derniers jours ne sont pas encore lus.</p>`;
  if(!h.stat)return html`<p class="note left">Le thermostat ne donne pas de compteur d’énergie : Hestia ne peut pas compter les kWh de cette pièce.</p>`;
  if(price==null)return html`<p class="note left">Donnez le prix du kWh dans les réglages pour voir ce que coûte la pièce.</p>${this._toSettings()}`;
  const week=h.jours.slice(-7),today=week.at(-1)?.valeur;
  return html`<div class="tiles">${this._tile(today!=null?eur(today*price):'—','aujourd’hui')}
    ${this._tile(eur(week.reduce((a,d)=>a+(d.valeur??0),0)*price),'7 derniers jours')}
    ${this._tile(h.mois!=null?eur(h.mois*price):'—',MONTHS[dateOf(h.aujourdhui).getMonth()])}</div>
   ${this._bars(week,x=>num(x*price,2),`Coût par jour : ${this._dayList(week,x=>eur(x*price))}`)}
   <p class="note left">Prix : ${num(price,4)} € le kWh, abonnement à part.</p>`;
 }
 private _roomUse(h:History|undefined,heat:{time:string;duty:number}|null){
  const week=h?.stat?h.jours.slice(-7):[],today=week.at(-1)?.valeur??null;
  return html`<div class="tiles">${this._tile(today!=null?num(today):'—','aujourd’hui','kWh')}${this._tile(heat?heat.time:'—','de chauffe')}
    ${this._tile(heat?`${heat.duty} %`:'—','du temps')}</div>
   ${week.some(d=>d.valeur!=null)?this._bars(week,x=>num(x),`kWh par jour : ${this._dayList(week,x=>`${num(x)} kWh`)}`):nothing}
   <p class="note left">${heat?'Le temps de chauffe suit la demande du thermostat : 50 % pendant une heure comptent une demi-heure. ':''}${
    h?.stat?'Les kWh viennent du compteur d’énergie du thermostat.':h?'Le thermostat ne donne pas de compteur d’énergie.':''}</p>`;
 }
 private _roomComfort(v:View,r:Room){
  const rows:[string,string][]=[];
  if(r.humidite!=null)rows.push(['Humidité',`${num(r.humidite,0)} %, ${r.humidite<40?'un peu sec':r.humidite>60?'humide : aérez quelques minutes':'bien'}.`]);
  if(r.fenetre)rows.push(['Fenêtre',`Ouverte${r.fenetre_depuis?` depuis ${hm(new Date(r.fenetre_depuis))}`:''}.`]);
  if(r.pente!=null&&Math.abs(r.pente)>=.05)rows.push(['En ce moment',`La pièce ${r.pente>0?'gagne':'perd'} ${num(Math.abs(r.pente))} °C par heure.`]);
  if(r.consigne!=null)rows.push(['Consigne',`${deg(r.consigne)}${r.planning?`, ${r.planning} au planning`:''}${r.prochain?`, puis ${this._next(r.prochain,v)}`:''}.`]);
  if(r.puissance_w)rows.push(['Puissance',`${watts(r.puissance_w)} en ce moment.`]);
  return rows.length?html`<div class="rows">${rows.map(([k,t])=>html`<div class="row"><b>${k}</b><span>${t}</span></div>`)}</div>`:
   html`<p class="note">Rien d’autre à dire sur la pièce pour l’instant.</p>`;
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
   ${p.labo||p.essai?html`<p class="note">${p.labo?'Thermostats recopiés d’une autre maison : les plannings Hestia ne leur envoient rien.':'Un planning Hestia est en pause : il montre ce qu’il ferait, sans rien envoyer.'}</p>`:nothing}`;
 }
}

if(!customElements.get('hestia-heating-card'))customElements.define('hestia-heating-card',HestiaHeatingCard);
const w=window as unknown as {customCards?:unknown[]};
w.customCards=w.customCards??[];
if(!w.customCards.some(c=>(c as {type?:string}).type==='hestia-heating-card'))
 w.customCards.push({type:'hestia-heating-card',name:'Hestia Chauffage',description:'Le chauffage de la maison : qui chauffe, chaque pièce, le poêle, le planning.',preview:true});

import {LitElement,html,svg,nothing,css,type TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import {hubStyles,modernStyles,pageStyles,listSection,listRow,saveBar,toggle,helpTip,aboutPage,kpis,noteBox,moreRow,SOCLE} from './socle/ui';

/* The « Chauffage » tab of the Hestia-FB panel, after the v0.1 mock-up validated by Frank on 20 Nov. 2026
   (Accueil · Poêle), with a room's page, the planning, Réglages, Extensions and À propos.
   Read only: nothing here commands a thermostat or the stove. Everything shown comes from the integration
   (hestia_heating/view, day, settings); the tab only puts it into words and drawings. */

type Hass={callWS:<T>(msg:Record<string,unknown>)=>Promise<T>;states:Record<string,{state:string;attributes:Record<string,unknown>}>;language?:string;themes?:{darkMode?:boolean}};
type Badge={texte:string;ton:string};
type Next={a:string;texte:string;ton:string};
type Room={id:string;nom:string;temperature:number|null;consigne:number|null;etat:string;poele:boolean;sources:string[];principal:string|null;
 type:string|null;preset:string|null;demande_pct:number|null;puissance_w:number;pente:number|null;humidite:number|null;fenetre:boolean;
 fenetre_depuis:string|null;delestage:boolean;securite:boolean;badge:Badge;raison:string|null;planning:string|null;prochain:Next|null;appoint:number|null};
type Source={id:string;nom:string;type:string;piece:string;etat:string;mode:string;preset:string|null;temperature:number|null;consigne:number|null;
 demande_pct:number|null;puissance_w:number|null;fenetre:boolean;delestage:boolean;securite:boolean;pente:number|null;humidite:number|null;
 integration:string|null;entite:string};
type Pellets={stock_kg:number|null;stock_sacs:number|null;sac_kg:number|null;saison_kg:number|null;saison:string|null;jours_utilisation:number|null;
 kg_par_jour:number|null;jours:number|null;depense:number|null};
type Stove={nom:string;fabricant:string|null;modele:string|null;piece:string|null;profil:string;profil_nom:string;cloud:boolean;etat:string;texte:string|null;
 a_traduire:boolean;en_feu:boolean;depuis:string|null;flamme:number|null;flamme_reglee:number|null;flamme_min:number;flamme_max:number;fumees:number|null;
 air:number|null;alarme:boolean|null;alarme_texte:string|null;eco_stop:boolean|null;ecritures:number|null;ecritures_max:number|null;thermostat:string|null;
 thermostat_nom:string|null;demande_pct:number|null;consigne:number|null;preset:string|null;prise:string|null;prise_w:number|null;prise_tourne:boolean|null;
 entites:Record<string,string>};
type Segment={de:number;a:number;ton:string};
type Lane={id:string;nom:string;segments:Segment[];thermostat?:string};
type Planning={source:string|null;jour:string;jour_nom:string;maintenant_min:number;lignes:Lane[];prochains:{a:string;heure:string;texte:string}[];
 plannings:{id:string;nom:string;actif:boolean;jours:string[];partiel:boolean;cibles:string[]}[]};
type Todo={titre:string;texte:string;page:string};
type Ext={id:string;groupe:string;nom:string;installee:boolean;utilisee:boolean;usage:string;sans:string;lien:string|null;trouve:number;
 lieu?:string|null;lieu_nom?:string|null;lieux?:{id:string;nom:string}[]};
type House={etat:string;titre:string;texte:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number;en_marche:string[]};
type View={pret:boolean;version:string;maison:House;pieces:Room[];sources:Source[];poele:Stove|null;granules:Pellets|null;
 dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning;a_regler:Todo[];extensions:Ext[];meteo:{etat:string;nom:string|null};
 mis_a_jour:string;calcul_ms:number|null};
type Day={debut:string;maintenant_min:number;series:Record<string,[number,number|null][]>};
type Settings={reglages:{sources:Record<string,boolean>;extensions:Record<string,boolean>;poele_thermostat:string|null;poele_prise:string|null;weather_place:string|null};
 trouve:{thermostats:{id:string;nom:string;piece:string}[];coupes:{id:string;nom:string}[];poele:boolean;poele_thermostat:string|null;
  prises:{id:string;nom:string;poele:boolean}[];prise:string|null;meteo:{etat:string;lieu:string|null;nom:string|null;lieux:{id:string;nom:string}[]|null}}};

const REPO='https://github.com/hestiaFB/hestia-heating-integration';
const VERSION='0.1.0b1';
const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
const watts=(w:number|null|undefined)=>w==null?'—':w>=500?`${num(w/1000)} kW`:`${num(w,0)} W`;
const hm=(d:Date)=>d.getMinutes()?`${d.getHours()} h ${String(d.getMinutes()).padStart(2,'0')}`:`${d.getHours()} h`;
const clockOf=(iso:string|null|undefined)=>iso?hm(new Date(iso)):'—';
const DAYS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
/** « 22 h 30 », « demain 6 h 30 », « samedi 9 h ». */
function when(iso:string){const d=new Date(iso),now=new Date(),t=new Date(now);t.setDate(t.getDate()+1);
 if(d.toDateString()===now.toDateString())return hm(d);if(d.toDateString()===t.toDateString())return `demain ${hm(d)}`;return `${DAYS[d.getDay()]} ${hm(d)}`;}
function since(iso:string|null|undefined){if(!iso)return '';const d=new Date(iso),now=new Date();
 if(d.toDateString()===now.toDateString())return `depuis ${hm(d)}`;const y=new Date(now);y.setDate(y.getDate()-1);
 if(d.toDateString()===y.toDateString())return `depuis hier ${hm(d)}`;return `depuis le ${d.getDate()===1?'1er':d.getDate()}/${d.getMonth()+1}`;}
const STOVE_WORD:Record<string,string>={eteint:'éteint',allumage:'allumage',chauffe:'chauffe',nettoyage:'nettoyage',extinction:'extinction',alarme:'alarme',inconnu:'inconnu'};
const KIND:Record<string,string>={radiateur:'Radiateur',poele:'Poêle',clim:'Clim',pac:'Pompe à chaleur',vanne:'Vanne',autre:'Thermostat'};
const MODE:Record<string,string>={heat:'chauffage',cool:'froid',heat_cool:'chaud et froid',auto:'automatique',off:'arrêt',dry:'déshumidification',fan_only:'ventilation'};
const PRESET:Record<string,string>={comfort:'confort',boost:'boost',eco:'éco',frost:'hors gel',away:'absence',activity:'activité',sleep:'nuit',home:'présence'};
const LANE_WORD:Record<string,string>={poele:'poêle en chauffe',confort:'confort',eco:'éco',hors_gel:'hors gel',arret:'arrêt'};

/* ── Drawings: the day's curves and the planning's lanes ── */
const W=400,H=90;
// A gap (no value) cuts the line; the last run reaches « now » only when the series still has a value at its end.
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
function range(series:[number,number|null][][]):[number,number]{const v=series.flat().map(p=>p[1]).filter((x):x is number=>x!=null);
 if(!v.length)return [15,22];const lo=Math.min(...v),hi=Math.max(...v);return [Math.floor(lo-.5),Math.ceil(hi+.5)];}
function dayChart(lines:{pts:[number,number|null][];cls:string;step?:boolean;fill?:boolean;lo?:number;hi?:number}[],now:number,label:string):TemplateResult{
 const shared=range(lines.filter(l=>l.lo==null).map(l=>l.pts));
 return html`<svg class="chart" viewBox="0 0 ${W} ${H+14}" role="img" aria-label=${label}>
  ${[0,360,720,1080].map(m=>svg`<line class="grid" x1=${m/1440*W} x2=${m/1440*W} y1="0" y2=${H}></line><text x=${m/1440*W+2} y=${H+12}>${m/60} h</text>`)}
  ${lines.map(l=>{const p=paths(l.pts,l.lo??shared[0],l.hi??shared[1],l.step,now);
   return p.line?svg`${l.fill?svg`<path class=${l.cls+' area'} d=${p.area}></path>`:nothing}<path class=${l.cls} d=${p.line}></path>`:nothing;})}
  <line class="now" x1=${now/1440*W} x2=${now/1440*W} y1="0" y2=${H}></line></svg>`;
}
function lanes(p:Planning):TemplateResult{
 const now=p.maintenant_min/14.4;
 return html`<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(h=>html`<span style=${`left:${h/24*100}%`}>${h} h</span>`)}</div></div>
  ${p.lignes.map(l=>html`<div class="lane"><span class="n">${l.nom}</span><div class="track" role="img" aria-label=${`${l.nom} : `+l.segments.map(s=>`${LANE_WORD[s.ton]??s.ton} de ${Math.floor(s.de/60)} h à ${Math.floor(s.a/60)} h`).join(', ')}>
   ${l.segments.map(s=>html`<i class=${'t-'+s.ton} style=${`left:${s.de/14.4}%;width:${(s.a-s.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${now}%`}></span></div></div>`)}
  <div class="legend">${[...new Set(p.lignes.flatMap(l=>l.segments.map(s=>s.ton)))].map(t=>html`<span><i class=${'sw t-'+t}></i>${LANE_WORD[t]??t}</span>`)}</div></div>`;
}

@customElement('hestia-heating-setup')
export class HestiaHeatingSetup extends LitElement {
 static styles=[hubStyles,modernStyles,pageStyles,css`
  :host{--hc-heat:oklch(.83 .085 42);--hc-cold:oklch(.85 .05 220);--hc-calm:oklch(.83 .075 150);--hc-act:oklch(.81 .105 64);--hc-alert:oklch(.74 .115 18);
   --hc-stove:oklch(.86 .1 80);--hc-ink:62%;--hc-tint:40%;--hc-off:color-mix(in srgb,var(--primary-text-color) 30%,transparent)}
  :host([data-theme=light]){--hc-ink:34%;--hc-tint:24%}
  main{max-width:808px;margin:0 auto}
  .crumb{display:inline-flex;gap:6px;align-items:center;color:var(--nk-muted);font:inherit;font-size:var(--nw-fs-text,14px);margin:0 0 14px;cursor:pointer;background:none;border:0;padding:0;min-height:0}
  .crumb:hover{color:var(--primary-text-color)}
  h1{font-size:var(--nw-fs-case,21px);font-weight:650;letter-spacing:-.03em;line-height:1.25;margin:0}
  .lead{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:8px 0 22px;color:var(--nk-muted);font-size:var(--nw-fs-text,14px)}
  .lead p{margin:0;flex-basis:100%;max-width:640px}
  .pill{display:inline-flex;align-items:center;gap:6px;font-size:var(--nw-fs-small,12px);font-weight:600;border-radius:999px;padding:3px 10px;background:var(--nk-selected,var(--nk-surface));color:var(--primary-text-color);white-space:nowrap}
  .pill::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--nk-muted)}
  .pill.ok::before{background:var(--nk-ok,var(--nk-accent))}.pill.todo::before{background:var(--nk-todo)}
  .chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:999px;font-size:var(--nw-fs-small,12px);line-height:18px;font-weight:600;white-space:nowrap;
   background:color-mix(in oklab,var(--c,var(--hc-calm)) var(--hc-tint),transparent);color:color-mix(in oklab,var(--c,var(--hc-calm)) var(--hc-ink),var(--primary-text-color))}
  .chip.stove{--c:var(--hc-stove)}.chip.heat{--c:var(--hc-heat)}.chip.cold{--c:var(--hc-cold)}.chip.calm{--c:var(--hc-calm)}.chip.act{--c:var(--hc-act)}.chip.alert{--c:var(--hc-alert)}
  .chip.off{--c:var(--hc-off)}
  .band{--c:var(--hc-calm);border-radius:18px;padding:18px;margin:0 0 22px;background:color-mix(in oklab,var(--c) 16%,transparent);border:1px solid var(--nk-border)}
  .band.chauffe{--c:var(--hc-stove)}.band.rafraichit{--c:var(--hc-cold)}
  .band h1{font-size:var(--nw-fs-value,34px);font-weight:650;letter-spacing:-.03em;line-height:1.12;text-wrap:balance}
  .band p{margin:8px 0 0;color:var(--nk-muted)}.band .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
  .t{font-variant-numeric:tabular-nums;font-weight:650;white-space:nowrap;text-align:right}.t small{display:block;font-weight:500;color:var(--nk-muted);font-size:var(--nw-fs-small,12px)}
  .vals{display:inline-flex;align-items:center;gap:10px}
  .card{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:18px;padding:16px 18px;margin:0 0 22px}
  .reading{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}
  .big{font-size:var(--nw-fs-temp,58px);font-weight:300;letter-spacing:-.05em;line-height:1;position:relative;padding-right:26px;width:fit-content}
  .big sup{position:absolute;right:0;top:.3em;font-size:var(--nw-fs-text,14px);letter-spacing:0;font-weight:500;color:var(--nk-muted)}
  .val{font-size:var(--nw-fs-value,34px);font-weight:300;letter-spacing:-.04em;line-height:1.1}.val small{font-size:var(--nw-fs-text,14px);color:var(--nk-muted);letter-spacing:0;margin-left:4px}
  .say{color:var(--nk-muted);font-size:var(--nw-fs-small,12px);margin-top:4px}
  .target{text-align:right}.target b{display:block;font-size:var(--nw-fs-case,21px);font-weight:600}.target span{font-size:var(--nw-fs-label,11px);letter-spacing:.08em;text-transform:uppercase;font-weight:650;color:var(--nk-muted)}
  .flames{display:flex;gap:5px;align-items:flex-end;height:46px}
  .flames i{display:block;width:13px;border-radius:4px;background:color-mix(in oklab,var(--hc-stove) 30%,transparent)}
  .flames i.on{background:color-mix(in oklab,var(--hc-stove) 92%,var(--primary-text-color) 8%)}
  .flames i.ask{outline:2px dashed var(--nk-muted);outline-offset:2px}
  .bar{height:8px;border-radius:4px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);overflow:hidden;margin:8px 0}
  .bar i{display:block;height:100%;border-radius:4px;background:color-mix(in oklab,var(--hc-heat) 85%,var(--primary-text-color) 8%)}
  .chart{width:100%;height:auto;display:block;margin-top:14px;overflow:visible}
  .chart text{font-size:9px;fill:var(--nk-muted)}.chart .grid{stroke:var(--nk-border);stroke-width:1}
  .chart .now{stroke:var(--nk-muted);stroke-width:1}
  .chart path{fill:none;stroke-width:2;vector-effect:non-scaling-stroke;stroke-linejoin:round}
  .chart .flame{stroke:var(--hc-stove)}.chart .flame.area{fill:color-mix(in oklab,var(--hc-stove) 22%,transparent);stroke:none}
  .chart .temp{stroke:var(--hc-heat)}.chart .salon{stroke:var(--hc-cold);stroke-dasharray:4 4}
  .chart .target{stroke:var(--nk-muted);stroke-dasharray:3 3;stroke-width:1.5}
  .legend{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 16px;font-size:var(--nw-fs-small,12px);color:var(--nk-muted);margin-top:8px}
  .legend span{display:inline-flex;align-items:center;gap:6px}.sw{width:12px;height:8px;border-radius:2px;display:inline-block}
  .sw.flame{background:var(--hc-stove)}.sw.temp{background:var(--hc-heat)}.sw.salon{background:var(--hc-cold)}.sw.target{background:var(--nk-muted)}
  .lanes{display:flex;flex-direction:column;gap:8px}
  .lane,.hours{display:grid;grid-template-columns:110px 1fr;gap:10px;align-items:center}
  .lane .n{font-size:var(--nw-fs-small,12px);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hours>div{position:relative;height:14px;font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}.hours>div span{position:absolute;transform:translateX(-50%);white-space:nowrap}
  .hours>div span:first-child{transform:none}.hours>div span:last-child{transform:translateX(-100%)}
  .track{position:relative;height:12px;border-radius:6px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);overflow:hidden}
  .track i{position:absolute;top:0;bottom:0}
  .track .now{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--primary-text-color);border-radius:1px}
  .t-poele{background:color-mix(in oklab,var(--hc-stove) 90%,transparent)}.t-confort{background:color-mix(in oklab,var(--hc-heat) 85%,transparent)}
  .t-eco{background:color-mix(in oklab,var(--hc-cold) 70%,transparent)}.t-hors_gel,.t-arret{background:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}
  .eid{font-family:ui-monospace,monospace;font-size:var(--nw-fs-label,11px);color:var(--nk-muted);word-break:break-all}
  .ext-act{display:inline-flex;align-items:center;min-height:32px;padding:5px 12px;border-radius:999px;background:var(--nk-button,var(--primary-color));color:var(--nk-on-button,#fff);font-weight:600;font-size:var(--nw-fs-small,12px);text-decoration:none;white-space:nowrap}
  select{max-width:220px}
  @media(max-width:640px){.lane,.hours{grid-template-columns:78px 1fr}.band h1{font-size:var(--nw-fs-case,21px)}.target{text-align:left}}`];
 @property({attribute:false}) hass?:Hass;
 @property({attribute:false}) route?:{prefix?:string;path:string};
 @property({type:Boolean}) narrow=false;
 @state() private view?:View;
 @state() private settings?:Settings;
 @state() private draft:Record<string,unknown>={};
 @state() private days:Record<string,Day>={};
 @state() private error?:string;
 @state() private saving=false;
 @state() private saved=false;
 private timer=0;

 connectedCallback(){super.connectedCallback();void this.load();this.timer=window.setInterval(()=>{if(!this.count())void this.load();},30000);}
 disconnectedCallback(){super.disconnectedCallback();window.clearInterval(this.timer);}
 // A new `hass` comes at every change of state in the home: the tab redraws only for its own data, or a new theme.
 private drawnTheme?:boolean;
 shouldUpdate(changed:Map<string,unknown>){
  const dark=this.hass?.themes?.darkMode!==false;
  this.setAttribute('data-theme',dark?'dark':'light');
  if(dark!==this.drawnTheme){this.drawnTheme=dark;return true;}
  return !(changed.size===1&&changed.has('hass')&&this.view);
 }
 private async load(){
  if(!this.hass)return;
  try{
   const [view,settings]=await Promise.all([this.hass.callWS<View>({type:'hestia_heating/view'}),this.hass.callWS<Settings>({type:'hestia_heating/settings'})]);
   this.view=view;this.settings=settings;this.error=undefined;
   if(!view.pret)setTimeout(()=>{if(this.isConnected)void this.load();},5000);
   void this.loadDay();
  }catch(e){this.error=(e as {message?:string}).message??'Hestia Chauffage ne répond pas.';}
 }
 private target(){const [p,sub]=this.parts();return p==='poele'?'poele':p==='pieces'&&sub?`piece/${sub}`:null;}
 private async loadDay(){
  const t=this.target();if(!t||!this.hass)return;
  try{const day=await this.hass.callWS<Day>({type:'hestia_heating/day',cible:t});this.days={...this.days,[t]:day};}catch{/* no recorder: no curve */}
 }
 updated(changed:Map<string,unknown>){
  if(changed.has('hass')&&!this.view&&!this.error)void this.load();
  if(changed.has('route')&&this.view){void this.loadDay();}
 }
 private parts(){return (this.route?.path??'').replace(/^\//,'').split('/');}
 private go(path:string){history.pushState(null,'',(this.route?.prefix??'/hestia/chauffage')+(path?'/'+path:''));window.dispatchEvent(new CustomEvent('location-changed'));window.scrollTo(0,0);}
 private openHa(path:string){history.pushState(null,'',path);window.dispatchEvent(new CustomEvent('location-changed'));}

 /* ── The draft: one way to save everywhere ── */
 private stored(k:string){return (this.settings?.reglages as Record<string,unknown>|undefined)?.[k];}
 private val<T=unknown>(k:string):T{return (k in this.draft?this.draft[k]:this.stored(k)) as T;}
 private set(k:string,v:unknown){const d={...this.draft};if(JSON.stringify(v??null)===JSON.stringify(this.stored(k)??null))delete d[k];else d[k]=v;this.draft=d;this.saved=false;}
 private count(){return Object.keys(this.draft).length;}
 private async save(){
  this.saving=true;
  try{await this.hass!.callWS({type:'hestia_heating/set_settings',reglages:this.draft});this.draft={};this.saved=true;await this.load();}
  catch(e){this.error=(e as {message?:string}).message??'Réglages non enregistrés.';}
  finally{this.saving=false;}
 }

 render(){
  const v=this.view;
  if(this.error)return html`<main>${this.head('Chauffage',{pill:['todo',this.error]})}</main>`;
  if(!v||!v.pret)return html`<main>${this.head('Chauffage',{lead:'Lecture des thermostats…'})}</main>`;
  const [p,sub]=this.parts();
  const pages:Record<string,()=>TemplateResult>={'':()=>this.home(v),poele:()=>this.stovePage(v),pieces:()=>sub?this.roomPage(v,sub):this.home(v),
   planning:()=>this.planningPage(v),reglages:()=>this.settingsPage(v),extensions:()=>sub?this.extensionPage(v,sub):this.extensionsPage(v),'a-propos':()=>this.aboutPage(v)};
  return html`<main>${(pages[p]??pages[''])()}</main>
   ${saveBar({count:this.count(),busy:this.saving,done:this.saved?'Enregistré':undefined,cancel:()=>{this.draft={};},save:()=>void this.save()})}`;
 }

 /* ── Common pieces ── */
 private head(title:string,o:{back?:[string,string];pill?:[string,string];lead?:unknown;help?:string;chips?:unknown}={}){
  return html`${o.back?html`<button class="crumb" @click=${()=>this.go(o.back![0])}>‹ ${o.back[1]}</button>`:nothing}<h1 tabindex="-1">${title}</h1>
   <div class="lead">${o.pill?html`<span class=${'pill '+o.pill[0]}>${o.pill[1]}</span>`:nothing}${o.chips??nothing}${o.lead?html`<p>${o.lead}</p>`:nothing}${o.help?helpTip(title,o.help,''):nothing}</div>`;
 }
 private chip(b:Badge){return html`<span class=${'chip '+b.ton}>${b.texte}</span>`;}
 private readOnly(){return noteBox('Lecture seule','Hestia Chauffage ne commande rien en v0.1 : ni thermostat, ni poêle. Le planning maison et le pilote du poêle viendront ensuite, d’abord « à l’ombre ».');}

 /* ── Accueil ── */
 private home(v:View){
  const h=v.maison,s=v.poele,g=v.granules,out=v.dehors,first=v.pieces.find(r=>r.poele)??v.pieces[0];
  const vt=v.sources.filter(x=>x.integration==='versatile_thermostat').length;
  const outText=out&&out.nuit_min!=null?`${deg(out.nuit_min)} cette nuit${out.demain_max!=null?`, ${deg(out.demain_max)} demain après-midi`:''}`:null;
  const sub=first&&first.temperature!=null?`${first.nom} à ${deg(first.temperature)}${first.consigne!=null?` pour ${deg(first.consigne)} visés`:''}.`:'';
  const next=v.planning.prochains[0];
  return html`<section class=${'band '+h.etat}><h1>${h.titre}</h1>
    <p>${sub}${next?` Prochain changement ${when(next.a)} : ${next.texte}.`:''}</p>
    <div class="chips">${outText?html`<span class="chip cold">${outText}</span>`:nothing}${h.temperature!=null?html`<span class="chip calm">maison ${deg(h.temperature)}</span>`:nothing}
     ${h.electrique_w?html`<span class="chip heat">électrique ${watts(h.electrique_w)}</span>`:nothing}</div></section>
   ${v.a_regler.length?listSection('À régler',v.a_regler.map(t=>listRow({label:html`<b>${t.titre}</b>`,name:t.titre,sub:t.texte,level:'todo',go:()=>this.go(t.page)}))):nothing}
   ${s?listSection('Poêle',[listRow({label:html`<b>${s.nom}</b>`,name:s.nom,
     sub:[s.demande_pct!=null?`Le thermostat demande ${s.demande_pct} %.`:'',s.fumees!=null?`Fumées ${deg(s.fumees)}.`:'',g&&g.stock_sacs!=null?`${num(g.stock_sacs,0)} sacs${g.jours!=null?`, environ ${g.jours} jours`:''}.`:''].filter(Boolean).join(' ')||undefined,
     value:this.chip({texte:s.en_feu&&s.flamme!=null?`${STOVE_WORD[s.etat]} · flamme ${s.flamme}`:STOVE_WORD[s.etat],ton:s.etat==='alarme'?'alert':s.en_feu?'stove':'off'}),go:()=>this.go('poele')})],
     {more:html`<span class="nk-def">${s.profil_nom}</span>`}):nothing}
   ${v.pieces.length?listSection('Pièces',v.pieces.map(r=>listRow({label:html`<b>${r.nom}</b> ${this.chip(r.badge)}`,name:r.nom,sub:r.raison??undefined,
     value:html`<span class="t">${deg(r.temperature)}${r.consigne!=null?html`<small>pour ${num(r.consigne)}</small>`:nothing}</span>`,go:()=>this.go('pieces/'+r.id)})),
     {more:html`<span class="nk-def">${vt?`${vt} thermostat${vt>1?'s':''} Versatile`:`${v.sources.length} thermostat${v.sources.length>1?'s':''}`}</span>`})
    :listSection('Pièces',[listRow({label:'Aucun thermostat trouvé',sub:'Hestia Chauffage lit Versatile Thermostat et les thermostats de Home Assistant (climate).'})])}
   ${v.planning.source?listSection('Planning',[listRow({label:html`<b>Prochains changements</b>`,name:'Planning',
     sub:v.planning.prochains.slice(0,3).map(n=>`${n.heure} ${n.texte}`).join(' · ')||'Aucun changement prévu.',go:()=>this.go('planning')})],
     {more:html`<span class="nk-def">lu dans ${v.planning.source}</span>`}):nothing}
   ${this.readOnly()}`;
 }

 /* ── Poêle ── */
 private stovePage(v:View){
  const s=v.poele;
  if(!s)return html`${this.head('Poêle',{lead:'Aucun poêle trouvé. Hestia Chauffage reconnaît Micronova Agua IOT ; les autres poêles viendront un par un, avec des testeurs.'})}`;
  const g=v.granules,day=this.days['poele'],max=s.flamme_max;
  const lead=s.en_feu?`Il chauffe ${since(s.depuis)}. La maison régule, le poêle suit la flamme donnée.`:s.etat==='alarme'?'Le poêle est en alarme.':`${STOVE_WORD[s.etat][0].toUpperCase()+STOVE_WORD[s.etat].slice(1)} ${since(s.depuis)}.`;
  const flames=Array.from({length:max},(_,i)=>i+1);
  const asked=s.flamme_reglee,real=s.flamme;
  const sayFlame=[s.demande_pct!=null?`Le thermostat demande ${s.demande_pct} %.`:'',asked!=null?`Flamme réglée : ${asked}.`:'',real!=null&&real!==asked?`Le poêle est à la flamme ${real}.`:''].filter(Boolean).join(' ');
  const writes=s.ecritures!=null&&s.ecritures_max?`${s.ecritures} / ${s.ecritures_max}`:s.ecritures!=null?String(s.ecritures):null;
  const room=v.pieces.find(r=>r.poele);
  return html`${this.head(s.nom,{chips:this.chip({texte:STOVE_WORD[s.etat],ton:s.etat==='alarme'?'alert':s.en_feu?'stove':'off'}),lead})}
   <div class="card"><div class="reading"><div><div class="val">${real!=null?`Flamme ${real}`:'Flamme —'}<small>sur ${max}</small></div><div class="say">${sayFlame}</div></div>
    <div class="flames" aria-hidden="true">${flames.map(i=>html`<i class=${(real!=null&&i<=real?'on':'')+(asked===i?' ask':'')} style=${`height:${14+i*(32/max)}px`}></i>`)}</div></div>
    ${day&&(day.series.flamme?.length||day.series.temperature?.length)?html`${dayChart([
      {pts:day.series.flamme??[],cls:'flame',step:true,fill:true,lo:0,hi:max},
      {pts:day.series.temperature??[],cls:'salon'}],day.maintenant_min,'Flamme du poêle et température de la pièce aujourd’hui')}
     <div class="legend"><span><i class="sw flame"></i>flamme</span><span><i class="sw salon"></i>${room?room.nom.toLowerCase():'pièce'}</span></div>`:nothing}</div>
   ${listSection('Ce que dit le poêle',[
    listRow({label:'État',sub:s.texte?(s.a_traduire?`Texte du poêle « ${s.texte} » : pas encore dans le profil, à traduire.`:`Texte du poêle « ${s.texte} », traduit en « ${STOVE_WORD[s.etat]} »`):undefined,value:STOVE_WORD[s.etat],level:s.a_traduire?'todo':undefined}),
    ...(s.fumees!=null?[listRow({label:'Fumées',sub:'Elles confirment un arrêt quand elles redescendent.',value:deg(s.fumees)})]:[]),
    ...(s.air!=null?[listRow({label:'Sonde du poêle',sub:'La maison régule avec la sonde de son thermostat, plus juste.',value:deg(s.air)})]:[]),
    ...(s.prise?[listRow({label:'Prise du poêle',sub:'Témoin hors cloud : le poêle tourne-t-il vraiment ?',value:s.prise_w==null?'—':`${watts(s.prise_w)}${s.prise_tourne?' · tourne':''}`})]:[]),
    listRow({label:'Alarme',sub:s.alarme_texte&&s.alarme?`Code du poêle : ${s.alarme_texte}`:undefined,value:s.alarme==null?'—':s.alarme?html`<span class="chip alert">${s.alarme_texte??'alarme'}</span>`:'aucune',level:s.alarme?'todo':undefined}),
    ...(s.eco_stop!=null?[listRow({label:'ECO Stop',sub:'Le filet anti-surchauffe du poêle, qui survit à une panne de Home Assistant.',value:s.eco_stop?'actif':'coupé'})]:[]),
    ...(writes?[listRow({label:'Ordres reçus aujourd’hui',sub:s.ecritures_max?`La mémoire du poêle en accepte ${s.ecritures_max} par jour.`:undefined,value:writes})]:[]),
   ],{more:html`<span class="nk-def">profil ${s.profil_nom}${s.cloud?' · par le cloud':''}</span>`})}
   ${g?listSection('Granulés',[
    listRow({label:'Stock',sub:g.jours!=null?`Au rythme de la saison, environ ${g.jours} jours.`:undefined,value:html`<span class="t">${g.stock_sacs!=null?`${num(g.stock_sacs,1)} sacs`:'—'}${g.stock_kg!=null?html`<small>${num(g.stock_kg,0)} kg</small>`:nothing}</span>`}),
    ...(g.saison_kg!=null?[listRow({label:'Cette saison',sub:g.jours_utilisation!=null?`${g.jours_utilisation} jours de chauffe${g.kg_par_jour!=null?`, ${num(g.kg_par_jour)} kg par jour`:''}.`:undefined,value:`${num(g.saison_kg,0)} kg`})]:[]),
   ],{more:html`<span class="nk-def">Suivi Stock Pellet</span>`}):nothing}
   ${listSection('Pourquoi il chauffe',[
    listRow({label:'Son thermostat',sub:s.thermostat_nom??'Aucun : choisissez-le dans Réglages.',level:s.thermostat?undefined:'todo',
     value:s.thermostat?`${s.preset?PRESET[s.preset]??s.preset:'—'} · ${deg(s.consigne)}`:undefined,go:s.thermostat?undefined:()=>this.go('reglages')}),
    ...(s.demande_pct!=null?[listRow({label:'Demande du thermostat',sub:'La part du temps où il voudrait chauffer : c’est elle qui donne la flamme.',value:`${s.demande_pct} %`})]:[]),
    ...(room?.planning?[listRow({label:'Le planning',sub:room.prochain?`Puis ${room.prochain.texte} ${when(room.prochain.a)}.`:undefined,value:room.planning,go:()=>this.go('planning')})]:[]),
   ],{more:html`<span class="nk-def">lu, pas décidé</span>`})}
   ${this.readOnly()}`;
 }

 /* ── Une pièce ── */
 private roomPage(v:View,id:string){
  const r=v.pieces.find(x=>x.id===id);
  if(!r)return this.home(v);
  const srcs=v.sources.filter(s=>r.sources.includes(s.id)),day=this.days['piece/'+id];
  const slope=r.pente!=null&&Math.abs(r.pente)>=.05?`${r.pente>0?'↗':'↘'} ${r.pente>0?'+':''}${num(r.pente)} °C par heure`:null;
  return html`${this.head(r.nom,{back:['','Accueil'],chips:this.chip(r.badge),lead:r.raison??undefined})}
   <div class="card"><div class="reading"><div><div class="big">${r.temperature!=null?num(r.temperature):'—'}<sup>°C</sup></div>${slope?html`<div class="say">${slope}</div>`:nothing}</div>
    ${r.consigne!=null?html`<div class="target"><span>Consigne</span><b>${deg(r.consigne)}</b>${r.planning?html`<div class="say">${r.planning}${r.prochain?` jusqu’à ${when(r.prochain.a)}`:''}</div>`:nothing}</div>`:nothing}</div>
    ${r.demande_pct!=null?html`<div class="say" style="margin-top:14px">Demande du thermostat : <b>${r.demande_pct} %</b>${r.puissance_w?` · ${watts(r.puissance_w)}`:''}</div><div class="bar"><i style=${`width:${r.demande_pct}%`}></i></div>`:nothing}
    ${day&&day.series.temperature?.length?html`${dayChart([{pts:day.series.temperature,cls:'temp'},{pts:day.series.consigne??[],cls:'target',step:true}],day.maintenant_min,`Température et consigne de ${r.nom} aujourd’hui`)}
     <div class="legend"><span><i class="sw temp"></i>température</span><span><i class="sw target"></i>consigne</span></div>`:nothing}</div>
   ${listSection(srcs.length>1?'Ses thermostats':'Son thermostat',srcs.map(s=>listRow({label:html`<b>${s.nom}</b>`,name:s.nom,
     sub:[KIND[s.type]??s.type,s.mode?MODE[s.mode]??s.mode:'',s.preset?`préréglage ${PRESET[s.preset]??s.preset}`:'',s.fenetre?'fenêtre ouverte':'',s.delestage?'délesté':'',s.securite?'en sécurité':'',
      s.humidite!=null?`humidité ${num(s.humidite,0)} %`:''].filter(Boolean).join(' · '),
     value:html`<span class="t">${s.type==='poele'?(v.poele?STOVE_WORD[v.poele.etat]:'—'):s.etat==='chauffe'&&s.puissance_w?watts(s.puissance_w):s.etat==='chauffe'?'chauffe':s.etat==='rafraichit'?'rafraîchit':s.etat==='arret'?'arrêt':s.etat==='inconnu'?'ne répond pas':'au repos'}${s.consigne!=null?html`<small>consigne ${deg(s.consigne)}</small>`:nothing}</span>`})))}
   ${listSection('',[moreRow('Entités lues',String(srcs.length),srcs.map(s=>listRow({label:html`<span class="eid">${s.entite}</span>`,value:s.integration??''})))])}`;
 }

 /* ── Planning ── */
 private planningPage(v:View){
  const p=v.planning;
  if(!p.source)return html`${this.head('Planning',{lead:'Aucun planning trouvé. Hestia Chauffage lit Scheduler ; le planning maison viendra dans cette page.'})}${this.readOnly()}`;
  const names=Object.fromEntries(v.sources.map(s=>[s.id,s.nom]));
  return html`${this.head('Planning',{chips:html`<span class="chip calm">${p.jour_nom}</span>`,lead:`La journée de chaque pièce et du poêle, lue dans ${p.source}.`})}
   ${p.lignes.length?html`<div class="card">${lanes(p)}</div>`:nothing}
   ${p.prochains.length?listSection('Prochains changements',p.prochains.map(n=>listRow({label:n.heure,value:n.texte}))):nothing}
   ${listSection('Plannings lus',p.plannings.map(s=>listRow({label:html`<b>${s.nom}</b>`,name:s.nom,level:s.partiel?'todo':undefined,
     sub:`${s.jours.map(d=>({daily:'tous les jours',workday:'jours ouvrés',weekend:'week-end'} as Record<string,string>)[d]??d).join(', ')} · ${s.cibles.map(c=>names[c]??c).join(', ')}${s.partiel?' · un créneau au soleil n’est pas lu':''}`,
     value:html`<span class=${'pill '+(s.actif?'ok':'')}>${s.actif?'actif':'coupé'}</span>`})),{more:html`<span class="nk-def">${p.source}</span>`})}
   ${this.readOnly()}`;
 }

 /* ── Réglages ── */
 private settingsPage(v:View){
  const s=this.settings;
  if(!s)return html`${this.head('Réglages',{lead:'Lecture…'})}`;
  const f=s.trouve,off=this.val<Record<string,boolean>>('sources')??{};
  const thermo=this.val<string|null>('poele_thermostat'),plug=this.val<string|null>('poele_prise');
  const setSource=(id:string,on:boolean)=>{const next={...off};if(on)delete next[id];else next[id]=false;this.set('sources',next);};
  const all=[...f.thermostats,...f.coupes.filter(c=>!f.thermostats.some(t=>t.id===c.id)).map(c=>({...c,piece:''}))];
  return html`${this.head('Réglages',{lead:'Ce que Hestia Chauffage lit. Laissé tel quel, elle prend ce qu’elle a trouvé.'})}
   ${f.poele?listSection('Le poêle',[
    listRow({label:'Son thermostat',control:true,sub:thermo?'Choisi par vous.':f.poele_thermostat?'Trouvé seul : le Versatile Thermostat qui le pilote.':'Aucun trouvé seul.',
     value:html`<select aria-label="Thermostat du poêle" @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;this.set('poele_thermostat',x||null);}}>
      <option value="" ?selected=${!thermo}>Trouvé seul</option>${f.thermostats.map(t=>html`<option value=${t.id} ?selected=${thermo===t.id}>${t.nom}</option>`)}</select>`}),
    listRow({label:'Sa prise mesurée',control:true,sub:plug?'Choisie par vous.':f.prise?'Trouvée seule, d’après son nom.':'Aucune trouvée : facultative.',
     value:html`<select aria-label="Prise du poêle" @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;this.set('poele_prise',x||null);}}>
      <option value="" ?selected=${!plug}>${f.prise?'Trouvée seule':'Aucune'}</option>${f.prises.filter(p=>p.poele||p.id===plug).concat(f.prises.filter(p=>!p.poele&&p.id!==plug)).map(p=>html`<option value=${p.id} ?selected=${plug===p.id}>${p.nom}</option>`)}</select>`}),
   ],{help:'Le thermostat du poêle donne la demande (en %) face à la flamme réelle. La prise sert de témoin hors cloud.'}):nothing}
   ${listSection('Les thermostats lus',all.map(t=>listRow({label:t.nom,control:true,sub:html`<span class="eid">${t.id}</span>`,
     value:toggle('Lire '+t.nom,off[t.id]!==false,on=>setSource(t.id,on))})),{help:'Un thermostat coupé ici n’est plus lu ni compté, sans rien changer dans Home Assistant.'})}
   ${listSection('',[listRow({label:'Les pièces',sub:'Elles viennent de Home Assistant : la pièce du thermostat, sinon celle de son appareil.',go:()=>this.openHa('/config/areas/dashboard')})])}`;
 }

 /* ── Extensions ── */
 private used(e:Ext){const x=(this.val<Record<string,boolean>>('extensions')??{})[e.id];return x===undefined?true:x;}
 private setUsed(e:Ext,on:boolean){const next={...(this.val<Record<string,boolean>>('extensions')??{})};if(on)delete next[e.id];else next[e.id]=false;this.set('extensions',next);}
 private extensionsPage(v:View){
  const groups=[...new Set(v.extensions.map(e=>e.groupe))];
  return html`${this.head('Extensions',{lead:'Les intégrations et les briques Hestia-FB que Chauffage lit'})}
   ${groups.map(g=>listSection(g,v.extensions.filter(e=>e.groupe===g).map(e=>listRow({label:e.nom,name:e.nom,control:true,
    sub:!e.installee?'Pas installée':!this.used(e)?'Pas utilisée':e.usage,
    value:e.installee?toggle('Utiliser '+e.nom,this.used(e),on=>this.setUsed(e,on)):nothing,go:()=>this.go('extensions/'+e.id)}))))}`;
 }
 private extensionPage(v:View,id:string){
  const e=v.extensions.find(x=>x.id===id);
  if(!e)return this.extensionsPage(v);
  const on=this.used(e);
  return html`${this.head(e.nom,{back:['extensions','Extensions'],lead:e.usage})}
   ${listSection('',[e.installee?listRow({label:'Utiliser dans Chauffage',control:true,sub:on?undefined:'Chauffage l’ignore, sans rien désinstaller.',value:toggle('Utiliser dans Chauffage',on,x=>this.setUsed(e,x))})
    :listRow({label:'Pas installée dans Home Assistant',value:e.lien?html`<a class="ext-act" href=${e.lien} target="_blank" rel="noreferrer">Voir le projet</a>`:nothing})])}
   ${e.installee&&on&&(e.lieux?.length??0)>1?listSection('Le lieu',[listRow({label:'La maison est',control:true,
     value:html`<select aria-label="Lieu de Hestia Weather" @change=${(ev:Event)=>this.set('weather_place',(ev.target as HTMLSelectElement).value)}>
      ${e.lieux!.map(p=>html`<option value=${p.id} ?selected=${(this.val<string|null>('weather_place')??e.lieu)===p.id}>${p.nom}</option>`)}</select>`})]):nothing}
   ${listSection('Ce qu’elle change',[...(e.installee&&on?[listRow({label:html`<b>Avec elle</b>`,sub:e.usage,value:e.trouve?String(e.trouve):undefined})]:[]),
    listRow({label:html`<b>Sans elle</b>`,sub:e.sans})])}`;
 }

 /* ── À propos ── */
 private aboutPage(v:View){
  const entities=Object.keys(this.hass?.states??{}).filter(e=>/^(binary_)?sensor\.hestia_heating_/.test(e)).sort();
  return html`${aboutPage({name:'Hestia Chauffage',versions:[['Hestia Chauffage',VERSION],['Socle commun',SOCLE.join('.')],
    ['Dernier calcul',v.calcul_ms!=null?`${num(v.calcul_ms,1)} ms`:'—']],repository:REPO,card:'Tableau de bord → Ajouter une carte → Hestia Chauffage'})}
   ${v.sources.length?kpis([{value:String(v.sources.length),label:'thermostats lus'},{value:String(v.pieces.length),label:'pièces'},{value:v.poele?'1':'0',label:'poêle'}]):nothing}
   ${entities.length?listSection('',[moreRow('Entités publiées',String(entities.length),entities.map(e=>{const st=this.hass!.states[e],u=st.attributes.unit_of_measurement;
    return listRow({label:html`<span class="eid">${e}</span>`,value:`${st.state}${u&&!['unknown','unavailable'].includes(st.state)?' '+u:''}`});}))]):nothing}`;
 }
}

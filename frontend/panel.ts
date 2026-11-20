import {LitElement,html,svg,nothing,css,type TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import {hubStyles,modernStyles,pageStyles,listSection,listRow,saveBar,toggle,helpTip,aboutPage,kpis,noteBox,moreRow,numberField,segmented,SOCLE} from './socle/ui';

/* The « Chauffage » tab of the Hestia-FB panel, after the v0.1 mock-up validated by Frank on 20 Nov. 2026
   (Accueil · Poêle), with a room's page, the planning (0.3 mock-up: Planning · Journée type · Réglages), Réglages,
   Extensions and À propos. The tab itself commands nothing: it edits the planning Hestia as a draft, saved with the
   rest of the settings; the integration sends the presets, and only when « Le planning commande les thermostats » is on.
   Everything shown comes from the integration (hestia_heating/view, day, settings). */

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
type Lane={id:string;nom:string;segments:Segment[];thermostat?:string;source?:string|null;bloque?:boolean};
type Slot=[string,string];
type Model={commande:boolean;pieces:Record<string,{source?:string;temperatures?:Record<string,number>}>;journees:Record<string,{nom:string;creneaux:Record<string,Slot[]>}>;
 semaine:string[];feries:string|null;jours:Record<string,string>;anticipation:{actif:boolean;max_min:number}};
type PlanLane={id:string;nom:string;source:string;choisi:boolean;thermostats:string[];vt:boolean;froid:boolean;recopie:boolean;niveaux:string[];
 prereglages:Record<string,number|null>|null;temperatures:Record<string,number>|null;scheduler:string[];scheduler_actif:string|null;
 scheduler_creneaux:{semaine:Slot[];weekend:Slot[]}|null};
type WeekDay={date:string;jour:string;num:number;type:string|null;nom:string|null;change:boolean};
type Planning={source:string|null;jour:string;jour_nom:string;maintenant_min:number;lignes:Lane[];prochains:{a:string;heure:string;texte:string}[];
 plannings:{id:string;nom:string;actif:boolean;jours:string[];partiel:boolean;cibles:string[]}[];commande:boolean;labo:boolean;
 jour_type:{id:string|null;nom:string|null};jours:WeekDay[];journees:{id:string;nom:string;jours:number;pieces:number}[];pieces:PlanLane[];
 ordres:{a:string;heure:string;statut:string;texte:string}[];journal:{jour:string;heure:string;piece:string;niveau:string;statut:string;texte:string}[];
 conseils:{texte:string;ton:string}[]};
type Todo={titre:string;texte:string;page:string};
type Ext={id:string;groupe:string;nom:string;installee:boolean;utilisee:boolean;usage:string;sans:string;lien:string|null;trouve:number;
 lieu?:string|null;lieu_nom?:string|null;lieux?:{id:string;nom:string}[]};
type House={etat:string;titre:string;texte:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number;en_marche:string[]};
type View={pret:boolean;version:string;maison:House;pieces:Room[];sources:Source[];poele:Stove|null;granules:Pellets|null;
 dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning;a_regler:Todo[];extensions:Ext[];meteo:{etat:string;nom:string|null};
 mis_a_jour:string;calcul_ms:number|null};
type Day={debut:string;maintenant_min:number;series:Record<string,[number,number|null][]>};
type Settings={reglages:{sources:Record<string,boolean>;extensions:Record<string,boolean>;poele_thermostat:string|null;poele_prise:string|null;weather_place:string|null;planning:Model};
 trouve:{thermostats:{id:string;nom:string;piece:string}[];coupes:{id:string;nom:string}[];poele:boolean;poele_thermostat:string|null;
  prises:{id:string;nom:string;poele:boolean}[];prise:string|null;meteo:{etat:string;lieu:string|null;nom:string|null;lieux:{id:string;nom:string}[]|null}}};

const REPO='https://github.com/hestiaFB/hestia-heating-integration';
const VERSION='0.3.0b1';
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
const LANE_WORD:Record<string,string>={poele:'poêle en chauffe',confort:'confort',eco:'éco',hors_gel:'hors gel',boost:'boost',arret:'arrêt'};
const LEVEL_WORD:Record<string,string>={confort:'confort',eco:'éco',hors_gel:'hors gel',boost:'boost'};
const OWNER_WORD:Record<string,string>={hestia:'Hestia',extension:'Scheduler',aucun:'Personne'};
// What became of a slot: on the coming orders (statut) and in the journal.
const ORDER_CHIP:Record<string,[string,string]>={ombre:['à l’ombre','off'],bloque:['bloqué','alert'],recopie:['recopié','off'],prevu:['sera envoyé','calm']};
const FATE_TONE:Record<string,string>={envoye:'calm',deja:'off',ombre:'off',bloque:'alert',recopie:'off',eteint:'act',sans_prereglage:'act'};
const WEEK_LONG=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const EMPTY_MODEL:Model={commande:false,pieces:{},journees:{semaine:{nom:'Semaine',creneaux:{}},weekend:{nom:'Week-end',creneaux:{}},teletravail:{nom:'Télétravail',creneaux:{}}},
 semaine:['semaine','semaine','semaine','semaine','semaine','weekend','weekend'],feries:'weekend',jours:{},anticipation:{actif:true,max_min:60}};
// The set points a thermostat without presets gets, unless set in Réglages (as home_planning.py).
const HEAT:Record<string,number>={confort:20,eco:17,hors_gel:7,boost:21},COOL:Record<string,number>={confort:25,eco:27,hors_gel:30,boost:24};
const minutesOf=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+(m||0);};
const clockText=(t:string)=>{const m=minutesOf(t);return hm(new Date(2000,0,1,Math.floor(m/60),m%60));};
/** A day type's slots for one lane, drawn: before the first slot, the lane keeps the evening's last level. */
function slotSegments(slots:Slot[],stove:boolean):Segment[]{
 if(!slots.length)return [];
 const sorted=[...slots].sort((a,b)=>minutesOf(a[0])-minutesOf(b[0])),tone=(l:string)=>stove&&l!=='hors_gel'?'poele':l;
 const out:Segment[]=[];let at=0,cur=tone(sorted.at(-1)![1]);
 for(const [t,l] of sorted){const m=minutesOf(t);if(m>at)out.push({de:at,a:m,ton:cur});at=m;cur=tone(l);}
 out.push({de:at,a:1440,ton:cur});return out;
}
/** A section whose body is a drawing rather than rows. */
function block(title:string,body:unknown,more?:unknown):TemplateResult{
 return html`<section class="nk-lsec"><div class="nk-lsec-h"><h2>${title}</h2>${more?html`<span class="nk-lsec-more">${more}</span>`:nothing}</div><div class="card">${body}</div></section>`;
}
/** The day types to choose for one date: as usual, or another. */
function segmentedDays(types:[string,{nom:string}][],value:string,usual:string,m:Model,set:(k:string)=>void):TemplateResult{
 return segmented<string>('Journée type de ce jour',[['',`Comme d’habitude (${m.journees[usual]?.nom??'—'})`],...types.filter(([k])=>k!==usual).map(([k,t]):[string,string]=>[k,t.nom])],value,set);
}
/** « lundi à vendredi », « samedi et dimanche », « mercredi ». */
function daysText(idx:number[]):string{
 if(!idx.length)return '';
 const runs:number[][]=[];for(const i of idx){const r=runs.at(-1);if(r&&r.at(-1)===i-1)r.push(i);else runs.push([i]);}
 const parts=runs.map(r=>r.length>2?`${WEEK_LONG[r[0]]} à ${WEEK_LONG[r.at(-1)!]}`:r.map(i=>WEEK_LONG[i]).join(' et '));
 return parts.length>1?`${parts.slice(0,-1).join(', ')} et ${parts.at(-1)}`:parts[0];
}

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
type LaneRow={nom:string;segments:Segment[];sub?:string;bad?:boolean;dim?:boolean;pick?:()=>void;picked?:boolean};
const minuteText=(m:number)=>m%60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`:`${m/60} h`;
/** The day of each lane: the planning page (with « now ») and a day type's page (without). */
function lanes(rows:LaneRow[],now:number|null):TemplateResult{
 return html`<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(h=>html`<span style=${`left:${h/24*100}%`}>${h} h</span>`)}</div></div>
  ${rows.map(l=>{const name=html`${l.nom}${l.sub?html`<small class=${l.bad?'bad':''}>${l.sub}</small>`:nothing}`;
   return html`<div class=${'lane'+(l.dim?' dim':'')+(l.picked?' picked':'')}>${l.pick?html`<button type="button" class="n" aria-pressed=${String(!!l.picked)} @click=${l.pick}>${name}</button>`:html`<span class="n">${name}</span>`}
   <div class="track" role="img" aria-label=${`${l.nom} : `+(l.segments.map(s=>`${LANE_WORD[s.ton]??s.ton} de ${minuteText(s.de)} à ${minuteText(s.a)}`).join(', ')||'aucun créneau')}>
   ${l.segments.map(s=>html`<i class=${'t-'+s.ton} style=${`left:${s.de/14.4}%;width:${(s.a-s.de)/14.4}%`}></i>`)}${now!=null?html`<span class="now" style=${`left:${now/14.4}%`}></span>`:nothing}</div></div>`;})}
  <div class="legend">${[...new Set(rows.flatMap(l=>l.segments.map(s=>s.ton)))].map(t=>html`<span><i class=${'sw t-'+t}></i>${LANE_WORD[t]??t}</span>`)}</div></div>`;
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
  .lane .n{font-size:var(--nw-fs-small,12px);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left}
  .lane .n small{display:block;font-weight:500;font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}
  .lane .n small.bad{color:color-mix(in oklab,var(--hc-alert) var(--hc-ink),var(--primary-text-color))}
  .lane.dim .track{opacity:.55}
  .lane button.n{background:none;border:0;padding:4px 6px;margin:-4px -6px;border-radius:8px;color:inherit;font:inherit;font-size:var(--nw-fs-small,12px);font-weight:600;cursor:pointer;min-height:0}
  .lane button.n:hover{background:var(--nk-selected,var(--nk-surface))}
  .lane.picked button.n{background:var(--nk-selected,var(--nk-surface));box-shadow:inset 3px 0 0 var(--nk-accent,var(--primary-color))}
  .week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .week button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 2px;border-radius:12px;border:1px solid var(--nk-border);background:transparent;color:inherit;font:inherit;cursor:pointer;min-width:0;min-height:0}
  .week button b{font-size:var(--nw-fs-case,21px);font-weight:600;line-height:1.1}
  .week button span{font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}
  .week button small{font-size:var(--nw-fs-label,11px);color:var(--nk-muted);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .week button.changed{background:color-mix(in oklab,var(--hc-act) 14%,transparent)}
  .week button.changed small{color:color-mix(in oklab,var(--hc-act) var(--hc-ink),var(--primary-text-color));font-weight:600}
  .week button[aria-pressed=true]{border-color:var(--nk-accent,var(--primary-color));background:var(--nk-selected,var(--nk-surface))}
  .pick{margin-top:14px;display:flex;flex-direction:column;gap:8px}
  .pick .say,.card>.say{margin:0}
  .slot{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
  .slot input,.slot select{width:auto;margin:0;min-height:38px;padding:6px 10px}.slot input[type=time]{min-width:7.5em}
  .slot .x{border:0;background:none;color:var(--nk-muted);font-size:20px;line-height:1;cursor:pointer;padding:4px 8px;min-height:0;border-radius:8px}
  .slot .x:hover{color:var(--primary-text-color);background:var(--nk-selected,var(--nk-surface))}
  .name{max-width:220px}
  .nk-lsec>.card{margin:0}
  .hours>div{position:relative;height:14px;font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}.hours>div span{position:absolute;transform:translateX(-50%);white-space:nowrap}
  .hours>div span:first-child{transform:none}.hours>div span:last-child{transform:translateX(-100%)}
  .track{position:relative;height:12px;border-radius:6px;background:color-mix(in srgb,var(--primary-text-color) 8%,transparent);overflow:hidden}
  .track i{position:absolute;top:0;bottom:0}
  .track .now{position:absolute;top:-2px;bottom:-2px;width:2px;background:var(--primary-text-color);border-radius:1px}
  .t-poele{background:color-mix(in oklab,var(--hc-stove) 90%,transparent)}.t-confort{background:color-mix(in oklab,var(--hc-heat) 85%,transparent)}
  .t-eco{background:color-mix(in oklab,var(--hc-cold) 70%,transparent)}.t-boost{background:color-mix(in oklab,var(--hc-act) 95%,transparent)}.t-hors_gel,.t-arret{background:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}
  .eid{font-family:ui-monospace,monospace;font-size:var(--nw-fs-label,11px);color:var(--nk-muted);word-break:break-all}
  .ext-act{display:inline-flex;align-items:center;min-height:32px;padding:5px 12px;border-radius:999px;background:var(--nk-button,var(--primary-color));color:var(--nk-on-button,#fff);font-weight:600;font-size:var(--nw-fs-small,12px);text-decoration:none;white-space:nowrap}
  select{max-width:220px}
  @media(max-width:640px){.lane,.hours{grid-template-columns:78px 1fr}.week{gap:3px}.week button small{display:none}.band h1{font-size:var(--nw-fs-case,21px)}.target{text-align:left}}`];
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
 @state() private refused?:string;
 @state() private openDay?:string;
 @state() private editLane?:string;
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
 private set(k:string,v:unknown){const d={...this.draft};if(JSON.stringify(v??null)===JSON.stringify(this.stored(k)??null))delete d[k];else d[k]=v;this.draft=d;this.saved=false;this.refused=undefined;}
 /** The planning Hestia as it stands in the draft: a copy to change, then put back whole (it is saved whole). */
 private plan():Model{return structuredClone(this.val<Model>('planning')??EMPTY_MODEL);}
 private setPlan(change:(m:Model)=>void){const m=this.plan();change(m);this.set('planning',m);}
 private count(){return Object.keys(this.draft).length;}
 private async save(){
  this.saving=true;
  try{await this.hass!.callWS({type:'hestia_heating/set_settings',reglages:this.draft});this.draft={};this.saved=true;this.refused=undefined;await this.load();}
  catch(e){this.refused=(e as {message?:string}).message??'Réglages non enregistrés.';}
  finally{this.saving=false;}
 }

 render(){
  const v=this.view;
  if(this.error)return html`<main>${this.head('Chauffage',{pill:['todo',this.error]})}</main>`;
  if(!v||!v.pret)return html`<main>${this.head('Chauffage',{lead:'Lecture des thermostats…'})}</main>`;
  const [p,sub,third]=this.parts();
  const pages:Record<string,()=>TemplateResult>={'':()=>this.home(v),poele:()=>this.stovePage(v),pieces:()=>sub?this.roomPage(v,sub):this.home(v),
   planning:()=>sub==='journee'&&third?this.dayTypePage(v,decodeURIComponent(third)):this.planningPage(v),reglages:()=>this.settingsPage(v),
   extensions:()=>sub?this.extensionPage(v,sub):this.extensionsPage(v),'a-propos':()=>this.aboutPage(v)};
  return html`<main>${this.refused?noteBox('Pas enregistré',this.refused):nothing}${(pages[p]??pages[''])()}</main>
   ${saveBar({count:this.count(),busy:this.saving,done:this.saved?'Enregistré':undefined,cancel:()=>{this.draft={};},save:()=>void this.save()})}`;
 }

 /* ── Common pieces ── */
 private head(title:string,o:{back?:[string,string];pill?:[string,string];lead?:unknown;help?:string;chips?:unknown}={}){
  return html`${o.back?html`<button class="crumb" @click=${()=>this.go(o.back![0])}>‹ ${o.back[1]}</button>`:nothing}<h1 tabindex="-1">${title}</h1>
   <div class="lead">${o.pill?html`<span class=${'pill '+o.pill[0]}>${o.pill[1]}</span>`:nothing}${o.chips??nothing}${o.lead?html`<p>${o.lead}</p>`:nothing}${o.help?helpTip(title,o.help,''):nothing}</div>`;
 }
 private chip(b:Badge){return html`<span class=${'chip '+b.ton}>${b.texte}</span>`;}
 /** What Hestia sends, said once at the foot of the pages. */
 private modeNote(v:View){
  const p=v.planning,hestia=(p.pieces??[]).some(l=>l.source==='hestia');
  if(!hestia)return noteBox('Lecture seule','Toutes les pièces suivent Scheduler, que Hestia Chauffage lit sans y toucher. Pour qu’elle en règle une, choisissez « Hestia » dans Réglages. Elle ne commande jamais le poêle lui-même.');
  if(p.labo)return noteBox('À l’ombre',html`Ici, les thermostats sont recopiés d’une autre maison (Remote Home Assistant) : le planning ne leur envoie rien, un ordre pourrait atteindre les vrais.`);
  if(!p.commande)return noteBox('À l’ombre',html`Hestia calcule et montre ce qu’elle ferait, sans rien envoyer aux thermostats. Pour qu’elle les règle, allumez « Le planning commande les thermostats » dans <a href="#" @click=${(e:Event)=>{e.preventDefault();this.go('reglages');}}>Réglages</a>.`);
  return noteBox('Le planning commande','Au début de chaque créneau, Hestia envoie un préréglage aux pièces marquées « Hestia ». Elle n’allume ni n’éteint jamais un thermostat, et ne commande jamais le poêle lui-même : seulement le préréglage de son thermostat.');
 }
 private modePill(p:Planning):[string,string]|undefined{
  if(!(p.pieces??[]).some(l=>l.source==='hestia'))return undefined;
  return p.labo?['todo','à l’ombre (labo)']:p.commande?['ok','commande les thermostats']:['','à l’ombre'];
 }

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
     {more:html`<span class="nk-def">${v.planning.source}</span>`})
    :(v.planning.pieces??[]).some(l=>l.source==='hestia')?listSection('Planning',[listRow({label:html`<b>Régler le planning</b>`,name:'Planning',
     sub:'Aucun créneau pour l’instant : choisissez les heures de chaque pièce dans une journée type.',go:()=>this.go('planning')})]):nothing}
   ${this.modeNote(v)}`;
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
   ${this.modeNote(v)}`;
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
 /** The coming seven days in the draft: a day changed on its own, a public holiday (seen by the integration), else the standard week. */
 private weekDays(v:View){
  const m=this.plan(),saved=this.settings?.reglages.planning??EMPTY_MODEL;
  return v.planning.jours.map(d=>{
   const wd=(new Date(d.date+'T12:00:00').getDay()+6)%7,usual=m.semaine[wd],own=m.jours[d.date];
   const holiday=!saved.jours[d.date]&&d.type&&d.type!==saved.semaine[wd]?d.type:null;
   const type=own??holiday??usual;
   return {...d,wd,type,usual,holiday:!!holiday&&!own,nom:m.journees[type]?.nom??'—',change:type!==usual};
  });
 }
 private planningPage(v:View){
  const p=v.planning,lanesInfo=p.pieces??[];
  if(!lanesInfo.length)return html`${this.head('Planning',{lead:'Aucun thermostat lu : le planning attend un thermostat (Versatile Thermostat, ou tout thermostat de Home Assistant).'})}${this.modeNote(v)}`;
  const m=this.plan(),hestia=lanesInfo.filter(l=>(m.pieces[l.id]?.source??l.source)==='hestia'),ext=lanesInfo.filter(l=>l.source==='extension');
  const lead=hestia.length&&ext.length?'La journée de chaque pièce et du poêle. Hestia règle les pièces marquées « Hestia » ; les autres suivent Scheduler, qu’elle lit sans y toucher.'
   :hestia.length?'La journée de chaque pièce et du poêle, réglée par le planning Hestia.'
   :'La journée de chaque pièce et du poêle, lue dans Scheduler. Pour que Hestia règle une pièce, choisissez « Hestia » dans Réglages.';
  const days=this.weekDays(v),open=days.find(d=>d.date===this.openDay);
  const types=Object.entries(m.journees);
  const todo=v.a_regler.filter(t=>/planning/i.test(t.titre));
  const usualText=types.map(([k,t])=>{const idx=m.semaine.map((x,i)=>x===k?i:-1).filter(i=>i>=0);return idx.length?`${daysText(idx)[0].toUpperCase()+daysText(idx).slice(1)} : ${t.nom}.`:'';}).filter(Boolean).join(' ');
  const holidays=m.feries&&m.journees[m.feries]?` Un jour férié suit ${m.journees[m.feries].nom} (capteur Jours ouvrés).`:'';
  return html`${this.head('Planning',{pill:this.modePill(p),chips:html`<span class="chip calm">${p.jour_nom}${p.jour_type?.nom&&hestia.length?` · ${p.jour_type.nom}`:''}</span>`,lead})}
   ${p.lignes.length?html`<div class="card">${lanes(p.lignes.map(l=>({nom:l.nom,segments:l.segments,sub:l.source?`${l.source}${l.bloque?' · bloqué':''}`:undefined,bad:l.bloque,dim:l.source==='Scheduler'})),p.maintenant_min)}</div>`
    :hestia.length?html`<div class="card"><p class="say">Aucun créneau pour l’instant. Ouvrez une journée type plus bas pour donner ses heures à chaque pièce.</p></div>`:nothing}
   ${todo.length?listSection('À régler',todo.map(t=>listRow({label:html`<b>${t.titre}</b>`,name:t.titre,sub:t.texte,level:'todo',go:()=>this.go(t.page)}))):nothing}
   ${hestia.length?html`
    ${block('Les 7 prochains jours',html`
     <div class="week">${days.map(d=>html`<button type="button" class=${d.change?'changed':''} aria-pressed=${String(open?.date===d.date)}
       aria-label=${`${WEEK_LONG[d.wd]} ${d.num} : ${d.nom}${d.change?', changé':''}`} @click=${()=>{this.openDay=open?.date===d.date?undefined:d.date;}}>
       <span>${d.jour}</span><b>${d.num}</b><small>${d.nom}</small></button>`)}</div>
     ${open?html`<div class="pick"><span class="say"><b>${WEEK_LONG[open.wd][0].toUpperCase()+WEEK_LONG[open.wd].slice(1)} ${open.num===1?'1er':open.num} ${MONTHS[Number(open.date.slice(5,7))-1]}</b> : ${open.holiday?'jour férié, ':''}${open.nom}</span>
       ${segmentedDays(types,m.jours[open.date]??'',open.usual,m,k=>this.setPlan(x=>{if(k)x.jours[open.date]=k;else delete x.jours[open.date];}))}
       <span class="say">Seulement ce jour-là. La semaine type ne change pas.</span></div>`:nothing}
     <p class="say" style="margin-top:12px">${usualText}${holidays}</p>`,html`<button type="button" class="nk-reset-s" @click=${()=>this.go('reglages')}>Semaine type ›</button>`)}
    ${listSection('Journées types',[...types.map(([k,t])=>{const n=days.filter(d=>d.type===k).length,rooms=Object.entries(t.creneaux).filter(([,x])=>x.length);
      const stove=rooms.some(([id])=>id==='poele'),others=rooms.length-(stove?1:0);
      return listRow({label:html`<b>${t.nom}</b>`,name:t.nom,go:()=>this.go('planning/journee/'+encodeURIComponent(k)),
       sub:`${n?`${n} jour${n>1?'s':''} cette semaine`:'aucun jour cette semaine'} · ${rooms.length?`${others?`${others} pièce${others>1?'s':''}`:''}${others&&stove?' et ':''}${stove?'le poêle':''}`:'aucun créneau'}`});}),
     ...(types.length<8?[listRow({label:'+ Nouvelle journée type',go:()=>{const id='j'+Date.now().toString(36);this.setPlan(x=>{x.journees[id]={nom:'Nouvelle journée',creneaux:{}};});this.go('planning/journee/'+id);}})]:[])])}
    ${listSection(p.commande&&!p.labo?'Ce qu’envoie Hestia':'Ce que ferait Hestia',p.ordres.length?p.ordres.map(o=>{const c=ORDER_CHIP[o.statut]??[o.statut,'off'];
      return listRow({label:html`<b>${o.heure}</b>`,sub:o.texte,value:html`<span class=${'chip '+c[1]}>${c[0]}</span>`});})
     :[listRow({label:'Rien de prévu dans les 24 heures.'})],{more:p.commande&&!p.labo?undefined:html`<span class="nk-def">rien n’est envoyé</span>`})}
    ${p.conseils.length?listSection('Bon à savoir',p.conseils.map(c=>listRow({label:c.texte}))):nothing}
    ${p.journal.length?listSection('Aujourd’hui',[...p.journal].reverse().map(j=>listRow({label:html`<b>${j.heure}</b> · ${j.piece} ${j.niveau}`,
      value:html`<span class=${'chip '+(FATE_TONE[j.statut]??'off')}>${j.texte}</span>`})),{help:'Chaque créneau commencé aujourd’hui : envoyé, déjà réglé, ou pourquoi il ne l’a pas été.'}):nothing}`:nothing}
   ${p.plannings.length?listSection('Plannings Scheduler',p.plannings.map(x=>listRow({label:html`<b>${x.nom}</b>`,name:x.nom,level:x.partiel?'todo':undefined,
     sub:`${x.jours.map(d=>({daily:'tous les jours',workday:'jours ouvrés',weekend:'week-end'} as Record<string,string>)[d]??d).join(', ')} · ${x.cibles.map(c=>v.sources.find(z=>z.id===c)?.nom??c).join(', ')}${x.partiel?' · un créneau au soleil n’est pas lu':''}`,
     value:html`<span class=${'pill '+(x.actif?'ok':'')}>${x.actif?'actif':'coupé'}</span>`})),{more:html`<span class="nk-def">lus, jamais changés</span>`}):nothing}
   ${this.modeNote(v)}`;
 }

 /* ── Une journée type ── */
 private dayTypePage(v:View,id:string){
  const m=this.plan(),d=m.journees[id],p=v.planning;
  if(!d)return this.planningPage(v);
  const owner=(l:PlanLane)=>m.pieces[l.id]?.source??l.source;
  const mine=(p.pieces??[]).filter(l=>owner(l)==='hestia'),others=(p.pieces??[]).filter(l=>owner(l)!=='hestia');
  const lane=mine.find(l=>l.id===this.editLane)??mine[0];
  const idx=m.semaine.map((x,i)=>x===id?i:-1).filter(i=>i>=0),used=Object.values(m.jours).filter(x=>x===id).length;
  const chip=idx.length?daysText(idx):used?`${used} jour${used>1?'s':''} à part`:'aucun jour';
  const slots=lane?(d.creneaux[lane.id]??[]):[];
  const setSlots=(f:(s:Slot[])=>Slot[])=>this.setPlan(x=>{const next=f([...(x.journees[id].creneaux[lane!.id]??[])].map(s=>[...s] as Slot));
   if(next.length)x.journees[id].creneaux[lane!.id]=next.sort((a,b)=>minutesOf(a[0])-minutesOf(b[0]));else delete x.journees[id].creneaux[lane!.id];});
  const levelName=(l:PlanLane,lv:string)=>{const t=l.vt?l.prereglages?.[lv]:l.temperatures?.[lv];return `${LEVEL_WORD[lv]}${t!=null?` · ${num(t)} °C`:''}`;};
  const fromScheduler=lane?.scheduler_creneaux?.[id==='weekend'?'weekend':'semaine']??[];
  const removable=Object.keys(m.journees).length>1;
  return html`${this.head(d.nom,{back:['planning','Planning'],chips:html`<span class="chip calm">${chip}</span>`,
    lead:'Une journée type : les créneaux de chaque pièce que règle Hestia. Choisissez une pièce, puis ses créneaux. Les pièces sur Scheduler se règlent dans Scheduler.'})}
   ${listSection('',[listRow({label:'Nom',control:true,value:html`<input class="name" type="text" maxlength="30" aria-label="Nom de la journée type" .value=${d.nom}
     @change=${(e:Event)=>{const name=(e.target as HTMLInputElement).value.trim();if(name)this.setPlan(x=>{x.journees[id].nom=name;});}}>`})])}
   ${mine.length||others.length?html`<div class="card">${lanes([
     ...mine.map(l=>({nom:l.nom,sub:l.id===lane?.id?'en cours':'Hestia',segments:slotSegments(d.creneaux[l.id]??[],l.id==='poele'),pick:()=>{this.editLane=l.id;},picked:l.id===lane?.id})),
     ...others.map(l=>({nom:l.nom,sub:owner(l)==='extension'?'suit Scheduler':'personne',segments:[],dim:true}))],null)}</div>`:nothing}
   ${lane?html`
    ${listSection(`${lane.nom} · créneaux`,[
      ...slots.map(([t,lv],i)=>listRow({label:html`<span class="slot">
        <input type="time" step="300" aria-label=${`Heure du créneau ${i+1}`} .value=${t} @change=${(e:Event)=>{const x=(e.target as HTMLInputElement).value;if(x)setSlots(s=>{s[i]=[x.slice(0,5),s[i][1]];return s;});}}>
        <select aria-label=${`Niveau du créneau ${i+1}`} @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;setSlots(s=>{s[i]=[s[i][0],x];return s;});}}>
         ${lane.niveaux.concat(lane.niveaux.includes(lv)?[]:[lv]).map(n=>html`<option value=${n} ?selected=${n===lv}>${levelName(lane,n)}</option>`)}</select>
        <button type="button" class="x" aria-label=${`Retirer le créneau de ${clockText(t)}`} @click=${()=>setSlots(s=>s.filter((_,j)=>j!==i))}>×</button></span>`})),
      ...(slots.length?[]:[listRow({label:'Aucun créneau',sub:'Sans créneau ce jour-là, la pièce garde son niveau de la veille.'})]),
      ...(slots.length<24?[listRow({label:'+ Ajouter un créneau',go:()=>setSlots(s=>{const last=s.length?minutesOf(s.at(-1)![0]):360,at=Math.min(last+120,1410);
        const lv=lane.niveaux.find(n=>n!==(s.at(-1)?.[1]))??lane.niveaux[0];return [...s,[`${String(Math.floor(at/60)).padStart(2,'0')}:${String(at%60).padStart(2,'0')}`,lv] as Slot];})})]:[]),
      ...(fromScheduler.length?[listRow({label:'Reprendre depuis Scheduler',sub:`Les créneaux de « ${lane.scheduler.join(', ')} » ${id==='weekend'?'le samedi':'le lundi'} : ${fromScheduler.map(([t,l])=>`${clockText(t)} ${LEVEL_WORD[l]??l}`).join(', ')}.`,
        go:()=>setSlots(()=>fromScheduler.map(x=>[...x] as Slot))})]:[]),
      ...(mine.length>1&&slots.length?[listRow({label:'Mêmes créneaux pour',control:true,value:html`<select aria-label="Copier ces créneaux vers une autre pièce" @change=${(e:Event)=>{const el=e.target as HTMLSelectElement,to=el.value;el.value='';
        if(to)this.setPlan(x=>{x.journees[id].creneaux[to]=slots.map(s=>[...s] as Slot);});}}>
        <option value="">choisir une pièce…</option>${mine.filter(l=>l.id!==lane.id).map(l=>html`<option value=${l.id}>${l.nom}</option>`)}</select>`})]:[]),
     ],{more:html`<span class="nk-def">${lane.thermostats.join(', ')}</span>`})}
    ${noteBox('Bon à savoir',lane.id==='poele'?'Le niveau va au thermostat du poêle, comme un préréglage. Ce sont vos automatisations (plus tard le pilote de Hestia) qui allument et éteignent le poêle selon ce préréglage.'
     :lane.vt?'Avant le premier créneau, la pièce garde le niveau de la veille au soir. Les niveaux sont les préréglages du thermostat (Versatile Thermostat) : Hestia choisit le préréglage, elle ne change jamais ses températures.'
     :'Ce n’est pas un Versatile Thermostat : Hestia lui envoie une consigne, réglable dans Réglages. Avant le premier créneau, la pièce garde le niveau de la veille au soir.')}`
    :listSection('',[listRow({label:'Aucune pièce sur Hestia',sub:'Toutes les pièces suivent Scheduler. Choisissez « Hestia » pour une pièce dans Réglages.',go:()=>this.go('reglages')})])}
   ${removable?listSection('',[listRow({label:'Supprimer cette journée type',sub:idx.length?'Ses jours de la semaine type passent sur une autre journée.':undefined,go:()=>{
     this.setPlan(x=>{delete x.journees[id];const first=Object.keys(x.journees)[0];x.semaine=x.semaine.map(k=>k===id?first:k);
      for(const [date,k] of Object.entries(x.jours))if(k===id)delete x.jours[date];if(x.feries===id)x.feries=null;});this.go('planning');}})]):nothing}
   <p class="say">Enregistrée, la journée compte dès le prochain créneau. Rien n’est renvoyé tout de suite.</p>`;
 }

 /* ── Réglages ── */
 private settingsPage(v:View){
  const s=this.settings;
  if(!s)return html`${this.head('Réglages',{lead:'Lecture…'})}`;
  const f=s.trouve,off=this.val<Record<string,boolean>>('sources')??{};
  const thermo=this.val<string|null>('poele_thermostat'),plug=this.val<string|null>('poele_prise');
  const setSource=(id:string,on:boolean)=>{const next={...off};if(on)delete next[id];else next[id]=false;this.set('sources',next);};
  const all=[...f.thermostats,...f.coupes.filter(c=>!f.thermostats.some(t=>t.id===c.id)).map(c=>({...c,piece:''}))];
  return html`${this.head('Réglages',{lead:'Le planning Hestia, puis ce que Hestia Chauffage lit. Laissé tel quel, elle prend ce qu’elle a trouvé.'})}
   ${this.planningSettings(v)}
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

 private planningSettings(v:View){
  const p=v.planning,m=this.plan(),lanesInfo=p.pieces??[];
  if(!lanesInfo.length)return nothing;
  const owner=(l:PlanLane)=>m.pieces[l.id]?.source??l.source;
  const hestia=lanesInfo.filter(l=>owner(l)==='hestia');
  const plain=hestia.filter(l=>!l.vt&&l.id!=='poele');
  const types=Object.entries(m.journees);
  const setOwner=(id:string,o:string)=>this.setPlan(x=>{x.pieces[id]={...(x.pieces[id]??{}),source:o};});
  const setTemp=(id:string,lv:string,t:number|undefined)=>this.setPlan(x=>{const e={...(x.pieces[id]??{})},temps={...(e.temperatures??{})};
   if(t==null)delete temps[lv];else temps[lv]=t;if(Object.keys(temps).length)e.temperatures=temps;else delete e.temperatures;x.pieces[id]=e;});
  const typeSelect=(label:string,value:string|null,set:(k:string|null)=>void,none?:string)=>html`<select aria-label=${label} @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;set(x||null);}}>
   ${none?html`<option value="" ?selected=${!value}>${none}</option>`:nothing}${types.map(([k,t])=>html`<option value=${k} ?selected=${value===k}>${t.nom}</option>`)}</select>`;
  return html`
   ${listSection('Planning Hestia',[
    listRow({label:'Le planning commande les thermostats',control:true,
     sub:p.labo?'Ici, les thermostats sont recopiés d’une autre maison (Remote Home Assistant) : le planning reste à l’ombre, un ordre pourrait atteindre les vrais.'
      :m.commande?'Au début de chaque créneau, il envoie un préréglage aux pièces sur Hestia.':'À l’ombre : il montre ce qu’il ferait, sans rien envoyer.',
     value:toggle('Le planning commande les thermostats',m.commande&&!p.labo,on=>this.setPlan(x=>{x.commande=on;}),p.labo)}),
    listRow({label:'Plus tôt les matins froids',control:true,sub:'Avec Hestia Weather : le premier créneau plus chaud du matin commence 5 minutes plus tôt par degré sous 10 °C dehors.',
     value:toggle('Plus tôt les matins froids',m.anticipation.actif,on=>this.setPlan(x=>{x.anticipation.actif=on;}))}),
    ...(m.anticipation.actif?[listRow({label:'Au plus tôt de',control:true,
     value:numberField({label:'Avance au plus',value:m.anticipation.max_min,unit:'min',dflt:60,step:5,min:0,max:120,set:x=>this.setPlan(y=>{y.anticipation.max_min=x??60;})})})]:[]),
   ],{help:html`<p>Au début de chaque créneau, le planning envoie un préréglage (confort, éco, hors gel, boost) aux pièces sur Hestia. Un autre thermostat reçoit une consigne.</p>
    <p>Il n’allume ni n’éteint jamais un thermostat : un thermostat éteint reste éteint. Il ne change aucun réglage de Versatile Thermostat ni de Scheduler.</p>
    <p>Un changement fait à la main tient jusqu’au créneau suivant. Un créneau manqué pendant un arrêt de Home Assistant est rattrapé au démarrage.</p>`})}
   ${listSection('Qui règle chaque pièce',lanesInfo.map(l=>{const o=owner(l),blocked=o==='hestia'&&l.scheduler_actif;
     return listRow({label:html`<b>${l.nom}</b>`,control:true,level:blocked?'todo':undefined,
      sub:blocked?`« ${l.scheduler_actif} » est encore allumé dans Scheduler : Hestia ne commande pas ${l.id==='poele'?'le poêle':'cette pièce'} tant qu’il l’est.`
       :[l.thermostats.join(', '),l.scheduler.length?`Scheduler : ${l.scheduler.join(', ')}`:'',o==='aucun'?'ni Hestia ni Scheduler : elle n’est pas dans le planning':''].filter(Boolean).join(' · '),
      value:html`<select aria-label=${`Qui règle ${l.nom}`} @change=${(e:Event)=>setOwner(l.id,(e.target as HTMLSelectElement).value)}>
       ${['hestia','extension','aucun'].filter(x=>x!=='extension'||l.scheduler.length||o==='extension').map(x=>html`<option value=${x} ?selected=${o===x}>${OWNER_WORD[x]}</option>`)}</select>`});}),
    {help:'Par défaut, une pièce visée par un planning Scheduler reste sur Scheduler, et les autres passent sur Hestia. Installer Hestia Chauffage ne change donc rien à ce qui marche déjà.'})}
   ${plain.length?listSection('Consignes des autres thermostats',plain.flatMap(l=>(l.froid?['confort','eco'] as const:['confort','eco','hors_gel'] as const).map(lv=>listRow({label:`${l.nom} · ${LEVEL_WORD[lv]}`,control:true,
     value:numberField({label:`${l.nom}, consigne ${LEVEL_WORD[lv]}`,value:m.pieces[l.id]?.temperatures?.[lv],unit:'°C',dflt:(l.froid?COOL:HEAT)[lv],
      step:.5,min:5,max:30,set:t=>setTemp(l.id,lv,t)})}))),{help:'Ces thermostats ne sont pas des Versatile Thermostat : le planning leur envoie une consigne plutôt qu’un préréglage. Une clim rafraîchit, ses consignes sont plus hautes.'}):nothing}
   ${hestia.length?listSection('Semaine type',[
    ...WEEK_LONG.map((day,i)=>listRow({label:day[0].toUpperCase()+day.slice(1),control:true,value:typeSelect(`Journée type du ${day}`,m.semaine[i],k=>this.setPlan(x=>{if(k)x.semaine[i]=k;}))})),
    listRow({label:'Un jour férié',control:true,sub:'D’après le capteur Jours ouvrés (Workday) de Home Assistant, s’il est installé.',
     value:typeSelect('Journée type d’un jour férié',m.feries,k=>this.setPlan(x=>{x.feries=k;}),'comme d’habitude')}),
   ],{more:html`<span class="nk-def">un seul jour : page Planning</span>`}):nothing}`;
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

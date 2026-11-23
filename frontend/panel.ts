import {LitElement,html,svg,nothing,css,type TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import {hubStyles,modernStyles,pageStyles,listSection,listRow,saveBar,toggle,helpTip,aboutPage,kpis,noteBox,moreRow,segmented,SOCLE} from './socle/ui';

/* The « Chauffage » tab of the Hestia-FB panel, after the v0.1 mock-up validated by Frank on 20 Nov. 2026
   (Accueil · Poêle), with a room's page, the plannings (the « planning simple » mock-up of 20 Nov.: the list, then one
   planning's week, its thermostats, « En essai » or « Actif »), Réglages, Extensions and À propos. The tab itself
   commands nothing: it edits the plannings as a draft, saved with the rest of the settings; the integration sends the
   presets, and only for the thermostats of a planning « Actif ».
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
 air:number|null;alarme:boolean|null;alarme_texte:string|null;eco_stop:boolean|null;ecritures:number|null;ecritures_max:number|null;ecritures_lues?:boolean;thermostat:string|null;
 thermostat_nom:string|null;demande_pct:number|null;consigne:number|null;preset:string|null;prise:string|null;prise_w:number|null;prise_tourne:boolean|null;
 entites:Record<string,string>;pilote?:Pilot};
type Pilot={mode:string;action?:string;titre?:string;texte?:string;ton?:string;flamme?:number|null;maison?:string;accord?:boolean|null;
 journal?:{heure:string;qui:string;texte:string;accord:boolean|null}[];accord_jour?:{oui:number;sur:number};
 accord_semaine?:{oui:number;sur:number;depuis:string;ecarts:{jour:string;heure:string;texte:string;hestia:string|null}[]};
 maison_c?:number|null;thermometre?:string|null;thermometre_lu?:boolean;flamme_basse?:string|null;
 commande?:{envois:number;max:number;lache:string|null;copie:boolean;attente:number|null;texte?:string}};
type Segment={de:number;a:number;ton:string};
type Lane={id:string;nom:string;segments:Segment[];thermostat?:string;source?:string|null;bloque?:boolean};
type Range=[string,string,string];
type Week='tous'|'semaine'|'chaque';
type Plan={nom:string;actif:boolean;jours:Week;reste:string;plages:Range[][];thermostats:string[]};
type Model={plannings:Record<string,Plan>};
type HPlan={id:string;nom:string;actif:boolean;poele:boolean;thermostats:{id:string;nom:string;lu:boolean}[];maintenant:string|null;
 prochain:{a:string;texte:string}|null;allumages:number|null;bloques:{id:string;nom:string;scheduler:string}[];recopie:boolean;verrouilles?:{id:string;nom:string}[]};
type Therm={id:string;nom:string;piece:string|null;poele:boolean;vt:boolean;froid:boolean;recopie:boolean;autorise?:boolean;planning:string|null;
 scheduler:string[];scheduler_actif:string|null;niveaux:string[];consignes:Record<string,number>|null};
type Sched={id:string;nom:string;actif:boolean;jours:string[];partiel:boolean;cibles:string[];reprise:Plan|null};
type Journal={jour:string;heure:string;planning:string;thermostats:string[];niveau:string;statut:string;texte:string};
type Planning={source:string|null;labo:boolean;essai:boolean;jour:string;jour_nom:string;maintenant_min:number;lignes:Lane[];
 prochains:{a:string;heure:string;texte:string}[];hestia:HPlan[];thermostats:Therm[];scheduler:Sched[];journal:Journal[]};
type Todo={titre:string;texte:string;page:string};
type Ext={id:string;groupe:string;nom:string;installee:boolean;utilisee:boolean;usage:string;sans:string;lien:string|null;trouve:number;
 lieu?:string|null;lieu_nom?:string|null;lieux?:{id:string;nom:string}[]};
type House={etat:string;titre:string;texte:string;temperature:number|null;en_chauffe:number;pieces:number;electrique_w:number;en_marche:string[]};
type View={pret:boolean;version:string;maison:House;pieces:Room[];sources:Source[];poele:Stove|null;granules:Pellets|null;
 dehors:{nuit_min:number|null;demain_max:number|null}|null;planning:Planning;a_regler:Todo[];extensions:Ext[];meteo:{etat:string;nom:string|null};
 mis_a_jour:string;calcul_ms:number|null};
type Day={debut:string;maintenant_min:number;series:Record<string,[number,number|null][]>};
type Settings={reglages:{sources:Record<string,boolean>;extensions:Record<string,boolean>;poele_thermostat:string|null;poele_prise:string|null;weather_place:string|null;planning:Model;pilote:string;pilote_thermometre:string|null;planning_autorises:string[];pilote_flamme_basse:string|null};
 trouve:{thermostats:{id:string;nom:string;piece:string}[];coupes:{id:string;nom:string}[];poele:boolean;poele_thermostat:string|null;
  prises:{id:string;nom:string;poele:boolean}[];prise:string|null;thermometres:{id:string;nom:string;maison:boolean}[];interrupteurs?:{id:string;nom:string}[];poele_copie?:boolean;meteo:{etat:string;lieu:string|null;nom:string|null;lieux:{id:string;nom:string}[]|null}}};

const REPO='https://github.com/hestiaFB/hestia-heating-integration';
const VERSION='0.5.0b1';
const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
/** « 2026-11-21 » → « 21 nov. ». */
const dayOf=(iso:string)=>new Date(iso+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
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
// The four levels of a planning, as the mock-up shows them; their colours are the classes lv-<level>.
const LEVELS=['confort','eco','boost','hors_gel'];
const LEVEL_LABEL:Record<string,string>={confort:'Confort',eco:'Éco',boost:'Boost',hors_gel:'Hors gel'};
// What became of a change, for each thermostat, in the journal.
const FATE_TONE:Record<string,string>={envoye:'calm',deja:'off',ombre:'off',bloque:'alert',recopie:'off',eteint:'act',sans_prereglage:'act',verrou:'act'};
const WEEK_LONG=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const ROWS:Record<Week,[string,string][]>={tous:[['Tous les jours','7 jours']],semaine:[['Lundi → vendredi','5 jours'],['Samedi, dimanche','2 jours']],
 chaque:WEEK_LONG.map(d=>[d[0].toUpperCase()+d.slice(1),''] as [string,string])};
const ROW_SAY:Record<Week,string[]>={tous:['Tous les jours'],semaine:['Du lundi au vendredi','Samedi et dimanche'],chaque:WEEK_LONG.map(d=>d[0].toUpperCase()+d.slice(1))};
const EMPTY_MODEL:Model={plannings:{}};
const minutesOf=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+(m||0);};
const clockOf2=(m:number)=>m>=1440?'24:00':`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const hourText=(m:number)=>m>=1440?'24 h':m%60?`${Math.floor(m/60)} h ${String(m%60).padStart(2,'0')}`:`${m/60} h`;
const endOf=(r:Range)=>minutesOf(r[1])||1440;
/** The ranges of a day of the week (Monday 0), as home_planning.py reads them. */
function rowOf(p:Plan,wd:number):Range[]{const r=p.plages;return p.jours==='chaque'&&r.length===7?r[wd]:p.jours==='semaine'&&r.length===2?r[wd<5?0:1]:r[0]??[];}
/** The whole day in segments: each moment takes the range that started last among those covering it, else the rest
    of the time (as home_planning.day_segments). */
function daySegments(ranges:Range[],rest:string):Segment[]{
 const spans=ranges.map((r,i)=>({s:minutesOf(r[0]),e:endOf(r),l:r[2],i})).filter(x=>x.e>x.s);
 const cuts=[...new Set([0,1440,...spans.flatMap(x=>[x.s,x.e])])].sort((a,b)=>a-b),out:Segment[]=[];
 for(let k=0;k<cuts.length-1;k++){const a=cuts[k],b=cuts[k+1],cover=spans.filter(x=>x.s<=a&&a<x.e);
  const l=cover.length?cover.reduce((x,y)=>y.s>x.s||(y.s===x.s&&y.i>x.i)?y:x).l:rest,last=out.at(-1);
  if(last&&last.ton===l)last.a=b;else out.push({de:a,a:b,ton:l});}
 return out;
}
/** How many times a week the planning steps up to boost: for the stove's thermostat, how many times it would light. */
function startsPerWeek(p:Plan){const lv=Array.from({length:7},(_,d)=>daySegments(rowOf(p,d),p.reste)).flat().map(s=>s.ton);
 return new Set(lv).size<2?0:lv.filter((l,i)=>l==='boost'&&lv.at(i-1)!=='boost').length;}
/** A planning's week in another shape: each new row starts from the day it stands for. */
function reshape(p:Plan,to:Week):Range[][]{
 const day=(wd:number)=>rowOf(p,wd).map(x=>[...x] as Range);
 return to==='tous'?[day(0)]:to==='semaine'?[day(0),day(5)]:Array.from({length:7},(_,wd)=>day(wd));
}
/** « Du lundi au vendredi : Confort de 6 h 30 à 8 h 30… Le reste du temps : Éco. » */
function planSay(p:Plan){
 return p.plages.map((r,i)=>`${ROW_SAY[p.jours][i]} : ${r.length?r.map(x=>`${LEVEL_LABEL[x[2]]} de ${hourText(minutesOf(x[0]))} à ${hourText(endOf(x))}`).join(', '):'rien de plus'}`).join('. ')
  +`. Le reste du temps : ${LEVEL_LABEL[p.reste]}.`;
}

/* ── Drawings: the day's curves ── *//* ── Drawings: the day's curves and the planning's lanes ── */
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
@customElement('hestia-heating-setup')
export class HestiaHeatingSetup extends LitElement {
 static styles=[hubStyles,modernStyles,pageStyles,css`
  :host{--hc-heat:oklch(.83 .085 42);--hc-cold:oklch(.85 .05 220);--hc-calm:oklch(.83 .075 150);--hc-act:oklch(.81 .105 64);--hc-alert:oklch(.74 .115 18);
   --hc-stove:oklch(.86 .1 80);--hc-ink:62%;--hc-tint:40%;--hc-off:color-mix(in srgb,var(--primary-text-color) 30%,transparent);
   --lv-confort:color-mix(in oklab,var(--hc-heat) 88%,var(--nk-surface,#fff));--lv-eco:color-mix(in oklab,var(--hc-cold) 80%,var(--nk-surface,#fff));
   --lv-boost:color-mix(in oklab,var(--hc-stove) 96%,var(--nk-surface,#fff));--lv-hors_gel:color-mix(in srgb,var(--primary-text-color) 15%,var(--nk-surface,#fff))}
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
  .nk-lsec>.card{margin:0}
  .lv-confort{--lv:var(--lv-confort)}.lv-eco{--lv:var(--lv-eco)}.lv-boost{--lv:var(--lv-boost)}.lv-hors_gel{--lv:var(--lv-hors_gel)}
  .plan-top{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 16px}.plan-top>div{flex:1 1 320px;min-width:0}
  .plan-top .lead{margin-bottom:0}
  button.add{display:inline-flex;align-items:center;gap:8px;font-weight:650}
  .states{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:var(--nw-fs-small,12px);color:var(--nk-muted);margin:14px 0 18px}
  .states span{display:inline-flex;align-items:center;gap:8px}
  .st{display:inline-flex;align-items:center;font-size:var(--nw-fs-small,12px);font-weight:650;padding:3px 10px;border-radius:999px;white-space:nowrap;
   background:color-mix(in oklab,var(--c) var(--hc-tint),transparent);color:color-mix(in oklab,var(--c) var(--hc-ink),var(--primary-text-color))}
  .st.essai{--c:var(--hc-act)}.st.actif{--c:var(--hc-calm)}
  .plan{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:18px;padding:16px 18px;margin:0 0 14px;display:flex;flex-direction:column;gap:14px}
  .plan-h{display:flex;flex-wrap:wrap;align-items:center;gap:10px}.plan-h h2{margin:0;font-size:var(--nw-fs-title,17px);font-weight:650}
  .plan-h .grow{flex:1 1 auto}.plan-h button{min-height:40px;padding:6px 16px;font-weight:600}
  .mini{display:flex;flex-direction:column;gap:5px}
  .mini .r,.ed .r,.ed .scale{display:grid;grid-template-columns:22px minmax(0,1fr);gap:10px;align-items:center}
  .mini .r>b{font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}.mini .r.today>b{color:var(--primary-text-color)}
  .scale>div{position:relative;height:15px;font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}
  .scale>div span{position:absolute;transform:translateX(-50%);white-space:nowrap}.scale>div span:first-child{transform:none}.scale>div span:last-child{transform:translateX(-100%)}
  .bar7{position:relative;height:11px;border-radius:5px;overflow:hidden;background:var(--lv)}
  .bar7 i{position:absolute;top:0;bottom:0;background:var(--lv)}
  .bar7 .now,.track .now{position:absolute;top:0;bottom:0;width:2px;background:var(--primary-text-color)}
  .chips{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.chips>small{color:var(--nk-muted);margin-right:4px}
  .tchip{font-size:var(--nw-fs-small,12px);font-weight:600;padding:4px 12px;border-radius:999px;background:var(--nk-selected,var(--nk-surface))}
  .plan-now{margin:0;border-top:1px solid var(--nk-border);padding-top:12px;font-size:var(--nw-fs-small,12px)}
  .plan-now.bad{color:color-mix(in oklab,var(--hc-alert) var(--hc-ink),var(--primary-text-color));border-top:0;padding-top:0;margin-top:-8px}
  .levels{display:flex;flex-wrap:wrap;justify-content:center;gap:6px 18px;font-size:var(--nw-fs-small,12px);color:var(--nk-muted);margin:6px 0 24px}
  .levels span{display:inline-flex;align-items:center;gap:6px}.levels i{width:16px;height:9px;border-radius:3px;background:var(--lv)}.levels .all{flex-basis:100%;justify-content:center}
  .field-l{display:block;font-size:var(--nw-fs-label,11px);font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:var(--nk-muted);margin:0 0 6px 4px}
  .plan-name{max-width:420px;font-size:var(--nw-fs-title,17px);font-weight:650;margin:0 0 22px}
  .ed{display:flex;flex-direction:column;gap:14px}
  .ed-h{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}.ed-h h2,.box h2{margin:0;font-size:var(--nw-fs-title,17px);font-weight:650}
  .ed .r,.ed .scale{grid-template-columns:132px minmax(0,1fr);gap:12px;align-items:start}
  .ed .r>div:first-child{display:flex;flex-direction:column;padding-top:6px;min-width:0}.ed .r>div:first-child b{font-size:var(--nw-fs-small,12px)}
  .ed .r>div:first-child small{font-size:var(--nw-fs-label,11px);color:var(--nk-muted)}
  .ed .r>div:last-child{display:flex;flex-direction:column;gap:6px;min-width:0}
  .track{position:relative;height:50px;border-radius:10px;overflow:hidden;background:var(--lv)}
  .track>i{position:absolute;top:0;bottom:0;width:1px;background:color-mix(in srgb,var(--primary-text-color) 12%,transparent)}
  .track button{position:absolute;top:0;bottom:0;border:0;border-radius:0;margin:0;padding:0 8px;min-height:0;min-width:0;background:var(--lv);color:#1f2328;text-align:left;overflow:hidden;
   display:flex;flex-direction:column;justify-content:center;align-items:flex-start;white-space:nowrap;line-height:1.3;box-shadow:inset 0 0 0 1px color-mix(in srgb,#1f2328 18%,transparent);container-type:inline-size}
  @container (max-width:56px){.track button b{display:none}}@container (max-width:92px){.track button span{display:none}}
  .track button.lv-hors_gel{color:var(--primary-text-color)}
  .track button b{font-size:var(--nw-fs-small,12px)}.track button span{font-size:var(--nw-fs-label,11px)}
  .track button[aria-pressed=true]{box-shadow:inset 0 0 0 3px var(--nk-accent,var(--primary-color))}
  button.more{align-self:flex-start;min-height:32px;padding:0 10px;border-radius:999px;border:1px dashed var(--nk-border);font-weight:600;font-size:var(--nw-fs-small,12px)}
  .rest{display:flex;flex-wrap:wrap;align-items:center;gap:10px;border-top:1px solid var(--nk-border);padding-top:14px}
  .rest label{font-weight:600}.rest select{width:auto;margin:0;min-height:40px;padding:6px 12px}.rest small{color:var(--nk-muted);font-size:var(--nw-fs-small,12px)}
  .selbox{border:1px solid color-mix(in oklab,var(--nk-accent) 45%,var(--nk-border));background:color-mix(in oklab,var(--nk-accent) 7%,var(--nk-surface));border-radius:14px;padding:14px 16px;display:flex;flex-direction:column;gap:12px}
  .selbox .times{display:flex;flex-wrap:wrap;align-items:center;gap:10px}.selbox .times label{font-weight:600}
  .selbox input[type=time]{width:auto;margin:0;min-height:40px;padding:6px 10px;min-width:7.5em}
  .lvl{display:flex;flex-wrap:wrap;gap:6px}.lvl button{min-height:40px;padding:6px 14px;border-width:2px;font-weight:600;display:inline-flex;align-items:center;gap:8px}
  .lvl button i{width:14px;height:14px;border-radius:4px;background:var(--lv)}.lvl button[aria-pressed=true]{border-color:var(--nk-accent,var(--primary-color))}
  .warn{font-size:var(--nw-fs-small,12px);color:color-mix(in oklab,var(--hc-act) var(--hc-ink),var(--primary-text-color))}
  button.del{align-self:flex-start;min-height:36px;padding:0 12px;color:color-mix(in oklab,var(--hc-alert) var(--hc-ink),var(--primary-text-color));font-weight:600;font-size:var(--nw-fs-small,12px)}
  .hint{margin:0;font-size:var(--nw-fs-small,12px);color:var(--nk-muted)}
  .hint.after{margin:-12px 4px 22px}.hint.inline{display:inline}.box>.hint:last-child{margin-top:6px}
  .stove-say{margin:0;font-size:var(--nw-fs-small,12px);background:color-mix(in oklab,var(--hc-stove) 16%,transparent);border-radius:10px;padding:10px 12px}
  .box{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:18px;padding:16px 18px;margin:0 0 22px;display:flex;flex-direction:column;gap:6px}
  .box>.card{margin:0}
  .tick{display:flex;align-items:center;gap:12px;min-height:48px;padding:4px;border-top:1px solid var(--nk-border);cursor:pointer}.tick:first-of-type{border-top:0}
  .tick input{margin:0;flex:0 0 auto}.tick span{flex:1;min-width:0;display:flex;flex-direction:column}.tick small{font-size:var(--nw-fs-small,12px);color:var(--nk-muted)}
  .tick small.warn{color:color-mix(in oklab,var(--hc-act) var(--hc-ink),var(--primary-text-color))}
  .modes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:6px}
  .modes button{min-height:76px;text-align:left;padding:12px 14px;border-radius:14px;border-width:2px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:2px;line-height:1.4}
  .modes button span{font-size:var(--nw-fs-small,12px);color:var(--nk-muted)}
  .modes button[aria-pressed=true]{border-color:var(--nk-accent,var(--primary-color))}
  .modes button.essai[aria-pressed=true]{background:color-mix(in oklab,var(--hc-act) 22%,var(--nk-surface))}.modes button.actif[aria-pressed=true]{background:color-mix(in oklab,var(--hc-calm) 26%,var(--nk-surface))}
  .actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:0 0 22px}.actions .grow{flex:1 1 auto}.actions .primary{min-width:150px}
  .eid{font-family:ui-monospace,monospace;font-size:var(--nw-fs-label,11px);color:var(--nk-muted);word-break:break-all}
  .ext-act{display:inline-flex;align-items:center;min-height:32px;padding:5px 12px;border-radius:999px;background:var(--nk-button,var(--primary-color));color:var(--nk-on-button,#fff);font-weight:600;font-size:var(--nw-fs-small,12px);text-decoration:none;white-space:nowrap}
  select{max-width:220px}
  @media(max-width:640px){.ed .r,.ed .scale{grid-template-columns:76px minmax(0,1fr);gap:8px}.modes{grid-template-columns:1fr}.band h1{font-size:var(--nw-fs-case,21px)}.target{text-align:left}}`];
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
 @state() private sel?:{r:number;i:number};
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
 private go(path:string){this.sel=undefined;history.pushState(null,'',(this.route?.prefix??'/hestia/chauffage')+(path?'/'+path:''));window.dispatchEvent(new CustomEvent('location-changed'));window.scrollTo(0,0);}
 private openHa(path:string){history.pushState(null,'',path);window.dispatchEvent(new CustomEvent('location-changed'));}

 /* ── The draft: one way to save everywhere ── */
 private stored(k:string){return (this.settings?.reglages as Record<string,unknown>|undefined)?.[k];}
 private val<T=unknown>(k:string):T{return (k in this.draft?this.draft[k]:this.stored(k)) as T;}
 private set(k:string,v:unknown){const d={...this.draft};if(JSON.stringify(v??null)===JSON.stringify(this.stored(k)??null))delete d[k];else d[k]=v;this.draft=d;this.saved=false;this.refused=undefined;}
 /** The plannings as they stand in the draft: a copy to change, then put back whole (they are saved whole). */
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
  const [p,sub]=this.parts();
  const pages:Record<string,()=>TemplateResult>={'':()=>this.home(v),poele:()=>this.stovePage(v),pieces:()=>sub?this.roomPage(v,sub):this.home(v),
   planning:()=>sub?this.editorPage(v,decodeURIComponent(sub)):this.planningPage(v),reglages:()=>this.settingsPage(v),
   extensions:()=>sub?this.extensionPage(v,sub):this.extensionsPage(v),'a-propos':()=>this.aboutPage(v)};
  return html`<main>${this.refused?noteBox('Pas enregistré',this.refused):nothing}${(pages[p]??pages[''])()}</main>
   ${p==='planning'&&sub?nothing:saveBar({count:this.count(),busy:this.saving,done:this.saved?'Enregistré':undefined,cancel:()=>{this.draft={};},save:()=>void this.save()})}`;
 }

 /* ── Common pieces ── */
 private head(title:string,o:{back?:[string,string];pill?:[string,string];lead?:unknown;help?:string;chips?:unknown}={}){
  return html`${o.back?html`<button class="crumb" @click=${()=>this.go(o.back![0])}>‹ ${o.back[1]}</button>`:nothing}<h1 tabindex="-1">${title}</h1>
   <div class="lead">${o.pill?html`<span class=${'pill '+o.pill[0]}>${o.pill[1]}</span>`:nothing}${o.chips??nothing}${o.lead?html`<p>${o.lead}</p>`:nothing}${o.help?helpTip(title,o.help,''):nothing}</div>`;
 }
 private chip(b:Badge){return html`<span class=${'chip '+b.ton}>${b.texte}</span>`;}
 /** What Hestia sends, said once at the foot of the pages. */
 private modeNote(v:View){
  const p=v.planning,active=(p.hestia??[]).filter(h=>h.actif&&h.thermostats.length);
  if(p.labo)return noteBox('À l’ombre','Ici, les thermostats sont recopiés d’une autre maison (Remote Home Assistant) : aucun planning ne leur envoie rien, un ordre pourrait atteindre les vrais.');
  if(!active.length)return noteBox('Lecture seule','Hestia Chauffage lit la maison sans rien commander. Seul un planning « Actif » règle des thermostats, et seulement leur préréglage.');
  return noteBox(active.length>1?'Plannings actifs':'Un planning actif',`${active.map(h=>`« ${h.nom} »`).join(', ')} : quand une plage commence ou finit, Hestia règle le préréglage de ${active.length>1?'leurs':'ses'} thermostats. Elle n’allume ni n’éteint jamais un thermostat, et ne commande jamais le poêle lui-même.`);
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
   ${listSection('Planning',[listRow({label:html`<b>${v.planning.prochains.length?'Prochains changements':(v.planning.hestia??[]).length?'Les plannings':'Créer un planning'}</b>`,name:'Planning',
     sub:v.planning.prochains.slice(0,3).map(n=>`${n.heure} ${n.texte}`).join(' · ')||((v.planning.hestia??[]).length?'Aucun changement prévu.':'Une semaine en couleurs, pour les thermostats que vous choisissez.'),go:()=>this.go('planning')})],
     {more:v.planning.source?html`<span class="nk-def">${v.planning.source}</span>`:undefined})}
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
    ...(writes?[listRow({label:'Ordres reçus aujourd’hui',sub:s.ecritures_max?`L’extension du poêle en laisse passer ${s.ecritures_max} par jour${s.ecritures_lues?' (lu dans ses options)':''}, pour ménager sa mémoire.`:undefined,value:writes})]:[]),
   ],{more:html`<span class="nk-def">profil ${s.profil_nom}${s.cloud?' · par le cloud':''}</span>`})}
   ${this.pilotPart(s)}
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
   ${s.pilote?.mode==='ombre'?noteBox('À l’ombre','Le pilote du poêle ne commande rien : il calcule ce qu’il ferait et le compare à ce que font vos automatisations. Dans Réglages, il peut régler la flamme, et seulement elle.')
     :s.pilote?.mode==='flamme'?noteBox('La flamme','Hestia règle la flamme du poêle, et seulement elle : le démarrage, l’arrêt et les sécurités restent à vos automatisations. Si la flamme change sans elle, elle la laisse jusqu’au lendemain.'):this.modeNote(v)}`;
 }
 /** The pilot, in shadow or flame mode: what Hestia does or would do, what the house does, and today's journal. */
 private pilotPart(s:Stove){
  const p=s.pilote;
  if(!p||(p.mode!=='ombre'&&p.mode!=='flamme'))return nothing;
  const steer=p.mode==='flamme'?p.commande:undefined;
  const agree=(ok:boolean|null|undefined,yes:string,no:string)=>ok==null?nothing:html`<span class=${'chip '+(ok?'calm':'act')}>${ok?yes:no}</span>`;
  const day=p.accord_jour,week=p.accord_semaine;
  const rules:[string,string][]=[
   ['Démarrage','Au passage du thermostat en boost (ou en chauffe, déjà en boost), le poêle éteint. Jamais de lui-même. Pas si le thermostat est éteint, le poêle en alarme ou muet, sa pièce au-dessus de 28 °C, ou la maison déjà à la consigne. En saison douce (la maison à 18 °C ou plus), il vous demande d’abord.'],
   ['Flamme','La demande du thermostat : 85 % donne 5, 65 % donne 4, 45 % donne 3, sinon 2. La flamme du poêle tient tant qu’elle reste dans les paliers de la demande ± 7 points. Flamme 1 si la pièce va dépasser sa consigne de 0,5 °C dans 15 min, et tant qu’elle y reste. Baisse tout de suite, hausse 30 min après le dernier changement de flamme, sauf deux paliers d’écart.'],
   ['Ordres du jour',`Il en garde 4 pour pouvoir éteindre (l’extension du poêle en laisse passer ${s.ecritures_max??20} par jour).${steer?` Hestia elle-même : 12 ordres par jour au plus, un à la fois, vérifié 5 min après, renvoyé au plus toutes les 10 min.`:''}`],
   ['Arrêt','Thermostat hors gel, éteint 30 s, ou la maison assez chaude 2 min (à 1 °C ou moins de la consigne, ou à la consigne en boost). Confirmé par l’état du poêle, ses fumées sous 60 °C ou sa prise sous 70 W.'],
   ['Sécurités','Une alarme qui dure 2 min, la pièce du poêle au-dessus de 28 °C : il coupe. Le poêle muet 15 min : il vous prévient.']];
  return html`${steer?.lache?noteBox('Flamme laissée',steer.lache):nothing}
   ${steer?.copie?noteBox('Labo','Ce poêle est recopié d’une autre maison : Hestia ne lui envoie jamais rien. La flamme reste à l’ombre.'):nothing}
   ${listSection(steer?'Le pilote règle la flamme':'Le pilote, à l’ombre',[
    listRow({label:html`<b>${steer?'Hestia fait':'Hestia ferait'}</b>`,sub:steer&&p.action!=='flamme'&&p.action!=='garder'&&p.action!=='attendre'?`${p.texte} Ce geste reste à vos automatisations : Hestia ne règle que la flamme.`:p.texte,
     value:html`<span class=${'chip '+(p.ton??'off')}>${p.titre}</span>`}),
    ...(steer?[listRow({label:'Ordres de Hestia aujourd’hui',sub:steer.texte??(steer.attente!=null?`Flamme ${steer.attente} demandée : vérifiée dans 5 min.`:'Un ordre à la fois, vérifié 5 min après.'),value:`${steer.envois} / ${steer.max}`})]:[]),
    listRow({label:html`<b>La maison fait</b>`,sub:day?.sur?`Aujourd’hui, la maison a fait comme Hestia ${day.oui} fois sur ${day.sur}.`:'Ce que font vos automatisations, vu de dehors : l’état du poêle et sa flamme.',
     value:html`<span class="vals">${p.maison??'—'}${agree(p.accord,'d’accord','autrement')}</span>`}),
    ...(week?.sur?[listRow({label:html`<b>Depuis le ${dayOf(week.depuis)}</b>`,sub:week.ecarts.length?'Les derniers écarts sont juste en dessous.':'Aucun écart : la maison a toujours fait comme Hestia.',
      value:html`<span class=${'chip '+(week.oui===week.sur?'calm':'act')}>d’accord ${week.oui} fois sur ${week.sur}</span>`}),
     ...(week.ecarts.length?[moreRow('Les écarts',String(week.ecarts.length),week.ecarts.map(g=>listRow({label:html`<b>${dayOf(g.jour)}, ${g.heure}</b> · ${g.texte}`,
      sub:g.hestia?`Juste avant : ${g.hestia}`:undefined})))]:[])]:[]),
    ...(p.flamme_basse?[listRow({label:'Flamme au plus bas',sub:`Quand « ${p.flamme_basse} » est allumé, le pilote met la flamme au plus bas.`})]:[]),
    listRow({label:'La température de la maison',sub:p.thermometre?(p.thermometre_lu?`Lue sur « ${p.thermometre} », comme vos automatisations.`:`« ${p.thermometre} » ne donne rien : le pilote ne démarrerait pas le poêle.`)
      :'La moyenne des pièces. Si vos automatisations lisent un autre capteur, choisissez-le dans Réglages.',
     level:p.thermometre&&!p.thermometre_lu?'todo':undefined,value:deg(p.maison_c),go:()=>this.go('reglages')}),
    moreRow('Ses règles',String(rules.length),rules.map(([n,t])=>listRow({label:n,sub:t}))),
   ],{more:html`<span class="nk-def">${steer&&!steer.copie?'la flamme seulement':'rien n’est envoyé'}</span>`,help:steer?'Le pilote suit le thermostat du poêle : il décide quand démarrer, quelle flamme et quand arrêter. Hestia n’envoie que la flamme ; le démarrage et l’arrêt, elle ne fait que les dire, à côté de ce que fait la maison.':'Le pilote suit le thermostat du poêle : il décide quand démarrer, quelle flamme et quand arrêter. À l’ombre, il ne fait que le dire, à côté de ce que fait la maison.'})}
   ${p.journal?.length?listSection('Le pilote aujourd’hui',[...p.journal].reverse().map(j=>listRow({label:html`<b>${j.heure}</b> · ${j.texte}`,value:agree(j.accord,'comme Hestia','autrement')}))):nothing}`;
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
    ${r.demande_pct?html`<div class="say" style="margin-top:14px">Demande du thermostat : <b>${r.demande_pct} %</b>${r.puissance_w?` · ${watts(r.puissance_w)}`:''}</div><div class="bar"><i style=${`width:${r.demande_pct}%`}></i></div>`:nothing}
    ${day&&day.series.temperature?.length?html`${dayChart([{pts:day.series.temperature,cls:'temp'},{pts:day.series.consigne??[],cls:'target',step:true}],day.maintenant_min,`Température et consigne de ${r.nom} aujourd’hui`)}
     <div class="legend"><span><i class="sw temp"></i>température</span><span><i class="sw target"></i>consigne</span></div>`:nothing}</div>
   ${listSection(srcs.length>1?'Ses thermostats':'Son thermostat',srcs.map(s=>listRow({label:html`<b>${s.nom}</b>`,name:s.nom,
     sub:[KIND[s.type]??s.type,s.mode?MODE[s.mode]??s.mode:'',s.preset?`préréglage ${PRESET[s.preset]??s.preset}`:'',s.fenetre?'fenêtre ouverte':'',s.delestage?'délesté':'',s.securite?'en sécurité':'',
      s.humidite!=null?`humidité ${num(s.humidite,0)} %`:''].filter(Boolean).join(' · '),
     value:html`<span class="t">${s.type==='poele'?(v.poele?STOVE_WORD[v.poele.etat]:'—'):s.etat==='chauffe'&&s.puissance_w?watts(s.puissance_w):s.etat==='chauffe'?'chauffe':s.etat==='rafraichit'?'rafraîchit':s.etat==='arret'?'arrêt':s.etat==='inconnu'?'ne répond pas':'au repos'}${s.consigne!=null?html`<small>consigne ${deg(s.consigne)}</small>`:nothing}</span>`})))}
   ${listSection('',[moreRow('Entités lues',String(srcs.length),srcs.map(s=>listRow({label:html`<span class="eid">${s.entite}</span>`,value:s.integration??''})))])}`;
 }

 /* ── Planning: the list, then one planning ── */
 private thermName(v:View,id:string){return v.planning.thermostats.find(t=>t.id===id)?.nom??v.sources.find(s=>s.id===id)?.nom??id;}
 private stoveId(v:View){return v.planning.thermostats.find(t=>t.poele)?.id;}
 private savedPlans():Record<string,Plan>{return this.settings?.reglages.planning?.plannings??{};}
 /** A new planning in the draft, from scratch or from a Scheduler schedule; its thermostats leave any other planning. */
 private create(from?:Plan){
  const id='p'+Date.now().toString(36);
  const p:Plan=from?structuredClone(from):{nom:'Nouveau planning',actif:false,jours:'semaine',reste:'eco',
   plages:[[['06:30','08:30','confort'],['17:00','22:30','confort']],[['08:00','22:30','confort']]],thermostats:[]};
  this.setPlan(m=>{for(const o of Object.values(m.plannings))o.thermostats=o.thermostats.filter(t=>!p.thermostats.includes(t));m.plannings[id]=p;});
  this.go('planning/'+id);
 }
 private dropPlanningDraft(){const d={...this.draft};delete d.planning;this.draft=d;this.refused=undefined;}
 /** A planning's seven days, small: the list's picture of it. */
 private miniWeek(p:Plan,v:View){
  const today=(new Date(v.planning.jour+'T12:00:00').getDay()+6)%7,now=v.planning.maintenant_min/14.4;
  return html`<div class="mini" role="img" aria-label=${`${p.nom}. ${planSay(p)}`}>
   <div class="r scale"><span></span><div>${[0,6,12,18,24].map(h=>html`<span style=${`left:${h/24*100}%`}>${h} h</span>`)}</div></div>
   ${WEEK_LONG.map((d,wd)=>html`<div class=${'r'+(wd===today?' today':'')}><b>${d[0].toUpperCase()}</b>
    <div class=${'bar7 lv-'+p.reste}>${daySegments(rowOf(p,wd),p.reste).filter(s=>s.ton!==p.reste).map(s=>html`<i class=${'lv-'+s.ton} style=${`left:${s.de/14.4}%;width:${(s.a-s.de)/14.4}%`}></i>`)}${wd===today?html`<span class="now" style=${`left:${now}%`}></span>`:nothing}</div></div>`)}</div>`;
 }
 private planningPage(v:View){
  const p=v.planning,m=this.plan(),ids=Object.keys(m.plannings),status=new Map((p.hestia??[]).map(h=>[h.id,h]));
  const used=new Set(ids.flatMap(id=>{const x=m.plannings[id];return [x.reste,...x.plages.flat().map(r=>r[2])];}));
  return html`<div class="plan-top"><div>${this.head('Planning',{lead:'Un planning, c’est une semaine en couleurs. Il règle les thermostats que vous lui donnez.'})}</div>
    <button type="button" class="primary add" @click=${()=>this.create()}>+ Créer un planning</button></div>
   <div class="states"><span><span class="st essai">En essai</span>Hestia montre ce qu’elle ferait, sans rien envoyer.</span><span><span class="st actif">Actif</span>Hestia règle ces thermostats.</span></div>
   ${ids.length?ids.map(id=>this.planCard(v,id,m.plannings[id],status.get(id)))
    :html`<div class="card"><p class="say" style="margin:0">Aucun planning pour l’instant. Créez-en un : une semaine en couleurs, puis les thermostats qu’il règle.</p></div>`}
   ${ids.length?html`<div class="levels">${LEVELS.filter(l=>used.has(l)).map(l=>html`<span class=${'lv-'+l}><i></i>${LEVEL_LABEL[l]}</span>`)}
    ${this.stoveId(v)?html`<span class="all">Pour le poêle : Boost l’allume, Hors gel l’éteint.</span>`:nothing}</div>`:nothing}
   ${(p.scheduler??[]).length?html`${listSection('Plannings de Scheduler',p.scheduler.map(x=>listRow({label:html`<b>${x.nom}</b>`,name:x.nom,level:x.partiel?'todo':undefined,
     sub:`${x.actif?'Allumé':'Coupé'} · règle ${x.cibles.join(', ')}${x.partiel?' · une plage au lever ou au coucher du soleil n’est pas lue':''}`,
     value:x.reprise?html`<button type="button" @click=${()=>this.create(x.reprise!)}>Reprendre dans Hestia</button>`:undefined})),{more:html`<span class="nk-def">l’extension, lue sans y toucher</span>`})}
    <p class="hint after">Un thermostat suit un seul planning. « Reprendre dans Hestia » recopie ce planning ici ; vous coupez ensuite celui de Scheduler.</p>`:nothing}
   ${(p.journal??[]).length?listSection('',[moreRow('Ce qu’a fait Hestia aujourd’hui',String(p.journal.length),[...p.journal].reverse().map(j=>listRow({label:html`<b>${j.heure}</b> · ${j.planning} : ${j.niveau}`,
     sub:j.thermostats.join(', '),value:html`<span class=${'chip '+(FATE_TONE[j.statut]??'off')}>${j.texte}</span>`})))]):nothing}
   ${p.labo?noteBox('Labo','Ici, les thermostats sont recopiés d’une autre maison (Remote Home Assistant) : Hestia ne leur envoie rien, même avec un planning actif. Un ordre pourrait atteindre les vrais.'):nothing}`;
 }
 private planCard(v:View,id:string,p:Plan,h:HPlan|undefined){
  const changed=JSON.stringify(p)!==JSON.stringify(this.savedPlans()[id]);
  const foot=changed?html`<p class="plan-now">Pas encore enregistré.</p>`
   :!p.thermostats.length?html`<p class="plan-now">Aucun thermostat : ce planning ne règle rien pour l’instant.</p>`
   :html`<p class="plan-now">Maintenant : <b>${h?.maintenant??'—'}</b>.${h?.prochain?` ${h.prochain.texte}.`:''}</p>
    ${h?.bloques.length?html`<p class="plan-now bad">${h.bloques.map(b=>`${b.nom} suit encore « ${b.scheduler} » dans Scheduler : Hestia ne le règle pas.`).join(' ')}</p>`:nothing}
    ${p.actif&&h?.verrouilles?.length?html`<p class="plan-now bad">${h.verrouilles.map(b=>b.nom).join(', ')} : pas coché${h.verrouilles.length>1?'s':''} dans Réglages, « Ce que Hestia peut régler ». Hestia ne ${h.verrouilles.length>1?'leur':'lui'} envoie rien.</p>`:nothing}`;
  return html`<article class="plan"><div class="plan-h"><h2>${p.nom}</h2><span class=${'st '+(p.actif?'actif':'essai')}>${p.actif?'Actif':'En essai'}</span><span class="grow"></span>
    <button type="button" @click=${()=>this.go('planning/'+id)}>Modifier</button></div>
   ${this.miniWeek(p,v)}
   ${p.thermostats.length?html`<div class="chips"><small>Thermostats</small>${p.thermostats.map(t=>html`<span class="tchip">${this.thermName(v,t)}</span>`)}</div>`:nothing}
   ${foot}</article>`;
 }

 /* ── Un planning ── */
 private editorPage(v:View,id:string){
  const m=this.plan(),p=m.plannings[id];
  if(!p)return this.planningPage(v);
  const th=v.planning.thermostats??[],stove=this.stoveId(v),hasStove=!!stove&&p.thermostats.includes(stove),saved=this.savedPlans();
  const edit=(f:(x:Plan)=>void)=>this.setPlan(mm=>{f(mm.plannings[id]);});
  const rows=ROWS[p.jours],sel=this.sel&&p.plages[this.sel.r]?.[this.sel.i]?this.sel:undefined,cur=sel?p.plages[sel.r][sel.i]:undefined;
  let reach=-1;
  const overlap=!!sel&&[...p.plages[sel.r]].sort((a,b)=>minutesOf(a[0])-minutesOf(b[0])).some(x=>{const hit=minutesOf(x[0])<reach;reach=Math.max(reach,endOf(x));return hit;});
  const setTime=(k:0|1,value:string)=>{if(!sel||!value)return;const t=minutesOf(value);
   edit(x=>{const r=x.plages[sel.r][sel.i],s=minutesOf(r[0]),e=endOf(r);
    // A start moved past the end takes the end along (the range keeps its length); an end never comes before the start.
    if(k===0){const end=t>=e?Math.min(1440,t+e-s):e;r[0]=clockOf2(Math.min(t,end-15));r[1]=clockOf2(end);}else r[1]=clockOf2(Math.max(t===0?1440:t,s+15));});};
  const add=(ri:number)=>{const slots=p.plages[ri],free=(a:number,b:number)=>slots.every(x=>b<=minutesOf(x[0])||a>=endOf(x));
   let start=free(720,780)?720:-1;for(let t=0;start<0&&t+60<=1440;t+=30)if(free(t,t+60))start=t;if(start<0)start=720;
   const lv=hasStove?'boost':p.reste==='confort'?'eco':'confort';
   edit(x=>{x.plages[ri].push([clockOf2(start),clockOf2(start+60),lv]);});this.sel={r:ri,i:slots.length};};
  const starts=hasStove?startsPerWeek(p):0;
  const stoveSay=starts?`Avec ce planning, le poêle s’allumerait ${starts} fois par semaine.`
   :p.reste==='boost'?'Avec ce planning, le poêle resterait en boost tout le temps.':'Avec ce planning, le poêle ne s’allumerait jamais : aucune plage en boost.';
  const ownerIn=(plans:Record<string,Plan>,t:string)=>Object.entries(plans).find(([,x])=>x.thermostats.includes(t))?.[0];
  const tick=(t:string,on:boolean)=>this.setPlan(mm=>{for(const x of Object.values(mm.plannings))x.thermostats=x.thermostats.filter(y=>y!==t);if(on)mm.plannings[id].thermostats.push(t);});
  const levels=[...new Set([p.reste,...p.plages.flat().map(r=>r[2])])];
  const note=(t:Therm,on:boolean):[string,boolean]=>{
   const parts:string[]=[t.piece??'',t.poele?'le thermostat du poêle':''];let warn=false;
   if(on){
    const was=ownerIn(saved,t.id);
    if(was&&was!==id){parts.push(`quitte « ${m.plannings[was]?.nom??saved[was].nom} »`);warn=true;}
    if(t.scheduler_actif){parts.push(`coupez « ${t.scheduler_actif} » dans Scheduler pour que Hestia le règle`);warn=true;}
    else if(!t.recopie&&t.autorise===false){parts.push(p.actif?'pas coché dans Réglages : Hestia ne lui enverra rien':'à cocher dans Réglages avant de passer en Actif');warn=p.actif;}
    const missing=levels.filter(l=>!t.niveaux.includes(l));
    if(missing.length){parts.push(`il n’a pas le préréglage ${missing.map(l=>LEVEL_LABEL[l].toLowerCase()).join(', ')}`);warn=true;}
    if(t.consignes)parts.push(`pas un Versatile Thermostat : il recevra ${LEVELS.map(l=>`${num(t.consignes![l])} °C en ${LEVEL_LABEL[l].toLowerCase()}`).join(', ')}`);
   }else{
    const other=ownerIn(m.plannings,t.id);
    parts.push(other?`dans « ${m.plannings[other].nom} »`:t.scheduler_actif?`suit « ${t.scheduler_actif} », l’extension`:'sans planning');
   }
   if(t.recopie)parts.push('recopié d’une autre maison : jamais commandé');
   const text=parts.filter(Boolean).join(' · ');
   return [text[0].toUpperCase()+text.slice(1),warn];
  };
  return html`${this.head(id in saved?'Modifier le planning':'Nouveau planning',{back:['planning','Plannings']})}
   <label class="field-l" for="nom">Nom du planning</label>
   <input id="nom" class="plan-name" type="text" maxlength="30" .value=${p.nom} @change=${(e:Event)=>{const n=(e.target as HTMLInputElement).value.trim();if(n)edit(x=>{x.nom=n;});}}>
   <section class="box ed" aria-labelledby="h-semaine">
    <div class="ed-h"><h2 id="h-semaine">La semaine</h2>${segmented<Week>('Les jours',[['tous','Tous les jours pareils'],['semaine','Semaine et week-end'],['chaque','Jour par jour']],p.jours,
     w=>{if(w!==p.jours){edit(x=>{x.plages=reshape(x,w);x.jours=w;});this.sel=undefined;}})}</div>
    <div class="scale"><span></span><div>${[0,6,12,18,24].map(h=>html`<span style=${`left:${h/24*100}%`}>${h} h</span>`)}</div></div>
    ${p.plages.map((r,ri)=>html`<div class="r"><div><b>${rows[ri][0]}</b>${rows[ri][1]?html`<small>${rows[ri][1]}</small>`:nothing}</div>
     <div><div class=${'track lv-'+p.reste}><i style="left:25%"></i><i style="left:50%"></i><i style="left:75%"></i>
      ${r.map((x,i)=>({x,i})).sort((a,b)=>minutesOf(a.x[0])-minutesOf(b.x[0])||a.i-b.i).map(({x,i})=>{const s=minutesOf(x[0]),e=endOf(x),on=sel?.r===ri&&sel.i===i;
       return html`<button type="button" class=${'lv-'+x[2]} style=${`left:${s/14.4}%;width:${(e-s)/14.4}%`} aria-pressed=${String(on)}
        aria-label=${`${LEVEL_LABEL[x[2]]} de ${hourText(s)} à ${hourText(e)}, ${rows[ri][0]}`} @click=${()=>{this.sel=on?undefined:{r:ri,i};}}><b>${LEVEL_LABEL[x[2]]}</b><span>${hourText(s)} – ${hourText(e)}</span></button>`;})}</div>
      ${r.length<12?html`<button type="button" class="more" @click=${()=>add(ri)}>+ Ajouter une plage</button>`:nothing}</div></div>`)}
    <div class="rest"><label for="reste">Le reste du temps</label><select id="reste" @change=${(e:Event)=>{const l=(e.target as HTMLSelectElement).value;edit(x=>{x.reste=l;});}}>
     ${LEVELS.map(l=>html`<option value=${l} ?selected=${p.reste===l}>${LEVEL_LABEL[l]}</option>`)}</select>
     ${stove?html`<small>Pour le poêle : Boost l’allume, Hors gel l’éteint.</small>`:nothing}</div>
    ${cur&&sel?html`<div class="selbox"><div><b>Plage choisie</b> <span class="hint inline">${rows[sel.r][0]} · ${LEVEL_LABEL[cur[2]]} de ${hourText(minutesOf(cur[0]))} à ${hourText(endOf(cur))}</span></div>
      <div class="times"><label for="de">De</label><input id="de" type="time" step="900" .value=${cur[0]} @change=${(e:Event)=>setTime(0,(e.target as HTMLInputElement).value)}>
       <label for="a">à</label><input id="a" type="time" step="900" .value=${cur[1]==='24:00'?'00:00':cur[1]} @change=${(e:Event)=>setTime(1,(e.target as HTMLInputElement).value)}></div>
      <div class="lvl" role="group" aria-label="Niveau">${LEVELS.map(l=>html`<button type="button" class=${'lv-'+l} aria-pressed=${String(cur[2]===l)} @click=${()=>edit(x=>{x.plages[sel.r][sel.i][2]=l;})}><i></i>${LEVEL_LABEL[l]}</button>`)}</div>
      ${overlap?html`<span class="warn">Deux plages se chevauchent sur cette ligne : Hestia gardera la plus tardive.</span>`:nothing}
      <button type="button" class="del" @click=${()=>{edit(x=>{x.plages[sel.r].splice(sel.i,1);});this.sel=undefined;}}>Supprimer cette plage</button></div>`
     :html`<p class="hint">Touchez une plage pour changer ses heures ou son niveau.</p>`}
    ${hasStove?html`<p class="stove-say">${stoveSay}</p>`:nothing}
   </section>
   <section class="box" aria-labelledby="h-thermo"><h2 id="h-thermo">Les thermostats de ce planning</h2>
    ${th.length?th.map(t=>{const on=p.thermostats.includes(t.id),[say,warn]=note(t,on);
     return html`<label class="tick"><input type="checkbox" .checked=${on} @change=${(e:Event)=>tick(t.id,(e.target as HTMLInputElement).checked)}>
      <span><b>${t.nom}</b><small class=${warn?'warn':''}>${say}</small></span></label>`;}):html`<p class="hint">Aucun thermostat lu.</p>`}
    ${p.thermostats.filter(t=>!th.some(x=>x.id===t)).map(t=>html`<label class="tick"><input type="checkbox" checked @change=${()=>tick(t,false)}>
     <span><b>${t}</b><small class="warn">Pas lu en ce moment : coupé dans Réglages, ou absent de Home Assistant.</small></span></label>`)}
    <p class="hint">Un thermostat suit un seul planning. En le cochant ici, il quitte l’autre.</p></section>
   <section class="box" aria-labelledby="h-mode"><h2 id="h-mode">Ce que fait Hestia</h2><div class="modes">
    ${([[false,'essai','En essai','Hestia montre ce qu’elle ferait, sans rien envoyer.'],[true,'actif','Actif','Hestia règle ces thermostats à chaque plage.']] as [boolean,string,string,string][])
     .map(([a,c,l,t])=>html`<button type="button" class=${c} aria-pressed=${String(p.actif===a)} @click=${()=>edit(x=>{x.actif=a;})}><b>${l}</b><span>${t}</span></button>`)}</div>
    ${p.actif?html`<p class="hint">${v.planning.labo?'Ici, les thermostats sont recopiés d’une autre maison : même actif, Hestia ne leur enverra rien.'
     :'Hestia change le préréglage de ces thermostats quand une plage commence ou finit. Elle ne les allume ni ne les éteint jamais. Un réglage fait à la main tient jusqu’au changement suivant.'}</p>`:nothing}</section>
   <div class="actions"><button type="button" class="primary" ?disabled=${this.saving} @click=${async()=>{if(this.count())await this.save();if(!this.refused)this.go('planning');}}>Enregistrer</button>
    <button type="button" class="link" @click=${()=>{this.dropPlanningDraft();this.go('planning');}}>Annuler</button><span class="grow"></span>
    <button type="button" class="del" @click=${()=>{this.setPlan(mm=>{delete mm.plannings[id];});this.go('planning');}}>Supprimer ce planning</button></div>`;
 }

 /* ── Réglages ── */
 private settingsPage(v:View){
  const s=this.settings;
  if(!s)return html`${this.head('Réglages',{lead:'Lecture…'})}`;
  const f=s.trouve,off=this.val<Record<string,boolean>>('sources')??{};
  const thermo=this.val<string|null>('poele_thermostat'),plug=this.val<string|null>('poele_prise'),house=this.val<string|null>('pilote_thermometre');
  const allowed=this.val<string[]>('planning_autorises')??[],low=this.val<string|null>('pilote_flamme_basse');
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
    listRow({label:'Le pilote de Hestia',control:true,sub:this.val<string>('pilote')==='eteint'?'Éteint : la page Poêle ne montre que ce que dit le poêle.'
      :this.val<string>('pilote')==='flamme'?(f.poele_copie?'Ce poêle est recopié d’une autre maison : Hestia ne lui enverra rien.'
        :'Hestia règle la flamme, et seulement elle. Coupez d’abord votre automatisation qui règle la flamme : si la flamme change sans Hestia, elle la laisse jusqu’au lendemain. Le démarrage, l’arrêt et les sécurités restent à vos automatisations.')
      :'À l’ombre : il montre ce qu’il ferait, à côté de ce que font vos automatisations. Il ne commande rien.',
     value:segmented<string>('Le pilote de Hestia',[['ombre','À l’ombre'],['flamme','Flamme'],['eteint','Éteint']],this.val<string>('pilote')??'ombre',x=>this.set('pilote',x))}),
    ...(this.val<string>('pilote')!=='eteint'?[listRow({label:'La température de la maison',control:true,
     sub:house?'Choisie par vous : prenez le capteur que lisent vos automatisations du poêle.':'La moyenne des pièces que Hestia voit.',
     value:html`<select aria-label="Température de la maison" @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;this.set('pilote_thermometre',x||null);}}>
      <option value="" ?selected=${!house}>Moyenne des pièces</option>${(f.thermometres??[]).map(t=>html`<option value=${t.id} ?selected=${house===t.id}>${t.nom}</option>`)}
      ${house&&!(f.thermometres??[]).some(t=>t.id===house)?html`<option value=${house} selected>${house}</option>`:nothing}</select>`}),
     listRow({label:'Flamme au plus bas',control:true,sub:low?'Quand cet interrupteur est allumé, le pilote met la flamme au plus bas (comme un « forcer flamme 1 »).':'Facultatif : un interrupteur qui demande la flamme au plus bas.',
      value:html`<select aria-label="Flamme au plus bas" @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;this.set('pilote_flamme_basse',x||null);}}>
       <option value="" ?selected=${!low}>Aucun</option>${(f.interrupteurs??[]).map(t=>html`<option value=${t.id} ?selected=${low===t.id}>${t.nom}</option>`)}
       ${low&&!(f.interrupteurs??[]).some(t=>t.id===low)?html`<option value=${low} selected>${low}</option>`:nothing}</select>`})]:[]),
   ],{help:'Le thermostat du poêle donne la demande (en %) face à la flamme réelle. La prise sert de témoin hors cloud.'}):nothing}
   ${listSection('Les thermostats lus',all.map(t=>listRow({label:t.nom,control:true,sub:html`<span class="eid">${t.id}</span>`,
     value:toggle('Lire '+t.nom,off[t.id]!==false,on=>setSource(t.id,on))})),{help:'Un thermostat coupé ici n’est plus lu ni compté, sans rien changer dans Home Assistant.'})}
   ${listSection('Ce que Hestia peut régler',f.thermostats.map(t=>listRow({label:t.nom,control:true,sub:t.piece||undefined,
     value:toggle('Hestia peut régler '+t.nom,allowed.includes(t.id),on=>this.set('planning_autorises',on?[...allowed,t.id]:allowed.filter(x=>x!==t.id)))})),
     {help:'Un planning Actif n’envoie qu’aux thermostats cochés ici, et à aucun autre. Aucun au départ : pour un essai, cochez seulement vos thermostats d’essai.'})}
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

import {LitElement,html,nothing,css,type TemplateResult} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import {hubStyles,modernStyles,pageStyles,listSection,listRow,saveBar,toggle,aboutPage,kpis,noteBox,moreRow,segmented,tabBar,numberField,helpTip,SOCLE} from './socle/ui';

/* The « Chauffage » tab of the Hestia-FB panel. Since 1.0.0b10 (the mock-up « nouveau parcours » validated by Frank on
   25 Nov. 2026) each thing the household owns has its own page: « Vue d'ensemble » (a sentence, what is to fix, four
   tiles), « Pièces » (a table, then one page per room with its planning, its thermostats and what Hestia reads), « Poêle »
   (one page in tabs: Maintenant, Conduite, Granulés et brasier, Avancé), the plannings (as they were), « Réglages » (the
   house only), a guide in five steps, Extensions and À propos. A setting lives in one place only.
   The tab edits the settings as a draft; « Enregistrer » saves the changes of the page open (its scope, SCOPES), and
   says when another page still holds some. The integration sends the presets and drives the stove as the pages say. Only the stove's own controls in Réglages (its power and set point in manual, its fan speed,
   its ÉCO Stop and its delay) go to the stove at once, from the browser, as from the stove's app: the user presses
   them, and they are greyed out on a stove copied from another house.
   Everything shown comes from the integration (hestia_heating/view, settings). */

type Hass={callWS:<T>(msg:Record<string,unknown>)=>Promise<T>;callService:(domain:string,service:string,data:Record<string,unknown>)=>Promise<unknown>;
 states:Record<string,{state:string;attributes:Record<string,unknown>}>;language?:string;themes?:{darkMode?:boolean}};
type Badge={texte:string;ton:string};
type Next={a:string;texte:string;ton:string};
type Room={id:string;nom:string;temperature:number|null;consigne:number|null;etat:string;poele:boolean;sources:string[];planning:string|null;prochain:Next|null;
 type?:string|null;demande_pct?:number|null;humidite?:number|null;fenetre?:boolean|null;badge?:Badge|null};
type Source={id:string;nom:string;type:string;type_devine?:string|null;piece:string|null;etat:string;mode:string;preset:string|null;temperature:number|null;consigne:number|null;
 demande_pct:number|null;puissance_w:number|null;fenetre:boolean|null;humidite:number|null;integration:string|null;entite:string;vu?:string|null};
type Pellets={stock_kg:number|null;stock_sacs:number|null;sac_kg:number|null;jours:number|null;prix_sac?:number|null};
/** The pellets counted by Hestia (0.6), from the stove's state, set on the bags declared in Suivi Stock Pellet. */
type FirePot={seuil_kg:number;kg:number|null;nettoye_le:string|null;a_nettoyer:boolean;bientot:boolean;par_les_sacs:boolean;texte:string};
type Conso={debit_kg_h:number;kg_jour:number;correction:number;brasier:FirePot};
/** One entity of the stove as Hestia reads it (1.0.0b3): its value and when it last said something. */
type Read={role:string;entite:string;valeur:string|null;unite:string|null;mode_ventilation:string|null;consigne:number|null;vu:string|null};
type Stove={nom:string;fabricant:string|null;modele:string|null;piece:string|null;profil:string;profil_nom:string;cloud:boolean;etat:string;texte:string|null;
 a_traduire:boolean;en_feu:boolean;depuis:string|null;flamme:number|null;flamme_reglee:number|null;flamme_min:number;flamme_max:number;fumees:number|null;
 air:number|null;alarme:boolean|null;alarme_texte:string|null;eco_stop:boolean|null;eco_stop_delai?:number|null;consigne_poele?:number|null;bride?:boolean;
 ecritures:number|null;ecritures_max:number|null;ecritures_lues?:boolean;thermostat:string|null;thermostat_nom:string|null;demande_pct:number|null;
 consigne:number|null;preset:string|null;prise:string|null;prise_w:number|null;entites:Record<string,string>;lues?:Read[];ventilation?:string|null;
 ventilation_niveaux?:string[];copie?:boolean;pilote?:Pilot;conso?:Conso;pilotable?:boolean;phrase?:Badge;debits?:{allumage?:number;flammes?:number[]}};
type Pilot={mode:string;action?:string;titre?:string;texte?:string;ton?:string;flamme_manuelle?:boolean;
 journal?:{heure:string;qui:string;texte:string;accord:boolean|null}[];accord_jour?:{oui:number;sur:number};
 accord_semaine?:{oui:number;sur:number;depuis:string;ecarts:{jour:string;heure:string;texte:string;hestia:string|null}[]};
 commande?:{envois:number;max:number;lache:string|null;copie:boolean;attente:number|null;texte?:string};conduite?:Drive;simulation?:Drive};
/** The whole pilot (0.7): the sequence under way, the question waiting for an answer, the lock. */
type Drive={actif:boolean;blanc?:boolean;copie:boolean;texte?:string|null;demarrages?:number;max_demarrages?:number;pilotable?:boolean;
 question?:{sujet:string;texte:string;reste_min?:number;reponses:string[]}|null;sequence?:string|null;verrou?:string|null;injoignable?:boolean};
/** What Hestia changed today, counted (1.0.0b3). */
type Changes={modes:number;flamme:number;allumer:number;eteindre:number;ventilation:number;autres:number;total:number};
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
 planning:Planning;a_regler:Todo[];extensions:Ext[];meteo:{etat:string;nom:string|null};prix_kwh?:number|null;changements?:Changes;
 prix_energie?:{kwh:number;periode:string|null;couleur:string|null}|null;
 mis_a_jour:string;calcul_ms:number|null};
type Found={thermostats:{id:string;nom:string;piece:string}[];coupes:{id:string;nom:string}[];poele:boolean;poele_thermostat:string|null;
  prises:{id:string;nom:string;poele:boolean}[];prise:string|null;thermometres:{id:string;nom:string;maison:boolean}[];interrupteurs?:{id:string;nom:string}[];poele_copie?:boolean;
  notifieurs?:string[];coupures?:{id:string;nom:string;poele:boolean}[];coupure?:string|null;pilotable?:boolean;meteo:{etat:string;lieu:string|null;nom:string|null;lieux:{id:string;nom:string}[]|null};
  avance?:Record<string,[number|null,number,number]>;types?:string[]};
type Settings={reglages:{sources:Record<string,boolean>;extensions:Record<string,boolean>;poele_thermostat:string|null;poele_prise:string|null;weather_place:string|null;planning:Model;pilote:string;pilote_thermometre:string|null;planning_autorises:string[];pilote_flamme_basse:string|null;
  brasier_kg?:number|null;granules_prix_sac?:number|null;granules_poids_sac?:number|null;pilote_notifier?:string|null;poele_prise_switch?:string|null;couper_prise?:boolean;prix_kwh?:number|null;
  trop_chaud_ecart?:number|null;pilote_ventilation?:string;pilote_simulateur?:boolean;flamme_manuelle?:boolean;avance?:Record<string,number>;types?:Record<string,string>;
  poele_eco_stop?:boolean;equipements?:string[]|null};
 trouve:Found};

const REPO='https://github.com/hestiaFB/hestia-heating-integration';
const VERSION='1.0.0b13';
// The whole pilot's answers, as on the phone.
const ANSWER:Record<string,string>={oui:'Oui, allumer',non:'Non',couper:'Couper la prise',ignorer:'Ignorer',nettoye:'J’ai nettoyé'};
const num=(v:number,d=1)=>v.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:d}).replace('-','−');
const deg=(v:number|null|undefined)=>v==null?'—':`${num(v)} °C`;
/** « 2026-11-21 » → « 21 nov. ». */
const dayOf=(iso:string)=>new Date(iso+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'});
const watts=(w:number|null|undefined)=>w==null?'—':w>=500?`${num(w/1000)} kW`:`${num(w,0)} W`;
const euros=(v:number)=>`${v.toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
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
/** « il y a 20 s », « il y a 6 min », « il y a 2 h », else the day. */
function ago(iso:string|null|undefined){if(!iso)return '';const s=Math.max(0,(Date.now()-new Date(iso).getTime())/1000);
 if(s<60)return `il y a ${Math.round(s)} s`;if(s<3600)return `il y a ${Math.round(s/60)} min`;if(s<86400)return `il y a ${Math.round(s/3600)} h`;
 const d=new Date(iso);return `le ${d.getDate()===1?'1er':d.getDate()}/${d.getMonth()+1}`;}
const newest=(list:(string|null|undefined)[])=>list.filter((x):x is string=>!!x).sort().at(-1);
const plural=(n:number,word:string)=>`${n} ${word}${n>1?'s':''}`;
// What a thermostat drives, in words (Réglages › Thermostats, 1.0.0b3): the guess, or the choice of the household.
const KIND_LONG:Record<string,string>={radiateur:'radiateur électrique',vanne:'radiateur à eau',plancher:'plancher chauffant',clim:'clim',pac:'pompe à chaleur',poele:'poêle',autre:'thermostat'};
const KIND_CHOICES:[string,string][]=[['radiateur','Radiateur électrique'],['vanne','Radiateur à eau'],['plancher','Plancher chauffant'],['clim','Clim'],['pac','Pompe à chaleur'],['autre','Autre']];
// What heats a house (the guide's first step, Réglages): its key, its name, the kinds of thermostat it has.
const KIT:[string,string,string[]][]=[['radiateur','Radiateurs électriques',['radiateur']],['poele','Poêle à granulés',[]],
 ['clim','Clim ou pompe à chaleur',['clim','pac']],['plancher','Plancher chauffant, radiateurs à eau',['plancher','vanne']]];
// The stove's entities, as the technical page names them.
const ROLE_NAME:Record<string,string>={etat:'Ce qu’il fait',flamme:'Sa flamme réglée',flamme_reelle:'Sa flamme réelle',fumees:'La température des fumées',
 air:'Sa sonde',alarme:'Une alarme',ecritures:'Changements reçus aujourd’hui, par tous',thermostat:'Son thermostat interne',eco_stop:'ÉCO Stop',
 eco_stop_delai:'Délai de l’ÉCO Stop',ventilation:'Sa ventilation'};
const ROLE_ORDER=['etat','flamme','flamme_reelle','fumees','air','alarme','ecritures','thermostat','ventilation','eco_stop','eco_stop_delai'];
const byRole=(a:{role:string},b:{role:string})=>(ROLE_ORDER.indexOf(a.role)+1||99)-(ROLE_ORDER.indexOf(b.role)+1||99);
const FAN_WORD=(x:string|null|undefined)=>x==null?'—':x.toLowerCase()==='auto'?'AUTO':x;
/** The flame by Hestia (« La flamme : Automatique »), from the pilot's mode and `flamme_manuelle`. */
const flameByHestia=(pilote:string|undefined,manual:boolean|undefined)=>pilote==='flamme'||pilote==='entier'&&manual!==true;
/** Which settings each page saves (1.0.0b10): « Enregistrer » sends those of the page open. Any other setting is the stove's. */
const SCOPES:Record<string,string[]>={pieces:['sources','types','planning_autorises','planning'],planning:['planning','planning_autorises'],
 reglages:['equipements','pilote_thermometre','weather_place','prix_kwh','pilote_notifier'],extensions:['extensions','weather_place']};
const SCOPE_NAME:Record<string,string>={pieces:'Pièces',planning:'Planning',reglages:'Réglages',extensions:'Extensions',poele:'Poêle'};
/** The page a setting is changed on, when it is no other page's: the stove's. */
const scopeOf=(key:string)=>Object.keys(SCOPES).find(k=>k!=='planning'&&k!=='extensions'&&SCOPES[k].includes(key))??(SCOPES.extensions.includes(key)?'extensions':'poele');
/** The old addresses (1.0.0b3 to b8), from a bookmark or a card of an older copy: where they are now. */
const MOVED:Record<string,string>={'reglages/maison':'reglages','reglages/thermostats':'pieces','reglages/poele':'poele/conduite','reglages/poele/avance':'poele/avance'};

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
  .lead [class^=say-]{font-weight:600;color:var(--primary-text-color)}.lead .say-alert,.lead .say-act{color:color-mix(in oklab,var(--c) var(--hc-ink),var(--primary-text-color))}
  .lead .say-alert{--c:var(--hc-alert)}.lead .say-act{--c:var(--hc-act)}
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
  .pot{height:8px;border-radius:999px;background:color-mix(in srgb,var(--nk-muted) 22%,transparent);margin:4px 16px 12px;overflow:hidden}
  .pot i{display:block;height:100%;border-radius:inherit;background:var(--hc-stove)}.pot i.soon{background:var(--hc-act)}.pot i.full{background:var(--hc-alert)}
  .nk-row-val input.num{width:88px;flex:0 0 88px}.pot-ask{display:inline-flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.pot-ask button,.nk-row-val>button{min-height:38px;padding:6px 14px}
  @media(max-width:640px){.ed .r,.ed .scale{grid-template-columns:76px minmax(0,1fr);gap:8px}.modes{grid-template-columns:1fr}.band h1{font-size:var(--nw-fs-case,21px)}.target{text-align:left}}
  .para{margin:0 0 18px;max-width:680px;color:var(--nk-muted);font-size:var(--nw-fs-text,14px)}
  .pick{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border-top:1px solid var(--nk-border)}.pick:first-child{border-top:0}
  .pick-h{display:flex;flex-direction:column;gap:2px}.pick-h small{color:var(--nk-muted);font-size:var(--nw-fs-small,12px)}
  .pick .modes{margin:0}.modes.three{grid-template-columns:repeat(3,minmax(0,1fr))}
  .modes button em{font-style:normal;font-size:var(--nw-fs-small,12px);color:color-mix(in oklab,var(--hc-act) var(--hc-ink),var(--primary-text-color))}
  .modes button small{font-size:var(--nw-fs-small,12px);color:var(--primary-text-color);opacity:.8}
  .modes button:disabled{opacity:.5}
  .crans{display:inline-flex;border:1px solid var(--nk-border);border-radius:10px;overflow:hidden;flex-wrap:nowrap}
  .crans button{min-width:40px;min-height:38px;padding:0 10px;border:0;border-radius:0;margin:0;border-left:1px solid var(--nk-border);background:transparent;font-weight:650}
  .crans button:first-child{border-left:0}.crans button[aria-pressed=true]{background:var(--primary-text-color);color:var(--nk-surface,#fff)}
  .dim{opacity:.55}
  .explain{display:block;padding:12px 16px;font-size:var(--nw-fs-small,12px);color:var(--nk-muted);line-height:1.55;border-top:1px solid var(--nk-border)}
  .explain p{margin:0 0 8px}.explain p:last-child{margin:0}.explain b{color:var(--primary-text-color);font-weight:600}
  .explain p.warn{border-left:3px solid var(--nk-todo,#e0912b);padding-left:10px}
  .always{padding:12px 16px;font-size:var(--nw-fs-small,12px);color:var(--nk-muted);border-top:1px solid var(--nk-border);line-height:1.5}.always b{color:var(--primary-text-color)}
  .g-steps{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0;margin:0 0 14px}
  .g-steps button{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:4px 12px 4px 6px;border-radius:999px;font-weight:600;font-size:var(--nw-fs-small,12px)}
  .g-steps b{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--nk-selected,var(--nk-border));font-size:var(--nw-fs-label,11px)}
  .g-steps button[aria-current=step]{background:var(--primary-text-color);color:var(--nk-surface,#fff)}.g-steps button[aria-current=step] b{background:var(--nk-surface,#fff);color:var(--primary-text-color)}
  .g-count{margin:0 0 4px;color:var(--nk-muted);font-size:var(--nw-fs-small,12px)}
  .g-q{font-size:var(--nw-fs-case,21px);font-weight:650;letter-spacing:-.02em;margin:0 0 6px}
  .g-lead{margin:0 0 18px;color:var(--nk-muted);max-width:640px}
  input.num{width:88px;flex:0 0 88px}
  @media(max-width:640px){.modes.three{grid-template-columns:1fr}.crans button{min-width:36px;padding:0 6px}}
  /* 1.0.0b10: the overview's tiles, the rooms' table, the changes kept on another page. */
  .plan-top>button.add{margin-top:4px}
  .band.now{display:flex;flex-direction:column;gap:6px}.band.now b{font-size:var(--nw-fs-title,17px);font-weight:650;line-height:1.35;text-wrap:balance}.band.now p{margin:0}
  .tk{font-size:var(--nw-fs-label,11px);letter-spacing:.08em;text-transform:uppercase;font-weight:650;color:var(--nk-muted)}
  .tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:0 0 22px}
  .tile{display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:18px;padding:16px 18px;
   font:inherit;color:inherit;min-height:0;margin:0;line-height:1.4}
  button.tile{cursor:pointer}button.tile:hover{border-color:color-mix(in srgb,var(--primary-text-color) 30%,var(--nk-border))}
  .tile.todo{border-color:color-mix(in oklab,var(--nk-todo) 60%,var(--nk-border))}
  .tile .tv{font-size:var(--nw-fs-title,17px);font-weight:650;letter-spacing:-.01em}
  .tile .ts{font-size:var(--nw-fs-small,12px);color:var(--nk-muted);flex:1}
  .tile .tg{font-size:var(--nw-fs-small,12px);font-weight:650;color:var(--nk-accent,var(--primary-color))}
  .rt{background:var(--nk-surface);border:1px solid var(--nk-border);border-radius:18px;overflow:hidden;margin:0 0 22px}
  .rt-row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1.2fr) 88px minmax(0,1.3fr) 128px 14px;gap:12px;align-items:center;width:100%;
   padding:12px 16px;margin:0;border:0;border-top:1px solid var(--nk-border);border-radius:0;background:transparent;color:inherit;font:inherit;text-align:left;min-height:56px;cursor:pointer}
  .rt-row:first-child{border-top:0}button.rt-row:hover{background:color-mix(in srgb,var(--primary-text-color) 5%,transparent)}
  .rt-row>span{min-width:0;display:flex;flex-direction:column;gap:2px;font-size:var(--nw-fs-text,14px)}
  .rt-row small{font-size:var(--nw-fs-small,12px);color:var(--nk-muted);font-weight:500}
  .rt-head{cursor:default;min-height:0;padding:10px 16px;background:color-mix(in srgb,var(--primary-text-color) 4%,transparent)}
  .rt-head>span{font-size:var(--nw-fs-label,11px);letter-spacing:.06em;text-transform:uppercase;font-weight:650;color:var(--nk-muted)}
  .rt-row .t{text-align:left}.rt-h{align-items:flex-start}.muted{color:var(--nk-muted)}
  @media(max-width:720px){.rt-head{display:none}.rt-row{grid-template-columns:minmax(0,1fr) auto 14px;row-gap:4px}
   .rt-name{grid-column:1}.rt-t{grid-column:2;grid-row:1;text-align:right}.rt-row>.nk-chev{grid-column:3;grid-row:1}
   .rt-kind,.rt-plan,.rt-h{grid-column:1 / span 2}.rt-kind{display:none!important}.tiles{grid-template-columns:1fr}}
  .pending{margin:0 0 18px}.pending button.link{display:inline;min-height:0;padding:0;border:0;background:none;color:inherit;font:inherit;font-weight:650;text-decoration:underline;cursor:pointer}`];
 @property({attribute:false}) hass?:Hass;
 @property({attribute:false}) route?:{prefix?:string;path:string};
 @property({type:Boolean}) narrow=false;
 @state() private view?:View;
 @state() private settings?:Settings;
 @state() private draft:Record<string,unknown>={};
 @state() private error?:string;
 @state() private saving=false;
 @state() private saved=false;
 @state() private refused?:string;
 /** A press on the stove's own controls (Réglages › Poêle à granulés) that did not go through. */
 @state() private failed?:string;
 /** The stove's control being sent, greyed out meanwhile. */
 @state() private busy?:string;
 @state() private sel?:{r:number;i:number};
 /** « J'ai nettoyé » asks once more before the fire pot's count starts again. */
 @state() private cleaning=false;
 @state() private answering=false;
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
  }catch(e){this.error=(e as {message?:string}).message??'Hestia Chauffage ne répond pas.';}
 }
 updated(changed:Map<string,unknown>){
  if(changed.has('hass')&&!this.view&&!this.error)void this.load();
 }
 private parts(){return (this.route?.path??'').replace(/^\//,'').split('/');}
 private go(path:string,replace=false){this.sel=undefined;this.failed=undefined;this.saved=false;const url=(this.route?.prefix??'/hestia/chauffage')+(path?'/'+path:'');
  if(replace)history.replaceState(null,'',url);else history.pushState(null,'',url);window.dispatchEvent(new CustomEvent('location-changed'));window.scrollTo(0,0);}
 private openHa(path:string){history.pushState(null,'',path);window.dispatchEvent(new CustomEvent('location-changed'));}

 /* ── The draft: one way to save everywhere ── */
 private stored(k:string){return (this.settings?.reglages as Record<string,unknown>|undefined)?.[k];}
 private val<T=unknown>(k:string):T{return (k in this.draft?this.draft[k]:this.stored(k)) as T;}
 private set(k:string,v:unknown){const d={...this.draft};if(JSON.stringify(v??null)===JSON.stringify(this.stored(k)??null))delete d[k];else d[k]=v;this.draft=d;this.saved=false;this.refused=undefined;}
 /** The plannings as they stand in the draft: a copy to change, then put back whole (they are saved whole). */
 private plan():Model{return structuredClone(this.val<Model>('planning')??EMPTY_MODEL);}
 private setPlan(change:(m:Model)=>void){const m=this.plan();change(m);this.set('planning',m);}
 private count(){return Object.keys(this.draft).length;}
 /** The page open's scope (SCOPES): what its « Enregistrer » sends. The guide and an unknown page: everything. */
 private scope(){const p=this.parts()[0];return p in SCOPES||p==='poele'?p:'';}
 private inScope(key:string,scope=this.scope()){return !scope||(SCOPES[scope]?.includes(key)??scopeOf(key)===scope);}
 private pending(scope=this.scope()){return Object.keys(this.draft).filter(k=>this.inScope(k,scope));}
 /** Changes kept on other pages, not saved yet: named above the page, each with its link. */
 private elsewhere(){const here=this.scope();if(this.parts()[0]==='guide')return [];
  return [...new Set(Object.keys(this.draft).filter(k=>!here||!this.inScope(k,here)).map(scopeOf))];}
 private drop(scope=this.scope()){const d={...this.draft};for(const k of this.pending(scope))delete d[k];this.draft=d;this.refused=undefined;}
 private async save(scope=this.scope()){
  this.saving=true;
  const keys=this.pending(scope),draft=Object.fromEntries(keys.map(k=>[k,this.draft[k]])),next=(k:string)=>k in draft?draft[k]:this.stored(k);
  try{
   await this.hass!.callWS({type:'hestia_heating/set_settings',reglages:draft});
   const rest={...this.draft};for(const k of keys)delete rest[k];this.draft=rest;this.saved=true;this.refused=undefined;
   await this.afterSave(draft,next);await this.load();
  }
  catch(e){this.refused=(e as {message?:string}).message??'Réglages non enregistrés.';}
  finally{this.saving=false;}
  // The reason is at the top of the page, the button at the bottom: bring the reason into view.
  if(this.refused){await this.updateComplete;this.renderRoot.querySelector('.refused')?.scrollIntoView({behavior:'smooth',block:'center'});}
 }
 /** What a choice just saved asks of the stove at once, as the user's own press (1.0.0b3): the flame back to
     Automatique puts the stove's own set point back to the one Hestia works with; the fan back to « par le poêle »
     puts it on AUTO. Never to a stove copied from another house. */
 private async afterSave(draft:Record<string,unknown>,next:(k:string)=>unknown){
  const s=this.view?.poele;
  if(!s||s.copie||this.settings?.trouve.poele_copie)return;
  const auto=flameByHestia(next('pilote') as string,next('flamme_manuelle') as boolean);
  const wanted=((next('avance') as Record<string,number>|undefined)??{}).consigne_poele??this.settings?.trouve.avance?.consigne_poele?.[0]??28;
  if(('pilote' in draft||'flamme_manuelle' in draft)&&auto&&s.entites.thermostat&&s.consigne_poele!=null&&s.consigne_poele!==wanted)
   await this.act('consigne','climate','set_temperature',{entity_id:s.entites.thermostat,temperature:wanted});
  if('pilote_ventilation' in draft&&next('pilote_ventilation')==='auto'&&s.entites.ventilation&&s.ventilation&&s.ventilation.toLowerCase()!=='auto'){
   const modes=(this.hass?.states[s.entites.ventilation]?.attributes.fan_modes as string[]|undefined)??[];
   await this.act('fan','climate','set_fan_mode',{entity_id:s.entites.ventilation,fan_mode:modes.find(m=>String(m).toLowerCase()==='auto')??'AUTO'});
  }
 }
 /** One of the stove's own controls, sent at once: the user's press, as from the stove's app. */
 private async act(key:string,domain:string,service:string,data:Record<string,unknown>){
  if(this.busy)return;
  this.busy=key;this.failed=undefined;
  try{await this.hass!.callService(domain,service,data);window.setTimeout(()=>{if(this.isConnected)void this.load();},1500);}
  catch(e){this.failed=`Le poêle n’a pas pris ce changement : ${(e as {message?:string}).message??'pas de réponse'}.`;}
  finally{this.busy=undefined;}
 }
 /** The ÉCO Stop switched from Réglages: at once on the stove, and kept as the one Hestia sets again before a start. */
 private async ecoStop(s:Stove,on:boolean){
  await this.act('eco',`switch`,on?'turn_on':'turn_off',{entity_id:s.entites.eco_stop});
  if(!this.failed){try{await this.hass!.callWS({type:'hestia_heating/set_settings',reglages:{poele_eco_stop:on}});await this.load();}
   catch(e){this.failed=(e as {message?:string}).message??'Le choix de l’ÉCO Stop n’a pas été gardé.';}}
 }
 /** « Température réglée dans le poêle », beside the ÉCO Stop (1.0.0b9, Frank): the figure Hestia sends before each
     start while the flame is automatic. Kept at once, and sent to the stove at once while the flame is automatic (the
     user's press, as from its app). Never to a stove copied from another house. */
 private async stoveTemp(s:Stove,n:number){
  const [d,lo,hi]=this.settings?.trouve.avance?.consigne_poele??[28,15,35];
  if(!Number.isFinite(n)||n<lo||n>hi){this.failed=`La température réglée dans le poêle va de ${num(lo)} à ${num(hi)} °C.`;return;}
  if(this.modeChoice().auto&&s.entites.thermostat&&!s.copie)await this.act('consigne','climate','set_temperature',{entity_id:s.entites.thermostat,temperature:n});
  if(this.failed)return;
  const put=(a:Record<string,number>|undefined)=>{const x={...(a??{})};if(n===d)delete x.consigne_poele;else x.consigne_poele=n;return x;};
  try{await this.hass!.callWS({type:'hestia_heating/set_settings',reglages:{avance:put(this.stored('avance') as Record<string,number>|undefined)}});
   if('avance' in this.draft)this.draft={...this.draft,avance:put(this.draft.avance as Record<string,number>)};
   await this.load();}
  catch(e){this.failed=(e as {message?:string}).message??'La température réglée dans le poêle n’a pas été gardée.';}
 }
 /** A figure of the stove (Réglages › Avancé) in force: the one saved, else its default. */
 private fig(key:string,draft=false):number{
  const mine=(draft?this.val<Record<string,number>>('avance'):this.stored('avance') as Record<string,number>|undefined)??{};
  return mine[key]??this.settings?.trouve.avance?.[key]?.[0]??0;
 }

 render(){
  const v=this.view;
  if(this.error)return html`<main>${this.head('Chauffage',{pill:['todo',this.error]})}</main>`;
  if(!v||!v.pret)return html`<main>${this.head('Chauffage',{lead:'Lecture des thermostats…'})}</main>`;
  const path=this.parts().join('/'),moved=MOVED[path];
  if(moved){queueMicrotask(()=>this.go(moved,true));return nothing;}
  const [p,sub]=this.parts();
  const pages:Record<string,()=>TemplateResult>={'':()=>this.home(v),poele:()=>this.stovePage(v,sub),pieces:()=>sub?this.roomPage(v,decodeURIComponent(sub)):this.roomsPage(v),
   planning:()=>sub?this.editorPage(v,decodeURIComponent(sub)):this.planningPage(v),reglages:()=>this.settingsPage(v),
   guide:()=>this.guidePage(v,Number(sub)||1),extensions:()=>sub?this.extensionPage(v,sub):this.extensionsPage(v),'a-propos':()=>this.aboutPage(v)};
  const other=this.elsewhere(),bar=!((p==='planning'&&sub)||p==='guide'||!this.scope());
  return html`<main>${this.refused?html`<div class="refused" role="alert">${noteBox('Pas enregistré',this.refused)}</div>`:nothing}${this.failed?noteBox('Pas envoyé',this.failed):nothing}
   ${other.length?html`<aside class="nk-note pending"><strong>Pas encore enregistré</strong> Des changements attendent sur ${other.map((k,i)=>html`${i?', ':''}<button type="button" class="link" @click=${()=>this.go(k==='poele'?'poele/conduite':k)}>${SCOPE_NAME[k]}</button>`)}.</aside>`:nothing}
   ${(pages[p]??pages[''])()}</main>
   ${bar?saveBar({count:this.pending().length,busy:this.saving,done:this.saved?'Enregistré':undefined,cancel:()=>this.drop(),save:()=>void this.save()}):nothing}`;
 }

 /* ── Common pieces ── */
 private head(title:string,o:{back?:[string,string];pill?:[string,string];lead?:unknown;help?:string;chips?:unknown}={}){
  return html`${o.back?html`<button class="crumb" @click=${()=>this.go(o.back![0])}>‹ ${o.back[1]}</button>`:nothing}<h1 tabindex="-1">${title}</h1>
   <div class="lead">${o.pill?html`<span class=${'pill '+o.pill[0]}>${o.pill[1]}</span>`:nothing}${o.chips??nothing}${o.lead?html`<p>${o.lead}</p>`:nothing}${o.help?helpTip(title,o.help,''):nothing}</div>`;
 }
 private chip(b:Badge){return html`<span class=${'chip '+b.ton}>${b.texte}</span>`;}
 private roomName(v:View,id:string|null|undefined){return id?v.pieces.find(r=>r.id===id)?.nom??id:'';}
 /** The flame by Hestia now (Réglages: « La flamme : Automatique »). */
 private flameAuto(p?:Pilot){return !!p&&flameByHestia(p.mode,p.flamme_manuelle);}
 private count0():Changes{return {modes:0,flamme:0,allumer:0,eteindre:0,ventilation:0,autres:0,total:0};}

 /* ── Vue d'ensemble: a sentence, what is to fix, four tiles, what Hestia may do and did today ── */
 private home(v:View){
  const src=v.sources,c=v.changements??this.count0(),s=v.poele,p=s?.pilote;
  const answering=src.filter(x=>x.etat!=='inconnu').length,todo=v.a_regler.length,ok=!todo&&answering===src.length;
  const allowed=this.allowedSet(v),active=(v.planning.hestia??[]).filter(h=>h.actif),heating=src.filter(x=>(x.demande_pct??0)>0).length;
  const ruled=src.filter(x=>allowed.has(x.id)&&this.planOf(x.id)).length,looked=src.length-ruled;
  const stoveSay=s?[s.flamme_reglee!=null&&s.en_feu?`flamme ${s.flamme_reglee}`:'',this.flameAuto(p)?'Hestia règle la flamme':'la flamme est à vous',
   p?.mode==='entier'?'Hestia l’allume et l’éteint':'vos automatisations l’allument'].filter(Boolean):[];
  const pot=s?.conso?.brasier,g=v.granules,next=active.map(h=>h.prochain).find(x=>x);
  const tile=(o:{k:string;v:string;s:unknown;go?:string;more?:string;todo?:boolean})=>o.go
   ?html`<button type="button" class=${'tile'+(o.todo?' todo':'')} @click=${()=>this.go(o.go!)}><span class="tk">${o.k}</span><span class="tv">${o.v}</span><span class="ts">${o.s}</span><span class="tg">${o.more} ›</span></button>`
   :html`<div class="tile"><span class="tk">${o.k}</span><span class="tv">${o.v}</span><span class="ts">${o.s}</span></div>`;
  return html`<div class="plan-top"><div>${this.head('Chauffage',{pill:ok?['ok','Tout marche']:['todo',todo?`${todo} à régler`:'Un thermostat ne répond pas'],lead:html`Mis à jour ${ago(v.mis_a_jour)}.`})}</div>
    <button type="button" class="add" @click=${()=>this.go('guide/1')}>Tout régler pas à pas</button></div>
   ${v.maison?.titre?html`<div class="band now"><span class="tk">Maintenant</span><b>${v.maison.titre}</b>${v.maison.texte?html`<p>${v.maison.texte}</p>`:nothing}</div>`:nothing}
   ${todo?listSection('À régler',v.a_regler.map(t=>listRow({label:html`<b>${t.titre}</b>`,name:t.titre,sub:t.texte,level:'todo',go:()=>this.go(MOVED[t.page]??t.page)}))):nothing}
   <div class="tiles">
    ${tile({k:'Pièces',v:src.length?`${answering} sur ${src.length} ${answering>1?'répondent':'répond'}`:'Aucun thermostat',go:'pieces',more:'Voir les pièces',todo:answering<src.length,
     s:src.length?`${heating?`${plural(heating,'thermostat')} ${heating>1?'chauffent':'chauffe'} en ce moment. `:'Rien ne chauffe en ce moment. '}${ruled?`Hestia change le mode de ${plural(ruled,'thermostat')}`:'Hestia ne change le mode d’aucun thermostat'}${looked&&ruled?` ; elle regarde ${looked>1?`les ${looked} autres`:'l’autre'}`:''}.`
      :'Hestia Chauffage lit Versatile Thermostat et les thermostats de Home Assistant (climate).'})}
    ${s?tile({k:'Poêle',v:`${s.en_feu?'Allumé':STOVE_WORD[s.etat]?.replace(/^./,x=>x.toUpperCase())??'—'}${s.en_feu&&s.flamme_reglee!=null?` · flamme ${s.flamme_reglee}`:''}`,go:'poele',more:'Voir le poêle',
     todo:s.etat==='inconnu'&&!s.texte,s:`${stoveSay.slice(1).join(', ').replace(/^./,x=>x.toUpperCase())}.${pot&&pot.kg!=null?` Brasier : ${pot.a_nettoyer?'à nettoyer':pot.texte.replace(/\.$/,'').replace(/^./,x=>x.toLowerCase())}.`:''}${g?.jours!=null?` Granulés : environ ${g.jours} jours.`:''}`}):nothing}
    ${tile({k:'Planning',v:active.length?(active.length>1?`${active.length} plannings actifs`:`« ${active[0].nom} » actif`):(v.planning.hestia??[]).length?'En pause':'Aucun planning',go:'planning',more:'Voir le planning',
     s:active.length?`${plural(new Set(active.flatMap(h=>h.thermostats.map(t=>t.id))).size,'thermostat')}.${next?` Ensuite : ${next.texte}.`:''}`:'Hestia montre ce qu’elle ferait, sans rien envoyer.'})}
    ${tile({k:'Aujourd’hui',v:c.total?plural(c.total,'changement'):'Aucun changement',s:c.total?[c.modes?plural(c.modes,'mode'):'',c.flamme?plural(c.flamme,'flamme'):'',c.allumer?plural(c.allumer,'allumage'):'',c.eteindre?plural(c.eteindre,'arrêt'):'',c.ventilation?`${c.ventilation} ventilation`:''].filter(Boolean).join(', ')+'.':'Hestia n’a rien envoyé aujourd’hui.'})}
   </div>
   ${listSection('Ce que Hestia a le droit de faire',this.doing(v))}
   ${listSection('Ce que Hestia a changé aujourd’hui',this.changed(v,false))}
   ${noteBox('Toujours',v.planning.labo?'Ici, les appareils sont recopiés d’une autre maison (Remote Home Assistant) : Hestia ne leur envoie jamais rien.'
     :'Hestia n’allume et n’éteint jamais un thermostat. Elle ne touche jamais à un appareil recopié d’une autre maison.')}`;
 }
 /** The thermostats Hestia may change the mode of (« Hestia change son mode », the room's page), as in the draft. */
 private allowedSet(_v?:View){return new Set(this.val<string[]>('planning_autorises')??[]);}
 /** The planning a thermostat is in, as in the draft: its key, or undefined. */
 private planOf(id:string){return Object.entries(this.plan().plannings).find(([,x])=>x.thermostats.includes(id))?.[0];}
 /** What Hestia does for the house, each with whether it is on. */
 private doing(v:View){
  const s=v.poele,p=s?.pilote,week=p?.accord_semaine;
  const active=new Set((v.planning.hestia??[]).filter(h=>h.actif).flatMap(h=>h.thermostats.map(t=>t.id))).size;
  const item=(label:string,on:boolean|null,state:string)=>listRow({label,value:html`<span class=${'chip '+(on?'calm':on===null?'act':'off')}>${state}</span>`});
  const fan=this.stored('pilote_ventilation');
  return [
   item('Montrer la température et la consigne de chaque pièce',v.pieces.length>0,plural(v.pieces.length,'pièce')),
   item('Changer le mode des thermostats aux heures du planning',active>0,active?plural(active,'thermostat'):'aucun planning actif'),
   ...(s&&p?[
    item('Monter et baisser la flamme du poêle',this.flameAuto(p),s.copie?'recopié : rien n’est envoyé':this.flameAuto(p)?'en marche':'non : la flamme est à vous'),
    ...(fan==='flamme'||fan==='manuel'?[item('Régler la ventilation du poêle',fan==='flamme',fan==='flamme'?'en marche':'non : à la vitesse choisie')]:[]),
    item('Allumer et éteindre le poêle',p.mode==='entier'?true:p.simulation?null:false,
     p.mode==='entier'?'en marche':p.simulation?(week?.sur?`essai à blanc : comme vous ${week.oui} fois sur ${week.sur}`:'essai à blanc'):'non : vos automatisations'),
    ...(s.conso?[item('Compter les granulés, rappeler le nettoyage du brasier',true,s.conso.correction!==1?'calé sur vos sacs':'d’après la flamme')]:[]),
   ]:[]),
   item('Dire ce que coûte chaque pièce',v.prix_energie!=null||v.prix_kwh!=null,v.prix_energie?'aux prix de Hestia Énergie':v.prix_kwh!=null?`à ${num(v.prix_kwh,4)} € le kWh`:'prix du kWh à donner'),
   item('Tenir compte du froid de la nuit et du lendemain',v.meteo.etat==='oui',v.meteo.etat==='oui'?'avec Hestia Weather':'sans Hestia Weather'),
  ];
 }
 /** What Hestia changed today, by kind: the overview's and the stove page's. */
 private changed(v:View,stoveOnly:boolean){
  const c=v.changements??this.count0(),s=v.poele,p=s?.pilote,auto=this.flameAuto(p),fan=this.stored('pilote_ventilation');
  const row=(label:string,sub:string,n:number|null)=>listRow({label,sub,value:n?`${n} fois`:'—'});
  return [
   ...(stoveOnly?[]:[row('Le mode des thermostats',c.modes?'Aux heures de vos plannings actifs.':'Aucun planning actif n’a changé de plage aujourd’hui.',c.modes)]),
   ...(s?[
    row('La flamme du poêle',auto?`Chaque fois vérifiée ${this.fig('verif_min')} min après ; au plus ${this.fig('flamme_max_jour')} par jour.`:'Jamais : la flamme est à vous.',c.flamme),
    ...(fan==='flamme'||c.ventilation?[row('La ventilation du poêle',`Au plus un changement toutes les ${this.fig('ventil_rythme_min')} min.`,c.ventilation)]:[]),
    row('Allumer ou éteindre le poêle',p?.mode==='entier'?'Chaque allumage et chaque arrêt vérifiés.':'Jamais : vos automatisations s’en chargent.',c.allumer+c.eteindre),
    ...(c.autres?[row('Ses autres réglages',`Avant un allumage : la température réglée dans le poêle, l’ÉCO Stop, la ventilation.`,c.autres)]:[]),
   ]:[]),
  ];
 }

 /* ── Le poêle: one page in tabs (1.0.0b10), Maintenant, Conduite, Granulés et brasier, Avancé ── */
 private stovePage(v:View,tab?:string){
  const s=v.poele,set=this.settings;
  if(!s||!set||!this.hasStove(v,set))return html`${this.head('Poêle',{lead:!s?'Aucun poêle trouvé. Hestia Chauffage reconnaît Micronova Agua IOT ; les autres poêles viendront un par un.'
   :!set?'Lecture…':'Le poêle à granulés est décoché dans Réglages, « Ce qui chauffe chez vous ».'})}`;
  const reads=s.lues??[],last=newest(reads.map(r=>r.vu)),mute=s.etat==='inconnu'&&!s.texte,p=s.pilote;
  const tabs:[string,string][]=[['','Maintenant'],['conduite','Conduite'],['granules','Granulés et brasier'],['avance','Avancé']];
  const cur=tabs.some(t=>t[0]===tab)?tab!:'';
  const doing=[this.flameAuto(p)?'Hestia règle la flamme':'',p?.mode==='entier'?'Hestia l’allume et l’éteint':''].filter(Boolean).join(', ');
  const chips=html`<span class=${'pill '+(mute?'todo':'ok')}>${mute?'Ne répond pas':`Répond${last?` · ${ago(last)}`:''}`}</span>
   ${s.en_feu?html`<span class="chip stove">Allumé${s.flamme_reglee!=null?` · flamme ${s.flamme_reglee}`:''}</span>`:html`<span class="chip off">${STOVE_WORD[s.etat]??s.etat}</span>`}
   <span class=${'chip '+(doing?'calm':'off')}>${doing||'Hestia regarde'}</span>`;
  return html`${this.head(s.nom,{chips,lead:`${s.fabricant?`${s.fabricant}, `:''}profil ${s.profil_nom}${s.cloud?', par le cloud':''}.`})}
   ${tabBar('Le poêle',tabs.map(([k,l])=>({label:l,current:k===cur,onClick:()=>this.go(k?'poele/'+k:'poele')})))}
   ${cur==='conduite'?this.stoveTab(v,set):cur==='granules'?this.pelletsTab(v):cur==='avance'?this.advancedPage(v,set):this.stoveNow(v)}`;
 }
 /** « Maintenant »: what Hestia reads of the stove, its question, what it changed and what happened today. */
 private stoveNow(v:View){
  const s=v.poele!,p=s.pilote,reads=s.lues??[];
  const vt=v.sources.find(x=>x.id===s.thermostat),g=v.granules,whole=p?.mode==='entier'?p.conduite:undefined,q=whole?.question;
  const answer=async(r:string)=>{this.answering=true;try{await this.hass!.callWS({type:'hestia_heating/repondre',reponse:r});await this.load();}
   catch(e){this.error=(e as {message?:string}).message??'La réponse n’a pas été notée.';}finally{this.answering=false;}};
  const week=p?.accord_semaine,gap=week?.ecarts.at(-1);
  return html`${p?.commande?.lache?noteBox('Flamme laissée',p.commande.lache):nothing}
   ${s.copie?noteBox('Recopié','Ce poêle est recopié d’une autre maison : Hestia ne lui envoie jamais rien, ni ordre ni notification.'):nothing}
   ${q?listSection('Hestia vous demande',[listRow({label:html`<b>${q.texte}</b>`,control:true,
     sub:q.sujet==='saison'?`Sans réponse${q.reste_min!=null?` dans ${q.reste_min} min`:''}, le thermostat repasse hors gel, sauf si le poêle est déjà en route.`:'La même question est sur votre téléphone.',
     value:html`<span class="pot-ask">${q.reponses.map((r,i)=>html`<button type="button" class=${i===0?'primary':''} ?disabled=${this.answering} @click=${()=>answer(r)}>${ANSWER[r]??r}</button>`)}</span>`})]):nothing}
   ${listSection('Ce que Hestia lit',[
    ...[...reads].sort(byRole).map(r=>listRow({label:ROLE_NAME[r.role]??r.role,sub:html`<span class="eid">${r.entite}</span>`,
     value:html`<span class="t">${this.readValue(s,r)}${r.vu?html`<small>${ago(r.vu)}</small>`:nothing}</span>`,level:r.role==='etat'&&s.a_traduire?'todo':undefined})),
    ...(vt?[listRow({label:'Son thermostat',sub:html`<span class="eid">${vt.entite}</span>`,value:html`<span class="t">${[vt.preset?PRESET[vt.preset]??vt.preset:null,vt.consigne!=null?`${deg(vt.consigne)} voulus`:null,
      vt.demande_pct!=null?`chauffe ${vt.demande_pct} % du temps`:null].filter(Boolean).join(' · ')||'—'}${vt.vu?html`<small>${ago(vt.vu)}</small>`:nothing}</span>`})]
     :[listRow({label:'Son thermostat',sub:'Aucun : choisissez-le dans l’onglet Conduite.',level:'todo',go:()=>this.go('poele/conduite')})]),
    ...(s.prise?[listRow({label:'Sa prise',sub:html`<span class="eid">${s.prise}</span>`,value:watts(s.prise_w)})]:[]),
    ...(g?[listRow({label:'Le stock de granulés',sub:'Suivi Stock Pellet',value:`${g.stock_sacs!=null?`${num(g.stock_sacs,1)} sacs`:'—'}${g.jours!=null?` · environ ${g.jours} jours`:''}`})]:[]),
   ],{more:html`<span class="nk-def">profil ${s.profil_nom}</span>`,help:s.a_traduire&&s.texte?`Le poêle dit « ${s.texte} » : ce mot n’est pas encore dans son profil, il est montré tel quel.`:undefined})}
   ${listSection('Ce que Hestia y a changé aujourd’hui',this.changed(v,true))}
   ${p?.journal?.length?listSection('Ce qui s’est passé aujourd’hui',[...p.journal].reverse().map(j=>listRow({label:html`<b>${j.heure}</b> · ${j.texte}`,
     value:html`<span class=${'chip '+(j.accord===false?'act':j.qui==='hestia'?'calm':'off')}>${j.accord===true?'pareil':j.accord===false?'autrement':j.qui==='hestia'?'Hestia':'noté'}</span>`})),
     {more:html`<span class="nk-def">${plural(p.journal.length,'ligne')}</span>`}):nothing}
   ${p&&p.mode!=='entier'&&(p.simulation||week?.sur)?listSection(p.simulation?'L’essai à blanc : allumer et éteindre':'Ce que Hestia aurait fait',[
    listRow({label:html`<b>${week?.sur?`Hestia aurait fait comme vos automatisations ${week.oui} fois sur ${week.sur}`:'Pas encore de geste à comparer'}</b>`,
     sub:week?.sur?`Depuis le ${dayOf(week.depuis)}, sans rien envoyer.`:'Ses gestes sont écrits au conditionnel dans le journal du jour, à côté de ceux de la maison.'}),
    ...(gap?[listRow({label:'La dernière différence',sub:`${dayOf(gap.jour)} à ${gap.heure} : ${gap.texte}${gap.hestia?` Juste avant, Hestia : ${gap.hestia}`:''}`})]:[]),
    ...(week&&week.ecarts.length>1?[moreRow('Les autres différences',String(week.ecarts.length-1),week.ecarts.slice(0,-1).reverse().map(x=>listRow({label:html`<b>${dayOf(x.jour)}, ${x.heure}</b> · ${x.texte}`,
     sub:x.hestia?`Juste avant, Hestia : ${x.hestia}`:undefined})))]:[]),
   ]):nothing}
   ${whole?listSection('Hestia conduit le poêle',[listRow({label:html`<b>${p?.titre??'—'}</b>`,sub:whole.texte??p?.texte,level:whole.injoignable||whole.verrou?'todo':undefined}),
    ...(!whole.copie&&whole.pilotable!==false?[listRow({label:'Allumages de Hestia aujourd’hui',sub:`Au plus ${whole.max_demarrages??3} par jour : au-delà, allumez-le vous-même.`,value:`${whole.demarrages??0} / ${whole.max_demarrages??3}`})]:[])]):nothing}
   ${s.conso?listSection('',[listRow({label:html`<b>Le brasier</b>`,name:'Le brasier',sub:s.conso.brasier.texte,level:s.conso.brasier.a_nettoyer?'todo':undefined,value:'Granulés et brasier',go:()=>this.go('poele/granules')})]):nothing}`;
 }
 /** « Granulés et brasier »: the stock, a bag's price and weight, when to clean the fire pot, « J'ai nettoyé ». */
 private pelletsTab(v:View){
  const s=v.poele!,g=v.granules;
  return html`${g?listSection('Le stock',[listRow({label:'Granulés en réserve',sub:'Suivi Stock Pellet · vos sacs achetés et vidés',
     value:html`<span class="t">${g.stock_sacs!=null?`${num(g.stock_sacs,1)} sacs`:'—'}${g.jours!=null?html`<small>environ ${g.jours} jours</small>`:nothing}</span>`})]):nothing}
   ${s.conso?this.firePot(s.conso.brasier):nothing}
   ${listSection('Les granulés',[
    this.numberRow('granules_prix_sac','Le prix d’un sac','€',0.5,50,0.01,g?.prix_sac!=null?num(g.prix_sac,2):'',g?.prix_sac!=null?'Pour dire ce que coûtent les granulés. Vide : d’après vos achats dans Suivi Stock Pellet.':'Pour dire ce que coûtent les granulés. Vide : pas de coût.'),
    this.numberRow('granules_poids_sac','Le poids d’un sac','kg',5,30,0.5,g?.sac_kg!=null?num(g.sac_kg,1):'15',g?.sac_kg!=null?'Pour compter en sacs. Vide : celui de Suivi Stock Pellet.':'Pour compter en sacs. Vide : 15 kg.'),
    this.numberRow('brasier_kg','Nettoyer le brasier tous les','kg',5,60,1,'15','Hestia vous le rappelle après ce poids de granulés brûlés. Vide : 15 kg.'),
   ],{help:'Le débit de chaque flamme, l’énergie d’un kilo et le rendement sont dans l’onglet Avancé.'})}`;
 }
 private readValue(s:Stove,r:Read){
  if(r.role==='thermostat')return `${r.valeur?MODE[r.valeur]??r.valeur:'—'}${r.consigne!=null?` · ${deg(r.consigne)} réglés`:''}`;
  if(r.role==='ventilation')return FAN_WORD(r.mode_ventilation??r.valeur);
  if(r.valeur==null)return 'ne dit rien';
  if(r.role==='etat')return s.a_traduire?`« ${r.valeur} »`:`${STOVE_WORD[s.etat]??s.etat} (« ${r.valeur} »)`;
  if(r.role==='flamme')return `${r.valeur} sur ${s.flamme_max}`;
  if(r.role==='ecritures')return `${r.valeur}${s.ecritures_max?` sur ${s.ecritures_max} permis`:''}`;
  if(r.role==='alarme')return s.alarme?r.valeur:'aucune';
  if(r.role==='eco_stop')return r.valeur==='on'?'activé':r.valeur==='off'?'coupé':r.valeur;
  if(r.role==='eco_stop_delai')return `${r.valeur} min`;
  if((r.role==='fumees'||r.role==='air')&&!r.unite)return deg(Number(r.valeur));
  const n=Number(r.valeur);
  return Number.isFinite(n)?`${num(n)}${r.unite?` ${r.unite}`:''}`:r.valeur;
 }

 /** The fire pot: the kilos burnt since it was last cleaned, and « J'ai nettoyé » (asked twice, nothing sent to the stove). */
 private firePot(b:FirePot){
  const pct=b.kg==null?0:Math.min(100,Math.round(b.kg/b.seuil_kg*100));
  const done=async()=>{this.cleaning=false;try{await this.hass!.callWS({type:'hestia_heating/brasier_nettoye'});await this.load();}catch(e){this.error=(e as {message?:string}).message??'Le nettoyage n’a pas été noté.';}};
  return listSection('Le brasier',[
   listRow({label:b.a_nettoyer?'À nettoyer':b.bientot?'Bientôt à nettoyer':'Granulés depuis le nettoyage',sub:b.texte,level:b.a_nettoyer?'todo':undefined,
    value:b.kg==null?'—':html`<span class="t">${num(b.kg,1)} kg<small>sur ${num(b.seuil_kg,0)}</small></span>`}),
   ...(b.kg!=null?[html`<div class="pot" role="img" aria-label=${`${pct} % du seuil`}><i class=${b.a_nettoyer?'full':b.bientot?'soon':''} style=${`width:${pct}%`}></i></div>`]:[]),
   listRow({label:'Vous venez de le nettoyer ?',control:true,sub:b.nettoye_le?`Dernier nettoyage noté le ${dayOf(b.nettoye_le.slice(0,10))} à ${clockOf(b.nettoye_le)}.`:'Hestia compte à partir de là.',
    value:this.cleaning?html`<span class="pot-ask"><button type="button" class="primary" @click=${done}>Oui, c’est nettoyé</button><button type="button" class="link" @click=${()=>{this.cleaning=false;}}>Annuler</button></span>`
     :html`<button type="button" @click=${()=>{this.cleaning=true;}}>J’ai nettoyé</button>`}),
  ],{help:b.par_les_sacs?'Compté sur vos sacs : ceux versés depuis le nettoyage, moins ce qui reste dans le réservoir.':'Compté par Hestia d’après la flamme du poêle.'});
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
   <div class="states"><span><span class="st essai">En pause</span>Hestia montre ce qu’elle ferait, sans rien envoyer.</span><span><span class="st actif">Actif</span>Hestia règle ces thermostats.</span></div>
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
   ${p.labo?noteBox('Recopié','Ici, les thermostats sont recopiés d’une autre maison (Remote Home Assistant) : Hestia ne leur envoie rien, même avec un planning actif. Un ordre pourrait atteindre les vrais.'):nothing}`;
 }
 private planCard(v:View,id:string,p:Plan,h:HPlan|undefined){
  const changed=JSON.stringify(p)!==JSON.stringify(this.savedPlans()[id]);
  const foot=changed?html`<p class="plan-now">Pas encore enregistré.</p>`
   :!p.thermostats.length?html`<p class="plan-now">Aucun thermostat : ce planning ne règle rien pour l’instant.</p>`
   :html`<p class="plan-now">Maintenant : <b>${h?.maintenant??'—'}</b>.${h?.prochain?` ${h.prochain.texte}.`:''}</p>
    ${h?.bloques.length?html`<p class="plan-now bad">${h.bloques.map(b=>`${b.nom} suit encore « ${b.scheduler} » dans Scheduler : Hestia ne le règle pas.`).join(' ')}</p>`:nothing}
    ${p.actif&&h?.verrouilles?.length?html`<p class="plan-now bad">${h.verrouilles.map(b=>b.nom).join(', ')} : « Hestia change son mode » est coupé sur la page de ${h.verrouilles.length>1?'leur':'sa'} pièce. Hestia ne ${h.verrouilles.length>1?'leur':'lui'} envoie rien.</p>`:nothing}`;
  return html`<article class="plan"><div class="plan-h"><h2>${p.nom}</h2><span class=${'st '+(p.actif?'actif':'essai')}>${p.actif?'Actif':'En pause'}</span><span class="grow"></span>
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
  // Ticking a thermostat here also lets Hestia change its mode (1.0.0b10): one choice, as on the room's page, where it can
  // be withheld. A copied thermostat is never given it.
  const tick=(t:string,on:boolean)=>{this.setPlan(mm=>{for(const x of Object.values(mm.plannings))x.thermostats=x.thermostats.filter(y=>y!==t);if(on)mm.plannings[id].thermostats.push(t);});
   const allowed=this.val<string[]>('planning_autorises')??[],copy=th.find(x=>x.id===t)?.recopie;
   if(on&&!copy&&!allowed.includes(t))this.set('planning_autorises',[...allowed,t]);};
  const levels=[...new Set([p.reste,...p.plages.flat().map(r=>r[2])])];
  const note=(t:Therm,on:boolean):[string,boolean]=>{
   const parts:string[]=[t.piece??'',t.poele?'le thermostat du poêle':''];let warn=false;
   if(on){
    const was=ownerIn(saved,t.id);
    if(was&&was!==id){parts.push(`quitte « ${m.plannings[was]?.nom??saved[was].nom} »`);warn=true;}
    if(t.scheduler_actif){parts.push(`coupez « ${t.scheduler_actif} » dans Scheduler pour que Hestia le règle`);warn=true;}
    else if(!t.recopie&&!(this.val<string[]>('planning_autorises')??[]).includes(t.id)){parts.push('« Hestia change son mode » coupé sur la page de sa pièce : Hestia ne lui enverra rien');warn=p.actif;}
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
     <span><b>${t}</b><small class="warn">Pas lu en ce moment : pas montré dans Hestia (page de sa pièce), ou absent de Home Assistant.</small></span></label>`)}
    <p class="hint">Un thermostat suit un seul planning. En le cochant ici, il quitte l’autre.</p></section>
   <section class="box" aria-labelledby="h-mode"><h2 id="h-mode">Ce que fait Hestia</h2><div class="modes">
    ${([[false,'essai','En pause','Hestia montre ce qu’elle ferait, sans rien envoyer.'],[true,'actif','Actif','Hestia règle ces thermostats à chaque plage.']] as [boolean,string,string,string][])
     .map(([a,c,l,t])=>html`<button type="button" class=${c} aria-pressed=${String(p.actif===a)} @click=${()=>edit(x=>{x.actif=a;})}><b>${l}</b><span>${t}</span></button>`)}</div>
    ${p.actif?html`<p class="hint">${v.planning.labo?'Ici, les thermostats sont recopiés d’une autre maison : même actif, Hestia ne leur enverra rien.'
     :'Hestia change le préréglage de ces thermostats quand une plage commence ou finit. Elle ne les allume ni ne les éteint jamais. Un réglage fait à la main tient jusqu’au changement suivant.'}</p>`:nothing}</section>
   <div class="actions"><button type="button" class="primary" ?disabled=${this.saving} @click=${async()=>{if(this.count())await this.save();if(!this.refused)this.go('planning');}}>Enregistrer</button>
    <button type="button" class="link" @click=${()=>{this.dropPlanningDraft();this.go('planning');}}>Annuler</button><span class="grow"></span>
    <button type="button" class="del" @click=${()=>{this.setPlan(mm=>{delete mm.plannings[id];});this.go('planning');}}>Supprimer ce planning</button></div>`;
 }

 /* ── Réglages and the guide's pieces ── */
 /* ── Réglages: the house only (1.0.0b10). A room's settings are on its page, the stove's on its own. ── */
 private settingsPage(v:View){
  const s=this.settings;
  if(!s)return html`${this.head('Réglages',{lead:'Lecture…'})}`;
  return html`${this.head('Réglages',{lead:'Ce qui vaut pour toute la maison. Les réglages d’une pièce sont sur sa page (Pièces), ceux du poêle sur la sienne (Poêle).'})}
   ${this.houseTab(v,s)}`;
 }
 /** The stove's tab: a stove found, and not left out of « Ce qui chauffe chez vous ». */
 private hasStove(v:View,s:Settings){return !!s.trouve.poele&&this.kit(v,s).includes('poele');}
 /** What heats the house: as chosen (the guide, Réglages), else what Hestia found. */
 private found(v:View,s:Settings,key:string){
  const kinds=KIT.find(k=>k[0]===key)?.[2]??[];
  return key==='poele'?!!s.trouve.poele:v.sources.some(x=>kinds.includes(x.type));
 }
 private kit(v:View,s:Settings):string[]{return this.val<string[]|null>('equipements')??KIT.map(k=>k[0]).filter(k=>this.found(v,s,k));}
 private kitRows(v:View,s:Settings){
  const kit=this.kit(v,s);
  return KIT.map(([key,name,kinds])=>{
   const list=v.sources.filter(x=>kinds.includes(x.type));
   const say=key==='poele'?(v.poele?`${v.poele.nom} · profil ${v.poele.profil_nom}.`:'Aucun trouvé. Hestia connaît les poêles Micronova reliés par Agua IOT ; les autres viendront un par un.')
    :list.length?`${list.length} trouvé${list.length>1?'s':''} : ${list.map(x=>this.roomName(v,x.piece)||x.nom).join(', ')}.`
    :key==='plancher'?'Aucun trouvé. Un appareil mal reconnu se corrige sur la page de sa pièce.':'Aucun trouvé.';
   return listRow({label:html`<b>${name}</b>`,control:true,sub:say,
    value:toggle(name,kit.includes(key),on=>this.set('equipements',on?KIT.map(k=>k[0]).filter(k=>k===key||kit.includes(k)):kit.filter(x=>x!==key)))});
  });
 }
 private select(label:string,value:string|null|undefined,options:[string,string][],empty:string|null,set:(x:string|null)=>void,disabled=false){
  return html`<select aria-label=${label} ?disabled=${disabled} @change=${(e:Event)=>{const x=(e.target as HTMLSelectElement).value;set(x||null);}}>
   ${empty!=null?html`<option value="" ?selected=${!value}>${empty}</option>`:nothing}${options.map(([id,n])=>html`<option value=${id} ?selected=${value===id}>${n}</option>`)}
   ${value&&!options.some(o=>o[0]===value)?html`<option value=${value} selected>${value}</option>`:nothing}</select>`;
 }

 /** The price of electricity: Hestia Énergie's when it gives one (1.0.0b8), else the one typed here. */
 private priceRow(v:View){
  const e=v.prix_energie;
  return e?listRow({label:'L’électricité',sub:'Reprise de Hestia Énergie, heure par heure (heures creuses, jours Tempo). Rien à saisir ici.',
    value:html`<span class="t">${num(e.kwh,4)} € le kWh<small>en ce moment${e.periode?` · ${e.periode}`:''}</small></span>`,go:()=>this.openHa('/hestia/energie/reglages')})
   :listRow({label:'Le prix du kWh',control:true,sub:'Celui de votre facture, sans l’abonnement. En heures pleines et creuses, mettez un prix moyen. Avec Hestia Énergie, il viendrait d’elle, heure par heure.',
    value:numberField({label:'Prix du kWh',value:this.val<number|null>('prix_kwh'),unit:'€',step:0.0001,min:0.01,max:2,set:x=>this.set('prix_kwh',x??null)})});
 }
 private houseTab(v:View,s:Settings){
  const f=s.trouve,house=this.val<string|null>('pilote_thermometre'),notifier=this.val<string|null>('pilote_notifier');
  return html`${listSection('Ce qui chauffe chez vous',this.kitRows(v,s),{help:'Trouvé seul dans Home Assistant. Un appareil manque ? Hestia voit tout thermostat qui donne une température. Pour un poêle, elle doit connaître sa marque : Micronova aujourd’hui, d’autres ensuite.'})}
   ${listSection('La maison',[
    listRow({label:'La température de la maison',control:true,sub:`La moyenne de vos pièces, ou un thermomètre que vous choisissez. Hestia la compare à ce que vous voulez pour savoir s’il faut chauffer plus ou moins.${house?'':' Par défaut : la moyenne des pièces.'}`,
     value:this.select('Température de la maison',house,(f.thermometres??[]).map(t=>[t.id,t.nom]),'Moyenne des pièces',x=>this.set('pilote_thermometre',x))}),
    listRow({label:'La météo',sub:f.meteo.etat==='oui'?'Hestia Weather, pour savoir s’il fera froid cette nuit et demain. Son lieu se choisit dans Extensions.':'Sans Hestia Weather, Hestia ne sait pas le froid à venir.',
     value:f.meteo.etat==='oui'?`Hestia Weather${f.meteo.nom?` · ${f.meteo.nom}`:''}`:'Pas reliée',go:()=>this.go('extensions')}),
   ])}
   ${listSection('Les prix',[this.priceRow(v),
    ...(this.kit(v,s).includes('poele')&&s.trouve.poele?[listRow({label:'Les granulés',sub:'Le prix et le poids d’un sac se règlent sur la page du poêle.',
     value:v.granules?.prix_sac!=null?`${euros(v.granules.prix_sac)} le sac`:'Poêle',go:()=>this.go('poele/granules')})]:[])])}
   ${listSection('Les messages de Hestia',[listRow({label:'Les recevoir sur',control:true,sub:'Un téléphone avec l’application Home Assistant. Hestia vous y prévient et vous pose ses questions, avec des boutons Oui et Non. « Aucun » : rien n’est envoyé.',
    level:this.val<string>('pilote')==='entier'&&!notifier?'todo':undefined,
    value:this.select('Service de notification',notifier,(f.notifieurs??[]).map(n=>[n,n.replace(/^notify\./,'')]),'Aucun',x=>this.set('pilote_notifier',x))})])}`;
 }

 /* ── Pièces: a table, then one page per room (1.0.0b10) ── */
 private roomsPage(v:View){
  const s=this.settings,cut=s?.trouve.coupes??[],allowed=this.allowedSet(),plans=this.plan().plannings;
  const say=(r:Room)=>{const kinds=[...new Set(r.sources.map(id=>v.sources.find(x=>x.id===id)).filter((x):x is Source=>!!x)
   .map(x=>x.type==='poele'?'poêle à granulés':KIND_LONG[this.kindOf(x)]??'thermostat'))];if(r.poele&&!kinds.includes('poêle à granulés'))kinds.unshift('poêle à granulés');
   return kinds.length?kinds.join(', ').replace(/^./,x=>x.toUpperCase()):'—';};
  const rows=v.pieces.map(r=>{
   const ids=r.sources,ruled=ids.filter(id=>allowed.has(id)&&this.planOf(id)),names=[...new Set(ids.map(id=>this.planOf(id)).filter((x):x is string=>!!x).map(k=>plans[k]?.nom??k))];
   const st=r.poele?v.poele:undefined,chip=st&&st.pilote&&(this.flameAuto(st.pilote)||st.pilote.mode==='entier')?html`<span class="chip stove">conduit le poêle</span>`
    :ruled.length?html`<span class="chip calm">change le mode</span>`:html`<span class="chip off">regarde</span>`;
   return html`<button type="button" class="rt-row" @click=${()=>this.go('pieces/'+encodeURIComponent(r.id))}>
    <span class="rt-name"><b>${r.nom}</b><small>${plural(ids.length,'thermostat')}</small></span>
    <span class="rt-kind">${say(r)}</span>
    <span class="rt-t t">${r.temperature!=null?`${num(r.temperature)}°`:'—'}<small>${r.consigne!=null?`voulu ${num(r.consigne)}°`:''}</small></span>
    <span class="rt-plan">${names.length?names.join(', '):html`<span class="muted">Aucun</span>`}<small>${r.prochain?`${r.planning?`${r.planning}, `:''}puis ${r.prochain.texte} ${when(r.prochain.a)}`:r.planning??''}</small></span>
    <span class="rt-h">${chip}</span><span class="nk-chev" aria-hidden="true">›</span></button>`;});
  return html`${this.head('Pièces',{lead:'Les pièces de Home Assistant qui ont un thermostat. Touchez une pièce pour tout ce qui la concerne : son planning, ses thermostats, ce que Hestia y lit.'})}
   ${v.pieces.length?html`<div class="rt" role="list"><div class="rt-row rt-head" aria-hidden="true"><span>Pièce</span><span class="rt-kind">Ce qui la chauffe</span><span class="rt-t">Maintenant</span><span class="rt-plan">Planning</span><span class="rt-h">Hestia</span><span></span></div>${rows}</div>`
    :listSection('',[listRow({label:'Aucun thermostat trouvé',sub:'Hestia Chauffage lit Versatile Thermostat et les thermostats de Home Assistant (climate).',level:'todo'})])}
   ${cut.length?listSection(`Pas montrés dans Hestia · ${cut.length}`,cut.map(c=>listRow({label:c.nom,name:c.nom,sub:'Ni carte, ni compte. Rien ne change dans Home Assistant.',value:'Remontrer',go:()=>this.go('pieces/'+encodeURIComponent(c.id))}))):nothing}
   ${(v.planning.scheduler??[]).length?listSection('',[listRow({label:html`<b>${plural(v.planning.scheduler.length,'planning')} Scheduler</b>`,name:'Plannings Scheduler',
     sub:'Tant qu’un planning Scheduler allumé change un thermostat, Hestia n’y touche pas. Vous les retrouvez dans Planning, à recopier en un clic.',value:'Planning',go:()=>this.go('planning')})]):nothing}
   <p class="hint after">« Change le mode » : aux heures de son planning, Hestia passe ce thermostat en Hors gel, Éco, Confort ou Boost, jamais allumé ni éteint. « Regarde » : elle lit sa température et sa chauffe, sans rien lui envoyer. Une pièce manque ou est mal nommée ? Elle vient des pièces de Home Assistant.</p>`;
 }
 private kindOf(x:Source){return (this.val<Record<string,string>>('types')??{})[x.id]??x.type_devine??x.type??'autre';}
 /** One room: its key is the room's id, or one of its thermostats (a link from « À régler », a thermostat not shown). */
 private roomPage(v:View,key:string){
  const room=v.pieces.find(r=>r.id===key)??v.pieces.find(r=>r.sources.includes(key));
  const f=this.settings?.trouve,lone=!room?(f?.coupes.find(c=>c.id===key)??f?.thermostats.find(t=>t.id===key)):undefined;
  if(!room&&!lone)return this.roomsPage(v);
  const ids=room?room.sources:[lone!.id],main=v.sources.find(x=>x.id===ids[0]),st=room?.poele?v.poele:undefined;
  const chips=html`${room?.badge?this.chip(room.badge):nothing}${main?html`<span class="chip off">${main.etat==='inconnu'?'ne répond pas':`répond ${ago(main.vu)}`}</span>`:nothing}`;
  const tiles=room?[{value:room.temperature!=null?`${num(room.temperature)}°`:'—',label:'dans la pièce'},{value:room.consigne!=null?`${num(room.consigne)}°`:'—',label:'voulu'},
   {value:room.demande_pct!=null?`${room.demande_pct} %`:'—',label:'du temps à chauffer'},...(room.humidite!=null?[{value:`${num(room.humidite,0)} %`,label:'d’humidité'}]:[]),
   ...(room.fenetre!=null?[{value:room.fenetre?'Ouverte':'Fermée',label:'la fenêtre'}]:[])]:[];
  return html`${this.head(room?.nom??lone!.nom,{back:['pieces','Pièces'],chips})}
   ${tiles.length?kpis(tiles):nothing}
   ${st?listSection('Le poêle',[listRow({label:html`<b>${st.nom}</b>`,name:st.nom,sub:'Sa flamme, son allumage, ses granulés et son brasier ont leur page.',value:'Ouvrir le poêle',go:()=>this.go('poele')})]):nothing}
   ${ids.map(id=>this.thermSection(v,id,ids.length>1))}
   ${listSection('',[listRow({label:'La pièce',sub:'Elle vient de Home Assistant : la pièce du thermostat, sinon celle de son appareil. Elle se change dans les pièces de Home Assistant.',value:'Pièces de Home Assistant',go:()=>this.openHa('/config/areas/dashboard')})])}`;
 }
 /** One thermostat, in its own frame: its planning and whether Hestia may change its mode, what it drives, whether
     Hestia shows it, what Hestia reads there. */
 private thermSection(v:View,id:string,several:boolean){
  const s=this.settings;if(!s)return nothing;
  const f=s.trouve,t=f.thermostats.find(x=>x.id===id),cut=f.coupes.find(x=>x.id===id),x=v.sources.find(y=>y.id===id),i=(v.planning.thermostats??[]).find(y=>y.id===id);
  const off=this.val<Record<string,boolean>>('sources')??{},allowed=this.val<string[]>('planning_autorises')??[],kinds=this.val<Record<string,string>>('types')??{};
  const shown=off[id]!==false,stoveT=x?.type==='poele'||!!i?.poele,copy=!!i?.recopie,temp=!!i?.consignes;
  const guess=x?.type_devine??x?.type??'autre',kind=kinds[id]??guess,planOn=allowed.includes(id),name=t?.nom??cut?.nom??x?.nom??id;
  const plans=this.plan().plannings,mine=this.planOf(id);
  const setShown=(on:boolean)=>{const next={...off};if(on)delete next[id];else next[id]=false;this.set('sources',next);};
  const setKind=(k:string|null)=>{const next={...kinds};if(!k||k===guess)delete next[id];else next[id]=k;this.set('types',next);};
  const setPlan=(key:string|null)=>{this.setPlan(m=>{for(const p of Object.values(m.plannings))p.thermostats=p.thermostats.filter(y=>y!==id);if(key&&m.plannings[key])m.plannings[key].thermostats.push(id);});
   if(key&&!copy&&!planOn)this.set('planning_autorises',[...allowed,id]);};
  const reads=x?[x.temperature!=null?'température':'',x.consigne!=null?'consigne':'',x.fenetre!=null?'fenêtre ouverte':'',x.puissance_w!=null?'puissance':'',
   x.demande_pct!=null?'part du temps où il chauffe':'',x.humidite!=null?'humidité':''].filter(Boolean).join(' · '):'';
  const sched=i?.scheduler_actif;
  const rows=[
   ...(shown?[listRow({label:'Son planning',control:true,sub:sched?`Il suit « ${sched} » dans Scheduler : tant qu’il est allumé, Hestia ne le règle pas.`
     :stoveT?'Pour le poêle : Boost l’allume, Hors gel l’éteint (si Hestia l’allume et l’éteint).':'Le même choix que dans Planning. Un thermostat suit un seul planning.',
     value:this.select('Planning de '+name,mine??null,Object.entries(plans).map(([k,p])=>[k,p.nom+(p.actif?'':' (en pause)')]),'Aucun',setPlan)}),
    listRow({label:temp?'Hestia change sa température aux heures du planning':'Hestia change son mode aux heures du planning',control:true,
     sub:copy?'Recopié d’une autre maison : jamais commandé.':!mine?'Sans planning, Hestia n’a rien à changer.':temp?'Il n’a pas de modes : le planning lui donne une température voulue. Jamais allumé ni éteint.'
      :'Hors gel, Éco, Confort ou Boost. Jamais allumé ni éteint. Coupé : Hestia montre ce qu’elle ferait, sans rien envoyer.',
     value:toggle((temp?'Hestia change la température de ':'Hestia change le mode de ')+name,planOn&&!copy,on=>this.set('planning_autorises',on?[...allowed,id]:allowed.filter(y=>y!==id)),copy||!mine)})]:[]),
   ...(stoveT||!x?[]:[listRow({label:'Ce qui chauffe la pièce',control:true,sub:kinds[id]?'Choisi par vous. Il donne le dessin de sa carte.':'Reconnu seul. Il donne le dessin de sa carte.',
    value:this.select('Ce qui chauffe '+name,kind,KIND_CHOICES,null,setKind)})]),
   listRow({label:'Le montrer dans Hestia',control:true,sub:'Éteint, Hestia fait comme s’il n’existait pas : ni carte, ni compte. Rien ne change dans Home Assistant.',value:toggle('Montrer '+name,shown,setShown)}),
   ...(i?.niveaux?.length?[listRow({label:'Ses modes',value:i.niveaux.map(l=>LEVEL_LABEL[l]??l).join(' · ')})]:[]),
   ...(x?[listRow({label:'Ce que Hestia y lit',sub:x.vu?`Dernière nouvelle ${ago(x.vu)}.`:undefined,value:reads||'rien pour l’instant'})]:[]),
   listRow({label:html`<span class="eid">${id}</span>`,value:[x?.integration,stoveT?'thermostat du poêle':'',copy?'recopié':''].filter(Boolean).join(' · ')}),
  ];
  return listSection(several||stoveT?name:'Son thermostat',rows,{more:several||stoveT?undefined:html`<span class="nk-def">${name}</span>`});
 }

 /** A choice among a few, as cards: [key, title, text, more, disabled]. */
 private pick<V extends string>(label:string,sub:unknown,options:[V,string,string,string?,boolean?][],current:V,set:(x:V)=>void){
  return html`<div class="pick"><div class="pick-h"><b>${label}</b>${sub?html`<small>${sub}</small>`:nothing}</div>
   <div class=${'modes'+(options.length>2?' three':'')} role="radiogroup" aria-label=${label}>${options.map(([k,t,text,more,disabled])=>html`<button type="button" role="radio" aria-checked=${String(current===k)} aria-pressed=${String(current===k)} ?disabled=${!!disabled&&current!==k}
    @click=${()=>set(k)}><b>${t}</b><span>${text}</span>${more?html`<em>${more}</em>`:nothing}</button>`)}</div></div>`;
 }
 /** Buttons 1 to 5 (the power, the fan's speed), sent at once. */
 private steps(label:string,levels:string[],current:string|null|undefined,send:(x:string)=>void,disabled:boolean){
  return html`<span class="crans" role="group" aria-label=${label}>${levels.map(n=>html`<button type="button" aria-pressed=${String(String(current)===n)} ?disabled=${disabled} @click=${()=>send(n)}>${n}</button>`)}</span>`;
 }
 /** « La flamme » and « Allumer et éteindre » map onto the pilot's modes: Conseil (ombre), Flamme, Entier, and the
     flame left to the user in Entier (`flamme_manuelle`). */
 private modeChoice(){
  const pilote=this.val<string>('pilote')??'ombre',manual=this.val<boolean>('flamme_manuelle')===true;
  return {byHestia:pilote==='entier',auto:pilote==='flamme'||pilote==='entier'&&!manual,
   choose:(auto:boolean,byHestia:boolean)=>{
    this.set('pilote',byHestia?'entier':auto?'flamme':'ombre');
    const m=byHestia&&!auto,was=this.stored('flamme_manuelle');
    this.set('flamme_manuelle',m?true:was?false:was);
   }};
 }
 private flameChoice(v:View,s:Settings){
  const st=v.poele,c=v.changements,{auto,byHestia,choose}=this.modeChoice();
  return this.pick<'auto'|'manuel'>('La flamme',`La puissance du poêle, de ${st?.flamme_min??1} à ${st?.flamme_max??5}.${st?.flamme_reglee!=null?` En ce moment : ${st.flamme_reglee}.`:''}`,[
   ['auto','Automatique','Hestia monte et baisse la flamme selon ce que demande le thermostat du poêle, et la baisse avant que la pièce ne dépasse la température voulue.',
    c&&this.flameAuto(st?.pilote)?`Aujourd’hui : changée ${c.flamme} fois.`:undefined],
   ['manuel','Manuel',`Comme sans Hestia : le poêle garde la puissance que vous choisissez et se règle seul avec sa propre sonde${st?.fabricant?`, comme le prévoit ${st.fabricant}`:''}.`,'Hestia dit seulement, sur la carte, la flamme qu’elle mettrait.'],
  ],auto?'auto':'manuel',x=>choose(x==='auto',byHestia));
 }
 private lightChoice(v:View,s:Settings){
  const {auto,byHestia,choose}=this.modeChoice(),f=s.trouve,locked=!!f.poele_copie||!!v.poele?.copie;
  const cannot=f.pilotable===false?'Le profil de ce poêle ne dit pas encore comment l’allumer et l’éteindre.':locked?'Ce poêle est recopié d’une autre maison : Hestia ne lui enverra rien.':undefined;
  return this.pick<'maison'|'hestia'>('Qui allume et éteint le poêle',undefined,[
   ['maison','Par vos automatisations, ou à la main','Hestia n’allume pas le poêle et ne l’éteint pas. Elle regarde ce que font vos automatisations, et note ce qu’elle aurait fait.'],
   ['hestia','Par Hestia','Hestia allume le poêle quand le planning passe son thermostat en Boost, et l’éteint quand la maison est assez chaude ou au passage en Hors gel. Allumé à la main, le poêle est gardé : Hestia met son thermostat en Boost. Elle vérifie chaque allumage et chaque arrêt, coupe le poêle en cas d’alarme ou de surchauffe, et vous prévient sur votre téléphone.',
    cannot??'Coupez d’abord vos automatisations qui allument ou éteignent le poêle : sinon, elles se contrediraient.',!!cannot],
  ],byHestia?'hestia':'maison',x=>choose(auto,x==='hestia'));
 }
 private fanChoice(v:View){
  const st=v.poele;
  return this.pick<'auto'|'flamme'|'manuel'>('La ventilation',`Le ventilateur qui souffle l’air chaud dans la pièce.${st?.ventilation?` En ce moment : ${FAN_WORD(st.ventilation)}.`:''}`,[
   ['auto','Automatique, par le poêle','Le poêle règle son ventilateur lui-même, selon sa flamme.'],
   ['flamme','Automatique, par Hestia',`Au plus bas tant que le poêle est froid, pour ne pas souffler d’air froid, puis un cran au-dessus de la flamme.`],
   ['manuel','Manuel','La vitesse que vous choisissez, ici ou sur la carte.'],
  ],(this.val<string>('pilote_ventilation')??'auto') as 'auto'|'flamme'|'manuel',x=>this.set('pilote_ventilation',x));
 }

 private stoveTab(v:View,s:Settings){
  const f=s.trouve,st=v.poele,locked=!!f.poele_copie||!!st?.copie,p=st?.pilote,week=p?.accord_semaine;
  const thermo=this.val<string|null>('poele_thermostat'),plug=this.val<string|null>('poele_prise'),{auto}=this.modeChoice();
  const fan=this.val<string>('pilote_ventilation')??'auto',ids=st?.entites??{},busy=!!this.busy;
  // The stove's own temperature is shown beside the ÉCO Stop (1.0.0b9), not in Avancé.
  const changedFigs=Object.keys(this.val<Record<string,number>>('avance')??{}).filter(k=>k!=='consigne_poele').length,figs=Object.keys(f.avance??{}).length+7;
  const g=v.granules;
  const [tempD,tempLo,tempHi]=f.avance?.consigne_poele??[28,15,35],tempDflt=tempD??28,temp=this.fig('consigne_poele');
  return html`${locked?noteBox('Recopié','Ce poêle est recopié d’une autre maison : ses commandes sont grisées, Hestia ne lui envoie rien.'):nothing}
   ${listSection('Les appareils du poêle',[
    listRow({label:'Le thermostat du poêle',control:true,sub:`Celui qui dit au poêle de chauffer, et combien. ${thermo?'Choisi par vous.':f.poele_thermostat?'Trouvé seul : le thermostat Versatile relié au poêle.':'Aucun trouvé seul : choisissez-le.'}`,
     level:!thermo&&!f.poele_thermostat?'todo':undefined,value:this.select('Thermostat du poêle',thermo,f.thermostats.map(t=>[t.id,t.nom]),'Trouvé seul',x=>this.set('poele_thermostat',x))}),
    listRow({label:'La prise du poêle',control:true,sub:`Facultative. Sa consommation dit si le poêle tourne vraiment, même quand son application ne répond plus.${plug?' Choisie par vous.':f.prise?' Trouvée seule, d’après son nom.':''}`,
     value:this.select('Prise du poêle',plug,[...f.prises.filter(x=>x.poele),...f.prises.filter(x=>!x.poele)].map(x=>[x.id,x.nom]),f.prise?'Trouvée seule':'Aucune',x=>this.set('poele_prise',x))}),
   ])}
   ${listSection('La flamme et la ventilation',[
    this.flameChoice(v,s),
    html`<div class=${auto?'dim':''}>${listRow({label:'En manuel : la puissance',control:true,sub:auto?'Choisissez « Manuel » pour la régler vous-même.':'Part au poêle dès que vous la touchez.',
      value:this.steps('Puissance du poêle',Array.from({length:(st?.flamme_max??5)-(st?.flamme_min??1)+1},(_,i)=>String(i+(st?.flamme_min??1))),st?.flamme_reglee!=null?String(st.flamme_reglee):null,
       n=>void this.act('flame','number','set_value',{entity_id:ids.flamme,value:Number(n)}),locked||auto||busy||!ids.flamme)})}
     ${auto?nothing:listRow({label:'et la température du poêle',control:true,sub:'Celle réglée dans le poêle lui-même : sa propre sonde la compare à la pièce.',
      value:html`<input class="num" type="number" inputmode="decimal" aria-label="Température réglée dans le poêle" min="5" max="35" step="0.5" .value=${st?.consigne_poele!=null?String(st.consigne_poele):''}
       ?disabled=${locked||auto||busy||!ids.thermostat} @change=${(e:Event)=>{const n=Number((e.target as HTMLInputElement).value.replace(',','.'));
        if(Number.isFinite(n))void this.act('consigne','climate','set_temperature',{entity_id:ids.thermostat,temperature:n});}}> °C`})}</div>`,
    ...(ids.ventilation?[this.fanChoice(v),...(fan==='manuel'?[listRow({label:'La vitesse',control:true,sub:'Part au poêle dès que vous la touchez.',
      value:this.steps('Vitesse de la ventilation',st?.ventilation_niveaux??[],st?.ventilation,n=>void this.act('fan','climate','set_fan_mode',{entity_id:ids.ventilation,fan_mode:n}),locked||busy)})]:[])]:[]),
    ...(ids.eco_stop&&st?[listRow({label:'ÉCO Stop',control:true,sub:'La sécurité du poêle lui-même.',value:toggle('ÉCO Stop',st.eco_stop===true,on=>void this.ecoStop(st,on),locked||busy||st.eco_stop==null)}),
     ...(ids.thermostat?[listRow({label:'Température réglée dans le poêle',control:true,sub:`Celle que surveille l’ÉCO Stop, avec la flamme automatique. ${num(tempDflt)}\u00a0°C conseillés.${auto?' Part au poêle dès que vous la changez.':' En manuel, c’est la température choisie plus haut qui compte.'}`,
      value:html`<input class="num" type="number" inputmode="numeric" aria-label="Température réglée dans le poêle, flamme automatique" min=${tempLo} max=${tempHi} step="1" .value=${String(temp)}
       ?disabled=${locked||busy} @change=${(e:Event)=>{const n=Number((e.target as HTMLInputElement).value.replace(',','.'));void this.stoveTemp(st,n);}}> °C`})]:[]),
     ...(ids.eco_stop_delai?[listRow({label:'Attendre avant de s’éteindre',control:true,sub:'Le délai ÉCO Stop du poêle, de 0 à 30 minutes. Lu dans le poêle.',
      value:html`<input class="num" type="number" inputmode="numeric" aria-label="Délai ÉCO Stop" min="0" max="30" step="1" .value=${st.eco_stop_delai!=null?String(st.eco_stop_delai):''}
       ?disabled=${locked||busy} @change=${(e:Event)=>{const n=Number((e.target as HTMLInputElement).value);if(Number.isFinite(n))void this.act('delai','number','set_value',{entity_id:ids.eco_stop_delai,value:n});}}> min`})]:[]),
     html`<div class="explain"><p>Activé, le poêle s’éteint seul quand sa propre sonde reste ${st.eco_stop_delai??5} minutes au-dessus de la température réglée dans le poêle, puis se rallume quand la pièce redescend. Il le fait même si Home Assistant est arrêté ou internet coupé.</p>
      <p>Avec la flamme automatique, Hestia règle le poêle sur ${num(temp)} °C avant chaque allumage. Sa sonde, posée près de lui, lit plus chaud que la pièce. Si elle arrive à cette température, il se bride lui-même à la flamme 1, quelle que soit la flamme demandée, puis l’ÉCO Stop l’éteint. Réglée juste assez haut, elle ne sert qu’en surchauffe, et c’est Hestia qui tient la température voulue.</p>
      ${st.air!=null&&st.consigne_poele!=null?html`<p><b>En ce moment : sa sonde lit ${deg(st.air)} pour ${deg(st.consigne_poele)} réglés.</b>${st.bride?' Il se bride lui-même : montez un peu la température réglée dans le poêle.':st.eco_stop?' Activé ne veut pas dire qu’il s’éteint : il le fera seulement s’il dépasse.':''}</p>`:nothing}
      <p>Sans ÉCO Stop, le poêle ne s’éteint jamais seul : il descend à la flamme 1 et continue de brûler.</p>
      <p class="warn"><b>Sécurité.</b> L’ÉCO Stop et cette température sont la seule sécurité qui marche même sans Home Assistant ni internet. Plus elle est haute, plus la pièce chauffe avant que le poêle ne se bride puis ne s’éteigne. Trop basse, il se bride en pleine chauffe. Montez-la par petits pas, seulement s’il se bride.${temp>30?html` <b>Au-dessus de 30\u00a0°C, il ne réagit plus qu’à une forte surchauffe.</b>`:nothing}${st.eco_stop===false?html` <b>ÉCO Stop coupé : le poêle ne s’éteint jamais seul. Seule la sécurité de Hestia l’arrête (la pièce au-dessus de ${num(this.fig('surchauffe_c'))} °C), et seulement quand Home Assistant tourne.</b>`:nothing}</p></div>`]:[]),
   ])}
   ${listSection('Allumer et éteindre',[this.lightChoice(v,s),
    ...(week?.sur&&p?.mode!=='entier'?[listRow({label:'Ce que Hestia aurait fait',sub:`Pareil que vos automatisations ${week.oui} fois sur ${week.sur} depuis le ${dayOf(week.depuis)}, sans rien envoyer.`,go:()=>this.go('poele')})]:[]),
    ...(this.val<string>('pilote')==='entier'&&!this.val<string|null>('pilote_notifier')?[listRow({label:'Vous prévenir',sub:'Aucun téléphone choisi : Hestia ne pourra pas vous poser ses questions. Choisissez-le dans Réglages.',level:'todo',go:()=>this.go('reglages')})]:[]),
   ])}
   <p class="hint after" style="margin-top:-8px">La flamme en manuel, la vitesse de la ventilation et l’ÉCO Stop partent au poêle dès que vous les changez, ici ou sur sa carte, comme depuis son application. Chaque changement s’écrit dans la mémoire du poêle, qui en permet ${st?.ecritures_max??20} par jour : Hestia en garde toujours ${this.fig('garde')} pour pouvoir l’éteindre. Les choix Automatique ou Manuel s’enregistrent avec le bouton Enregistrer.</p>`;
 }

 /* ── Avancé: every figure the stove's pilot follows ── */
 private advancedPage(v:View,s:Settings){
  const f=s.trouve,st=v.poele,spec=f.avance??{},mine=this.val<Record<string,number>>('avance')??{};
  const setFig=(key:string,x:number|undefined)=>{const d=spec[key]?.[0],next:Record<string,number>={};
   for(const k of Object.keys({...mine,[key]:0}).sort()){const value=k===key?x:mine[k];if(value!==undefined&&!Number.isNaN(value)&&value!==(k===key?d:undefined))next[k]=value;}
   this.set('avance',next);};
  const fig=(key:string,label:string,unit:string,sub:string,step=1,profile?:number)=>{const [d,lo,hi]=spec[key]??[null,0,1000],dflt=d??profile;
   return listRow({label,control:true,sub,value:numberField({label,value:mine[key],unit,dflt,step,min:lo,max:hi,set:x=>setFig(key,x===dflt&&d==null?undefined:x)})});};
  const rates=st?.debits??{};
  const always=(text:unknown)=>html`<div class="always"><b>Toujours.</b> ${text}</div>`;
  const low=this.val<string|null>('pilote_flamme_basse'),cut=this.val<string|null>('poele_prise_switch'),pilote=this.val<string>('pilote')??'ombre';
  const over=this.val<number|null>('trop_chaud_ecart');
  return html`<p class="para">Chaque chiffre que Hestia suit pour conduire le poêle. Laissé vide, il garde sa valeur par défaut. Un changement compte dès son enregistrement, au prochain regard de Hestia. Les limites qui protègent le poêle (changements et allumages par jour, réserves, sécurités) peuvent seulement être resserrées.</p>
   ${listSection('La flamme et la ventilation automatiques',[
    fig('palier_5','Flamme 5 dès','%','La part du temps où le thermostat du poêle voudrait chauffer, à partir de laquelle la flamme est à 5.'),
    fig('palier_4','Flamme 4 dès','%','Et la flamme 4 à partir de celle-ci.'),
    fig('palier_3','Flamme 3 dès','%','La flamme 3 à partir de celle-ci ; en dessous, la flamme 2.'),
    fig('marge','Marge entre paliers','points','La flamme ne change pas tant que la demande reste à moins de cet écart de son palier : elle ne fait pas le yoyo.'),
    fig('monter_min','Monter la flamme au plus toutes les','min','Elle baisse tout de suite ; elle monte seulement après ce délai depuis le dernier changement, sauf deux paliers d’écart.'),
    listRow({label:'Flamme 1 quand la pièce dépasserait sa consigne de',control:true,sub:'La pièce du poêle va dépasser sa consigne de cet écart : la flamme passe à 1, et y reste tant que la pièce est à sa consigne.',
     value:numberField({label:'Écart avant la flamme 1',value:over,unit:'°C',dflt:2,step:0.5,min:0.5,max:5,set:x=>this.set('trop_chaud_ecart',x===undefined||x===2?null:x)})}),
    fig('avance_min','Regarder la pièce en avance de','min','Hestia prolonge la courbe de la pièce de ce temps, pour la voir dépasser sa consigne avant que ça arrive.'),
    listRow({label:'Un bouton « flamme au plus bas »',control:true,sub:low?'Quand cet interrupteur est allumé, la flamme est au plus bas.':'Facultatif : un interrupteur de Home Assistant qui demande la flamme au plus bas.',
     value:this.select('Flamme au plus bas',low,(f.interrupteurs??[]).map(t=>[t.id,t.nom]),'Aucun',x=>this.set('pilote_flamme_basse',x))}),
    fig('ventil_fumees_c','Ventilation au plus bas sous','°C','Avec la ventilation par Hestia : au plus bas tant que les fumées sont sous cette température, pour ne pas souffler d’air froid.'),
    fig('ventil_rythme_min','Changer la ventilation au plus toutes les','min','Chaque changement coûte une écriture dans la mémoire du poêle.'),
   ],{help:'Quand la flamme est sur Automatique : Hestia lit la part du temps où le thermostat du poêle voudrait chauffer, et en tire la flamme.'})}
   ${listSection('Les changements écrits dans le poêle',[
    listRow({label:'Permis par jour',sub:st?.ecritures_lues?'Lu dans les options de l’intégration du poêle.':'Le chiffre du profil du poêle. Il se change dans les options de son intégration.',value:String(st?.ecritures_max??'—')}),
    fig('garde','En garder pour pouvoir l’éteindre','',`Hestia ne change plus la flamme quand il n’en reste que ce nombre.`),
    fig('garde_ventil','En garder avant de toucher à la ventilation','','La ventilation passe après : Hestia n’y touche plus quand il n’en reste que ce nombre.'),
    fig('flamme_max_jour','Changements de flamme par jour, au plus',''  ,'Ceux de Hestia.'),
    fig('verif_min','Vérifier chaque changement après','min','Le poêle a-t-il suivi ?'),
    fig('echecs','Rendre la main après','refus','Le poêle ne suit pas ce nombre de fois dans la journée : Hestia lui laisse la flamme jusqu’au lendemain.'),
    always('Un ordre à la fois. Si la flamme change sans Hestia, elle la laisse jusqu’au lendemain.'),
   ],{help:'Chaque ordre s’écrit dans la mémoire du poêle, qui n’en permet qu’un certain nombre par jour.'})}
   ${listSection('L’allumage',[
    fig('saison_douce_c','Demander avant d’allumer à partir de','°C','La maison à cette température ou plus : Hestia vous demande sur votre téléphone avant d’allumer.',0.5),
    fig('reponse_min','Attendre votre réponse','min','Sans réponse, le thermostat du poêle repasse hors gel, sauf si le poêle est déjà en route.'),
    fig('allumage_verif_min','Vérifier l’allumage après','min','Pas pris : l’intégration du poêle est rechargée et l’ordre renvoyé.'),
    fig('recharge_s','Attendre après le rechargement','s','Le temps que l’intégration du poêle revienne.'),
    fig('demarrages_max','Allumages par jour, au plus','','Au-delà, allumez-le vous-même.'),
    always('Hestia n’allume jamais le poêle de lui-même : seulement au passage de son thermostat en Boost. Pas si le thermostat est éteint, le poêle en alarme ou muet, ni pendant le démarrage de Home Assistant.'),
   ],{help:pilote==='entier'?'Hestia allume et éteint le poêle.':'Ces chiffres servent quand Hestia allume et éteint le poêle, et à son essai à blanc.'})}
   ${listSection('L’arrêt',[
    fig('arret_ecart_c','Éteindre quand la maison est à moins de','°C','de sa consigne : assez chaude. En Boost, à la consigne.',0.1),
    fig('chaud_min','Assez chaude depuis','min','Le temps qu’elle le reste avant l’arrêt.'),
    fig('arret_ordres','Ordres d’arrêt','','Envoyés à 15 secondes d’écart.'),
    fig('arret_verif_min','Vérifier l’arrêt après','min','Le poêle chauffe encore : l’ordre de nouveau, puis « Couper la prise ? ».'),
    fig('fumees_froides_c','Éteint quand ses fumées sont sous','°C','Ce qui confirme l’arrêt, avec l’état du poêle.'),
    fig('prise_repos_w','ou quand sa prise est sous','W','Si une prise mesurée est reliée.'),
    fig('prise_reponse_min','Attendre avant de couper la prise','min','Après « Couper la prise ? » sur votre téléphone.'),
    listRow({label:'Couper la prise sans réponse',control:true,sub:'En dernier recours : le poêle chauffe encore après l’arrêt et deux ordres. Sans réponse, Hestia coupe la prise.',
     value:toggle('Couper la prise sans réponse',this.val<boolean>('couper_prise')!==false,on=>this.set('couper_prise',on))}),
    listRow({label:'L’interrupteur de sa prise',control:true,sub:cut?'Choisi par vous.':f.coupure?'Trouvé seul, d’après la prise mesurée.':'Aucun trouvé : en dernier recours, Hestia vous dira de couper le poêle vous-même.',
     value:this.select('Interrupteur de la prise du poêle',cut,(f.coupures??[]).map(x=>[x.id,x.nom]),f.coupure?'Trouvé seul':'Aucun',x=>this.set('poele_prise_switch',x))}),
    always('Thermostat du poêle qui passe en Hors gel, ou éteint 30 secondes : le poêle s’arrête. Éteint par sa propre sécurité, il compte aussi, sauf pour la sonde dehors seule : flamme au plus bas jusqu’à son retour. Un poêle allumé à la main, son thermostat en Hors gel, n’est pas arrêté : Hestia met son thermostat en Boost. Hestia n’éteint jamais un thermostat, sauf celui du poêle pour un verrou de sécurité.'),
   ])}
   ${listSection('Les sécurités',[
    fig('surchauffe_c','Couper au-dessus de','°C','La pièce du poêle au-dessus de cette température pendant qu’il brûle : Hestia l’éteint.',0.5),
    fig('alarme_min','Une alarme compte après','min','Une alarme du poêle qui dure : Hestia l’éteint.'),
    fig('muet_min','Poêle muet après','min','Il ne donne plus de nouvelles : Hestia vous prévient.'),
    fig('prise_brule_w','Il brûle encore au-dessus de','W','Un poêle muet dont la prise tire plus que ça brûle encore.'),
    fig('securite_max_min','Sonde dehors sans nouvelles, au plus','min','Le thermostat du poêle se met en sécurité quand une sonde ne donne plus de nouvelles. Pour la sonde dehors seule, la pièce reste surveillée : Hestia garde le poêle au plus bas, et l’éteint si ça dure plus longtemps que ça.'),
    always('Un allumage refusé pour la pièce trop chaude, le brasier, une alarme ou un poêle muet éteint le thermostat du poêle (un verrou). « J’ai nettoyé » le rallume pour le brasier ; sinon, rallumez-le vous-même. Rien n’est jamais envoyé à un poêle recopié d’une autre maison.'),
   ])}
   ${listSection('Le comptage des granulés',[
    fig('debit_allumage','Débit à l’allumage','kg/h','Par défaut : celui du profil du poêle.',0.01,rates.allumage),
    ...[1,2,3,4,5].map(n=>fig(`debit_${n}`,`Débit en flamme ${n}`,'kg/h','Par défaut : celui du profil du poêle.',0.01,rates.flammes?.[n-1])),
    fig('kwh_kg','Énergie d’un kilo','kWh','Celle d’un kilo de granulés, écrite sur le sac.',0.1),
    fig('rendement','Rendement du poêle','%','La part de cette énergie qui chauffe la maison.'),
    ...(st?.conso?[listRow({label:'Correction apprise sur vos sacs',sub:'Hestia ajuste ses débits à chaque sac déclaré vide dans Suivi Stock Pellet.',value:`× ${num(st.conso.correction,2)}`})]:[]),
    fig('brasier_bientot_kg','Prévenir du brasier','kg avant','Le brasier est dit « bientôt à nettoyer » ce nombre de kilos avant son seuil.',0.5),
   ])}
   ${pilote!=='entier'?listSection('Les essais',[listRow({label:'Essai à blanc de l’allumage et de l’arrêt',control:true,
     sub:'Hestia fait comme si elle allumait et éteignait le poêle, sans rien lui envoyer, pas même une notification, et compare avec vos automatisations.',
     value:toggle('Essai à blanc',this.val<boolean>('pilote_simulateur')===true,on=>this.set('pilote_simulateur',on))})]):nothing}
   <div class="actions"><button type="button" ?disabled=${!Object.keys(mine).length} @click=${()=>this.set('avance',{})}>Tout remettre par défaut</button></div>`;
 }

 /** A number to type, empty for « as found ». The integration checks the bounds again. */
 private numberRow(key:string,label:string,unit:string,min:number,max:number,step:number,placeholder:string,sub:string){
  const x=this.val<number|null>(key);
  return listRow({label,control:true,sub,value:html`<input class="num" type="number" inputmode="decimal" aria-label=${label} min=${min} max=${max} step=${step}
   placeholder=${placeholder} .value=${x==null?'':String(x)} @change=${(e:Event)=>{const t=(e.target as HTMLInputElement).value.trim().replace(',','.');
    const n=t===''?null:Number(t);this.set(key,n!=null&&Number.isFinite(n)?n:null);}}> ${unit}`});
 }

 /* ── Le guide: five questions, one at a time ── */
 private guidePage(v:View,n:number){
  const s=this.settings;
  if(!s)return html`${this.head('Guide',{lead:'Lecture…'})}`;
  const k=Math.min(Math.max(1,n),5),stove=this.hasStove(v,s);
  const names=['Ce qui chauffe','Vos thermostats','Le poêle','Le planning','Les prix'];
  const next=async()=>{if(this.count())await this.save();if(!this.refused)this.go(k<5?`guide/${k+1}`:'');};
  const f=s.trouve,allowed=this.val<string[]>('planning_autorises')??[];
  const body=k===1?html`<h2 class="g-q">Qu’est-ce qui chauffe chez vous ?</h2>
    <p class="g-lead">Hestia a regardé dans Home Assistant. Cochez ce que vous avez : elle ne vous parlera que de ça, et les réglages n’auront que ces onglets.</p>
    ${listSection('',this.kitRows(v,s))}
    <p class="hint after">Pourquoi cette question : un radiateur électrique, une pompe à chaleur et un poêle ne se règlent pas de la même façon. Il manque un appareil ? Hestia voit tout thermostat de Home Assistant qui donne une température. Pour un poêle, elle doit connaître sa marque : Micronova aujourd’hui.</p>`
   :k===2?html`<h2 class="g-q">Quels thermostats le planning peut-il régler ?</h2>
    <p class="g-lead">Hestia regarde tous vos thermostats sans rien y changer. Cochez ceux dont le planning pourra changer le mode (Hors gel, Éco, Confort, Boost). Elle ne les allume et ne les éteint jamais.</p>
    ${listSection('',f.thermostats.length?f.thermostats.map(t=>listRow({label:t.nom,control:true,sub:this.roomName(v,t.piece)||undefined,
      value:toggle('Le planning change le mode de '+t.nom,allowed.includes(t.id),on=>this.set('planning_autorises',on?[...allowed,t.id]:allowed.filter(x=>x!==t.id)))}))
     :[listRow({label:'Aucun thermostat trouvé',sub:'Hestia Chauffage lit Versatile Thermostat et les thermostats de Home Assistant (climate).'})])}
    <p class="hint after">Le reste (le planning de chaque pièce, ce qui la chauffe, la montrer ou non) est sur la page de chaque pièce, dans Pièces.</p>`
   :k===3?(stove?html`<h2 class="g-q">Comment conduire le poêle ?</h2>
    <p class="g-lead">Deux questions : qui règle la flamme, et qui l’allume et l’éteint. Tout le reste a une valeur par défaut, que vous pourrez revoir sur la page du poêle.</p>
    ${listSection('',[this.flameChoice(v,s),this.lightChoice(v,s)])}`
    :html`<h2 class="g-q">Pas de poêle à granulés</h2><p class="g-lead">Hestia n’a pas trouvé de poêle qu’elle connaît, ou vous l’avez décoché à la première étape : rien à régler ici.</p>`)
   :k===4?html`<h2 class="g-q">Votre semaine</h2>
    <p class="g-lead">Un planning, c’est une semaine en couleurs : Confort, Éco, Boost, Hors gel. Il règle les thermostats que vous lui donnez.${stove?' Pour le poêle : Boost l’allume, Hors gel l’éteint.':''} Il commence en pause : Hestia montre ce qu’elle ferait, sans rien envoyer.</p>
    ${listSection('',[listRow({label:html`<b>${(v.planning.hestia??[]).length?'Voir vos plannings':'Créer un planning'}</b>`,name:'Planning',sub:'Vous reviendrez au guide avec le bouton retour.',go:()=>this.go('planning')})])}`
   :html`<h2 class="g-q">Les prix</h2>
    <p class="g-lead">Pour dire ce que coûte chaque pièce${stove?', et ce que coûtent les granulés':''}. Laissés vides, Hestia ne parle pas d’argent.</p>
    ${listSection('',[this.priceRow(v),
     ...(stove?[this.numberRow('granules_prix_sac','Le prix d’un sac de granulés','€',0.5,50,0.01,v.granules?.prix_sac!=null?num(v.granules.prix_sac,2):'',
      v.granules?.prix_sac!=null?'Vide : d’après vos achats dans Suivi Stock Pellet.':'Vide : pas de coût des granulés.')]:[])])}`;
  return html`${this.head('Tout régler pas à pas',{back:['','Vue d’ensemble']})}
   <ol class="g-steps">${names.map((t,i)=>html`<li><button type="button" aria-current=${i+1===k?'step':nothing} @click=${()=>this.go('guide/'+(i+1))}><b>${i+1}</b>${t}</button></li>`)}</ol>
   <p class="g-count">Guide · étape ${k} sur 5</p>
   ${body}
   <div class="actions"><button type="button" class="link" @click=${()=>this.go(k<5?`guide/${k+1}`:'')}>Passer</button><span class="grow"></span>
    ${this.count()?html`<span class="hint">${this.count()>1?`${this.count()} modifications`:'1 modification'}</span>`:nothing}
    <button type="button" class="primary" ?disabled=${this.saving} @click=${()=>void next()}>${k<5?`Suivant : ${names[k].toLowerCase()}`:'Terminer'}</button></div>`;
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

import {LitElement,html,css,nothing} from 'lit';

/* The card's editor, laid out as the other bricks' (Hestia Énergie's tiles, then one Home Assistant form as Hestia
   Weather's and Hestia Confort's): what the card shows as tiles (an icon, a name, what it shows), then the room, the
   version and the optional title, and the tap in « Fonctionnalités ». Everything else is set in the « Chauffage » tab. */
type Config={type:string;card?:string;piece?:string;court?:boolean;compacte?:boolean;name?:string;tap_action?:string};
type Room={id:string;nom:string};
type Hass={language?:string;callWS?:<T>(msg:Record<string,unknown>)=>Promise<T>};
type Form={piece?:string;version?:string;name?:string;tap_action?:string};

/** A tap on a room's card (the default, its thermostat, is not written). */
export const TAP_CHOICES:[string,string][]=[['thermostat','Ouvrir le thermostat'],['page','Ouvrir la page de la pièce (onglet Chauffage)'],['none','Rien']];
/** The versions of the clock cards: the whole clock (the default, not written), a compact one, one line (a room). */
export const VERSIONS:[string,string][]=[['complete','Complète : l’horloge du jour en grand, sa légende'],
 ['compacte','Compacte : l’horloge en petit, à côté de sa phrase'],['ligne','Une ligne : le nom, la température, le mode']];
const LABELS:Record<string,string>={piece:'Pièce',version:'Version',name:'Titre facultatif',tap_action:'Appui court'};
const HELPERS:Record<string,string>={name:'Vide : le titre de la carte.',
 version:'La compacte tient environ deux fois moins de hauteur ; les chiffres de chaque heure restent au survol.',
 tap_action:'Sur la carte, ailleurs que sur un bouton ou une heure de l’horloge.'};

export const FORMATS:[string,string,string,string][]=[
 ['maison','mdi:home-thermometer-outline','La maison','qui chauffe, chaque pièce, le froid de la nuit'],
 ['poele','mdi:fireplace','Le poêle','son horloge du jour, sa flamme, ses boutons, les granulés et l’argent'],
 ['piece','mdi:thermometer','Une pièce','son horloge du jour, sa chauffe, ses modes, ce qu’elle coûte'],
 ['planning','mdi:calendar-clock','Le planning','la journée de chaque pièce et du poêle'],
];

const follow=(e:MouseEvent)=>{e.preventDefault();history.pushState(null,'',(e.currentTarget as HTMLAnchorElement).getAttribute('href')??'/hestia/chauffage');
 window.dispatchEvent(new CustomEvent('location-changed',{bubbles:true,composed:true}));};

export class HeatingEditor extends LitElement {
 static properties={hass:{attribute:false},config:{state:true},rooms:{state:true}};
 hass?:Hass;
 config?:Config;
 rooms:Room[]=[];
 static styles=css`.note{color:var(--secondary-text-color);font-size:12px;line-height:1.6;margin:0 0 16px}a{color:var(--primary-color)}
  .formats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:4px 0 16px}
  .formats button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;color:var(--primary-text-color);font-size:12px;line-height:1.45}
  .formats button:hover{border-color:var(--secondary-text-color)}
  .formats button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .formats button.on{border:2px solid var(--primary-color);padding:9px 11px}
  .formats ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}.formats button.on ha-icon{color:var(--primary-color)}
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}`;
 setConfig(config:Config){this.config={...config};}
 connectedCallback(){super.connectedCallback();void this.loadRooms();}
 private async loadRooms(){
  try{const v=await this.hass?.callWS?.<{pieces?:Room[]}>({type:'hestia_heating/view'});this.rooms=(v?.pieces??[]).map(r=>({id:r.id,nom:r.nom}));}catch{/* not ready */}
 }
 private set(change:Partial<Config>){
  const next:Config={...this.config!,...change};
  if(!next.name)delete next.name;
  if(next.card==='maison')delete next.card;      // the default card is not written
  if(next.card!=='piece'){delete next.piece;delete next.court;delete next.tap_action;}
  if(next.card!=='piece'&&next.card!=='poele')delete next.compacte;
  if(!next.court)delete next.court;
  if(!next.compacte||next.court)delete next.compacte;
  if(next.tap_action==='thermostat')delete next.tap_action;
  this.config=next;
  this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:next},bubbles:true,composed:true}));
 }
 /** The form, as the other bricks' (ha-form): the room, the version, the title, then « Fonctionnalités ». */
 private schema(card:string){
  const select=(name:string,options:[string,string][])=>({name,required:true,selector:{select:{mode:'dropdown',options:options.map(([value,label])=>({value,label}))}}});
  const rooms:[string,string][]=this.rooms.map(r=>[r.id,r.nom]);
  if(this.config?.piece&&!rooms.some(([id])=>id===this.config!.piece))rooms.push([this.config.piece,this.config.piece]);
  return [
   ...(card==='piece'&&rooms.length?[select('piece',rooms)]:[]),
   ...(card==='piece'?[select('version',VERSIONS)]:card==='poele'?[select('version',VERSIONS.slice(0,2))]:[]),
   {name:'name',selector:{text:{}}},
   ...(card==='piece'?[{type:'expandable',name:'',title:'Fonctionnalités',icon:'mdi:tune-variant',flatten:true,expanded:false,
     schema:[select('tap_action',TAP_CHOICES)]}]:[]),
  ];
 }
 private changed=(e:CustomEvent<{value:Form}>)=>{
  e.stopPropagation();
  const v=e.detail.value;
  this.set({...(v.piece?{piece:v.piece}:{}),name:(v.name??'').trim(),court:v.version==='ligne',compacte:v.version==='compacte',
   ...(v.tap_action?{tap_action:v.tap_action}:{})});
 };
 protected render(){
  if(!this.config)return nothing;
  const c=this.config,card=c.card??'maison';
  const data:Form={piece:c.piece??this.rooms[0]?.id,version:c.court?'ligne':c.compacte?'compacte':'complete',name:c.name??'',
   tap_action:c.tap_action??'thermostat'};
  return html`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${follow}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${FORMATS.map(([value,icon,name,text])=>html`<button type="button" role="radio" aria-checked=${value===card}
     class=${value===card?'on':''} @click=${()=>{if(value!==card)this.set({card:value,...(value==='piece'&&!c.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{})});}}><ha-icon icon=${icon}></ha-icon><b>${name}</b><span>${text}</span></button>`)}</div>
   <ha-form .hass=${this.hass} .data=${data} .schema=${this.schema(card)} .computeLabel=${(i:{name:string})=>LABELS[i.name]??i.name}
     .computeHelper=${(i:{name:string})=>HELPERS[i.name]??''} @value-changed=${this.changed}></ha-form>`;
 }
}
if(!customElements.get('hestia-heating-card-editor'))customElements.define('hestia-heating-card-editor',HeatingEditor);

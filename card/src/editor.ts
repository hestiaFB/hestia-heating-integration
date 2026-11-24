import {LitElement,html,css,nothing} from 'lit';

/* The card's editor: what the card shows, as tiles (an icon, a name, what it shows), the room for a room's card, an
   optional title. Everything else is set in the « Chauffage » tab. */
type Config={type:string;card?:string;piece?:string;court?:boolean;name?:string;tap_action?:string};
type Room={id:string;nom:string};
type Hass={language?:string;callWS?:<T>(msg:Record<string,unknown>)=>Promise<T>};

/** A tap on a room's card (the default, its thermostat, is not written). */
export const TAP_CHOICES:[string,string][]=[['thermostat','Ouvrir le thermostat'],['page','Ouvrir la page de la pièce (onglet Chauffage)'],['none','Rien']];

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
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}
  label{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:14px;color:var(--primary-text-color)}
  select{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color)}`;
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
  if(!next.court)delete next.court;
  if(next.tap_action==='thermostat')delete next.tap_action;
  this.config=next;
  this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:next},bubbles:true,composed:true}));
 }
 protected render(){
  if(!this.config)return nothing;
  const card=this.config.card??'maison';
  return html`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${follow}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${FORMATS.map(([value,icon,name,text])=>html`<button type="button" role="radio" aria-checked=${value===card}
     class=${value===card?'on':''} @click=${()=>{if(value!==card)this.set({card:value,...(value==='piece'&&!this.config!.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{})});}}><ha-icon icon=${icon}></ha-icon><b>${name}</b><span>${text}</span></button>`)}</div>
   ${card==='piece'?html`<label>Pièce <select @change=${(e:Event)=>this.set({piece:(e.target as HTMLSelectElement).value})}>
     ${this.rooms.map(r=>html`<option value=${r.id} ?selected=${this.config!.piece===r.id}>${r.nom}</option>`)}</select></label>
    <label><input type="checkbox" .checked=${!!this.config.court} @change=${(e:Event)=>this.set({court:(e.target as HTMLInputElement).checked})}> Version courte, sur une ligne</label>
    <label>Clic sur la carte <select @change=${(e:Event)=>this.set({tap_action:(e.target as HTMLSelectElement).value})}>
     ${TAP_CHOICES.map(([value,text])=>html`<option value=${value} ?selected=${(this.config!.tap_action??'thermostat')===value}>${text}</option>`)}</select></label>`:nothing}
   <ha-form .hass=${this.hass} .data=${{name:this.config.name??''}} .schema=${[{name:'name',selector:{text:{}}}]}
     .computeLabel=${()=>'Titre facultatif'} .computeHelper=${()=>'Vide : le titre de la carte.'}
     @value-changed=${(e:CustomEvent<{value:{name?:string}}>)=>{e.stopPropagation();this.set({name:(e.detail.value.name??'').trim()});}}></ha-form>`;
 }
}
if(!customElements.get('hestia-heating-card-editor'))customElements.define('hestia-heating-card-editor',HeatingEditor);

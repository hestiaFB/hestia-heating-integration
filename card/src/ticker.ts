import {LitElement,html,css,nothing} from 'lit';
import {keyed} from 'lit/directives/keyed.js';

/* The card's announcements (1.1.0b6, Frank: « reprendre le format des alertes Météo-France, les messages qui défilent »):
   the bubble of Hestia Weather's tile (its card/src/ui/ticker.ts and marquee.ts), brought here as it is. One point at
   a time, every 5 s: a tinted icon, a label in small grey capitals, the sentence in bold, one bar per point. A sentence
   too long for its line scrolls, and its point stays until it has gone round once. Hovering or focusing the card
   pauses it. `line`: one line only (the compact card's sentence), without icon nor label. */

export type Announce={cle:string;label:string;icone:string;texte:string;ton:'alert'|'act'|'calm'};

const STEP=5000;          // every point stays 5 s
const SPEED=40;           // the scrolling, in pixels per second
const GAP=40;             // between the end of the text and its next round
const STILL=0.2;          // share of each round spent still, the start of the text in place
const EVENT='hc-marquee';

/** The scrolling line: it only measures whether its text overflows; the ticker's styles move it. */
const Marquee=typeof HTMLElement==='undefined'?undefined:class HestiaHeatingMarquee extends HTMLElement{
 private observer?:ResizeObserver;
 round=0;
 connectedCallback(){
  this.observer??=new ResizeObserver(()=>this.measure());
  this.observer.observe(this);
  const run=this.firstElementChild;
  if(run)this.observer.observe(run);
 }
 disconnectedCallback(){this.observer?.disconnect();}
 private measure(){
  const run=this.firstElementChild as HTMLElement|null;
  if(!run||!this.clientWidth)return;
  const moving=this.hasAttribute('moving'),text=run.offsetWidth;
  // One pixel of tolerance; moving or still, the line asks for the same width (Weather 4.3.1: a pill that jumped).
  if(text<=this.clientWidth+1){if(moving){this.removeAttribute('moving');this.tell(0);}return;}
  const px=text+GAP,seconds=Math.round(px/SPEED/(1-STILL)*10)/10;
  this.style.setProperty('--hc-run',`${px}px`);
  this.style.setProperty('--hc-run-time',`${seconds}s`);
  if(!moving)this.setAttribute('moving','');
  if(seconds*1000!==this.round)this.tell(seconds*1000);
 }
 private tell(round:number){this.round=round;this.dispatchEvent(new CustomEvent(EVENT,{bubbles:true,detail:round}));}
};
if(Marquee&&!customElements.get('hestia-heating-marquee'))customElements.define('hestia-heating-marquee',Marquee);

const scrolling=(words:string)=>html`<hestia-heating-marquee><span class="run">${words}</span><span class="run" aria-hidden="true">${words}</span></hestia-heating-marquee>`;

export class HestiaHeatingTicker extends LitElement{
 static properties={points:{attribute:false},line:{type:Boolean,reflect:true},index:{state:true},leaving:{state:true}};
 points:Announce[]=[];
 line=false;
 index=0;
 leaving=false;
 private rounds=new Map<string,number>();
 private roundDone=false;
 private waiting=false;
 private timer?:ReturnType<typeof setInterval>;
 private swap?:ReturnType<typeof setTimeout>;
 private shown?:string;

 connectedCallback(){super.connectedCallback();this.leaving=false;this.start();}
 disconnectedCallback(){super.disconnectedCallback();clearInterval(this.timer);clearTimeout(this.swap);}
 private start(){clearInterval(this.timer);this.timer=setInterval(()=>this.next(),STEP);}
 private get reduced(){return matchMedia('(prefers-reduced-motion: reduce)').matches;}
 protected willUpdate(changed:Map<PropertyKey,unknown>){
  if(!changed.has('points'))return;
  // The point on screen stays if it is still in the list: nothing moves.
  const keep=this.points.findIndex(p=>p.texte===this.shown);
  if(keep>=0){this.index=keep;return;}
  if(this.shown===undefined||this.reduced){this.index=0;return;}
  this.leaving=true;clearTimeout(this.swap);
  this.swap=setTimeout(()=>{this.index=0;this.leaving=false;},300);
 }
 private next(){
  const card=(this.getRootNode() as ShadowRoot).host;
  if(this.points.length<2||document.hidden||card?.matches(':hover, :focus-within'))return;
  // A long sentence is read to its end.
  const m=this.renderRoot.querySelector('hestia-heating-marquee') as {round?:number}|null;
  if((m?.round??0)&&!this.roundDone){this.waiting=true;return;}
  this.waiting=false;
  const advance=()=>{this.index=(this.index+1)%this.points.length;this.leaving=false;};
  if(this.reduced){advance();return;}
  this.leaving=true;this.swap=setTimeout(advance,350);
 }
 private measured=(e:Event)=>{if(this.shown!==undefined){this.rounds.set(this.shown,(e as CustomEvent<number>).detail);this.requestUpdate();}};
 private lap=(e:AnimationEvent)=>{
  if(e.animationName!=='hc-run'||(e.target as Element).previousElementSibling)return;
  this.roundDone=true;
  if(this.waiting){this.next();this.start();}
 };
 protected render(){
  const p=this.points[this.index%Math.max(1,this.points.length)];
  if(p?.texte!==this.shown)this.roundDone=false;
  this.shown=p?.texte;
  if(!p)return nothing;
  const n=this.index%this.points.length,many=this.points.length>1;
  return html`<div class=${'say '+p.ton} aria-hidden="true" @hc-marquee=${this.measured} @animationiteration=${this.lap}>
   ${keyed(n,html`<div class=${'item'+(this.leaving?' out':'')}>${this.line?html`<i class="dot"></i>`:html`<span class="badge"><ha-icon icon=${p.icone}></ha-icon></span>`}
    <div class="txt">${this.line?nothing:html`<div class="when">${p.label}</div>`}<div class="x">${scrolling(p.texte)}</div></div></div>`)}
   ${many?html`<span class="progress" style=${`--step:${Math.max(STEP,this.rounds.get(p.texte)??0)}ms`}>${this.points.map((_,i)=>i===n
     ?keyed(`on-${n}`,html`<i class="on"></i>`):html`<i class=${i<n?'done':''}></i>`)}</span>`:nothing}</div>
  <ul class="sr" role="status">${this.points.map(x=>html`<li>${x.label} : ${x.texte}</li>`)}</ul>`;
 }
 static styles=css`
  :host { display:block; min-width:0; color:var(--nw-fg); }
  ha-icon { display:flex; line-height:0; }
  .say { --tone:var(--nw-act); display:flex; align-items:center; gap:12px; min-width:0; }
  .say.alert { --tone:var(--nw-alert); } .say.calm { --tone:var(--nw-fg2); }
  .item { flex:1; min-width:0; display:flex; align-items:center; gap:12px; animation:swap .28s var(--nw-ease, ease) both; transition:opacity .3s, transform .3s; }
  .item.out { opacity:0; transform:translateY(-6px); }
  @keyframes swap { from { opacity:0; transform:translateY(8px); } }
  .badge { display:grid; place-items:center; width:36px; height:36px; flex:none; border-radius:11px; background:color-mix(in oklab, var(--tone) 34%, transparent); }
  .badge ha-icon { --mdc-icon-size:18px; color:color-mix(in oklab, var(--tone) 40%, var(--nw-fg)); }
  .txt { min-width:0; flex:1; }
  .when { font-size:var(--nw-fs-label, 11px); line-height:14px; letter-spacing:.08em; text-transform:uppercase; font-weight:650; white-space:nowrap; color:var(--nw-fg2); }
  .x { font-size:var(--nw-fs-text, 14px); line-height:20px; font-weight:600; min-width:0; }
  :host([line]) .item { gap:7px; }
  :host([line]) .dot { flex:none; width:7px; height:7px; border-radius:50%; background:var(--tone); }
  :host([line]) .x { font-size:inherit; line-height:inherit; color:color-mix(in oklab, var(--tone) var(--nw-ink, 60%), var(--nw-fg)); }
  :host([line]) .progress { align-self:center; margin-top:0; }
  .progress { display:flex; gap:4px; flex:0 1 auto; min-width:0; align-self:flex-start; margin-top:6px; }
  .progress i { position:relative; flex:0 1 16px; min-width:6px; height:3px; border-radius:2px; background:var(--nw-line); overflow:hidden; }
  .progress i.done { background:color-mix(in srgb, var(--nw-fg2) 60%, transparent); }
  .progress i.on::after { content:''; position:absolute; inset:0; background:var(--nw-fg2); transform-origin:left; animation:fill var(--step) linear forwards; animation-play-state:var(--nw-motion, running); }
  @keyframes fill { from { transform:scaleX(0); } }
  hestia-heating-marquee { display:block; position:relative; min-width:0; overflow:hidden; white-space:nowrap; }
  hestia-heating-marquee .run { display:inline-block; }
  hestia-heating-marquee .run + .run { display:none; }
  hestia-heating-marquee[moving] { mask-image:linear-gradient(90deg, transparent, #000 6px, #000 calc(100% - 18px), transparent); }
  hestia-heating-marquee[moving] .run { animation:hc-run var(--hc-run-time, 12s) linear infinite; animation-play-state:var(--nw-motion, running); }
  hestia-heating-marquee[moving] .run + .run { display:inline-block; position:absolute; left:var(--hc-run, 0px); }
  @media (hover:hover) { :hover > hestia-heating-marquee[moving] .run { animation-play-state:paused; } }
  @keyframes hc-run { 0%, 20% { transform:translateX(0); } 100% { transform:translateX(calc(-1 * var(--hc-run, 0px))); } }
  @media (prefers-reduced-motion:reduce) {
   .item { animation:none; transition:none; } .progress i.on::after { animation:none; }
   hestia-heating-marquee, hestia-heating-marquee[moving] { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; white-space:normal; mask-image:none; }
   hestia-heating-marquee .run, hestia-heating-marquee[moving] .run { display:inline; position:static; animation:none; }
   hestia-heating-marquee .run + .run, hestia-heating-marquee[moving] .run + .run { display:none; } }
  .sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; margin:0; padding:0; }
 `;
}
if(typeof customElements!=='undefined'&&!customElements.get('hestia-heating-ticker'))customElements.define('hestia-heating-ticker',HestiaHeatingTicker);

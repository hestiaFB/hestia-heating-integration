import {svg,html,nothing,type TemplateResult} from 'lit';

/* The cards' clock (0.8, after the mock-up validated by Frank on 24 Nov. 2026), for every kind of heating: a 24-hour
   dial, midnight at the top. The ring is the day's planning; the trace, the room's temperature over the last 20 hours
   (the farther from the centre, the warmer), over the set points' dotted circles; the ticks inside the ring, the
   heating (a thermostat's demand, a stove's flame); the hand, now. In the middle: the heating's picture, the
   temperature and what comes next, in HTML over the drawing so that they stay sharp and readable at any width. */
export const VIEW_W=472,VIEW_H=340;
const CX=236,CY=170,RING=150,DISC=64,TRACE_IN=82,TRACE_W=38,TICK=138,HAND_IN=66;
/** The trace stops this long before the hand, so that yesterday's end never meets today's start. */
export const TRACE_MIN=20*60;
const STEP=5;

/** [minutes since the window's start, value]: the integration's day view (hestia_heating/day, `heures`). */
export type Pt=[number,number|null];
export type Seg={de:number;a:number;ton:string};
/** A dot on the ring: `at` is a minute of the day. */
export type Mark={at:number;cls:string};
export type Dial={
 /** The ring: today's planning, in minutes of the day. */
 segments:Seg[];
 /** The window's first minute as a minute of the day, its length, and now (a minute of the day). */
 start:number;length:number;now:number;
 temp:Pt[];refs:number[];
 /** Heating from 0 to 1 (a demand, a flame over its maximum), and the ticks' class. */
 ticks:Pt[];tickCls:string;tickMin:number;tickLen:number;
 marks:Mark[];label:string;
};

const f=(n:number)=>n.toFixed(1);
const minuteOfDay=(m:number)=>((m%1440)+1440)%1440;
function at(r:number,minute:number):[number,number]{
 const t=minuteOfDay(minute)/1440*2*Math.PI-Math.PI/2;
 return [CX+r*Math.cos(t),CY+r*Math.sin(t)];
}
function arc(r:number,a1:number,a2:number){
 if(a2-a1>=1436)return `M${CX} ${CY-r}a${r} ${r} 0 1 1 0 ${2*r}a${r} ${r} 0 1 1 0 ${-2*r}`;
 const [x1,y1]=at(r,a1),[x2,y2]=at(r,a2);
 return `M${f(x1)} ${f(y1)}A${r} ${r} 0 ${a2-a1>720?1:0} 1 ${f(x2)} ${f(y2)}`;
}
/** The values every STEP minutes from `from` to `to`, each one held until the next (a state's history), null before
    the first one and across a gap. */
export function sample(points:Pt[],from:number,to:number,step=STEP):Pt[]{
 const out:Pt[]=[];let i=0,cur:number|null=null;
 for(let m=from;m<=to;m+=step){
  while(i<points.length&&points[i][0]<=m){cur=points[i][1];i++;}
  out.push([m,cur]);
 }
 return out;
}
function runs(points:Pt[]){
 const out:[number,number][][]=[];let cur:[number,number][]|null=null;
 for(const [m,v] of points){if(v==null){cur=null;continue;}if(!cur){cur=[];out.push(cur);}cur.push([m,v]);}
 return out;
}

export function dial(d:Dial,center:TemplateResult):TemplateResult{
 const end=d.length,from=Math.max(0,end-TRACE_MIN);
 const abs=(m:number)=>d.start+m;
 const temps=sample(d.temp,from,end);
 const vals=[...temps.map(p=>p[1]).filter((x):x is number=>x!=null),...d.refs];
 let lo=vals.length?Math.floor(Math.min(...vals)-.5):16,hi=vals.length?Math.ceil(Math.max(...vals)+.5):22;
 if(hi-lo<3){const mid=(hi+lo)/2;lo=Math.floor(mid-1.5);hi=lo+3;}
 const R=(t:number)=>TRACE_IN+Math.max(0,Math.min(1,(t-lo)/(hi-lo)))*TRACE_W;
 const trace=runs(temps).filter(r=>r.length>1);
 const line=(run:[number,number][])=>run.map(([m,v],i)=>{const [x,y]=at(R(v),abs(m));return `${i?'L':'M'}${f(x)} ${f(y)}`;}).join('');
 const area=trace.map(run=>line(run)+run.slice().reverse().map(([m])=>{const [x,y]=at(DISC,abs(m));return `L${f(x)} ${f(y)}`;}).join('')+'Z').join('');
 let ticks='';
 for(const [m,v] of sample(d.ticks,from,end,10)){
  if(v==null||v<d.tickMin)continue;
  const [x1,y1]=at(TICK,abs(m)),[x2,y2]=at(TICK-1-Math.min(1,v)*d.tickLen,abs(m));
  ticks+=`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`;
 }
 const [hx1,hy1]=at(HAND_IN,d.now),[hx2,hy2]=at(RING,d.now);
 const refs=[...new Set(d.refs.map(r=>Math.round(r*2)/2))].sort((a,b)=>b-a).slice(0,3);
 const deg=(t:number)=>`${t.toLocaleString('fr-FR',{maximumFractionDigits:1})}°`;
 return html`<div class="dial"><svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" role="img" aria-label=${d.label}>
  <circle class="rim" cx=${CX} cy=${CY} r=${RING}></circle>
  ${d.segments.filter(s=>s.a-s.de>4).map(s=>svg`<path class=${'seg t-'+s.ton} d=${arc(RING,s.de+2,s.a-2)}></path>`)}
  ${refs.map(t=>svg`<circle class="ref" cx=${CX} cy=${CY} r=${f(R(t))}></circle><text class="reft" x=${CX+4} y=${f(CY-R(t)-3)}>${deg(t)}</text>`)}
  ${ticks?svg`<path class=${'ticks '+d.tickCls} d=${ticks}></path>`:nothing}
  ${area?svg`<path class="area" d=${area}></path>`:nothing}
  ${trace.length?svg`<path class="trace" d=${trace.map(line).join('')}></path>`:nothing}
  <line class="hand" x1=${f(hx1)} y1=${f(hy1)} x2=${f(hx2)} y2=${f(hy2)}></line>
  <circle class="knob" cx=${f(hx2)} cy=${f(hy2)} r="7"></circle>
  ${d.marks.map(k=>{const [x,y]=at(RING,k.at);return svg`<circle class=${'mark '+k.cls} cx=${f(x)} cy=${f(y)} r="5"></circle>`;})}
  <circle class="disc" cx=${CX} cy=${CY} r=${DISC}></circle>
  <text class="hour" x=${CX} y="4">0 h</text><text class="hour" x="413" y=${CY}>6 h</text>
  <text class="hour" x=${CX} y="337">12 h</text><text class="hour" x="59" y=${CY}>18 h</text>
 </svg><div class="mid">${center}</div></div>`;
}

/* The heating's pictures, each in the same 64 × 52 box. The waves rise and the flame flickers while it heats (never
   with « reduce motion »). */
const rect=(x:number,y:number,w:number,h:number,r:number)=>
 `M${x+r} ${y}h${w-2*r}a${r} ${r} 0 0 1 ${r} ${r}v${h-2*r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w-2*r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h-2*r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const dot=(x:number,y:number,r:number)=>`M${x-r} ${y}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0`;
const waves=(xs:number[],y:number,cls='')=>xs.map((x,i)=>svg`<path class=${`wave rise r${i} ${cls}`} d=${`M${x} ${y}c-3-3 3-5 0-8c-3-3 3-5 0-8`}></path>`);

function electric(on:boolean){
 return svg`${[0,1,2,3,4,5].map(i=>svg`<path class="metal" d=${rect(6+i*8.8,18,7,24,3)}></path>`)}
  <path class="foot" d=${rect(4,39,56,3,1.5)+rect(9,42,4,5,1)+rect(51,42,4,5,1)}></path>
  <path class=${'led'+(on?' on':'')} d=${dot(57.5,23,1.8)}></path>${on?waves([17,32,47],16):nothing}`;
}
function water(on:boolean){
 return svg`<path class="pipe" d="M8 44H14V40M50 40V44H58M12 21.5H7"></path>
  ${[0,1,2,3,4].map(i=>svg`<path class="metal" d=${rect(13+i*8,17,6.5,26,3.25)}></path>`)}
  <path class="foot" d=${rect(12,20,42,3,1.5)+rect(12,37,42,3,1.5)}></path><path class="valve" d=${rect(1,16,7,11,3)}></path>
  <path class=${'led'+(on?' on':'')} d=${rect(2.5,18,4,1.6,.8)+rect(2.5,21,4,1.6,.8)}></path>${on?waves([22,33,44],16):nothing}`;
}
function split(air:'heat'|'cool'|null){
 return svg`<path class="metal" d=${rect(6,10,52,20,6)}></path><path class="foot" d=${rect(6,23,52,7,3)}></path>
  <path class="slot" d=${rect(12,25,40,2.5,1.25)}></path><path class=${'led'+(air?' on '+air:'')} d=${dot(50,16,1.8)}></path>
  ${air?[18,32,46].map((x,i)=>svg`<path class=${`wave blow r${i} ${air}`} d=${`M${x} 33c3 3-3 5 0 8c3 3-3 5 0 8`}></path>`):nothing}`;
}
const FLAME='M50 140C15 140 4 110 10 86C16 62 34 52 38 28C40 16 46 6 50 0C56 18 72 30 80 52C88 72 96 92 90 112C84 130 70 140 50 140Z';
const FLAME2='M50 140C28 140 20 118 24 100C28 84 40 76 44 58C50 70 62 80 68 96C74 112 72 140 50 140Z';
const FLAME3='M50 140C38 140 34 128 36 118C38 108 46 102 48 92C54 102 62 110 62 122C62 134 58 140 50 140Z';
/** The stove: its flame grows with its level (1 to its maximum). */
export function stoveArt(level:number,max:number,on:boolean){
 const s=level>0?.035+.1*Math.min(1,level/Math.max(1,max)):0;
 const tf=`translate(${(32-50*s).toFixed(2)} ${(37-140*s).toFixed(2)}) scale(${s.toFixed(3)})`;
 return svg`<defs><linearGradient id="hcFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9733f"></stop>
  <stop offset=".6" stop-color="#f1a066"></stop><stop offset="1" stop-color="#f4ca84" stop-opacity=".75"></stop></linearGradient></defs>
  <path class="s-pipe" d=${rect(37,2,6,10,1)}></path><path class="s-body" d=${rect(15,13,34,32,4)}></path>
  <path class="s-top" d=${rect(13,10,38,5,2)}></path><path class="s-glass" d=${rect(20,18,24,21,3)}></path>
  <path class=${'s-bed'+(on?' on':'')} d=${rect(23,35,18,3,1.5)}></path>
  ${s?svg`<g transform=${tf}><path class="flick" fill="url(#hcFlame)" d=${FLAME}></path><path class="flick2 s-f2" d=${FLAME2}></path>
   <path class="flick s-f3" d=${FLAME3}></path></g>`:nothing}
  <path class="s-pipe" d=${rect(18,45,5,5,1)+rect(41,45,5,5,1)}></path><path class=${'s-led'+(on?' on':'')} d=${dot(45,12.5,1.6)}></path>`;
}
/** A room's heating, by its thermostat's kind (sources.kind): electric, water (a valve), or a split unit. */
export function heaterArt(type:string|null,state:string){
 const on=state==='chauffe';
 if(type==='vanne')return water(on);
 if(type==='clim'||type==='pac')return split(on?'heat':state==='rafraichit'?'cool':null);
 return electric(on);
}
export function center(art:TemplateResult,temp:string,sub:string){
 return html`<svg class="art" viewBox="0 0 64 52" aria-hidden="true">${art}</svg><div class="ct">${temp}</div>${sub?html`<div class="cs">${sub}</div>`:nothing}`;
}

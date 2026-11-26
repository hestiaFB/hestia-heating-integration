import {svg,html,nothing,type TemplateResult} from 'lit';

/* The cards' clock, for every kind of heating: a 24-hour wheel, midnight at the top (0.8; 0.8.0b3 after the mock-up
   « la roue au survol » validated by Frank on 24 Nov. 2026, after Hestia Énergie's wheel).
   - The ring, cut in 24 hours: the day's planning.
   - Out of the ring, one stroke an hour: how much it heated (a stove's flame step, a thermostat's demand), the longer
     and the more orange the more. The four hours after the hand are still to come: yesterday's stroke, in grey.
   - Inside: the room's temperature over the last 20 hours (the farther from the centre, the warmer), its set point in
     steps, the scale written in the gap after the hand.
   - In the middle: the heating's picture and the temperature, in HTML over the drawing so that they stay sharp. Over an
     hour (a mouse, a finger, the keyboard), that hour grows, the others fade, and its figures come to the middle. */
export const VIEW_W=440,VIEW_H=386;
const CX=220,CY=193,DISC=64,T_IN=76,T_W=40,RING=128,SP_IN=142,SP_L=28,LAB=184,HIT_OUT=190;
/** The trace stops this long before the hand, so that yesterday's end never meets today's start. */
export const TRACE_MIN=20*60;
/** The half-size of a compact card's drawing: the steps' outer edge, and a little more. */
const TIGHT=SP_IN+SP_L+4;
const STEP=5;

/** [minutes since the window's start, value]: the integration's day view (hestia_heating/day, `heures`). */
export type Pt=[number,number|null];
export type Seg={de:number;a:number;ton:string};
/** A dot on the ring: `at` is a minute of the day. */
export type Mark={at:number;cls:string};
/** The clock's window: its first minute as a minute of the day, its length, and now (a minute of the day). */
export type Span={start:number;length:number;now:number};
/** The window's series: the temperature, the heating from 0 to 1, a stove's flame (its level), the set point (null
    where there is none to draw), and each hour's kWh or kilos ([the minute its hour starts, value]). */
export type Series={temp:Pt[];heat:Pt[];level?:Pt[];sets:Pt[];energy:[number,number][]};
/** One hour of the dial, at its latest time: today when it has begun, else yesterday. `from` and `to` are minutes of
    the window; `burn` the share of it the stove burnt, `level` its mean flame while it burnt. */
export type Hour={k:number;from:number;to:number;current:boolean;yesterday:boolean;ahead:boolean;ton:string|null;
 temp:number|null;heat:number|null;burn:number|null;level:number|null;set:number|null;energy:number|null};
/** What the middle says of an hour: its time, a value (a word for an hour to come), two lines. */
export type Detail={range:string;value:string;word?:boolean;lines:[string,string]};
export type Wheel={
 span:Span;segments:Seg[];series:Series;hours:Hour[];
 /** The strokes' colours: a stove's flame or a thermostat's demand; a flame's maximum. */
 kind:'flame'|'demand';max?:number;
 marks:Mark[];label:string;
 /** The hour shown (hovered or pinned), the one pinned, the last one shown (so that the middle fades out on it). */
 pick?:number;pin?:number;last?:number;
 say:(h:Hour)=>Detail;onHover:(k?:number)=>void;onPin:(k?:number)=>void;
 /** A tap on the middle (a room's card opens its thermostat): its words for a screen reader, and the press. */
 tap?:{label:string;run:(e:Event)=>void};
 /** The compact cards (1.0.0b8): the drawing cut to the wheel itself, without the room left for the hours' words. */
 tight?:boolean;
};

const f=(n:number)=>n.toFixed(1);
const mod=(m:number)=>((m%1440)+1440)%1440;
function at(r:number,minute:number):[number,number]{
 const t=mod(minute)/1440*2*Math.PI-Math.PI/2;
 return [CX+r*Math.cos(t),CY+r*Math.sin(t)];
}
function arc(r:number,a1:number,a2:number){
 const [x1,y1]=at(r,a1),[x2,y2]=at(r,a2);
 return `M${f(x1)} ${f(y1)}A${r} ${r} 0 ${a2-a1>720?1:0} 1 ${f(x2)} ${f(y2)}`;
}
function wedge(r1:number,r2:number,a:number,b:number){
 const [x1,y1]=at(r1,a),[x2,y2]=at(r2,a),[x3,y3]=at(r2,b),[x4,y4]=at(r1,b);
 return `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}A${r2} ${r2} 0 0 1 ${f(x3)} ${f(y3)}L${f(x4)} ${f(y4)}A${r1} ${r1} 0 0 0 ${f(x1)} ${f(y1)}Z`;
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
const known=(pts:Pt[])=>pts.map(p=>p[1]).filter((x):x is number=>x!=null);
const mean=(xs:number[])=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;

/** The 24 hours of the dial. The four after the hand lie beyond the trace's 20 hours: they are still to come today,
    and their figures are yesterday's. */
export function hours(w:Span,segments:Seg[],s:Series):Hour[]{
 const midnight=w.length-mod(w.start+w.length);
 return Array.from({length:24},(_,k):Hour=>{
  const from=mod(k*60-w.start),to=Math.min(from+60,w.length);
  const take=(pts:Pt[]|undefined)=>pts&&from<to?known(sample(pts,from,Math.max(from,to-1))):[];
  const levels=s.level?take(s.level):[],lit=levels.filter(x=>x>0),sets=take(s.sets);
  const half=k*60+30;
  return {k,from,to,current:from<w.length&&from+60>w.length,yesterday:from<midnight,ahead:from<w.length-TRACE_MIN,
   ton:segments.find(g=>g.de<=half&&half<g.a)?.ton??null,temp:mean(take(s.temp)),heat:mean(take(s.heat)),
   burn:levels.length?lit.length/levels.length:null,level:mean(lit),set:sets.length?sets[sets.length-1]:null,
   energy:s.energy.find(([m])=>Math.abs(m-from)<=1)?.[1]??null};
 });
}

/** The set points worth drawing: those the trace comes near. A set point more than FAR degrees under the whole trace
    (a frost guard while the room stays warm) would only squash the trace against the middle and be read as its level. */
const FAR=3;
/** A thermostat's demand in blocks of 20 %; the gap between two blocks. */
const DEMAND_STEPS=5,BLOCK_GAP=1.6;
const deg=(t:number)=>`${t.toLocaleString('fr-FR',{maximumFractionDigits:1})}°`;
/** A label's box in the drawing's units: about 6 per character at 10.5 px, and 11 high. */
const box=(text:string)=>6*text.length+4;
const LABEL_H=11;

export function wheel(w:Wheel,rest:TemplateResult):TemplateResult{
 const {span,series}=w,end=span.length,from=Math.max(0,end-TRACE_MIN);
 const abs=(m:number)=>span.start+m;
 const temps=sample(series.temp,from,end),seen=known(temps);
 const low=seen.length?Math.min(...seen)-FAR:-Infinity;
 // The set point in steps, where it is near the trace; its values (at most three) join the scale.
 const sets=sample(series.sets,from,end).map(([m,v]):Pt=>[m,v!=null&&v>=low?Math.round(v*2)/2:null]);
 const refs=[...new Set(known(sets))].sort((a,b)=>b-a).slice(0,3);
 const vals=[...seen,...refs];
 let lo=vals.length?Math.floor(Math.min(...vals)-.5):16,hi=vals.length?Math.ceil(Math.max(...vals)+.5):22;
 if(hi-lo<3){const mid=(hi+lo)/2;lo=Math.floor(mid-1.5);hi=lo+3;}
 const R=(t:number)=>T_IN+Math.max(0,Math.min(1,(t-lo)/(hi-lo)))*T_W;
 const trace=runs(temps).filter(r=>r.length>1);
 const line=(run:[number,number][])=>run.map(([m,v],i)=>{const [x,y]=at(R(v),abs(m));return `${i?'L':'M'}${f(x)} ${f(y)}`;}).join('');
 const area=trace.map(run=>line(run)+run.slice().reverse().map(([m])=>{const [x,y]=at(DISC+2,abs(m));return `L${f(x)} ${f(y)}`;}).join('')+'Z').join('');
 let setPath='',prev:number|null=null;
 for(const [m,c] of sets){
  if(c==null||!refs.includes(c)){prev=null;continue;}
  const [x,y]=at(R(c),abs(m));
  if(prev==null)setPath+=`M${f(x)} ${f(y)}`;
  else{
   // A change of set point: along the old one up to now, then a step across.
   if(c!==prev){const [px,py]=at(R(prev),abs(m));setPath+=`L${f(px)} ${f(py)}`;}
   setPath+=`L${f(x)} ${f(y)}`;
  }
  prev=c;
 }
 // The trace's scale: dotted circles at whole degrees at least 12 apart (a degree next to a set point gives way to
 // it). Their values are written in the gap the trace leaves just after the hand, where nothing else is drawn, from
 // the inside out: along the radius at the gap's middle, or, when the gap lies sideways and the labels would cover
 // each other (they are wider than high), as a staircase across it, one way or the other.
 const gap=span.start+(end+from+1440)/2,range=hi-lo;
 const step=[1,2,5,10].find(x=>x*T_W/range>=12)??10;
 const grads:number[]=[];
 if(trace.length)for(let t=Math.ceil(lo/step)*step;t<=hi;t+=step)if(!refs.some(r=>Math.abs(r-t)<=step/2))grads.push(t);
 const items=[...refs.map(t=>({t,set:true})),...grads.map(t=>({t,set:false}))].sort((a,b)=>a.t-b.t);
 const clash=(a:{x:number;y:number;w:number},b:{x:number;y:number;w:number})=>Math.abs(a.x-b.x)<(a.w+b.w)/2+2&&Math.abs(a.y-b.y)<LABEL_H;
 const lay=(list:typeof items,turn:number)=>list.map((it,i)=>{const [x,y]=at(R(it.t),gap+(i-(list.length-1)/2)*turn);
  return {...it,x,y,w:box(deg(it.t))};});
 const fits=(ls:ReturnType<typeof lay>)=>ls.every((l,i)=>ls.slice(i+1).every(o=>!clash(l,o)));
 let labels:ReturnType<typeof lay>=[];
 // Fewer labels when they cannot fit: every other whole degree, then the set points alone.
 for(const list of [items,items.filter((it,i)=>it.set||i%2===0),items.filter(it=>it.set)]){
  const turn=[0,12,-12,24,-24,36,-36].find(x=>(list.length-1)/2*Math.abs(x)<=80&&fits(lay(list,x)));
  if(turn!=null){labels=lay(list,turn);break;}
 }
 const last=trace.length?trace[trace.length-1][trace[trace.length-1].length-1]:null;
 const [ex,ey]=last?at(R(last[1]),abs(last[0])):[0,0];
 const [hx1,hy1]=at(DISC+4,span.now),[hx2,hy2]=at(RING,span.now);

 // The hour shown: the one hovered or pinned; the middle and the light keep the last one while they fade out.
 const pick=w.pick,shown=w.hours[pick??w.last??-1],dist=(k:number)=>{const d=Math.abs(k-pick!);return Math.min(d,24-d);};
 const near=(k:number)=>pick==null?'':dist(k)===0?' on':dist(k)===1?' near':' far';
 // One hour takes the keyboard's Tab (the one pinned, shown, or now); the arrows go round from it.
 const now=w.hours.find(h=>h.current)?.k??Math.floor(mod(span.now)/60),focus=w.pin??pick??now;
 let dot:[number,number]|null=null;
 if(shown&&!shown.ahead){
  const m=Math.min(shown.from+30,shown.to-1),v=sample(series.temp,m,m)[0]?.[1];
  if(v!=null&&m>=from)dot=at(R(v),abs(m));
 }
 const detail=shown?w.say(shown):null,max=Math.max(2,w.max??5);
 const tone=(t:string)=>['confort','eco','poele','boost'].includes(t)?t:'off';
 const key=(e:KeyboardEvent,k:number)=>{
  const go=(n:number)=>{e.preventDefault();((e.currentTarget as Element).parentNode?.querySelector(`.hit[data-k="${n}"]`) as SVGElement|null)?.focus();};
  if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();w.onPin(w.pin===k?undefined:k);}
  else if(e.key==='Escape'){if(w.pin!=null){e.stopPropagation();w.onPin(undefined);}}
  else if(e.key==='ArrowRight'||e.key==='ArrowDown')go((k+1)%24);
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp')go((k+23)%24);
 };
 const discKey=(e:KeyboardEvent)=>{if(w.tap&&(e.key==='Enter'||e.key===' ')){e.preventDefault();w.tap.run(e);}};
 // A tap on the middle lets go of the hour pinned; else it is the card's (a room's card opens its thermostat).
 const discClick=(e:Event)=>{if(w.pin!=null){e.stopPropagation();w.onPin(undefined);}};
 return html`<div class=${'wheel'+(pick!=null?' picking':'')}><svg viewBox=${w.tight?`${CX-TIGHT} ${CY-TIGHT} ${2*TIGHT} ${2*TIGHT}`:`0 0 ${VIEW_W} ${VIEW_H}`} role="group" aria-label=${w.label}
   @pointerleave=${()=>w.onHover(undefined)}>
  <defs><radialGradient id="hcArea" cx=${CX} cy=${CY} r=${T_IN+T_W} gradientUnits="userSpaceOnUse">
   <stop class="gs0" offset=".52"></stop><stop class="gs1" offset="1"></stop></radialGradient></defs>
  <path class="lit" d=${shown?wedge(DISC+2,SP_IN+SP_L+18,shown.k*60+1,shown.k*60+59):''}></path>
  ${w.hours.map(h=>{const a=h.k*60+3,b=h.k*60+57;
   return svg`<g class=${'cell'+near(h.k)}><path class="t-none" d=${arc(RING,a,b)}></path>${w.segments.filter(g=>g.a>a&&g.de<b)
    .map(g=>svg`<path class=${'t-'+tone(g.ton)} d=${arc(RING,Math.max(a,g.de),Math.min(b,g.a))}></path>`)}</g>`;})}
  ${grads.map(t=>svg`<circle class="grid" cx=${CX} cy=${CY} r=${f(R(t))}></circle>`)}
  ${area?svg`<path class="area" fill="url(#hcArea)" d=${area}></path>`:nothing}
  ${trace.length?svg`<path class="trace" pathLength="1" d=${trace.map(line).join('')}></path>`:nothing}
  ${setPath?svg`<path class="set" d=${setPath}></path>`:nothing}
  ${w.hours.map(h=>{
   // Each hour, outside the ring, its steps as small blocks (1.0.0b8, after Frank: the strokes of the 0.8.0b3 read as
   // big dashes, never a whole circle): every hour has them all, the steps it reached are lit. A stove's flame lights
   // as many as its step (a flame 3 for twenty minutes is still a flame 3, its minutes are in the middle); a
   // thermostat's demand one for each 20 %. The hours still to come keep theirs unlit.
   const flame=w.kind==='flame',n=flame?max:DEMAND_STEPS;
   const lit=h.ahead?0:flame?(h.burn!=null&&h.burn>0&&h.level!=null?Math.max(1,Math.min(n,Math.round(h.level))):0)
    :h.heat==null||h.heat<.02?0:Math.max(1,Math.min(n,Math.ceil(h.heat*n-.001)));
   const a=h.k*60+6,b=h.k*60+54,size=(SP_L-(n-1)*BLOCK_GAP)/n;
   return svg`<g class=${'steps '+w.kind+(h.ahead?' ahead':'')+near(h.k)} style=${`animation-delay:${h.k*22}ms`}>${Array.from({length:n},(_,i)=>{
    const r1=SP_IN+i*(size+BLOCK_GAP);
    return svg`<path class=${i<lit?'blk on':'blk'} style=${i<lit?`--p:${n>1?Math.round(i/(n-1)*100):100}%`:nothing} d=${wedge(r1,r1+size,a,b)}></path>`;})}</g>`;})}
  ${labels.map(l=>svg`<text class=${l.set?'gt set':'gt'} x=${f(l.x)} y=${f(l.y)}>${deg(l.t)}</text>`)}
  <line class="hand" x1=${f(hx1)} y1=${f(hy1)} x2=${f(hx2)} y2=${f(hy2)}></line>
  ${last?svg`<circle class="now" cx=${f(ex)} cy=${f(ey)} r="4.5"></circle>`:nothing}
  <circle class=${'tdot'+(dot&&pick!=null?' on':'')} cx=${f(dot?.[0]??CX)} cy=${f(dot?.[1]??CY)} r="5.5"></circle>
  ${w.marks.map(k=>{const [x,y]=at(RING,k.at);return svg`<circle class=${'mark '+k.cls} cx=${f(x)} cy=${f(y)} r="5.5"></circle>`;})}
  <circle class="ping" cx=${f(hx2)} cy=${f(hy2)} r="4"></circle><circle class="knob" cx=${f(hx2)} cy=${f(hy2)} r="7"></circle>
  <circle class="disc" cx=${CX} cy=${CY} r=${DISC} role=${w.tap?'button':nothing} tabindex=${w.tap?0:nothing}
   aria-label=${w.tap?.label??nothing} @keydown=${discKey} @click=${discClick}></circle>
  <text class="hl" x=${CX} y=${CY-LAB}>0 h</text><text class="hl" x=${CX+LAB} y=${CY}>6 h</text>
  <text class="hl" x=${CX} y=${CY+LAB}>12 h</text><text class="hl" x=${CX-LAB} y=${CY}>18 h</text>
  ${w.hours.map(h=>{const d=w.say(h);
   return svg`<path class="hit" data-k=${h.k} role="button" tabindex=${h.k===focus?0:-1} aria-pressed=${w.pin===h.k?'true':'false'}
    aria-label=${`${d.range} : ${d.value}, ${d.lines.filter(Boolean).join(', ')}`} d=${wedge(DISC,HIT_OUT,h.k*60,h.k*60+60)}
    @pointerenter=${()=>w.onHover(h.k)} @focus=${()=>w.onHover(h.k)} @blur=${()=>w.onHover(undefined)}
    @click=${(e:Event)=>{e.stopPropagation();w.onPin(w.pin===h.k?undefined:h.k);}} @keydown=${(e:KeyboardEvent)=>key(e,h.k)}></path>`;})}
 </svg><div class="mid"><div class="rest">${rest}</div>
  <div class="pick">${detail?html`<div class="ph">${detail.range}</div><div class=${'pv'+(detail.word?' word':'')}>${detail.value}</div>
   <div class="pl">${detail.lines[0]}</div><div class="pl dim">${detail.lines[1]}</div>`:nothing}</div></div></div>`;
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
/** The compact cards' middle (1.0.1b2, Frank: « alléger le cercle »): the temperature, and under it the set point it
    goes to; the picture moved to the pill at the top. */
export function bare(temp:number|null,target:number|null){
 const n=(v:number)=>v.toLocaleString('fr-FR',{maximumFractionDigits:1}).replace('-','−');
 return html`<div class="ct">${temp!=null?`${n(temp)}°`:'—'}</div>${target!=null?html`<div class="to"><span>consigne</span><b>${n(target)}°</b></div>`:nothing}`;
}

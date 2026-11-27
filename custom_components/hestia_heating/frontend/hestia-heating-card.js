// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var Ce=globalThis,je=Ce.ShadowRoot&&(Ce.ShadyCSS===void 0||Ce.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ye=Symbol(),zt=new WeakMap,he=class{constructor(a,e,t){if(this._$cssResult$=!0,t!==Ye)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=a,this.t=e}get styleSheet(){let a=this.o,e=this.t;if(je&&a===void 0){let t=e!==void 0&&e.length===1;t&&(a=zt.get(e)),a===void 0&&((this.o=a=new CSSStyleSheet).replaceSync(this.cssText),t&&zt.set(e,a))}return a}toString(){return this.cssText}},me=i=>new he(typeof i=="string"?i:i+"",void 0,Ye),ge=(i,...a)=>{let e=i.length===1?i[0]:a.reduce((t,n,s)=>t+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+i[s+1],i[0]);return new he(e,i,Ye)},Rt=(i,a)=>{if(je)i.adoptedStyleSheets=a.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of a){let t=document.createElement("style"),n=Ce.litNonce;n!==void 0&&t.setAttribute("nonce",n),t.textContent=e.cssText,i.appendChild(t)}},Xe=je?i=>i:i=>i instanceof CSSStyleSheet?(a=>{let e="";for(let t of a.cssRules)e+=t.cssText;return me(e)})(i):i;var{is:jn,defineProperty:Mn,getOwnPropertyDescriptor:Pn,getOwnPropertyNames:zn,getOwnPropertySymbols:Rn,getPrototypeOf:qn}=Object,Me=globalThis,qt=Me.trustedTypes,Tn=qt?qt.emptyScript:"",Hn=Me.reactiveElementPolyfillSupport,fe=(i,a)=>i,Je={toAttribute(i,a){switch(a){case Boolean:i=i?Tn:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,a){let e=i;switch(a){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},Ht=(i,a)=>!jn(i,a),Tt={attribute:!0,type:String,converter:Je,reflect:!1,useDefault:!1,hasChanged:Ht};Symbol.metadata??=Symbol("metadata"),Me.litPropertyMetadata??=new WeakMap;var I=class extends HTMLElement{static addInitializer(a){this._$Ei(),(this.l??=[]).push(a)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(a,e=Tt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(a)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(a,e),!e.noAccessor){let t=Symbol(),n=this.getPropertyDescriptor(a,t,e);n!==void 0&&Mn(this.prototype,a,n)}}static getPropertyDescriptor(a,e,t){let{get:n,set:s}=Pn(this.prototype,a)??{get(){return this[e]},set(r){this[e]=r}};return{get:n,set(r){let o=n?.call(this);s?.call(this,r),this.requestUpdate(a,o,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(a){return this.elementProperties.get(a)??Tt}static _$Ei(){if(this.hasOwnProperty(fe("elementProperties")))return;let a=qn(this);a.finalize(),a.l!==void 0&&(this.l=[...a.l]),this.elementProperties=new Map(a.elementProperties)}static finalize(){if(this.hasOwnProperty(fe("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(fe("properties"))){let e=this.properties,t=[...zn(e),...Rn(e)];for(let n of t)this.createProperty(n,e[n])}let a=this[Symbol.metadata];if(a!==null){let e=litPropertyMetadata.get(a);if(e!==void 0)for(let[t,n]of e)this.elementProperties.set(t,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(a){let e=[];if(Array.isArray(a)){let t=new Set(a.flat(1/0).reverse());for(let n of t)e.unshift(Xe(n))}else a!==void 0&&e.push(Xe(a));return e}static _$Eu(a,e){let t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof a=="string"?a.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(a=>this.enableUpdating=a),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(a=>a(this))}addController(a){(this._$EO??=new Set).add(a),this.renderRoot!==void 0&&this.isConnected&&a.hostConnected?.()}removeController(a){this._$EO?.delete(a)}_$E_(){let a=new Map,e=this.constructor.elementProperties;for(let t of e.keys())this.hasOwnProperty(t)&&(a.set(t,this[t]),delete this[t]);a.size>0&&(this._$Ep=a)}createRenderRoot(){let a=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Rt(a,this.constructor.elementStyles),a}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(a=>a.hostConnected?.())}enableUpdating(a){}disconnectedCallback(){this._$EO?.forEach(a=>a.hostDisconnected?.())}attributeChangedCallback(a,e,t){this._$AK(a,t)}_$ET(a,e){let t=this.constructor.elementProperties.get(a),n=this.constructor._$Eu(a,t);if(n!==void 0&&t.reflect===!0){let s=(t.converter?.toAttribute!==void 0?t.converter:Je).toAttribute(e,t.type);this._$Em=a,s==null?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(a,e){let t=this.constructor,n=t._$Eh.get(a);if(n!==void 0&&this._$Em!==n){let s=t.getPropertyOptions(n),r=typeof s.converter=="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Je;this._$Em=n;let o=r.fromAttribute(e,s.type);this[n]=o??this._$Ej?.get(n)??o,this._$Em=null}}requestUpdate(a,e,t,n=!1,s){if(a!==void 0){let r=this.constructor;if(n===!1&&(s=this[a]),t??=r.getPropertyOptions(a),!((t.hasChanged??Ht)(s,e)||t.useDefault&&t.reflect&&s===this._$Ej?.get(a)&&!this.hasAttribute(r._$Eu(a,t))))return;this.C(a,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(a,e,{useDefault:t,reflect:n,wrapped:s},r){t&&!(this._$Ej??=new Map).has(a)&&(this._$Ej.set(a,r??e??this[a]),s!==!0||r!==void 0)||(this._$AL.has(a)||(this.hasUpdated||t||(e=void 0),this._$AL.set(a,e)),n===!0&&this._$Em!==a&&(this._$Eq??=new Set).add(a))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let a=this.scheduleUpdate();return a!=null&&await a,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,s]of this._$Ep)this[n]=s;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[n,s]of t){let{wrapped:r}=s,o=this[n];r!==!0||this._$AL.has(n)||o===void 0||this.C(n,void 0,s,o)}}let a=!1,e=this._$AL;try{a=this.shouldUpdate(e),a?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw a=!1,this._$EM(),t}a&&this._$AE(e)}willUpdate(a){}_$AE(a){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(a)),this.updated(a)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(a){return!0}update(a){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(a){}firstUpdated(a){}};I.elementStyles=[],I.shadowRootOptions={mode:"open"},I[fe("elementProperties")]=new Map,I[fe("finalized")]=new Map,Hn?.({ReactiveElement:I}),(Me.reactiveElementVersions??=[]).push("2.1.2");var Qe=globalThis,Lt=i=>i,Pe=Qe.trustedTypes,Dt=Pe?Pe.createPolicy("lit-html",{createHTML:i=>i}):void 0,et="$lit$",G=`lit$${Math.random().toFixed(9).slice(2)}$`,tt="?"+G,Ln=`<${tt}>`,te=document,we=()=>te.createComment(""),be=i=>i===null||typeof i!="object"&&typeof i!="function",nt=Array.isArray,Ut=i=>nt(i)||typeof i?.[Symbol.iterator]=="function",Ze=`[ 	
\f\r]`,ve=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ot=/-->/g,Wt=/>/g,Q=RegExp(`>|${Ze}(?:([^\\s"'>=/]+)(${Ze}*=${Ze}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Ft=/'/g,Bt=/"/g,Vt=/^(?:script|style|textarea|title)$/i,at=i=>(a,...e)=>({_$litType$:i,strings:a,values:e}),l=at(1),S=at(2),qa=at(3),ne=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Nt=new WeakMap,ee=te.createTreeWalker(te,129);function It(i,a){if(!nt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return Dt!==void 0?Dt.createHTML(a):a}var Gt=(i,a)=>{let e=i.length-1,t=[],n,s=a===2?"<svg>":a===3?"<math>":"",r=ve;for(let o=0;o<e;o++){let c=i[o],p,h,m=-1,x=0;for(;x<c.length&&(r.lastIndex=x,h=r.exec(c),h!==null);)x=r.lastIndex,r===ve?h[1]==="!--"?r=Ot:h[1]!==void 0?r=Wt:h[2]!==void 0?(Vt.test(h[2])&&(n=RegExp("</"+h[2],"g")),r=Q):h[3]!==void 0&&(r=Q):r===Q?h[0]===">"?(r=n??ve,m=-1):h[1]===void 0?m=-2:(m=r.lastIndex-h[2].length,p=h[1],r=h[3]===void 0?Q:h[3]==='"'?Bt:Ft):r===Bt||r===Ft?r=Q:r===Ot||r===Wt?r=ve:(r=Q,n=void 0);let v=r===Q&&i[o+1].startsWith("/>")?" ":"";s+=r===ve?c+Ln:m>=0?(t.push(p),c.slice(0,m)+et+c.slice(m)+G+v):c+G+(m===-2?o:v)}return[It(i,s+(i[e]||"<?>")+(a===2?"</svg>":a===3?"</math>":"")),t]},xe=class i{constructor({strings:a,_$litType$:e},t){let n;this.parts=[];let s=0,r=0,o=a.length-1,c=this.parts,[p,h]=Gt(a,e);if(this.el=i.createElement(p,t),ee.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(n=ee.nextNode())!==null&&c.length<o;){if(n.nodeType===1){if(n.hasAttributes())for(let m of n.getAttributeNames())if(m.endsWith(et)){let x=h[r++],v=n.getAttribute(m).split(G),$=/([.?@])?(.*)/.exec(x);c.push({type:1,index:s,name:$[2],strings:v,ctor:$[1]==="."?Re:$[1]==="?"?qe:$[1]==="@"?Te:se}),n.removeAttribute(m)}else m.startsWith(G)&&(c.push({type:6,index:s}),n.removeAttribute(m));if(Vt.test(n.tagName)){let m=n.textContent.split(G),x=m.length-1;if(x>0){n.textContent=Pe?Pe.emptyScript:"";for(let v=0;v<x;v++)n.append(m[v],we()),ee.nextNode(),c.push({type:2,index:++s});n.append(m[x],we())}}}else if(n.nodeType===8)if(n.data===tt)c.push({type:2,index:s});else{let m=-1;for(;(m=n.data.indexOf(G,m+1))!==-1;)c.push({type:7,index:s}),m+=G.length-1}s++}}static createElement(a,e){let t=te.createElement("template");return t.innerHTML=a,t}};function ae(i,a,e=i,t){if(a===ne)return a;let n=t!==void 0?e._$Co?.[t]:e._$Cl,s=be(a)?void 0:a._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),s===void 0?n=void 0:(n=new s(i),n._$AT(i,e,t)),t!==void 0?(e._$Co??=[])[t]=n:e._$Cl=n),n!==void 0&&(a=ae(i,n._$AS(i,a.values),n,t)),a}var ze=class{constructor(a,e){this._$AV=[],this._$AN=void 0,this._$AD=a,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(a){let{el:{content:e},parts:t}=this._$AD,n=(a?.creationScope??te).importNode(e,!0);ee.currentNode=n;let s=ee.nextNode(),r=0,o=0,c=t[0];for(;c!==void 0;){if(r===c.index){let p;c.type===2?p=new oe(s,s.nextSibling,this,a):c.type===1?p=new c.ctor(s,c.name,c.strings,this,a):c.type===6&&(p=new He(s,this,a)),this._$AV.push(p),c=t[++o]}r!==c?.index&&(s=ee.nextNode(),r++)}return ee.currentNode=te,n}p(a){let e=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(a,t,e),e+=t.strings.length-2):t._$AI(a[e])),e++}},oe=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(a,e,t,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=a,this._$AB=e,this._$AM=t,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let a=this._$AA.parentNode,e=this._$AM;return e!==void 0&&a?.nodeType===11&&(a=e.parentNode),a}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(a,e=this){a=ae(this,a,e),be(a)?a===u||a==null||a===""?(this._$AH!==u&&this._$AR(),this._$AH=u):a!==this._$AH&&a!==ne&&this._(a):a._$litType$!==void 0?this.$(a):a.nodeType!==void 0?this.T(a):Ut(a)?this.k(a):this._(a)}O(a){return this._$AA.parentNode.insertBefore(a,this._$AB)}T(a){this._$AH!==a&&(this._$AR(),this._$AH=this.O(a))}_(a){this._$AH!==u&&be(this._$AH)?this._$AA.nextSibling.data=a:this.T(te.createTextNode(a)),this._$AH=a}$(a){let{values:e,_$litType$:t}=a,n=typeof t=="number"?this._$AC(a):(t.el===void 0&&(t.el=xe.createElement(It(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===n)this._$AH.p(e);else{let s=new ze(n,this),r=s.u(this.options);s.p(e),this.T(r),this._$AH=s}}_$AC(a){let e=Nt.get(a.strings);return e===void 0&&Nt.set(a.strings,e=new xe(a)),e}k(a){nt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,t,n=0;for(let s of a)n===e.length?e.push(t=new i(this.O(we()),this.O(we()),this,this.options)):t=e[n],t._$AI(s),n++;n<e.length&&(this._$AR(t&&t._$AB.nextSibling,n),e.length=n)}_$AR(a=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);a!==this._$AB;){let t=Lt(a).nextSibling;Lt(a).remove(),a=t}}setConnected(a){this._$AM===void 0&&(this._$Cv=a,this._$AP?.(a))}},se=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(a,e,t,n,s){this.type=1,this._$AH=u,this._$AN=void 0,this.element=a,this.name=e,this._$AM=n,this.options=s,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=u}_$AI(a,e=this,t,n){let s=this.strings,r=!1;if(s===void 0)a=ae(this,a,e,0),r=!be(a)||a!==this._$AH&&a!==ne,r&&(this._$AH=a);else{let o=a,c,p;for(a=s[0],c=0;c<s.length-1;c++)p=ae(this,o[t+c],e,c),p===ne&&(p=this._$AH[c]),r||=!be(p)||p!==this._$AH[c],p===u?a=u:a!==u&&(a+=(p??"")+s[c+1]),this._$AH[c]=p}r&&!n&&this.j(a)}j(a){a===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,a??"")}},Re=class extends se{constructor(){super(...arguments),this.type=3}j(a){this.element[this.name]=a===u?void 0:a}},qe=class extends se{constructor(){super(...arguments),this.type=4}j(a){this.element.toggleAttribute(this.name,!!a&&a!==u)}},Te=class extends se{constructor(a,e,t,n,s){super(a,e,t,n,s),this.type=5}_$AI(a,e=this){if((a=ae(this,a,e,0)??u)===ne)return;let t=this._$AH,n=a===u&&t!==u||a.capture!==t.capture||a.once!==t.once||a.passive!==t.passive,s=a!==u&&(t===u||n);n&&this.element.removeEventListener(this.name,this,t),s&&this.element.addEventListener(this.name,this,a),this._$AH=a}handleEvent(a){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,a):this._$AH.handleEvent(a)}},He=class{constructor(a,e,t){this.element=a,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(a){ae(this,a)}},Kt={M:et,P:G,A:tt,C:1,L:Gt,R:ze,D:Ut,V:ae,I:oe,H:se,N:qe,U:Te,B:Re,F:He},Dn=Qe.litHtmlPolyfillSupport;Dn?.(xe,oe),(Qe.litHtmlVersions??=[]).push("3.3.3");var Yt=(i,a,e)=>{let t=e?.renderBefore??a,n=t._$litPart$;if(n===void 0){let s=e?.renderBefore??null;t._$litPart$=n=new oe(a.insertBefore(we(),s),s,void 0,e??{})}return n._$AI(i),n};var st=globalThis,W=class extends I{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let a=super.createRenderRoot();return this.renderOptions.renderBefore??=a.firstChild,a}update(a){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(a),this._$Do=Yt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ne}};W._$litElement$=!0,W.finalized=!0,st.litElementHydrateSupport?.({LitElement:W});var On=st.litElementPolyfillSupport;On?.({LitElement:W});(st.litElementVersions??=[]).push("4.2.2");var Xt=`/* CHARTE COMMUNE HESTIA \u2014 jetons et pi\xE8ces partag\xE9s par toutes les cartes Hestia.
   Valeurs reprises de la carte Hestia Weather (card/src/ui/charter.ts), qui fait r\xE9f\xE9rence.
   Modifier ICI, puis recopier avec charte/copier.sh dans chaque carte : jamais directement dans une brique. */
:host {
  /* Couleurs du th\xE8me Home Assistant, avec replis. */
  --nw-fg: var(--primary-text-color, #212121);
  --nw-fg2: var(--secondary-text-color, #727272);
  --nw-bg: var(--ha-card-background, var(--card-background-color, #fff));
  --nw-accent: var(--primary-color, #03a9f4);
  /* Contours et arrondis : un seul arrondi pour toutes les bo\xEEtes, un pour les pastilles. */
  --nw-line: color-mix(in srgb, var(--nw-fg) 13%, transparent);
  --nw-line-soft: color-mix(in srgb, var(--nw-fg) 8%, transparent);
  --nw-radius-card: var(--ha-card-border-radius, 12px);
  --nw-radius: 14px;
  --nw-radius-pill: 999px;
  --nw-glass-strong: color-mix(in srgb, var(--nw-bg) 84%, transparent);
  --nw-blur: blur(6px) saturate(1.2);
  /* Verre d\xE9poli pos\xE9 sur le fond color\xE9 (frise de Weather, \xE9chelle de Confort) : plus clair, plus flou. */
  --nw-glass-clear: color-mix(in srgb, var(--nw-bg) 45%, transparent);
  --nw-frost: blur(14px) saturate(1.6);
  --nw-frame-line: color-mix(in srgb, var(--nw-fg) 16%, transparent);
  --nw-pad-panel: 18px 20px;
  /* Sept tailles de texte, rien d'autre (\xE9chelle C, 3 novembre) : \xE9tiquette 11 \xB7 secondaire 12 \xB7 texte et titre de case 14 \xB7
     titre de carte et de section 17 \xB7 valeur de case 21 \xB7 conseil et valeur vedette 34 \xB7 temp\xE9rature 58. */
  --nw-fs-label: 11px; --nw-fs-small: 12px; --nw-fs-text: 14px; --nw-fs-title: 17px; --nw-fs-case: 21px; --nw-fs-value: 34px; --nw-fs-temp: 58px;
  --nw-label-spacing: .6px;
  /* Couleurs de sens, palette \xAB Aube \xBB (OKLCH, m\xEAme clart\xE9 et m\xEAme saturation). Un th\xE8me peut les remplacer. */
  --nw-rain: var(--hestia-rain-color, oklch(.8 .07 190));
  --nw-wind: var(--hestia-wind-color, oklch(.79 .075 280));
  --nw-heat: var(--hestia-heat-color, oklch(.83 .085 42));
  --nw-cold: var(--hestia-cold-color, oklch(.85 .05 220));
  --nw-calm: var(--hestia-calm-color, oklch(.83 .075 150));
  --nw-pressure: var(--hestia-pressure-color, oklch(.78 .07 315));
  --nw-level1: var(--hestia-level1-color, oklch(.88 .1 96));
  --nw-level2: var(--hestia-level2-color, oklch(.81 .105 64));
  --nw-level3: var(--hestia-level3-color, oklch(.74 .115 18));
  /* Couleurs d'\xE9tat, communes \xE0 toutes les cartes : elles disent s'il y a quelque chose \xE0 FAIRE, pas o\xF9 tombe une mesure.
     Bleu tout va bien \xB7 vert b\xE9n\xE9fice \xE0 saisir ou en cours \xB7 orange geste utile maintenant \xB7 rouge urgent \xB7
     ambre mesure hors de votre plage, sans geste demand\xE9 \xB7 gris (texte secondaire) \xE0 v\xE9rifier.
     La vigilance m\xE9t\xE9o garde sa propre \xE9chelle jaune / orange / rouge (--nw-level1 \xE0 3). */
  --nw-ok: var(--hestia-ok-color, var(--nw-cold));
  --nw-benefit: var(--hestia-benefit-color, var(--nw-calm));
  --nw-act: var(--hestia-act-color, var(--nw-level2));
  --nw-alert: var(--hestia-alert-color, var(--nw-level3));
  --nw-watch: var(--hestia-watch-color, oklch(.84 .13 86));
  /* Part de couleur dans un texte color\xE9 : 34 % reste lisible (contraste 4,5:1). Part de couleur dans le fond d'une pastille. */
  --nw-ink: 34%;
  --nw-chip-tint: 24%;
  --nw-ease: cubic-bezier(.2, .8, .2, 1);
  --nw-expand: .45s;
}
/* Le th\xE8me sombre : plus de couleur dans les fonds et les textes teint\xE9s, la palette inchang\xE9e. Sur un fond sombre, le bleu
   et le vert pastel se fondaient en gris (Frank, 16 novembre : \xAB les couleurs bleu et vert en mode sombre ne se
   distinguaient pas assez \xBB ; 2 % d'\xE9cart mesur\xE9 entre les deux pastilles). */
:host([theme="dark"]) { --nw-ink: 62%; --nw-chip-tint: 48%; }
button { font:inherit; color:inherit; }
button:focus-visible { outline:2px solid var(--nw-accent); outline-offset:2px; }
.sr { position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; }
/* \xC9tiquette en petites capitales, une seule taille partout (style Trait, 3 novembre). */
.nw-label { font-size:var(--nw-fs-label); line-height:14px; font-weight:650; letter-spacing:.08em; text-transform:uppercase; color:var(--nw-fg2); white-space:nowrap; }
/* Texte color\xE9 toujours lisible : la couleur de sens m\xE9lang\xE9e au texte. */
.nw-ink { font-size:var(--nw-fs-small); font-weight:600; color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
/* Pastille de source : une seule r\xE8gle. */
.nw-badge { display:inline-flex; align-items:center; font-size:var(--nw-fs-small); line-height:18px; font-weight:500; white-space:nowrap; padding:3px 10px;
  border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:color-mix(in srgb, var(--nw-bg) 70%, transparent); color:var(--nw-fg);
  max-width:100%; overflow:hidden; text-overflow:ellipsis; box-sizing:border-box; }
/* Pastille d'info teint\xE9e. */
.nw-chip { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:var(--nw-radius-pill); font-size:var(--nw-fs-small); line-height:18px; font-weight:600;
  white-space:nowrap; border:1px solid transparent; background:color-mix(in oklab, var(--c) var(--nw-chip-tint), transparent); color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
.nw-chips { display:flex; flex-wrap:wrap; gap:8px; }
/* ---------- Structure commune des cartes (style Trait, 3 novembre) : la m\xEAme dans Weather, Confort et les prochaines briques. ---------- */
/* La carte : Manrope, angles de 22 px ; la surface teint\xE9e des panneaux. */
ha-card { font-family:Manrope, var(--ha-font-family-body, Roboto), system-ui, sans-serif; line-height:1.5; border-radius:22px;
  --nw-surface:color-mix(in srgb, var(--nw-fg) 3.5%, var(--nw-bg)); }
/* Le titre de la carte (\xAB Synth\xE8se \xBB, le nom de la pi\xE8ce) et la grande temp\xE9rature fine. */
.nw-title { margin:0; font-size:var(--nw-fs-title); line-height:1.25; font-weight:700; letter-spacing:-.02em; }
/* La lecture (3 novembre) : la grande temp\xE9rature, son unit\xE9 en exposant hors du bloc des chiffres, le mini\u2013maxi align\xE9 \xE0 droite
   sur la fin des chiffres (apr\xE8s la virgule, avant \xAB \xB0C \xBB). La m\xEAme dans Weather et Confort (hestia-lecture.ts). */
.nw-reading { display:inline-grid; justify-items:end; padding-right:26px; }
.nw-reading .nw-temp { position:relative; }
.nw-reading .nw-temp sup { position:absolute; left:100%; top:.3em; margin-left:3px; font-size:var(--nw-fs-text); line-height:1; font-weight:500; letter-spacing:0; color:var(--nw-fg2); }
.nw-reading-tap { all:unset; cursor:pointer; border-radius:8px; }
.nw-reading-tap:focus-visible { outline:2px solid var(--nw-accent); outline-offset:2px; }
.nw-reading-more { margin-top:4px; font-size:var(--nw-fs-small); color:var(--nw-fg2); white-space:nowrap; }
.nw-range { margin-top:4px; font-size:var(--nw-fs-small); font-weight:500; color:var(--nw-fg2); font-variant-numeric:tabular-nums; white-space:nowrap; }
/* 58 px au plus, plus petite dans une carte \xE9troite (15 % de sa largeur) : le titre et son \xAB i \xBB gardent leur ligne. */
.nw-temp { font-size:min(var(--nw-fs-temp), 15cqi); font-weight:300; letter-spacing:-.05em; line-height:1; font-variant-numeric:tabular-nums; }
/* Le titre d'une section (\xAB Aujourd'hui \xBB, \xAB Maintenant \xBB) : en clair, son r\xE9sum\xE9 \xE0 c\xF4t\xE9, le chevron rond \xE0 droite s'il se replie. */
.nw-section-head { display:flex; align-items:center; gap:10px; min-width:0; }
.nw-section-head h2 { margin:0; font-size:var(--nw-fs-title); line-height:1.3; font-weight:700; letter-spacing:-.2px; }
.nw-section-head .nw-sum { flex:1; min-width:0; font-size:var(--nw-fs-text); color:var(--nw-fg2); }
/* Le panneau : une surface teint\xE9e, sans contour, arrondie dans l'arrondi de la carte. */
.nw-panel { min-width:0; box-sizing:border-box; padding:14px 16px; border:0; border-radius:16px; background:var(--nw-surface); }
/* Son en-t\xEAte : un pictogramme au trait, le titre et son \xAB i \xBB, un mot ou des onglets \xE0 droite. */
.nw-panel-head { display:flex; flex-wrap:wrap; align-items:center; gap:8px; min-width:0; }
.nw-panel-icon { display:grid; place-items:center; flex:none; color:var(--nw-fg2); }
.nw-panel-icon ha-icon { --mdc-icon-size:18px; display:flex; } .nw-panel-icon svg { width:18px; height:18px; }
.nw-panel-head h3 { display:flex; align-items:center; gap:8px; margin:0; min-width:0; font-size:var(--nw-fs-text); line-height:1.3; font-weight:650; letter-spacing:0; white-space:nowrap; }
.nw-panel-head h3 > span { overflow:hidden; text-overflow:ellipsis; }
.nw-panel-head .aside { margin-left:auto; font-size:var(--nw-fs-small); line-height:1.4; font-weight:500; color:var(--nw-fg2); }
.nw-panel-head .seg { margin-left:auto; }
/* La grande valeur fine et son unit\xE9 ; la phrase grise qui la suit. */
.nw-value { display:flex; align-items:baseline; gap:5px; }
.nw-value b { font-size:var(--nw-fs-value); font-weight:300; letter-spacing:-.04em; line-height:1.1; font-variant-numeric:tabular-nums; }
.nw-value > span, .nw-value b small { font-size:var(--nw-fs-text); line-height:1.1; font-weight:500; letter-spacing:0; color:var(--nw-fg2); }
/* Dans une grille de petites cases (.nw-cases), la valeur passe \xE0 21 demi-gras : la grande valeur fine reste \xE0 la case pleine largeur. */
.nw-cases .nw-value b { font-size:var(--nw-fs-case); font-weight:600; letter-spacing:-.015em; line-height:1.2; }
.nw-say { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
/* Les chiffres sous un panneau : leur nom en petits mots simples, jamais coup\xE9s, la valeur en gras. */
.nw-stats { display:grid; grid-template-columns:repeat(var(--n, 3), minmax(0,1fr)); gap:8px; margin-top:auto; padding-top:10px; border-top:1px solid color-mix(in srgb, var(--nw-fg) 6%, transparent); }
.nw-stats > * { display:flex; flex-direction:column; gap:2px; min-width:0; }
.nw-stats > * > :first-child { font-size:var(--nw-fs-label); line-height:1.35; font-weight:500; letter-spacing:0; text-transform:none; color:var(--nw-fg2); white-space:normal; }
.nw-stats b { font-size:var(--nw-fs-text); line-height:1.35; font-weight:650; font-variant-numeric:tabular-nums; }
/* L\xE9gende : toujours centr\xE9e sous son graphique. */
.nw-legend { display:flex; justify-content:center; flex-wrap:wrap; gap:6px 16px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.nw-legend span { display:inline-flex; align-items:center; gap:6px; }
/* Une valeur pos\xE9e sur un graphique. */
.nw-pill { position:absolute; transform:translate(-50%, -130%); font-size:var(--nw-fs-small); font-weight:700; padding:2px 8px; border-radius:var(--nw-radius-pill);
  background:var(--nw-bg); border:1px solid var(--nw-line); box-shadow:0 2px 6px #0001; white-space:nowrap; }
/* Bouton \xAB i \xBB (3 novembre) : un petit disque gris, sans contour ; la lettre est dessin\xE9e ici, la m\xEAme dans toutes les cartes.
   Le bouton reste vide (son aria-label dit ce qu'il explique). */
.nw-info { display:inline-grid; place-items:center; width:18px; height:18px; min-height:0; margin:0; padding:0; flex:none; border-radius:50%; border:0;
  background:color-mix(in srgb, var(--nw-fg) 6%, transparent); color:var(--nw-fg2); cursor:pointer; font:700 var(--nw-fs-label)/1 Manrope, system-ui, sans-serif; }
.nw-info::before { content:'i'; }
.nw-info > * { display:none; }
.nw-info:hover { color:var(--nw-fg); background:color-mix(in srgb, var(--nw-fg) 10%, transparent); }
/* Section repliable : \xE9tiquette, r\xE9sum\xE9, chevron rond (vers le bas repli\xE9, vers le haut ouvert). */
.nw-fold-head { display:flex; align-items:center; gap:10px; width:100%; border:0; background:none; padding:0; cursor:pointer; text-align:left; }
.nw-fold-head .nw-sum { flex:1; min-width:0; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.nw-chevron { display:grid; place-items:center; width:30px; height:30px; flex:none; border-radius:50%; border:1px solid var(--nw-line); transition:transform var(--nw-expand) var(--nw-ease); }
.nw-fold-head[aria-expanded="true"] .nw-chevron { transform:rotate(180deg); }
/* Survol d'une section : pas de bandeau gris, c'est le chevron qui s'allume et le titre qui se renforce. */
.nw-fold-head:hover { background:none; }
.nw-chevron { transition:transform var(--nw-expand) var(--nw-ease), background .2s, border-color .2s; }
.nw-fold-head:hover .nw-chevron { background:color-mix(in srgb, var(--nw-fg) 8%, transparent); border-color:color-mix(in srgb, var(--nw-fg) 32%, transparent); }
.nw-fold-head:hover .nw-label { color:var(--nw-fg); }
@media (prefers-reduced-motion:reduce) { .nw-chevron { transition:none; } }
/* Cadre de verre d\xE9poli (le fil de Weather, le bandeau de Confort) : verre clair, liser\xE9 net, angles de 16 px, jamais d'ombre.
   Le r\xE9glage \xAB Effet de verre \xBB d\xE9coch\xE9 (:host([flat])) le rend opaque et sans flou. */
.nw-glass { background:var(--nw-glass-clear); backdrop-filter:var(--nw-frost); -webkit-backdrop-filter:var(--nw-frost);
  border:1px solid var(--nw-frame-line, color-mix(in srgb, var(--nw-fg) 16%, transparent)); border-radius:16px; box-shadow:none; }
/* Le m\xEAme cadre, plus opaque, quand il porte les chiffres cl\xE9s sur un ciel clair (\xAB En ce moment \xBB) : ils restent lisibles. */
.nw-glass.nw-glass-solid { background:color-mix(in srgb, var(--nw-bg) 68%, transparent); }
:host([flat]) { --nw-blur:none; --nw-frost:none; --nw-glass-clear:var(--nw-bg); --nw-glass-strong:var(--nw-bg); }

/* ---------- Le bandeau (5 novembre, carte \xAB Mon logement \xBB) : le geste du moment, le m\xEAme dans toutes les cartes. ----------
   Le cadre (.nw-band, pos\xE9 avec .nw-glass) prend la couleur de son \xE9tat par data-level ; dedans, une rang\xE9e (.nw-band-row) :
   la sc\xE8ne ou le pictogramme \xE0 gauche (.nw-band-pic), puis le texte (.nw-band-text) : au-dessus, la pi\xE8ce ou le moment
   (.nw-band-kicker) ; le geste en 34 (.nw-band-title), color\xE9 quand il y a un geste \xE0 faire ; pourquoi (.nw-band-line) ;
   une note grise (.nw-band-note : \xAB Puis refermez \xBB, la preuve). Plusieurs conseils : des barres en bas du cadre (.nw-band-bars). */
.nw-band { --c:var(--nw-ok); position:relative; box-sizing:border-box; min-width:0; padding:16px; }
.nw-band[data-level="benefit"] { --c:var(--nw-benefit); } .nw-band[data-level="action"] { --c:var(--nw-act); } .nw-band[data-level="urgent"] { --c:var(--nw-alert); }
.nw-band[data-level="neutral"] { --c:color-mix(in srgb, var(--nw-fg) 25%, transparent); }
.nw-band:has(.nw-band-bars) { padding-bottom:26px; }
.nw-band-row { display:flex; align-items:center; gap:16px; min-width:0; }
.nw-band-pic { display:grid; place-items:center; flex:none; order:-1; }
/* Sans sc\xE8ne (mesures en chargement, capteurs muets) : le pictogramme dans un carr\xE9 teint\xE9. */
.nw-band-pic.box { width:60px; height:72px; border-radius:10px; background:color-mix(in srgb, var(--c) 34%, transparent); color:var(--nw-fg); }
.nw-band-pic.box svg, .nw-band-pic.box ha-icon { width:34px; height:34px; --mdc-icon-size:34px; }
.nw-band-text { flex:1; min-width:0; }
.nw-band-text p { margin:0; }
.nw-band-kicker { display:flex; align-items:center; flex-wrap:wrap; gap:4px 8px; margin-bottom:4px; font-size:var(--nw-fs-label); line-height:14px; font-weight:650;
  letter-spacing:.08em; text-transform:uppercase; color:var(--nw-fg); }
.nw-band-kicker i { font-style:normal; font-weight:600; letter-spacing:0; text-transform:none; color:var(--nw-fg2); }
.nw-band-title { font-size:var(--nw-fs-value); font-weight:650; letter-spacing:-.03em; line-height:1.1; text-wrap:balance; }
/* Color\xE9 pour un geste seulement : un \xAB Rien \xE0 faire \xBB qui garde quelque chose \xAB \xE0 saisir \xBB ne s'\xE9crit jamais en vert (5 novembre). */
.nw-band:is([data-level="action"], [data-level="urgent"]) .nw-band-title { color:color-mix(in oklab, var(--c) 45%, var(--nw-fg)); }
.nw-band-line { margin-top:6px !important; font-size:var(--nw-fs-text); line-height:1.5; color:var(--nw-fg2); }
.nw-band-line b { color:var(--nw-fg); font-weight:650; }
.nw-band-note { display:flex; align-items:center; gap:6px; margin-top:6px !important; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.nw-band-note svg, .nw-band-note ha-icon { width:13px; height:13px; flex:none; --mdc-icon-size:13px; }
.nw-band-bars { position:absolute; left:16px; right:16px; bottom:6px; display:flex; gap:6px; }
.nw-band-bars button { flex:1; min-height:0; margin:0; padding:6px 0; border:0; background:none; cursor:pointer; }
.nw-band-bars span { display:block; height:3px; border-radius:2px; background:color-mix(in srgb, var(--nw-fg) 16%, transparent); }
.nw-band-bars button[aria-current="true"] span { background:color-mix(in oklab, var(--c) 70%, var(--nw-fg)); }

/* ---------- Le petit rond de valeur (3 novembre) : la valeur sur une piste (\xE9chelles) et la bulle affich\xE9e du fil. ---------- */
.nw-dot { position:absolute; z-index:3; width:8px; height:8px; margin-left:-4px; border-radius:50%; background:var(--nw-fg); box-shadow:0 0 0 1.5px var(--nw-bg); }
.nw-dot::after { content:''; position:absolute; inset:-2px; border-radius:50%; border:1.5px solid var(--nw-fg);
  animation:nw-ripple 2.4s var(--nw-ease) infinite; animation-play-state:var(--nw-motion, running); }
@keyframes nw-ripple { from { transform:scale(.6); opacity:.9; } to { transform:scale(2.2); opacity:0; } }

/* ---------- L'\xE9chelle fa\xE7on fil (3 novembre, maquettes/planche-echelles.html) : Ressenti de Weather, temp\xE9rature de Confort. ----------
   Une piste en relief d\xE9coup\xE9e en tron\xE7ons nomm\xE9s ; la valeur dans une bulle teint\xE9e de son tron\xE7on (--tone), un trait fin jusqu'\xE0 la piste,
   le petit rond sur la piste ; les rep\xE8res dessous (ligne basse) ou dessus (ligne haute) ; le min\u2013max en fin trait ; un rep\xE8re creux (dehors). */
.nw-scale { position:relative; height:84px; margin:0 6px; }
.nw-scale-lane { position:absolute; left:0; right:0; top:44px; height:18px; display:flex; gap:3px; }
.nw-scale-part { display:grid; place-items:center; min-width:0; overflow:hidden; border-radius:6px; font-style:normal; transform-origin:left; container-type:inline-size;
  background:linear-gradient(180deg, color-mix(in oklab, var(--tone) 85%, #fff), color-mix(in oklab, var(--tone) 78%, transparent));
  box-shadow:inset 0 1px 0 rgb(255 255 255 / .35), inset 0 -1px 0 rgb(0 0 0 / .08); animation:nw-grow .52s var(--nw-ease) both; animation-delay:calc(var(--n, 0) * 90ms); }
.nw-scale-part:first-child { border-radius:9px 6px 6px 9px; } .nw-scale-part:last-child { border-radius:6px 9px 9px 6px; } .nw-scale-part:only-child { border-radius:9px; }
.nw-scale-part span { font-size:var(--nw-fs-label); line-height:1; font-weight:700; letter-spacing:.02em; color:rgb(20 26 45 / .72); white-space:nowrap; }
@container (max-width:62px) { .nw-scale-part span { display:none; } }
.nw-scale-part.wl { place-items:center start; padding-left:10px; } .nw-scale-part.wr { place-items:center end; padding-right:10px; }
@keyframes nw-grow { from { transform:scaleX(0); } }
/* La bulle peut \xEAtre un bouton (un appui ouvre le d\xE9tail) : la r\xE8gle passe devant celles des boutons d'une brique.
   Son fond prend 40 % de la teinte au plus : le texte garde un contraste de 4,5 en th\xE8me sombre, quelle que soit la teinte. */
.nw-scale .nw-scale-pin { --tx:-50%; position:absolute; min-height:0; margin:0; font-family:inherit; top:8px; z-index:2; display:inline-flex; align-items:center; padding:3px 9px; border:0; border-radius:var(--nw-radius-pill);
  white-space:nowrap; font-size:var(--nw-fs-small); font-weight:700; line-height:18px; font-variant-numeric:tabular-nums; color:var(--nw-fg); transform:translateX(var(--tx)) translateY(-2px) scale(1.04);
  background:color-mix(in oklab, var(--tone) 40%, var(--nw-bg)); box-shadow:0 0 0 1px var(--nw-line), 0 4px 10px -4px rgb(0 0 0 / .35); animation:nw-pop .3s var(--nw-ease) .2s both; }
.nw-scale .nw-scale-pin.edge-l { --tx:-14px; } .nw-scale .nw-scale-pin.edge-r { --tx:calc(-100% + 14px); }
@keyframes nw-pop { from { opacity:0; transform:translateX(var(--tx)) translateY(6px) scale(.92); } }
.nw-scale-stem { position:absolute; top:31px; z-index:1; width:1.5px; height:13px; margin-left:-.75px; background:color-mix(in oklab, var(--tone) 70%, var(--nw-fg)); }
.nw-scale .nw-dot { top:49px; }
.nw-scale-span { position:absolute; top:37px; height:3px; border-radius:2px; background:color-mix(in srgb, var(--nw-fg) 45%, transparent); }
.nw-scale-span::before, .nw-scale-span::after { content:''; position:absolute; top:-2px; width:1.5px; height:7px; border-radius:1px; background:inherit; }
.nw-scale-span::before { left:0; } .nw-scale-span::after { right:0; }
/* La temp\xE9rature r\xE9elle \xE0 c\xF4t\xE9 du ressenti (Weather) ou dehors (Confort) : un trait fin en travers de l'\xE9chelle (3 novembre, \xAB partout sur le trait \xBB). */
.nw-scale .nw-scale-mk { position:absolute; top:40px; z-index:2; width:2px; height:26px; min-height:0; margin:0 0 0 -1px; padding:0; box-sizing:border-box; border:0; border-radius:1px;
  background:color-mix(in srgb, var(--nw-fg) 85%, transparent); box-shadow:0 0 0 1px color-mix(in srgb, var(--nw-bg) 60%, transparent); }
/* Le doigt le trouve : la zone d'appui est plus large que le trait. */
button.nw-scale-mk::before { content:''; position:absolute; inset:-6px -10px; }
.nw-scale-lb { position:absolute; top:66px; translate:-50% 0; font-size:var(--nw-fs-label); line-height:16px; color:var(--nw-fg2); white-space:nowrap; font-variant-numeric:tabular-nums; }
.nw-scale-lb.up { top:22px; } .nw-scale-lb.first { translate:0 0; } .nw-scale-lb.last { translate:-100% 0; } .nw-scale-lb b { color:var(--nw-fg); font-weight:650; }
@media (prefers-reduced-motion:reduce) { .nw-scale-part, .nw-scale-pin, .nw-dot::after { animation:none; } }
/* La frise compacte (4 novembre, maquettes/planche-ressenti-condense.html, variante D) : la m\xEAme piste et ses mots, une bulle plus petite,
   sans ligne de rep\xE8res ; la plage et le dehors se disent ailleurs. Le Ressenti de la carte compl\xE8te de Confort. */
.nw-scale.compact { height:46px; margin:0 2px; }
.nw-scale.compact .nw-scale-lane { top:26px; height:16px; }
.nw-scale.compact .nw-scale-pin { top:0; padding:0 7px; font-size:var(--nw-fs-label); line-height:16px; transform:translateX(var(--tx)); box-shadow:0 0 0 1px var(--nw-line); }
.nw-scale.compact .nw-scale-stem { top:16px; height:10px; }
.nw-scale.compact .nw-dot { top:30px; }

/* ---------- Fl\xE8ches et chevrons (3 novembre, maquettes/planche-fleches.html) : un seul dessin au trait, pos\xE9 par la charte. ----------
   La tendance (.nw-trend) ne s'affiche que si la mesure monte ou baisse vraiment ; \xAB stable \xBB garde sa place sans rien montrer.
   Sa couleur : vert, elle revient vers votre plage ; orange, elle s'en \xE9loigne ; gris sinon. Elle glisse d'un cran en apparaissant, jamais en boucle.
   Le vent prend la m\xEAme fl\xE8che, tourn\xE9e vers o\xF9 il va (--r). Le chevron (.nw-chev) ouvre et replie ; il tourne d'un quart en s'ouvrant. */
.nw-trend, .nw-chev { display:inline-block; flex:none; background:currentColor; vertical-align:-1px; transform:rotate(var(--r, 0deg));
  -webkit-mask:var(--nw-glyph) center / contain no-repeat; mask:var(--nw-glyph) center / contain no-repeat; }
.nw-trend { width:12px; height:12px; color:var(--nw-fg2);
  --nw-glyph:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 10.5V1.8M2.4 5.2 6 1.6l3.6 3.6'/%3E%3C/svg%3E");
  animation:nw-nudge .5s var(--nw-ease) both; }
.nw-trend[data-way="down"] { --r:180deg; }
.nw-trend[data-way="stable"] { visibility:hidden; animation:none; }
/* Apr\xE8s une grande valeur, \xAB stable \xBB ne laisse pas m\xEAme de place ; dans une liste, il la garde pour l'alignement. */
.nw-value .nw-trend[data-way="stable"] { display:none; }
.nw-trend[data-tone="better"] { color:color-mix(in oklab, var(--nw-calm) 75%, var(--nw-fg)); }
.nw-trend[data-tone="worse"] { color:color-mix(in oklab, var(--nw-level2) 80%, var(--nw-fg)); }
@keyframes nw-nudge { from { opacity:0; translate:0 3px; } }
.nw-trend[data-way="down"] { animation-name:nw-nudge-down; } @keyframes nw-nudge-down { from { opacity:0; translate:0 -3px; } }
.nw-chev { width:14px; height:14px; color:var(--nw-fg2); transition:transform .22s var(--nw-ease);
  --nw-glyph:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 6l6 6-6 6'/%3E%3C/svg%3E"); }
.nw-chev.open, [aria-expanded="true"] > .nw-chev, details[open] > summary .nw-chev { --r:90deg; }
/* Le vent : la m\xEAme fl\xE8che, tourn\xE9e vers o\xF9 il va, \xE0 sa couleur, sans entr\xE9e anim\xE9e. */
.nw-trend.wind { width:10px; height:10px; color:color-mix(in oklab, var(--nw-wind) 70%, var(--nw-fg)); animation:none; }
/* Une fl\xE8che suivie de mots ou d'un chiffre gris (\xAB +4,4 \xB0C/h \xBB, \xAB s'approchent \xBB) : sur une ligne, un petit \xE9cart. */
.nw-say:has(> .nw-trend) { display:inline-flex; align-items:center; gap:5px; }
/* Dans le bouton rond d'une section, le chevron pointe vers le bas ; c'est le bouton qui tourne en s'ouvrant. */
.nw-chevron .nw-chev { --r:90deg; }
@media (prefers-reduced-motion:reduce) { .nw-trend { animation:none; } .nw-chev { transition:none; } }


/* ---------- Le Ressenti (3 novembre, maquettes/maquette-ressenti-piece.html) : celui de Weather dehors, celui d'une pi\xE8ce de Confort. ----------
   La valeur et son mot, l'\xE9chelle, puis ce qui joue en cases d\xE9limit\xE9es : leur titre, leur effet en un mot teint\xE9, la valeur, une note.
   Quatre cases par ligne dans une carte large, ou --nw-ff-cols. */
.nw-feel-row { display:flex; align-items:baseline; flex-wrap:wrap; gap:4px 12px; }
.nw-feel-word { font-size:var(--nw-fs-text); font-weight:650; }
.nw-feel-say { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.nw-feel-ends { display:flex; justify-content:space-between; margin:2px 6px 0; font-size:var(--nw-fs-label); color:var(--nw-fg2); font-variant-numeric:tabular-nums; }
.nw-feel-factors { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:8px; }
@container (min-width:600px) { .nw-feel-factors { grid-template-columns:repeat(var(--nw-ff-cols, 4), minmax(0,1fr)); } }
.nw-feel-factors > * { container-type:inline-size; display:grid; gap:2px; align-content:start; padding:10px 12px; border-radius:12px; min-width:0;
  background:var(--nw-bg); border:1px solid color-mix(in srgb, var(--nw-fg) 14%, transparent); }
.nw-ff-head { display:flex; justify-content:space-between; align-items:center; gap:6px; font-size:var(--nw-fs-small); color:var(--nw-fg2); min-width:0; }
.nw-ff-t { display:flex; align-items:center; gap:6px; min-width:0; line-height:1.3; }
.nw-ff-t ha-icon, .nw-ff-t svg { flex:none; } .nw-ff-head ha-icon { --mdc-icon-size:15px; } .nw-ff-t svg { width:15px; height:15px; }
/* Une case \xE9troite : l'effet sous le titre, dans toutes les cases pareil. */
@container (max-width:150px) { .nw-ff-head { flex-direction:column; align-items:flex-start; gap:4px; } }
.nw-ff-eff { flex:none; padding:0 6px; border-radius:var(--nw-radius-pill); font-size:var(--nw-fs-label); font-weight:700; white-space:nowrap;
  background:color-mix(in oklab, var(--c) 28%, transparent); color:color-mix(in oklab, var(--c) 40%, var(--nw-fg)); }
.nw-feel-factors b { font-size:var(--nw-fs-title); font-weight:500; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.nw-feel-factors small { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.nw-feel-why { padding:10px 12px; border-radius:12px; background:var(--nw-bg); border:1px solid var(--nw-line); font-size:var(--nw-fs-text); }
.nw-feel-why p { margin:4px 0; } .nw-feel-why .ex { color:var(--nw-fg2); }
`;var Jt=`/* Hestia Chauffage's own pieces, on top of the shared charter (ui/hestia-charte.css): the stove's colour, the house
   band, the rooms' list, the planning's lanes (cards' mock-up of 20 Nov. 2026), and the clock cards of the room and the stove
   with their drawers (24 Nov. 2026). */
:host { display:block; --hc-stove: var(--hestia-stove-color, oklch(.86 .1 80)); --hc-off: color-mix(in srgb, var(--nw-fg) 30%, transparent); }
ha-card { padding:18px; display:flex; flex-direction:column; gap:12px; container-type:inline-size; min-width:0; box-sizing:border-box; }
.head { display:flex; align-items:center; gap:10px; min-width:0; }
.head .nw-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nw-chip.stove { --c:var(--hc-stove); } .nw-chip.heat { --c:var(--nw-heat); } .nw-chip.cold { --c:var(--nw-cold); } .nw-chip.calm { --c:var(--nw-calm); }
.nw-chip.act { --c:var(--nw-act); } .nw-chip.alert { --c:var(--nw-alert); } .nw-chip.off { --c:var(--hc-off); }
/* The house's band (1.0.0b8): the charter's (.nw-band, as Confort's \xAB Rien \xE0 faire \xBB), tinted by what heats. */
.band { --c:var(--nw-calm); background:color-mix(in oklab, var(--c) 14%, var(--nw-glass-clear)); }
.band.chauffe { --c:var(--hc-stove); } .band.rafraichit { --c:var(--nw-cold); }
.band .nw-band-title { font-size:min(var(--nw-fs-value), 8cqi); }
.rooms { display:flex; flex-direction:column; }
.room { display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center; padding:8px 2px; border-top:1px solid color-mix(in srgb, var(--nw-fg) 6%, transparent);
  background:none; border-left:0; border-right:0; border-bottom:0; text-align:left; cursor:pointer; width:100%; box-sizing:border-box; }
.room:first-child { border-top:0; }
.room .n { font-weight:600; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.room .t { font-variant-numeric:tabular-nums; font-weight:650; text-align:right; white-space:nowrap; }
.room .t small { font-weight:500; color:var(--nw-fg2); }
.room .demand { width:56px; height:6px; border-radius:3px; background:color-mix(in srgb, var(--nw-fg) 8%, transparent); overflow:hidden; }
.temp { font-size:min(var(--nw-fs-temp), 15cqi); font-weight:300; letter-spacing:-.05em; line-height:1; position:relative; padding-right:24px; width:fit-content; }
.temp sup { position:absolute; right:0; top:.3em; font-size:var(--nw-fs-text); font-weight:500; letter-spacing:0; color:var(--nw-fg2); }
.sw { width:12px; height:8px; border-radius:2px; display:inline-block; }
/* A room's card opens its thermostat on a tap (\xAB Clic sur la carte \xBB); its modes are the thermostat's presets. */
ha-card.tap { cursor:pointer; }
.short[role="button"] { border-radius:8px; }
.short[role="button"]:focus-visible { outline:2px solid var(--nw-accent); outline-offset:2px; }
.room .demand i { display:block; height:100%; border-radius:3px; background:color-mix(in oklab, var(--nw-heat) 80%, var(--nw-fg) 10%); }
.modes { display:grid; grid-template-columns:repeat(var(--n, 4), minmax(0, 1fr)); gap:8px; margin-top:4px; cursor:default; }
.mode { --c:var(--nw-heat); min-width:0; padding:10px 6px; border-radius:12px; border:1px solid var(--nw-line); background:var(--nw-surface);
  font-size:var(--nw-fs-text); font-weight:600; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  transition:background .2s, border-color .2s; }
.mode.cold { --c:var(--nw-cold); } .mode.off { --c:var(--hc-off); } .mode.act { --c:var(--nw-act); }
.mode:hover:not(:disabled) { border-color:color-mix(in srgb, var(--nw-fg) 30%, transparent); }
.mode.on { background:color-mix(in oklab, var(--c) var(--nw-chip-tint), var(--nw-bg)); border-color:color-mix(in oklab, var(--c) 75%, var(--nw-fg) 10%);
  color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
.mode:disabled { cursor:not-allowed; opacity:.55; }
.note.bad { color:color-mix(in oklab, var(--nw-alert) 70%, var(--nw-fg)); }
@media (prefers-reduced-motion:reduce) { .mode { transition:none; } }
.short { display:grid; grid-template-columns:auto 1fr auto; gap:14px; align-items:center; }
.short .temp { font-size:40px; padding-right:20px; }
.short b { display:block; font-size:var(--nw-fs-text); font-weight:650; }
.lanes { display:flex; flex-direction:column; gap:8px; }
.lane, .hours { display:grid; grid-template-columns:110px 1fr; gap:10px; align-items:center; }
.lane .n { font-size:var(--nw-fs-small); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lane .n small { display:block; font-weight:500; font-size:var(--nw-fs-label); color:var(--nw-fg2); }
.lane .n small.bad { color:color-mix(in oklab, var(--nw-alert) 70%, var(--nw-fg)); }
.hours > div { position:relative; height:14px; font-size:var(--nw-fs-label); color:var(--nw-fg2); }
.hours > div span { position:absolute; transform:translateX(-50%); white-space:nowrap; }
.hours > div span:first-child { transform:none; } .hours > div span:last-child { transform:translateX(-100%); }
.track { position:relative; height:12px; border-radius:6px; background:color-mix(in srgb, var(--nw-fg) 8%, transparent); overflow:hidden; }
.track i { position:absolute; top:0; bottom:0; }
.track .now { position:absolute; top:-2px; bottom:-2px; width:2px; background:var(--nw-fg); border-radius:1px; }
.t-poele { background:color-mix(in oklab, var(--hc-stove) 90%, transparent); } .t-confort { background:color-mix(in oklab, var(--nw-heat) 85%, transparent); }
.t-eco { background:color-mix(in oklab, var(--nw-cold) 70%, transparent); } .t-boost { background:color-mix(in oklab, var(--nw-act) 95%, transparent); } .t-hors_gel, .t-arret { background:color-mix(in srgb, var(--nw-fg) 12%, transparent); }
.note { font-size:var(--nw-fs-small); color:var(--nw-fg2); text-align:center; margin:0; }
.empty { color:var(--nw-fg2); }
@container (max-width:420px) { .lane, .hours { grid-template-columns:78px 1fr; } ha-card { padding:14px; } }

/* ---------- The clock cards (0.8): the room's and the stove's, after the mock-up validated by Frank on 24 Nov. 2026 ---------- */
:host {
  --hc-demand: var(--nw-level2);
  --hc-raised: color-mix(in srgb, var(--nw-fg) 5%, var(--nw-bg));
  --hc-raised2: color-mix(in srgb, var(--nw-fg) 9%, var(--nw-bg));
  --hc-sunk: color-mix(in srgb, #000 9%, var(--nw-bg));
  --hc-sunk2: color-mix(in srgb, #000 15%, var(--nw-bg));
  --hc-well: color-mix(in srgb, #000 26%, var(--nw-bg));
  /* The ring: the planning's levels, a little darker than their colour so that the trace stays in front. */
  --hc-r-confort: color-mix(in oklab, var(--nw-heat) 72%, var(--nw-bg));
  --hc-r-eco: color-mix(in oklab, var(--nw-cold) 66%, var(--nw-bg));
  --hc-r-poele: color-mix(in oklab, var(--hc-stove) 78%, var(--nw-bg));
  --hc-r-boost: color-mix(in oklab, var(--nw-act) 85%, var(--nw-bg));
  --hc-r-off: color-mix(in srgb, var(--nw-fg) 18%, var(--nw-bg));
  /* The trace and the set points, deeper on a light background so that they read as well as on a dark one. */
  --hc-trace: var(--nw-heat);
  --hc-set: color-mix(in oklab, var(--nw-heat) 80%, var(--nw-fg));
  /* The wheel (0.8.0b3): its disc, the hours' strokes from a little to a lot (a flame, a demand), yesterday's in grey,
     the light on the hour shown. */
  --hc-disc: color-mix(in srgb, #000 22%, var(--nw-bg));
  --hc-flame-lo: oklch(.84 .09 96); --hc-flame-hi: oklch(.74 .15 48);
  --hc-dem-lo: oklch(.78 .05 55); --hc-dem-hi: oklch(.74 .14 40);
  --hc-yday: color-mix(in srgb, var(--nw-fg) 16%, transparent);
  --hc-glow: color-mix(in srgb, var(--nw-fg) 5%, transparent);
  --hc-ease: cubic-bezier(.2, .8, .2, 1);
}
:host([theme="light"]) {
  --hc-sunk: color-mix(in srgb, #000 2.5%, var(--nw-bg));
  --hc-sunk2: color-mix(in srgb, #000 4.5%, var(--nw-bg));
  --hc-well: color-mix(in srgb, #000 8%, var(--nw-bg));
  --hc-trace: color-mix(in oklch, var(--nw-heat) 45%, oklch(.6 .15 42));
  --hc-set: color-mix(in oklch, var(--nw-heat) 30%, oklch(.55 .14 42));
  --hc-disc: color-mix(in srgb, #000 3%, var(--nw-bg));
  --hc-flame-lo: oklch(.91 .09 96); --hc-flame-hi: oklch(.7 .16 45);
  --hc-dem-lo: oklch(.9 .045 55); --hc-dem-hi: oklch(.68 .15 38);
}
ha-card.clock { padding:0; gap:0; overflow:hidden; position:relative; isolation:isolate; }
/* 1.0.0b9, as on Confort's cards: a still light at the top, in the colour of what the room or the stove does now
   (heating, \xE9co, confort, the stove burning), wide and soft from the top right. */
.glow { position:absolute; z-index:-1; pointer-events:none; left:0; right:0; top:0; height:340px;
  background:radial-gradient(75% 60% at 95% 4%, color-mix(in oklab, var(--c) 30%, transparent), transparent 72%),
    radial-gradient(60% 45% at 20% 0%, color-mix(in oklab, var(--c) 11%, transparent), transparent 72%),
    linear-gradient(180deg, color-mix(in oklab, var(--c) 7%, transparent), transparent 80%);
  -webkit-mask-image:linear-gradient(to bottom, #000 45%, transparent 100%); mask-image:linear-gradient(to bottom, #000 45%, transparent 100%); }
.top { padding:22px; display:flex; flex-direction:column; gap:16px; }
/* The head (1.0.0b8): the name and its line on the left, the pills on the right, stacked; the settings at the foot. */
.chead { display:grid; grid-template-columns:minmax(0, 1fr) auto; align-items:start; gap:10px; min-width:0; }
.ttl { min-width:0; }
.ttl .nw-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ttl .sub { font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* 1.0: the stove's sentence under its name, coloured by its tone (engine/stove_says.py). */
.ttl .sub .say { display:block; white-space:normal; font-weight:600; color:var(--nw-fg); }
.ttl .sub .say.alert, .ttl .sub .say.act { color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
.ttl .sub .say.alert { --c:var(--nw-alert); } .ttl .sub .say.act { --c:var(--nw-act); }
.ttl .sub .say.off { font-weight:500; color:var(--nw-fg2); }
.pills { display:flex; flex-direction:column; align-items:flex-end; gap:6px; min-width:0; }
.foot { display:flex; padding:12px 22px 16px; border-top:1px solid var(--nw-line-soft); }
.setb { gap:6px; cursor:pointer; }
.setb:hover { border-color:color-mix(in srgb, var(--nw-fg) 34%, transparent); }
.setb svg { width:14px; height:14px; flex:none; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; }
.pill { --c:var(--hc-off); display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 12px; border-radius:var(--nw-radius-pill); box-sizing:border-box;
  font-size:var(--nw-fs-small); font-weight:650; white-space:nowrap; color:var(--nw-fg); background:color-mix(in oklab, var(--c) var(--nw-chip-tint), var(--nw-bg)); }
.pill.heat { --c:var(--nw-heat); } .pill.cold { --c:var(--nw-cold); } .pill.stove { --c:var(--hc-stove); } .pill.calm { --c:var(--nw-calm); }
.pill.act { --c:var(--nw-act); } .pill.alert { --c:var(--nw-alert); } .pill.off { background:var(--hc-raised2); }
.pill .dot { width:8px; height:8px; border-radius:50%; flex:none; background:color-mix(in oklab, var(--c) 85%, var(--nw-fg)); }
.pill.off .dot { background:var(--nw-fg2); }
.pill .beat { display:inline-flex; animation:hc-beat 1.6s ease-in-out infinite; }
.pill .wv { width:15px; height:15px; flex:none; fill:none; stroke:color-mix(in oklab, var(--c) 80%, var(--nw-fg)); stroke-width:1.7; stroke-linecap:round; }
.pill.heat .wv { stroke:var(--hc-demand); } .pill.off .wv { stroke:var(--nw-fg2); }
.gauge { display:block; width:36px; height:6px; border-radius:3px; overflow:hidden; background:color-mix(in srgb, var(--nw-fg) 16%, transparent); }
.gauge i { display:block; height:100%; border-radius:3px; background:var(--hc-demand); }
@container (max-width:440px) {
  .top { padding:16px; } .dbox, .foot { padding-left:16px; padding-right:16px; }
}

/* The clock (0.8.0b3, \xAB la roue au survol \xBB): drawn in a 440 \xD7 386 box; the middle's words are sized on the wheel's
   width, so that they keep their room inside the disc on a phone. Over an hour, it grows, the others fade, and its
   figures take the middle's place. */
.wheel { position:relative; container-type:inline-size; }
/* 1.0, the compact version of the stove's and a room's cards: the clock small, beside its sentence; its hours and its
   scale left out (too small to read), its centre kept readable. */
.top.compact { gap:14px; }
/* 1.0.0b8 (Frank: \xAB trop petite, on voit rien \xBB): the wheel bigger and lighter: cut to itself, only the steps reached,
   no dotted degrees, a thicker trace. */
.pair { display:grid; grid-template-columns:minmax(170px, 56%) 1fr; gap:16px; align-items:center; }
.compact .steps .blk:not(.on) { display:none; }
.compact .wheel .grid { display:none; }
.compact .wheel .trace { stroke-width:4; }
.compact .cell path { stroke-width:13; }
.pair .side { display:flex; flex-direction:column; align-items:flex-start; gap:10px; min-width:0; }
.compact .wheel .hl, .compact .wheel .gt { display:none; }
.compact .mid { width:42cqi; }
.compact .mid .ct { font-size:max(18px, 9cqi); }
.compact .mid .art { width:max(26px, 16cqi); }
.compact .mid .cs { display:none; }
/* 1.0.0b9 (Frank: \xAB plus large que haute \xBB) : the compact card folds as Confort's does. Folded: the head, the clock
   with its sentence, its modes or buttons (the fire pot's too) and a short legend on the right, a handle. Unfolded:
   the drawers with the day's figures, and the settings' button. */
ha-card.small.folded { cursor:pointer; }
.small .top.compact { padding:18px 20px 4px; gap:12px; }
.small .pair { grid-template-columns:minmax(140px, 42%) minmax(0, 1fr); gap:20px; padding-left:2px; }
.small .pair .side { gap:12px; align-self:center; }
.small .side .say { margin:0; font-size:var(--nw-fs-body, 14px); line-height:1.35; color:var(--nw-fg); }
.small .side .say.off { color:var(--nw-fg2); }
.small .side .say.alert { color:color-mix(in oklab, var(--nw-alert) var(--nw-ink, 60%), var(--nw-fg)); }
.small .side .modes { width:100%; margin:0; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px; }
@container (min-width:620px) { .small .side .modes { grid-template-columns:repeat(var(--n, 4), minmax(0, 1fr)); } }
.small .side .mode { padding:7px 4px; font-size:var(--nw-fs-small); border-radius:10px; }
.small .side .note { margin:0; text-align:left; }
.small .side .btns { width:100%; gap:6px; }
.small .side .btn { flex:1 1 120px; height:38px; font-size:var(--nw-fs-small); }
.small .side .btn.pot { flex-basis:100%; height:auto; min-height:42px; padding:6px 14px; }
.small .side .btn.pot { white-space:normal; text-align:left; }
.small .side .btn.pot .pot-say b { font-size:var(--nw-fs-small); white-space:normal; }
.legend.mini { display:grid; grid-template-columns:repeat(2, max-content); justify-content:start; gap:5px 16px; font-size:11.5px; }
.legend.mini .wide { grid-column:1 / -1; }
.handle { display:block; width:100%; height:22px; padding:0; margin:0; border:0; background:none; cursor:pointer; }
.handle i { display:block; width:34px; height:3px; border-radius:2px; margin:0 auto; background:color-mix(in oklab, var(--nw-fg) 22%, transparent); }
.handle:hover i { background:color-mix(in oklab, var(--nw-fg) 40%, transparent); }
.handle:focus-visible { outline:none; } .handle:focus-visible i { background:var(--nw-fg); }
.unfold { cursor:default; }
.dbox.inline { padding-top:16px; }
.unfold > .dbox:first-child { border-top:1px solid var(--nw-line-soft); }
@container (max-width:380px) { .small .pair { grid-template-columns:1fr; } .small .pair .wheel { max-width:220px; margin:0 auto; width:100%; } }
@container (max-width:300px) { .pair { grid-template-columns:1fr; } }
.wheel > svg { width:100%; height:auto; display:block; overflow:visible; font-family:inherit; touch-action:manipulation; }
.wheel .disc { fill:var(--hc-disc); stroke:var(--nw-line); stroke-width:1; r:64px; transition:r .28s var(--hc-ease); outline:none; }
.wheel.picking .disc { r:69px; }
.wheel .disc[role="button"]:focus-visible { stroke:var(--nw-accent); stroke-width:2; }
.wheel .lit { fill:var(--hc-glow); opacity:0; transition:opacity .2s; }
.wheel.picking .lit { opacity:1; }
/* The ring: each hour its own cell, at the planning's colour. */
.cell path { fill:none; stroke-width:10; stroke:var(--hc-r-off); transition:stroke-width .28s var(--hc-ease), opacity .28s; }
.cell .t-none { stroke:color-mix(in srgb, var(--nw-fg) 7%, transparent); }
.cell .t-confort { stroke:var(--hc-r-confort); } .cell .t-eco { stroke:var(--hc-r-eco); } .cell .t-poele { stroke:var(--hc-r-poele); }
.cell .t-boost { stroke:var(--hc-r-boost); }
.cell.on path { stroke-width:18; } .cell.near path { stroke-width:13; }
.picking .cell.far path { opacity:.42; }
/* Each hour's steps, outside the ring (1.0.0b8): small blocks, the steps it reached lit, from pale to deep orange; the
   others stay faint, so that the 24 hours always make a whole circle. */
.steps { animation:hc-fade .6s var(--hc-ease) backwards; transition:opacity .28s; }
.steps .blk { fill:color-mix(in srgb, var(--nw-fg) 4.5%, transparent); transition:fill .28s; }
.steps.flame { --lo:var(--hc-flame-lo); --hi:var(--hc-flame-hi); } .steps.demand { --lo:var(--hc-dem-lo); --hi:var(--hc-dem-hi); }
.steps .blk.on { fill:color-mix(in oklch, var(--hi) var(--p), var(--lo)); }
.steps.ahead .blk { fill:color-mix(in srgb, var(--nw-fg) 3%, transparent); }
.steps.on .blk:not(.on) { fill:color-mix(in srgb, var(--nw-fg) 16%, transparent); }
.picking .steps.far { opacity:.3; }
@keyframes hc-fade { from { opacity:0; } }
/* The trace over its dotted whole degrees, its set point in steps, the values written in the gap after the hand. */
.wheel .grid { fill:none; stroke:color-mix(in srgb, var(--nw-fg) 22%, transparent); stroke-width:1; stroke-dasharray:1.5 3.5; stroke-linecap:round; }
.wheel .gs0 { stop-color:var(--hc-trace); stop-opacity:0; } .wheel .gs1 { stop-color:var(--hc-trace); stop-opacity:.34; }
.wheel .area { stroke:none; }
.wheel .trace { fill:none; stroke:var(--hc-trace); stroke-width:3; stroke-linejoin:round; stroke-linecap:round; stroke-dasharray:1;
  animation:hc-draw 1.4s var(--hc-ease) both; }
@keyframes hc-draw { from { stroke-dashoffset:1; } to { stroke-dashoffset:0; } }
.wheel .set { fill:none; stroke:var(--hc-set); stroke-width:2.4; stroke-dasharray:7 4; stroke-linecap:round; }
.wheel .gt { font-size:10.5px; font-weight:700; fill:var(--nw-fg2); text-anchor:middle; dominant-baseline:central;
  paint-order:stroke; stroke:var(--nw-bg); stroke-width:3px; stroke-linejoin:round; }
.wheel .gt.set { fill:var(--hc-set); }
.wheel .hl { font-size:12.5px; font-weight:700; fill:color-mix(in srgb, var(--nw-fg) 75%, transparent); text-anchor:middle; dominant-baseline:central; }
.wheel .hand { stroke:var(--nw-fg); stroke-width:2; stroke-linecap:round; }
.wheel .knob { fill:var(--nw-fg); stroke:var(--nw-bg); stroke-width:3; }
.wheel .ping { fill:var(--nw-fg); transform-box:fill-box; transform-origin:center; animation:hc-ping 2.4s ease-out infinite; }
@keyframes hc-ping { 0% { transform:scale(1); opacity:.45; } 70%, 100% { transform:scale(3.2); opacity:0; } }
.wheel .now { fill:var(--hc-trace); stroke:var(--nw-bg); stroke-width:2; }
.wheel .mark { fill:var(--nw-bg); stroke-width:2.5; stroke:var(--hc-trace); }
.wheel .mark.lit { stroke:var(--hc-stove); } .wheel .mark.stop { stroke:var(--nw-cold); }
.wheel .tdot { fill:var(--hc-trace); stroke:var(--nw-bg); stroke-width:3; opacity:0; transition:opacity .2s; }
.wheel .tdot.on { opacity:1; }
.wheel .hit { fill:transparent; cursor:pointer; outline:none; -webkit-tap-highlight-color:transparent; }
.wheel .hit:focus-visible { fill:color-mix(in srgb, var(--hc-trace) 12%, transparent); }
/* The middle: the picture and the temperature, or the hour shown. */
.wheel .mid { position:absolute; left:50%; top:50%; transform:translate(-50%, -50%); width:28cqi; display:grid; pointer-events:none; text-align:center; }
.mid > div { grid-area:1 / 1; display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:0;
  transition:opacity .22s, transform .28s var(--hc-ease); }
.mid .pick { opacity:0; transform:scale(.92); }
.wheel.picking .mid .rest { opacity:0; transform:scale(1.06); }
.wheel.picking .mid .pick { opacity:1; transform:none; }
.mid .art { display:block; width:12.5cqi; height:auto; overflow:visible; }
.mid .ct { font-size:5.6cqi; font-weight:300; letter-spacing:-.02em; line-height:1; margin-top:.9cqi; font-variant-numeric:tabular-nums; }
.mid .cs { font-size:max(9px, 2.15cqi); font-weight:700; color:var(--nw-fg2); margin-top:.8cqi; white-space:nowrap; max-width:28cqi;
  overflow:hidden; text-overflow:ellipsis; }
.mid .ph { font-size:max(9px, 2.1cqi); font-weight:700; color:var(--nw-fg2); letter-spacing:.02em; white-space:nowrap; }
.mid .pv { font-size:6cqi; font-weight:300; letter-spacing:-.03em; line-height:1.05; margin:.5cqi 0 .7cqi; font-variant-numeric:tabular-nums; }
.mid .pv.word { font-size:3.9cqi; font-weight:600; letter-spacing:-.01em; margin:1cqi 0 1.1cqi; }
.mid .pl { font-size:max(9px, 2.25cqi); font-weight:650; white-space:nowrap; line-height:1.35; font-variant-numeric:tabular-nums; }
.mid .pl.dim { color:var(--nw-fg2); }
.mid .ph, .mid .pl { max-width:30cqi; overflow:hidden; text-overflow:ellipsis; }
.hint { margin:-4px 0 0; text-align:center; font-size:var(--nw-fs-small); font-weight:650; color:var(--nw-fg2); }
@media (prefers-reduced-motion:reduce) {
  .steps, .wheel .trace, .wheel .ping { animation:none; } .wheel .ping { display:none; }
  .cell path, .steps, .steps .blk, .mid > div, .wheel .disc, .wheel .lit, .wheel .tdot { transition:none; }
}
/* The pictures. A stove is dark in both themes. */
.art .metal { fill:color-mix(in srgb, var(--nw-fg) 82%, var(--nw-bg)); }
.art .foot, .art .valve { fill:color-mix(in srgb, var(--nw-fg) 62%, var(--nw-bg)); }
.art .slot { fill:color-mix(in srgb, var(--nw-fg) 40%, var(--nw-bg)); }
.art .pipe { fill:none; stroke:color-mix(in srgb, var(--nw-fg) 50%, var(--nw-bg)); stroke-width:2.5; }
.art .led { fill:color-mix(in srgb, var(--nw-fg) 35%, var(--nw-bg)); }
.art .led.on { fill:var(--nw-heat); } .art .led.on.cool { fill:var(--nw-cold); }
.art .wave { fill:none; stroke:var(--nw-heat); stroke-width:2; stroke-linecap:round; } .art .wave.cool { stroke:var(--nw-cold); }
.art .s-pipe { fill:#5a616e; } .art .s-body { fill:#4a505c; } .art .s-top { fill:#626a78; } .art .s-glass { fill:#1d2027; }
.art .s-bed { fill:#e9733f; opacity:.3; } .art .s-bed.on { opacity:.9; } .art .s-f2 { fill:#f4ca84; } .art .s-f3 { fill:#fff1d0; }
.art .s-led { fill:#6b7280; } .art .s-led.on { fill:var(--nw-calm); }
.rise { transform-box:fill-box; animation:hc-rise 2.4s ease-in-out infinite; }
.blow { transform-box:fill-box; animation:hc-blow 1.8s ease-in-out infinite; }
.rise.r1, .blow.r1 { animation-delay:.8s; } .rise.r2, .blow.r2 { animation-delay:1.6s; }
.flick { transform-box:fill-box; transform-origin:50% 100%; animation:hc-flick 1.7s ease-in-out infinite alternate; }
.flick2 { transform-box:fill-box; transform-origin:50% 100%; animation:hc-flick 1.1s ease-in-out infinite alternate-reverse; }
@keyframes hc-rise { 0% { transform:translateY(3px); opacity:0; } 35% { opacity:1; } 100% { transform:translateY(-6px); opacity:0; } }
@keyframes hc-blow { 0% { transform:translateY(-3px); opacity:0; } 35% { opacity:1; } 100% { transform:translateY(6px); opacity:0; } }
@keyframes hc-flick { 0% { transform:scale(1, 1) skewX(0deg); } 35% { transform:scale(.96, 1.05) skewX(-3deg); } 70% { transform:scale(1.03, .96) skewX(2deg); }
  100% { transform:scale(.99, 1.03) skewX(-1deg); } }
@keyframes hc-beat { 0%, 100% { opacity:1; } 50% { opacity:.45; } }
@media (prefers-reduced-motion:reduce) { .rise, .blow, .flick, .flick2, .pill .beat { animation:none; } }
.legend { display:flex; justify-content:center; gap:8px 14px; flex-wrap:wrap; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.legend span { display:inline-flex; align-items:center; gap:6px; }
.legend .sw { width:14px; height:6px; border-radius:3px; background:var(--hc-r-off); }
.legend .sw.t-confort { background:var(--hc-r-confort); } .legend .sw.t-eco { background:var(--hc-r-eco); } .legend .sw.t-poele { background:var(--hc-r-poele); }
.legend .sw.t-boost { background:var(--hc-r-boost); }
.legend .sw.line { height:3px; border-radius:2px; background:var(--hc-trace); }
.legend .sw.set { height:0; border-radius:0; background:none; border-top:2px dashed color-mix(in oklab, var(--hc-set) 75%, transparent); }
.legend .sw.ramp { width:18px; background:linear-gradient(90deg, var(--hc-dem-lo), var(--hc-dem-hi)); }
.legend .sw.ramp.flame { background:linear-gradient(90deg, var(--hc-flame-lo), var(--hc-flame-hi)); }
/* A block of steps, as outside the ring: three small blocks from pale to deep. */
.legend .sw.blocks { display:inline-flex; gap:1.5px; width:auto; height:auto; background:none; border-radius:0; }
.legend .sw.blocks b { width:5px; height:9px; border-radius:1.5px; background:color-mix(in oklch, var(--hi) var(--p), var(--lo)); }
.legend .sw.blocks.flame { --lo:var(--hc-flame-lo); --hi:var(--hc-flame-hi); } .legend .sw.blocks.demand { --lo:var(--hc-dem-lo); --hi:var(--hc-dem-hi); }
.say, .why { margin:0; font-size:var(--nw-fs-text); line-height:1.45; }
.why { font-weight:600; }

/* The stove's buttons: the user's own presses. One that cannot be taken back asks again (.ask). */
.btns { display:flex; flex-wrap:wrap; gap:8px; }
.btn { flex:1 1 140px; min-width:0; height:50px; padding:0 12px; border-radius:var(--nw-radius-pill); border:1px solid var(--nw-line); background:var(--hc-raised2);
  font-size:var(--nw-fs-text); font-weight:700; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; transition:background .2s, border-color .2s; }
.btn svg { width:18px; height:18px; flex:none; fill:none; stroke:currentColor; stroke-width:1.9; stroke-linecap:round; stroke-linejoin:round; }
.btn:hover:not(:disabled) { border-color:color-mix(in srgb, var(--nw-fg) 34%, transparent); }
.btn:disabled { opacity:.55; cursor:not-allowed; }
.btn.ask, .btn.due { --c:var(--nw-act); background:color-mix(in oklab, var(--c) var(--nw-chip-tint), var(--nw-bg)); border-color:color-mix(in oklab, var(--c) 70%, transparent); }
/* The fire pot's button (1.0.0b6): filled as the pot is, its state over \xAB J\u2019ai nettoy\xE9 \xBB. */
.btn.pot { --c:var(--nw-calm); flex-basis:100%; justify-content:flex-start; padding:0 18px;
  background:linear-gradient(90deg, color-mix(in oklab, var(--c) 30%, var(--hc-raised2)) var(--fill), var(--hc-raised2) var(--fill)); }
.btn.pot.soon { --c:var(--nw-act); } .btn.pot.due { --c:var(--nw-alert); border-color:color-mix(in oklab, var(--c) 70%, transparent); }
.btn.pot.ask { background:color-mix(in oklab, var(--nw-act) var(--nw-chip-tint), var(--nw-bg)); }
.pot-say { display:flex; flex-direction:column; align-items:flex-start; min-width:0; line-height:1.2; }
.pot-say b, .pot-say small { overflow:hidden; text-overflow:ellipsis; max-width:100%; }
.pot-say small { font-size:var(--nw-fs-small, 12px); font-weight:600; color:var(--nw-fg2); }

/* The drawers, under the card's top; each one closed or open on a tap. */
/* The drawers (1.0.0b8): the charter's folding section, as Confort's \xAB D\xE9tails \xBB : its label in small capitals, its
   summary under it, the round chevron on the right; no more darker box. */
.dbox { padding:0 22px 16px; border-top:1px solid var(--nw-line-soft); }
.dbox:not(:has(.dbody)) { padding-bottom:0; }
.drawer { min-height:60px; color:inherit; }
.drawer .dt { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
.drawer .nw-sum { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.dbody, .panel { display:flex; flex-direction:column; gap:12px; }
.dbody { padding-top:4px; }
.tabs { display:flex; gap:4px; padding:4px; border-radius:14px; background:var(--hc-well); }
.tab { flex:1 1 0; min-width:0; height:40px; border-radius:11px; border:0; background:none; color:var(--nw-fg2); font-size:var(--nw-fs-small); font-weight:700; cursor:pointer;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tab[aria-selected="true"], .tab[aria-pressed="true"] { background:var(--hc-raised2); color:var(--nw-fg); }
:host([theme="light"]) .tab[aria-selected="true"], :host([theme="light"]) .tab[aria-pressed="true"] { background:var(--nw-bg); box-shadow:0 1px 2px rgb(0 0 0 / .12); }
.tiles { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; }
.tile { display:flex; flex-direction:column; gap:2px; padding:12px 14px; border-radius:16px; background:var(--hc-raised); min-width:0; }
.tile .v { font-size:var(--nw-fs-title); font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.tile .u { font-size:var(--nw-fs-small); font-weight:600; color:var(--nw-fg2); margin-left:3px; }
.tile .k { font-size:var(--nw-fs-small); color:var(--nw-fg2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.bars { display:flex; flex-direction:column; gap:6px; padding:12px 12px 8px; border-radius:16px; background:var(--hc-raised); }
.bars > .cols, .bars > .vals, .bars > .days { display:grid; grid-template-columns:repeat(var(--n), minmax(0, 1fr)); gap:clamp(3px, 1.2cqi, 8px); text-align:center; font-size:var(--nw-fs-label);
  color:var(--nw-fg2); }
.bars .cols { position:relative; height:72px; align-items:end; }
.bars .cols span { display:block; border-radius:6px 6px 2px 2px; background:color-mix(in oklab, var(--hc-demand) 38%, var(--nw-bg)); }
.bars .cols span.today { background:var(--hc-demand); }
.pellets .bars .cols span { background:color-mix(in oklab, var(--hc-stove) 40%, var(--nw-bg)); } .pellets .bars .cols span.today { background:var(--hc-stove); }
.bars .vals span { white-space:nowrap; overflow:hidden; } .bars .vals span.today { color:var(--nw-fg); font-weight:700; }
.bhead { display:flex; justify-content:space-between; align-items:baseline; gap:8px; font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-bottom:4px; }
.bhead b { color:var(--nw-fg); font-weight:650; }
/* 1.0.0b8: the mean of the days before today, dotted across the bars; the bars' legend under their days. */
.bars .avg { position:absolute; left:0; right:0; height:0; border-top:1.5px dashed color-mix(in srgb, var(--nw-fg) 45%, transparent); pointer-events:none; }
.bars .cols span.stack { display:flex; flex-direction:column-reverse; overflow:hidden; background:none; gap:1px; }
.bars .cols span.stack i { display:block; min-height:0; }
.bars .stack .hc, .blegend .sw.hc { background:color-mix(in oklab, var(--nw-cold) 70%, var(--nw-bg)); }
.bars .stack .hp, .blegend .sw.hp { background:color-mix(in oklab, var(--hc-demand) 70%, var(--nw-bg)); }
.bars .stack .base, .blegend .sw.base { background:color-mix(in oklab, var(--nw-calm) 70%, var(--nw-bg)); }
.bars .stack.today { outline:2px solid color-mix(in srgb, var(--nw-fg) 55%, transparent); outline-offset:1px; }
.blegend { display:flex; flex-wrap:wrap; justify-content:center; gap:4px 14px; margin-top:6px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.blegend span { display:inline-flex; align-items:center; gap:6px; }
.blegend .sw { width:12px; height:8px; border-radius:2px; }
.blegend .sw.past { background:color-mix(in oklab, var(--hc-demand) 38%, var(--nw-bg)); } .blegend .sw.today { background:var(--hc-demand); }
.pellets .blegend .sw.past { background:color-mix(in oklab, var(--hc-stove) 40%, var(--nw-bg)); } .pellets .blegend .sw.today { background:var(--hc-stove); }
.blegend .sw.mean { height:0; border-radius:0; border-top:1.5px dashed color-mix(in srgb, var(--nw-fg) 45%, transparent); }
.rows { display:flex; flex-direction:column; }
.rows.boxed { padding:4px 14px; border-radius:16px; background:var(--hc-raised); }
.row { display:flex; gap:12px; align-items:flex-start; padding:10px 0; border-top:1px solid var(--nw-line-soft); font-size:var(--nw-fs-text); line-height:1.4; }
.row:first-child { border-top:0; }
.row > b { width:110px; flex:none; }
.row > span { color:color-mix(in srgb, var(--nw-fg) 84%, var(--nw-bg)); }
.row svg { width:20px; height:20px; flex:none; fill:none; stroke:var(--hc-stove); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.row.cold svg { stroke:var(--nw-cold); }
.chips { display:flex; flex-wrap:wrap; gap:8px; }
.chip { --c:var(--hc-off); flex:1 1 120px; min-width:0; height:44px; padding:0 10px; border-radius:14px; border:1px solid var(--nw-line); background:var(--hc-raised);
  font-size:var(--nw-fs-small); font-weight:650; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; white-space:nowrap;
  overflow:hidden; text-overflow:ellipsis; }
.chip .dot { width:8px; height:8px; border-radius:50%; flex:none; background:color-mix(in srgb, var(--nw-fg) 35%, var(--nw-bg)); }
.chip.stove { --c:var(--hc-stove); } .chip.cold { --c:var(--nw-cold); } .chip.calm { --c:var(--nw-calm); }
.chip.on { background:color-mix(in oklab, var(--c) 20%, var(--nw-bg)); border-color:color-mix(in oklab, var(--c) 60%, transparent); }
.chip.on .dot { background:var(--c); }
.chip:hover:not(:disabled) { border-color:color-mix(in srgb, var(--nw-fg) 30%, transparent); }
.chip:disabled { opacity:.55; cursor:not-allowed; }
.stock { display:flex; align-items:flex-end; justify-content:space-between; gap:16px; }
.stock .big { font-size:min(var(--nw-fs-value), 9cqi); font-weight:800; letter-spacing:-.03em; line-height:1.05; margin-top:4px; }
.stock .small { font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-top:6px; }
.sacks { flex:none; width:min(140px, 34cqi); height:auto; }
.sacks .sack { stroke:var(--nw-bg); stroke-width:1.2; }
.sacks .sack:not(.part) { fill:var(--hc-stove); }
.sacks stop.full { stop-color:var(--hc-stove); } .sacks stop.empty { stop-color:color-mix(in srgb, var(--nw-fg) 16%, var(--nw-bg)); }
.versus { display:grid; grid-template-columns:auto minmax(0, 1fr) auto; gap:10px; align-items:center; font-size:var(--nw-fs-small); }
.versus > span:not(.vb) { color:var(--nw-fg2); }
.versus b { text-align:right; white-space:nowrap; }
.vb { display:block; height:14px; } .vb i { display:block; height:100%; border-radius:7px; }
.vb .pellet { background:var(--hc-stove); } .vb .elec { background:var(--nw-cold); }
.saved { display:flex; align-items:baseline; gap:8px; flex-wrap:wrap; }
.saved b { font-size:var(--nw-fs-case); font-weight:800; letter-spacing:-.02em; }
.saved .good { color:color-mix(in oklab, var(--nw-calm) var(--nw-ink), var(--nw-fg)); } .saved .bad { color:color-mix(in oklab, var(--nw-alert) var(--nw-ink), var(--nw-fg)); }
.saved span { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.pot { display:flex; align-items:center; gap:12px; padding:14px; border-radius:18px; background:var(--hc-raised); }
.pring { position:relative; flex:none; width:60px; height:60px; }
.pring svg { display:block; width:60px; height:60px; }
.pring .bg { fill:none; stroke:color-mix(in srgb, var(--nw-fg) 14%, var(--nw-bg)); stroke-width:8; }
.pring .fg { fill:none; stroke:var(--hc-stove); stroke-width:8; stroke-linecap:round; transform:rotate(-90deg); transform-origin:32px 32px; }
.pring .fg.act { stroke:var(--nw-act); } .pring .fg.alert { stroke:var(--nw-alert); }
.pring span { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:var(--nw-fs-small); font-weight:800; }
.pt { display:flex; flex-direction:column; gap:4px; min-width:0; }
.pt b { font-size:var(--nw-fs-text); } .pt span { font-size:var(--nw-fs-small); line-height:1.4; color:var(--nw-fg2); }
.note.left { text-align:left; }
.link { border:0; background:none; padding:0; width:fit-content; color:var(--nw-accent); font-size:var(--nw-fs-small); font-weight:650; cursor:pointer; }

/* The stove's settings in its drawer (1.0.0b3): the flame, the fan, the \xC9CO Stop. */
.ctl { display:flex; flex-direction:column; gap:0; margin:10px 0; padding:4px 14px; border-radius:16px; background:var(--hc-raised); }
.ctl-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px 10px; padding:10px 0; border-top:1px solid var(--nw-line-soft); }
.ctl-row:first-child { border-top:0; }
.ctl-row { flex-wrap:nowrap; justify-content:space-between; }
.ctl-row:has(.ctl-say) { flex-wrap:wrap; }
.ctl-row > b { flex:none; font-size:var(--nw-fs-text); }
.segs, .steps { display:inline-flex; border:1px solid var(--nw-line); border-radius:12px; overflow:hidden; }
.seg, .step { height:36px; padding:0 12px; border:0; border-left:1px solid var(--nw-line); background:transparent; color:var(--nw-fg); font:inherit; font-size:var(--nw-fs-small); font-weight:650; cursor:pointer; }
.step { min-width:32px; padding:0 6px; }
/* 1.0.0b8: Auto (or the stove, Hestia) and the powers in one row; in Auto, the power Hestia set is outlined. */
.segs.one { flex:none; }
.segs.one .seg { height:34px; padding:0 10px; } .segs.one .step { padding:0 6px; }
.seg.cur { box-shadow:inset 0 0 0 1.5px color-mix(in srgb, var(--nw-fg) 55%, transparent); }
.seg:first-child, .step:first-child { border-left:0; }
.seg.on, .step.on { background:var(--nw-fg); color:var(--nw-bg); }
.seg:disabled, .step:disabled { opacity:.5; cursor:not-allowed; }
.ctl-say { flex-basis:100%; margin:0; font-size:var(--nw-fs-small); color:var(--nw-fg2); line-height:1.4; }
@container (max-width:380px) { .ctl-row { flex-wrap:wrap; } }
/* 1.0.1b2 (Frank, 26 Nov.): every compact card as high as the others. The name and the state's picture on one row, the
   sentence on one line under it (where the kind of heating was), two rows of buttons of the same height, three lines of
   legend; the clock's middle keeps only the temperature and the set point it goes to. */
.small .compact .chead { grid-template-columns:minmax(0, 1fr) auto; grid-template-rows:auto auto; row-gap:2px; align-items:center; }
.small .compact .chead .nw-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0; }
.small .compact .say.line { grid-column:1 / -1; margin:0; height:1.4em; line-height:1.4em; font-size:var(--nw-fs-body, 14px); font-weight:600;
  color:var(--nw-fg); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.small .compact .say.line.off { font-weight:500; color:var(--nw-fg2); }
.small .compact .say.line.alert { color:color-mix(in oklab, var(--nw-alert) var(--nw-ink, 60%), var(--nw-fg)); }
.small .compact .say.line.act { color:color-mix(in oklab, var(--nw-act) var(--nw-ink, 60%), var(--nw-fg)); }
.pill.art-pill { gap:5px; padding:0 11px 0 9px; height:32px;
  /* An outline that sets the pill off the card (1.1.0b3, Frank), drawn like the mode buttons' one. */
  border:1px solid color-mix(in oklab, var(--c) 75%, var(--nw-fg) 10%); }
.pill.art-pill.off { border-color:color-mix(in srgb, var(--nw-fg) 24%, transparent); }
.pill.art-pill .art { width:30px; height:auto; overflow:visible; display:block; }
/* The picture alone (no figure beside it): centred in its pill (1.1.0b3, Frank). */
.pill.art-pill.solo { padding:0 10px; justify-content:center; }
.pill.art-pill b { font-weight:700; font-variant-numeric:tabular-nums; }
.small .side .face { width:100%; height:calc(2 * var(--hc-row) + 6px); display:flex; flex-direction:column; justify-content:center; gap:6px; }
.small .side { --hc-row:46px; }
.small .side .face .modes { height:100%; grid-auto-rows:1fr; }
.small .side .mode { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0; padding:3px 4px; line-height:1.2; }
.small .side .mode .mt { font-size:11.5px; font-weight:600; color:var(--nw-fg2); font-variant-numeric:tabular-nums; }
.small .side .mode.on .mt { color:inherit; }
.mode .mt { margin-left:6px; font-weight:500; opacity:.75; font-variant-numeric:tabular-nums; }
.small .side .mode .mt { margin-left:0; opacity:1; }
.small .side .face .btns { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); grid-auto-rows:var(--hc-row); }
.small .side .face .btn { height:auto; }
.small .side .face .btn.pot { grid-column:1 / -1; min-height:0; padding:4px 14px; }
.small .side .face .btn.pot .pot-say small { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display:block; }
.small .side .face .btns > .btn:only-child, .small .side .face .btns > .btn:not(.pot) { grid-column:1 / -1; }
.legend.mini { display:flex; flex-direction:column; gap:5px; }
.legend.mini > div { display:flex; gap:16px; height:16px; align-items:center; white-space:nowrap; overflow:hidden; }
.compact .mid .to { display:flex; flex-direction:column; align-items:center; margin-top:1.5cqi; padding-top:1.5cqi; border-top:1px solid var(--nw-line);
  line-height:1.15; min-width:50%; }
.compact .mid .to span { font-size:max(9px, 4.6cqi); font-weight:600; color:var(--nw-fg2); }
.compact .mid .to b { font-size:max(11px, 6.6cqi); font-weight:700; color:color-mix(in oklab, var(--hc-set) 80%, var(--nw-fg)); font-variant-numeric:tabular-nums; }
.compact .mid .ct { font-size:max(18px, 10.5cqi); }
.compact .mid .to { margin-top:1cqi; padding-top:1cqi; }
/* 1.0.1b3 (Frank: \xAB bien \xE9tirable \xBB): a compact card stretched wide keeps its clock and its buttons at their size, and
   the room left goes to the side; the modes stay in two rows so that every card keeps the same height. */
.small .pair { grid-template-columns:minmax(140px, min(42%, 250px)) minmax(0, 1fr); }
@container (min-width:620px) { .small .side .modes { grid-template-columns:repeat(2, minmax(0, 1fr)); } }
.small .side .face, .small .side .legend.mini { max-width:420px; }
@container (max-width:380px) { .small .pair { grid-template-columns:1fr; } }
/* 1.0.1b3: a full card stretched wide keeps its clock at a readable size, centred, instead of filling the width. */
.top:not(.compact) > .wheel { width:100%; max-width:480px; margin:0 auto; }

/* 1.1.0b1, the house card made whole (Frank, 26 Nov.: \xAB pas assez carte compl\xE8te \xBB): three figures of now, who heats,
   the rooms with their heating of the day, today's money, the day at equal cold, and two folds. */
.house-now .tile { gap:3px; }
.house-now .tile .v { font-size:var(--nw-fs-case); font-weight:650; letter-spacing:-.015em; }
.who { display:flex; flex-direction:column; gap:8px; }
.who.quiet { margin:0; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.whobar { display:flex; gap:2px; height:10px; border-radius:5px; overflow:hidden; background:color-mix(in srgb, var(--nw-fg) 8%, transparent); }
.whobar i { display:block; min-width:4px; }
.whobar .st, .sw.st, .mcols .st { background:var(--hc-stove); }
.whobar .el, .sw.el, .mcols .el { background:color-mix(in oklab, var(--nw-heat) 78%, var(--nw-bg)); }
.wholines { display:flex; flex-wrap:wrap; gap:4px 16px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.wholines span { display:inline-flex; align-items:center; gap:6px; min-width:0; }
.wholines b { color:var(--nw-fg); font-weight:650; }
.rooms .room:has(.day) { grid-template-columns:minmax(0, 1fr) auto 72px 88px; }
.room .day { font-size:var(--nw-fs-small); color:var(--nw-fg2); font-variant-numeric:tabular-nums; text-align:right; white-space:nowrap; }
.hsec { display:flex; flex-direction:column; gap:10px; padding-top:12px; border-top:1px solid var(--nw-line-soft); }
.hsech { display:flex; align-items:baseline; justify-content:space-between; gap:10px; }
.hsech .big { font-size:var(--nw-fs-case); font-weight:700; font-variant-numeric:tabular-nums; }
.cells { display:grid; grid-template-columns:repeat(auto-fit, minmax(92px, 1fr)); gap:8px; }
.cell, .stat { display:flex; flex-direction:column; gap:2px; padding:10px 12px; border-radius:14px; background:var(--hc-raised); min-width:0; }
.cell b { font-size:var(--nw-fs-title); font-weight:700; font-variant-numeric:tabular-nums; }
.cell .k, .stat .k { font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.cell.el { box-shadow:inset 3px 0 0 color-mix(in oklab, var(--nw-heat) 78%, var(--nw-bg)); }
.cell.st { box-shadow:inset 3px 0 0 var(--hc-stove); }
.cell.ok b { color:color-mix(in oklab, var(--nw-calm) 75%, var(--nw-fg)); }
.cmp { display:grid; grid-template-columns:minmax(0, 1fr) auto; gap:6px 12px; font-size:var(--nw-fs-text); }
.cmp b { font-variant-numeric:tabular-nums; text-align:right; white-space:nowrap; }
.cmp b.good { color:color-mix(in oklab, var(--nw-calm) 75%, var(--nw-fg)); }
.cmp b.bad { color:color-mix(in oklab, var(--nw-alert) 70%, var(--nw-fg)); }
.cmp b.later { color:var(--nw-fg2); font-weight:500; }
.hsec .note, .hfold .note { margin:0; text-align:left; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.dbox.hfold { padding:0 0 4px; }
.stats { display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px; }
.stat b { font-size:var(--nw-fs-title); font-weight:700; }
.stat .k:first-child { font-size:var(--nw-fs-label); font-weight:650; letter-spacing:.08em; text-transform:uppercase; }
.month { display:flex; flex-direction:column; gap:8px; }
.mcols { position:relative; display:grid; grid-template-columns:repeat(var(--n), minmax(0, 1fr)); gap:clamp(1px, .6cqi, 4px); height:120px; align-items:end;
  padding:10px 10px 6px; border-radius:14px; background:var(--hc-raised); }
.mcols > span { display:flex; flex-direction:column-reverse; gap:1px; min-height:2px; border-radius:3px 3px 1px 1px; overflow:hidden; }
.mcols > span i { display:block; min-height:0; }
.mcols > span.today { outline:1.5px solid color-mix(in srgb, var(--nw-fg) 55%, transparent); outline-offset:1px; }
.mcols .cold { position:absolute; inset:10px 10px 6px; width:calc(100% - 20px); height:calc(100% - 16px); pointer-events:none; }
.mcols .cold polyline { stroke:color-mix(in srgb, var(--nw-fg) 55%, transparent); stroke-width:1.5; stroke-dasharray:3 4; }
.mlegend { display:flex; flex-wrap:wrap; gap:4px 14px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.mlegend span { display:inline-flex; align-items:center; gap:6px; }
.sw.cold { height:0; border-top:1.5px dashed color-mix(in srgb, var(--nw-fg) 55%, transparent); background:none; }
@container (max-width:420px) {
  .tiles.house-now { grid-template-columns:repeat(2, minmax(0, 1fr)); }
  .tiles.house-now .tile:last-child { grid-column:1 / -1; }
  .rooms .room:has(.day) { grid-template-columns:minmax(0, 1fr) auto 50px 76px; gap:6px; }
  .room:has(.day) .t { font-size:var(--nw-fs-small); }
}
.rhead { display:grid; grid-template-columns:minmax(0, 1fr) 72px 88px; gap:10px; padding:0 2px 2px; font-size:var(--nw-fs-label); color:var(--nw-fg2); white-space:nowrap; }
.rhead span:not(:first-child) { text-align:right; }
@container (max-width:420px) { .rhead { grid-template-columns:minmax(0, 1fr) 50px 76px; gap:6px; font-size:10px; } }

/* The announcements (1.1.0b6): Hestia Weather's bubble, under the stove's buttons, framed in the tone of the most urgent. */
.annonces { padding:12px 14px; border-radius:14px; background:color-mix(in oklab, var(--c) 10%, transparent);
  border:1px solid color-mix(in oklab, var(--c) 32%, transparent); }
.annonces.act { --c:var(--nw-act); } .annonces.alert { --c:var(--nw-alert); }
.small .compact .say.line.ticker { overflow:visible; text-overflow:clip; }
/* Hestia's question (1.1.0b8), with its buttons: on the card too, not only on the phone. */
.annonces.ask { display:grid; gap:6px; }
.annonces.ask p { margin:0; font-size:var(--nw-fs-body, 14px); line-height:1.4; }
.annonces.ask small { color:var(--nw-fg2); }
.ask-btns { display:flex; gap:8px; flex-wrap:wrap; }
.ask-btns .btn { flex:1 1 100px; height:40px; }
.ask-btns .btn.yes { border-color:var(--nw-act); background:color-mix(in oklab, var(--nw-act) 18%, var(--hc-raised2)); }
.ask.line { display:flex; align-items:center; gap:8px; min-width:0; }
.ask.line .ask-btns { flex-wrap:nowrap; }
.ask.line .ask-btns .btn { flex:0 0 auto; height:30px; padding:0 12px; }

/* The gas and the electricity found against the cold (1.1.0b7), under the \xAB who heats \xBB bar. */
.wholines.daily { margin-top:6px; }
.wholines.daily small { font-size:var(--nw-fs-label); color:var(--nw-fg2); }
.sw.gz { background:var(--hc-gaz, color-mix(in oklab, var(--nw-cold) 60%, var(--nw-act))); }
`;var Bn=[["thermostat","Ouvrir le thermostat"],["page","Ouvrir la page de la pi\xE8ce (onglet Chauffage)"],["none","Rien"]],Zt=[["complete","Compl\xE8te : l\u2019horloge du jour en grand, sa l\xE9gende"],["compacte","Compacte : l\u2019horloge en petit, \xE0 c\xF4t\xE9 de sa phrase"],["ligne","Une ligne : le nom, la temp\xE9rature, le mode"]],Nn={piece:"Pi\xE8ce",version:"Version",name:"Titre facultatif",tap_action:"Appui court"},Un={name:"Vide : le titre de la carte.",version:"La compacte tient environ deux fois moins de hauteur ; les chiffres de chaque heure restent au survol.",tap_action:"Sur la carte, ailleurs que sur un bouton ou une heure de l\u2019horloge."},Vn=[["maison","mdi:home-thermometer-outline","La maison","qui chauffe, chaque pi\xE8ce, le froid de la nuit"],["poele","mdi:fireplace","Le po\xEAle","son horloge du jour, sa flamme, ses boutons, les granul\xE9s et l\u2019argent"],["piece","mdi:thermometer","Une pi\xE8ce","son horloge du jour, sa chauffe, ses modes, ce qu\u2019elle co\xFBte"],["planning","mdi:calendar-clock","Le planning","la journ\xE9e de chaque pi\xE8ce et du po\xEAle"]],In=i=>{i.preventDefault(),history.pushState(null,"",i.currentTarget.getAttribute("href")??"/hestia/chauffage"),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))},it=class extends W{constructor(){super(...arguments);this.rooms=[];this.changed=e=>{e.stopPropagation();let t=e.detail.value;this.set({...t.piece?{piece:t.piece}:{},name:(t.name??"").trim(),court:t.version==="ligne",compacte:t.version==="compacte",...t.tap_action?{tap_action:t.tap_action}:{}})}}static{this.properties={hass:{attribute:!1},config:{state:!0},rooms:{state:!0}}}static{this.styles=ge`.note{color:var(--secondary-text-color);font-size:12px;line-height:1.6;margin:0 0 16px}a{color:var(--primary-color)}
  .formats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:4px 0 16px}
  .formats button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;color:var(--primary-text-color);font-size:12px;line-height:1.45}
  .formats button:hover{border-color:var(--secondary-text-color)}
  .formats button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .formats button.on{border:2px solid var(--primary-color);padding:9px 11px}
  .formats ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}.formats button.on ha-icon{color:var(--primary-color)}
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}`}setConfig(e){this.config={...e}}connectedCallback(){super.connectedCallback(),this.loadRooms()}async loadRooms(){try{let e=await this.hass?.callWS?.({type:"hestia_heating/view"});this.rooms=(e?.pieces??[]).map(t=>({id:t.id,nom:t.nom}))}catch{}}set(e){let t={...this.config,...e};t.name||delete t.name,t.card==="maison"&&delete t.card,t.card!=="piece"&&(delete t.piece,delete t.court,delete t.tap_action),t.card!=="piece"&&t.card!=="poele"&&delete t.compacte,t.court||delete t.court,(!t.compacte||t.court)&&delete t.compacte,t.tap_action==="thermostat"&&delete t.tap_action,this.config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}schema(e){let t=(s,r)=>({name:s,required:!0,selector:{select:{mode:"dropdown",options:r.map(([o,c])=>({value:o,label:c}))}}}),n=this.rooms.map(s=>[s.id,s.nom]);return this.config?.piece&&!n.some(([s])=>s===this.config.piece)&&n.push([this.config.piece,this.config.piece]),[...e==="piece"&&n.length?[t("piece",n)]:[],...e==="piece"?[t("version",Zt)]:e==="poele"?[t("version",Zt.slice(0,2))]:[],{name:"name",selector:{text:{}}},...e==="piece"?[{type:"expandable",name:"",title:"Fonctionnalit\xE9s",icon:"mdi:tune-variant",flatten:!0,expanded:!1,schema:[t("tap_action",Bn)]}]:[]]}render(){if(!this.config)return u;let e=this.config,t=e.card??"maison",n={piece:e.piece??this.rooms[0]?.id,version:e.court?"ligne":e.compacte?"compacte":"complete",name:e.name??"",tap_action:e.tap_action??"thermostat"};return l`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${In}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${Vn.map(([s,r,o,c])=>l`<button type="button" role="radio" aria-checked=${s===t}
     class=${s===t?"on":""} @click=${()=>{s!==t&&this.set({card:s,...s==="piece"&&!e.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{}})}}><ha-icon icon=${r}></ha-icon><b>${o}</b><span>${c}</span></button>`)}</div>
   <ha-form .hass=${this.hass} .data=${n} .schema=${this.schema(t)} .computeLabel=${s=>Nn[s.name]??s.name}
     .computeHelper=${s=>Un[s.name]??""} @value-changed=${this.changed}></ha-form>`}};customElements.get("hestia-heating-card-editor")||customElements.define("hestia-heating-card-editor",it);var le=new WeakMap;function Qt(i,a){le.get(i)===a&&le.delete(i),clearTimeout(a.closing),a.stop?.then(e=>e()).catch(()=>{})}function en(i,a,e,t){let n=le.get(i),s={view:a,error:e,reload:t};if(n){clearTimeout(n.closing),n.closing=void 0;let o=n.last;o&&queueMicrotask(()=>{n.listeners.has(s)&&a(o)})}else{let o={listeners:new Set};n=o,le.set(i,o),o.stop=i.subscribeMessage(c=>{if(c.reload){Qt(i,o);for(let h of[...o.listeners])h.reload();return}let p;if(c.changes){if(!o.last)return;p={...o.last,...c.changes};for(let h of c.removed??[])delete p[h]}else if(c.view)p=c.view;else return;o.last=p;for(let h of[...o.listeners])h.view(p)},{type:"hestia_heating/subscribe"}),o.stop.catch(c=>{le.get(i)===o&&le.delete(i);for(let p of[...o.listeners])p.error(c)})}let r=n;return r.listeners.add(s),()=>{!r.listeners.delete(s)||r.listeners.size||(clearTimeout(r.closing),r.closing=setTimeout(()=>{r.listeners.size||Qt(i,r)},5e3))}}var tn=i=>(...a)=>({_$litDirective$:i,values:a}),Le=class{constructor(a){}get _$AU(){return this._$AM._$AU}_$AT(a,e,t){this._$Ct=a,this._$AM=e,this._$Ci=t}_$AS(a,e){return this.update(a,e)}update(a,e){return this.render(...e)}};var{I:es}=Kt;var Gn={},nn=(i,a=Gn)=>i._$AH=a;var rt=tn(class extends Le{constructor(){super(...arguments),this.key=u}render(i,a){return this.key=i,a}update(i,[a,e]){return a!==this.key&&(nn(i),this.key=a),e}});var an=5e3,Kn=40,Yn=40,Xn=.2,Jn="hc-marquee",sn=typeof HTMLElement>"u"?void 0:class extends HTMLElement{constructor(){super(...arguments);this.round=0}connectedCallback(){this.observer??=new ResizeObserver(()=>this.measure()),this.observer.observe(this);let e=this.firstElementChild;e&&this.observer.observe(e)}disconnectedCallback(){this.observer?.disconnect()}measure(){let e=this.firstElementChild;if(!e||!this.clientWidth)return;let t=this.hasAttribute("moving"),n=e.offsetWidth;if(n<=this.clientWidth+1){t&&(this.removeAttribute("moving"),this.tell(0));return}let s=n+Yn,r=Math.round(s/Kn/(1-Xn)*10)/10;this.style.setProperty("--hc-run",`${s}px`),this.style.setProperty("--hc-run-time",`${r}s`),t||this.setAttribute("moving",""),r*1e3!==this.round&&this.tell(r*1e3)}tell(e){this.round=e,this.dispatchEvent(new CustomEvent(Jn,{bubbles:!0,detail:e}))}};sn&&!customElements.get("hestia-heating-marquee")&&customElements.define("hestia-heating-marquee",sn);var Zn=i=>l`<hestia-heating-marquee><span class="run">${i}</span><span class="run" aria-hidden="true">${i}</span></hestia-heating-marquee>`,ot=class extends W{constructor(){super(...arguments);this.points=[];this.line=!1;this.index=0;this.leaving=!1;this.rounds=new Map;this.roundDone=!1;this.waiting=!1;this.measured=e=>{this.shown!==void 0&&(this.rounds.set(this.shown,e.detail),this.requestUpdate())};this.lap=e=>{e.animationName!=="hc-run"||e.target.previousElementSibling||(this.roundDone=!0,this.waiting&&(this.next(),this.start()))}}static{this.properties={points:{attribute:!1},line:{type:Boolean,reflect:!0},index:{state:!0},leaving:{state:!0}}}connectedCallback(){super.connectedCallback(),this.leaving=!1,this.start()}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this.timer),clearTimeout(this.swap)}start(){clearInterval(this.timer),this.timer=setInterval(()=>this.next(),an)}get reduced(){return matchMedia("(prefers-reduced-motion: reduce)").matches}willUpdate(e){if(!e.has("points"))return;let t=this.points.findIndex(n=>n.texte===this.shown);if(t>=0){this.index=t;return}if(this.shown===void 0||this.reduced){this.index=0;return}this.leaving=!0,clearTimeout(this.swap),this.swap=setTimeout(()=>{this.index=0,this.leaving=!1},300)}next(){let e=this.getRootNode().host;if(this.points.length<2||document.hidden||e?.matches(":hover, :focus-within"))return;if((this.renderRoot.querySelector("hestia-heating-marquee")?.round??0)&&!this.roundDone){this.waiting=!0;return}this.waiting=!1;let n=()=>{this.index=(this.index+1)%this.points.length,this.leaving=!1};if(this.reduced){n();return}this.leaving=!0,this.swap=setTimeout(n,350)}render(){let e=this.points[this.index%Math.max(1,this.points.length)];if(e?.texte!==this.shown&&(this.roundDone=!1),this.shown=e?.texte,!e)return u;let t=this.index%this.points.length,n=this.points.length>1;return l`<div class=${"say "+e.ton} aria-hidden="true" @hc-marquee=${this.measured} @animationiteration=${this.lap}>
   ${rt(t,l`<div class=${"item"+(this.leaving?" out":"")}>${this.line?l`<i class="dot"></i>`:l`<span class="badge"><ha-icon icon=${e.icone}></ha-icon></span>`}
    <div class="txt">${this.line?u:l`<div class="when">${e.label}</div>`}<div class="x">${Zn(e.texte)}</div></div></div>`)}
   ${n?l`<span class="progress" style=${`--step:${Math.max(an,this.rounds.get(e.texte)??0)}ms`}>${this.points.map((s,r)=>r===t?rt(`on-${t}`,l`<i class="on"></i>`):l`<i class=${r<t?"done":""}></i>`)}</span>`:u}</div>
  <ul class="sr" role="status">${this.points.map(s=>l`<li>${s.label} : ${s.texte}</li>`)}</ul>`}static{this.styles=ge`
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
 `}};typeof customElements<"u"&&!customElements.get("hestia-heating-ticker")&&customElements.define("hestia-heating-ticker",ot);var Qn=440,ea=386,B=220,N=193,$e=64,rn=76,lt=40,De=128,dt=142,ut=28,Oe=184,ta=190,pn=1200,We=dt+ut+4,na=5,_=i=>i.toFixed(1),Fe=i=>(i%1440+1440)%1440;function H(i,a){let e=Fe(a)/1440*2*Math.PI-Math.PI/2;return[B+i*Math.cos(e),N+i*Math.sin(e)]}function on(i,a,e){let[t,n]=H(i,a),[s,r]=H(i,e);return`M${_(t)} ${_(n)}A${i} ${i} 0 ${e-a>720?1:0} 1 ${_(s)} ${_(r)}`}function ct(i,a,e,t){let[n,s]=H(i,e),[r,o]=H(a,e),[c,p]=H(a,t),[h,m]=H(i,t);return`M${_(n)} ${_(s)}L${_(r)} ${_(o)}A${a} ${a} 0 0 1 ${_(c)} ${_(p)}L${_(h)} ${_(m)}A${i} ${i} 0 0 0 ${_(n)} ${_(s)}Z`}function K(i,a,e,t=na){let n=[],s=0,r=null;for(let o=a;o<=e;o+=t){for(;s<i.length&&i[s][0]<=o;)r=i[s][1],s++;n.push([o,r])}return n}function aa(i){let a=[],e=null;for(let[t,n]of i){if(n==null){e=null;continue}e||(e=[],a.push(e)),e.push([t,n])}return a}var ht=i=>i.map(a=>a[1]).filter(a=>a!=null),pt=i=>i.length?i.reduce((a,e)=>a+e,0)/i.length:null;function mt(i,a,e){let t=i.length-Fe(i.start+i.length);return Array.from({length:24},(n,s)=>{let r=Fe(s*60-i.start),o=Math.min(r+60,i.length),c=v=>v&&r<o?ht(K(v,r,Math.max(r,o-1))):[],p=e.level?c(e.level):[],h=p.filter(v=>v>0),m=c(e.sets),x=s*60+30;return{k:s,from:r,to:o,current:r<i.length&&r+60>i.length,yesterday:r<t,ahead:r<i.length-pn,ton:a.find(v=>v.de<=x&&x<v.a)?.ton??null,temp:pt(c(e.temp)),heat:pt(c(e.heat)),burn:p.length?h.length/p.length:null,level:pt(h),set:m.length?m[m.length-1]:null,energy:e.energy.find(([v])=>Math.abs(v-r)<=1)?.[1]??null}})}var sa=3,ia=5,ln=1.6,cn=i=>`${i.toLocaleString("fr-FR",{maximumFractionDigits:1})}\xB0`,ra=i=>6*i.length+4,oa=11;function gt(i,a){let{span:e,series:t}=i,n=e.length,s=Math.max(0,n-pn),r=d=>e.start+d,o=K(t.temp,s,n),c=ht(o),p=c.length?Math.min(...c)-sa:-1/0,h=K(t.sets,s,n).map(([d,b])=>[d,b!=null&&b>=p?Math.round(b*2)/2:null]),m=[...new Set(ht(h))].sort((d,b)=>b-d).slice(0,3),x=[...c,...m],v=x.length?Math.floor(Math.min(...x)-.5):16,$=x.length?Math.ceil(Math.max(...x)+.5):22;if($-v<3){let d=($+v)/2;v=Math.floor(d-1.5),$=v+3}let C=d=>rn+Math.max(0,Math.min(1,(d-v)/($-v)))*lt,w=aa(o).filter(d=>d.length>1),f=d=>d.map(([b,y],z)=>{let[J,Z]=H(C(y),r(b));return`${z?"L":"M"}${_(J)} ${_(Z)}`}).join(""),M=w.map(d=>f(d)+d.slice().reverse().map(([b])=>{let[y,z]=H($e+2,r(b));return`L${_(y)} ${_(z)}`}).join("")+"Z").join(""),j="",P=null;for(let[d,b]of h){if(b==null||!m.includes(b)){P=null;continue}let[y,z]=H(C(b),r(d));if(P==null)j+=`M${_(y)} ${_(z)}`;else{if(b!==P){let[J,Z]=H(C(P),r(d));j+=`L${_(J)} ${_(Z)}`}j+=`L${_(y)} ${_(z)}`}P=b}let k=e.start+(n+s+1440)/2,L=$-v,D=[1,2,5,10].find(d=>d*lt/L>=12)??10,T=[];if(w.length)for(let d=Math.ceil(v/D)*D;d<=$;d+=D)m.some(b=>Math.abs(b-d)<=D/2)||T.push(d);let E=[...m.map(d=>({t:d,set:!0})),...T.map(d=>({t:d,set:!1}))].sort((d,b)=>d.t-b.t),U=(d,b)=>Math.abs(d.x-b.x)<(d.w+b.w)/2+2&&Math.abs(d.y-b.y)<oa,pe=(d,b)=>d.map((y,z)=>{let[J,Z]=H(C(y.t),k+(z-(d.length-1)/2)*b);return{...y,x:J,y:Z,w:ra(cn(y.t))}}),_e=d=>d.every((b,y)=>d.slice(y+1).every(z=>!U(b,z))),ye=[];for(let d of[E,E.filter((b,y)=>b.set||y%2===0),E.filter(b=>b.set)]){let b=[0,12,-12,24,-24,36,-36].find(y=>(d.length-1)/2*Math.abs(y)<=80&&_e(pe(d,y)));if(b!=null){ye=pe(d,b);break}}let de=w.length?w[w.length-1][w[w.length-1].length-1]:null,[ke,Ae]=de?H(C(de[1]),r(de[0])):[0,0],[A,O]=H($e+4,e.now),[X,ue]=H(De,e.now),ie=i.pick,V=i.hours[ie??i.last??-1],Ct=d=>{let b=Math.abs(d-ie);return Math.min(b,24-b)},jt=d=>ie==null?"":Ct(d)===0?" on":Ct(d)===1?" near":" far",_n=i.hours.find(d=>d.current)?.k??Math.floor(Fe(e.now)/60),yn=i.pin??ie??_n,Ee=null;if(V&&!V.ahead){let d=Math.min(V.from+30,V.to-1),b=K(t.temp,d,d)[0]?.[1];b!=null&&d>=s&&(Ee=H(C(b),r(d)))}let re=V?i.say(V):null,kn=Math.max(2,i.max??5),An=d=>["confort","eco","poele","boost"].includes(d)?d:"off",En=(d,b)=>{let y=z=>{d.preventDefault(),d.currentTarget.parentNode?.querySelector(`.hit[data-k="${z}"]`)?.focus()};d.key==="Enter"||d.key===" "?(d.preventDefault(),d.stopPropagation(),i.onPin(i.pin===b?void 0:b)):d.key==="Escape"?i.pin!=null&&(d.stopPropagation(),i.onPin(void 0)):d.key==="ArrowRight"||d.key==="ArrowDown"?y((b+1)%24):(d.key==="ArrowLeft"||d.key==="ArrowUp")&&y((b+23)%24)},Sn=d=>{i.tap&&(d.key==="Enter"||d.key===" ")&&(d.preventDefault(),i.tap.run(d))},Cn=d=>{i.pin!=null&&(d.stopPropagation(),i.onPin(void 0))};return l`<div class=${"wheel"+(ie!=null?" picking":"")}><svg viewBox=${i.tight?`${B-We} ${N-We} ${2*We} ${2*We}`:`0 0 ${Qn} ${ea}`} role="group" aria-label=${i.label}
   @pointerleave=${()=>i.onHover(void 0)}>
  <defs><radialGradient id="hcArea" cx=${B} cy=${N} r=${rn+lt} gradientUnits="userSpaceOnUse">
   <stop class="gs0" offset=".52"></stop><stop class="gs1" offset="1"></stop></radialGradient></defs>
  <path class="lit" d=${V?ct($e+2,dt+ut+18,V.k*60+1,V.k*60+59):""}></path>
  ${i.hours.map(d=>{let b=d.k*60+3,y=d.k*60+57;return S`<g class=${"cell"+jt(d.k)}><path class="t-none" d=${on(De,b,y)}></path>${i.segments.filter(z=>z.a>b&&z.de<y).map(z=>S`<path class=${"t-"+An(z.ton)} d=${on(De,Math.max(b,z.de),Math.min(y,z.a))}></path>`)}</g>`})}
  ${T.map(d=>S`<circle class="grid" cx=${B} cy=${N} r=${_(C(d))}></circle>`)}
  ${M?S`<path class="area" fill="url(#hcArea)" d=${M}></path>`:u}
  ${w.length?S`<path class="trace" pathLength="1" d=${w.map(f).join("")}></path>`:u}
  ${j?S`<path class="set" d=${j}></path>`:u}
  ${i.hours.map(d=>{let b=i.kind==="flame",y=b?kn:ia,z=d.ahead?0:b?d.burn!=null&&d.burn>0&&d.level!=null?Math.max(1,Math.min(y,Math.round(d.level))):0:d.heat==null||d.heat<.02?0:Math.max(1,Math.min(y,Math.ceil(d.heat*y-.001))),J=d.k*60+6,Z=d.k*60+54,Mt=(ut-(y-1)*ln)/y;return S`<g class=${"steps "+i.kind+(d.ahead?" ahead":"")+jt(d.k)} style=${`animation-delay:${d.k*22}ms`}>${Array.from({length:y},(ja,Se)=>{let Pt=dt+Se*(Mt+ln);return S`<path class=${Se<z?"blk on":"blk"} style=${Se<z?`--p:${y>1?Math.round(Se/(y-1)*100):100}%`:u} d=${ct(Pt,Pt+Mt,J,Z)}></path>`})}</g>`})}
  ${ye.map(d=>S`<text class=${d.set?"gt set":"gt"} x=${_(d.x)} y=${_(d.y)}>${cn(d.t)}</text>`)}
  <line class="hand" x1=${_(A)} y1=${_(O)} x2=${_(X)} y2=${_(ue)}></line>
  ${de?S`<circle class="now" cx=${_(ke)} cy=${_(Ae)} r="4.5"></circle>`:u}
  <circle class=${"tdot"+(Ee&&ie!=null?" on":"")} cx=${_(Ee?.[0]??B)} cy=${_(Ee?.[1]??N)} r="5.5"></circle>
  ${i.marks.map(d=>{let[b,y]=H(De,d.at);return S`<circle class=${"mark "+d.cls} cx=${_(b)} cy=${_(y)} r="5.5"></circle>`})}
  <circle class="ping" cx=${_(X)} cy=${_(ue)} r="4"></circle><circle class="knob" cx=${_(X)} cy=${_(ue)} r="7"></circle>
  <circle class="disc" cx=${B} cy=${N} r=${$e} role=${i.tap?"button":u} tabindex=${i.tap?0:u}
   aria-label=${i.tap?.label??u} @keydown=${Sn} @click=${Cn}></circle>
  <text class="hl" x=${B} y=${N-Oe}>0 h</text><text class="hl" x=${B+Oe} y=${N}>6 h</text>
  <text class="hl" x=${B} y=${N+Oe}>12 h</text><text class="hl" x=${B-Oe} y=${N}>18 h</text>
  ${i.hours.map(d=>{let b=i.say(d);return S`<path class="hit" data-k=${d.k} role="button" tabindex=${d.k===yn?0:-1} aria-pressed=${i.pin===d.k?"true":"false"}
    aria-label=${`${b.range} : ${b.value}, ${b.lines.filter(Boolean).join(", ")}`} d=${ct($e,ta,d.k*60,d.k*60+60)}
    @pointerenter=${()=>i.onHover(d.k)} @focus=${()=>i.onHover(d.k)} @blur=${()=>i.onHover(void 0)}
    @click=${y=>{y.stopPropagation(),i.onPin(i.pin===d.k?void 0:d.k)}} @keydown=${y=>En(y,d.k)}></path>`})}
 </svg><div class="mid"><div class="rest">${a}</div>
  <div class="pick">${re?l`<div class="ph">${re.range}</div><div class=${"pv"+(re.word?" word":"")}>${re.value}</div>
   <div class="pl">${re.lines[0]}</div><div class="pl dim">${re.lines[1]}</div>`:u}</div></div></div>`}var q=(i,a,e,t,n)=>`M${i+n} ${a}h${e-2*n}a${n} ${n} 0 0 1 ${n} ${n}v${t-2*n}a${n} ${n} 0 0 1 ${-n} ${n}h${-(e-2*n)}a${n} ${n} 0 0 1 ${-n} ${-n}v${-(t-2*n)}a${n} ${n} 0 0 1 ${n} ${-n}z`,ft=(i,a,e)=>`M${i-e} ${a}a${e} ${e} 0 1 0 ${2*e} 0a${e} ${e} 0 1 0 ${-2*e} 0`,dn=(i,a,e="")=>i.map((t,n)=>S`<path class=${`wave rise r${n} ${e}`} d=${`M${t} ${a}c-3-3 3-5 0-8c-3-3 3-5 0-8`}></path>`);function la(i){return S`${[0,1,2,3,4,5].map(a=>S`<path class="metal" d=${q(6+a*8.8,18,7,24,3)}></path>`)}
  <path class="foot" d=${q(4,39,56,3,1.5)+q(9,42,4,5,1)+q(51,42,4,5,1)}></path>
  <path class=${"led"+(i?" on":"")} d=${ft(57.5,23,1.8)}></path>${i?dn([17,32,47],16):u}`}function ca(i){return S`<path class="pipe" d="M8 44H14V40M50 40V44H58M12 21.5H7"></path>
  ${[0,1,2,3,4].map(a=>S`<path class="metal" d=${q(13+a*8,17,6.5,26,3.25)}></path>`)}
  <path class="foot" d=${q(12,20,42,3,1.5)+q(12,37,42,3,1.5)}></path><path class="valve" d=${q(1,16,7,11,3)}></path>
  <path class=${"led"+(i?" on":"")} d=${q(2.5,18,4,1.6,.8)+q(2.5,21,4,1.6,.8)}></path>${i?dn([22,33,44],16):u}`}function pa(i){return S`<path class="metal" d=${q(6,10,52,20,6)}></path><path class="foot" d=${q(6,23,52,7,3)}></path>
  <path class="slot" d=${q(12,25,40,2.5,1.25)}></path><path class=${"led"+(i?" on "+i:"")} d=${ft(50,16,1.8)}></path>
  ${i?[18,32,46].map((a,e)=>S`<path class=${`wave blow r${e} ${i}`} d=${`M${a} 33c3 3-3 5 0 8c3 3-3 5 0 8`}></path>`):u}`}var da="M50 140C15 140 4 110 10 86C16 62 34 52 38 28C40 16 46 6 50 0C56 18 72 30 80 52C88 72 96 92 90 112C84 130 70 140 50 140Z",ua="M50 140C28 140 20 118 24 100C28 84 40 76 44 58C50 70 62 80 68 96C74 112 72 140 50 140Z",ha="M50 140C38 140 34 128 36 118C38 108 46 102 48 92C54 102 62 110 62 122C62 134 58 140 50 140Z";function Be(i,a,e){let t=i>0?.035+.1*Math.min(1,i/Math.max(1,a)):0,n=`translate(${(32-50*t).toFixed(2)} ${(37-140*t).toFixed(2)}) scale(${t.toFixed(3)})`;return S`<defs><linearGradient id="hcFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9733f"></stop>
  <stop offset=".6" stop-color="#f1a066"></stop><stop offset="1" stop-color="#f4ca84" stop-opacity=".75"></stop></linearGradient></defs>
  <path class="s-pipe" d=${q(37,2,6,10,1)}></path><path class="s-body" d=${q(15,13,34,32,4)}></path>
  <path class="s-top" d=${q(13,10,38,5,2)}></path><path class="s-glass" d=${q(20,18,24,21,3)}></path>
  <path class=${"s-bed"+(e?" on":"")} d=${q(23,35,18,3,1.5)}></path>
  ${t?S`<g transform=${n}><path class="flick" fill="url(#hcFlame)" d=${da}></path><path class="flick2 s-f2" d=${ua}></path>
   <path class="flick s-f3" d=${ha}></path></g>`:u}
  <path class="s-pipe" d=${q(18,45,5,5,1)+q(41,45,5,5,1)}></path><path class=${"s-led"+(e?" on":"")} d=${ft(45,12.5,1.6)}></path>`}function un(i,a){let e=a==="chauffe";return i==="vanne"?ca(e):i==="clim"||i==="pac"?pa(e?"heat":a==="rafraichit"?"cool":null):la(e)}function hn(i,a){let e=a==="chauffe";return i==="vanne"?e?24:30:i==="clim"||i==="pac"?e||a==="rafraichit"?29.5:20:e?23.5:32.5}function vt(i,a,e){return l`<svg class="art" viewBox="0 0 64 52" aria-hidden="true">${i}</svg><div class="ct">${a}</div>${e?l`<div class="cs">${e}</div>`:u}`}function wt(i,a){let e=t=>t.toLocaleString("fr-FR",{maximumFractionDigits:1}).replace("-","\u2212");return l`<div class="ct">${i!=null?`${e(i)}\xB0`:"\u2014"}</div>${a!=null?l`<div class="to"><span>consigne</span><b>${e(a)}°</b></div>`:u}`}var ma={reservoir:["R\xE9servoir vide ?","mdi:grain"],indisponible:["Ne r\xE9pond plus","mdi:lan-disconnect"],ventilation:["Ventilation","mdi:fan-alert"],sonde:["Sonde de la pi\xE8ce","mdi:thermometer-alert"],enregistrement:["Recorder","mdi:database-alert"],briques:["Briques Hestia-FB","mdi:link-variant-off"]},mn=i=>i.pilote?.mode==="flamme"||i.pilote?.mode==="entier"&&!i.pilote.flamme_manuelle,gn=["maison","poele","piece","planning"],fn=["thermostat","page","none"],g=(i,a=1)=>i.toLocaleString("fr-FR",{maximumFractionDigits:a}).replace("-","\u2212"),F=i=>i==null?"\u2014":`${g(i)} \xB0C`,bt=i=>i==null?"\u2014":i>=500?`${g(i/1e3)} kW`:`${g(i,0)} W`,R=i=>i>=100?`${g(i,0)} \u20AC`:`${i.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} \u20AC`,xt=i=>i&&i[0].toUpperCase()+i.slice(1),Y=i=>{let a=Math.round(i);return a<60?`${a} min`:`${Math.floor(a/60)} h${a%60?` ${String(a%60).padStart(2,"0")}`:""}`},ce=i=>i.getMinutes()?`${i.getHours()} h ${String(i.getMinutes()).padStart(2,"0")}`:`${i.getHours()} h`,At=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],ga=["di","lu","ma","me","je","ve","sa"],vn=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"];function $t(i){let a=new Date(i),e=new Date,t=new Date(e);return t.setDate(t.getDate()+1),a.toDateString()===e.toDateString()?ce(a):a.toDateString()===t.toDateString()?`demain ${ce(a)}`:`${At[a.getDay()]} ${ce(a)}`}var fa=i=>+i.slice(11,13)*60+ +i.slice(14,16),Et=i=>{let a=fa(i);return a%60?`${Math.floor(a/60)} h ${String(a%60).padStart(2,"0")}`:`${a/60} h`},va=(i,a)=>!a||i.slice(0,10)===a?Et(i):`demain ${Et(i)}`,Ne=i=>{let[a,e,t]=i.split("-").map(Number);return new Date(a,e-1,t)},wn={eteint:"\xE9teint",allumage:"allumage",chauffe:"chauffe",nettoyage:"nettoyage",extinction:"extinction",alarme:"alarme",inconnu:"inconnu"},Ue={poele:"po\xEAle en chauffe",confort:"confort",eco:"\xE9co",hors_gel:"hors gel",boost:"boost",arret:"arr\xEAt"},wa={poele:"En chauffe",confort:"Confort",eco:"\xC9co",hors_gel:"Hors gel",boost:"Boost",arret:"Arr\xEAt"},ba={radiateur:"Radiateur \xE9lectrique",vanne:"Radiateur \xE0 eau",clim:"Climatisation",pac:"Pompe \xE0 chaleur",poele:"Po\xEAle",autre:"Chauffage"},Ie={frost:"Hors gel",eco:"\xC9co",comfort:"Confort",boost:"Boost",away:"Absent",sleep:"Nuit",home:"Pr\xE9sent",activity:"Activit\xE9"},_t={frost:"off",eco:"cold",comfort:"heat",boost:"act",away:"off",sleep:"cold",home:"heat",activity:"act"},bn=Object.keys(Ie),xn=i=>{let a=bn.indexOf(i);return a<0?bn.length:a},yt=1e4,xa=5e3,$a=4.176,_a=6e5,Ve=i=>i.prix_energie?.kwh??i.prix_kwh??null,ya=(i,a)=>i.prix_energie?.kwh!=null?`Prix de Hestia \xC9nergie en ce moment${i.prix_energie.periode?` (${Ge[i.prix_energie.periode]??i.prix_energie.periode})`:""} : ${g(a,4)} \u20AC le kWh, en attendant ses prix heure par heure`:`Prix des r\xE9glages : ${g(a,4)} \u20AC le kWh`,$n=["hc","hp","base"],Ge={hc:"heures creuses",hp:"heures pleines",base:"tarif unique"},ka=S`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"></path><circle cx="16" cy="7" r="2"></circle><circle cx="10" cy="17" r="2"></circle></svg>`,kt=S`<svg class="wv" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M8 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M12 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2"></path></svg>`,Aa=S`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"></path></svg>`,Ea=S`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l6 6M17 7l-6 6M5 21l4.5-1.5 4-4-3-3-4 4z"></path></svg>`,Sa=S`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,Ca=S`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v10M8 7v10M12 7v10M16 7v10M20 7v10M2 19h20M2 5h20"></path></svg>`,St=class extends W{constructor(){super();this._config={type:"custom:hestia-heating-card",card:"maison"};this._dayAt=0;this._dayFor="";this._histAt=0;this._histFor="";this._figAt=0;this._drawers={},this._tabs={}}static{this.styles=[me(Xt),me(Jt)]}static{this.properties={_view:{state:!0},_day:{state:!0},_hist:{state:!0},_error:{state:!0},_pending:{state:!0},_refused:{state:!0},_drawers:{state:!0},_tabs:{state:!0},_fig:{state:!0},_confirm:{state:!0},_busy:{state:!0},_hover:{state:!0},_pin:{state:!0}}}static getStubConfig(){return{card:"maison"}}static getConfigElement(){return document.createElement("hestia-heating-card-editor")}setConfig(e){let t=e.card??"maison";if(!gn.includes(t))throw new Error(`card: ${t} ? (${gn.join(", ")})`);if(e.tap_action!=null&&!fn.includes(e.tap_action))throw new Error(`tap_action: ${e.tap_action} ? (${fn.join(", ")})`);this._config={...e,card:t}}getCardSize(){let e=this._config.card,t=!!this._config.compacte;return e==="piece"&&this._config.court?2:e==="piece"?t?6:11:e==="poele"?t?7:13:e==="planning"?6:5}getGridOptions(){return this._config.card==="planning"?{columns:"full",rows:"auto"}:{columns:12,rows:"auto",min_columns:6}}set hass(e){let t=this._hass?.connection!==e.connection;this._hass=e,this.setAttribute("theme",e.themes?.darkMode===!1?"light":"dark"),(t||!this._stop)&&this._follow()}connectedCallback(){super.connectedCallback(),this._follow()}disconnectedCallback(){super.disconnectedCallback(),this._unfollow()}_unfollow(){this._stop?.(),this._stop=void 0,window.clearTimeout(this._again)}_follow(){this._unfollow(),!(!this._hass||!this.isConnected)&&(this._stop=en(this._hass.connection,e=>{this._view=e,this._error=void 0,this._maybeDay()},e=>{this._stop=void 0,this._error=e.message??"Hestia Chauffage ne r\xE9pond pas.",this._again=window.setTimeout(()=>this._follow(),3e4)},()=>{this._stop=void 0,this._again=window.setTimeout(()=>this._follow(),2e3)}))}_maybeDay(){let e=this._config,t=this._view,n=e.card==="piece"&&!e.court&&t?this._roomOf(t):void 0;e.card==="maison"&&this._hass&&Date.now()-this._figAt>=12e4&&(this._figAt=Date.now(),this._hass.callWS({type:"hestia_heating/maison"}).then(o=>{this._fig=o}).catch(()=>{}));let s=e.card==="poele"?"poele":n?`piece/${n.id}`:"";if(!s||!this._hass)return;s!==this._dayFor&&(this._day=void 0,this._hover=this._pin=void 0),s!==this._histFor&&(this._hist=void 0),(s!==this._dayFor||Date.now()-this._dayAt>=12e4)&&(this._dayFor=s,this._dayAt=Date.now(),this._hass.callWS({type:"hestia_heating/day",cible:s,heures:24}).then(o=>{this._day=o}).catch(()=>{}));let r=!!t?.prix_energie&&!!this._hist?.stat&&!this._hist.energie&&Date.now()-this._histAt>=6e4;(s!==this._histFor||r||Date.now()-this._histAt>=_a)&&(this._histFor=s,this._histAt=Date.now(),this._hass.callWS({type:"hestia_heating/historique",cible:s}).then(o=>{this._hist=o}).catch(()=>{}))}_open(e){history.pushState(null,"","/hestia/chauffage"+(e?"/"+e:"")),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}_info(e,t){return l`<button class="nw-info" aria-label=${t} @click=${()=>this._open(e)}></button>`}_chip(e){return l`<span class=${"nw-chip "+e.ton}>${e.texte}</span>`}_more(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){let e=this._view;if(this._error)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;if(!e||!e.pret)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;let t=this._config.card;if(t==="piece"){let n=this._roomOf(e),s=n&&this._tapAction(n),r=n&&!this._config.court;return r&&this._config.compacte?l`<ha-card class=${"clock small "+(this._unfolded()?"open":"folded")} @click=${o=>this._compactClick(o,n)}>${this._room(e)}</ha-card>`:l`<ha-card class=${(s?"tap ":"")+(r?"clock":"")} @click=${s?o=>this._tap(o,n):u}>${this._room(e)}</ha-card>`}return t==="poele"&&e.poele&&this._config.compacte?l`<ha-card class=${"clock small "+(this._unfolded()?"open":"folded")} @click=${n=>this._compactClick(n)}>${this._stove(e)}</ha-card>`:t==="poele"?l`<ha-card class=${e.poele?"clock":""}>${this._stove(e)}</ha-card>`:l`<ha-card>${t==="planning"?this._planning(e):this._house(e)}</ha-card>`}_head(e,t,n){return l`<div class="chead"><div class="ttl"><h2 class="nw-title">${e}</h2>${t?l`<div class="sub">${t}</div>`:u}</div>
   <div class="pills">${n}</div></div>`}_foot(e,t,n){return l`<div class="foot" @click=${s=>s.stopPropagation()}><button class="nw-badge setb" aria-label=${t} @click=${()=>this._open(e)}>${ka}${n}</button></div>`}_unfolded(){return!!this._drawers.carte}_fold(){this._drawers={...this._drawers,carte:!this._unfolded()}}_compactClick(e,t){let n=e.composedPath(),s=(r,o)=>r instanceof Element&&r!==e.currentTarget&&o(r);if(!n.some(r=>s(r,o=>o.tagName==="BUTTON"||o.tagName==="A"||o.classList.contains("unfold")))){if(n.some(r=>s(r,o=>o.classList.contains("wheel")))){t&&this._tap(e,t);return}this._fold()}}_compact(e){let t=this._unfolded();return l`<div class="glow" style=${`--c:var(${e.tone})`} aria-hidden="true"></div>
   <div class="top compact"><div class="chead"><h2 class="nw-title">${e.title}</h2><div class="pills">${e.pill}</div>
     ${e.ticker?l`<div class="say line ticker">${e.ticker}</div>`:l`<p class=${"say line "+(e.say?.ton??"")} title=${e.say?.texte??""}>${e.say?.texte??""}</p>`}</div>
    <div class="pair">${e.clock}<div class="side"><div class="face">${e.side}</div>${e.legend}</div></div>
   </div>
   ${t?l`<div class="unfold">${e.body()}</div>`:u}
   <button class="handle" aria-expanded=${t?"true":"false"} aria-label=${t?"Replier la carte":"D\xE9plier la carte"}
    @click=${n=>{n.stopPropagation(),this._fold()}}><i></i></button>`}_artPill(e,t,n,s,r=25){return l`<span class=${"pill art-pill "+t+(s?"":" solo")} role="img" aria-label=${n} title=${n}><svg class="art" viewBox=${`0 ${r-27} 64 54`} aria-hidden="true">${e}</svg>${s?l`<b>${s}</b>`:u}</span>`}_roomArtPill(e,t,n){if(e.badge.ton==="alert"||e.badge.ton==="act"||e.etat==="arret"||e.etat==="inconnu")return this._artPill(t,e.badge.ton==="alert"||e.badge.ton==="act"?e.badge.ton:"off",e.badge.texte,e.badge.texte,n);if(e.etat==="chauffe"&&e.poele)return this._artPill(t,"stove","Chauffe par le po\xEAle","",n);if(e.etat==="chauffe"||e.etat==="rafraichit"){let r=e.etat==="rafraichit",o=e.demande_pct,c=r?"Rafra\xEEchit":"Chauffe";return this._artPill(t,r?"cold":"heat",o!=null?`${c}, demande ${o} %`:c,o!=null?`${o} %`:"",n)}return this._artPill(t,"off","Ne chauffe pas","",n)}_glow(e){return l`<div class="glow" style=${`--c:var(${e})`} aria-hidden="true"></div>`}_roomTone(e){if(e.badge.ton==="alert")return"--nw-alert";if(e.etat==="chauffe")return e.poele?"--hc-stove":"--nw-heat";if(e.etat==="rafraichit")return"--nw-cold";let t=e.preset&&e.preset!=="none"?_t[e.preset]:null;return t==="cold"?"--nw-cold":t==="act"?"--nw-act":t==="heat"?"--nw-heat":"--hc-off"}_stoveTone(e){return e.etat==="alarme"?"--nw-alert":e.en_feu?"--hc-stove":"--hc-off"}_drawer(e,t,n,s,r,o=""){let c=this._drawers[e]??s;return l`<div class=${"dbox "+o} @click=${p=>p.stopPropagation()}>
   <button class="nw-fold-head drawer" aria-expanded=${c?"true":"false"} @click=${()=>{this._drawers={...this._drawers,[e]:!c}}}>
    <span class="dt"><span class="nw-label">${t}</span>${n?l`<span class="nw-sum">${n}</span>`:u}</span><span class="nw-chevron"><i class="nw-chev"></i></span></button>
   ${c?l`<div class="dbody">${r()}</div>`:u}</div>`}_tabbar(e,t,n){let s=this._tab(e,t);return l`<div class="tabs" role="tablist" aria-label=${n}>${t.map(([r,o])=>l`<button class="tab" role="tab"
   aria-selected=${r===s?"true":"false"} @click=${()=>{this._tabs={...this._tabs,[e]:r}}}>${o}</button>`)}</div>`}_tab(e,t){let n=this._tabs[e];return t.some(s=>s[0]===n)?n:t[0][0]}async _press(e,t,n=!1){if(n&&this._confirm!==e){this._confirm=e,window.setTimeout(()=>{this._confirm===e&&(this._confirm=void 0)},xa);return}this._confirm=void 0,this._busy=e,this._refused=void 0;try{await t()}catch(s){this._refused=`Ce n\u2019est pas pass\xE9 : ${s.message??"pas de r\xE9ponse"}.`}finally{this._busy=void 0}}_service(e){let[t,n]=e.service.split(".");return this._hass.callService(t,n,{...e.donnees??{},entity_id:e.entity_id})}_toSettings(){return l`<button class="link" @click=${()=>this._open("reglages")}>Ouvrir les réglages</button>`}_roomOf(e){return e.pieces.find(t=>t.id===this._config.piece)??e.pieces[0]}_tapAction(e){let t=this._config.tap_action??"thermostat";return t==="thermostat"&&!e.principal?"page":t==="none"?"":t}_tap(e,t){if(e.composedPath().some(s=>s instanceof HTMLElement&&s!==e.currentTarget&&(s.tagName==="BUTTON"||s.tagName==="A")))return;let n=this._tapAction(t);n==="thermostat"?this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t.principal},bubbles:!0,composed:!0})):n==="page"&&this._open("pieces/"+t.id)}_key(e,t){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._tap(e,t))}_modeButtons(e){return!!e.principal&&(e.modes??[]).some(t=>t!=="none")}_modes(e){let t=[...e.modes??[]].filter(p=>p!=="none").sort((p,h)=>xn(p)-xn(h));if(!t.length||!e.principal)return u;let n=this._pending,s=n&&n.id===e.principal&&Date.now()-n.at<yt&&e.preset!==n.mode?n.mode:null,r=s??e.preset,o=!!e.recopie,c=p=>e.consignes?.[p]??(p===e.preset&&!s?e.consigne:null);return l`<div class="modes" role="group" aria-label="Mode du thermostat" style=${`--n:${Math.min(t.length,4)}`} @click=${p=>p.stopPropagation()}>
   ${t.map(p=>l`<button type="button" class=${"mode "+(_t[p]??"heat")+(p===r?" on":"")} aria-pressed=${p===r} ?disabled=${o}
     title=${o?"Thermostat recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":""} @click=${()=>this._setMode(e,p)}><span class="mw">${Ie[p]??p}</span>${c(p)!=null?l`<span class="mt">${g(c(p))}°</span>`:u}</button>`)}</div>
   ${o?l`<p class="note">Thermostat recopié d’une autre maison : les modes se choisissent là-bas.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}async _setMode(e,t){if(!(!this._hass||!e.principal||e.recopie||t===e.preset)){this._pending={id:e.principal,mode:t,at:Date.now()},this._refused=void 0,window.setTimeout(()=>{this._pending?.at&&Date.now()-this._pending.at>=yt&&(this._pending=void 0)},yt+50);try{await this._hass.callService("climate","set_preset_mode",{entity_id:e.principal,preset_mode:t})}catch(n){this._pending=void 0,this._refused=`Le thermostat n\u2019a pas pris \xAB ${Ie[t]??t} \xBB : ${n.message??"pas de r\xE9ponse"}.`}}}_house(e){let t=e.maison,n=e.dehors,s=e.planning.prochains,r=new Date,o=this._fig,c=l`${n?.nuit_min!=null?l`Cette nuit <b>${F(n.nuit_min)}</b> dehors. `:u}${s.length?l`Ensuite : ${s.slice(0,2).map(p=>`${p.texte} ${$t(p.a)}`).join(", ")}.`:u}`;return l`<div class="head"><h2 class="nw-title">${this._config.name||"Chauffage"}</h2>${this._info("","Ouvrir l\u2019onglet Chauffage")}</div>
   <div class=${"nw-band nw-glass band "+t.etat}><div class="nw-band-text"><p class="nw-band-kicker">Maintenant <i>${ce(r)}</i></p>
    <p class="nw-band-title">${t.titre}</p>${c.values.some(p=>p!==u)?l`<p class="nw-band-line">${c}</p>`:u}</div></div>
   ${this._houseNow(e,o)}${this._whoHeats(e,o)}
   ${o?l`<div class="rhead" aria-hidden="true"><span>Pièce</span><span>a chauffé</span><span>temp. / consigne</span></div>`:u}
   <div class="rooms" role="list">${e.pieces.map(p=>this._houseRoom(p,o))}</div>
   ${o?l`${this._today(e,o)}${this._equalCold(o)}${this._houseFold(o)}${this._monthFold(o)}`:u}`}_houseNow(e,t){let n=e.maison,s=e.dehors,r=t?.maintenant,o=[s?.nuit_min!=null?`${g(s.nuit_min)} cette nuit`:"",s?.demain_max!=null?`${g(s.demain_max)} demain`:""].filter(Boolean).join(" \xB7 "),c=(h,m,x)=>l`<div class="tile"><span class="k">${h}</span><b class="v">${m}</b><span class="k">${x}</span></div>`,p=r?.cout_h!=null?c("Co\xFBt, en ce moment",`${g(r.cout_h,2)} \u20AC/h`,r.periode?Ge[r.periode]??r.periode:"au prix des r\xE9glages"):c("\xC9lectrique",bt(n.electrique_w),`${n.en_chauffe} pi\xE8ce${n.en_chauffe>1?"s":""} sur ${n.pieces} en chauffe`);return l`<div class="tiles house-now">
   ${c("Maison, en moyenne",F(n.temperature),r?.consigne_moyenne!=null?`consigne ${g(r.consigne_moyenne)}`:`${n.pieces} pi\xE8ces`)}
   ${c("Dehors",F(r?.dehors??null),o||"\u2014")}${p}</div>`}_whoHeats(e,t){let n=t?.maintenant.poele_kw??0,s=t?.maintenant.electrique_kw??e.maison.electrique_w/1e3,r=n+s,o=this._dailyEnergies(t);if(r<=.05)return l`<p class="who quiet">Rien ne chauffe en ce moment.</p>${o}`;let c=Math.round(n/r*100),p=e.pieces.filter(h=>h.etat==="chauffe"&&!h.poele&&h.puissance_w>0).map(h=>h.nom);return l`<div class="who" role="img" aria-label=${`Po\xEAle ${c} %, \xE9lectrique ${100-c} %`}>
   <div class="whobar">${n>0?l`<i class="st" style=${`flex:${n}`}></i>`:u}${s>0?l`<i class="el" style=${`flex:${s}`}></i>`:u}</div>
   <div class="wholines">${n>0?l`<span><i class="sw st"></i><b>Poêle ${c} %</b> · ${g(n)} kW</span>`:u}
    ${s>0?l`<span><i class="sw el"></i><b>Électrique ${100-c} %</b> · ${g(s)} kW${p.length?` \xB7 ${p.slice(0,3).join(", ")}`:""}</span>`:u}</div></div>${o}`}_dailyEnergies(e){let t=e?.energies;if(!t)return u;let n=(o,c,p)=>o.etat==="pret"&&o.semaine&&o.semaine.jours?l`<span><i class=${"sw "+c}></i><b>${p}</b> · environ ${g(o.semaine.kwh/o.semaine.jours,0)} kWh par jour pour chauffer</span>`:u,s=n(t.gaz,"gz","Gaz"),r=n(t.electricite,"el","\xC9lectricit\xE9 due au froid");return s===u&&r===u?u:l`<div class="wholines daily">${s}${r}<small>Ces 7 derniers jours, estimé d’après le froid (Hestia Énergie et Hestia Weather).</small></div>`}_houseRoom(e,t){let n=t?.aujourdhui.pieces?.[e.id];return l`<button class="room" role="listitem" @click=${()=>this._open("pieces/"+e.id)}><span class="n">${e.nom}</span>
   ${e.etat==="chauffe"&&!e.poele&&e.demande_pct!=null&&!e.fenetre?l`<span class="demand" role="img" aria-label=${`Demande ${e.demande_pct} %`}><i style=${`width:${e.demande_pct}%`}></i></span>`:this._chip(e.badge)}
   ${t?l`<span class="day" title="Temps de chauffe aujourd’hui">${n!=null?Y(n):"\u2014"}</span>`:u}
   <span class="t">${e.temperature!=null?g(e.temperature):"\u2014"}${e.consigne!=null?l` <small>/ ${g(e.consigne)}</small>`:u}</span></button>`}_today(e,t){let n=t.aujourdhui,s=n.argent??{},r=!!e.poele,o=n.jusqua.replace(/^0/,"").replace(":"," h ").replace(/ h 00$/," h"),c=s.electrique!=null||s.granules!=null,p=(s.electrique??0)+(r?s.granules??0:0),h=(m,x,v,$="")=>l`<div class=${"cell "+$}><span class="k">${m}</span><b>${x}</b><span class="k">${v}</span></div>`;return l`<section class="hsec today-cost"><div class="hsech"><span class="nw-label">Aujourd’hui, jusqu’à ${o}</span>${c?l`<b class="big">${R(p)}</b>`:u}</div>
   <div class="cells">${h("\xC9lectrique",s.electrique!=null?R(s.electrique):n.kwh!=null?`${g(n.kwh)} kWh`:"\u2014",[s.electrique!=null&&n.kwh!=null?`${g(n.kwh)} kWh`:"",Y(n.autres_min)].filter(Boolean).join(" \xB7 "),"el")}
    ${r?h("Granul\xE9s",s.granules!=null?R(s.granules):n.kg!=null?`${g(n.kg)} kg`:"\u2014",[s.granules!=null&&n.kg!=null?`${g(n.kg)} kg`:"",Y(n.poele_min)].filter(Boolean).join(" \xB7 "),"st"):u}
    ${r&&s.gagne!=null?h(s.gagne>=0?"Gagn\xE9":"Perdu",R(Math.abs(s.gagne)),"face au tout \xE9lectrique","ok"):u}</div>
   ${c?u:l`<p class="note">Donnez le prix du kWh dans Réglages (ou installez Hestia Énergie) pour lire ces chiffres en euros.</p>`}</section>`}_equalCold(e){let t=e.froid_egal,n=o=>o==null?"pas encore":o===0?"pareil":`${o<0?"\u2212":"+"} ${Math.abs(o)} %`,s=o=>o==null?"":o<0?"good":o>0?"bad":"",r=t?.base==="kwh"?"La chaleur":"Le co\xFBt";return l`<section class="hsec"><div class="hsech"><span class="nw-label">À froid égal</span></div>
   ${t?l`<div class="cmp">
    <span>Face à hier${t.dehors_vs_hier!=null&&Math.abs(t.dehors_vs_hier)>=.3?` (${g(Math.abs(t.dehors_vs_hier))} \xB0C de ${t.dehors_vs_hier>0?"plus":"moins"} dehors)`:""}</span><b class=${s(t.vs_hier)}>${n(t.vs_hier)}</b>
    <span>Face à la semaine passée</span><b class=${s(t.vs_semaine)}>${n(t.vs_semaine)}</b>
    <span>Face au même jour l’an dernier</span><b class="later">pas encore</b></div>
    <p class="note">${r} de chaque jour ramené au froid du jour (les degrés-jours) : un jour plus froid n’est pas compté comme une dépense de plus.</p>`:l`<p class="note">${e.apprend?"Hestia relit les jours pass\xE9s de la maison : les comparaisons arrivent dans quelques minutes.":"Pas encore assez de jours froids pour comparer."}</p>`}</section>`}_houseFold(e){let t=e.maison,n=t.inertie,s=t.besoin,r=t.temps,o=t.saison,c=[n?`Inertie \u2212 ${g(n.a_15)} \xB0C/h`:"",s?`${g(s.kwh_dj)} kWh par degr\xE9-jour`:"",o?`po\xEAle ${o.pct_poele} % de la saison`:""].filter(Boolean).join(" \xB7 ")||(e.apprend?"Hestia relit les jours pass\xE9s\u2026":`${t.jours} jour${t.jours>1?"s":""} connu${t.jours>1?"s":""}`),p=(v,$,C)=>l`<div class="stat"><span class="k">${v}</span><b>${$??"pas encore"}</b><span class="k">${C}</span></div>`,h=t.montee[0],m=t.montee.slice(1,3),x=s?.avant!=null?` ${g(s.avant)} la quinzaine d\u2019avant : ${s.kwh_dj<s.avant*.97?"mieux":s.kwh_dj>s.avant*1.03?"moins bien":"pareil"}.`:"";return this._drawer("maison",`Votre maison, sur ${Math.max(t.jours,1)} jour${t.jours>1?"s":""}`,c,!1,()=>l`<div class="stats">
   ${p("Inertie",n?`\u2212 ${g(n.a_15)} \xB0C/h`:null,n?`quand tout s\u2019arr\xEAte, \xE0 15 \xB0C d\u2019\xE9cart avec dehors. Elle garde la moiti\xE9 de sa chaleur en ${n.demi_vie_h} h.`:"les heures o\xF9 rien ne chauffe, quand il y en a assez.")}
   ${p("Besoin de chauffe",s?`${g(s.kwh_dj)} kWh par degr\xE9-jour`:null,s?`po\xEAle compt\xE9 en chaleur.${x}`:"la chaleur du jour pour chaque degr\xE9 de froid.")}
   ${p("Mont\xE9e en temp\xE9rature",h?`+ 1 \xB0C en ${Y(h.min_par_degre)}`:null,h?`${h.nom}${h.poele?", po\xEAle allum\xE9":""}.${m.map(v=>` ${v.nom} : + 1 \xB0C en ${Y(v.min_par_degre)}.`).join("")}`:"les heures de pleine chauffe.")}
   ${p("Temps de chauffe",r?`${Y(r.poele_min+r.autres_min)} par jour`:null,r?`${r.poele_min?`po\xEAle ${Y(r.poele_min)}, `:""}radiateurs ${Y(r.autres_min)} en tout.${t.tenue?` Consigne tenue ${t.tenue.pct} % du temps.`:""}`:"en moyenne, pi\xE8ces additionn\xE9es.")}
   ${o?p(o.gaz_kwh&&!o.poele_kwh?"Part du gaz":"Part du po\xEAle",`${o.gaz_kwh&&!o.poele_kwh?o.pct_gaz:o.pct_poele} %`,`de la chaleur de la saison${o.saison?` ${o.saison.replace("-","\u2013")}`:""} : ${[o.poele_kwh?`${g(o.poele_kwh,0)} kWh de granul\xE9s`:"",`${g(o.electrique_kwh,0)} kWh d\u2019\xE9lectricit\xE9`,o.gaz_kwh?`${g(o.gaz_kwh,0)} kWh de gaz (estim\xE9)`:""].filter(Boolean).join(", ")}.`):u}
   ${t.creuses?p("Heures creuses",`${t.creuses.pct} %`,`de l\u2019\xE9lectricit\xE9 du chauffage, sur ${g(t.creuses.kwh,0)} kWh (prix de Hestia \xC9nergie).`):u}</div>`,"hfold")}_monthFold(e){let t=e.jours;if(!t.length)return u;let n=t.every(f=>(f.kwh==null||f.eur_elec!=null)&&(f.kg==null||f.eur_gran!=null)),s=f=>(n?f.eur_elec:f.kwh)??0,r=f=>(n?f.eur_gran:(f.chaleur_kwh??0)-(f.kwh??0))??0,o=t.reduce((f,M)=>f+s(M),0),c=t.reduce((f,M)=>f+r(M),0),p=Math.max(.01,...t.map(f=>s(f)+r(f))),h=f=>n?R(f):`${g(f,0)} kWh`,m=`${h(o+c)}${c?` \xB7 ${h(o)} \xE9lectrique \xB7 ${h(c)} granul\xE9s`:""}`,x=t.map(f=>f.dj),v=Math.max(1,...x.map(f=>f??0)),$=t.length,w=x.map((f,M)=>f==null?null:`${((M+.5)/$*100).toFixed(2)},${(100-f/v*92).toFixed(2)}`).filter(Boolean).join(" ");return this._drawer("mois",`${$} dernier${$>1?"s":""} jour${$>1?"s":""}`,m,!1,()=>l`<div class="month" role="img" aria-label=${`${$} jours : ${m}`}>
   <div class="mcols" style=${`--n:${$}`}>${t.map((f,M)=>l`<span class=${M===$-1?"today":""} title=${`${f.jour.slice(8)}/${f.jour.slice(5,7)} : ${h(s(f)+r(f))}${f.dehors!=null?`, ${g(f.dehors)} \xB0C dehors`:""}`}
     style=${`height:${Math.round((s(f)+r(f))/p*100)}%`}>${r(f)>0?l`<i class="st" style=${`flex:${r(f)}`}></i>`:u}${s(f)>0?l`<i class="el" style=${`flex:${s(f)}`}></i>`:u}</span>`)}
    ${w?S`<svg class="cold" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points=${w} fill="none" vector-effect="non-scaling-stroke"></polyline></svg>`:u}</div>
   <div class="mlegend">${c?l`<span><i class="sw st"></i>granulés</span>`:u}<span><i class="sw el"></i>électrique</span><span><i class="sw cold"></i>froid dehors</span></div>
   ${n?u:l`<p class="note">En kWh de chaleur : sans le prix de chaque jour, les euros ne sont pas comptés.</p>`}</div>`,"hfold")}_window(e){let t=this._day,n=e.planning.maintenant_min;return{d:t,series:t?.series??{},span:{start:t?.debut_min??n,length:t?.fenetre_min??1440,now:n}}}_picker(){return{pick:this._pin??this._hover,pin:this._pin,last:this._last,onHover:e=>{e!=null&&(this._last=e),this._hover=e},onPin:e=>{e!=null&&(this._last=e),this._pin=e}}}_range(e){let t=n=>`${n%24} h`;return e.current?`${t(e.k)} \u2013 maintenant`:e.ahead?`${t(e.k)} \u2013 ${t(e.k+1)} \xB7 \xE0 venir`:`${e.yesterday?"hier, ":""}${t(e.k)} \u2013 ${t(e.k+1)}`}_ahead(e,t){return{range:this._range(e),value:e.ton?wa[e.ton]??xt(e.ton):"Rien de pr\xE9vu",word:!0,lines:[`hier : ${e.temp!=null?`${g(e.temp)}\xB0`:"\u2014"}`,t??""]}}_past(e,t){let n=t.filter(s=>!!s);return{range:this._range(e),value:e.temp!=null?`${g(e.temp)}\xB0`:"\u2014",lines:[n[0]??"",n[1]??""]}}_plan(e){return e.ton?`${Ue[e.ton]??e.ton} au planning`:null}_next(e,t){let n=va(e.a,t.planning.jour);return`${e.texte} ${n.startsWith("demain")?n:"\xE0 "+n}`}_soon(e){return e&&Date.parse(e.a)-Date.now()<864e5?e:null}_tile(e,t,n=""){return l`<div class="tile"><b class="v">${e}${n?l`<small class="u">${n}</small>`:u}</b><span class="k">${t}</span></div>`}_bars(e,t,n,s,r){let o=Math.max(0,...e.map(w=>w.valeur??0)),c=e.length-1,p=72,h=e.slice(0,-1).map(w=>w.valeur).filter(w=>w!=null),m=h.length>1?h.reduce((w,f)=>w+f,0)/h.length:null,x=!!r?.some(w=>w&&w.total!=null&&((w.hc??0)>0||(w.base??0)>0)),v=$n.filter(w=>r?.some(f=>(f?.[w]??0)>0)),$=(w,f)=>{let M=o&&w.valeur?Math.max(4,Math.round(w.valeur/o*p)):0,j=r?.[f];return!x||!j||j.total==null||!j.total?l`<span class=${f===c?"today":""} style=${`height:${M}px`}></span>`:l`<span class=${"stack"+(f===c?" today":"")} style=${`height:${M}px`}>${v.map(P=>l`<i class=${P} style=${`flex:${j[P]??0}`}></i>`)}</span>`},C=x?v.map(w=>[w,Ge[w]]):[["past","jours pass\xE9s"],["today","aujourd\u2019hui, jusqu\u2019\xE0 maintenant"]];return l`<div class="bars" role="img" aria-label=${n} style=${`--n:${e.length}`}>
   <div class="bhead"><b>${s}</b>${m!=null?l`<span>moyenne ${t(m)}</span>`:u}</div>
   <div class="cols">${e.map($)}${m!=null&&o?l`<em class="avg" style=${`bottom:${Math.round(m/o*p)}px`}></em>`:u}</div>
   ${e.length<=7?l`<div class="vals">${e.map((w,f)=>l`<span class=${f===c?"today":""}>${w.valeur!=null?t(w.valeur):"\u2014"}</span>`)}</div>`:u}
   <div class="days">${e.map((w,f)=>l`<span>${f===c?"auj.":ga[Ne(w.jour).getDay()]}</span>`)}</div>
   <div class="blegend">${C.map(([w,f])=>l`<span><i class=${"sw "+w}></i>${f}</span>`)}${m!=null?l`<span><i class="sw mean"></i>moyenne</span>`:u}</div></div>`}_dayList(e,t){return e.map(n=>`${At[Ne(n.jour).getDay()]} ${n.valeur!=null?t(n.valeur):"\u2014"}`).join(", ")}_stove(e){let t=e.poele;if(!t)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Po\xEAle"}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;let n=e.pieces.find(A=>A.poele),{d:s,series:r,span:o}=this._window(e),c=mn(t),p=t.flamme_max||5,h=t.en_feu?t.flamme??0:0,m=e.planning.lignes.find(A=>A.id==="poele"),x=m?.segments??[],v=[...new Set(x.map(A=>A.ton))],$=r.flamme??[],C=this._soon(n?.prochain),w=t.en_feu&&C&&(C.ton==="hors_gel"||C.ton==="arret")?C:null,f=[],M=n?.temperature??null,j=n?n.nom:"la pi\xE8ce",P=t.etat==="alarme"?"alarme":t.en_feu&&h?`flamme ${h} sur ${p}`:wn[t.etat]??t.etat,k=t.etat==="alarme"?"en alarme":t.en_feu?t.consigne!=null?`consigne ${g(t.consigne)}\xB0`:`flamme ${h}`:t.etat==="eteint"?"po\xEAle \xE9teint":wn[t.etat]??"",L=K($,0,o.length),D=K(r.consigne??[],0,o.length),T=new Map;D.forEach(([,A],O)=>{A!=null&&(L[O][1]??0)>0&&T.set(A,(T.get(A)??0)+1)});let E=D.map(([A,O],X)=>[A,O!=null&&((L[X][1]??0)>0||(T.get(O)??0)>=3)?O:null]),U=s?.energie?.unite==="kg"?s.energie.heures:[],pe=t.conso?.prix_kg??null,_e={temp:r.temperature??[],heat:$.map(([A,O])=>[A,O==null?null:O/p]),level:$,sets:E,energy:U},ye=mt(o,x,_e),ke=gt({span:o,segments:x,series:_e,hours:ye,kind:"flame",max:p,marks:f,say:A=>{let O=A.burn==null||A.burn<.05;if(A.ahead)return this._ahead(A,A.burn==null?null:O?"po\xEAle \xE9teint":`flamme ${g(A.level??0,0)}`);let X=A.energy!=null?`${g(A.energy,2)} kg${pe!=null?` \xB7 ${R(A.energy*pe)}`:""}`:null;if(O)return this._past(A,["po\xEAle \xE9teint",this._plan(A)]);let ue=Math.round((A.burn??0)*(A.to-A.from)/5)*5;return this._past(A,[`flamme ${g(A.level??0,0)}${(A.burn??0)<.95?` \xB7 ${ue} min`:` sur ${p}`}`,X,A.set!=null?`consigne ${g(A.set)}\xB0`:null,this._plan(A)])},...this._picker(),tight:!!this._config.compacte,label:`Horloge du jour : ${j} \xE0 ${F(M)}, po\xEAle ${P}${w?`, arr\xEAt pr\xE9vu \xE0 ${Et(w.a)}`:""}.`},this._config.compacte?wt(M,t.en_feu?t.consigne??null:null):vt(Be(h,p,t.en_feu),M!=null?`${g(M)}\xB0`:"\u2014",k)),Ae=this._why(t,n,c,h);return this._config.compacte?this._compact({tone:this._stoveTone(t),title:this._config.name||t.nom,say:t.phrase??(Ae?{texte:Ae}:null),ticker:this._ask(t,!0)??this._ticker(t,!0),pill:this._artPill(Be(h,p,t.en_feu),t.etat==="alarme"?"alert":t.en_feu?"stove":"off",`Po\xEAle : ${P}`,t.etat==="alarme"?"alarme":t.en_feu&&h?`${h}/${p}`:""),clock:ke,side:this._stoveButtons(t,!0),legend:this._legend(v,"temp\xE9rature",!0,"flame",p,!0),body:()=>l`${this._fireDrawer(e,t,n)}${this._pelletDrawer(e,t)}${this._foot("poele","Ouvrir les r\xE9glages du po\xEAle","R\xE9glages du po\xEAle")}`}):l`${this._glow(this._stoveTone(t))}<div class="top">
   ${this._head(this._config.name||t.nom,t.phrase?l`<span class=${"say "+t.phrase.ton}>${t.phrase.texte}</span>`:`Po\xEAle \xE0 granul\xE9s${t.modele?` \xB7 ${t.modele}`:""}`,l`
    <span class=${"pill "+(t.etat==="alarme"?"alert":t.en_feu?"stove":"off")}>${P}</span>`)}
   ${ke}
   ${this._legend(v,(r.temperature??[]).length?`temp\xE9rature du ${j.toLowerCase()}`:null,E.some(A=>A[1]!=null),"flame",p)}
   ${this._stoveButtons(t)}
   ${this._ask(t)}
   ${this._ticker(t)}
  </div>
  ${this._fireDrawer(e,t,n)}
  ${this._pelletDrawer(e,t)}
  ${this._foot("poele","Ouvrir les r\xE9glages du po\xEAle","R\xE9glages du po\xEAle")}`}_legend(e,t,n,s,r=5,o=!1){let c=()=>l`<i class=${"sw blocks "+s}>${Array.from({length:3},(p,h)=>l`<b style=${`--p:${Math.round(h/2*100)}%`}></b>`)}</i>`;return o?l`<div class="legend mini"><div>${e.map(p=>l`<span><i class=${"sw t-"+p}></i>${Ue[p]??p}</span>`)}</div>
   <div>${t?l`<span><i class="sw line"></i>${t}</span>`:u}${n?l`<span><i class="sw set"></i>consigne</span>`:u}</div>
   <div>${s?l`<span>${c()}${s==="flame"?"un pav\xE9 par palier":"un pav\xE9 : 20 % de chauffe"}</span>`:u}</div></div>`:l`<div class="legend">${e.map(p=>l`<span><i class=${"sw t-"+p}></i>${Ue[p]??p}</span>`)}
   ${t?l`<span><i class="sw line"></i>${t}</span>`:u}${n?l`<span><i class="sw set"></i>consigne</span>`:u}
   ${s?l`<span>${c()}${s==="flame"?`flamme : un pav\xE9 par palier, ${r} au plus`:"temps de chauffe : un pav\xE9 par 20 % de l\u2019heure"}</span>`:u}</div>`}_announces(e){let t=[];(e.etat==="alarme"||e.alarme)&&t.push({cle:"alarme",label:"Alarme du po\xEAle",icone:"mdi:alert-octagon",ton:"alert",texte:e.alarme_texte?`Le po\xEAle est en alarme : ${e.alarme_texte}.`:"Le po\xEAle est en alarme."});for(let s of e.soucis??[]){let[r,o]=ma[s.sujet]??["Souci","mdi:alert-circle-outline"];t.push({cle:s.sujet,label:r,icone:o,ton:"act",texte:s.texte})}return e.conso?.brasier?.a_nettoyer&&t.push({cle:"brasier",label:"Brasier",icone:"mdi:broom",ton:"act",texte:"Brasier \xE0 nettoyer : appuyez sur \xAB J\u2019ai nettoy\xE9 \xBB une fois fait."}),t}_ask(e,t=!1){let n=e.pilote?.mode==="entier"?e.pilote.conduite?.question:null;if(!n||n.sujet!=="saison")return null;let s=this._busy==="oui"||this._busy==="non",r=!!e.copie,o=p=>()=>void this._press(p,()=>this._hass.callWS({type:"hestia_heating/repondre",reponse:p})),c=l`<span class="ask-btns" @click=${p=>p.stopPropagation()}>
   <button class="btn yes" ?disabled=${s||r} @click=${o("oui")}>${t?"Oui":"Oui, allumer"}</button>
   <button class="btn" ?disabled=${s||r} @click=${o("non")}>Non</button></span>`;return t?l`<span class="ask line"><b>Allumer le poêle ?</b>${c}</span>`:l`<div class="annonces act ask"><b>Allumer le poêle ? Hestia vous demande</b>
   <p>${n.texte}</p>
   ${n.reste_min!=null?l`<small>Sans réponse dans ${n.reste_min} min, Hestia garde le boost et surveille la pièce.</small>`:u}
   ${c}</div>`}_ticker(e,t=!1){let n=this._announces(e);return n.length?t?l`<hestia-heating-ticker line .points=${n}></hestia-heating-ticker>`:l`<div class=${"annonces "+(n.some(s=>s.ton==="alert")?"alert":"act")}><hestia-heating-ticker .points=${n}></hestia-heating-ticker></div>`:null}_why(e,t,n,s){if(e.etat==="alarme")return e.phrase?"":`Le po\xEAle est en alarme${e.alarme_texte?` : ${e.alarme_texte}`:""}.`;if(n&&e.pilote?.texte)return e.pilote.texte;let r=e.depuis?` depuis ${ce(new Date(e.depuis))}`:"",o=e.en_feu&&s?`Flamme ${s}.${t&&t.temperature!=null?` ${t.nom} : ${F(t.temperature)}${e.consigne!=null?`, consigne ${F(e.consigne)}`:""}.`:""}`:`${{eteint:"Po\xEAle \xE9teint",allumage:"Le po\xEAle s\u2019allume",chauffe:"En chauffe",nettoyage:"Le po\xEAle se nettoie",extinction:"Le po\xEAle s\u2019\xE9teint"}[e.etat]??"Le po\xEAle ne dit pas son \xE9tat"}${r}.`;return(e.pilote&&!n?"Flamme \xE0 la main : Hestia ne la change pas. ":"")+o}_stoveButtons(e,t=!1){let n=e.allume??(e.en_feu||e.etat==="allumage"),s=e.boutons?.[n?"eteindre":"allumer"],r=!!e.copie,o=e.conso?.brasier,c=this._confirm,p=r?"Po\xEAle recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":"";return l`<div class="btns" @click=${h=>h.stopPropagation()}>
   ${s?l`<button class=${"btn"+(c==="power"?" ask":"")} ?disabled=${r||this._busy==="power"} title=${p}
     @click=${()=>this._press("power",()=>this._service(s),!0)}>${Aa}${c==="power"?n?"Vraiment \xE9teindre ?":"Vraiment allumer ?":n?"\xC9teindre":"Allumer"}</button>`:u}
   ${o?l`<button class=${"btn pot"+(o.a_nettoyer?" due":o.bientot?" soon":"")+(c==="clean"?" ask":"")} ?disabled=${this._busy==="clean"}
     style=${`--fill:${this._potFill(o)}%`} aria-label=${`${this._potWord(o)}. J\u2019ai nettoy\xE9 le brasier`} title=${o.texte}
     @click=${()=>this._press("clean",()=>this._hass.callWS({type:"hestia_heating/brasier_nettoye"}),!0)}>${Ea}<span class="pot-say"><b>${t?this._potWord(o,!1):this._potWord(o)}</b>
     <small>${c==="clean"?"Remettre \xE0 z\xE9ro ?":t&&this._potWhen(o)?`J\u2019ai nettoy\xE9 \xB7 ${this._potWhen(o).replace("nettoyage ","")}`:"J\u2019ai nettoy\xE9"}</small></span></button>`:u}
  </div>
  ${r?l`<p class="note">Poêle recopié d’une autre maison : ses boutons sont grisés, rien ne lui est envoyé.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}_potFill(e){return e.a_nettoyer?100:e.kg!=null&&e.seuil_kg?Math.max(0,Math.min(100,Math.round(e.kg/e.seuil_kg*100))):0}_potWord(e,t=!0){if(e.a_nettoyer)return"Brasier \xE0 nettoyer";if(e.kg==null)return"Brasier pas encore compt\xE9";let n=this._potFill(e),s=this._potWhen(e);return`${n<5?"Brasier propre":`Brasier rempli \xE0 ${n} %`}${s&&t?` \xB7 ${s}`:""}`}_potWhen(e){return e.jours==null?"":e.jours<1?"nettoyage aujourd\u2019hui":e.jours<1.5?"nettoyage demain":`nettoyage dans ${g(e.jours,0)} jours`}_fireDrawer(e,t,n){let s=t.conso,r=t.en_feu&&s?.debit_kg_h?s.debit_kg_h:null,o=r&&s?.cout_heure!=null?`${R(s.cout_heure)} de l\u2019heure`:null,c=[t.fumees!=null?`fum\xE9es ${g(t.fumees,0)} \xB0C`:null,r?`${g(r,2)} kg/h`:t.en_feu?null:"\xE0 l\u2019arr\xEAt",o].filter(Boolean).join(" \xB7 ");return this._drawer("feu","Le feu et les r\xE9glages",c,!this._config.compacte,()=>{let p=!!t.copie,h=t.flamme_basse,m=t.prise_switch,x=this._soon(n?.prochain),v=[h?l`<button class=${"chip"+(h.on?" on stove":"")} aria-pressed=${h.on?"true":"false"} ?disabled=${p||this._busy==="low"} title=${h.nom}
      @click=${()=>this._press("low",()=>this._hass.callService(h.entity_id.split(".")[0],h.on?"turn_off":"turn_on",{entity_id:h.entity_id}))}><i class="dot"></i>Flamme réduite</button>`:null,m?l`<button class=${"chip"+(m.on?" on calm":"")} ?disabled=${p} title="Ouvrir la prise"
      @click=${()=>this._more(m.entity_id)}><i class="dot"></i>${m.on?"Prise allum\xE9e":m.on===!1?"Prise coup\xE9e":"Prise"}</button>`:null].filter(Boolean),$=[x?l`<div class="row">${Sa}<span><b>Planning.</b> ${n?.planning?`${xt(n.planning)} maintenant, puis `:"Ensuite : "}${this._next(x,e)}.</span></div>`:null,n?.appoint!=null?l`<div class="row cold">${Ca}<span><b>Radiateur d’appoint.</b> Réglé à ${F(n.appoint)} : il prend le relais si le poêle ne suffit pas.</span></div>`:null].filter(Boolean);return l`<div class="tiles">${this._tile(n?.temperature!=null?g(n.temperature):"\u2014",`${n?n.nom.toLowerCase():"pi\xE8ce"}, \xB0C`,t.consigne!=null?`\u2192 ${g(t.consigne)}`:"")}
     ${this._tile(t.fumees!=null?g(t.fumees,0):"\u2014","fum\xE9es","\xB0C")}${this._tile(r?g(r,2):"\u2014",o??"granul\xE9s","kg/h")}</div>
    ${this._controls(t)}
    ${v.length?l`<div class="chips">${v}</div>`:u}${$.length?l`<div class="rows boxed">${$}</div>`:u}`},"fire")}_controls(e){let t=!!e.copie,n=e.entites??{},s=mn(e),r=!!this._busy,o=e.flamme_min??1,c=e.flamme_max||5,p=e.flamme_reglee,h=k=>this._hass.callWS({type:"hestia_heating/set_settings",reglages:k}),m=k=>this._press("flame",async()=>{s&&await this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!1}),await this._hass.callService("number","set_value",{entity_id:n.flamme,value:k})}),x=e.ventilation_niveaux??[],v=e.ventilation_choix??"auto",$=e.ventilation,C=()=>this._press("fan",async()=>{if(await h({pilote_ventilation:"auto"}),$&&$.toLowerCase()!=="auto"){let k=this._hass.states?.[n.ventilation]?.attributes.fan_modes;await this._hass.callService("climate","set_fan_mode",{entity_id:n.ventilation,fan_mode:(k??[]).find(L=>String(L).toLowerCase()==="auto")??"AUTO"})}}),w=k=>this._press("fan",async()=>{v!=="manuel"&&await h({pilote_ventilation:"manuel"}),await this._hass.callService("climate","set_fan_mode",{entity_id:n.ventilation,fan_mode:k})}),f=e.eco_stop,M=e.eco_stop_delai??5,j=f?`Le po\xEAle s\u2019\xE9teint seul si sa sonde reste ${g(M,0)} min au-dessus de ${e.consigne_poele!=null?`${g(e.consigne_poele)} \xB0C`:"sa consigne"}${e.air!=null?` (elle lit ${g(e.air)} \xB0C)`:""}, m\xEAme sans Home Assistant.`:"Le po\xEAle ne s\u2019\xE9teint jamais seul : il descend \xE0 la flamme 1 et continue de br\xFBler.",P=(k,L,D,T=!1)=>l`<button class=${"seg"+(k?" on":"")} aria-pressed=${k?"true":"false"} ?disabled=${t||r||T} @click=${D}>${L}</button>`;return l`<div class="ctl" @click=${k=>k.stopPropagation()}>
   ${n.flamme?l`<div class="ctl-row"><b>Flamme</b><span class="segs one">${P(s,"Auto",()=>void this._press("auto",()=>this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!0})),!!e.copie)}${Array.from({length:c-o+1},(k,L)=>L+o).map(k=>l`<button class=${"seg step"+(!s&&p===k?" on":s&&p===k?" cur":"")} aria-pressed=${!s&&p===k?"true":"false"}
     aria-label=${`Puissance ${k}, \xE0 la main`} title=${s&&p===k?"La flamme que Hestia a r\xE9gl\xE9e":""} ?disabled=${t||r} @click=${()=>void m(k)}>${k}</button>`)}</span></div>`:u}
   ${n.ventilation&&x.length?l`<div class="ctl-row"><b>Ventilation</b><span class="segs one">${P(v==="auto","Po\xEAle",()=>void C())}${P(v==="flamme","Hestia",()=>void this._press("fan",()=>h({pilote_ventilation:"flamme"})))}${x.map(k=>l`<button class=${"seg step"+(v==="manuel"&&$===k?" on":v!=="manuel"&&$===k?" cur":"")} aria-pressed=${v==="manuel"&&$===k?"true":"false"}
     aria-label=${`Vitesse ${k}, \xE0 la main`} ?disabled=${t||r} @click=${()=>void w(k)}>${k}</button>`)}</span></div>`:u}
   ${n.eco_stop&&f!=null?l`<div class="ctl-row"><b>ÉCO Stop</b><span class="segs">${P(f,"Activ\xE9",()=>void this._press("eco",async()=>{await this._hass.callService("switch","turn_on",{entity_id:n.eco_stop}),await h({poele_eco_stop:!0})}))}${P(!f,"Coup\xE9",()=>void this._press("eco",async()=>{await this._hass.callService("switch","turn_off",{entity_id:n.eco_stop}),await h({poele_eco_stop:!1})}))}</span>
    <p class="ctl-say">${j}</p></div>`:u}
  </div>`}_pelletSay(e,t){let n=e.granules,s=t.conso,r=s?.brasier,o=n?.jours!=null?this._dayIn(n.jours):null,c=r?.kg!=null&&r.seuil_kg?Math.round(r.kg/r.seuil_kg*100):null;return[o?`granul\xE9s jusqu\u2019au ${o}`:null,s?.cout_jour!=null?`${R(s.cout_jour)} aujourd\u2019hui`:s?`${g(s.kg_jour,1)} kg aujourd\u2019hui`:null,r?.a_nettoyer?"brasier \xE0 nettoyer":r?.jours!=null?`brasier : ${this._potWhen(r)}`:c!=null?`brasier rempli \xE0 ${c} %`:r?"brasier pas encore compt\xE9":null].filter(p=>!!p)}_pelletDrawer(e,t){let n=e.granules,s=t.conso,r=s?.brasier,o=this._hist?.unite==="kg"?this._hist:void 0,c=n?.jours!=null?this._dayIn(n.jours):null,p=this._pelletSay(e,t).join(" \xB7 "),h=[["granules","Granul\xE9s"],["argent","Argent"],["entretien","Entretien"]];return this._drawer("granules","Granul\xE9s \xB7 Argent \xB7 Entretien",p,!1,()=>{let m=this._tab("poele",h);return l`${this._tabbar("poele",h,"D\xE9tails du po\xEAle")}<div role="tabpanel" class="panel">${m==="granules"?this._pellets(n,s,o,c):m==="argent"?this._stoveMoney(e,s,o):this._upkeep(t)}</div>`},"pellets")}_dayIn(e){let t=new Date;return t.setDate(t.getDate()+e),`${t.getDate()===1?"1er":t.getDate()} ${vn[t.getMonth()]}`}_sacks(e){let t=Math.floor(e+.05),n=e-t>.05;return t?`${t} sac${t>1?"s":""}${n?" et un entam\xE9":""}`:n?"un sac entam\xE9":"plus aucun sac"}_sackArt(e){let t=Math.floor(e+.05),n=e-t>.05?e-t:0,s=Math.min(12,t+(n?1:0)),r="M7 2h12l-1.5 4c3 2 4.5 5.5 4.5 10v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4c0-4.5 1.5-8 4.5-10z";return l`<svg class="sacks" viewBox="0 0 150 90" role="img" aria-label=${this._sacks(e)}><defs><linearGradient id="hcSack" x1="0" y1="1" x2="0" y2="0">
   <stop offset="0" class="full"></stop><stop offset=${n.toFixed(2)} class="full"></stop><stop offset=${n.toFixed(2)} class="empty"></stop><stop offset="1" class="empty"></stop></linearGradient></defs>
   ${Array.from({length:s},(o,c)=>S`<path class=${"sack"+(n&&t<12&&c===s-1?" part":"")} fill=${n&&t<12&&c===s-1?"url(#hcSack)":u} transform=${`translate(${c%6*24+(c>=6?12:0)} ${c<6?58:30})`} d=${r}></path>`)}</svg>`}_pellets(e,t,n,s){let r=n?.stat?n.jours:[],o=r.reduce((c,p)=>p.valeur!=null&&(c==null||p.valeur>(c.valeur??0))?p:c,null);return l`${e?.stock_sacs!=null?l`<div class="stock"><div><div class="nw-label">${s?"Il en reste jusqu\u2019au":"Il en reste"}</div>
     <div class="big">${s??this._sacks(e.stock_sacs)}</div>
     <div class="small">${[s?xt(this._sacks(e.stock_sacs)):null,e.kg_par_jour!=null?`au rythme de la saison : ${g(e.kg_par_jour)} kg par jour`:null].filter(Boolean).join(", ")}</div></div>
     ${this._sackArt(e.stock_sacs)}</div>`:l`<p class="note left">Le stock se lit avec l’intégration Suivi Stock Pellet : sans elle, Hestia compte seulement ce qui brûle.</p>
     ${t?l`<div class="tiles">${this._tile(g(t.kg_jour,1),"aujourd\u2019hui","kg")}${this._tile(g(t.kg_saison,0),"cette saison","kg")}${this._tile(t.debit_kg_h?g(t.debit_kg_h,2):"\u2014","en ce moment","kg/h")}</div>`:u}`}
   ${o?l`${this._bars(r,c=>`${g(c,1)} kg`,`Granul\xE9s br\xFBl\xE9s par jour : ${this._dayList(r,c=>`${g(c,1)} kg`)}`,"Granul\xE9s br\xFBl\xE9s, kg par jour")}
    <p class="note left">Le plus : ${At[Ne(o.jour).getDay()]}, ${g(o.valeur,1)} kg.</p>`:u}`}_stoveMoney(e,t,n){let s=[["jour","Aujourd\u2019hui"],["semaine","7 jours"],["saison","Saison"]],r=this._tab("periode",s),o=n?.stat?n.jours.slice(-7).reduce((j,P)=>j+(P.valeur??0),0):null,c=r==="jour"?t?.kg_jour??null:r==="semaine"?o:t?.kg_saison??null,p=t?.prix_kg??null,h=Ve(e),m=n?.energie,x=m?.euros.every(j=>j.total!=null)?m:void 0,v=j=>{if(x&&n){let k=(r==="jour"?x.euros.slice(-1):r==="semaine"?x.euros.slice(-7):x.euros).reduce((D,T)=>D+(T.total??0),0);if(r!=="saison")return k;let L=n.jours.reduce((D,T)=>D+(T.valeur??0),0);return L?j*k/L:null}return h!=null?j*$a*h:null},$=l`<div class="tabs" role="group" aria-label="Période">${s.map(([j,P])=>l`<button class="tab" aria-pressed=${j===r?"true":"false"}
   @click=${()=>{this._tabs={...this._tabs,periode:j}}}>${P}</button>`)}</div>`;if(p==null||h==null&&!x)return l`${$}<p class="note left">${p==null?"Le prix des granul\xE9s manque : donnez le prix et le poids d\u2019un sac dans les r\xE9glages. ":""}${h==null&&!x?"Le prix du kWh manque, pour comparer \xE0 l\u2019\xE9lectricit\xE9 : donnez-le dans les r\xE9glages, ou installez Hestia \xC9nergie.":""}</p>${this._toSettings()}`;if(c==null)return l`${$}<p class="note">Pas encore de compte pour cette période.</p>`;let C=c*p,w=v(c);if(w==null)return l`${$}<p class="note">Pas encore de compte pour cette période.</p>`;let f=Math.max(C,w)||1,M=w-C;return l`${$}<div class="versus">
    <span>Le poêle</span><span class="vb"><i class="pellet" style=${`width:${C/f*100}%`}></i></span><b>${R(C)}</b>
    <span>À l’électricité</span><span class="vb"><i class="elec" style=${`width:${w/f*100}%`}></i></span><b>${R(w)}</b></div>
   <div class="saved"><b class=${M>=0?"good":"bad"}>${R(Math.abs(M))} ${M>=0?"gagn\xE9s":"de plus"}</b>
    <span>${r==="jour"?"aujourd\u2019hui, pour la m\xEAme chaleur":r==="semaine"?"sur les 7 derniers jours":"depuis le d\xE9but de la saison"}</span></div>
   <p class="note left">${g(c,c>=100?0:1)} kg de granulés à ${g(p,3)} € le kg, face à la même chaleur à l’électricité, ${x?`aux prix de Hestia \xC9nergie, heure par heure${r==="saison"?" (la saison au prix moyen des 14 derniers jours)":""}.`:`\xE0 ${g(h,4)} \u20AC le kWh${e.prix_energie?.kwh!=null?", le prix de Hestia \xC9nergie en ce moment":""}.`}</p>`}_upkeep(e){let t=e.conso?.brasier,n=2*Math.PI*26,s=t?.kg!=null&&t.seuil_kg?Math.min(1,t.kg/t.seuil_kg):0,r=t?.a_nettoyer?"alert":t?.bientot?"act":"stove",o=t?.kg!=null?g(t.kg,1):"\u2014";return l`${t?l`<div class="pot"><div class="pring"><svg viewBox="0 0 64 64" role="img" aria-label=${`Brasier : ${o} kg br\xFBl\xE9s sur ${g(t.seuil_kg,0)}`}>
     <circle class="bg" cx="32" cy="32" r="26"></circle><circle class=${"fg "+r} cx="32" cy="32" r="26" style=${`stroke-dasharray:${(n*s).toFixed(1)} ${n.toFixed(1)}`}></circle></svg>
     <span>${o}</span></div><div class="pt"><b>Brasier</b><span>${t.texte}</span></div></div>`:u}
   <div class="rows">
    <div class="row"><b>Alarme</b><span>${e.alarme?`${e.alarme_texte??"Le po\xEAle signale une alarme"}.`:"Aucune en ce moment."}</span></div>
    ${e.prise_w!=null?l`<div class="row"><b>Prise</b><span>${bt(e.prise_w)} en ce moment.</span></div>`:u}
   </div>`}_room(e){let t=this._roomOf(e);if(!t)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Pi\xE8ce"}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;let n=this._config.name||t.nom,s=this._tapAction(t),r=s==="thermostat"?`Ouvrir le thermostat de ${t.nom}`:`Ouvrir la page de ${t.nom}`;if(this._config.court)return l`<div class="short" role=${s?"button":u} tabindex=${s?0:u} aria-label=${s?r:u}
    @keydown=${s?E=>this._key(E,t):u}>
    <div class="temp">${t.temperature!=null?g(t.temperature):"\u2014"}<sup>°C</sup></div><div><b>${n}</b><span class="nw-say">${t.raison??(t.consigne!=null?`Consigne ${F(t.consigne)}`:"")}</span></div>${this._chip(t.badge)}</div>`;let{d:o,series:c,span:p}=this._window(e),h=e.planning.lignes.find(E=>E.id===t.id),m=h?.segments??[],x=[...new Set(m.map(E=>E.ton))],v=!t.poele&&(c.demande??[]).some(E=>(E[1]??0)>0),$=c.consigne?.length?c.consigne:t.consigne!=null?[[0,t.consigne]]:[],C=this._soon(t.prochain),w=t.type==="poele"?e.poele:null,f=w?Be(w.en_feu?w.flamme??0:0,w.flamme_max||5,w.en_feu):un(t.type,t.etat),M=C?this._next(C,e):t.consigne!=null?`consigne ${g(t.consigne)}\xB0`:"",j=o?.energie?.unite==="kWh"?o.energie.heures:[],P=Ve(e),k={temp:c.temperature??[],heat:v?(c.demande??[]).map(([E,U])=>[E,U==null?null:U/100]):[],sets:$,energy:j},L=mt(p,m,k),T=gt({span:p,segments:m,series:k,hours:L,kind:"demand",marks:[],say:E=>{let U=v&&E.heat!=null?`chauffe ${Math.round(E.heat*100)} %`:null;return E.ahead?this._ahead(E,U):this._past(E,[U,E.energy!=null?`${g(E.energy,2)} kWh${P!=null?` \xB7 ${R(E.energy*P)}`:""}`:null,E.set!=null?`consigne ${g(E.set)}\xB0`:null,this._plan(E)])},...this._picker(),tight:!!this._config.compacte,tap:s?{label:r,run:E=>this._tap(E,t)}:void 0,label:`Horloge du jour : ${t.nom} \xE0 ${F(t.temperature)}${t.consigne!=null?`, consigne ${F(t.consigne)}`:""}${C?`, ${this._next(C,e)}`:""}.`},this._config.compacte?wt(t.temperature,t.consigne):vt(f,t.temperature!=null?`${g(t.temperature)}\xB0`:"\u2014",M));return this._config.compacte?this._compact({tone:this._roomTone(t),title:n,say:t.raison?{texte:t.raison,ton:t.badge.ton==="alert"?"alert":""}:null,pill:this._roomArtPill(t,f,w?25:hn(t.type,t.etat)),clock:T,side:this._modeButtons(t)?this._modes(t):this._modePill(t),legend:this._legend(x,"temp\xE9rature",!0,t.poele?null:"demand",5,!0),body:()=>l`${this._roomDrawer(e,t,!0)}${this._foot("pieces/"+t.id,`Ouvrir les r\xE9glages de ${t.nom}`,"R\xE9glages de la pi\xE8ce")}`}):l`${this._glow(this._roomTone(t))}<div class="top">
   ${this._head(n,ba[t.type??""]??"",l`${this._heatPill(t)}${this._modeButtons(t)?u:this._modePill(t)}`)}
   ${T}
   ${this._legend(x,(c.temperature??[]).length?"temp\xE9rature":null,$.some(E=>E[1]!=null),t.poele?null:"demand")}
   ${this._modes(t)}
  </div>
  ${this._roomDrawer(e,t)}
  ${this._foot("pieces/"+t.id,`Ouvrir les r\xE9glages de ${t.nom}`,"R\xE9glages de la pi\xE8ce")}`}_heatPill(e){if(e.badge.ton==="alert"||e.badge.ton==="act"||e.etat==="arret"||e.etat==="inconnu")return l`<span class=${"pill "+e.badge.ton} role="status">${e.badge.texte}</span>`;if(e.etat==="chauffe"&&e.poele)return l`<span class="pill stove" role="status"><span class="beat">${kt}</span>${e.badge.texte}</span>`;if(e.etat==="chauffe"||e.etat==="rafraichit"){let t=e.etat==="rafraichit",n=e.demande_pct,s=t?"Rafra\xEEchit":"Chauffe";return l`<span class=${"pill "+(t?"cold":"heat")} role="status" aria-label=${n!=null?`${s}, demande ${n} %`:s}>
    <span class="beat">${kt}</span>${s}${n!=null?l` ${n} %<span class="gauge"><i style=${`width:${Math.min(100,n)}%`}></i></span>`:u}</span>`}return l`<span class="pill off" role="status">${kt}Ne chauffe pas</span>`}_modePill(e){let t=e.preset&&e.preset!=="none"?e.preset:null,n=t?Ie[t]??t:e.planning;return n?l`<span class=${"pill "+(t?_t[t]??"heat":"calm")}><i class="dot"></i>${n.toLowerCase()}${e.planning?" \xB7 planning":""}</span>`:u}_roomSay(e,t){let n=this._hist?.unite==="kWh"?this._hist:void 0,s=Ve(e),r=n?.stat?n.jours.at(-1)?.valeur??null:null,o=this._heatToday(t),c=n?.energie?n.energie.euros.at(-1)?.total??null:r!=null&&s!=null?r*s:null;return[c!=null?`${R(c)} aujourd\u2019hui`:null,r!=null?`${g(r)} kWh`:o?`${o.time} de chauffe`:null,t.humidite!=null?`humidit\xE9 ${g(t.humidite,0)} %`:null].filter(p=>!!p)}_roomDrawer(e,t,n=!1){let s=this._hist?.unite==="kWh"?this._hist:void 0,r=Ve(e),o=this._heatToday(t),c=this._roomSay(e,t).join(" \xB7 "),p=[["argent","Argent"],["conso","Conso"],["confort","Confort"]],h=()=>{let m=this._tab("piece",p);return l`${this._tabbar("piece",p,"D\xE9tails de la pi\xE8ce")}<div role="tabpanel" class="panel">${m==="argent"?this._roomMoney(e,s,r):m==="conso"?this._roomUse(s,o):this._roomComfort(e,t)}</div>`};return n?l`<div class="dbox inline" @click=${m=>m.stopPropagation()}><div class="dbody">${h()}</div></div>`:this._drawer("piece","Argent \xB7 Conso \xB7 Confort",c,!1,h)}_heatToday(e){let t=this._day;if(!t||e.poele||!t.series.demande?.length||t.fenetre_min==null)return null;let n=t.fenetre_min,s=Math.max(0,n-t.maintenant_min),r=0;for(let[,c]of K(t.series.demande,s,n-5))r+=(c??0)/100*5;let o=Math.round(r);return{time:o>=60?`${Math.floor(o/60)} h ${String(o%60).padStart(2,"0")}`:`${o} min`,duty:Math.round(r/Math.max(5,t.maintenant_min)*100)}}_roomMoney(e,t,n){if(!t)return l`<p class="note">Les derniers jours ne sont pas encore lus.</p>`;if(!t.stat)return l`<p class="note left">Le thermostat ne donne pas de compteur d’énergie : Hestia ne peut pas compter les kWh de cette pièce.</p>`;let s=t.energie;if(s){let c=s.euros.slice(-7),p=m=>m.some(x=>x.total==null)?null:m.reduce((x,v)=>x+(v.total??0),0),h=c.map(m=>({jour:m.jour,valeur:m.total}));return l`<div class="tiles">${this._tile(c.at(-1)?.total!=null?R(c.at(-1).total):"\u2014","aujourd\u2019hui")}
     ${this._tile(p(c)!=null?R(p(c)):"\u2014","7 derniers jours")}${this._tile(p(s.euros)!=null?R(p(s.euros)):"\u2014","14 derniers jours")}</div>
    ${this._bars(h,m=>R(m).replace(" \u20AC",""),`Co\xFBt par jour : ${this._dayList(h,m=>R(m))}`,"Euros par jour",c)}
    <p class="note left">${this._energyPrices(s)}</p>`}if(n==null)return l`<p class="note left">Donnez le prix du kWh dans les réglages pour voir ce que coûte la pièce, ou installez Hestia Énergie : ses prix seront repris ici.</p>${this._toSettings()}`;let r=t.jours.slice(-7),o=r.at(-1)?.valeur;return l`<div class="tiles">${this._tile(o!=null?R(o*n):"\u2014","aujourd\u2019hui")}
    ${this._tile(R(r.reduce((c,p)=>c+(p.valeur??0),0)*n),"7 derniers jours")}
    ${this._tile(t.mois!=null?R(t.mois*n):"\u2014",vn[Ne(t.aujourdhui).getMonth()])}</div>
   ${this._bars(r.map(c=>({jour:c.jour,valeur:c.valeur!=null?c.valeur*n:null})),c=>g(c,2),`Co\xFBt par jour : ${this._dayList(r,c=>R(c*n))}`,"Euros par jour")}
   <p class="note left">${ya(e,n)}, abonnement à part.</p>`}_energyPrices(e){let t=$n.filter(n=>e.prix[n]!=null).map(n=>`${Ge[n]} ${g(e.prix[n],4)} \u20AC`).join(", ");return`Prix de Hestia \xC9nergie, heure par heure${t?` (${t} le kWh)`:""}, abonnement \xE0 part.${e.couleur?` Tempo : seule la journ\xE9e Tempo en cours (${e.couleur}) a un prix, Hestia \xC9nergie ne donne pas encore la couleur des jours pass\xE9s.`:""}`}_roomUse(e,t){let n=e?.stat?e.jours.slice(-7):[],s=n.at(-1)?.valeur??null;return l`<div class="tiles">${this._tile(s!=null?g(s):"\u2014","aujourd\u2019hui","kWh")}${this._tile(t?t.time:"\u2014","de chauffe")}
    ${this._tile(t?`${t.duty} %`:"\u2014","du temps")}</div>
   ${n.some(r=>r.valeur!=null)?this._bars(n,r=>g(r),`kWh par jour : ${this._dayList(n,r=>`${g(r)} kWh`)}`,"kWh par jour"):u}
   <p class="note left">${t?"Le temps de chauffe suit la demande du thermostat : 50 % pendant une heure comptent une demi-heure. ":""}${e?.stat?"Les kWh viennent du compteur d\u2019\xE9nergie du thermostat.":e?"Le thermostat ne donne pas de compteur d\u2019\xE9nergie.":""}</p>`}_roomComfort(e,t){let n=[];return t.humidite!=null&&n.push(["Humidit\xE9",`${g(t.humidite,0)} %, ${t.humidite<40?"un peu sec":t.humidite>60?"humide : a\xE9rez quelques minutes":"bien"}.`]),t.fenetre&&n.push(["Fen\xEAtre",`Ouverte${t.fenetre_depuis?` depuis ${ce(new Date(t.fenetre_depuis))}`:""}.`]),t.pente!=null&&Math.abs(t.pente)>=.05&&n.push(["En ce moment",`La pi\xE8ce ${t.pente>0?"gagne":"perd"} ${g(Math.abs(t.pente))} \xB0C par heure.`]),t.consigne!=null&&n.push(["Consigne",`${F(t.consigne)}${t.planning?`, ${t.planning} au planning`:""}${t.prochain?`, puis ${this._next(t.prochain,e)}`:""}.`]),t.puissance_w&&n.push(["Puissance",`${bt(t.puissance_w)} en ce moment.`]),n.length?l`<div class="rows">${n.map(([s,r])=>l`<div class="row"><b>${s}</b><span>${r}</span></div>`)}</div>`:l`<p class="note">Rien d’autre à dire sur la pièce pour l’instant.</p>`}_planning(e){let t=e.planning,n=t.maintenant_min/14.4,s=t.prochains,r=l`<div class="head"><h2 class="nw-title">${this._config.name||"Planning du jour"}</h2><span class="nw-chip calm">${t.jour_nom}</span>${this._info("planning","Ouvrir la page du planning")}</div>`;if(!t.lignes.length)return l`${r}<p class="empty">Aucun créneau pour l’instant : ils se règlent dans l’onglet Chauffage, page Planning.</p>`;let o=[...new Set(t.lignes.flatMap(c=>c.segments.map(p=>p.ton)))];return l`${r}<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(c=>l`<span style=${`left:${c/24*100}%`}>${c} h</span>`)}</div></div>
   ${t.lignes.map(c=>l`<div class="lane"><span class="n">${c.nom}${c.source?l`<small class=${c.bloque?"bad":""}>${c.source}${c.bloque?" \xB7 deux plannings":""}</small>`:u}</span><div class="track" role="img" aria-label=${c.nom}>${c.segments.map(p=>l`<i class=${"t-"+p.ton} style=${`left:${p.de/14.4}%;width:${(p.a-p.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${n}%`}></span></div></div>`)}</div>
   <div class="nw-legend">${o.map(c=>l`<span><i class=${"sw t-"+c}></i>${Ue[c]??c}</span>`)}</div>
   <div class="nw-stats"><div><span>Prochain changement</span><b>${s[0]?`${$t(s[0].a)} \xB7 ${s[0].texte}`:"\u2014"}</b></div>
    <div><span>Ensuite</span><b>${s[1]?`${$t(s[1].a)} \xB7 ${s[1].texte}`:"\u2014"}</b></div><div><span>Réglé par</span><b>${t.source??"\u2014"}</b></div></div>
   ${t.labo||t.essai?l`<p class="note">${t.labo?"Thermostats recopi\xE9s d\u2019une autre maison : les plannings Hestia ne leur envoient rien.":"Un planning Hestia est en pause : il montre ce qu\u2019il ferait, sans rien envoyer."}</p>`:u}`}};customElements.get("hestia-heating-card")||customElements.define("hestia-heating-card",St);var Ke=window;Ke.customCards=Ke.customCards??[];Ke.customCards.some(i=>i.type==="hestia-heating-card")||Ke.customCards.push({type:"hestia-heating-card",name:"Hestia Chauffage",description:"Le chauffage de la maison : qui chauffe, chaque pi\xE8ce, le po\xEAle, le planning.",preview:!0});})();

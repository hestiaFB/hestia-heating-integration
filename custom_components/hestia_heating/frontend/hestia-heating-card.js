// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var O=globalThis,N=O.ShadowRoot&&(O.ShadyCSS===void 0||O.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,X=Symbol(),pe=new WeakMap,P=class{constructor(t,n,e){if(this._$cssResult$=!0,e!==X)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=n}get styleSheet(){let t=this.o,n=this.t;if(N&&t===void 0){let e=n!==void 0&&n.length===1;e&&(t=pe.get(n)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&pe.set(n,t))}return t}toString(){return this.cssText}},M=s=>new P(typeof s=="string"?s:s+"",void 0,X),K=(s,...t)=>{let n=s.length===1?s[0]:t.reduce((e,a,r)=>e+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+s[r+1],s[0]);return new P(n,s,X)},de=(s,t)=>{if(N)s.adoptedStyleSheets=t.map(n=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of t){let e=document.createElement("style"),a=O.litNonce;a!==void 0&&e.setAttribute("nonce",a),e.textContent=n.cssText,s.appendChild(e)}},G=N?s=>s:s=>s instanceof CSSStyleSheet?(t=>{let n="";for(let e of t.cssRules)n+=e.cssText;return M(n)})(s):s;var{is:Te,defineProperty:qe,getOwnPropertyDescriptor:je,getOwnPropertyNames:He,getOwnPropertySymbols:De,getPrototypeOf:Ue}=Object,W=globalThis,he=W.trustedTypes,Oe=he?he.emptyScript:"",Ne=W.reactiveElementPolyfillSupport,R=(s,t)=>s,Y={toAttribute(s,t){switch(t){case Boolean:s=s?Oe:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,t){let n=s;switch(t){case Boolean:n=s!==null;break;case Number:n=s===null?null:Number(s);break;case Object:case Array:try{n=JSON.parse(s)}catch{n=null}}return n}},ge=(s,t)=>!Te(s,t),ue={attribute:!0,type:String,converter:Y,reflect:!1,useDefault:!1,hasChanged:ge};Symbol.metadata??=Symbol("metadata"),W.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,n=ue){if(n.state&&(n.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((n=Object.create(n)).wrapped=!0),this.elementProperties.set(t,n),!n.noAccessor){let e=Symbol(),a=this.getPropertyDescriptor(t,e,n);a!==void 0&&qe(this.prototype,t,a)}}static getPropertyDescriptor(t,n,e){let{get:a,set:r}=je(this.prototype,t)??{get(){return this[n]},set(i){this[n]=i}};return{get:a,set(i){let c=a?.call(this);r?.call(this,i),this.requestUpdate(t,c,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??ue}static _$Ei(){if(this.hasOwnProperty(R("elementProperties")))return;let t=Ue(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(R("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(R("properties"))){let n=this.properties,e=[...He(n),...De(n)];for(let a of e)this.createProperty(a,n[a])}let t=this[Symbol.metadata];if(t!==null){let n=litPropertyMetadata.get(t);if(n!==void 0)for(let[e,a]of n)this.elementProperties.set(e,a)}this._$Eh=new Map;for(let[n,e]of this.elementProperties){let a=this._$Eu(n,e);a!==void 0&&this._$Eh.set(a,n)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let n=[];if(Array.isArray(t)){let e=new Set(t.flat(1/0).reverse());for(let a of e)n.unshift(G(a))}else t!==void 0&&n.push(G(t));return n}static _$Eu(t,n){let e=n.attribute;return e===!1?void 0:typeof e=="string"?e:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,n=this.constructor.elementProperties;for(let e of n.keys())this.hasOwnProperty(e)&&(t.set(e,this[e]),delete this[e]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return de(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,n,e){this._$AK(t,e)}_$ET(t,n){let e=this.constructor.elementProperties.get(t),a=this.constructor._$Eu(t,e);if(a!==void 0&&e.reflect===!0){let r=(e.converter?.toAttribute!==void 0?e.converter:Y).toAttribute(n,e.type);this._$Em=t,r==null?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(t,n){let e=this.constructor,a=e._$Eh.get(t);if(a!==void 0&&this._$Em!==a){let r=e.getPropertyOptions(a),i=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Y;this._$Em=a;let c=i.fromAttribute(n,r.type);this[a]=c??this._$Ej?.get(a)??c,this._$Em=null}}requestUpdate(t,n,e,a=!1,r){if(t!==void 0){let i=this.constructor;if(a===!1&&(r=this[t]),e??=i.getPropertyOptions(t),!((e.hasChanged??ge)(r,n)||e.useDefault&&e.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(i._$Eu(t,e))))return;this.C(t,n,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,n,{useDefault:e,reflect:a,wrapped:r},i){e&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,i??n??this[t]),r!==!0||i!==void 0)||(this._$AL.has(t)||(this.hasUpdated||e||(n=void 0),this._$AL.set(t,n)),a===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(n){Promise.reject(n)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,r]of this._$Ep)this[a]=r;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[a,r]of e){let{wrapped:i}=r,c=this[a];i!==!0||this._$AL.has(a)||c===void 0||this.C(a,void 0,r,c)}}let t=!1,n=this._$AL;try{t=this.shouldUpdate(n),t?(this.willUpdate(n),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(n)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(n)}willUpdate(t){}_$AE(t){this._$EO?.forEach(n=>n.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(n=>this._$ET(n,this[n])),this._$EM()}updated(t){}firstUpdated(t){}};f.elementStyles=[],f.shadowRootOptions={mode:"open"},f[R("elementProperties")]=new Map,f[R("finalized")]=new Map,Ne?.({ReactiveElement:f}),(W.reactiveElementVersions??=[]).push("2.1.2");var ae=globalThis,me=s=>s,V=ae.trustedTypes,fe=V?V.createPolicy("lit-html",{createHTML:s=>s}):void 0,ye="$lit$",b=`lit$${Math.random().toFixed(9).slice(2)}$`,_e="?"+b,We=`<${_e}>`,_=document,q=()=>_.createComment(""),j=s=>s===null||typeof s!="object"&&typeof s!="function",se=Array.isArray,Ve=s=>se(s)||typeof s?.[Symbol.iterator]=="function",J=`[ 	
\f\r]`,T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,we=/-->/g,ve=/>/g,$=RegExp(`>|${J}(?:([^\\s"'>=/]+)(${J}*=${J}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),be=/'/g,xe=/"/g,ke=/^(?:script|style|textarea|title)$/i,re=s=>(t,...n)=>({_$litType$:s,strings:t,values:n}),p=re(1),B=re(2),rt=re(3),k=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),$e=new WeakMap,y=_.createTreeWalker(_,129);function Ae(s,t){if(!se(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return fe!==void 0?fe.createHTML(t):t}var Be=(s,t)=>{let n=s.length-1,e=[],a,r=t===2?"<svg>":t===3?"<math>":"",i=T;for(let c=0;c<n;c++){let o=s[c],l,u,d=-1,g=0;for(;g<o.length&&(i.lastIndex=g,u=i.exec(o),u!==null);)g=i.lastIndex,i===T?u[1]==="!--"?i=we:u[1]!==void 0?i=ve:u[2]!==void 0?(ke.test(u[2])&&(a=RegExp("</"+u[2],"g")),i=$):u[3]!==void 0&&(i=$):i===$?u[0]===">"?(i=a??T,d=-1):u[1]===void 0?d=-2:(d=i.lastIndex-u[2].length,l=u[1],i=u[3]===void 0?$:u[3]==='"'?xe:be):i===xe||i===be?i=$:i===we||i===ve?i=T:(i=$,a=void 0);let v=i===$&&s[c+1].startsWith("/>")?" ":"";r+=i===T?o+We:d>=0?(e.push(l),o.slice(0,d)+ye+o.slice(d)+b+v):o+b+(d===-2?c:v)}return[Ae(s,r+(s[n]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),e]},H=class s{constructor({strings:t,_$litType$:n},e){let a;this.parts=[];let r=0,i=0,c=t.length-1,o=this.parts,[l,u]=Be(t,n);if(this.el=s.createElement(l,e),y.currentNode=this.el.content,n===2||n===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(a=y.nextNode())!==null&&o.length<c;){if(a.nodeType===1){if(a.hasAttributes())for(let d of a.getAttributeNames())if(d.endsWith(ye)){let g=u[i++],v=a.getAttribute(d).split(b),U=/([.?@])?(.*)/.exec(g);o.push({type:1,index:r,name:U[2],strings:v,ctor:U[1]==="."?Q:U[1]==="?"?ee:U[1]==="@"?te:S}),a.removeAttribute(d)}else d.startsWith(b)&&(o.push({type:6,index:r}),a.removeAttribute(d));if(ke.test(a.tagName)){let d=a.textContent.split(b),g=d.length-1;if(g>0){a.textContent=V?V.emptyScript:"";for(let v=0;v<g;v++)a.append(d[v],q()),y.nextNode(),o.push({type:2,index:++r});a.append(d[g],q())}}}else if(a.nodeType===8)if(a.data===_e)o.push({type:2,index:r});else{let d=-1;for(;(d=a.data.indexOf(b,d+1))!==-1;)o.push({type:7,index:r}),d+=b.length-1}r++}}static createElement(t,n){let e=_.createElement("template");return e.innerHTML=t,e}};function C(s,t,n=s,e){if(t===k)return t;let a=e!==void 0?n._$Co?.[e]:n._$Cl,r=j(t)?void 0:t._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),r===void 0?a=void 0:(a=new r(s),a._$AT(s,n,e)),e!==void 0?(n._$Co??=[])[e]=a:n._$Cl=a),a!==void 0&&(t=C(s,a._$AS(s,t.values),a,e)),t}var Z=class{constructor(t,n){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=n}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:n},parts:e}=this._$AD,a=(t?.creationScope??_).importNode(n,!0);y.currentNode=a;let r=y.nextNode(),i=0,c=0,o=e[0];for(;o!==void 0;){if(i===o.index){let l;o.type===2?l=new D(r,r.nextSibling,this,t):o.type===1?l=new o.ctor(r,o.name,o.strings,this,t):o.type===6&&(l=new ne(r,this,t)),this._$AV.push(l),o=e[++c]}i!==o?.index&&(r=y.nextNode(),i++)}return y.currentNode=_,a}p(t){let n=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(t,e,n),n+=e.strings.length-2):e._$AI(t[n])),n++}},D=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,n,e,a){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=n,this._$AM=e,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,n=this._$AM;return n!==void 0&&t?.nodeType===11&&(t=n.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,n=this){t=C(this,t,n),j(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==k&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Ve(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&j(this._$AH)?this._$AA.nextSibling.data=t:this.T(_.createTextNode(t)),this._$AH=t}$(t){let{values:n,_$litType$:e}=t,a=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=H.createElement(Ae(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===a)this._$AH.p(n);else{let r=new Z(a,this),i=r.u(this.options);r.p(n),this.T(i),this._$AH=r}}_$AC(t){let n=$e.get(t.strings);return n===void 0&&$e.set(t.strings,n=new H(t)),n}k(t){se(this._$AH)||(this._$AH=[],this._$AR());let n=this._$AH,e,a=0;for(let r of t)a===n.length?n.push(e=new s(this.O(q()),this.O(q()),this,this.options)):e=n[a],e._$AI(r),a++;a<n.length&&(this._$AR(e&&e._$AB.nextSibling,a),n.length=a)}_$AR(t=this._$AA.nextSibling,n){for(this._$AP?.(!1,!0,n);t!==this._$AB;){let e=me(t).nextSibling;me(t).remove(),t=e}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,n,e,a,r){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=n,this._$AM=a,this.options=r,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=h}_$AI(t,n=this,e,a){let r=this.strings,i=!1;if(r===void 0)t=C(this,t,n,0),i=!j(t)||t!==this._$AH&&t!==k,i&&(this._$AH=t);else{let c=t,o,l;for(t=r[0],o=0;o<r.length-1;o++)l=C(this,c[e+o],n,o),l===k&&(l=this._$AH[o]),i||=!j(l)||l!==this._$AH[o],l===h?t=h:t!==h&&(t+=(l??"")+r[o+1]),this._$AH[o]=l}i&&!a&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},Q=class extends S{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},ee=class extends S{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},te=class extends S{constructor(t,n,e,a,r){super(t,n,e,a,r),this.type=5}_$AI(t,n=this){if((t=C(this,t,n,0)??h)===k)return;let e=this._$AH,a=t===h&&e!==h||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,r=t!==h&&(e===h||a);a&&this.element.removeEventListener(this.name,this,e),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},ne=class{constructor(t,n,e){this.element=t,this.type=6,this._$AN=void 0,this._$AM=n,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(t){C(this,t)}};var Fe=ae.litHtmlPolyfillSupport;Fe?.(H,D),(ae.litHtmlVersions??=[]).push("3.3.3");var Ce=(s,t,n)=>{let e=n?.renderBefore??t,a=e._$litPart$;if(a===void 0){let r=n?.renderBefore??null;e._$litPart$=a=new D(t.insertBefore(q(),r),r,void 0,n??{})}return a._$AI(s),a};var ie=globalThis,m=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){let n=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Ce(n,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return k}};m._$litElement$=!0,m.finalized=!0,ie.litElementHydrateSupport?.({LitElement:m});var Ie=ie.litElementPolyfillSupport;Ie?.({LitElement:m});(ie.litElementVersions??=[]).push("4.2.2");var Se=`/* CHARTE COMMUNE HESTIA \u2014 jetons et pi\xE8ces partag\xE9s par toutes les cartes Hestia.
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
`;var Ee=`/* Hestia Chauffage's own pieces, on top of the shared charter (ui/hestia-charte.css): the stove's colour, the house
   band, the rooms' list, the flame gauge, the day's curves and the planning's lanes (cards' mock-up of 20 Nov. 2026). */
:host { display:block; --hc-stove: var(--hestia-stove-color, oklch(.86 .1 80)); --hc-off: color-mix(in srgb, var(--nw-fg) 30%, transparent); }
ha-card { padding:18px; display:flex; flex-direction:column; gap:12px; container-type:inline-size; min-width:0; box-sizing:border-box; }
.head { display:flex; align-items:center; gap:10px; min-width:0; }
.head .nw-title { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.nw-chip.stove { --c:var(--hc-stove); } .nw-chip.heat { --c:var(--nw-heat); } .nw-chip.cold { --c:var(--nw-cold); } .nw-chip.calm { --c:var(--nw-calm); }
.nw-chip.act { --c:var(--nw-act); } .nw-chip.alert { --c:var(--nw-alert); } .nw-chip.off { --c:var(--hc-off); }
.band { --c:var(--nw-calm); padding:16px; border-radius:16px; border:1px solid var(--nw-line); background:color-mix(in oklab, var(--c) 16%, var(--nw-bg)); }
.band.chauffe { --c:var(--hc-stove); } .band.rafraichit { --c:var(--nw-cold); }
.band .kicker { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:4px; font-size:var(--nw-fs-label); line-height:14px; font-weight:650; letter-spacing:.08em; text-transform:uppercase; }
.band .kicker i { font-style:normal; text-transform:none; letter-spacing:0; font-weight:600; color:var(--nw-fg2); }
.band .title { font-size:min(var(--nw-fs-value), 8cqi); font-weight:650; letter-spacing:-.03em; line-height:1.1; text-wrap:balance; }
.band .line { margin-top:6px; color:var(--nw-fg2); }
.band .line b { color:var(--nw-fg); font-weight:650; }
.rooms { display:flex; flex-direction:column; }
.room { display:grid; grid-template-columns:1fr auto auto; gap:10px; align-items:center; padding:8px 2px; border-top:1px solid color-mix(in srgb, var(--nw-fg) 6%, transparent);
  background:none; border-left:0; border-right:0; border-bottom:0; text-align:left; cursor:pointer; width:100%; box-sizing:border-box; }
.room:first-child { border-top:0; }
.room .n { font-weight:600; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.room .t { font-variant-numeric:tabular-nums; font-weight:650; text-align:right; white-space:nowrap; }
.room .t small { font-weight:500; color:var(--nw-fg2); }
.demand { width:56px; height:6px; border-radius:3px; background:color-mix(in srgb, var(--nw-fg) 8%, transparent); overflow:hidden; }
.demand i, .bar i { display:block; height:100%; border-radius:3px; background:color-mix(in oklab, var(--nw-heat) 80%, var(--nw-fg) 10%); }
.bar { height:8px; border-radius:4px; background:color-mix(in srgb, var(--nw-fg) 8%, transparent); overflow:hidden; margin:8px 0; }
.reading { display:flex; align-items:flex-end; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.temp { font-size:min(var(--nw-fs-temp), 15cqi); font-weight:300; letter-spacing:-.05em; line-height:1; position:relative; padding-right:24px; width:fit-content; }
.temp sup { position:absolute; right:0; top:.3em; font-size:var(--nw-fs-text); font-weight:500; letter-spacing:0; color:var(--nw-fg2); }
.target { text-align:right; }
.target b { display:block; font-size:var(--nw-fs-case); font-weight:600; letter-spacing:-.015em; }
.slope { font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-top:4px; }
.flame-row { display:flex; justify-content:space-between; align-items:center; gap:12px; }
.flames { display:flex; gap:5px; align-items:flex-end; height:46px; }
.flames i { display:block; width:13px; border-radius:4px; background:color-mix(in oklab, var(--hc-stove) 30%, transparent); }
.flames i.on { background:color-mix(in oklab, var(--hc-stove) 92%, var(--nw-fg) 8%); }
.flames i.ask { outline:2px dashed var(--nw-fg2); outline-offset:2px; }
.chart { width:100%; height:auto; display:block; overflow:visible; }
.chart text { font-size:9px; fill:var(--nw-fg2); font-family:inherit; }
.chart .grid { stroke:color-mix(in srgb, var(--nw-fg) 10%, transparent); stroke-width:1; }
.chart .now { stroke:var(--nw-fg2); stroke-width:1; }
.chart path { fill:none; stroke-width:2; vector-effect:non-scaling-stroke; stroke-linejoin:round; }
.chart .flame { stroke:var(--hc-stove); } .chart .flame.area { fill:color-mix(in oklab, var(--hc-stove) 22%, transparent); stroke:none; }
.chart .temp { stroke:var(--nw-heat); } .chart .salon { stroke:var(--nw-cold); stroke-dasharray:4 4; }
.chart .target { stroke:var(--nw-fg2); stroke-dasharray:3 3; stroke-width:1.5; }
.sw { width:12px; height:8px; border-radius:2px; display:inline-block; }
.sw.flame { background:var(--hc-stove); } .sw.temp { background:var(--nw-heat); } .sw.salon { background:var(--nw-cold); } .sw.target { background:var(--nw-fg2); }
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
@container (max-width:420px) { .lane, .hours { grid-template-columns:78px 1fr; } .target { text-align:left; } ha-card { padding:14px; } }
`;var Ge=[["maison","mdi:home-thermometer-outline","La maison","qui chauffe, chaque pi\xE8ce, le froid de la nuit"],["poele","mdi:fireplace","Le po\xEAle","sa flamme, sa journ\xE9e, ses fum\xE9es, le stock"],["piece","mdi:thermometer","Une pi\xE8ce","sa temp\xE9rature, sa consigne, sa journ\xE9e"],["planning","mdi:calendar-clock","Le planning","la journ\xE9e de chaque pi\xE8ce et du po\xEAle"]],Ye=s=>{s.preventDefault(),history.pushState(null,"",s.currentTarget.getAttribute("href")??"/hestia/chauffage"),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))},oe=class extends m{constructor(){super(...arguments);this.rooms=[]}static{this.properties={hass:{attribute:!1},config:{state:!0},rooms:{state:!0}}}static{this.styles=K`.note{color:var(--secondary-text-color);font-size:12px;line-height:1.6;margin:0 0 16px}a{color:var(--primary-color)}
  .formats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:4px 0 16px}
  .formats button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;color:var(--primary-text-color);font-size:12px;line-height:1.45}
  .formats button:hover{border-color:var(--secondary-text-color)}
  .formats button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .formats button.on{border:2px solid var(--primary-color);padding:9px 11px}
  .formats ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}.formats button.on ha-icon{color:var(--primary-color)}
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}
  label{display:flex;align-items:center;gap:10px;margin:0 0 14px;font-size:14px;color:var(--primary-text-color)}
  select{font:inherit;padding:6px 8px;border-radius:8px;border:1px solid var(--divider-color);background:var(--card-background-color);color:var(--primary-text-color)}`}setConfig(n){this.config={...n}}connectedCallback(){super.connectedCallback(),this.loadRooms()}async loadRooms(){try{let n=await this.hass?.callWS?.({type:"hestia_heating/view"});this.rooms=(n?.pieces??[]).map(e=>({id:e.id,nom:e.nom}))}catch{}}set(n){let e={...this.config,...n};e.name||delete e.name,e.card==="maison"&&delete e.card,e.card!=="piece"&&(delete e.piece,delete e.court),e.court||delete e.court,this.config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}render(){if(!this.config)return h;let n=this.config.card??"maison";return p`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${Ye}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${Ge.map(([e,a,r,i])=>p`<button type="button" role="radio" aria-checked=${e===n}
     class=${e===n?"on":""} @click=${()=>{e!==n&&this.set({card:e,...e==="piece"&&!this.config.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{}})}}><ha-icon icon=${a}></ha-icon><b>${r}</b><span>${i}</span></button>`)}</div>
   ${n==="piece"?p`<label>Pièce <select @change=${e=>this.set({piece:e.target.value})}>
     ${this.rooms.map(e=>p`<option value=${e.id} ?selected=${this.config.piece===e.id}>${e.nom}</option>`)}</select></label>
    <label><input type="checkbox" .checked=${!!this.config.court} @change=${e=>this.set({court:e.target.checked})}> Version courte, sur une ligne</label>`:h}
   <ha-form .hass=${this.hass} .data=${{name:this.config.name??""}} .schema=${[{name:"name",selector:{text:{}}}]}
     .computeLabel=${()=>"Titre facultatif"} .computeHelper=${()=>"Vide : le titre de la carte."}
     @value-changed=${e=>{e.stopPropagation(),this.set({name:(e.detail.value.name??"").trim()})}}></ha-form>`}};customElements.get("hestia-heating-card-editor")||customElements.define("hestia-heating-card-editor",oe);var E=new WeakMap;function ze(s,t){E.get(s)===t&&E.delete(s),clearTimeout(t.closing),t.stop?.then(n=>n()).catch(()=>{})}function Le(s,t,n,e){let a=E.get(s),r={view:t,error:n,reload:e};if(a){clearTimeout(a.closing),a.closing=void 0;let c=a.last;c&&queueMicrotask(()=>{a.listeners.has(r)&&t(c)})}else{let c={listeners:new Set};a=c,E.set(s,c),c.stop=s.subscribeMessage(o=>{if(o.reload){ze(s,c);for(let u of[...c.listeners])u.reload();return}let l;if(o.changes){if(!c.last)return;l={...c.last,...o.changes};for(let u of o.removed??[])delete l[u]}else if(o.view)l=o.view;else return;c.last=l;for(let u of[...c.listeners])u.view(l)},{type:"hestia_heating/subscribe"}),c.stop.catch(o=>{E.get(s)===c&&E.delete(s);for(let l of[...c.listeners])l.error(o)})}let i=a;return i.listeners.add(r),()=>{!i.listeners.delete(r)||i.listeners.size||(clearTimeout(i.closing),i.closing=setTimeout(()=>{i.listeners.size||ze(s,i)},5e3))}}var Pe=["maison","poele","piece","planning"],w=(s,t=1)=>s.toLocaleString("fr-FR",{maximumFractionDigits:t}).replace("-","\u2212"),z=s=>s==null?"\u2014":`${w(s)} \xB0C`,Me=s=>s==null?"\u2014":s>=500?`${w(s/1e3)} kW`:`${w(s,0)} W`,L=s=>s.getMinutes()?`${s.getHours()}\xA0h\xA0${String(s.getMinutes()).padStart(2,"0")}`:`${s.getHours()}\xA0h`,Je=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];function F(s){let t=new Date(s),n=new Date,e=new Date(n);return e.setDate(e.getDate()+1),t.toDateString()===n.toDateString()?L(t):t.toDateString()===e.toDateString()?`demain ${L(t)}`:`${Je[t.getDay()]} ${L(t)}`}var le={eteint:"\xE9teint",allumage:"allumage",chauffe:"chauffe",nettoyage:"nettoyage",extinction:"extinction",alarme:"alarme",inconnu:"inconnu"},Ze={poele:"po\xEAle en chauffe",confort:"confort",eco:"\xE9co",hors_gel:"hors gel",boost:"boost",arret:"arr\xEAt"},A=400,x=80;function Qe(s,t){let n=[],e=null;for(let[i,c]of s){if(c==null){e=null;continue}e||(e=[],n.push(e)),e.push([i,c])}let a=s.at(-1),r=n.at(-1);return r&&a?.[1]!=null&&t!=null&&t>r.at(-1)[0]&&r.push([t,r.at(-1)[1]]),n}function et(s,t,n,e=!1,a){let r=l=>(l/1440*A).toFixed(1),i=l=>(x-6-(l-t)/(n-t||1)*(x-12)).toFixed(1),c=l=>l.map(([u,d],g)=>g===0?`M${r(u)} ${i(d)}`:e?`H${r(u)}V${i(d)}`:`L${r(u)} ${i(d)}`).join(""),o=Qe(s,a);return{line:o.map(c).join(""),area:o.map(l=>`M${r(l[0][0])} ${x}`+c(l).replace(/^M/,"L")+`V${x}Z`).join("")}}function Re(s,t,n){let e=s.filter(i=>i.lo==null).flatMap(i=>i.pts.map(c=>c[1])).filter(i=>i!=null),a=e.length?Math.floor(Math.min(...e)-.5):15,r=e.length?Math.ceil(Math.max(...e)+.5):22;return p`<svg class="chart" viewBox="0 0 ${A} ${x+14}" role="img" aria-label=${n}>
  ${[0,360,720,1080].map(i=>B`<line class="grid" x1=${i/1440*A} x2=${i/1440*A} y1="0" y2=${x}></line><text x=${i/1440*A+2} y=${x+12}>${i/60} h</text>`)}
  ${s.map(i=>{let c=et(i.pts,i.lo??a,i.hi??r,i.step,t);return c.line?B`${i.fill?B`<path class=${i.cls+" area"} d=${c.area}></path>`:h}<path class=${i.cls} d=${c.line}></path>`:h})}
  <line class="now" x1=${t/1440*A} x2=${t/1440*A} y1="0" y2=${x}></line></svg>`}var ce=class extends m{constructor(){super(...arguments);this._config={type:"custom:hestia-heating-card",card:"maison"};this._dayAt=0;this._dayFor=""}static{this.styles=[M(Se),M(Ee)]}static{this.properties={_view:{state:!0},_day:{state:!0},_error:{state:!0}}}static getStubConfig(){return{card:"maison"}}static getConfigElement(){return document.createElement("hestia-heating-card-editor")}setConfig(n){let e=n.card??"maison";if(!Pe.includes(e))throw new Error(`card: ${e} ? (${Pe.join(", ")})`);this._config={...n,card:e}}getCardSize(){let n=this._config.card;return n==="piece"&&this._config.court?2:n==="planning"?6:5}getGridOptions(){return this._config.card==="planning"?{columns:"full",rows:"auto"}:{columns:12,rows:"auto",min_columns:6}}set hass(n){let e=this._hass?.connection!==n.connection;this._hass=n,this.setAttribute("theme",n.themes?.darkMode===!1?"light":"dark"),(e||!this._stop)&&this._follow()}connectedCallback(){super.connectedCallback(),this._follow()}disconnectedCallback(){super.disconnectedCallback(),this._unfollow()}_unfollow(){this._stop?.(),this._stop=void 0,window.clearTimeout(this._again)}_follow(){this._unfollow(),!(!this._hass||!this.isConnected)&&(this._stop=Le(this._hass.connection,n=>{this._view=n,this._error=void 0,this._maybeDay()},n=>{this._stop=void 0,this._error=n.message??"Hestia Chauffage ne r\xE9pond pas.",this._again=window.setTimeout(()=>this._follow(),3e4)},()=>{this._stop=void 0,this._again=window.setTimeout(()=>this._follow(),2e3)}))}_maybeDay(){let n=this._config,e=n.card==="poele"?"poele":n.card==="piece"&&!n.court&&n.piece?`piece/${n.piece}`:"";!e||!this._hass||e===this._dayFor&&Date.now()-this._dayAt<12e4||(this._dayFor=e,this._dayAt=Date.now(),this._hass.callWS({type:"hestia_heating/day",cible:e}).then(a=>{this._day=a}).catch(()=>{}))}_open(n){history.pushState(null,"","/hestia/chauffage"+(n?"/"+n:"")),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}_info(n,e){return p`<button class="nw-info" aria-label=${e} @click=${()=>this._open(n)}></button>`}_chip(n){return p`<span class=${"nw-chip "+n.ton}>${n.texte}</span>`}render(){let n=this._view;if(this._error)return p`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;if(!n||!n.pret)return p`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;let e=this._config.card;return p`<ha-card>${e==="poele"?this._stove(n):e==="piece"?this._room(n):e==="planning"?this._planning(n):this._house(n)}</ha-card>`}_house(n){let e=n.maison,a=n.dehors,r=n.planning.prochains,i=new Date,c=n.granules,o=p`${e.temperature!=null?p`La maison est à <b>${z(e.temperature)}</b>. `:h}${a?.nuit_min!=null?p`Cette nuit <b>${z(a.nuit_min)}</b> dehors. `:h}${r.length?p`Ensuite : ${r.slice(0,2).map(l=>`${l.texte} ${F(l.a)}`).join(", ")}.`:h}`;return p`<div class="head"><h2 class="nw-title">${this._config.name||"Chauffage"}</h2>${this._info("","Ouvrir l\u2019onglet Chauffage")}</div>
   <div class=${"band "+e.etat}><div class="kicker">Maintenant <i>${L(i)}</i></div><div class="title">${e.titre}</div><div class="line">${o}</div></div>
   <div class="rooms">${n.pieces.map(l=>p`<button class="room" @click=${()=>this._open("pieces/"+l.id)}><span class="n">${l.nom}</span>
    ${l.etat==="chauffe"&&!l.poele&&l.demande_pct!=null&&!l.fenetre?p`<span class="demand" role="img" aria-label=${`Demande ${l.demande_pct} %`}><i style=${`width:${l.demande_pct}%`}></i></span>`:this._chip(l.badge)}
    <span class="t">${l.temperature!=null?w(l.temperature):"\u2014"}${l.consigne!=null?p` <small>/ ${w(l.consigne)}</small>`:h}</span></button>`)}</div>
   <div class="nw-stats"><div><span>En chauffe</span><b>${e.en_chauffe} sur ${e.pieces}</b></div><div><span>Électrique</span><b>${Me(e.electrique_w)}</b></div>
    ${c?.jours!=null?p`<div><span>Granulés</span><b>${c.jours} jours</b></div>`:a?.demain_max!=null?p`<div><span>Demain après-midi</span><b>${z(a.demain_max)}</b></div>`:p`<div><span>Pièces</span><b>${e.pieces}</b></div>`}</div>`}_stove(n){let e=n.poele;if(!e)return p`<div class="head"><h2 class="nw-title">${this._config.name||"Po\xEAle"}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;let a=e.flamme_max,r=e.flamme,i=e.flamme_reglee,c=this._day,o=n.granules,l=n.pieces.find(d=>d.poele),u=e.en_feu&&e.demande_pct!=null?`Le thermostat demande ${e.demande_pct} %${e.depuis?`. Depuis ${L(new Date(e.depuis))}`:""}.`:e.depuis?`${le[e.etat][0].toUpperCase()+le[e.etat].slice(1)} depuis ${L(new Date(e.depuis))}.`:"";return p`<div class="head"><h2 class="nw-title">${this._config.name||e.nom}</h2>${this._chip({texte:le[e.etat],ton:e.etat==="alarme"?"alert":e.en_feu?"stove":"off"})}${this._info("poele","Ouvrir la page du po\xEAle")}</div>
   <div class="nw-panel flame-row"><div><div class="nw-value"><b>${r!=null?`Flamme ${r}`:"Flamme \u2014"}</b><span>sur ${a}</span></div><div class="nw-say">${u}</div></div>
    <div class="flames" aria-hidden="true">${Array.from({length:a},(d,g)=>g+1).map(d=>p`<i class=${(r!=null&&d<=r?"on":"")+(i===d?" ask":"")} style=${`height:${14+d*(32/a)}px`}></i>`)}</div></div>
   ${c&&(c.series.flamme?.length||c.series.temperature?.length)?p`${Re([{pts:c.series.flamme??[],cls:"flame",step:!0,fill:!0,lo:0,hi:a},{pts:c.series.temperature??[],cls:"salon"}],c.maintenant_min,"Flamme du po\xEAle et temp\xE9rature de la pi\xE8ce aujourd\u2019hui")}
    <div class="nw-legend"><span><i class="sw flame"></i>flamme</span><span><i class="sw salon"></i>${l?l.nom.toLowerCase():"pi\xE8ce"}</span></div>`:h}
   <div class="nw-stats" style="--n:4"><div><span>Fumées</span><b>${z(e.fumees)}</b></div>
    ${e.prise?p`<div><span>Prise</span><b>${Me(e.prise_w)}</b></div>`:p`<div><span>Alarme</span><b>${e.alarme?e.alarme_texte??"oui":"aucune"}</b></div>`}
    <div><span>Stock</span><b>${o?.stock_sacs!=null?`${w(o.stock_sacs,0)} sacs`:"\u2014"}</b></div>
    <div><span>Ordres du jour</span><b>${e.ecritures!=null?`${e.ecritures}${e.ecritures_max?` / ${e.ecritures_max}`:""}`:"\u2014"}</b></div></div>`}_room(n){let e=n.pieces.find(c=>c.id===this._config.piece)??n.pieces[0];if(!e)return p`<div class="head"><h2 class="nw-title">${this._config.name||"Pi\xE8ce"}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;let a=this._config.name||e.nom;if(this._config.court)return p`<div class="short" role="button" tabindex="0" @click=${()=>this._open("pieces/"+e.id)}>
    <div class="temp">${e.temperature!=null?w(e.temperature):"\u2014"}<sup>°C</sup></div><div><b>${a}</b><span class="nw-say">${e.raison??(e.consigne!=null?`Consigne ${z(e.consigne)}`:"")}</span></div>${this._chip(e.badge)}</div>`;let r=this._day,i=e.pente!=null&&Math.abs(e.pente)>=.05?`${e.pente>0?"\u2197":"\u2198"} ${e.pente>0?"+":""}${w(e.pente)} \xB0C par heure`:null;return p`<div class="head"><h2 class="nw-title">${a}</h2>${this._chip(e.badge)}${this._info("pieces/"+e.id,"Ouvrir la page de la pi\xE8ce")}</div>
   <div class="reading"><div><div class="temp">${e.temperature!=null?w(e.temperature):"\u2014"}<sup>°C</sup></div>${i?p`<div class="slope">${i}</div>`:h}</div>
    ${e.consigne!=null?p`<div class="target"><span class="nw-label">Consigne</span><b>${z(e.consigne)}</b><span class="nw-say">${e.planning??""}${e.prochain?` jusqu\u2019\xE0 ${F(e.prochain.a)}`:""}</span></div>`:h}</div>
   ${e.demande_pct!=null&&!e.poele?p`<div class="nw-panel"><div class="flame-row"><span class="nw-label">Demande du thermostat</span><b>${e.demande_pct} %</b></div>
    <div class="bar"><i style=${`width:${e.demande_pct}%`}></i></div><div class="nw-say">${e.raison??""}</div></div>`:e.raison?p`<div class="nw-say">${e.raison}</div>`:h}
   ${r&&r.series.temperature?.length?p`${Re([{pts:r.series.temperature,cls:"temp"},{pts:r.series.consigne??[],cls:"target",step:!0}],r.maintenant_min,`Temp\xE9rature et consigne de ${e.nom} aujourd\u2019hui`)}
    <div class="nw-legend"><span><i class="sw temp"></i>température</span><span><i class="sw target"></i>consigne</span></div>`:h}`}_planning(n){let e=n.planning,a=e.maintenant_min/14.4,r=e.prochains,i=p`<div class="head"><h2 class="nw-title">${this._config.name||"Planning du jour"}</h2><span class="nw-chip calm">${e.jour_nom}</span>${this._info("planning","Ouvrir la page du planning")}</div>`;if(!e.lignes.length)return p`${i}<p class="empty">Aucun créneau pour l’instant : ils se règlent dans l’onglet Chauffage, page Planning.</p>`;let c=[...new Set(e.lignes.flatMap(o=>o.segments.map(l=>l.ton)))];return p`${i}<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(o=>p`<span style=${`left:${o/24*100}%`}>${o} h</span>`)}</div></div>
   ${e.lignes.map(o=>p`<div class="lane"><span class="n">${o.nom}${o.source?p`<small class=${o.bloque?"bad":""}>${o.source}${o.bloque?" \xB7 deux plannings":""}</small>`:h}</span><div class="track" role="img" aria-label=${o.nom}>${o.segments.map(l=>p`<i class=${"t-"+l.ton} style=${`left:${l.de/14.4}%;width:${(l.a-l.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${a}%`}></span></div></div>`)}</div>
   <div class="nw-legend">${c.map(o=>p`<span><i class=${"sw t-"+o}></i>${Ze[o]??o}</span>`)}</div>
   <div class="nw-stats"><div><span>Prochain changement</span><b>${r[0]?`${F(r[0].a)} \xB7 ${r[0].texte}`:"\u2014"}</b></div>
    <div><span>Ensuite</span><b>${r[1]?`${F(r[1].a)} \xB7 ${r[1].texte}`:"\u2014"}</b></div><div><span>Réglé par</span><b>${e.source??"\u2014"}</b></div></div>
   ${e.labo||e.essai?p`<p class="note">${e.labo?"Thermostats recopi\xE9s d\u2019une autre maison : les plannings Hestia ne leur envoient rien.":"Un planning Hestia est en essai : il montre ce qu\u2019il ferait, sans rien envoyer."}</p>`:h}`}};customElements.get("hestia-heating-card")||customElements.define("hestia-heating-card",ce);var I=window;I.customCards=I.customCards??[];I.customCards.some(s=>s.type==="hestia-heating-card")||I.customCards.push({type:"hestia-heating-card",name:"Hestia Chauffage",description:"Le chauffage de la maison : qui chauffe, chaque pi\xE8ce, le po\xEAle, le planning.",preview:!0});})();

// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var Ae=globalThis,Se=Ae.ShadowRoot&&(Ae.ShadyCSS===void 0||Ae.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,De=Symbol(),bt=new WeakMap,he=class{constructor(n,t,e){if(this._$cssResult$=!0,e!==De)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=n,this.t=t}get styleSheet(){let n=this.o,t=this.t;if(Se&&n===void 0){let e=t!==void 0&&t.length===1;e&&(n=bt.get(t)),n===void 0&&((this.o=n=new CSSStyleSheet).replaceSync(this.cssText),e&&bt.set(t,n))}return n}toString(){return this.cssText}},ge=s=>new he(typeof s=="string"?s:s+"",void 0,De),qe=(s,...n)=>{let t=s.length===1?s[0]:n.reduce((e,a,r)=>e+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+s[r+1],s[0]);return new he(t,s,De)},xt=(s,n)=>{if(Se)s.adoptedStyleSheets=n.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of n){let e=document.createElement("style"),a=Ae.litNonce;a!==void 0&&e.setAttribute("nonce",a),e.textContent=t.cssText,s.appendChild(e)}},Oe=Se?s=>s:s=>s instanceof CSSStyleSheet?(n=>{let t="";for(let e of n.cssRules)t+=e.cssText;return ge(t)})(s):s;var{is:cn,defineProperty:pn,getOwnPropertyDescriptor:dn,getOwnPropertyNames:un,getOwnPropertySymbols:hn,getPrototypeOf:gn}=Object,Ce=globalThis,$t=Ce.trustedTypes,mn=$t?$t.emptyScript:"",fn=Ce.reactiveElementPolyfillSupport,me=(s,n)=>s,Ue={toAttribute(s,n){switch(n){case Boolean:s=s?mn:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,n){let t=s;switch(n){case Boolean:t=s!==null;break;case Number:t=s===null?null:Number(s);break;case Object:case Array:try{t=JSON.parse(s)}catch{t=null}}return t}},yt=(s,n)=>!cn(s,n),_t={attribute:!0,type:String,converter:Ue,reflect:!1,useDefault:!1,hasChanged:yt};Symbol.metadata??=Symbol("metadata"),Ce.litPropertyMetadata??=new WeakMap;var N=class extends HTMLElement{static addInitializer(n){this._$Ei(),(this.l??=[]).push(n)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(n,t=_t){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(n)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(n,t),!t.noAccessor){let e=Symbol(),a=this.getPropertyDescriptor(n,e,t);a!==void 0&&pn(this.prototype,n,a)}}static getPropertyDescriptor(n,t,e){let{get:a,set:r}=dn(this.prototype,n)??{get(){return this[t]},set(i){this[t]=i}};return{get:a,set(i){let c=a?.call(this);r?.call(this,i),this.requestUpdate(n,c,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(n){return this.elementProperties.get(n)??_t}static _$Ei(){if(this.hasOwnProperty(me("elementProperties")))return;let n=gn(this);n.finalize(),n.l!==void 0&&(this.l=[...n.l]),this.elementProperties=new Map(n.elementProperties)}static finalize(){if(this.hasOwnProperty(me("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(me("properties"))){let t=this.properties,e=[...un(t),...hn(t)];for(let a of e)this.createProperty(a,t[a])}let n=this[Symbol.metadata];if(n!==null){let t=litPropertyMetadata.get(n);if(t!==void 0)for(let[e,a]of t)this.elementProperties.set(e,a)}this._$Eh=new Map;for(let[t,e]of this.elementProperties){let a=this._$Eu(t,e);a!==void 0&&this._$Eh.set(a,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(n){let t=[];if(Array.isArray(n)){let e=new Set(n.flat(1/0).reverse());for(let a of e)t.unshift(Oe(a))}else n!==void 0&&t.push(Oe(n));return t}static _$Eu(n,t){let e=t.attribute;return e===!1?void 0:typeof e=="string"?e:typeof n=="string"?n.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(n=>this.enableUpdating=n),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(n=>n(this))}addController(n){(this._$EO??=new Set).add(n),this.renderRoot!==void 0&&this.isConnected&&n.hostConnected?.()}removeController(n){this._$EO?.delete(n)}_$E_(){let n=new Map,t=this.constructor.elementProperties;for(let e of t.keys())this.hasOwnProperty(e)&&(n.set(e,this[e]),delete this[e]);n.size>0&&(this._$Ep=n)}createRenderRoot(){let n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xt(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(n=>n.hostConnected?.())}enableUpdating(n){}disconnectedCallback(){this._$EO?.forEach(n=>n.hostDisconnected?.())}attributeChangedCallback(n,t,e){this._$AK(n,e)}_$ET(n,t){let e=this.constructor.elementProperties.get(n),a=this.constructor._$Eu(n,e);if(a!==void 0&&e.reflect===!0){let r=(e.converter?.toAttribute!==void 0?e.converter:Ue).toAttribute(t,e.type);this._$Em=n,r==null?this.removeAttribute(a):this.setAttribute(a,r),this._$Em=null}}_$AK(n,t){let e=this.constructor,a=e._$Eh.get(n);if(a!==void 0&&this._$Em!==a){let r=e.getPropertyOptions(a),i=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Ue;this._$Em=a;let c=i.fromAttribute(t,r.type);this[a]=c??this._$Ej?.get(a)??c,this._$Em=null}}requestUpdate(n,t,e,a=!1,r){if(n!==void 0){let i=this.constructor;if(a===!1&&(r=this[n]),e??=i.getPropertyOptions(n),!((e.hasChanged??yt)(r,t)||e.useDefault&&e.reflect&&r===this._$Ej?.get(n)&&!this.hasAttribute(i._$Eu(n,e))))return;this.C(n,t,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(n,t,{useDefault:e,reflect:a,wrapped:r},i){e&&!(this._$Ej??=new Map).has(n)&&(this._$Ej.set(n,i??t??this[n]),r!==!0||i!==void 0)||(this._$AL.has(n)||(this.hasUpdated||e||(t=void 0),this._$AL.set(n,t)),a===!0&&this._$Em!==n&&(this._$Eq??=new Set).add(n))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let n=this.scheduleUpdate();return n!=null&&await n,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,r]of this._$Ep)this[a]=r;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[a,r]of e){let{wrapped:i}=r,c=this[a];i!==!0||this._$AL.has(a)||c===void 0||this.C(a,void 0,r,c)}}let n=!1,t=this._$AL;try{n=this.shouldUpdate(t),n?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(e){throw n=!1,this._$EM(),e}n&&this._$AE(t)}willUpdate(n){}_$AE(n){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(n)),this.updated(n)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(n){return!0}update(n){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(n){}firstUpdated(n){}};N.elementStyles=[],N.shadowRootOptions={mode:"open"},N[me("elementProperties")]=new Map,N[me("finalized")]=new Map,fn?.({ReactiveElement:N}),(Ce.reactiveElementVersions??=[]).push("2.1.2");var Ge=globalThis,kt=s=>s,Ee=Ge.trustedTypes,At=Ee?Ee.createPolicy("lit-html",{createHTML:s=>s}):void 0,zt="$lit$",I=`lit$${Math.random().toFixed(9).slice(2)}$`,Rt="?"+I,wn=`<${Rt}>`,Z=document,we=()=>Z.createComment(""),ve=s=>s===null||typeof s!="object"&&typeof s!="function",Ke=Array.isArray,vn=s=>Ke(s)||typeof s?.[Symbol.iterator]=="function",Ne=`[ 	
\f\r]`,fe=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,St=/-->/g,Ct=/>/g,Y=RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Et=/'/g,Mt=/"/g,jt=/^(?:script|style|textarea|title)$/i,Ye=s=>(n,...t)=>({_$litType$:s,strings:n,values:t}),l=Ye(1),y=Ye(2),ra=Ye(3),J=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Pt=new WeakMap,X=Z.createTreeWalker(Z,129);function Lt(s,n){if(!Ke(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return At!==void 0?At.createHTML(n):n}var bn=(s,n)=>{let t=s.length-1,e=[],a,r=n===2?"<svg>":n===3?"<math>":"",i=fe;for(let c=0;c<t;c++){let o=s[c],d,h,m=-1,$=0;for(;$<o.length&&(i.lastIndex=$,h=i.exec(o),h!==null);)$=i.lastIndex,i===fe?h[1]==="!--"?i=St:h[1]!==void 0?i=Ct:h[2]!==void 0?(jt.test(h[2])&&(a=RegExp("</"+h[2],"g")),i=Y):h[3]!==void 0&&(i=Y):i===Y?h[0]===">"?(i=a??fe,m=-1):h[1]===void 0?m=-2:(m=i.lastIndex-h[2].length,d=h[1],i=h[3]===void 0?Y:h[3]==='"'?Mt:Et):i===Mt||i===Et?i=Y:i===St||i===Ct?i=fe:(i=Y,a=void 0);let v=i===Y&&s[c+1].startsWith("/>")?" ":"";r+=i===fe?o+wn:m>=0?(e.push(d),o.slice(0,m)+zt+o.slice(m)+I+v):o+I+(m===-2?c:v)}return[Lt(s,r+(s[t]||"<?>")+(n===2?"</svg>":n===3?"</math>":"")),e]},be=class s{constructor({strings:n,_$litType$:t},e){let a;this.parts=[];let r=0,i=0,c=n.length-1,o=this.parts,[d,h]=bn(n,t);if(this.el=s.createElement(d,e),X.currentNode=this.el.content,t===2||t===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(a=X.nextNode())!==null&&o.length<c;){if(a.nodeType===1){if(a.hasAttributes())for(let m of a.getAttributeNames())if(m.endsWith(zt)){let $=h[i++],v=a.getAttribute(m).split(I),S=/([.?@])?(.*)/.exec($);o.push({type:1,index:r,name:S[2],strings:v,ctor:S[1]==="."?Be:S[1]==="?"?Fe:S[1]==="@"?Ve:re}),a.removeAttribute(m)}else m.startsWith(I)&&(o.push({type:6,index:r}),a.removeAttribute(m));if(jt.test(a.tagName)){let m=a.textContent.split(I),$=m.length-1;if($>0){a.textContent=Ee?Ee.emptyScript:"";for(let v=0;v<$;v++)a.append(m[v],we()),X.nextNode(),o.push({type:2,index:++r});a.append(m[$],we())}}}else if(a.nodeType===8)if(a.data===Rt)o.push({type:2,index:r});else{let m=-1;for(;(m=a.data.indexOf(I,m+1))!==-1;)o.push({type:7,index:r}),m+=I.length-1}r++}}static createElement(n,t){let e=Z.createElement("template");return e.innerHTML=n,e}};function se(s,n,t=s,e){if(n===J)return n;let a=e!==void 0?t._$Co?.[e]:t._$Cl,r=ve(n)?void 0:n._$litDirective$;return a?.constructor!==r&&(a?._$AO?.(!1),r===void 0?a=void 0:(a=new r(s),a._$AT(s,t,e)),e!==void 0?(t._$Co??=[])[e]=a:t._$Cl=a),a!==void 0&&(n=se(s,a._$AS(s,n.values),a,e)),n}var We=class{constructor(n,t){this._$AV=[],this._$AN=void 0,this._$AD=n,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(n){let{el:{content:t},parts:e}=this._$AD,a=(n?.creationScope??Z).importNode(t,!0);X.currentNode=a;let r=X.nextNode(),i=0,c=0,o=e[0];for(;o!==void 0;){if(i===o.index){let d;o.type===2?d=new xe(r,r.nextSibling,this,n):o.type===1?d=new o.ctor(r,o.name,o.strings,this,n):o.type===6&&(d=new Ie(r,this,n)),this._$AV.push(d),o=e[++c]}i!==o?.index&&(r=X.nextNode(),i++)}return X.currentNode=Z,a}p(n){let t=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(n,e,t),t+=e.strings.length-2):e._$AI(n[t])),t++}},xe=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(n,t,e,a){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=n,this._$AB=t,this._$AM=e,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let n=this._$AA.parentNode,t=this._$AM;return t!==void 0&&n?.nodeType===11&&(n=t.parentNode),n}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(n,t=this){n=se(this,n,t),ve(n)?n===u||n==null||n===""?(this._$AH!==u&&this._$AR(),this._$AH=u):n!==this._$AH&&n!==J&&this._(n):n._$litType$!==void 0?this.$(n):n.nodeType!==void 0?this.T(n):vn(n)?this.k(n):this._(n)}O(n){return this._$AA.parentNode.insertBefore(n,this._$AB)}T(n){this._$AH!==n&&(this._$AR(),this._$AH=this.O(n))}_(n){this._$AH!==u&&ve(this._$AH)?this._$AA.nextSibling.data=n:this.T(Z.createTextNode(n)),this._$AH=n}$(n){let{values:t,_$litType$:e}=n,a=typeof e=="number"?this._$AC(n):(e.el===void 0&&(e.el=be.createElement(Lt(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===a)this._$AH.p(t);else{let r=new We(a,this),i=r.u(this.options);r.p(t),this.T(i),this._$AH=r}}_$AC(n){let t=Pt.get(n.strings);return t===void 0&&Pt.set(n.strings,t=new be(n)),t}k(n){Ke(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,e,a=0;for(let r of n)a===t.length?t.push(e=new s(this.O(we()),this.O(we()),this,this.options)):e=t[a],e._$AI(r),a++;a<t.length&&(this._$AR(e&&e._$AB.nextSibling,a),t.length=a)}_$AR(n=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);n!==this._$AB;){let e=kt(n).nextSibling;kt(n).remove(),n=e}}setConnected(n){this._$AM===void 0&&(this._$Cv=n,this._$AP?.(n))}},re=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(n,t,e,a,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=n,this.name=t,this._$AM=a,this.options=r,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=u}_$AI(n,t=this,e,a){let r=this.strings,i=!1;if(r===void 0)n=se(this,n,t,0),i=!ve(n)||n!==this._$AH&&n!==J,i&&(this._$AH=n);else{let c=n,o,d;for(n=r[0],o=0;o<r.length-1;o++)d=se(this,c[e+o],t,o),d===J&&(d=this._$AH[o]),i||=!ve(d)||d!==this._$AH[o],d===u?n=u:n!==u&&(n+=(d??"")+r[o+1]),this._$AH[o]=d}i&&!a&&this.j(n)}j(n){n===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,n??"")}},Be=class extends re{constructor(){super(...arguments),this.type=3}j(n){this.element[this.name]=n===u?void 0:n}},Fe=class extends re{constructor(){super(...arguments),this.type=4}j(n){this.element.toggleAttribute(this.name,!!n&&n!==u)}},Ve=class extends re{constructor(n,t,e,a,r){super(n,t,e,a,r),this.type=5}_$AI(n,t=this){if((n=se(this,n,t,0)??u)===J)return;let e=this._$AH,a=n===u&&e!==u||n.capture!==e.capture||n.once!==e.once||n.passive!==e.passive,r=n!==u&&(e===u||a);a&&this.element.removeEventListener(this.name,this,e),r&&this.element.addEventListener(this.name,this,n),this._$AH=n}handleEvent(n){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,n):this._$AH.handleEvent(n)}},Ie=class{constructor(n,t,e){this.element=n,this.type=6,this._$AN=void 0,this._$AM=t,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(n){se(this,n)}};var xn=Ge.litHtmlPolyfillSupport;xn?.(be,xe),(Ge.litHtmlVersions??=[]).push("3.3.3");var Ht=(s,n,t)=>{let e=t?.renderBefore??n,a=e._$litPart$;if(a===void 0){let r=t?.renderBefore??null;e._$litPart$=a=new xe(n.insertBefore(we(),r),r,void 0,t??{})}return a._$AI(s),a};var Xe=globalThis,H=class extends N{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let n=super.createRenderRoot();return this.renderOptions.renderBefore??=n.firstChild,n}update(n){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(n),this._$Do=Ht(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return J}};H._$litElement$=!0,H.finalized=!0,Xe.litElementHydrateSupport?.({LitElement:H});var $n=Xe.litElementPolyfillSupport;$n?.({LitElement:H});(Xe.litElementVersions??=[]).push("4.2.2");var Tt=`/* CHARTE COMMUNE HESTIA \u2014 jetons et pi\xE8ces partag\xE9s par toutes les cartes Hestia.
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
`;var Dt=`/* Hestia Chauffage's own pieces, on top of the shared charter (ui/hestia-charte.css): the stove's colour, the house
   band, the rooms' list, the planning's lanes (cards' mock-up of 20 Nov. 2026), and the clock cards of the room and the stove
   with their drawers (24 Nov. 2026). */
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
ha-card.clock { padding:0; gap:0; overflow:hidden; }
.top { padding:22px; display:flex; flex-direction:column; gap:16px; }
.chead { display:grid; grid-template-columns:minmax(0, 1fr) auto auto; grid-template-areas:"ttl pills gear"; align-items:center; gap:8px; }
.ttl { grid-area:ttl; min-width:0; }
.ttl .nw-title { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ttl .sub { font-size:var(--nw-fs-small); color:var(--nw-fg2); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
/* 1.0: the stove's sentence under its name, coloured by its tone (engine/stove_says.py). */
.ttl .sub .say { display:block; white-space:normal; font-weight:600; color:var(--nw-fg); }
.ttl .sub .say.alert, .ttl .sub .say.act { color:color-mix(in oklab, var(--c) var(--nw-ink), var(--nw-fg)); }
.ttl .sub .say.alert { --c:var(--nw-alert); } .ttl .sub .say.act { --c:var(--nw-act); }
.ttl .sub .say.off { font-weight:500; color:var(--nw-fg2); }
.pills { grid-area:pills; display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end; min-width:0; }
.gear { grid-area:gear; flex:none; width:40px; height:40px; border-radius:50%; border:1px solid var(--nw-line); background:var(--hc-raised2);
  display:inline-flex; align-items:center; justify-content:center; cursor:pointer; padding:0; }
.gear:hover { border-color:color-mix(in srgb, var(--nw-fg) 34%, transparent); }
.gear svg { width:18px; height:18px; fill:none; stroke:var(--nw-fg2); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
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
  .chead { grid-template-columns:minmax(0, 1fr) auto; grid-template-areas:"ttl gear" "pills pills"; }
  .pills { justify-content:flex-start; }
  .top { padding:16px; } .dbox { padding-left:16px; padding-right:16px; }
}

/* The clock (0.8.0b3, \xAB la roue au survol \xBB): drawn in a 440 \xD7 386 box; the middle's words are sized on the wheel's
   width, so that they keep their room inside the disc on a phone. Over an hour, it grows, the others fade, and its
   figures take the middle's place. */
.wheel { position:relative; container-type:inline-size; }
/* 1.0, the compact version of the stove's and a room's cards: the clock small, beside its sentence; its hours and its
   scale left out (too small to read), its centre kept readable. */
.top.compact { gap:14px; }
.pair { display:grid; grid-template-columns:minmax(140px, 44%) 1fr; gap:16px; align-items:center; }
.pair .side { display:flex; flex-direction:column; align-items:flex-start; gap:10px; min-width:0; }
.compact .wheel .hl, .compact .wheel .gt { display:none; }
.compact .mid { width:34cqi; }
.compact .mid .ct { font-size:max(17px, 7cqi); }
.compact .mid .art { width:max(24px, 13cqi); }
.compact .mid .cs { display:none; }
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
/* The hours' strokes: as long and as orange as it heated; yesterday's in grey for the hours to come. */
.spk line { fill:none; stroke-width:7; stroke-linecap:round; stroke:color-mix(in oklch, var(--hi) var(--p), var(--lo));
  stroke-dasharray:calc(var(--len) + var(--grow, 0px)) 999px;
  transition:stroke-dasharray .28s var(--hc-ease), stroke-width .28s var(--hc-ease), opacity .28s; animation:hc-grow 1s var(--hc-ease) backwards; }
.spk.flame { --lo:var(--hc-flame-lo); --hi:var(--hc-flame-hi); } .spk.demand { --lo:var(--hc-dem-lo); --hi:var(--hc-dem-hi); }
.spk.none line { stroke:color-mix(in srgb, var(--nw-fg) 14%, transparent); stroke-width:4; }
.spk.yday line { stroke:var(--hc-yday); }
.spk.on { --grow:13px; } .spk.on line { stroke-width:12; } .spk.near { --grow:4px; } .spk.near line { stroke-width:9; }
.picking .spk.far line { opacity:.22; }
@keyframes hc-grow { from { stroke-dasharray:0px 999px; } }
/* The trace over its dotted whole degrees, its set point in steps, the values written in the gap after the hand. */
.wheel .grid { fill:none; stroke:color-mix(in srgb, var(--nw-fg) 22%, transparent); stroke-width:1; stroke-dasharray:1.5 3.5; stroke-linecap:round; }
.wheel .gs0 { stop-color:var(--hc-trace); stop-opacity:0; } .wheel .gs1 { stop-color:var(--hc-trace); stop-opacity:.34; }
.wheel .area { stroke:none; }
.wheel .trace { fill:none; stroke:var(--hc-trace); stroke-width:3; stroke-linejoin:round; stroke-linecap:round; stroke-dasharray:1;
  animation:hc-draw 1.4s var(--hc-ease) both; }
@keyframes hc-draw { from { stroke-dashoffset:1; } to { stroke-dashoffset:0; } }
.wheel .set { fill:none; stroke:var(--hc-set); stroke-width:1.6; stroke-dasharray:5 4; opacity:.85; }
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
  .spk line, .wheel .trace, .wheel .ping { animation:none; } .wheel .ping { display:none; }
  .cell path, .spk line, .mid > div, .wheel .disc, .wheel .lit, .wheel .tdot { transition:none; }
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
@media (prefers-reduced-motion:reduce) { .rise, .blow, .flick, .flick2, .pill .beat { animation:none; } .chev, .switch i { transition:none; } }

.legend { display:flex; justify-content:center; gap:8px 14px; flex-wrap:wrap; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
.legend span { display:inline-flex; align-items:center; gap:6px; }
.legend .sw { width:14px; height:6px; border-radius:3px; background:var(--hc-r-off); }
.legend .sw.t-confort { background:var(--hc-r-confort); } .legend .sw.t-eco { background:var(--hc-r-eco); } .legend .sw.t-poele { background:var(--hc-r-poele); }
.legend .sw.t-boost { background:var(--hc-r-boost); }
.legend .sw.line { height:3px; border-radius:2px; background:var(--hc-trace); }
.legend .sw.set { height:0; border-radius:0; background:none; border-top:2px dashed color-mix(in oklab, var(--hc-set) 75%, transparent); }
.legend .sw.ramp { width:18px; background:linear-gradient(90deg, var(--hc-dem-lo), var(--hc-dem-hi)); }
.legend .sw.ramp.flame { background:linear-gradient(90deg, var(--hc-flame-lo), var(--hc-flame-hi)); }
.legend .sw.yday { background:var(--hc-yday); }
.legend .sw.ring { width:9px; height:9px; border-radius:50%; border:2px solid var(--hc-trace); box-sizing:border-box; background:none; }
.legend .sw.ring.lit { border-color:var(--hc-stove); } .legend .sw.ring.stop { border-color:var(--nw-cold); }
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
.btn.auto.on { background:color-mix(in oklab, var(--nw-calm) 22%, var(--nw-bg)); border-color:color-mix(in oklab, var(--nw-calm) 60%, transparent); }
.switch { position:relative; flex:none; width:30px; height:18px; border-radius:9px; background:color-mix(in srgb, var(--nw-fg) 32%, var(--nw-bg)); }
.switch i { position:absolute; top:3px; left:3px; width:12px; height:12px; border-radius:50%; background:#fff; transition:left .2s; }
.btn.auto.on .switch { background:color-mix(in oklab, var(--nw-calm) 80%, #000 12%); } .btn.auto.on .switch i { left:15px; }

/* The drawers, under the card's top; each one closed or open on a tap. */
.dbox { padding:2px 22px 18px; background:var(--hc-sunk); border-top:1px solid var(--nw-line-soft); }
.dbox.pellets { background:var(--hc-sunk2); }
.drawer { display:flex; align-items:center; gap:10px; width:100%; min-height:54px; padding:0; border:0; background:none; font-size:var(--nw-fs-text);
  font-weight:700; cursor:pointer; text-align:left; }
.drawer .dt { flex:1; min-width:0; }
.drawer .ds { display:block; font-size:var(--nw-fs-small); font-weight:500; color:var(--nw-fg2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.chev { width:20px; height:20px; flex:none; fill:none; stroke:var(--nw-fg2); stroke-width:2; stroke-linecap:round; stroke-linejoin:round; transition:transform .2s; }
.drawer[aria-expanded="true"] .chev { transform:rotate(180deg); }
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
.bars > div { display:grid; grid-template-columns:repeat(var(--n), minmax(0, 1fr)); gap:clamp(3px, 1.2cqi, 8px); text-align:center; font-size:var(--nw-fs-label);
  color:var(--nw-fg2); }
.bars .cols { height:72px; align-items:end; }
.bars .cols span { display:block; border-radius:6px 6px 2px 2px; background:color-mix(in oklab, var(--hc-demand) 38%, var(--nw-bg)); }
.bars .cols span.today { background:var(--hc-demand); }
.pellets .bars .cols span { background:color-mix(in oklab, var(--hc-stove) 40%, var(--nw-bg)); } .pellets .bars .cols span.today { background:var(--hc-stove); }
.bars .vals span { white-space:nowrap; overflow:hidden; } .bars .vals span.today { color:var(--nw-fg); font-weight:700; }
.bhead { display:flex; justify-content:space-between; gap:8px; font-size:var(--nw-fs-small); color:var(--nw-fg2); }
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
`;var kn=[["thermostat","Ouvrir le thermostat"],["page","Ouvrir la page de la pi\xE8ce (onglet Chauffage)"],["none","Rien"]],qt=[["complete","Compl\xE8te : l\u2019horloge du jour en grand, sa l\xE9gende"],["compacte","Compacte : l\u2019horloge en petit, \xE0 c\xF4t\xE9 de sa phrase"],["ligne","Une ligne : le nom, la temp\xE9rature, le mode"]],An={piece:"Pi\xE8ce",version:"Version",name:"Titre facultatif",tap_action:"Appui court"},Sn={name:"Vide : le titre de la carte.",version:"La compacte tient environ deux fois moins de hauteur ; les chiffres de chaque heure restent au survol.",tap_action:"Sur la carte, ailleurs que sur un bouton ou une heure de l\u2019horloge."},Cn=[["maison","mdi:home-thermometer-outline","La maison","qui chauffe, chaque pi\xE8ce, le froid de la nuit"],["poele","mdi:fireplace","Le po\xEAle","son horloge du jour, sa flamme, ses boutons, les granul\xE9s et l\u2019argent"],["piece","mdi:thermometer","Une pi\xE8ce","son horloge du jour, sa chauffe, ses modes, ce qu\u2019elle co\xFBte"],["planning","mdi:calendar-clock","Le planning","la journ\xE9e de chaque pi\xE8ce et du po\xEAle"]],En=s=>{s.preventDefault(),history.pushState(null,"",s.currentTarget.getAttribute("href")??"/hestia/chauffage"),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))},Ze=class extends H{constructor(){super(...arguments);this.rooms=[];this.changed=t=>{t.stopPropagation();let e=t.detail.value;this.set({...e.piece?{piece:e.piece}:{},name:(e.name??"").trim(),court:e.version==="ligne",compacte:e.version==="compacte",...e.tap_action?{tap_action:e.tap_action}:{}})}}static{this.properties={hass:{attribute:!1},config:{state:!0},rooms:{state:!0}}}static{this.styles=qe`.note{color:var(--secondary-text-color);font-size:12px;line-height:1.6;margin:0 0 16px}a{color:var(--primary-color)}
  .formats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:4px 0 16px}
  .formats button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;color:var(--primary-text-color);font-size:12px;line-height:1.45}
  .formats button:hover{border-color:var(--secondary-text-color)}
  .formats button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .formats button.on{border:2px solid var(--primary-color);padding:9px 11px}
  .formats ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}.formats button.on ha-icon{color:var(--primary-color)}
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}`}setConfig(t){this.config={...t}}connectedCallback(){super.connectedCallback(),this.loadRooms()}async loadRooms(){try{let t=await this.hass?.callWS?.({type:"hestia_heating/view"});this.rooms=(t?.pieces??[]).map(e=>({id:e.id,nom:e.nom}))}catch{}}set(t){let e={...this.config,...t};e.name||delete e.name,e.card==="maison"&&delete e.card,e.card!=="piece"&&(delete e.piece,delete e.court,delete e.tap_action),e.card!=="piece"&&e.card!=="poele"&&delete e.compacte,e.court||delete e.court,(!e.compacte||e.court)&&delete e.compacte,e.tap_action==="thermostat"&&delete e.tap_action,this.config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}schema(t){let e=(r,i)=>({name:r,required:!0,selector:{select:{mode:"dropdown",options:i.map(([c,o])=>({value:c,label:o}))}}}),a=this.rooms.map(r=>[r.id,r.nom]);return this.config?.piece&&!a.some(([r])=>r===this.config.piece)&&a.push([this.config.piece,this.config.piece]),[...t==="piece"&&a.length?[e("piece",a)]:[],...t==="piece"?[e("version",qt)]:t==="poele"?[e("version",qt.slice(0,2))]:[],{name:"name",selector:{text:{}}},...t==="piece"?[{type:"expandable",name:"",title:"Fonctionnalit\xE9s",icon:"mdi:tune-variant",flatten:!0,expanded:!1,schema:[e("tap_action",kn)]}]:[]]}render(){if(!this.config)return u;let t=this.config,e=t.card??"maison",a={piece:t.piece??this.rooms[0]?.id,version:t.court?"ligne":t.compacte?"compacte":"complete",name:t.name??"",tap_action:t.tap_action??"thermostat"};return l`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${En}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${Cn.map(([r,i,c,o])=>l`<button type="button" role="radio" aria-checked=${r===e}
     class=${r===e?"on":""} @click=${()=>{r!==e&&this.set({card:r,...r==="piece"&&!t.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{}})}}><ha-icon icon=${i}></ha-icon><b>${c}</b><span>${o}</span></button>`)}</div>
   <ha-form .hass=${this.hass} .data=${a} .schema=${this.schema(e)} .computeLabel=${r=>An[r.name]??r.name}
     .computeHelper=${r=>Sn[r.name]??""} @value-changed=${this.changed}></ha-form>`}};customElements.get("hestia-heating-card-editor")||customElements.define("hestia-heating-card-editor",Ze);var ie=new WeakMap;function Ot(s,n){ie.get(s)===n&&ie.delete(s),clearTimeout(n.closing),n.stop?.then(t=>t()).catch(()=>{})}function Ut(s,n,t,e){let a=ie.get(s),r={view:n,error:t,reload:e};if(a){clearTimeout(a.closing),a.closing=void 0;let c=a.last;c&&queueMicrotask(()=>{a.listeners.has(r)&&n(c)})}else{let c={listeners:new Set};a=c,ie.set(s,c),c.stop=s.subscribeMessage(o=>{if(o.reload){Ot(s,c);for(let h of[...c.listeners])h.reload();return}let d;if(o.changes){if(!c.last)return;d={...c.last,...o.changes};for(let h of o.removed??[])delete d[h]}else if(o.view)d=o.view;else return;c.last=d;for(let h of[...c.listeners])h.view(d)},{type:"hestia_heating/subscribe"}),c.stop.catch(o=>{ie.get(s)===c&&ie.delete(s);for(let d of[...c.listeners])d.error(o)})}let i=a;return i.listeners.add(r),()=>{!i.listeners.delete(r)||i.listeners.size||(clearTimeout(i.closing),i.closing=setTimeout(()=>{i.listeners.size||Ot(s,i)},5e3))}}var Mn=440,Pn=386,T=220,D=193,$e=64,Nt=76,Je=40,Me=128,Qe=142,et=28,Pe=184,zn=190,Re=1200,Rn=5,b=s=>s.toFixed(1),ze=s=>(s%1440+1440)%1440;function M(s,n){let t=ze(n)/1440*2*Math.PI-Math.PI/2;return[T+s*Math.cos(t),D+s*Math.sin(t)]}function Wt(s,n,t){let[e,a]=M(s,n),[r,i]=M(s,t);return`M${b(e)} ${b(a)}A${s} ${s} 0 ${t-n>720?1:0} 1 ${b(r)} ${b(i)}`}function Bt(s,n,t,e){let[a,r]=M(s,t),[i,c]=M(n,t),[o,d]=M(n,e),[h,m]=M(s,e);return`M${b(a)} ${b(r)}L${b(i)} ${b(c)}A${n} ${n} 0 0 1 ${b(o)} ${b(d)}L${b(h)} ${b(m)}A${s} ${s} 0 0 0 ${b(a)} ${b(r)}Z`}function W(s,n,t,e=Rn){let a=[],r=0,i=null;for(let c=n;c<=t;c+=e){for(;r<s.length&&s[r][0]<=c;)i=s[r][1],r++;a.push([c,i])}return a}function jn(s){let n=[],t=null;for(let[e,a]of s){if(a==null){t=null;continue}t||(t=[],n.push(t)),t.push([e,a])}return n}var nt=s=>s.map(n=>n[1]).filter(n=>n!=null),tt=s=>s.length?s.reduce((n,t)=>n+t,0)/s.length:null;function at(s,n,t){let e=s.length-ze(s.start+s.length);return Array.from({length:24},(a,r)=>{let i=ze(r*60-s.start),c=Math.min(i+60,s.length),o=v=>v&&i<c?nt(W(v,i,Math.max(i,c-1))):[],d=t.level?o(t.level):[],h=d.filter(v=>v>0),m=o(t.sets),$=r*60+30;return{k:r,from:i,to:c,current:i<s.length&&i+60>s.length,yesterday:i<e,ahead:i<s.length-Re,ton:n.find(v=>v.de<=$&&$<v.a)?.ton??null,temp:tt(o(t.temp)),heat:tt(o(t.heat)),burn:d.length?h.length/d.length:null,level:tt(h),set:m.length?m[m.length-1]:null,energy:t.energy.find(([v])=>Math.abs(v-i)<=1)?.[1]??null}})}var Ln=3,Ft=s=>`${s.toLocaleString("fr-FR",{maximumFractionDigits:1})}\xB0`,Hn=s=>6*s.length+4,Tn=11;function st(s,n){let{span:t,series:e}=s,a=t.length,r=Math.max(0,a-Re),i=p=>t.start+p,c=W(e.temp,r,a),o=nt(c),d=o.length?Math.min(...o)-Ln:-1/0,h=W(e.sets,r,a).map(([p,g])=>[p,g!=null&&g>=d?Math.round(g*2)/2:null]),m=[...new Set(nt(h))].sort((p,g)=>g-p).slice(0,3),$=[...o,...m],v=$.length?Math.floor(Math.min(...$)-.5):16,S=$.length?Math.ceil(Math.max(...$)+.5):22;if(S-v<3){let p=(S+v)/2;v=Math.floor(p-1.5),S=v+3}let A=p=>Nt+Math.max(0,Math.min(1,(p-v)/(S-v)))*Je,k=jn(c).filter(p=>p.length>1),P=p=>p.map(([g,_],C)=>{let[de,ue]=M(A(_),i(g));return`${C?"L":"M"}${b(de)} ${b(ue)}`}).join(""),Q=k.map(p=>P(p)+p.slice().reverse().map(([g])=>{let[_,C]=M($e+2,i(g));return`L${b(_)} ${b(C)}`}).join("")+"Z").join(""),R="",j=null;for(let[p,g]of h){if(g==null||!m.includes(g)){j=null;continue}let[_,C]=M(A(g),i(p));if(j==null)R+=`M${b(_)} ${b(C)}`;else{if(g!==j){let[de,ue]=M(A(j),i(p));R+=`L${b(de)} ${b(ue)}`}R+=`L${b(_)} ${b(C)}`}j=g}let B=t.start+(a+r+1440)/2,G=S-v,F=[1,2,5,10].find(p=>p*Je/G>=12)??10,V=[];if(k.length)for(let p=Math.ceil(v/F)*F;p<=S;p+=F)m.some(g=>Math.abs(g-p)<=F/2)||V.push(p);let x=[...m.map(p=>({t:p,set:!0})),...V.map(p=>({t:p,set:!1}))].sort((p,g)=>p.t-g.t),q=(p,g)=>Math.abs(p.x-g.x)<(p.w+g.w)/2+2&&Math.abs(p.y-g.y)<Tn,le=(p,g)=>p.map((_,C)=>{let[de,ue]=M(A(_.t),B+(C-(p.length-1)/2)*g);return{..._,x:de,y:ue,w:Hn(Ft(_.t))}}),_e=p=>p.every((g,_)=>p.slice(_+1).every(C=>!q(g,C))),ee=[];for(let p of[x,x.filter((g,_)=>g.set||_%2===0),x.filter(g=>g.set)]){let g=[0,12,-12,24,-24,36,-36].find(_=>(p.length-1)/2*Math.abs(_)<=80&&_e(le(p,_)));if(g!=null){ee=le(p,g);break}}let ce=k.length?k[k.length-1][k[k.length-1].length-1]:null,[ye,te]=ce?M(A(ce[1]),i(ce[0])):[0,0],[w,O]=M($e+4,t.now),[K,pe]=M(Me,t.now),ne=s.pick,U=s.hours[ne??s.last??-1],wt=p=>{let g=Math.abs(p-ne);return Math.min(g,24-g)},vt=p=>ne==null?"":wt(p)===0?" on":wt(p)===1?" near":" far",tn=s.hours.find(p=>p.current)?.k??Math.floor(ze(t.now)/60),nn=s.pin??ne??tn,ke=null;if(U&&!U.ahead){let p=Math.min(U.from+30,U.to-1),g=W(e.temp,p,p)[0]?.[1];g!=null&&p>=r&&(ke=M(A(g),i(p)))}let ae=U?s.say(U):null,an=Math.max(2,s.max??5),sn=p=>["confort","eco","poele","boost"].includes(p)?p:"off",rn=(p,g)=>{let _=C=>{p.preventDefault(),p.currentTarget.parentNode?.querySelector(`.hit[data-k="${C}"]`)?.focus()};p.key==="Enter"||p.key===" "?(p.preventDefault(),p.stopPropagation(),s.onPin(s.pin===g?void 0:g)):p.key==="Escape"?s.pin!=null&&(p.stopPropagation(),s.onPin(void 0)):p.key==="ArrowRight"||p.key==="ArrowDown"?_((g+1)%24):(p.key==="ArrowLeft"||p.key==="ArrowUp")&&_((g+23)%24)},on=p=>{s.tap&&(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),s.tap.run(p))},ln=p=>{s.pin!=null&&(p.stopPropagation(),s.onPin(void 0))};return l`<div class=${"wheel"+(ne!=null?" picking":"")}><svg viewBox="0 0 ${Mn} ${Pn}" role="group" aria-label=${s.label}
   @pointerleave=${()=>s.onHover(void 0)}>
  <defs><radialGradient id="hcArea" cx=${T} cy=${D} r=${Nt+Je} gradientUnits="userSpaceOnUse">
   <stop class="gs0" offset=".52"></stop><stop class="gs1" offset="1"></stop></radialGradient></defs>
  <path class="lit" d=${U?Bt($e+2,Qe+et+18,U.k*60+1,U.k*60+59):""}></path>
  ${s.hours.map(p=>{let g=p.k*60+3,_=p.k*60+57;return y`<g class=${"cell"+vt(p.k)}><path class="t-none" d=${Wt(Me,g,_)}></path>${s.segments.filter(C=>C.a>g&&C.de<_).map(C=>y`<path class=${"t-"+sn(C.ton)} d=${Wt(Me,Math.max(g,C.de),Math.min(_,C.a))}></path>`)}</g>`})}
  ${V.map(p=>y`<circle class="grid" cx=${T} cy=${D} r=${b(A(p))}></circle>`)}
  ${Q?y`<path class="area" fill="url(#hcArea)" d=${Q}></path>`:u}
  ${R?y`<path class="set" d=${R}></path>`:u}
  ${k.length?y`<path class="trace" pathLength="1" d=${k.map(P).join("")}></path>`:u}
  ${s.hours.map(p=>{let g=p.heat==null||p.heat<.02,_=p.ahead?"yday":g?"none":s.kind,C=s.kind==="flame"?Math.max(0,((p.level??1)-1)/(an-1)):Math.min(1,(p.heat??0)*1.4);return y`<g class=${"spk "+_+vt(p.k)} style=${`--len:${g?0:b((p.heat??0)*et)}px;--p:${Math.round(C*100)}%`}
    transform=${`translate(${T} ${D}) rotate(${b((p.k*60+30)/4-90)})`}><line x1=${Qe} y1="0" x2=${Qe+et+20} y2="0"
    style=${`animation-delay:${p.k*22}ms`}></line></g>`})}
  ${ee.map(p=>y`<text class=${p.set?"gt set":"gt"} x=${b(p.x)} y=${b(p.y)}>${Ft(p.t)}</text>`)}
  <line class="hand" x1=${b(w)} y1=${b(O)} x2=${b(K)} y2=${b(pe)}></line>
  ${ce?y`<circle class="now" cx=${b(ye)} cy=${b(te)} r="4.5"></circle>`:u}
  <circle class=${"tdot"+(ke&&ne!=null?" on":"")} cx=${b(ke?.[0]??T)} cy=${b(ke?.[1]??D)} r="5.5"></circle>
  ${s.marks.map(p=>{let[g,_]=M(Me,p.at);return y`<circle class=${"mark "+p.cls} cx=${b(g)} cy=${b(_)} r="5.5"></circle>`})}
  <circle class="ping" cx=${b(K)} cy=${b(pe)} r="4"></circle><circle class="knob" cx=${b(K)} cy=${b(pe)} r="7"></circle>
  <circle class="disc" cx=${T} cy=${D} r=${$e} role=${s.tap?"button":u} tabindex=${s.tap?0:u}
   aria-label=${s.tap?.label??u} @keydown=${on} @click=${ln}></circle>
  <text class="hl" x=${T} y=${D-Pe}>0 h</text><text class="hl" x=${T+Pe} y=${D}>6 h</text>
  <text class="hl" x=${T} y=${D+Pe}>12 h</text><text class="hl" x=${T-Pe} y=${D}>18 h</text>
  ${s.hours.map(p=>{let g=s.say(p);return y`<path class="hit" data-k=${p.k} role="button" tabindex=${p.k===nn?0:-1} aria-pressed=${s.pin===p.k?"true":"false"}
    aria-label=${`${g.range} : ${g.value}, ${g.lines.filter(Boolean).join(", ")}`} d=${Bt($e,zn,p.k*60,p.k*60+60)}
    @pointerenter=${()=>s.onHover(p.k)} @focus=${()=>s.onHover(p.k)} @blur=${()=>s.onHover(void 0)}
    @click=${_=>{_.stopPropagation(),s.onPin(s.pin===p.k?void 0:p.k)}} @keydown=${_=>rn(_,p.k)}></path>`})}
 </svg><div class="mid"><div class="rest">${n}</div>
  <div class="pick">${ae?l`<div class="ph">${ae.range}</div><div class=${"pv"+(ae.word?" word":"")}>${ae.value}</div>
   <div class="pl">${ae.lines[0]}</div><div class="pl dim">${ae.lines[1]}</div>`:u}</div></div></div>`}var E=(s,n,t,e,a)=>`M${s+a} ${n}h${t-2*a}a${a} ${a} 0 0 1 ${a} ${a}v${e-2*a}a${a} ${a} 0 0 1 ${-a} ${a}h${-(t-2*a)}a${a} ${a} 0 0 1 ${-a} ${-a}v${-(e-2*a)}a${a} ${a} 0 0 1 ${a} ${-a}z`,rt=(s,n,t)=>`M${s-t} ${n}a${t} ${t} 0 1 0 ${2*t} 0a${t} ${t} 0 1 0 ${-2*t} 0`,Vt=(s,n,t="")=>s.map((e,a)=>y`<path class=${`wave rise r${a} ${t}`} d=${`M${e} ${n}c-3-3 3-5 0-8c-3-3 3-5 0-8`}></path>`);function Dn(s){return y`${[0,1,2,3,4,5].map(n=>y`<path class="metal" d=${E(6+n*8.8,18,7,24,3)}></path>`)}
  <path class="foot" d=${E(4,39,56,3,1.5)+E(9,42,4,5,1)+E(51,42,4,5,1)}></path>
  <path class=${"led"+(s?" on":"")} d=${rt(57.5,23,1.8)}></path>${s?Vt([17,32,47],16):u}`}function qn(s){return y`<path class="pipe" d="M8 44H14V40M50 40V44H58M12 21.5H7"></path>
  ${[0,1,2,3,4].map(n=>y`<path class="metal" d=${E(13+n*8,17,6.5,26,3.25)}></path>`)}
  <path class="foot" d=${E(12,20,42,3,1.5)+E(12,37,42,3,1.5)}></path><path class="valve" d=${E(1,16,7,11,3)}></path>
  <path class=${"led"+(s?" on":"")} d=${E(2.5,18,4,1.6,.8)+E(2.5,21,4,1.6,.8)}></path>${s?Vt([22,33,44],16):u}`}function On(s){return y`<path class="metal" d=${E(6,10,52,20,6)}></path><path class="foot" d=${E(6,23,52,7,3)}></path>
  <path class="slot" d=${E(12,25,40,2.5,1.25)}></path><path class=${"led"+(s?" on "+s:"")} d=${rt(50,16,1.8)}></path>
  ${s?[18,32,46].map((n,t)=>y`<path class=${`wave blow r${t} ${s}`} d=${`M${n} 33c3 3-3 5 0 8c3 3-3 5 0 8`}></path>`):u}`}var Un="M50 140C15 140 4 110 10 86C16 62 34 52 38 28C40 16 46 6 50 0C56 18 72 30 80 52C88 72 96 92 90 112C84 130 70 140 50 140Z",Nn="M50 140C28 140 20 118 24 100C28 84 40 76 44 58C50 70 62 80 68 96C74 112 72 140 50 140Z",Wn="M50 140C38 140 34 128 36 118C38 108 46 102 48 92C54 102 62 110 62 122C62 134 58 140 50 140Z";function it(s,n,t){let e=s>0?.035+.1*Math.min(1,s/Math.max(1,n)):0,a=`translate(${(32-50*e).toFixed(2)} ${(37-140*e).toFixed(2)}) scale(${e.toFixed(3)})`;return y`<defs><linearGradient id="hcFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9733f"></stop>
  <stop offset=".6" stop-color="#f1a066"></stop><stop offset="1" stop-color="#f4ca84" stop-opacity=".75"></stop></linearGradient></defs>
  <path class="s-pipe" d=${E(37,2,6,10,1)}></path><path class="s-body" d=${E(15,13,34,32,4)}></path>
  <path class="s-top" d=${E(13,10,38,5,2)}></path><path class="s-glass" d=${E(20,18,24,21,3)}></path>
  <path class=${"s-bed"+(t?" on":"")} d=${E(23,35,18,3,1.5)}></path>
  ${e?y`<g transform=${a}><path class="flick" fill="url(#hcFlame)" d=${Un}></path><path class="flick2 s-f2" d=${Nn}></path>
   <path class="flick s-f3" d=${Wn}></path></g>`:u}
  <path class="s-pipe" d=${E(18,45,5,5,1)+E(41,45,5,5,1)}></path><path class=${"s-led"+(t?" on":"")} d=${rt(45,12.5,1.6)}></path>`}function It(s,n){let t=n==="chauffe";return s==="vanne"?qn(t):s==="clim"||s==="pac"?On(t?"heat":n==="rafraichit"?"cool":null):Dn(t)}function ot(s,n,t){return l`<svg class="art" viewBox="0 0 64 52" aria-hidden="true">${s}</svg><div class="ct">${n}</div>${t?l`<div class="cs">${t}</div>`:u}`}var Gt=["maison","poele","piece","planning"],Kt=["thermostat","page","none"],f=(s,n=1)=>s.toLocaleString("fr-FR",{maximumFractionDigits:n}).replace("-","\u2212"),L=s=>s==null?"\u2014":`${f(s)} \xB0C`,lt=s=>s==null?"\u2014":s>=500?`${f(s/1e3)} kW`:`${f(s,0)} W`,z=s=>s>=100?`${f(s,0)} \u20AC`:`${s.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} \u20AC`,ct=s=>s&&s[0].toUpperCase()+s.slice(1),oe=s=>s.getMinutes()?`${s.getHours()} h ${String(s.getMinutes()).padStart(2,"0")}`:`${s.getHours()} h`,ht=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],Bn=["di","lu","ma","me","je","ve","sa"],Yt=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"];function pt(s){let n=new Date(s),t=new Date,e=new Date(t);return e.setDate(e.getDate()+1),n.toDateString()===t.toDateString()?oe(n):n.toDateString()===e.toDateString()?`demain ${oe(n)}`:`${ht[n.getDay()]} ${oe(n)}`}var gt=s=>+s.slice(11,13)*60+ +s.slice(14,16),mt=s=>{let n=gt(s);return n%60?`${Math.floor(n/60)} h ${String(n%60).padStart(2,"0")}`:`${n/60} h`},Fn=(s,n)=>!n||s.slice(0,10)===n?mt(s):`demain ${mt(s)}`,je=s=>{let[n,t,e]=s.split("-").map(Number);return new Date(n,t-1,e)},Xt={eteint:"\xE9teint",allumage:"allumage",chauffe:"chauffe",nettoyage:"nettoyage",extinction:"extinction",alarme:"alarme",inconnu:"inconnu"},Le={poele:"po\xEAle en chauffe",confort:"confort",eco:"\xE9co",hors_gel:"hors gel",boost:"boost",arret:"arr\xEAt"},Vn={poele:"En chauffe",confort:"Confort",eco:"\xC9co",hors_gel:"Hors gel",boost:"Boost",arret:"Arr\xEAt"},Zt={radiateur:"Radiateur \xE9lectrique",vanne:"Radiateur \xE0 eau",clim:"Climatisation",pac:"Pompe \xE0 chaleur",poele:"Po\xEAle",autre:"Chauffage"},He={frost:"Hors gel",eco:"\xC9co",comfort:"Confort",boost:"Boost",away:"Absent",sleep:"Nuit",home:"Pr\xE9sent",activity:"Activit\xE9"},Jt={frost:"off",eco:"cold",comfort:"heat",boost:"act",away:"off",sleep:"cold",home:"heat",activity:"act"},Qt=Object.keys(He),en=s=>{let n=Qt.indexOf(s);return n<0?Qt.length:n},dt=1e4,In=5e3,Gn=4.176,Kn=6e5,Yn=y`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,Xn=y`<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>`,ut=y`<svg class="wv" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M8 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M12 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2"></path></svg>`,Zn=y`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"></path></svg>`,Jn=y`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l6 6M17 7l-6 6M5 21l4.5-1.5 4-4-3-3-4 4z"></path></svg>`,Qn=y`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,ea=y`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v10M8 7v10M12 7v10M16 7v10M20 7v10M2 19h20M2 5h20"></path></svg>`,ft=class extends H{constructor(){super();this._config={type:"custom:hestia-heating-card",card:"maison"};this._dayAt=0;this._dayFor="";this._histAt=0;this._histFor="";this._drawers={},this._tabs={}}static{this.styles=[ge(Tt),ge(Dt)]}static{this.properties={_view:{state:!0},_day:{state:!0},_hist:{state:!0},_error:{state:!0},_pending:{state:!0},_refused:{state:!0},_drawers:{state:!0},_tabs:{state:!0},_confirm:{state:!0},_busy:{state:!0},_hover:{state:!0},_pin:{state:!0}}}static getStubConfig(){return{card:"maison"}}static getConfigElement(){return document.createElement("hestia-heating-card-editor")}setConfig(t){let e=t.card??"maison";if(!Gt.includes(e))throw new Error(`card: ${e} ? (${Gt.join(", ")})`);if(t.tap_action!=null&&!Kt.includes(t.tap_action))throw new Error(`tap_action: ${t.tap_action} ? (${Kt.join(", ")})`);this._config={...t,card:e}}getCardSize(){let t=this._config.card,e=!!this._config.compacte;return t==="piece"&&this._config.court?2:t==="piece"?e?6:11:t==="poele"?e?7:13:t==="planning"?6:5}getGridOptions(){return this._config.card==="planning"?{columns:"full",rows:"auto"}:{columns:12,rows:"auto",min_columns:6}}set hass(t){let e=this._hass?.connection!==t.connection;this._hass=t,this.setAttribute("theme",t.themes?.darkMode===!1?"light":"dark"),(e||!this._stop)&&this._follow()}connectedCallback(){super.connectedCallback(),this._follow()}disconnectedCallback(){super.disconnectedCallback(),this._unfollow()}_unfollow(){this._stop?.(),this._stop=void 0,window.clearTimeout(this._again)}_follow(){this._unfollow(),!(!this._hass||!this.isConnected)&&(this._stop=Ut(this._hass.connection,t=>{this._view=t,this._error=void 0,this._maybeDay()},t=>{this._stop=void 0,this._error=t.message??"Hestia Chauffage ne r\xE9pond pas.",this._again=window.setTimeout(()=>this._follow(),3e4)},()=>{this._stop=void 0,this._again=window.setTimeout(()=>this._follow(),2e3)}))}_maybeDay(){let t=this._config,e=this._view,a=t.card==="piece"&&!t.court&&e?this._roomOf(e):void 0,r=t.card==="poele"?"poele":a?`piece/${a.id}`:"";!r||!this._hass||(r!==this._dayFor&&(this._day=void 0,this._hover=this._pin=void 0),r!==this._histFor&&(this._hist=void 0),(r!==this._dayFor||Date.now()-this._dayAt>=12e4)&&(this._dayFor=r,this._dayAt=Date.now(),this._hass.callWS({type:"hestia_heating/day",cible:r,heures:24}).then(i=>{this._day=i}).catch(()=>{})),(r!==this._histFor||Date.now()-this._histAt>=Kn)&&(this._histFor=r,this._histAt=Date.now(),this._hass.callWS({type:"hestia_heating/historique",cible:r}).then(i=>{this._hist=i}).catch(()=>{})))}_open(t){history.pushState(null,"","/hestia/chauffage"+(t?"/"+t:"")),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}_info(t,e){return l`<button class="nw-info" aria-label=${e} @click=${()=>this._open(t)}></button>`}_chip(t){return l`<span class=${"nw-chip "+t.ton}>${t.texte}</span>`}_more(t){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t},bubbles:!0,composed:!0}))}render(){let t=this._view;if(this._error)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;if(!t||!t.pret)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;let e=this._config.card;if(e==="piece"){let a=this._roomOf(t),r=a&&this._tapAction(a),i=a&&!this._config.court;return l`<ha-card class=${(r?"tap ":"")+(i?"clock":"")} @click=${r?c=>this._tap(c,a):u}>${this._room(t)}</ha-card>`}return e==="poele"?l`<ha-card class=${t.poele?"clock":""}>${this._stove(t)}</ha-card>`:l`<ha-card>${e==="planning"?this._planning(t):this._house(t)}</ha-card>`}_head(t,e,a,r,i){return l`<div class="chead"><div class="ttl"><h2 class="nw-title">${t}</h2>${e?l`<div class="sub">${e}</div>`:u}</div>
   <div class="pills">${a}</div>
   <button class="gear" aria-label=${i} title="Réglages" @click=${()=>this._open(r)}>${Yn}</button></div>`}_drawer(t,e,a,r,i,c=""){let o=this._drawers[t]??r;return l`<div class=${"dbox "+c} @click=${d=>d.stopPropagation()}>
   <button class="drawer" aria-expanded=${o?"true":"false"} @click=${()=>{this._drawers={...this._drawers,[t]:!o}}}>
    <span class="dt">${e}${a?l`<span class="ds">${a}</span>`:u}</span>${Xn}</button>
   ${o?l`<div class="dbody">${i()}</div>`:u}</div>`}_tabbar(t,e,a){let r=this._tab(t,e);return l`<div class="tabs" role="tablist" aria-label=${a}>${e.map(([i,c])=>l`<button class="tab" role="tab"
   aria-selected=${i===r?"true":"false"} @click=${()=>{this._tabs={...this._tabs,[t]:i}}}>${c}</button>`)}</div>`}_tab(t,e){let a=this._tabs[t];return e.some(r=>r[0]===a)?a:e[0][0]}async _press(t,e,a=!1){if(a&&this._confirm!==t){this._confirm=t,window.setTimeout(()=>{this._confirm===t&&(this._confirm=void 0)},In);return}this._confirm=void 0,this._busy=t,this._refused=void 0;try{await e()}catch(r){this._refused=`Ce n\u2019est pas pass\xE9 : ${r.message??"pas de r\xE9ponse"}.`}finally{this._busy=void 0}}_service(t){let[e,a]=t.service.split(".");return this._hass.callService(e,a,{...t.donnees??{},entity_id:t.entity_id})}_toSettings(){return l`<button class="link" @click=${()=>this._open("reglages")}>Ouvrir les réglages</button>`}_roomOf(t){return t.pieces.find(e=>e.id===this._config.piece)??t.pieces[0]}_tapAction(t){let e=this._config.tap_action??"thermostat";return e==="thermostat"&&!t.principal?"page":e==="none"?"":e}_tap(t,e){if(t.composedPath().some(r=>r instanceof HTMLElement&&r!==t.currentTarget&&(r.tagName==="BUTTON"||r.tagName==="A")))return;let a=this._tapAction(e);a==="thermostat"?this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e.principal},bubbles:!0,composed:!0})):a==="page"&&this._open("pieces/"+e.id)}_key(t,e){(t.key==="Enter"||t.key===" ")&&(t.preventDefault(),this._tap(t,e))}_modes(t){let e=[...t.modes??[]].filter(o=>o!=="none").sort((o,d)=>en(o)-en(d));if(!e.length||!t.principal)return u;let a=this._pending,r=a&&a.id===t.principal&&Date.now()-a.at<dt&&t.preset!==a.mode?a.mode:null,i=r??t.preset,c=!!t.recopie;return l`<div class="modes" role="group" aria-label="Mode du thermostat" style=${`--n:${Math.min(e.length,4)}`} @click=${o=>o.stopPropagation()}>
   ${e.map(o=>l`<button type="button" class=${"mode "+(Jt[o]??"heat")+(o===i?" on":"")} aria-pressed=${o===i} ?disabled=${c}
     title=${c?"Thermostat recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":""} @click=${()=>this._setMode(t,o)}>${He[o]??o}</button>`)}</div>
   ${c?l`<p class="note">Thermostat recopié d’une autre maison : les modes se choisissent là-bas.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}async _setMode(t,e){if(!(!this._hass||!t.principal||t.recopie||e===t.preset)){this._pending={id:t.principal,mode:e,at:Date.now()},this._refused=void 0,window.setTimeout(()=>{this._pending?.at&&Date.now()-this._pending.at>=dt&&(this._pending=void 0)},dt+50);try{await this._hass.callService("climate","set_preset_mode",{entity_id:t.principal,preset_mode:e})}catch(a){this._pending=void 0,this._refused=`Le thermostat n\u2019a pas pris \xAB ${He[e]??e} \xBB : ${a.message??"pas de r\xE9ponse"}.`}}}_house(t){let e=t.maison,a=t.dehors,r=t.planning.prochains,i=new Date,c=t.granules,o=l`${e.temperature!=null?l`La maison est à <b>${L(e.temperature)}</b>. `:u}${a?.nuit_min!=null?l`Cette nuit <b>${L(a.nuit_min)}</b> dehors. `:u}${r.length?l`Ensuite : ${r.slice(0,2).map(d=>`${d.texte} ${pt(d.a)}`).join(", ")}.`:u}`;return l`<div class="head"><h2 class="nw-title">${this._config.name||"Chauffage"}</h2>${this._info("","Ouvrir l\u2019onglet Chauffage")}</div>
   <div class=${"band "+e.etat}><div class="kicker">Maintenant <i>${oe(i)}</i></div><div class="title">${e.titre}</div><div class="line">${o}</div></div>
   <div class="rooms">${t.pieces.map(d=>l`<button class="room" @click=${()=>this._open("pieces/"+d.id)}><span class="n">${d.nom}</span>
    ${d.etat==="chauffe"&&!d.poele&&d.demande_pct!=null&&!d.fenetre?l`<span class="demand" role="img" aria-label=${`Demande ${d.demande_pct} %`}><i style=${`width:${d.demande_pct}%`}></i></span>`:this._chip(d.badge)}
    <span class="t">${d.temperature!=null?f(d.temperature):"\u2014"}${d.consigne!=null?l` <small>/ ${f(d.consigne)}</small>`:u}</span></button>`)}</div>
   <div class="nw-stats"><div><span>En chauffe</span><b>${e.en_chauffe} sur ${e.pieces}</b></div><div><span>Électrique</span><b>${lt(e.electrique_w)}</b></div>
    ${c?.jours!=null?l`<div><span>Granulés</span><b>${c.jours} jours</b></div>`:a?.demain_max!=null?l`<div><span>Demain après-midi</span><b>${L(a.demain_max)}</b></div>`:l`<div><span>Pièces</span><b>${e.pieces}</b></div>`}</div>`}_window(t){let e=this._day,a=t.planning.maintenant_min;return{d:e,series:e?.series??{},span:{start:e?.debut_min??a,length:e?.fenetre_min??1440,now:a}}}_picker(){return{pick:this._pin??this._hover,pin:this._pin,last:this._last,onHover:t=>{t!=null&&(this._last=t),this._hover=t},onPin:t=>{t!=null&&(this._last=t),this._pin=t}}}_range(t){let e=a=>`${a%24} h`;return t.current?`${e(t.k)} \u2013 maintenant`:t.ahead?`${e(t.k)} \u2013 ${e(t.k+1)} \xB7 \xE0 venir`:`${t.yesterday?"hier, ":""}${e(t.k)} \u2013 ${e(t.k+1)}`}_ahead(t,e){return{range:this._range(t),value:t.ton?Vn[t.ton]??ct(t.ton):"Rien de pr\xE9vu",word:!0,lines:[`hier : ${t.temp!=null?`${f(t.temp)}\xB0`:"\u2014"}`,e??""]}}_past(t,e){let a=e.filter(r=>!!r);return{range:this._range(t),value:t.temp!=null?`${f(t.temp)}\xB0`:"\u2014",lines:[a[0]??"",a[1]??""]}}_plan(t){return t.ton?`${Le[t.ton]??t.ton} au planning`:null}_next(t,e){let a=Fn(t.a,e.planning.jour);return`${t.texte} ${a.startsWith("demain")?a:"\xE0 "+a}`}_soon(t){return t&&Date.parse(t.a)-Date.now()<864e5?t:null}_tile(t,e,a=""){return l`<div class="tile"><b class="v">${t}${a?l`<small class="u">${a}</small>`:u}</b><span class="k">${e}</span></div>`}_bars(t,e,a){let r=Math.max(0,...t.map(c=>c.valeur??0)),i=t.length-1;return l`<div class="bars" role="img" aria-label=${a} style=${`--n:${t.length}`}>
   <div class="cols">${t.map((c,o)=>l`<span class=${o===i?"today":""} style=${`height:${r&&c.valeur?Math.max(4,Math.round(c.valeur/r*72)):0}px`}></span>`)}</div>
   ${t.length<=7?l`<div class="vals">${t.map((c,o)=>l`<span class=${o===i?"today":""}>${c.valeur!=null?e(c.valeur):"\u2014"}</span>`)}</div>`:u}
   <div class="days">${t.map((c,o)=>l`<span>${o===i?"auj.":Bn[je(c.jour).getDay()]}</span>`)}</div></div>`}_dayList(t,e){return t.map(a=>`${ht[je(a.jour).getDay()]} ${a.valeur!=null?e(a.valeur):"\u2014"}`).join(", ")}_stove(t){let e=t.poele;if(!e)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Po\xEAle"}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;let a=t.pieces.find(w=>w.poele),{d:r,series:i,span:c}=this._window(t),o=e.pilote?.mode==="flamme"||e.pilote?.mode==="entier",d=e.flamme_max||5,h=e.en_feu?e.flamme??0:0,m=t.planning.lignes.find(w=>w.id==="poele"),$=m?.segments??[],v=[...new Set($.map(w=>w.ton))],S=i.flamme??[],A=this._lastStart(S,c.length),k=this._soon(a?.prochain),P=e.en_feu&&k&&k.ton&&k.ton!=="poele"?k:null,Q=[...A!=null?[{at:c.start+A,cls:"lit"}]:[],...P?[{at:gt(P.a),cls:"stop"}]:[]],R=a?.temperature??null,j=a?a.nom:"la pi\xE8ce",B=e.etat==="alarme"?"alarme":e.en_feu&&h?`flamme ${h} sur ${d}`:Xt[e.etat]??e.etat,G=e.etat==="alarme"?"en alarme":e.en_feu?e.consigne!=null?`consigne ${f(e.consigne)}\xB0`:`flamme ${h}`:e.etat==="eteint"?"po\xEAle \xE9teint":Xt[e.etat]??"",F=W(S,0,c.length),V=W(i.consigne??[],0,c.length),x=F.map(([w,O],K)=>[w,(O??0)>0?V[K][1]:null]),q=r?.energie?.unite==="kg"?r.energie.heures:[],le=e.conso?.prix_kg??null,_e={temp:i.temperature??[],heat:S.map(([w,O])=>[w,O==null?null:O/d]),level:S,sets:x,energy:q},ee=at(c,$,_e),ye=st({span:c,segments:$,series:_e,hours:ee,kind:"flame",max:d,marks:Q,say:w=>{let O=w.burn==null||w.burn<.05;if(w.ahead)return this._ahead(w,w.burn==null?null:O?"po\xEAle \xE9teint":`flamme ${f(w.level??0,0)}`);let K=w.energy!=null?`${f(w.energy,2)} kg${le!=null?` \xB7 ${z(w.energy*le)}`:""}`:null;if(O)return this._past(w,["po\xEAle \xE9teint",this._plan(w)]);let pe=Math.round((w.burn??0)*(w.to-w.from)/5)*5;return this._past(w,[`flamme ${f(w.level??0,0)}${(w.burn??0)<.95?` \xB7 ${pe} min`:` sur ${d}`}`,K,w.set!=null?`consigne ${f(w.set)}\xB0`:null,this._plan(w)])},...this._picker(),label:`Horloge du jour : ${j} \xE0 ${L(R)}, po\xEAle ${B}${P?`, arr\xEAt pr\xE9vu \xE0 ${mt(P.a)}`:""}.`},ot(it(h,d,e.en_feu),R!=null?`${f(R)}\xB0`:"\u2014",G)),te=this._why(e,a,o,h);return this._config.compacte?l`<div class="top compact">
   ${this._head(this._config.name||e.nom,e.phrase?l`<span class=${"say "+e.phrase.ton}>${e.phrase.texte}</span>`:`Po\xEAle \xE0 granul\xE9s${e.modele?` \xB7 ${e.modele}`:""}`,l`
    <span class=${"pill "+(e.etat==="alarme"?"alert":e.en_feu?"stove":"off")}>${B}</span>`,"poele","R\xE9glages du po\xEAle")}
   <div class="pair">${ye}<div class="side">${te?l`<p class="why">${te}</p>`:u}
    <span class=${"pill "+(o?"calm":"off")}><i class="dot"></i>${o?"Gestion auto":"\xC0 la main"}</span></div></div>
   ${this._stoveButtons(e,o)}
  </div>
  ${this._fireDrawer(t,e,a)}
  ${this._pelletDrawer(t,e)}`:l`<div class="top">
   ${this._head(this._config.name||e.nom,e.phrase?l`<span class=${"say "+e.phrase.ton}>${e.phrase.texte}</span>`:`Po\xEAle \xE0 granul\xE9s${e.modele?` \xB7 ${e.modele}`:""}`,l`
    <span class=${"pill "+(o?"calm":"off")}><i class="dot"></i>${o?"Gestion auto":"\xC0 la main"}</span>
    <span class=${"pill "+(e.etat==="alarme"?"alert":e.en_feu?"stove":"off")}>${B}</span>`,"poele","R\xE9glages du po\xEAle")}
   ${ye}
   <div class="legend">${v.map(w=>l`<span><i class=${"sw t-"+w}></i>${Le[w]??w}</span>`)}
    ${(i.temperature??[]).length?l`<span><i class="sw line"></i>${j.toLowerCase()}</span>`:u}
    ${x.some(w=>w[1]!=null)?l`<span><i class="sw set"></i>consigne</span>`:u}
    ${ee.some(w=>!w.ahead&&(w.heat??0)>=.02)?l`<span><i class="sw ramp flame"></i>flamme</span>`:u}
    ${ee.some(w=>w.ahead&&(w.heat??0)>=.02)?l`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:u}
    ${A!=null?l`<span><i class="sw ring lit"></i>allumage</span>`:u}${P?l`<span><i class="sw ring stop"></i>arrêt prévu</span>`:u}</div>
   ${r?l`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:u}
   ${te?l`<p class="why">${te}</p>`:u}
   ${this._stoveButtons(e,o)}
  </div>
  ${this._fireDrawer(t,e,a)}
  ${this._pelletDrawer(t,e)}`}_lastStart(t,e){let a=Math.max(0,e-Re),r=null,i=!1;for(let[c,o]of W(t,a,e)){let d=(o??0)>0;d&&!i&&(r=c),i=d}return r===a?null:r}_why(t,e,a,r){if(t.etat==="alarme")return t.phrase?"":`Le po\xEAle est en alarme${t.alarme_texte?` : ${t.alarme_texte}`:""}.`;if(a&&t.pilote?.texte)return t.pilote.texte;let i=t.depuis?` depuis ${oe(new Date(t.depuis))}`:"",c=t.en_feu&&r?`Flamme ${r}.${e&&e.temperature!=null?` ${e.nom} : ${L(e.temperature)}${t.consigne!=null?`, consigne ${L(t.consigne)}`:""}.`:""}`:`${{eteint:"Po\xEAle \xE9teint",allumage:"Le po\xEAle s\u2019allume",chauffe:"En chauffe",nettoyage:"Le po\xEAle se nettoie",extinction:"Le po\xEAle s\u2019\xE9teint"}[t.etat]??"Le po\xEAle ne dit pas son \xE9tat"}${i}.`;return(t.pilote&&!a?"Gestion auto coup\xE9e : Hestia ne touche pas au po\xEAle. ":"")+c}_stoveButtons(t,e){let a=t.allume??(t.en_feu||t.etat==="allumage"),r=t.boutons?.[a?"eteindre":"allumer"],i=!!t.copie,c=t.conso?.brasier,o=this._confirm,d=i?"Po\xEAle recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":"";return l`<div class="btns" @click=${h=>h.stopPropagation()}>
   ${r?l`<button class=${"btn"+(o==="power"?" ask":"")} ?disabled=${i||this._busy==="power"} title=${d}
     @click=${()=>this._press("power",()=>this._service(r),!0)}>${Zn}${o==="power"?a?"Vraiment \xE9teindre ?":"Vraiment allumer ?":a?"\xC9teindre":"Allumer"}</button>`:u}
   <button class=${"btn auto"+(e?" on":"")} aria-pressed=${e?"true":"false"} ?disabled=${i||this._busy==="auto"} title=${d}
     @click=${()=>this._press("auto",()=>this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!e}))}><span class="switch"><i></i></span>Gestion auto</button>
   ${c?l`<button class=${"btn"+(c.a_nettoyer?" due":"")+(o==="clean"?" ask":"")} ?disabled=${this._busy==="clean"}
     @click=${()=>this._press("clean",()=>this._hass.callWS({type:"hestia_heating/brasier_nettoye"}),!0)}>${Jn}${o==="clean"?"Remettre \xE0 z\xE9ro ?":"J\u2019ai nettoy\xE9"}</button>`:u}
  </div>
  ${i?l`<p class="note">Poêle recopié d’une autre maison : ses boutons sont grisés, rien ne lui est envoyé.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}_fireDrawer(t,e,a){let r=e.conso,i=e.en_feu&&r?.debit_kg_h?r.debit_kg_h:null,c=i&&r?.cout_heure!=null?`${z(r.cout_heure)} de l\u2019heure`:null,o=[e.fumees!=null?`fum\xE9es ${f(e.fumees,0)} \xB0C`:null,i?`${f(i,2)} kg/h`:e.en_feu?null:"\xE0 l\u2019arr\xEAt",c].filter(Boolean).join(" \xB7 ");return this._drawer("feu","Le feu et les r\xE9glages",o,!this._config.compacte,()=>{let d=!!e.copie,h=e.flamme_basse,m=e.ventilation,$=e.entites?.ventilation,v=e.prise_switch,S=this._soon(a?.prochain),A=[h?l`<button class=${"chip"+(h.on?" on stove":"")} aria-pressed=${h.on?"true":"false"} ?disabled=${d||this._busy==="low"} title=${h.nom}
      @click=${()=>this._press("low",()=>this._hass.callService(h.entity_id.split(".")[0],h.on?"turn_off":"turn_on",{entity_id:h.entity_id}))}><i class="dot"></i>Flamme réduite</button>`:null,m!=null&&$?l`<button class=${"chip"+(m.toLowerCase()!=="auto"?" on cold":"")} ?disabled=${d} title="Ouvrir la ventilation"
      @click=${()=>this._more($)}><i class="dot"></i>Ventilation ${m.toLowerCase()==="auto"?"auto":m}</button>`:null,v?l`<button class=${"chip"+(v.on?" on calm":"")} ?disabled=${d} title="Ouvrir la prise"
      @click=${()=>this._more(v.entity_id)}><i class="dot"></i>${v.on?"Prise allum\xE9e":v.on===!1?"Prise coup\xE9e":"Prise"}</button>`:null].filter(Boolean),k=[S?l`<div class="row">${Qn}<span><b>Planning.</b> ${a?.planning?`${ct(a.planning)} maintenant, puis `:"Ensuite : "}${this._next(S,t)}.</span></div>`:null,a?.appoint!=null?l`<div class="row cold">${ea}<span><b>Radiateur d’appoint.</b> Réglé à ${L(a.appoint)} : il prend le relais si le poêle ne suffit pas.</span></div>`:null].filter(Boolean);return l`<div class="tiles">${this._tile(a?.temperature!=null?f(a.temperature):"\u2014",`${a?a.nom.toLowerCase():"pi\xE8ce"}, \xB0C`,e.consigne!=null?`\u2192 ${f(e.consigne)}`:"")}
     ${this._tile(e.fumees!=null?f(e.fumees,0):"\u2014","fum\xE9es","\xB0C")}${this._tile(i?f(i,2):"\u2014",c??"granul\xE9s","kg/h")}</div>
    ${A.length?l`<div class="chips">${A}</div>`:u}${k.length?l`<div class="rows boxed">${k}</div>`:u}`},"fire")}_pelletDrawer(t,e){let a=t.granules,r=e.conso,i=r?.brasier,c=this._hist?.unite==="kg"?this._hist:void 0,o=a?.jours!=null?this._dayIn(a.jours):null,d=i?.kg!=null&&i.seuil_kg?Math.round(i.kg/i.seuil_kg*100):null,h=[o?`jusqu\u2019au ${o}`:null,r?.cout_jour!=null?`${z(r.cout_jour)} aujourd\u2019hui`:r?`${f(r.kg_jour,1)} kg aujourd\u2019hui`:null,d!=null?`brasier ${d} %`:null].filter(Boolean).join(" \xB7 "),m=[["granules","Granul\xE9s"],["argent","Argent"],["entretien","Entretien"]];return this._drawer("granules","Granul\xE9s \xB7 Argent \xB7 Entretien",h,!1,()=>{let $=this._tab("poele",m);return l`${this._tabbar("poele",m,"D\xE9tails du po\xEAle")}<div role="tabpanel" class="panel">${$==="granules"?this._pellets(a,r,c,o):$==="argent"?this._stoveMoney(t,r,c):this._upkeep(e)}</div>`},"pellets")}_dayIn(t){let e=new Date;return e.setDate(e.getDate()+t),`${e.getDate()===1?"1er":e.getDate()} ${Yt[e.getMonth()]}`}_sacks(t){let e=Math.floor(t+.05),a=t-e>.05;return e?`${e} sac${e>1?"s":""}${a?" et un entam\xE9":""}`:a?"un sac entam\xE9":"plus aucun sac"}_sackArt(t){let e=Math.floor(t+.05),a=t-e>.05?t-e:0,r=Math.min(12,e+(a?1:0)),i="M7 2h12l-1.5 4c3 2 4.5 5.5 4.5 10v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4c0-4.5 1.5-8 4.5-10z";return l`<svg class="sacks" viewBox="0 0 150 90" role="img" aria-label=${this._sacks(t)}><defs><linearGradient id="hcSack" x1="0" y1="1" x2="0" y2="0">
   <stop offset="0" class="full"></stop><stop offset=${a.toFixed(2)} class="full"></stop><stop offset=${a.toFixed(2)} class="empty"></stop><stop offset="1" class="empty"></stop></linearGradient></defs>
   ${Array.from({length:r},(c,o)=>y`<path class=${"sack"+(a&&e<12&&o===r-1?" part":"")} fill=${a&&e<12&&o===r-1?"url(#hcSack)":u} transform=${`translate(${o%6*24+(o>=6?12:0)} ${o<6?58:30})`} d=${i}></path>`)}</svg>`}_pellets(t,e,a,r){let i=a?.stat?a.jours:[],c=i.reduce((o,d)=>d.valeur!=null&&(o==null||d.valeur>(o.valeur??0))?d:o,null);return l`${t?.stock_sacs!=null?l`<div class="stock"><div><div class="nw-label">${r?"Il en reste jusqu\u2019au":"Il en reste"}</div>
     <div class="big">${r??this._sacks(t.stock_sacs)}</div>
     <div class="small">${[r?ct(this._sacks(t.stock_sacs)):null,t.kg_par_jour!=null?`au rythme de la saison : ${f(t.kg_par_jour)} kg par jour`:null].filter(Boolean).join(", ")}</div></div>
     ${this._sackArt(t.stock_sacs)}</div>`:l`<p class="note left">Le stock se lit avec l’intégration Suivi Stock Pellet : sans elle, Hestia compte seulement ce qui brûle.</p>
     ${e?l`<div class="tiles">${this._tile(f(e.kg_jour,1),"aujourd\u2019hui","kg")}${this._tile(f(e.kg_saison,0),"cette saison","kg")}${this._tile(e.debit_kg_h?f(e.debit_kg_h,2):"\u2014","en ce moment","kg/h")}</div>`:u}`}
   ${c?l`<div class="bhead"><span>Les 14 derniers jours</span><span>le plus : ${ht[je(c.jour).getDay()]}, ${f(c.valeur,1)} kg</span></div>
    ${this._bars(i,o=>f(o,1),`Granul\xE9s br\xFBl\xE9s par jour : ${this._dayList(i,o=>`${f(o,1)} kg`)}`)}`:u}`}_stoveMoney(t,e,a){let r=[["jour","Aujourd\u2019hui"],["semaine","7 jours"],["saison","Saison"]],i=this._tab("periode",r),c=a?.stat?a.jours.slice(-7).reduce((k,P)=>k+(P.valeur??0),0):null,o=i==="jour"?e?.kg_jour??null:i==="semaine"?c:e?.kg_saison??null,d=e?.prix_kg??null,h=t.prix_kwh??null,m=l`<div class="tabs" role="group" aria-label="Période">${r.map(([k,P])=>l`<button class="tab" aria-pressed=${k===i?"true":"false"}
   @click=${()=>{this._tabs={...this._tabs,periode:k}}}>${P}</button>`)}</div>`;if(d==null||h==null)return l`${m}<p class="note left">${d==null?"Le prix des granul\xE9s manque : donnez le prix et le poids d\u2019un sac dans les r\xE9glages. ":""}${h==null?"Le prix du kWh manque, pour comparer \xE0 l\u2019\xE9lectricit\xE9.":""}</p>${this._toSettings()}`;if(o==null)return l`${m}<p class="note">Pas encore de compte pour cette période.</p>`;let $=o*d,v=o*Gn*h,S=Math.max($,v)||1,A=v-$;return l`${m}<div class="versus">
    <span>Le poêle</span><span class="vb"><i class="pellet" style=${`width:${$/S*100}%`}></i></span><b>${z($)}</b>
    <span>À l’électricité</span><span class="vb"><i class="elec" style=${`width:${v/S*100}%`}></i></span><b>${z(v)}</b></div>
   <div class="saved"><b class=${A>=0?"good":"bad"}>${z(Math.abs(A))} ${A>=0?"gagn\xE9s":"de plus"}</b>
    <span>${i==="jour"?"aujourd\u2019hui, pour la m\xEAme chaleur":i==="semaine"?"sur les 7 derniers jours":"depuis le d\xE9but de la saison"}</span></div>
   <p class="note left">${f(o,o>=100?0:1)} kg de granulés à ${f(d,3)} € le kg, face à la même chaleur à l’électricité, à ${f(h,4)} € le kWh.</p>`}_upkeep(t){let e=t.conso?.brasier,a=2*Math.PI*26,r=e?.kg!=null&&e.seuil_kg?Math.min(1,e.kg/e.seuil_kg):0,i=e?.a_nettoyer?"alert":e?.bientot?"act":"stove",c=e?.kg!=null?f(e.kg,1):"\u2014";return l`${e?l`<div class="pot"><div class="pring"><svg viewBox="0 0 64 64" role="img" aria-label=${`Brasier : ${c} kg br\xFBl\xE9s sur ${f(e.seuil_kg,0)}`}>
     <circle class="bg" cx="32" cy="32" r="26"></circle><circle class=${"fg "+i} cx="32" cy="32" r="26" style=${`stroke-dasharray:${(a*r).toFixed(1)} ${a.toFixed(1)}`}></circle></svg>
     <span>${c}</span></div><div class="pt"><b>Brasier</b><span>${e.texte}</span></div></div>`:u}
   <div class="rows">
    <div class="row"><b>Alarme</b><span>${t.alarme?`${t.alarme_texte??"Le po\xEAle signale une alarme"}.`:"Aucune en ce moment."}</span></div>
    ${t.prise_w!=null?l`<div class="row"><b>Prise</b><span>${lt(t.prise_w)} en ce moment.</span></div>`:u}
   </div>`}_room(t){let e=this._roomOf(t);if(!e)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Pi\xE8ce"}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;let a=this._config.name||e.nom,r=this._tapAction(e),i=r==="thermostat"?`Ouvrir le thermostat de ${e.nom}`:`Ouvrir la page de ${e.nom}`;if(this._config.court)return l`<div class="short" role=${r?"button":u} tabindex=${r?0:u} aria-label=${r?i:u}
    @keydown=${r?x=>this._key(x,e):u}>
    <div class="temp">${e.temperature!=null?f(e.temperature):"\u2014"}<sup>°C</sup></div><div><b>${a}</b><span class="nw-say">${e.raison??(e.consigne!=null?`Consigne ${L(e.consigne)}`:"")}</span></div>${this._chip(e.badge)}</div>`;let{d:c,series:o,span:d}=this._window(t),h=t.planning.lignes.find(x=>x.id===e.id),m=h?.segments??[],$=[...new Set(m.map(x=>x.ton))],v=!e.poele&&(o.demande??[]).some(x=>(x[1]??0)>0),S=o.consigne?.length?o.consigne:e.consigne!=null?[[0,e.consigne]]:[],A=this._soon(e.prochain),k=e.type==="poele"?t.poele:null,P=k?it(k.en_feu?k.flamme??0:0,k.flamme_max||5,k.en_feu):It(e.type,e.etat),Q=A?this._next(A,t):e.consigne!=null?`consigne ${f(e.consigne)}\xB0`:"",R=c?.energie?.unite==="kWh"?c.energie.heures:[],j=t.prix_kwh??null,B={temp:o.temperature??[],heat:v?(o.demande??[]).map(([x,q])=>[x,q==null?null:q/100]):[],sets:S,energy:R},G=at(d,m,B),F=x=>{let q=v&&x.heat!=null?`chauffe ${Math.round(x.heat*100)} %`:null;return x.ahead?this._ahead(x,q):this._past(x,[q,x.energy!=null?`${f(x.energy,2)} kWh${j!=null?` \xB7 ${z(x.energy*j)}`:""}`:null,x.set!=null?`consigne ${f(x.set)}\xB0`:null,this._plan(x)])},V=st({span:d,segments:m,series:B,hours:G,kind:"demand",marks:A?[{at:gt(A.a),cls:"next"}]:[],say:F,...this._picker(),tap:r?{label:i,run:x=>this._tap(x,e)}:void 0,label:`Horloge du jour : ${e.nom} \xE0 ${L(e.temperature)}${e.consigne!=null?`, consigne ${L(e.consigne)}`:""}${A?`, ${this._next(A,t)}`:""}.`},ot(P,e.temperature!=null?`${f(e.temperature)}\xB0`:"\u2014",Q));return this._config.compacte?l`<div class="top compact">
   ${this._head(a,Zt[e.type??""]??"",l`${this._heatPill(e)}`,"pieces/"+e.id,`R\xE9glages de ${e.nom}`)}
   <div class="pair">${V}<div class="side">${e.raison?l`<p class="say">${e.raison}</p>`:u}${this._modePill(e)}</div></div>
   ${this._modes(e)}
  </div>
  ${this._roomDrawer(t,e)}`:l`<div class="top">
   ${this._head(a,Zt[e.type??""]??"",l`${this._heatPill(e)}${this._modePill(e)}`,"pieces/"+e.id,`R\xE9glages de ${e.nom}`)}
   ${V}
   <div class="legend">${$.map(x=>l`<span><i class=${"sw t-"+x}></i>${Le[x]??x}</span>`)}
    ${(o.temperature??[]).length?l`<span><i class="sw line"></i>température</span>`:u}
    ${S.some(x=>x[1]!=null)?l`<span><i class="sw set"></i>consigne</span>`:u}
    ${G.some(x=>!x.ahead&&(x.heat??0)>=.02)?l`<span><i class="sw ramp demand"></i>% de chauffe</span>`:u}
    ${G.some(x=>x.ahead&&(x.heat??0)>=.02)?l`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:u}
    ${A?l`<span><i class="sw ring next"></i>prochain changement</span>`:u}</div>
   ${c?l`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:u}
   ${e.raison?l`<p class="say">${e.raison}</p>`:u}
   ${this._modes(e)}
  </div>
  ${this._roomDrawer(t,e)}`}_heatPill(t){if(t.badge.ton==="alert"||t.badge.ton==="act"||t.etat==="arret"||t.etat==="inconnu")return l`<span class=${"pill "+t.badge.ton} role="status">${t.badge.texte}</span>`;if(t.etat==="chauffe"&&t.poele)return l`<span class="pill stove" role="status"><span class="beat">${ut}</span>${t.badge.texte}</span>`;if(t.etat==="chauffe"||t.etat==="rafraichit"){let e=t.etat==="rafraichit",a=t.demande_pct,r=e?"Rafra\xEEchit":"Chauffe";return l`<span class=${"pill "+(e?"cold":"heat")} role="status" aria-label=${a!=null?`${r}, demande ${a} %`:r}>
    <span class="beat">${ut}</span>${r}${a!=null?l` ${a} %<span class="gauge"><i style=${`width:${Math.min(100,a)}%`}></i></span>`:u}</span>`}return l`<span class="pill off" role="status">${ut}Ne chauffe pas</span>`}_modePill(t){let e=t.preset&&t.preset!=="none"?t.preset:null,a=e?He[e]??e:t.planning;return a?l`<span class=${"pill "+(e?Jt[e]??"heat":"calm")}><i class="dot"></i>${a.toLowerCase()}${t.planning?" \xB7 planning":""}</span>`:u}_roomDrawer(t,e){let a=this._hist?.unite==="kWh"?this._hist:void 0,r=t.prix_kwh??null,i=a?.stat?a.jours.at(-1)?.valeur??null:null,c=this._heatToday(e),o=[i!=null&&r!=null?`${z(i*r)} aujourd\u2019hui`:null,i!=null?`${f(i)} kWh`:c?`${c.time} de chauffe`:null,e.humidite!=null?`humidit\xE9 ${f(e.humidite,0)} %`:null].filter(Boolean).join(" \xB7 "),d=[["argent","Argent"],["conso","Conso"],["confort","Confort"]];return this._drawer("piece","Argent \xB7 Conso \xB7 Confort",o,!1,()=>{let h=this._tab("piece",d);return l`${this._tabbar("piece",d,"D\xE9tails de la pi\xE8ce")}<div role="tabpanel" class="panel">${h==="argent"?this._roomMoney(a,r):h==="conso"?this._roomUse(a,c):this._roomComfort(t,e)}</div>`})}_heatToday(t){let e=this._day;if(!e||t.poele||!e.series.demande?.length||e.fenetre_min==null)return null;let a=e.fenetre_min,r=Math.max(0,a-e.maintenant_min),i=0;for(let[,o]of W(e.series.demande,r,a-5))i+=(o??0)/100*5;let c=Math.round(i);return{time:c>=60?`${Math.floor(c/60)} h ${String(c%60).padStart(2,"0")}`:`${c} min`,duty:Math.round(i/Math.max(5,e.maintenant_min)*100)}}_roomMoney(t,e){if(!t)return l`<p class="note">Les derniers jours ne sont pas encore lus.</p>`;if(!t.stat)return l`<p class="note left">Le thermostat ne donne pas de compteur d’énergie : Hestia ne peut pas compter les kWh de cette pièce.</p>`;if(e==null)return l`<p class="note left">Donnez le prix du kWh dans les réglages pour voir ce que coûte la pièce.</p>${this._toSettings()}`;let a=t.jours.slice(-7),r=a.at(-1)?.valeur;return l`<div class="tiles">${this._tile(r!=null?z(r*e):"\u2014","aujourd\u2019hui")}
    ${this._tile(z(a.reduce((i,c)=>i+(c.valeur??0),0)*e),"7 derniers jours")}
    ${this._tile(t.mois!=null?z(t.mois*e):"\u2014",Yt[je(t.aujourdhui).getMonth()])}</div>
   ${this._bars(a,i=>f(i*e,2),`Co\xFBt par jour : ${this._dayList(a,i=>z(i*e))}`)}
   <p class="note left">Prix : ${f(e,4)} € le kWh, abonnement à part.</p>`}_roomUse(t,e){let a=t?.stat?t.jours.slice(-7):[],r=a.at(-1)?.valeur??null;return l`<div class="tiles">${this._tile(r!=null?f(r):"\u2014","aujourd\u2019hui","kWh")}${this._tile(e?e.time:"\u2014","de chauffe")}
    ${this._tile(e?`${e.duty} %`:"\u2014","du temps")}</div>
   ${a.some(i=>i.valeur!=null)?this._bars(a,i=>f(i),`kWh par jour : ${this._dayList(a,i=>`${f(i)} kWh`)}`):u}
   <p class="note left">${e?"Le temps de chauffe suit la demande du thermostat : 50 % pendant une heure comptent une demi-heure. ":""}${t?.stat?"Les kWh viennent du compteur d\u2019\xE9nergie du thermostat.":t?"Le thermostat ne donne pas de compteur d\u2019\xE9nergie.":""}</p>`}_roomComfort(t,e){let a=[];return e.humidite!=null&&a.push(["Humidit\xE9",`${f(e.humidite,0)} %, ${e.humidite<40?"un peu sec":e.humidite>60?"humide : a\xE9rez quelques minutes":"bien"}.`]),e.fenetre&&a.push(["Fen\xEAtre",`Ouverte${e.fenetre_depuis?` depuis ${oe(new Date(e.fenetre_depuis))}`:""}.`]),e.pente!=null&&Math.abs(e.pente)>=.05&&a.push(["En ce moment",`La pi\xE8ce ${e.pente>0?"gagne":"perd"} ${f(Math.abs(e.pente))} \xB0C par heure.`]),e.consigne!=null&&a.push(["Consigne",`${L(e.consigne)}${e.planning?`, ${e.planning} au planning`:""}${e.prochain?`, puis ${this._next(e.prochain,t)}`:""}.`]),e.puissance_w&&a.push(["Puissance",`${lt(e.puissance_w)} en ce moment.`]),a.length?l`<div class="rows">${a.map(([r,i])=>l`<div class="row"><b>${r}</b><span>${i}</span></div>`)}</div>`:l`<p class="note">Rien d’autre à dire sur la pièce pour l’instant.</p>`}_planning(t){let e=t.planning,a=e.maintenant_min/14.4,r=e.prochains,i=l`<div class="head"><h2 class="nw-title">${this._config.name||"Planning du jour"}</h2><span class="nw-chip calm">${e.jour_nom}</span>${this._info("planning","Ouvrir la page du planning")}</div>`;if(!e.lignes.length)return l`${i}<p class="empty">Aucun créneau pour l’instant : ils se règlent dans l’onglet Chauffage, page Planning.</p>`;let c=[...new Set(e.lignes.flatMap(o=>o.segments.map(d=>d.ton)))];return l`${i}<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(o=>l`<span style=${`left:${o/24*100}%`}>${o} h</span>`)}</div></div>
   ${e.lignes.map(o=>l`<div class="lane"><span class="n">${o.nom}${o.source?l`<small class=${o.bloque?"bad":""}>${o.source}${o.bloque?" \xB7 deux plannings":""}</small>`:u}</span><div class="track" role="img" aria-label=${o.nom}>${o.segments.map(d=>l`<i class=${"t-"+d.ton} style=${`left:${d.de/14.4}%;width:${(d.a-d.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${a}%`}></span></div></div>`)}</div>
   <div class="nw-legend">${c.map(o=>l`<span><i class=${"sw t-"+o}></i>${Le[o]??o}</span>`)}</div>
   <div class="nw-stats"><div><span>Prochain changement</span><b>${r[0]?`${pt(r[0].a)} \xB7 ${r[0].texte}`:"\u2014"}</b></div>
    <div><span>Ensuite</span><b>${r[1]?`${pt(r[1].a)} \xB7 ${r[1].texte}`:"\u2014"}</b></div><div><span>Réglé par</span><b>${e.source??"\u2014"}</b></div></div>
   ${e.labo||e.essai?l`<p class="note">${e.labo?"Thermostats recopi\xE9s d\u2019une autre maison : les plannings Hestia ne leur envoient rien.":"Un planning Hestia est en pause : il montre ce qu\u2019il ferait, sans rien envoyer."}</p>`:u}`}};customElements.get("hestia-heating-card")||customElements.define("hestia-heating-card",ft);var Te=window;Te.customCards=Te.customCards??[];Te.customCards.some(s=>s.type==="hestia-heating-card")||Te.customCards.push({type:"hestia-heating-card",name:"Hestia Chauffage",description:"Le chauffage de la maison : qui chauffe, chaque pi\xE8ce, le po\xEAle, le planning.",preview:!0});})();

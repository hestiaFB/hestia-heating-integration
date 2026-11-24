// Home Assistant frontend#53890: wait for the final custom element registry.
while (!customElements.get('home-assistant')) {
  await customElements.whenDefined('home-assistant');
}
"use strict";(()=>{var ke=globalThis,Ae=ke.ShadowRoot&&(ke.ShadyCSS===void 0||ke.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,De=Symbol(),bt=new WeakMap,de=class{constructor(a,e,t){if(this._$cssResult$=!0,t!==De)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=a,this.t=e}get styleSheet(){let a=this.o,e=this.t;if(Ae&&a===void 0){let t=e!==void 0&&e.length===1;t&&(a=bt.get(e)),a===void 0&&((this.o=a=new CSSStyleSheet).replaceSync(this.cssText),t&&bt.set(e,a))}return a}toString(){return this.cssText}},ue=s=>new de(typeof s=="string"?s:s+"",void 0,De),qe=(s,...a)=>{let e=s.length===1?s[0]:a.reduce((t,n,r)=>t+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+s[r+1],s[0]);return new de(e,s,De)},xt=(s,a)=>{if(Ae)s.adoptedStyleSheets=a.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of a){let t=document.createElement("style"),n=ke.litNonce;n!==void 0&&t.setAttribute("nonce",n),t.textContent=e.cssText,s.appendChild(t)}},Oe=Ae?s=>s:s=>s instanceof CSSStyleSheet?(a=>{let e="";for(let t of a.cssRules)e+=t.cssText;return ue(e)})(s):s;var{is:dn,defineProperty:un,getOwnPropertyDescriptor:hn,getOwnPropertyNames:gn,getOwnPropertySymbols:mn,getPrototypeOf:fn}=Object,Se=globalThis,$t=Se.trustedTypes,vn=$t?$t.emptyScript:"",wn=Se.reactiveElementPolyfillSupport,he=(s,a)=>s,Ue={toAttribute(s,a){switch(a){case Boolean:s=s?vn:null;break;case Object:case Array:s=s==null?s:JSON.stringify(s)}return s},fromAttribute(s,a){let e=s;switch(a){case Boolean:e=s!==null;break;case Number:e=s===null?null:Number(s);break;case Object:case Array:try{e=JSON.parse(s)}catch{e=null}}return e}},yt=(s,a)=>!dn(s,a),_t={attribute:!0,type:String,converter:Ue,reflect:!1,useDefault:!1,hasChanged:yt};Symbol.metadata??=Symbol("metadata"),Se.litPropertyMetadata??=new WeakMap;var V=class extends HTMLElement{static addInitializer(a){this._$Ei(),(this.l??=[]).push(a)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(a,e=_t){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(a)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(a,e),!e.noAccessor){let t=Symbol(),n=this.getPropertyDescriptor(a,t,e);n!==void 0&&un(this.prototype,a,n)}}static getPropertyDescriptor(a,e,t){let{get:n,set:r}=hn(this.prototype,a)??{get(){return this[e]},set(i){this[e]=i}};return{get:n,set(i){let c=n?.call(this);r?.call(this,i),this.requestUpdate(a,c,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(a){return this.elementProperties.get(a)??_t}static _$Ei(){if(this.hasOwnProperty(he("elementProperties")))return;let a=fn(this);a.finalize(),a.l!==void 0&&(this.l=[...a.l]),this.elementProperties=new Map(a.elementProperties)}static finalize(){if(this.hasOwnProperty(he("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(he("properties"))){let e=this.properties,t=[...gn(e),...mn(e)];for(let n of t)this.createProperty(n,e[n])}let a=this[Symbol.metadata];if(a!==null){let e=litPropertyMetadata.get(a);if(e!==void 0)for(let[t,n]of e)this.elementProperties.set(t,n)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let n=this._$Eu(e,t);n!==void 0&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(a){let e=[];if(Array.isArray(a)){let t=new Set(a.flat(1/0).reverse());for(let n of t)e.unshift(Oe(n))}else a!==void 0&&e.push(Oe(a));return e}static _$Eu(a,e){let t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof a=="string"?a.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(a=>this.enableUpdating=a),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(a=>a(this))}addController(a){(this._$EO??=new Set).add(a),this.renderRoot!==void 0&&this.isConnected&&a.hostConnected?.()}removeController(a){this._$EO?.delete(a)}_$E_(){let a=new Map,e=this.constructor.elementProperties;for(let t of e.keys())this.hasOwnProperty(t)&&(a.set(t,this[t]),delete this[t]);a.size>0&&(this._$Ep=a)}createRenderRoot(){let a=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return xt(a,this.constructor.elementStyles),a}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(a=>a.hostConnected?.())}enableUpdating(a){}disconnectedCallback(){this._$EO?.forEach(a=>a.hostDisconnected?.())}attributeChangedCallback(a,e,t){this._$AK(a,t)}_$ET(a,e){let t=this.constructor.elementProperties.get(a),n=this.constructor._$Eu(a,t);if(n!==void 0&&t.reflect===!0){let r=(t.converter?.toAttribute!==void 0?t.converter:Ue).toAttribute(e,t.type);this._$Em=a,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(a,e){let t=this.constructor,n=t._$Eh.get(a);if(n!==void 0&&this._$Em!==n){let r=t.getPropertyOptions(n),i=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:Ue;this._$Em=n;let c=i.fromAttribute(e,r.type);this[n]=c??this._$Ej?.get(n)??c,this._$Em=null}}requestUpdate(a,e,t,n=!1,r){if(a!==void 0){let i=this.constructor;if(n===!1&&(r=this[a]),t??=i.getPropertyOptions(a),!((t.hasChanged??yt)(r,e)||t.useDefault&&t.reflect&&r===this._$Ej?.get(a)&&!this.hasAttribute(i._$Eu(a,t))))return;this.C(a,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(a,e,{useDefault:t,reflect:n,wrapped:r},i){t&&!(this._$Ej??=new Map).has(a)&&(this._$Ej.set(a,i??e??this[a]),r!==!0||i!==void 0)||(this._$AL.has(a)||(this.hasUpdated||t||(e=void 0),this._$AL.set(a,e)),n===!0&&this._$Em!==a&&(this._$Eq??=new Set).add(a))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let a=this.scheduleUpdate();return a!=null&&await a,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[n,r]of t){let{wrapped:i}=r,c=this[n];i!==!0||this._$AL.has(n)||c===void 0||this.C(n,void 0,r,c)}}let a=!1,e=this._$AL;try{a=this.shouldUpdate(e),a?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw a=!1,this._$EM(),t}a&&this._$AE(e)}willUpdate(a){}_$AE(a){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(a)),this.updated(a)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(a){return!0}update(a){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(a){}firstUpdated(a){}};V.elementStyles=[],V.shadowRootOptions={mode:"open"},V[he("elementProperties")]=new Map,V[he("finalized")]=new Map,wn?.({ReactiveElement:V}),(Se.reactiveElementVersions??=[]).push("2.1.2");var Ge=globalThis,kt=s=>s,Ce=Ge.trustedTypes,At=Ce?Ce.createPolicy("lit-html",{createHTML:s=>s}):void 0,jt="$lit$",Z=`lit$${Math.random().toFixed(9).slice(2)}$`,zt="?"+Z,bn=`<${zt}>`,ne=document,me=()=>ne.createComment(""),fe=s=>s===null||typeof s!="object"&&typeof s!="function",Ke=Array.isArray,xn=s=>Ke(s)||typeof s?.[Symbol.iterator]=="function",Ne=`[ 	
\f\r]`,ge=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,St=/-->/g,Ct=/>/g,ee=RegExp(`>|${Ne}(?:([^\\s"'>=/]+)(${Ne}*=${Ne}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Et=/'/g,Mt=/"/g,Rt=/^(?:script|style|textarea|title)$/i,Ye=s=>(a,...e)=>({_$litType$:s,strings:a,values:e}),l=Ye(1),k=Ye(2),oa=Ye(3),ae=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Pt=new WeakMap,te=ne.createTreeWalker(ne,129);function Lt(s,a){if(!Ke(s)||!s.hasOwnProperty("raw"))throw Error("invalid template strings array");return At!==void 0?At.createHTML(a):a}var $n=(s,a)=>{let e=s.length-1,t=[],n,r=a===2?"<svg>":a===3?"<math>":"",i=ge;for(let c=0;c<e;c++){let o=s[c],d,h,m=-1,$=0;for(;$<o.length&&(i.lastIndex=$,h=i.exec(o),h!==null);)$=i.lastIndex,i===ge?h[1]==="!--"?i=St:h[1]!==void 0?i=Ct:h[2]!==void 0?(Rt.test(h[2])&&(n=RegExp("</"+h[2],"g")),i=ee):h[3]!==void 0&&(i=ee):i===ee?h[0]===">"?(i=n??ge,m=-1):h[1]===void 0?m=-2:(m=i.lastIndex-h[2].length,d=h[1],i=h[3]===void 0?ee:h[3]==='"'?Mt:Et):i===Mt||i===Et?i=ee:i===St||i===Ct?i=ge:(i=ee,n=void 0);let w=i===ee&&s[c+1].startsWith("/>")?" ":"";r+=i===ge?o+bn:m>=0?(t.push(d),o.slice(0,m)+jt+o.slice(m)+Z+w):o+Z+(m===-2?c:w)}return[Lt(s,r+(s[e]||"<?>")+(a===2?"</svg>":a===3?"</math>":"")),t]},ve=class s{constructor({strings:a,_$litType$:e},t){let n;this.parts=[];let r=0,i=0,c=a.length-1,o=this.parts,[d,h]=$n(a,e);if(this.el=s.createElement(d,t),te.currentNode=this.el.content,e===2||e===3){let m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(n=te.nextNode())!==null&&o.length<c;){if(n.nodeType===1){if(n.hasAttributes())for(let m of n.getAttributeNames())if(m.endsWith(jt)){let $=h[i++],w=n.getAttribute(m).split(Z),A=/([.?@])?(.*)/.exec($);o.push({type:1,index:r,name:A[2],strings:w,ctor:A[1]==="."?Fe:A[1]==="?"?Be:A[1]==="@"?Ve:oe}),n.removeAttribute(m)}else m.startsWith(Z)&&(o.push({type:6,index:r}),n.removeAttribute(m));if(Rt.test(n.tagName)){let m=n.textContent.split(Z),$=m.length-1;if($>0){n.textContent=Ce?Ce.emptyScript:"";for(let w=0;w<$;w++)n.append(m[w],me()),te.nextNode(),o.push({type:2,index:++r});n.append(m[$],me())}}}else if(n.nodeType===8)if(n.data===zt)o.push({type:2,index:r});else{let m=-1;for(;(m=n.data.indexOf(Z,m+1))!==-1;)o.push({type:7,index:r}),m+=Z.length-1}r++}}static createElement(a,e){let t=ne.createElement("template");return t.innerHTML=a,t}};function ie(s,a,e=s,t){if(a===ae)return a;let n=t!==void 0?e._$Co?.[t]:e._$Cl,r=fe(a)?void 0:a._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(s),n._$AT(s,e,t)),t!==void 0?(e._$Co??=[])[t]=n:e._$Cl=n),n!==void 0&&(a=ie(s,n._$AS(s,a.values),n,t)),a}var We=class{constructor(a,e){this._$AV=[],this._$AN=void 0,this._$AD=a,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(a){let{el:{content:e},parts:t}=this._$AD,n=(a?.creationScope??ne).importNode(e,!0);te.currentNode=n;let r=te.nextNode(),i=0,c=0,o=t[0];for(;o!==void 0;){if(i===o.index){let d;o.type===2?d=new we(r,r.nextSibling,this,a):o.type===1?d=new o.ctor(r,o.name,o.strings,this,a):o.type===6&&(d=new Ie(r,this,a)),this._$AV.push(d),o=t[++c]}i!==o?.index&&(r=te.nextNode(),i++)}return te.currentNode=ne,n}p(a){let e=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(a,t,e),e+=t.strings.length-2):t._$AI(a[e])),e++}},we=class s{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(a,e,t,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=a,this._$AB=e,this._$AM=t,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let a=this._$AA.parentNode,e=this._$AM;return e!==void 0&&a?.nodeType===11&&(a=e.parentNode),a}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(a,e=this){a=ie(this,a,e),fe(a)?a===u||a==null||a===""?(this._$AH!==u&&this._$AR(),this._$AH=u):a!==this._$AH&&a!==ae&&this._(a):a._$litType$!==void 0?this.$(a):a.nodeType!==void 0?this.T(a):xn(a)?this.k(a):this._(a)}O(a){return this._$AA.parentNode.insertBefore(a,this._$AB)}T(a){this._$AH!==a&&(this._$AR(),this._$AH=this.O(a))}_(a){this._$AH!==u&&fe(this._$AH)?this._$AA.nextSibling.data=a:this.T(ne.createTextNode(a)),this._$AH=a}$(a){let{values:e,_$litType$:t}=a,n=typeof t=="number"?this._$AC(a):(t.el===void 0&&(t.el=ve.createElement(Lt(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===n)this._$AH.p(e);else{let r=new We(n,this),i=r.u(this.options);r.p(e),this.T(i),this._$AH=r}}_$AC(a){let e=Pt.get(a.strings);return e===void 0&&Pt.set(a.strings,e=new ve(a)),e}k(a){Ke(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,t,n=0;for(let r of a)n===e.length?e.push(t=new s(this.O(me()),this.O(me()),this,this.options)):t=e[n],t._$AI(r),n++;n<e.length&&(this._$AR(t&&t._$AB.nextSibling,n),e.length=n)}_$AR(a=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);a!==this._$AB;){let t=kt(a).nextSibling;kt(a).remove(),a=t}}setConnected(a){this._$AM===void 0&&(this._$Cv=a,this._$AP?.(a))}},oe=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(a,e,t,n,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=a,this.name=e,this._$AM=n,this.options=r,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=u}_$AI(a,e=this,t,n){let r=this.strings,i=!1;if(r===void 0)a=ie(this,a,e,0),i=!fe(a)||a!==this._$AH&&a!==ae,i&&(this._$AH=a);else{let c=a,o,d;for(a=r[0],o=0;o<r.length-1;o++)d=ie(this,c[t+o],e,o),d===ae&&(d=this._$AH[o]),i||=!fe(d)||d!==this._$AH[o],d===u?a=u:a!==u&&(a+=(d??"")+r[o+1]),this._$AH[o]=d}i&&!n&&this.j(a)}j(a){a===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,a??"")}},Fe=class extends oe{constructor(){super(...arguments),this.type=3}j(a){this.element[this.name]=a===u?void 0:a}},Be=class extends oe{constructor(){super(...arguments),this.type=4}j(a){this.element.toggleAttribute(this.name,!!a&&a!==u)}},Ve=class extends oe{constructor(a,e,t,n,r){super(a,e,t,n,r),this.type=5}_$AI(a,e=this){if((a=ie(this,a,e,0)??u)===ae)return;let t=this._$AH,n=a===u&&t!==u||a.capture!==t.capture||a.once!==t.once||a.passive!==t.passive,r=a!==u&&(t===u||n);n&&this.element.removeEventListener(this.name,this,t),r&&this.element.addEventListener(this.name,this,a),this._$AH=a}handleEvent(a){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,a):this._$AH.handleEvent(a)}},Ie=class{constructor(a,e,t){this.element=a,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(a){ie(this,a)}};var _n=Ge.litHtmlPolyfillSupport;_n?.(ve,we),(Ge.litHtmlVersions??=[]).push("3.3.3");var Tt=(s,a,e)=>{let t=e?.renderBefore??a,n=t._$litPart$;if(n===void 0){let r=e?.renderBefore??null;t._$litPart$=n=new we(a.insertBefore(me(),r),r,void 0,e??{})}return n._$AI(s),n};var Xe=globalThis,N=class extends V{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let a=super.createRenderRoot();return this.renderOptions.renderBefore??=a.firstChild,a}update(a){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(a),this._$Do=Tt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return ae}};N._$litElement$=!0,N.finalized=!0,Xe.litElementHydrateSupport?.({LitElement:N});var yn=Xe.litElementPolyfillSupport;yn?.({LitElement:N});(Xe.litElementVersions??=[]).push("4.2.2");var Ht=`/* CHARTE COMMUNE HESTIA \u2014 jetons et pi\xE8ces partag\xE9s par toutes les cartes Hestia.
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
/* The fire pot's button (1.0.0b6): filled as the pot is, its state over \xAB J\u2019ai nettoy\xE9 \xBB. */
.btn.pot { --c:var(--nw-calm); flex-basis:100%; justify-content:flex-start; padding:0 18px;
  background:linear-gradient(90deg, color-mix(in oklab, var(--c) 30%, var(--hc-raised2)) var(--fill), var(--hc-raised2) var(--fill)); }
.btn.pot.soon { --c:var(--nw-act); } .btn.pot.due { --c:var(--nw-alert); border-color:color-mix(in oklab, var(--c) 70%, transparent); }
.btn.pot.ask { background:color-mix(in oklab, var(--nw-act) var(--nw-chip-tint), var(--nw-bg)); }
.pot-say { display:flex; flex-direction:column; align-items:flex-start; min-width:0; line-height:1.2; }
.pot-say b, .pot-say small { overflow:hidden; text-overflow:ellipsis; max-width:100%; }
.pot-say small { font-size:var(--nw-fs-small, 12px); font-weight:600; color:var(--nw-fg2); }
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

/* The stove's settings in its drawer (1.0.0b3): the flame, the fan, the \xC9CO Stop. */
.ctl { display:flex; flex-direction:column; gap:0; margin:10px 0; padding:4px 14px; border-radius:16px; background:var(--hc-raised); }
.ctl-row { display:flex; flex-wrap:wrap; align-items:center; gap:8px 10px; padding:10px 0; border-top:1px solid var(--nw-line-soft); }
.ctl-row:first-child { border-top:0; }
.ctl-row > b { width:92px; flex:none; font-size:var(--nw-fs-text); }
.segs, .steps { display:inline-flex; border:1px solid var(--nw-line); border-radius:12px; overflow:hidden; }
.seg, .step { height:36px; padding:0 12px; border:0; border-left:1px solid var(--nw-line); background:transparent; color:var(--nw-fg); font:inherit; font-size:var(--nw-fs-small); font-weight:650; cursor:pointer; }
.step { min-width:36px; padding:0 8px; }
.seg:first-child, .step:first-child { border-left:0; }
.seg.on, .step.on { background:var(--nw-fg); color:var(--nw-bg); }
.seg:disabled, .step:disabled { opacity:.5; cursor:not-allowed; }
.ctl-say { flex-basis:100%; margin:0; font-size:var(--nw-fs-small); color:var(--nw-fg2); line-height:1.4; }
@media (max-width:420px) { .ctl-row > b { width:100%; } }
`;var Sn=[["thermostat","Ouvrir le thermostat"],["page","Ouvrir la page de la pi\xE8ce (onglet Chauffage)"],["none","Rien"]],qt=[["complete","Compl\xE8te : l\u2019horloge du jour en grand, sa l\xE9gende"],["compacte","Compacte : l\u2019horloge en petit, \xE0 c\xF4t\xE9 de sa phrase"],["ligne","Une ligne : le nom, la temp\xE9rature, le mode"]],Cn={piece:"Pi\xE8ce",version:"Version",name:"Titre facultatif",tap_action:"Appui court"},En={name:"Vide : le titre de la carte.",version:"La compacte tient environ deux fois moins de hauteur ; les chiffres de chaque heure restent au survol.",tap_action:"Sur la carte, ailleurs que sur un bouton ou une heure de l\u2019horloge."},Mn=[["maison","mdi:home-thermometer-outline","La maison","qui chauffe, chaque pi\xE8ce, le froid de la nuit"],["poele","mdi:fireplace","Le po\xEAle","son horloge du jour, sa flamme, ses boutons, les granul\xE9s et l\u2019argent"],["piece","mdi:thermometer","Une pi\xE8ce","son horloge du jour, sa chauffe, ses modes, ce qu\u2019elle co\xFBte"],["planning","mdi:calendar-clock","Le planning","la journ\xE9e de chaque pi\xE8ce et du po\xEAle"]],Pn=s=>{s.preventDefault(),history.pushState(null,"",s.currentTarget.getAttribute("href")??"/hestia/chauffage"),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))},Ze=class extends N{constructor(){super(...arguments);this.rooms=[];this.changed=e=>{e.stopPropagation();let t=e.detail.value;this.set({...t.piece?{piece:t.piece}:{},name:(t.name??"").trim(),court:t.version==="ligne",compacte:t.version==="compacte",...t.tap_action?{tap_action:t.tap_action}:{}})}}static{this.properties={hass:{attribute:!1},config:{state:!0},rooms:{state:!0}}}static{this.styles=qe`.note{color:var(--secondary-text-color);font-size:12px;line-height:1.6;margin:0 0 16px}a{color:var(--primary-color)}
  .formats{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:4px 0 16px}
  .formats button{all:unset;box-sizing:border-box;display:flex;flex-direction:column;gap:4px;padding:10px 12px;border:1px solid var(--divider-color);border-radius:12px;cursor:pointer;color:var(--primary-text-color);font-size:12px;line-height:1.45}
  .formats button:hover{border-color:var(--secondary-text-color)}
  .formats button:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
  .formats button.on{border:2px solid var(--primary-color);padding:9px 11px}
  .formats ha-icon{--mdc-icon-size:20px;color:var(--secondary-text-color)}.formats button.on ha-icon{color:var(--primary-color)}
  .formats b{font-size:14px;font-weight:500}.formats span{color:var(--secondary-text-color)}`}setConfig(e){this.config={...e}}connectedCallback(){super.connectedCallback(),this.loadRooms()}async loadRooms(){try{let e=await this.hass?.callWS?.({type:"hestia_heating/view"});this.rooms=(e?.pieces??[]).map(t=>({id:t.id,nom:t.nom}))}catch{}}set(e){let t={...this.config,...e};t.name||delete t.name,t.card==="maison"&&delete t.card,t.card!=="piece"&&(delete t.piece,delete t.court,delete t.tap_action),t.card!=="piece"&&t.card!=="poele"&&delete t.compacte,t.court||delete t.court,(!t.compacte||t.court)&&delete t.compacte,t.tap_action==="thermostat"&&delete t.tap_action,this.config=t,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0}))}schema(e){let t=(r,i)=>({name:r,required:!0,selector:{select:{mode:"dropdown",options:i.map(([c,o])=>({value:c,label:o}))}}}),n=this.rooms.map(r=>[r.id,r.nom]);return this.config?.piece&&!n.some(([r])=>r===this.config.piece)&&n.push([this.config.piece,this.config.piece]),[...e==="piece"&&n.length?[t("piece",n)]:[],...e==="piece"?[t("version",qt)]:e==="poele"?[t("version",qt.slice(0,2))]:[],{name:"name",selector:{text:{}}},...e==="piece"?[{type:"expandable",name:"",title:"Fonctionnalit\xE9s",icon:"mdi:tune-variant",flatten:!0,expanded:!1,schema:[t("tap_action",Sn)]}]:[]]}render(){if(!this.config)return u;let e=this.config,t=e.card??"maison",n={piece:e.piece??this.rooms[0]?.id,version:e.court?"ligne":e.compacte?"compacte":"complete",name:e.name??"",tap_action:e.tap_action??"thermostat"};return l`<p class="note">Choisissez ce que montre la carte. Les thermostats lus, le poêle et les extensions se règlent dans
    <a href="/hestia/chauffage" @click=${Pn}>l’onglet Chauffage</a>.</p>
   <div class="formats" role="radiogroup" aria-label="Format">${Mn.map(([r,i,c,o])=>l`<button type="button" role="radio" aria-checked=${r===t}
     class=${r===t?"on":""} @click=${()=>{r!==t&&this.set({card:r,...r==="piece"&&!e.piece&&this.rooms[0]?{piece:this.rooms[0].id}:{}})}}><ha-icon icon=${i}></ha-icon><b>${c}</b><span>${o}</span></button>`)}</div>
   <ha-form .hass=${this.hass} .data=${n} .schema=${this.schema(t)} .computeLabel=${r=>Cn[r.name]??r.name}
     .computeHelper=${r=>En[r.name]??""} @value-changed=${this.changed}></ha-form>`}};customElements.get("hestia-heating-card-editor")||customElements.define("hestia-heating-card-editor",Ze);var le=new WeakMap;function Ot(s,a){le.get(s)===a&&le.delete(s),clearTimeout(a.closing),a.stop?.then(e=>e()).catch(()=>{})}function Ut(s,a,e,t){let n=le.get(s),r={view:a,error:e,reload:t};if(n){clearTimeout(n.closing),n.closing=void 0;let c=n.last;c&&queueMicrotask(()=>{n.listeners.has(r)&&a(c)})}else{let c={listeners:new Set};n=c,le.set(s,c),c.stop=s.subscribeMessage(o=>{if(o.reload){Ot(s,c);for(let h of[...c.listeners])h.reload();return}let d;if(o.changes){if(!c.last)return;d={...c.last,...o.changes};for(let h of o.removed??[])delete d[h]}else if(o.view)d=o.view;else return;c.last=d;for(let h of[...c.listeners])h.view(d)},{type:"hestia_heating/subscribe"}),c.stop.catch(o=>{le.get(s)===c&&le.delete(s);for(let d of[...c.listeners])d.error(o)})}let i=n;return i.listeners.add(r),()=>{!i.listeners.delete(r)||i.listeners.size||(clearTimeout(i.closing),i.closing=setTimeout(()=>{i.listeners.size||Ot(s,i)},5e3))}}var jn=440,zn=386,W=220,F=193,be=64,Nt=76,Je=40,Ee=128,Qe=142,Me=28,Pe=184,Rn=190,ze=1200,Ln=5,x=s=>s.toFixed(1),je=s=>(s%1440+1440)%1440;function z(s,a){let e=je(a)/1440*2*Math.PI-Math.PI/2;return[W+s*Math.cos(e),F+s*Math.sin(e)]}function Wt(s,a,e){let[t,n]=z(s,a),[r,i]=z(s,e);return`M${x(t)} ${x(n)}A${s} ${s} 0 ${e-a>720?1:0} 1 ${x(r)} ${x(i)}`}function Ft(s,a,e,t){let[n,r]=z(s,e),[i,c]=z(a,e),[o,d]=z(a,t),[h,m]=z(s,t);return`M${x(n)} ${x(r)}L${x(i)} ${x(c)}A${a} ${a} 0 0 1 ${x(o)} ${x(d)}L${x(h)} ${x(m)}A${s} ${s} 0 0 0 ${x(n)} ${x(r)}Z`}function I(s,a,e,t=Ln){let n=[],r=0,i=null;for(let c=a;c<=e;c+=t){for(;r<s.length&&s[r][0]<=c;)i=s[r][1],r++;n.push([c,i])}return n}function Tn(s){let a=[],e=null;for(let[t,n]of s){if(n==null){e=null;continue}e||(e=[],a.push(e)),e.push([t,n])}return a}var tt=s=>s.map(a=>a[1]).filter(a=>a!=null),et=s=>s.length?s.reduce((a,e)=>a+e,0)/s.length:null;function nt(s,a,e){let t=s.length-je(s.start+s.length);return Array.from({length:24},(n,r)=>{let i=je(r*60-s.start),c=Math.min(i+60,s.length),o=w=>w&&i<c?tt(I(w,i,Math.max(i,c-1))):[],d=e.level?o(e.level):[],h=d.filter(w=>w>0),m=o(e.sets),$=r*60+30;return{k:r,from:i,to:c,current:i<s.length&&i+60>s.length,yesterday:i<t,ahead:i<s.length-ze,ton:a.find(w=>w.de<=$&&$<w.a)?.ton??null,temp:et(o(e.temp)),heat:et(o(e.heat)),burn:d.length?h.length/d.length:null,level:et(h),set:m.length?m[m.length-1]:null,energy:e.energy.find(([w])=>Math.abs(w-i)<=1)?.[1]??null}})}var Hn=3,Bt=.36,Vt=s=>`${s.toLocaleString("fr-FR",{maximumFractionDigits:1})}\xB0`,Dn=s=>6*s.length+4,qn=11;function at(s,a){let{span:e,series:t}=s,n=e.length,r=Math.max(0,n-ze),i=p=>e.start+p,c=I(t.temp,r,n),o=tt(c),d=o.length?Math.min(...o)-Hn:-1/0,h=I(t.sets,r,n).map(([p,g])=>[p,g!=null&&g>=d?Math.round(g*2)/2:null]),m=[...new Set(tt(h))].sort((p,g)=>g-p).slice(0,3),$=[...o,...m],w=$.length?Math.floor(Math.min(...$)-.5):16,A=$.length?Math.ceil(Math.max(...$)+.5):22;if(A-w<3){let p=(A+w)/2;w=Math.floor(p-1.5),A=w+3}let C=p=>Nt+Math.max(0,Math.min(1,(p-w)/(A-w)))*Je,S=Tn(c).filter(p=>p.length>1),P=p=>p.map(([g,_],E)=>{let[X,Q]=z(C(_),i(g));return`${E?"L":"M"}${x(X)} ${x(Q)}`}).join(""),G=S.map(p=>P(p)+p.slice().reverse().map(([g])=>{let[_,E]=z(be+2,i(g));return`L${x(_)} ${x(E)}`}).join("")+"Z").join(""),L="",j=null;for(let[p,g]of h){if(g==null||!m.includes(g)){j=null;continue}let[_,E]=z(C(g),i(p));if(j==null)L+=`M${x(_)} ${x(E)}`;else{if(g!==j){let[X,Q]=z(C(j),i(p));L+=`L${x(X)} ${x(Q)}`}L+=`L${x(_)} ${x(E)}`}j=g}let y=e.start+(n+r+1440)/2,T=A-w,D=[1,2,5,10].find(p=>p*Je/T>=12)??10,q=[];if(S.length)for(let p=Math.ceil(w/D)*D;p<=A;p+=D)m.some(g=>Math.abs(g-p)<=D/2)||q.push(p);let b=[...m.map(p=>({t:p,set:!0})),...q.map(p=>({t:p,set:!1}))].sort((p,g)=>p.t-g.t),U=(p,g)=>Math.abs(p.x-g.x)<(p.w+g.w)/2+2&&Math.abs(p.y-g.y)<qn,xe=(p,g)=>p.map((_,E)=>{let[X,Q]=z(C(_.t),y+(E-(p.length-1)/2)*g);return{..._,x:X,y:Q,w:Dn(Vt(_.t))}}),$e=p=>p.every((g,_)=>p.slice(_+1).every(E=>!U(g,E))),pe=[];for(let p of[b,b.filter((g,_)=>g.set||_%2===0),b.filter(g=>g.set)]){let g=[0,12,-12,24,-24,36,-36].find(_=>(p.length-1)/2*Math.abs(_)<=80&&$e(xe(p,_)));if(g!=null){pe=xe(p,g);break}}let K=S.length?S[S.length-1][S[S.length-1].length-1]:null,[ft,_e]=K?z(C(K[1]),i(K[0])):[0,0],[se,v]=z(be+4,e.now),[R,J]=z(Ee,e.now),Y=s.pick,B=s.hours[Y??s.last??-1],vt=p=>{let g=Math.abs(p-Y);return Math.min(g,24-g)},wt=p=>Y==null?"":vt(p)===0?" on":vt(p)===1?" near":" far",an=s.hours.find(p=>p.current)?.k??Math.floor(je(e.now)/60),sn=s.pin??Y??an,ye=null;if(B&&!B.ahead){let p=Math.min(B.from+30,B.to-1),g=I(t.temp,p,p)[0]?.[1];g!=null&&p>=r&&(ye=z(C(g),i(p)))}let re=B?s.say(B):null,rn=Math.max(2,s.max??5),on=p=>["confort","eco","poele","boost"].includes(p)?p:"off",ln=(p,g)=>{let _=E=>{p.preventDefault(),p.currentTarget.parentNode?.querySelector(`.hit[data-k="${E}"]`)?.focus()};p.key==="Enter"||p.key===" "?(p.preventDefault(),p.stopPropagation(),s.onPin(s.pin===g?void 0:g)):p.key==="Escape"?s.pin!=null&&(p.stopPropagation(),s.onPin(void 0)):p.key==="ArrowRight"||p.key==="ArrowDown"?_((g+1)%24):(p.key==="ArrowLeft"||p.key==="ArrowUp")&&_((g+23)%24)},cn=p=>{s.tap&&(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),s.tap.run(p))},pn=p=>{s.pin!=null&&(p.stopPropagation(),s.onPin(void 0))};return l`<div class=${"wheel"+(Y!=null?" picking":"")}><svg viewBox="0 0 ${jn} ${zn}" role="group" aria-label=${s.label}
   @pointerleave=${()=>s.onHover(void 0)}>
  <defs><radialGradient id="hcArea" cx=${W} cy=${F} r=${Nt+Je} gradientUnits="userSpaceOnUse">
   <stop class="gs0" offset=".52"></stop><stop class="gs1" offset="1"></stop></radialGradient></defs>
  <path class="lit" d=${B?Ft(be+2,Qe+Me+18,B.k*60+1,B.k*60+59):""}></path>
  ${s.hours.map(p=>{let g=p.k*60+3,_=p.k*60+57;return k`<g class=${"cell"+wt(p.k)}><path class="t-none" d=${Wt(Ee,g,_)}></path>${s.segments.filter(E=>E.a>g&&E.de<_).map(E=>k`<path class=${"t-"+on(E.ton)} d=${Wt(Ee,Math.max(g,E.de),Math.min(_,E.a))}></path>`)}</g>`})}
  ${q.map(p=>k`<circle class="grid" cx=${W} cy=${F} r=${x(C(p))}></circle>`)}
  ${G?k`<path class="area" fill="url(#hcArea)" d=${G}></path>`:u}
  ${S.length?k`<path class="trace" pathLength="1" d=${S.map(P).join("")}></path>`:u}
  ${L?k`<path class="set" d=${L}></path>`:u}
  ${s.hours.map(p=>{let g=s.kind==="flame",_=g?!(p.burn!=null&&p.burn>0&&p.level!=null):p.heat==null||p.heat<.02,E=p.ahead?"yday":_?"none":s.kind,X=g?Math.max(0,((p.level??1)-1)/(rn-1)):Math.min(1,(p.heat??0)*1.4),Q=_?0:g?(Bt+(1-Bt)*Math.max(0,Math.min(1,X)))*Me:(p.heat??0)*Me;return k`<g class=${"spk "+E+wt(p.k)} style=${`--len:${x(Q)}px;--p:${Math.round(X*100)}%`}
    transform=${`translate(${W} ${F}) rotate(${x((p.k*60+30)/4-90)})`}><line x1=${Qe} y1="0" x2=${Qe+Me+20} y2="0"
    style=${`animation-delay:${p.k*22}ms`}></line></g>`})}
  ${pe.map(p=>k`<text class=${p.set?"gt set":"gt"} x=${x(p.x)} y=${x(p.y)}>${Vt(p.t)}</text>`)}
  <line class="hand" x1=${x(se)} y1=${x(v)} x2=${x(R)} y2=${x(J)}></line>
  ${K?k`<circle class="now" cx=${x(ft)} cy=${x(_e)} r="4.5"></circle>`:u}
  <circle class=${"tdot"+(ye&&Y!=null?" on":"")} cx=${x(ye?.[0]??W)} cy=${x(ye?.[1]??F)} r="5.5"></circle>
  ${s.marks.map(p=>{let[g,_]=z(Ee,p.at);return k`<circle class=${"mark "+p.cls} cx=${x(g)} cy=${x(_)} r="5.5"></circle>`})}
  <circle class="ping" cx=${x(R)} cy=${x(J)} r="4"></circle><circle class="knob" cx=${x(R)} cy=${x(J)} r="7"></circle>
  <circle class="disc" cx=${W} cy=${F} r=${be} role=${s.tap?"button":u} tabindex=${s.tap?0:u}
   aria-label=${s.tap?.label??u} @keydown=${cn} @click=${pn}></circle>
  <text class="hl" x=${W} y=${F-Pe}>0 h</text><text class="hl" x=${W+Pe} y=${F}>6 h</text>
  <text class="hl" x=${W} y=${F+Pe}>12 h</text><text class="hl" x=${W-Pe} y=${F}>18 h</text>
  ${s.hours.map(p=>{let g=s.say(p);return k`<path class="hit" data-k=${p.k} role="button" tabindex=${p.k===sn?0:-1} aria-pressed=${s.pin===p.k?"true":"false"}
    aria-label=${`${g.range} : ${g.value}, ${g.lines.filter(Boolean).join(", ")}`} d=${Ft(be,Rn,p.k*60,p.k*60+60)}
    @pointerenter=${()=>s.onHover(p.k)} @focus=${()=>s.onHover(p.k)} @blur=${()=>s.onHover(void 0)}
    @click=${_=>{_.stopPropagation(),s.onPin(s.pin===p.k?void 0:p.k)}} @keydown=${_=>ln(_,p.k)}></path>`})}
 </svg><div class="mid"><div class="rest">${a}</div>
  <div class="pick">${re?l`<div class="ph">${re.range}</div><div class=${"pv"+(re.word?" word":"")}>${re.value}</div>
   <div class="pl">${re.lines[0]}</div><div class="pl dim">${re.lines[1]}</div>`:u}</div></div></div>`}var M=(s,a,e,t,n)=>`M${s+n} ${a}h${e-2*n}a${n} ${n} 0 0 1 ${n} ${n}v${t-2*n}a${n} ${n} 0 0 1 ${-n} ${n}h${-(e-2*n)}a${n} ${n} 0 0 1 ${-n} ${-n}v${-(t-2*n)}a${n} ${n} 0 0 1 ${n} ${-n}z`,st=(s,a,e)=>`M${s-e} ${a}a${e} ${e} 0 1 0 ${2*e} 0a${e} ${e} 0 1 0 ${-2*e} 0`,It=(s,a,e="")=>s.map((t,n)=>k`<path class=${`wave rise r${n} ${e}`} d=${`M${t} ${a}c-3-3 3-5 0-8c-3-3 3-5 0-8`}></path>`);function On(s){return k`${[0,1,2,3,4,5].map(a=>k`<path class="metal" d=${M(6+a*8.8,18,7,24,3)}></path>`)}
  <path class="foot" d=${M(4,39,56,3,1.5)+M(9,42,4,5,1)+M(51,42,4,5,1)}></path>
  <path class=${"led"+(s?" on":"")} d=${st(57.5,23,1.8)}></path>${s?It([17,32,47],16):u}`}function Un(s){return k`<path class="pipe" d="M8 44H14V40M50 40V44H58M12 21.5H7"></path>
  ${[0,1,2,3,4].map(a=>k`<path class="metal" d=${M(13+a*8,17,6.5,26,3.25)}></path>`)}
  <path class="foot" d=${M(12,20,42,3,1.5)+M(12,37,42,3,1.5)}></path><path class="valve" d=${M(1,16,7,11,3)}></path>
  <path class=${"led"+(s?" on":"")} d=${M(2.5,18,4,1.6,.8)+M(2.5,21,4,1.6,.8)}></path>${s?It([22,33,44],16):u}`}function Nn(s){return k`<path class="metal" d=${M(6,10,52,20,6)}></path><path class="foot" d=${M(6,23,52,7,3)}></path>
  <path class="slot" d=${M(12,25,40,2.5,1.25)}></path><path class=${"led"+(s?" on "+s:"")} d=${st(50,16,1.8)}></path>
  ${s?[18,32,46].map((a,e)=>k`<path class=${`wave blow r${e} ${s}`} d=${`M${a} 33c3 3-3 5 0 8c3 3-3 5 0 8`}></path>`):u}`}var Wn="M50 140C15 140 4 110 10 86C16 62 34 52 38 28C40 16 46 6 50 0C56 18 72 30 80 52C88 72 96 92 90 112C84 130 70 140 50 140Z",Fn="M50 140C28 140 20 118 24 100C28 84 40 76 44 58C50 70 62 80 68 96C74 112 72 140 50 140Z",Bn="M50 140C38 140 34 128 36 118C38 108 46 102 48 92C54 102 62 110 62 122C62 134 58 140 50 140Z";function rt(s,a,e){let t=s>0?.035+.1*Math.min(1,s/Math.max(1,a)):0,n=`translate(${(32-50*t).toFixed(2)} ${(37-140*t).toFixed(2)}) scale(${t.toFixed(3)})`;return k`<defs><linearGradient id="hcFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e9733f"></stop>
  <stop offset=".6" stop-color="#f1a066"></stop><stop offset="1" stop-color="#f4ca84" stop-opacity=".75"></stop></linearGradient></defs>
  <path class="s-pipe" d=${M(37,2,6,10,1)}></path><path class="s-body" d=${M(15,13,34,32,4)}></path>
  <path class="s-top" d=${M(13,10,38,5,2)}></path><path class="s-glass" d=${M(20,18,24,21,3)}></path>
  <path class=${"s-bed"+(e?" on":"")} d=${M(23,35,18,3,1.5)}></path>
  ${t?k`<g transform=${n}><path class="flick" fill="url(#hcFlame)" d=${Wn}></path><path class="flick2 s-f2" d=${Fn}></path>
   <path class="flick s-f3" d=${Bn}></path></g>`:u}
  <path class="s-pipe" d=${M(18,45,5,5,1)+M(41,45,5,5,1)}></path><path class=${"s-led"+(e?" on":"")} d=${st(45,12.5,1.6)}></path>`}function Gt(s,a){let e=a==="chauffe";return s==="vanne"?Un(e):s==="clim"||s==="pac"?Nn(e?"heat":a==="rafraichit"?"cool":null):On(e)}function it(s,a,e){return l`<svg class="art" viewBox="0 0 64 52" aria-hidden="true">${s}</svg><div class="ct">${a}</div>${e?l`<div class="cs">${e}</div>`:u}`}var Kt=s=>s.pilote?.mode==="flamme"||s.pilote?.mode==="entier"&&!s.pilote.flamme_manuelle,Yt=["maison","poele","piece","planning"],Xt=["thermostat","page","none"],f=(s,a=1)=>s.toLocaleString("fr-FR",{maximumFractionDigits:a}).replace("-","\u2212"),O=s=>s==null?"\u2014":`${f(s)} \xB0C`,ot=s=>s==null?"\u2014":s>=500?`${f(s/1e3)} kW`:`${f(s,0)} W`,H=s=>s>=100?`${f(s,0)} \u20AC`:`${s.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})} \u20AC`,lt=s=>s&&s[0].toUpperCase()+s.slice(1),ce=s=>s.getMinutes()?`${s.getHours()} h ${String(s.getMinutes()).padStart(2,"0")}`:`${s.getHours()} h`,ut=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],Vn=["di","lu","ma","me","je","ve","sa"],Zt=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"];function ct(s){let a=new Date(s),e=new Date,t=new Date(e);return t.setDate(t.getDate()+1),a.toDateString()===e.toDateString()?ce(a):a.toDateString()===t.toDateString()?`demain ${ce(a)}`:`${ut[a.getDay()]} ${ce(a)}`}var ht=s=>+s.slice(11,13)*60+ +s.slice(14,16),gt=s=>{let a=ht(s);return a%60?`${Math.floor(a/60)} h ${String(a%60).padStart(2,"0")}`:`${a/60} h`},In=(s,a)=>!a||s.slice(0,10)===a?gt(s):`demain ${gt(s)}`,Re=s=>{let[a,e,t]=s.split("-").map(Number);return new Date(a,e-1,t)},Jt={eteint:"\xE9teint",allumage:"allumage",chauffe:"chauffe",nettoyage:"nettoyage",extinction:"extinction",alarme:"alarme",inconnu:"inconnu"},Le={poele:"po\xEAle en chauffe",confort:"confort",eco:"\xE9co",hors_gel:"hors gel",boost:"boost",arret:"arr\xEAt"},Gn={poele:"En chauffe",confort:"Confort",eco:"\xC9co",hors_gel:"Hors gel",boost:"Boost",arret:"Arr\xEAt"},Qt={radiateur:"Radiateur \xE9lectrique",vanne:"Radiateur \xE0 eau",clim:"Climatisation",pac:"Pompe \xE0 chaleur",poele:"Po\xEAle",autre:"Chauffage"},Te={frost:"Hors gel",eco:"\xC9co",comfort:"Confort",boost:"Boost",away:"Absent",sleep:"Nuit",home:"Pr\xE9sent",activity:"Activit\xE9"},en={frost:"off",eco:"cold",comfort:"heat",boost:"act",away:"off",sleep:"cold",home:"heat",activity:"act"},tn=Object.keys(Te),nn=s=>{let a=tn.indexOf(s);return a<0?tn.length:a},pt=1e4,Kn=5e3,Yn=4.176,Xn=6e5,Zn=k`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,Jn=k`<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>`,dt=k`<svg class="wv" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M8 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2M12 14c-1.6-1.6 1.6-2.6 0-4.2s1.6-2.6 0-4.2"></path></svg>`,Qn=k`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0"></path></svg>`,ea=k`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4l6 6M17 7l-6 6M5 21l4.5-1.5 4-4-3-3-4 4z"></path></svg>`,ta=k`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`,na=k`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7v10M8 7v10M12 7v10M16 7v10M20 7v10M2 19h20M2 5h20"></path></svg>`,mt=class extends N{constructor(){super();this._config={type:"custom:hestia-heating-card",card:"maison"};this._dayAt=0;this._dayFor="";this._histAt=0;this._histFor="";this._drawers={},this._tabs={}}static{this.styles=[ue(Ht),ue(Dt)]}static{this.properties={_view:{state:!0},_day:{state:!0},_hist:{state:!0},_error:{state:!0},_pending:{state:!0},_refused:{state:!0},_drawers:{state:!0},_tabs:{state:!0},_confirm:{state:!0},_busy:{state:!0},_hover:{state:!0},_pin:{state:!0}}}static getStubConfig(){return{card:"maison"}}static getConfigElement(){return document.createElement("hestia-heating-card-editor")}setConfig(e){let t=e.card??"maison";if(!Yt.includes(t))throw new Error(`card: ${t} ? (${Yt.join(", ")})`);if(e.tap_action!=null&&!Xt.includes(e.tap_action))throw new Error(`tap_action: ${e.tap_action} ? (${Xt.join(", ")})`);this._config={...e,card:t}}getCardSize(){let e=this._config.card,t=!!this._config.compacte;return e==="piece"&&this._config.court?2:e==="piece"?t?6:11:e==="poele"?t?7:13:e==="planning"?6:5}getGridOptions(){return this._config.card==="planning"?{columns:"full",rows:"auto"}:{columns:12,rows:"auto",min_columns:6}}set hass(e){let t=this._hass?.connection!==e.connection;this._hass=e,this.setAttribute("theme",e.themes?.darkMode===!1?"light":"dark"),(t||!this._stop)&&this._follow()}connectedCallback(){super.connectedCallback(),this._follow()}disconnectedCallback(){super.disconnectedCallback(),this._unfollow()}_unfollow(){this._stop?.(),this._stop=void 0,window.clearTimeout(this._again)}_follow(){this._unfollow(),!(!this._hass||!this.isConnected)&&(this._stop=Ut(this._hass.connection,e=>{this._view=e,this._error=void 0,this._maybeDay()},e=>{this._stop=void 0,this._error=e.message??"Hestia Chauffage ne r\xE9pond pas.",this._again=window.setTimeout(()=>this._follow(),3e4)},()=>{this._stop=void 0,this._again=window.setTimeout(()=>this._follow(),2e3)}))}_maybeDay(){let e=this._config,t=this._view,n=e.card==="piece"&&!e.court&&t?this._roomOf(t):void 0,r=e.card==="poele"?"poele":n?`piece/${n.id}`:"";!r||!this._hass||(r!==this._dayFor&&(this._day=void 0,this._hover=this._pin=void 0),r!==this._histFor&&(this._hist=void 0),(r!==this._dayFor||Date.now()-this._dayAt>=12e4)&&(this._dayFor=r,this._dayAt=Date.now(),this._hass.callWS({type:"hestia_heating/day",cible:r,heures:24}).then(i=>{this._day=i}).catch(()=>{})),(r!==this._histFor||Date.now()-this._histAt>=Xn)&&(this._histFor=r,this._histAt=Date.now(),this._hass.callWS({type:"hestia_heating/historique",cible:r}).then(i=>{this._hist=i}).catch(()=>{})))}_open(e){history.pushState(null,"","/hestia/chauffage"+(e?"/"+e:"")),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0}))}_info(e,t){return l`<button class="nw-info" aria-label=${t} @click=${()=>this._open(e)}></button>`}_chip(e){return l`<span class=${"nw-chip "+e.ton}>${e.texte}</span>`}_more(e){this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){let e=this._view;if(this._error)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">${this._error}</p></ha-card>`;if(!e||!e.pret)return l`<ha-card><div class="head"><h2 class="nw-title">Chauffage</h2></div><p class="empty">Lecture des thermostats…</p></ha-card>`;let t=this._config.card;if(t==="piece"){let n=this._roomOf(e),r=n&&this._tapAction(n),i=n&&!this._config.court;return l`<ha-card class=${(r?"tap ":"")+(i?"clock":"")} @click=${r?c=>this._tap(c,n):u}>${this._room(e)}</ha-card>`}return t==="poele"?l`<ha-card class=${e.poele?"clock":""}>${this._stove(e)}</ha-card>`:l`<ha-card>${t==="planning"?this._planning(e):this._house(e)}</ha-card>`}_head(e,t,n,r,i){return l`<div class="chead"><div class="ttl"><h2 class="nw-title">${e}</h2>${t?l`<div class="sub">${t}</div>`:u}</div>
   <div class="pills">${n}</div>
   <button class="gear" aria-label=${i} title="Réglages" @click=${()=>this._open(r)}>${Zn}</button></div>`}_drawer(e,t,n,r,i,c=""){let o=this._drawers[e]??r;return l`<div class=${"dbox "+c} @click=${d=>d.stopPropagation()}>
   <button class="drawer" aria-expanded=${o?"true":"false"} @click=${()=>{this._drawers={...this._drawers,[e]:!o}}}>
    <span class="dt">${t}${n?l`<span class="ds">${n}</span>`:u}</span>${Jn}</button>
   ${o?l`<div class="dbody">${i()}</div>`:u}</div>`}_tabbar(e,t,n){let r=this._tab(e,t);return l`<div class="tabs" role="tablist" aria-label=${n}>${t.map(([i,c])=>l`<button class="tab" role="tab"
   aria-selected=${i===r?"true":"false"} @click=${()=>{this._tabs={...this._tabs,[e]:i}}}>${c}</button>`)}</div>`}_tab(e,t){let n=this._tabs[e];return t.some(r=>r[0]===n)?n:t[0][0]}async _press(e,t,n=!1){if(n&&this._confirm!==e){this._confirm=e,window.setTimeout(()=>{this._confirm===e&&(this._confirm=void 0)},Kn);return}this._confirm=void 0,this._busy=e,this._refused=void 0;try{await t()}catch(r){this._refused=`Ce n\u2019est pas pass\xE9 : ${r.message??"pas de r\xE9ponse"}.`}finally{this._busy=void 0}}_service(e){let[t,n]=e.service.split(".");return this._hass.callService(t,n,{...e.donnees??{},entity_id:e.entity_id})}_toSettings(){return l`<button class="link" @click=${()=>this._open("reglages")}>Ouvrir les réglages</button>`}_roomOf(e){return e.pieces.find(t=>t.id===this._config.piece)??e.pieces[0]}_tapAction(e){let t=this._config.tap_action??"thermostat";return t==="thermostat"&&!e.principal?"page":t==="none"?"":t}_tap(e,t){if(e.composedPath().some(r=>r instanceof HTMLElement&&r!==e.currentTarget&&(r.tagName==="BUTTON"||r.tagName==="A")))return;let n=this._tapAction(t);n==="thermostat"?this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:t.principal},bubbles:!0,composed:!0})):n==="page"&&this._open("pieces/"+t.id)}_key(e,t){(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),this._tap(e,t))}_modes(e){let t=[...e.modes??[]].filter(o=>o!=="none").sort((o,d)=>nn(o)-nn(d));if(!t.length||!e.principal)return u;let n=this._pending,r=n&&n.id===e.principal&&Date.now()-n.at<pt&&e.preset!==n.mode?n.mode:null,i=r??e.preset,c=!!e.recopie;return l`<div class="modes" role="group" aria-label="Mode du thermostat" style=${`--n:${Math.min(t.length,4)}`} @click=${o=>o.stopPropagation()}>
   ${t.map(o=>l`<button type="button" class=${"mode "+(en[o]??"heat")+(o===i?" on":"")} aria-pressed=${o===i} ?disabled=${c}
     title=${c?"Thermostat recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":""} @click=${()=>this._setMode(e,o)}>${Te[o]??o}</button>`)}</div>
   ${c?l`<p class="note">Thermostat recopié d’une autre maison : les modes se choisissent là-bas.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}async _setMode(e,t){if(!(!this._hass||!e.principal||e.recopie||t===e.preset)){this._pending={id:e.principal,mode:t,at:Date.now()},this._refused=void 0,window.setTimeout(()=>{this._pending?.at&&Date.now()-this._pending.at>=pt&&(this._pending=void 0)},pt+50);try{await this._hass.callService("climate","set_preset_mode",{entity_id:e.principal,preset_mode:t})}catch(n){this._pending=void 0,this._refused=`Le thermostat n\u2019a pas pris \xAB ${Te[t]??t} \xBB : ${n.message??"pas de r\xE9ponse"}.`}}}_house(e){let t=e.maison,n=e.dehors,r=e.planning.prochains,i=new Date,c=e.granules,o=l`${t.temperature!=null?l`La maison est à <b>${O(t.temperature)}</b>. `:u}${n?.nuit_min!=null?l`Cette nuit <b>${O(n.nuit_min)}</b> dehors. `:u}${r.length?l`Ensuite : ${r.slice(0,2).map(d=>`${d.texte} ${ct(d.a)}`).join(", ")}.`:u}`;return l`<div class="head"><h2 class="nw-title">${this._config.name||"Chauffage"}</h2>${this._info("","Ouvrir l\u2019onglet Chauffage")}</div>
   <div class=${"band "+t.etat}><div class="kicker">Maintenant <i>${ce(i)}</i></div><div class="title">${t.titre}</div><div class="line">${o}</div></div>
   <div class="rooms">${e.pieces.map(d=>l`<button class="room" @click=${()=>this._open("pieces/"+d.id)}><span class="n">${d.nom}</span>
    ${d.etat==="chauffe"&&!d.poele&&d.demande_pct!=null&&!d.fenetre?l`<span class="demand" role="img" aria-label=${`Demande ${d.demande_pct} %`}><i style=${`width:${d.demande_pct}%`}></i></span>`:this._chip(d.badge)}
    <span class="t">${d.temperature!=null?f(d.temperature):"\u2014"}${d.consigne!=null?l` <small>/ ${f(d.consigne)}</small>`:u}</span></button>`)}</div>
   <div class="nw-stats"><div><span>En chauffe</span><b>${t.en_chauffe} sur ${t.pieces}</b></div><div><span>Électrique</span><b>${ot(t.electrique_w)}</b></div>
    ${c?.jours!=null?l`<div><span>Granulés</span><b>${c.jours} jours</b></div>`:n?.demain_max!=null?l`<div><span>Demain après-midi</span><b>${O(n.demain_max)}</b></div>`:l`<div><span>Pièces</span><b>${t.pieces}</b></div>`}</div>`}_window(e){let t=this._day,n=e.planning.maintenant_min;return{d:t,series:t?.series??{},span:{start:t?.debut_min??n,length:t?.fenetre_min??1440,now:n}}}_picker(){return{pick:this._pin??this._hover,pin:this._pin,last:this._last,onHover:e=>{e!=null&&(this._last=e),this._hover=e},onPin:e=>{e!=null&&(this._last=e),this._pin=e}}}_range(e){let t=n=>`${n%24} h`;return e.current?`${t(e.k)} \u2013 maintenant`:e.ahead?`${t(e.k)} \u2013 ${t(e.k+1)} \xB7 \xE0 venir`:`${e.yesterday?"hier, ":""}${t(e.k)} \u2013 ${t(e.k+1)}`}_ahead(e,t){return{range:this._range(e),value:e.ton?Gn[e.ton]??lt(e.ton):"Rien de pr\xE9vu",word:!0,lines:[`hier : ${e.temp!=null?`${f(e.temp)}\xB0`:"\u2014"}`,t??""]}}_past(e,t){let n=t.filter(r=>!!r);return{range:this._range(e),value:e.temp!=null?`${f(e.temp)}\xB0`:"\u2014",lines:[n[0]??"",n[1]??""]}}_plan(e){return e.ton?`${Le[e.ton]??e.ton} au planning`:null}_next(e,t){let n=In(e.a,t.planning.jour);return`${e.texte} ${n.startsWith("demain")?n:"\xE0 "+n}`}_soon(e){return e&&Date.parse(e.a)-Date.now()<864e5?e:null}_tile(e,t,n=""){return l`<div class="tile"><b class="v">${e}${n?l`<small class="u">${n}</small>`:u}</b><span class="k">${t}</span></div>`}_bars(e,t,n){let r=Math.max(0,...e.map(c=>c.valeur??0)),i=e.length-1;return l`<div class="bars" role="img" aria-label=${n} style=${`--n:${e.length}`}>
   <div class="cols">${e.map((c,o)=>l`<span class=${o===i?"today":""} style=${`height:${r&&c.valeur?Math.max(4,Math.round(c.valeur/r*72)):0}px`}></span>`)}</div>
   ${e.length<=7?l`<div class="vals">${e.map((c,o)=>l`<span class=${o===i?"today":""}>${c.valeur!=null?t(c.valeur):"\u2014"}</span>`)}</div>`:u}
   <div class="days">${e.map((c,o)=>l`<span>${o===i?"auj.":Vn[Re(c.jour).getDay()]}</span>`)}</div></div>`}_dayList(e,t){return e.map(n=>`${ut[Re(n.jour).getDay()]} ${n.valeur!=null?t(n.valeur):"\u2014"}`).join(", ")}_stove(e){let t=e.poele;if(!t)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Po\xEAle"}</h2></div><p class="empty">Aucun poêle trouvé.</p>`;let n=e.pieces.find(v=>v.poele),{d:r,series:i,span:c}=this._window(e),o=Kt(t),d=t.flamme_max||5,h=t.en_feu?t.flamme??0:0,m=e.planning.lignes.find(v=>v.id==="poele"),$=m?.segments??[],w=[...new Set($.map(v=>v.ton))],A=i.flamme??[],C=this._lastStart(A,c.length),S=this._soon(n?.prochain),P=t.en_feu&&S&&(S.ton==="hors_gel"||S.ton==="arret")?S:null,G=[...C!=null?[{at:c.start+C,cls:"lit"}]:[],...P?[{at:ht(P.a),cls:"stop"}]:[]],L=n?.temperature??null,j=n?n.nom:"la pi\xE8ce",y=t.etat==="alarme"?"alarme":t.en_feu&&h?`flamme ${h} sur ${d}`:Jt[t.etat]??t.etat,T=t.etat==="alarme"?"en alarme":t.en_feu?t.consigne!=null?`consigne ${f(t.consigne)}\xB0`:`flamme ${h}`:t.etat==="eteint"?"po\xEAle \xE9teint":Jt[t.etat]??"",D=I(A,0,c.length),q=I(i.consigne??[],0,c.length),b=new Map;q.forEach(([,v],R)=>{v!=null&&(D[R][1]??0)>0&&b.set(v,(b.get(v)??0)+1)});let U=q.map(([v,R],J)=>[v,R!=null&&((D[J][1]??0)>0||(b.get(R)??0)>=3)?R:null]),xe=r?.energie?.unite==="kg"?r.energie.heures:[],$e=t.conso?.prix_kg??null,pe={temp:i.temperature??[],heat:A.map(([v,R])=>[v,R==null?null:R/d]),level:A,sets:U,energy:xe},K=nt(c,$,pe),_e=at({span:c,segments:$,series:pe,hours:K,kind:"flame",max:d,marks:G,say:v=>{let R=v.burn==null||v.burn<.05;if(v.ahead)return this._ahead(v,v.burn==null?null:R?"po\xEAle \xE9teint":`flamme ${f(v.level??0,0)}`);let J=v.energy!=null?`${f(v.energy,2)} kg${$e!=null?` \xB7 ${H(v.energy*$e)}`:""}`:null;if(R)return this._past(v,["po\xEAle \xE9teint",this._plan(v)]);let Y=Math.round((v.burn??0)*(v.to-v.from)/5)*5;return this._past(v,[`flamme ${f(v.level??0,0)}${(v.burn??0)<.95?` \xB7 ${Y} min`:` sur ${d}`}`,J,v.set!=null?`consigne ${f(v.set)}\xB0`:null,this._plan(v)])},...this._picker(),label:`Horloge du jour : ${j} \xE0 ${O(L)}, po\xEAle ${y}${P?`, arr\xEAt pr\xE9vu \xE0 ${gt(P.a)}`:""}.`},it(rt(h,d,t.en_feu),L!=null?`${f(L)}\xB0`:"\u2014",T)),se=this._why(t,n,o,h);return this._config.compacte?l`<div class="top compact">
   ${this._head(this._config.name||t.nom,t.phrase?l`<span class=${"say "+t.phrase.ton}>${t.phrase.texte}</span>`:`Po\xEAle \xE0 granul\xE9s${t.modele?` \xB7 ${t.modele}`:""}`,l`
    <span class=${"pill "+(t.etat==="alarme"?"alert":t.en_feu?"stove":"off")}>${y}</span>`,"poele","R\xE9glages du po\xEAle")}
   <div class="pair">${_e}<div class="side">${se?l`<p class="why">${se}</p>`:u}
    <span class=${"pill "+(o?"calm":"off")}><i class="dot"></i>${o?"Flamme auto":"Flamme \xE0 la main"}</span></div></div>
   ${this._stoveButtons(t,o)}
  </div>
  ${this._fireDrawer(e,t,n)}
  ${this._pelletDrawer(e,t)}`:l`<div class="top">
   ${this._head(this._config.name||t.nom,t.phrase?l`<span class=${"say "+t.phrase.ton}>${t.phrase.texte}</span>`:`Po\xEAle \xE0 granul\xE9s${t.modele?` \xB7 ${t.modele}`:""}`,l`
    <span class=${"pill "+(o?"calm":"off")}><i class="dot"></i>${o?"Flamme auto":"Flamme \xE0 la main"}</span>
    <span class=${"pill "+(t.etat==="alarme"?"alert":t.en_feu?"stove":"off")}>${y}</span>`,"poele","R\xE9glages du po\xEAle")}
   ${_e}
   <div class="legend">${w.map(v=>l`<span><i class=${"sw t-"+v}></i>${Le[v]??v}</span>`)}
    ${(i.temperature??[]).length?l`<span><i class="sw line"></i>${j.toLowerCase()}</span>`:u}
    ${U.some(v=>v[1]!=null)?l`<span><i class="sw set"></i>consigne</span>`:u}
    ${K.some(v=>!v.ahead&&(v.heat??0)>=.02)?l`<span><i class="sw ramp flame"></i>flamme</span>`:u}
    ${K.some(v=>v.ahead&&(v.heat??0)>=.02)?l`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:u}
    ${C!=null?l`<span><i class="sw ring lit"></i>allumage</span>`:u}${P?l`<span><i class="sw ring stop"></i>arrêt prévu</span>`:u}</div>
   ${r?l`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:u}
   ${se?l`<p class="why">${se}</p>`:u}
   ${this._stoveButtons(t,o)}
  </div>
  ${this._fireDrawer(e,t,n)}
  ${this._pelletDrawer(e,t)}`}_lastStart(e,t){let n=Math.max(0,t-ze),r=null,i=!1;for(let[c,o]of I(e,n,t)){let d=(o??0)>0;d&&!i&&(r=c),i=d}return r===n?null:r}_why(e,t,n,r){if(e.etat==="alarme")return e.phrase?"":`Le po\xEAle est en alarme${e.alarme_texte?` : ${e.alarme_texte}`:""}.`;if(n&&e.pilote?.texte)return e.pilote.texte;let i=e.depuis?` depuis ${ce(new Date(e.depuis))}`:"",c=e.en_feu&&r?`Flamme ${r}.${t&&t.temperature!=null?` ${t.nom} : ${O(t.temperature)}${e.consigne!=null?`, consigne ${O(e.consigne)}`:""}.`:""}`:`${{eteint:"Po\xEAle \xE9teint",allumage:"Le po\xEAle s\u2019allume",chauffe:"En chauffe",nettoyage:"Le po\xEAle se nettoie",extinction:"Le po\xEAle s\u2019\xE9teint"}[e.etat]??"Le po\xEAle ne dit pas son \xE9tat"}${i}.`;return(e.pilote&&!n?"Flamme \xE0 la main : Hestia ne la change pas. ":"")+c}_stoveButtons(e,t){let n=e.allume??(e.en_feu||e.etat==="allumage"),r=e.boutons?.[n?"eteindre":"allumer"],i=!!e.copie,c=e.conso?.brasier,o=this._confirm,d=i?"Po\xEAle recopi\xE9 d\u2019une autre maison : rien ne lui est envoy\xE9.":"";return l`<div class="btns" @click=${h=>h.stopPropagation()}>
   ${r?l`<button class=${"btn"+(o==="power"?" ask":"")} ?disabled=${i||this._busy==="power"} title=${d}
     @click=${()=>this._press("power",()=>this._service(r),!0)}>${Qn}${o==="power"?n?"Vraiment \xE9teindre ?":"Vraiment allumer ?":n?"\xC9teindre":"Allumer"}</button>`:u}
   <button class=${"btn auto"+(t?" on":"")} aria-pressed=${t?"true":"false"} ?disabled=${i||this._busy==="auto"} title=${d}
     @click=${()=>this._press("auto",()=>this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!t}))}><span class="switch"><i></i></span>Flamme auto</button>
   ${c?l`<button class=${"btn pot"+(c.a_nettoyer?" due":c.bientot?" soon":"")+(o==="clean"?" ask":"")} ?disabled=${this._busy==="clean"}
     style=${`--fill:${this._potFill(c)}%`} aria-label=${`${this._potWord(c)}. J\u2019ai nettoy\xE9 le brasier`} title=${c.texte}
     @click=${()=>this._press("clean",()=>this._hass.callWS({type:"hestia_heating/brasier_nettoye"}),!0)}>${ea}<span class="pot-say"><b>${this._potWord(c)}</b>
     <small>${o==="clean"?"Remettre \xE0 z\xE9ro ?":"J\u2019ai nettoy\xE9"}</small></span></button>`:u}
  </div>
  ${i?l`<p class="note">Poêle recopié d’une autre maison : ses boutons sont grisés, rien ne lui est envoyé.</p>`:this._refused?l`<p class="note bad">${this._refused}</p>`:u}`}_potFill(e){return e.a_nettoyer?100:e.kg!=null&&e.seuil_kg?Math.max(0,Math.min(100,Math.round(e.kg/e.seuil_kg*100))):0}_potWord(e){if(e.a_nettoyer)return"Brasier \xE0 nettoyer";if(e.kg==null)return"Brasier pas encore compt\xE9";let t=e.jours==null?"":e.jours<1?" \xB7 moins d\u2019un jour":e.jours<1.5?" \xB7 encore 1 jour":` \xB7 encore ${f(e.jours,0)} jours`;return`Brasier ${this._potFill(e)} %${t}`}_fireDrawer(e,t,n){let r=t.conso,i=t.en_feu&&r?.debit_kg_h?r.debit_kg_h:null,c=i&&r?.cout_heure!=null?`${H(r.cout_heure)} de l\u2019heure`:null,o=[t.fumees!=null?`fum\xE9es ${f(t.fumees,0)} \xB0C`:null,i?`${f(i,2)} kg/h`:t.en_feu?null:"\xE0 l\u2019arr\xEAt",c].filter(Boolean).join(" \xB7 ");return this._drawer("feu","Le feu et les r\xE9glages",o,!this._config.compacte,()=>{let d=!!t.copie,h=t.flamme_basse,m=t.prise_switch,$=this._soon(n?.prochain),w=[h?l`<button class=${"chip"+(h.on?" on stove":"")} aria-pressed=${h.on?"true":"false"} ?disabled=${d||this._busy==="low"} title=${h.nom}
      @click=${()=>this._press("low",()=>this._hass.callService(h.entity_id.split(".")[0],h.on?"turn_off":"turn_on",{entity_id:h.entity_id}))}><i class="dot"></i>Flamme réduite</button>`:null,m?l`<button class=${"chip"+(m.on?" on calm":"")} ?disabled=${d} title="Ouvrir la prise"
      @click=${()=>this._more(m.entity_id)}><i class="dot"></i>${m.on?"Prise allum\xE9e":m.on===!1?"Prise coup\xE9e":"Prise"}</button>`:null].filter(Boolean),A=[$?l`<div class="row">${ta}<span><b>Planning.</b> ${n?.planning?`${lt(n.planning)} maintenant, puis `:"Ensuite : "}${this._next($,e)}.</span></div>`:null,n?.appoint!=null?l`<div class="row cold">${na}<span><b>Radiateur d’appoint.</b> Réglé à ${O(n.appoint)} : il prend le relais si le poêle ne suffit pas.</span></div>`:null].filter(Boolean);return l`<div class="tiles">${this._tile(n?.temperature!=null?f(n.temperature):"\u2014",`${n?n.nom.toLowerCase():"pi\xE8ce"}, \xB0C`,t.consigne!=null?`\u2192 ${f(t.consigne)}`:"")}
     ${this._tile(t.fumees!=null?f(t.fumees,0):"\u2014","fum\xE9es","\xB0C")}${this._tile(i?f(i,2):"\u2014",c??"granul\xE9s","kg/h")}</div>
    ${this._controls(t)}
    ${w.length?l`<div class="chips">${w}</div>`:u}${A.length?l`<div class="rows boxed">${A}</div>`:u}`},"fire")}_controls(e){let t=!!e.copie,n=e.entites??{},r=Kt(e),i=!!this._busy,c=e.flamme_min??1,o=e.flamme_max||5,d=e.flamme_reglee,h=y=>this._hass.callWS({type:"hestia_heating/set_settings",reglages:y}),m=y=>this._press("flame",async()=>{r&&await this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!1}),await this._hass.callService("number","set_value",{entity_id:n.flamme,value:y})}),$=e.ventilation_niveaux??[],w=e.ventilation_choix??"auto",A=e.ventilation,C=()=>this._press("fan",async()=>{if(await h({pilote_ventilation:"auto"}),A&&A.toLowerCase()!=="auto"){let y=this._hass.states?.[n.ventilation]?.attributes.fan_modes;await this._hass.callService("climate","set_fan_mode",{entity_id:n.ventilation,fan_mode:(y??[]).find(T=>String(T).toLowerCase()==="auto")??"AUTO"})}}),S=y=>this._press("fan",async()=>{w!=="manuel"&&await h({pilote_ventilation:"manuel"}),await this._hass.callService("climate","set_fan_mode",{entity_id:n.ventilation,fan_mode:y})}),P=e.eco_stop,G=e.eco_stop_delai??5,L=P?`Le po\xEAle s\u2019\xE9teint seul si sa sonde reste ${f(G,0)} min au-dessus de ${e.consigne_poele!=null?`${f(e.consigne_poele)} \xB0C`:"sa consigne"}${e.air!=null?` (elle lit ${f(e.air)} \xB0C)`:""}, m\xEAme sans Home Assistant.`:"Le po\xEAle ne s\u2019\xE9teint jamais seul : il descend \xE0 la flamme 1 et continue de br\xFBler.",j=(y,T,D,q=!1)=>l`<button class=${"seg"+(y?" on":"")} aria-pressed=${y?"true":"false"} ?disabled=${t||i||q} @click=${D}>${T}</button>`;return l`<div class="ctl" @click=${y=>y.stopPropagation()}>
   ${n.flamme?l`<div class="ctl-row"><b>Flamme</b><span class="segs">${j(r,"Auto",()=>void this._press("auto",()=>this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!0})),!!e.copie)}${j(!r,"Manuel",()=>void this._press("auto",()=>this._hass.callWS({type:"hestia_heating/gestion_auto",actif:!1})))}</span>
    <span class="steps">${Array.from({length:o-c+1},(y,T)=>T+c).map(y=>l`<button class=${"step"+(d===y?" on":"")} aria-label=${`Puissance ${y}`} ?disabled=${t||i} @click=${()=>void m(y)}>${y}</button>`)}</span></div>`:u}
   ${n.ventilation&&$.length?l`<div class="ctl-row"><b>Ventilation</b><span class="segs">${j(w==="auto","Par le po\xEAle",()=>void C())}${j(w==="flamme","Par Hestia",()=>void this._press("fan",()=>h({pilote_ventilation:"flamme"})))}${j(w==="manuel","Manuel",()=>void this._press("fan",()=>h({pilote_ventilation:"manuel"})))}</span>
    <span class="steps">${$.map(y=>l`<button class=${"step"+(A===y?" on":"")} aria-label=${`Vitesse ${y}`} ?disabled=${t||i} @click=${()=>void S(y)}>${y}</button>`)}</span></div>`:u}
   ${n.eco_stop&&P!=null?l`<div class="ctl-row"><b>ÉCO Stop</b><span class="segs">${j(P,"Activ\xE9",()=>void this._press("eco",async()=>{await this._hass.callService("switch","turn_on",{entity_id:n.eco_stop}),await h({poele_eco_stop:!0})}))}${j(!P,"Coup\xE9",()=>void this._press("eco",async()=>{await this._hass.callService("switch","turn_off",{entity_id:n.eco_stop}),await h({poele_eco_stop:!1})}))}</span>
    <p class="ctl-say">${L}</p></div>`:u}
  </div>`}_pelletDrawer(e,t){let n=e.granules,r=t.conso,i=r?.brasier,c=this._hist?.unite==="kg"?this._hist:void 0,o=n?.jours!=null?this._dayIn(n.jours):null,d=i?.kg!=null&&i.seuil_kg?Math.round(i.kg/i.seuil_kg*100):null,h=[o?`jusqu\u2019au ${o}`:null,r?.cout_jour!=null?`${H(r.cout_jour)} aujourd\u2019hui`:r?`${f(r.kg_jour,1)} kg aujourd\u2019hui`:null,i?.a_nettoyer?"brasier \xE0 nettoyer":i?.jours!=null?`brasier dans ${i.jours<1?"moins d\u2019un jour":i.jours<1.5?"1 jour":`${f(i.jours,0)} jours`}`:d!=null?`brasier ${d} %`:i?"brasier pas encore compt\xE9":null].filter(Boolean).join(" \xB7 "),m=[["granules","Granul\xE9s"],["argent","Argent"],["entretien","Entretien"]];return this._drawer("granules","Granul\xE9s \xB7 Argent \xB7 Entretien",h,!1,()=>{let $=this._tab("poele",m);return l`${this._tabbar("poele",m,"D\xE9tails du po\xEAle")}<div role="tabpanel" class="panel">${$==="granules"?this._pellets(n,r,c,o):$==="argent"?this._stoveMoney(e,r,c):this._upkeep(t)}</div>`},"pellets")}_dayIn(e){let t=new Date;return t.setDate(t.getDate()+e),`${t.getDate()===1?"1er":t.getDate()} ${Zt[t.getMonth()]}`}_sacks(e){let t=Math.floor(e+.05),n=e-t>.05;return t?`${t} sac${t>1?"s":""}${n?" et un entam\xE9":""}`:n?"un sac entam\xE9":"plus aucun sac"}_sackArt(e){let t=Math.floor(e+.05),n=e-t>.05?e-t:0,r=Math.min(12,t+(n?1:0)),i="M7 2h12l-1.5 4c3 2 4.5 5.5 4.5 10v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-4c0-4.5 1.5-8 4.5-10z";return l`<svg class="sacks" viewBox="0 0 150 90" role="img" aria-label=${this._sacks(e)}><defs><linearGradient id="hcSack" x1="0" y1="1" x2="0" y2="0">
   <stop offset="0" class="full"></stop><stop offset=${n.toFixed(2)} class="full"></stop><stop offset=${n.toFixed(2)} class="empty"></stop><stop offset="1" class="empty"></stop></linearGradient></defs>
   ${Array.from({length:r},(c,o)=>k`<path class=${"sack"+(n&&t<12&&o===r-1?" part":"")} fill=${n&&t<12&&o===r-1?"url(#hcSack)":u} transform=${`translate(${o%6*24+(o>=6?12:0)} ${o<6?58:30})`} d=${i}></path>`)}</svg>`}_pellets(e,t,n,r){let i=n?.stat?n.jours:[],c=i.reduce((o,d)=>d.valeur!=null&&(o==null||d.valeur>(o.valeur??0))?d:o,null);return l`${e?.stock_sacs!=null?l`<div class="stock"><div><div class="nw-label">${r?"Il en reste jusqu\u2019au":"Il en reste"}</div>
     <div class="big">${r??this._sacks(e.stock_sacs)}</div>
     <div class="small">${[r?lt(this._sacks(e.stock_sacs)):null,e.kg_par_jour!=null?`au rythme de la saison : ${f(e.kg_par_jour)} kg par jour`:null].filter(Boolean).join(", ")}</div></div>
     ${this._sackArt(e.stock_sacs)}</div>`:l`<p class="note left">Le stock se lit avec l’intégration Suivi Stock Pellet : sans elle, Hestia compte seulement ce qui brûle.</p>
     ${t?l`<div class="tiles">${this._tile(f(t.kg_jour,1),"aujourd\u2019hui","kg")}${this._tile(f(t.kg_saison,0),"cette saison","kg")}${this._tile(t.debit_kg_h?f(t.debit_kg_h,2):"\u2014","en ce moment","kg/h")}</div>`:u}`}
   ${c?l`<div class="bhead"><span>Les 14 derniers jours</span><span>le plus : ${ut[Re(c.jour).getDay()]}, ${f(c.valeur,1)} kg</span></div>
    ${this._bars(i,o=>f(o,1),`Granul\xE9s br\xFBl\xE9s par jour : ${this._dayList(i,o=>`${f(o,1)} kg`)}`)}`:u}`}_stoveMoney(e,t,n){let r=[["jour","Aujourd\u2019hui"],["semaine","7 jours"],["saison","Saison"]],i=this._tab("periode",r),c=n?.stat?n.jours.slice(-7).reduce((S,P)=>S+(P.valeur??0),0):null,o=i==="jour"?t?.kg_jour??null:i==="semaine"?c:t?.kg_saison??null,d=t?.prix_kg??null,h=e.prix_kwh??null,m=l`<div class="tabs" role="group" aria-label="Période">${r.map(([S,P])=>l`<button class="tab" aria-pressed=${S===i?"true":"false"}
   @click=${()=>{this._tabs={...this._tabs,periode:S}}}>${P}</button>`)}</div>`;if(d==null||h==null)return l`${m}<p class="note left">${d==null?"Le prix des granul\xE9s manque : donnez le prix et le poids d\u2019un sac dans les r\xE9glages. ":""}${h==null?"Le prix du kWh manque, pour comparer \xE0 l\u2019\xE9lectricit\xE9.":""}</p>${this._toSettings()}`;if(o==null)return l`${m}<p class="note">Pas encore de compte pour cette période.</p>`;let $=o*d,w=o*Yn*h,A=Math.max($,w)||1,C=w-$;return l`${m}<div class="versus">
    <span>Le poêle</span><span class="vb"><i class="pellet" style=${`width:${$/A*100}%`}></i></span><b>${H($)}</b>
    <span>À l’électricité</span><span class="vb"><i class="elec" style=${`width:${w/A*100}%`}></i></span><b>${H(w)}</b></div>
   <div class="saved"><b class=${C>=0?"good":"bad"}>${H(Math.abs(C))} ${C>=0?"gagn\xE9s":"de plus"}</b>
    <span>${i==="jour"?"aujourd\u2019hui, pour la m\xEAme chaleur":i==="semaine"?"sur les 7 derniers jours":"depuis le d\xE9but de la saison"}</span></div>
   <p class="note left">${f(o,o>=100?0:1)} kg de granulés à ${f(d,3)} € le kg, face à la même chaleur à l’électricité, à ${f(h,4)} € le kWh.</p>`}_upkeep(e){let t=e.conso?.brasier,n=2*Math.PI*26,r=t?.kg!=null&&t.seuil_kg?Math.min(1,t.kg/t.seuil_kg):0,i=t?.a_nettoyer?"alert":t?.bientot?"act":"stove",c=t?.kg!=null?f(t.kg,1):"\u2014";return l`${t?l`<div class="pot"><div class="pring"><svg viewBox="0 0 64 64" role="img" aria-label=${`Brasier : ${c} kg br\xFBl\xE9s sur ${f(t.seuil_kg,0)}`}>
     <circle class="bg" cx="32" cy="32" r="26"></circle><circle class=${"fg "+i} cx="32" cy="32" r="26" style=${`stroke-dasharray:${(n*r).toFixed(1)} ${n.toFixed(1)}`}></circle></svg>
     <span>${c}</span></div><div class="pt"><b>Brasier</b><span>${t.texte}</span></div></div>`:u}
   <div class="rows">
    <div class="row"><b>Alarme</b><span>${e.alarme?`${e.alarme_texte??"Le po\xEAle signale une alarme"}.`:"Aucune en ce moment."}</span></div>
    ${e.prise_w!=null?l`<div class="row"><b>Prise</b><span>${ot(e.prise_w)} en ce moment.</span></div>`:u}
   </div>`}_room(e){let t=this._roomOf(e);if(!t)return l`<div class="head"><h2 class="nw-title">${this._config.name||"Pi\xE8ce"}</h2></div><p class="empty">Aucun thermostat trouvé.</p>`;let n=this._config.name||t.nom,r=this._tapAction(t),i=r==="thermostat"?`Ouvrir le thermostat de ${t.nom}`:`Ouvrir la page de ${t.nom}`;if(this._config.court)return l`<div class="short" role=${r?"button":u} tabindex=${r?0:u} aria-label=${r?i:u}
    @keydown=${r?b=>this._key(b,t):u}>
    <div class="temp">${t.temperature!=null?f(t.temperature):"\u2014"}<sup>°C</sup></div><div><b>${n}</b><span class="nw-say">${t.raison??(t.consigne!=null?`Consigne ${O(t.consigne)}`:"")}</span></div>${this._chip(t.badge)}</div>`;let{d:c,series:o,span:d}=this._window(e),h=e.planning.lignes.find(b=>b.id===t.id),m=h?.segments??[],$=[...new Set(m.map(b=>b.ton))],w=!t.poele&&(o.demande??[]).some(b=>(b[1]??0)>0),A=o.consigne?.length?o.consigne:t.consigne!=null?[[0,t.consigne]]:[],C=this._soon(t.prochain),S=t.type==="poele"?e.poele:null,P=S?rt(S.en_feu?S.flamme??0:0,S.flamme_max||5,S.en_feu):Gt(t.type,t.etat),G=C?this._next(C,e):t.consigne!=null?`consigne ${f(t.consigne)}\xB0`:"",L=c?.energie?.unite==="kWh"?c.energie.heures:[],j=e.prix_kwh??null,y={temp:o.temperature??[],heat:w?(o.demande??[]).map(([b,U])=>[b,U==null?null:U/100]):[],sets:A,energy:L},T=nt(d,m,y),D=b=>{let U=w&&b.heat!=null?`chauffe ${Math.round(b.heat*100)} %`:null;return b.ahead?this._ahead(b,U):this._past(b,[U,b.energy!=null?`${f(b.energy,2)} kWh${j!=null?` \xB7 ${H(b.energy*j)}`:""}`:null,b.set!=null?`consigne ${f(b.set)}\xB0`:null,this._plan(b)])},q=at({span:d,segments:m,series:y,hours:T,kind:"demand",marks:C?[{at:ht(C.a),cls:"next"}]:[],say:D,...this._picker(),tap:r?{label:i,run:b=>this._tap(b,t)}:void 0,label:`Horloge du jour : ${t.nom} \xE0 ${O(t.temperature)}${t.consigne!=null?`, consigne ${O(t.consigne)}`:""}${C?`, ${this._next(C,e)}`:""}.`},it(P,t.temperature!=null?`${f(t.temperature)}\xB0`:"\u2014",G));return this._config.compacte?l`<div class="top compact">
   ${this._head(n,Qt[t.type??""]??"",l`${this._heatPill(t)}`,"pieces/"+t.id,`R\xE9glages de ${t.nom}`)}
   <div class="pair">${q}<div class="side">${t.raison?l`<p class="say">${t.raison}</p>`:u}${this._modePill(t)}</div></div>
   ${this._modes(t)}
  </div>
  ${this._roomDrawer(e,t)}`:l`<div class="top">
   ${this._head(n,Qt[t.type??""]??"",l`${this._heatPill(t)}${this._modePill(t)}`,"pieces/"+t.id,`R\xE9glages de ${t.nom}`)}
   ${q}
   <div class="legend">${$.map(b=>l`<span><i class=${"sw t-"+b}></i>${Le[b]??b}</span>`)}
    ${(o.temperature??[]).length?l`<span><i class="sw line"></i>température</span>`:u}
    ${A.some(b=>b[1]!=null)?l`<span><i class="sw set"></i>consigne</span>`:u}
    ${T.some(b=>!b.ahead&&(b.heat??0)>=.02)?l`<span><i class="sw ramp demand"></i>% de chauffe</span>`:u}
    ${T.some(b=>b.ahead&&(b.heat??0)>=.02)?l`<span><i class="sw yday"></i>hier, aux heures à venir</span>`:u}
    ${C?l`<span><i class="sw ring next"></i>prochain changement</span>`:u}</div>
   ${c?l`<p class="hint">Survolez ou touchez une heure pour ses chiffres</p>`:u}
   ${t.raison?l`<p class="say">${t.raison}</p>`:u}
   ${this._modes(t)}
  </div>
  ${this._roomDrawer(e,t)}`}_heatPill(e){if(e.badge.ton==="alert"||e.badge.ton==="act"||e.etat==="arret"||e.etat==="inconnu")return l`<span class=${"pill "+e.badge.ton} role="status">${e.badge.texte}</span>`;if(e.etat==="chauffe"&&e.poele)return l`<span class="pill stove" role="status"><span class="beat">${dt}</span>${e.badge.texte}</span>`;if(e.etat==="chauffe"||e.etat==="rafraichit"){let t=e.etat==="rafraichit",n=e.demande_pct,r=t?"Rafra\xEEchit":"Chauffe";return l`<span class=${"pill "+(t?"cold":"heat")} role="status" aria-label=${n!=null?`${r}, demande ${n} %`:r}>
    <span class="beat">${dt}</span>${r}${n!=null?l` ${n} %<span class="gauge"><i style=${`width:${Math.min(100,n)}%`}></i></span>`:u}</span>`}return l`<span class="pill off" role="status">${dt}Ne chauffe pas</span>`}_modePill(e){let t=e.preset&&e.preset!=="none"?e.preset:null,n=t?Te[t]??t:e.planning;return n?l`<span class=${"pill "+(t?en[t]??"heat":"calm")}><i class="dot"></i>${n.toLowerCase()}${e.planning?" \xB7 planning":""}</span>`:u}_roomDrawer(e,t){let n=this._hist?.unite==="kWh"?this._hist:void 0,r=e.prix_kwh??null,i=n?.stat?n.jours.at(-1)?.valeur??null:null,c=this._heatToday(t),o=[i!=null&&r!=null?`${H(i*r)} aujourd\u2019hui`:null,i!=null?`${f(i)} kWh`:c?`${c.time} de chauffe`:null,t.humidite!=null?`humidit\xE9 ${f(t.humidite,0)} %`:null].filter(Boolean).join(" \xB7 "),d=[["argent","Argent"],["conso","Conso"],["confort","Confort"]];return this._drawer("piece","Argent \xB7 Conso \xB7 Confort",o,!1,()=>{let h=this._tab("piece",d);return l`${this._tabbar("piece",d,"D\xE9tails de la pi\xE8ce")}<div role="tabpanel" class="panel">${h==="argent"?this._roomMoney(n,r):h==="conso"?this._roomUse(n,c):this._roomComfort(e,t)}</div>`})}_heatToday(e){let t=this._day;if(!t||e.poele||!t.series.demande?.length||t.fenetre_min==null)return null;let n=t.fenetre_min,r=Math.max(0,n-t.maintenant_min),i=0;for(let[,o]of I(t.series.demande,r,n-5))i+=(o??0)/100*5;let c=Math.round(i);return{time:c>=60?`${Math.floor(c/60)} h ${String(c%60).padStart(2,"0")}`:`${c} min`,duty:Math.round(i/Math.max(5,t.maintenant_min)*100)}}_roomMoney(e,t){if(!e)return l`<p class="note">Les derniers jours ne sont pas encore lus.</p>`;if(!e.stat)return l`<p class="note left">Le thermostat ne donne pas de compteur d’énergie : Hestia ne peut pas compter les kWh de cette pièce.</p>`;if(t==null)return l`<p class="note left">Donnez le prix du kWh dans les réglages pour voir ce que coûte la pièce.</p>${this._toSettings()}`;let n=e.jours.slice(-7),r=n.at(-1)?.valeur;return l`<div class="tiles">${this._tile(r!=null?H(r*t):"\u2014","aujourd\u2019hui")}
    ${this._tile(H(n.reduce((i,c)=>i+(c.valeur??0),0)*t),"7 derniers jours")}
    ${this._tile(e.mois!=null?H(e.mois*t):"\u2014",Zt[Re(e.aujourdhui).getMonth()])}</div>
   ${this._bars(n,i=>f(i*t,2),`Co\xFBt par jour : ${this._dayList(n,i=>H(i*t))}`)}
   <p class="note left">Prix : ${f(t,4)} € le kWh, abonnement à part.</p>`}_roomUse(e,t){let n=e?.stat?e.jours.slice(-7):[],r=n.at(-1)?.valeur??null;return l`<div class="tiles">${this._tile(r!=null?f(r):"\u2014","aujourd\u2019hui","kWh")}${this._tile(t?t.time:"\u2014","de chauffe")}
    ${this._tile(t?`${t.duty} %`:"\u2014","du temps")}</div>
   ${n.some(i=>i.valeur!=null)?this._bars(n,i=>f(i),`kWh par jour : ${this._dayList(n,i=>`${f(i)} kWh`)}`):u}
   <p class="note left">${t?"Le temps de chauffe suit la demande du thermostat : 50 % pendant une heure comptent une demi-heure. ":""}${e?.stat?"Les kWh viennent du compteur d\u2019\xE9nergie du thermostat.":e?"Le thermostat ne donne pas de compteur d\u2019\xE9nergie.":""}</p>`}_roomComfort(e,t){let n=[];return t.humidite!=null&&n.push(["Humidit\xE9",`${f(t.humidite,0)} %, ${t.humidite<40?"un peu sec":t.humidite>60?"humide : a\xE9rez quelques minutes":"bien"}.`]),t.fenetre&&n.push(["Fen\xEAtre",`Ouverte${t.fenetre_depuis?` depuis ${ce(new Date(t.fenetre_depuis))}`:""}.`]),t.pente!=null&&Math.abs(t.pente)>=.05&&n.push(["En ce moment",`La pi\xE8ce ${t.pente>0?"gagne":"perd"} ${f(Math.abs(t.pente))} \xB0C par heure.`]),t.consigne!=null&&n.push(["Consigne",`${O(t.consigne)}${t.planning?`, ${t.planning} au planning`:""}${t.prochain?`, puis ${this._next(t.prochain,e)}`:""}.`]),t.puissance_w&&n.push(["Puissance",`${ot(t.puissance_w)} en ce moment.`]),n.length?l`<div class="rows">${n.map(([r,i])=>l`<div class="row"><b>${r}</b><span>${i}</span></div>`)}</div>`:l`<p class="note">Rien d’autre à dire sur la pièce pour l’instant.</p>`}_planning(e){let t=e.planning,n=t.maintenant_min/14.4,r=t.prochains,i=l`<div class="head"><h2 class="nw-title">${this._config.name||"Planning du jour"}</h2><span class="nw-chip calm">${t.jour_nom}</span>${this._info("planning","Ouvrir la page du planning")}</div>`;if(!t.lignes.length)return l`${i}<p class="empty">Aucun créneau pour l’instant : ils se règlent dans l’onglet Chauffage, page Planning.</p>`;let c=[...new Set(t.lignes.flatMap(o=>o.segments.map(d=>d.ton)))];return l`${i}<div class="lanes"><div class="hours"><span></span><div>${[0,6,12,18,24].map(o=>l`<span style=${`left:${o/24*100}%`}>${o} h</span>`)}</div></div>
   ${t.lignes.map(o=>l`<div class="lane"><span class="n">${o.nom}${o.source?l`<small class=${o.bloque?"bad":""}>${o.source}${o.bloque?" \xB7 deux plannings":""}</small>`:u}</span><div class="track" role="img" aria-label=${o.nom}>${o.segments.map(d=>l`<i class=${"t-"+d.ton} style=${`left:${d.de/14.4}%;width:${(d.a-d.de)/14.4}%`}></i>`)}<span class="now" style=${`left:${n}%`}></span></div></div>`)}</div>
   <div class="nw-legend">${c.map(o=>l`<span><i class=${"sw t-"+o}></i>${Le[o]??o}</span>`)}</div>
   <div class="nw-stats"><div><span>Prochain changement</span><b>${r[0]?`${ct(r[0].a)} \xB7 ${r[0].texte}`:"\u2014"}</b></div>
    <div><span>Ensuite</span><b>${r[1]?`${ct(r[1].a)} \xB7 ${r[1].texte}`:"\u2014"}</b></div><div><span>Réglé par</span><b>${t.source??"\u2014"}</b></div></div>
   ${t.labo||t.essai?l`<p class="note">${t.labo?"Thermostats recopi\xE9s d\u2019une autre maison : les plannings Hestia ne leur envoient rien.":"Un planning Hestia est en pause : il montre ce qu\u2019il ferait, sans rien envoyer."}</p>`:u}`}};customElements.get("hestia-heating-card")||customElements.define("hestia-heating-card",mt);var He=window;He.customCards=He.customCards??[];He.customCards.some(s=>s.type==="hestia-heating-card")||He.customCards.push({type:"hestia-heating-card",name:"Hestia Chauffage",description:"Le chauffage de la maison : qui chauffe, chaque pi\xE8ce, le po\xEAle, le planning.",preview:!0});})();

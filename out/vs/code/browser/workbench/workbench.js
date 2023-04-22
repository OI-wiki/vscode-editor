/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/(function(){var R=["vs/code/browser/workbench/workbench","require","exports","vs/base/browser/browser","vs/base/common/cancellation","vs/base/common/marshalling","vs/base/common/event","vs/base/common/lifecycle","vs/base/common/network","vs/base/common/resources","vs/base/common/uri","vs/base/parts/request/browser/request","vs/platform/product/common/product","vs/platform/window/common/window","vs/workbench/workbench.web.main","vs/base/common/path","vs/base/common/strings"],S=function(g){for(var p=[],l=0,b=g.length;l<b;l++)p[l]=R[g[l]];return p};define(R[0],S([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),function(g,p,l,b,U,A,k,d,y,i,v,w,n,C,h,E){"use strict";Object.defineProperty(p,"__esModule",{value:!0});class u{constructor(){let e;const t=document.getElementById("vscode-workbench-auth-session"),s=t?t.getAttribute("data-settings"):void 0;if(s)try{e=JSON.parse(s)}catch{}e&&(this.setPassword(`${w.default.urlProtocol}.login`,"account",JSON.stringify(e)),this.authService=`${w.default.urlProtocol}-${e.providerId}.login`,this.setPassword(this.authService,"account",JSON.stringify(e.scopes.map(r=>({id:e.id,scopes:r,accessToken:e.accessToken})))))}get credentials(){if(!this._credentials){try{const e=window.localStorage.getItem(u.CREDENTIALS_STORAGE_KEY);e&&(this._credentials=JSON.parse(e))}catch{}Array.isArray(this._credentials)||(this._credentials=[])}return this._credentials}save(){window.localStorage.setItem(u.CREDENTIALS_STORAGE_KEY,JSON.stringify(this.credentials))}async getPassword(e,t){return this.doGetPassword(e,t)}async doGetPassword(e,t){for(const s of this.credentials)if(s.service===e&&(typeof t!="string"||t===s.account))return s.password;return null}async setPassword(e,t,s){this.doDeletePassword(e,t),this.credentials.push({service:e,account:t,password:s}),this.save();try{if(s&&e===this.authService){const r=JSON.parse(s);Array.isArray(r)&&r.length===0&&await this.logout(e)}}catch(r){console.log(r)}}async deletePassword(e,t){const s=await this.doDeletePassword(e,t);if(s&&e===this.authService)try{await this.logout(e)}catch(r){console.log(r)}return s}async doDeletePassword(e,t){let s=!1;return this._credentials=this.credentials.filter(r=>r.service===e&&r.account===t?(s=!0,!1):!0),s&&this.save(),s}async findPassword(e){return this.doGetPassword(e)}async findCredentials(e){return this.credentials.filter(t=>t.service===e).map(({account:t,password:s})=>({account:t,password:s}))}async logout(e){const t=new Map;t.set("logout",String(!0)),t.set("service",e),await(0,v.request)({url:O("/auth/logout",t).toString(!0)},b.CancellationToken.None)}async clear(){window.localStorage.removeItem(u.CREDENTIALS_STORAGE_KEY)}}u.CREDENTIALS_STORAGE_KEY="credentials.provider";class f extends k.Disposable{constructor(e){super();this._callbackRoute=e,this._onCallback=this._register(new A.Emitter),this.onCallback=this._onCallback.event,this.pendingCallbacks=new Set,this.lastTimeChecked=Date.now(),this.checkCallbacksTimeout=void 0}create(e={}){const t=++f.REQUEST_ID,s=[`vscode-reqid=${t}`];for(const r of f.QUERY_KEYS){const c=e[r];c&&s.push(`vscode-${r}=${encodeURIComponent(c)}`)}if(!(e.authority==="vscode.github-authentication"&&e.path==="/dummy")){const r=`vscode-web.url-callbacks[${t}]`;window.localStorage.removeItem(r),this.pendingCallbacks.add(t),this.startListening()}return i.URI.parse(window.location.href).with({path:this._callbackRoute,query:s.join("&")})}startListening(){if(this.onDidChangeLocalStorageDisposable)return;const e=()=>this.onDidChangeLocalStorage();window.addEventListener("storage",e),this.onDidChangeLocalStorageDisposable={dispose:()=>window.removeEventListener("storage",e)}}stopListening(){this.onDidChangeLocalStorageDisposable?.dispose(),this.onDidChangeLocalStorageDisposable=void 0}async onDidChangeLocalStorage(){const e=Date.now()-this.lastTimeChecked;e>1e3?this.checkCallbacks():this.checkCallbacksTimeout===void 0&&(this.checkCallbacksTimeout=setTimeout(()=>{this.checkCallbacksTimeout=void 0,this.checkCallbacks()},1e3-e))}checkCallbacks(){let e;for(const t of this.pendingCallbacks){const s=`vscode-web.url-callbacks[${t}]`,r=window.localStorage.getItem(s);if(r!==null){try{this._onCallback.fire(i.URI.revive(JSON.parse(r)))}catch(c){console.error(c)}e=e??new Set(this.pendingCallbacks),e.delete(t),window.localStorage.removeItem(s)}}e&&(this.pendingCallbacks=e,this.pendingCallbacks.size===0&&this.stopListening()),this.lastTimeChecked=Date.now()}}f.REQUEST_ID=0,f.QUERY_KEYS=["scheme","authority","path","query","fragment"];class o{constructor(e,t,s){this.workspace=e,this.payload=t,this.config=s,this.trusted=!0}static create(e){let t=!1,s,r=Object.create(null);return new URL(document.location.href).searchParams.forEach((a,T)=>{switch(T){case o.QUERY_PARAM_FOLDER:e.remoteAuthority&&a.startsWith(h.posix.sep)?s={folderUri:i.URI.from({scheme:d.Schemas.vscodeRemote,path:a,authority:e.remoteAuthority})}:s={folderUri:i.URI.parse(a)},t=!0;break;case o.QUERY_PARAM_WORKSPACE:e.remoteAuthority&&a.startsWith(h.posix.sep)?s={workspaceUri:i.URI.from({scheme:d.Schemas.vscodeRemote,path:a,authority:e.remoteAuthority})}:s={workspaceUri:i.URI.parse(a)},t=!0;break;case o.QUERY_PARAM_EMPTY_WINDOW:s=void 0,t=!0;break;case o.QUERY_PARAM_PAYLOAD:try{r=(0,U.parse)(a)}catch(I){console.error(I)}break}}),t||(e.folderUri?s={folderUri:i.URI.revive(e.folderUri)}:e.workspaceUri&&(s={workspaceUri:i.URI.revive(e.workspaceUri)})),new o(s,r,e)}async open(e,t){if(t?.reuse&&!t.payload&&this.isSame(this.workspace,e))return!0;const s=this.createTargetUrl(e,t);if(s){if(t?.reuse)return window.location.href=s,!0;{let r;return(0,l.isStandalone)()?r=window.open(s,"_blank","toolbar=no"):r=window.open(s),!!r}}return!1}createTargetUrl(e,t){let s;if(!e)s=`${document.location.origin}${document.location.pathname}?${o.QUERY_PARAM_EMPTY_WINDOW}=true`;else if((0,n.isFolderToOpen)(e)){let r;this.config.remoteAuthority&&e.folderUri.scheme===d.Schemas.vscodeRemote?r=`${h.posix.sep}${(0,E.ltrim)(e.folderUri.path,h.posix.sep)}`:r=encodeURIComponent(e.folderUri.toString(!0)),s=`${document.location.origin}${document.location.pathname}?${o.QUERY_PARAM_FOLDER}=${r}`}else if((0,n.isWorkspaceToOpen)(e)){let r;this.config.remoteAuthority&&e.workspaceUri.scheme===d.Schemas.vscodeRemote?r=`${h.posix.sep}${(0,E.ltrim)(e.workspaceUri.path,h.posix.sep)}`:r=encodeURIComponent(e.workspaceUri.toString(!0)),s=`${document.location.origin}${document.location.pathname}?${o.QUERY_PARAM_WORKSPACE}=${r}`}return t?.payload&&(s+=`&${o.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(t.payload))}`),s}isSame(e,t){return!e||!t?e===t:(0,n.isFolderToOpen)(e)&&(0,n.isFolderToOpen)(t)?(0,y.isEqual)(e.folderUri,t.folderUri):(0,n.isWorkspaceToOpen)(e)&&(0,n.isWorkspaceToOpen)(t)?(0,y.isEqual)(e.workspaceUri,t.workspaceUri):!1}hasRemote(){if(this.workspace){if((0,n.isFolderToOpen)(this.workspace))return this.workspace.folderUri.scheme===d.Schemas.vscodeRemote;if((0,n.isWorkspaceToOpen)(this.workspace))return this.workspace.workspaceUri.scheme===d.Schemas.vscodeRemote}return!0}}o.QUERY_PARAM_EMPTY_WINDOW="ew",o.QUERY_PARAM_FOLDER="folder",o.QUERY_PARAM_WORKSPACE="workspace",o.QUERY_PARAM_PAYLOAD="payload";function O(m,e){let t;if(e){let s=0;e.forEach((r,c)=>{t||(t=""),t+=`${s++==0?"":"&"}${c}=${encodeURIComponent(r)}`})}return i.URI.parse(window.location.href).with({path:m,query:t})}(function(){const m=document.getElementById("vscode-workbench-web-configuration"),e=m?m.getAttribute("data-settings"):void 0;if(!m||!e)throw new Error("Missing web configuration element");const t=JSON.parse(e);(0,C.create)(document.body,{...t,settingsSyncOptions:t.settingsSyncOptions?{enabled:t.settingsSyncOptions.enabled}:void 0,workspaceProvider:o.create(t),urlCallbackProvider:new f(t.callbackRoute),credentialsProvider:t.remoteAuthority?void 0:new u})})()})}).call(this);

//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/3b889b090b5ad5793f524b5d1d39fda662b96a2a/core/vs/code/browser/workbench/workbench.js.map

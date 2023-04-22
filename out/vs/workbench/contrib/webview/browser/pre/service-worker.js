const sw=self,VERSION=4,resourceCacheName=`vscode-resource-cache-${VERSION}`,rootPath=sw.location.pathname.replace(/\/service-worker.js$/,""),searchParams=new URL(location.toString()).searchParams,remoteAuthority=searchParams.get("remoteAuthority"),resourceBaseAuthority=searchParams.get("vscode-resource-base-authority"),resolveTimeout=3e4;class RequestStore{constructor(){this.map=new Map,this.requestPool=0}get(e){const o=this.map.get(e);return o&&o.promise}create(){const e=++this.requestPool;let o;const s=new Promise(a=>o=a),r={resolve:o,promise:s};this.map.set(e,r);const c=setTimeout(()=>{if(clearTimeout(c),this.map.get(e)===r)return this.map.delete(e)},resolveTimeout);return{requestId:e,promise:s}}resolve(e,o){const s=this.map.get(e);return s?(s.resolve(o),this.map.delete(e),!0):!1}}const resourceRequestStore=new RequestStore,localhostRequestStore=new RequestStore,unauthorized=()=>new Response("Unauthorized",{status:401}),notFound=()=>new Response("Not Found",{status:404}),methodNotAllowed=()=>new Response("Method Not Allowed",{status:405});sw.addEventListener("message",async t=>{switch(t.data.channel){case"version":{const e=t.source;sw.clients.get(e.id).then(o=>{o&&o.postMessage({channel:"version",version:VERSION})});return}case"did-load-resource":{const e=t.data.data;resourceRequestStore.resolve(e.id,e)||console.log("Could not resolve unknown resource",e.path);return}case"did-load-localhost":{const e=t.data.data;localhostRequestStore.resolve(e.id,e.location)||console.log("Could not resolve unknown localhost",e.origin);return}default:console.log("Unknown message");return}}),sw.addEventListener("fetch",t=>{const e=new URL(t.request.url);if(e.protocol==="https:"&&e.hostname.endsWith("."+resourceBaseAuthority))switch(t.request.method){case"GET":case"HEAD":{const o=e.hostname.slice(0,e.hostname.length-(resourceBaseAuthority.length+1)),s=o.split("+",1)[0],r=o.slice(s.length+1);return t.respondWith(processResourceRequest(t,{scheme:s,authority:r,path:e.pathname,query:e.search.replace(/^\?/,"")}))}default:return t.respondWith(methodNotAllowed())}if(e.origin!==sw.origin&&e.host===remoteAuthority)switch(t.request.method){case"GET":case"HEAD":return t.respondWith(processResourceRequest(t,{path:e.pathname,scheme:e.protocol.slice(0,e.protocol.length-1),authority:e.host,query:e.search.replace(/^\?/,"")}));default:return t.respondWith(methodNotAllowed())}if(e.origin!==sw.origin&&e.host.match(/^(localhost|127.0.0.1|0.0.0.0):(\d+)$/))return t.respondWith(processLocalhostRequest(t,e))}),sw.addEventListener("install",t=>{t.waitUntil(sw.skipWaiting())}),sw.addEventListener("activate",t=>{t.waitUntil(sw.clients.claim())});async function processResourceRequest(t,e){const o=await sw.clients.get(t.clientId);if(!o)return console.error("Could not find inner client for request"),notFound();const s=getWebviewIdForClient(o);if(!s)return console.error("Could not resolve webview id"),notFound();const r=t.request.method==="GET",l=(n,d)=>{if(n.status===304){if(d)return d.clone();throw new Error("No cache found")}if(n.status===401)return unauthorized();if(n.status!==200)return notFound();const u={"Content-Type":n.mime,"Content-Length":n.data.byteLength.toString(),"Access-Control-Allow-Origin":"*"};n.etag&&(u.ETag=n.etag,u["Cache-Control"]="no-cache"),n.mtime&&(u["Last-Modified"]=new Date(n.mtime).toUTCString());const p=new Response(n.data,{status:200,headers:u});return r&&n.etag&&caches.open(resourceCacheName).then(g=>g.put(t.request,p)),p.clone()},c=await getOuterIframeClient(s);if(!c.length)return console.log("Could not find parent client for request"),notFound();let a;r&&(a=await(await caches.open(resourceCacheName)).match(t.request));const{requestId:h,promise:i}=resourceRequestStore.create();for(const n of c)n.postMessage({channel:"load-resource",id:h,scheme:e.scheme,authority:e.authority,path:e.path,query:e.query,ifNoneMatch:a?.headers.get("ETag")});return i.then(n=>l(n,a))}async function processLocalhostRequest(t,e){const o=await sw.clients.get(t.clientId);if(!o)return fetch(t.request);const s=getWebviewIdForClient(o);if(!s)return console.error("Could not resolve webview id"),fetch(t.request);const r=e.origin,l=async i=>{if(!i)return fetch(t.request);const n=t.request.url.replace(new RegExp(`^${e.origin}(/|$)`),`${i}$1`);return new Response(null,{status:302,headers:{Location:n}})},c=await getOuterIframeClient(s);if(!c.length)return console.log("Could not find parent client for request"),notFound();const{requestId:a,promise:h}=localhostRequestStore.create();for(const i of c)i.postMessage({channel:"load-localhost",origin:r,id:a});return h.then(l)}function getWebviewIdForClient(t){return new URL(t.url).searchParams.get("id")}async function getOuterIframeClient(t){return(await sw.clients.matchAll({includeUncontrolled:!0})).filter(o=>{const s=new URL(o.url);return(s.pathname===`${rootPath}/`||s.pathname===`${rootPath}/index.html`||s.pathname===`${rootPath}/index-no-csp.html`)&&s.searchParams.get("id")===t})}

//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/3b889b090b5ad5793f524b5d1d39fda662b96a2a/core/vs/workbench/contrib/webview/browser/pre/service-worker.js.map

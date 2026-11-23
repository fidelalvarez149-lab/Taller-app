const V="diazcell-v4",FILES=["./","index.html","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-192.png","icon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:"reload"})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Con internet: siempre intenta la versión nueva. Sin internet o muy lento: usa la copia guardada.
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith((async()=>{
    const cache=await caches.open(V);
    const net=fetch(r,same?{cache:"no-cache"}:undefined).then(res=>{if(res&&(res.ok||res.type==="opaque"))cache.put(r,res.clone());return res});
    const hit=(await cache.match(r))||(r.mode==="navigate"?await cache.match("index.html"):undefined);
    if(!hit)return net.catch(()=>Response.error());
    return Promise.race([net.catch(()=>hit),new Promise(ok=>setTimeout(()=>ok(hit),same?3500:1500))]);
  })());
});

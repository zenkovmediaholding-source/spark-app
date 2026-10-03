const CACHE='spark-shell-v20';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.webmanifest'))){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return r;}).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request)));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const matchId=e.notification.data?.match_id;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){
      if('focus' in client){
        if(matchId) client.postMessage({type:'spark-open-chat',match_id:matchId});
        return client.focus();
      }
    }
    return clients.openWindow('./').then(client=>{
      if(matchId && client?.postMessage) setTimeout(()=>client.postMessage({type:'spark-open-chat',match_id:matchId}),250);
    });
  }));
});

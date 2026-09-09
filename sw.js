// Service Worker — BergWolf Craft Beer ERP
// Criado do zero (não é cópia do sw.js da Rota 8, que não foi fornecido).
// Estratégia simples: cache-first para os arquivos do app, com atualização
// em segundo plano sempre que uma nova versão for publicada.

const CACHE_NOME = 'bergwolf-erp-v2';
const ARQUIVOS_CACHE = [
  './index.html',
  './erp.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NOME).then(function (cache) {
      return cache.addAll(ARQUIVOS_CACHE);
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (nomes) {
      return Promise.all(
        nomes
          .filter(function (nome) { return nome !== CACHE_NOME; })
          .map(function (nome) { return caches.delete(nome); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  // Só intercepta pedidos do próprio site (não Firebase, CDNs externos, etc.)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (respostaCache) {
      const buscaRede = fetch(event.request).then(function (respostaRede) {
        if (respostaRede && respostaRede.status === 200) {
          caches.open(CACHE_NOME).then(function (cache) {
            cache.put(event.request, respostaRede.clone());
          });
        }
        return respostaRede;
      }).catch(function () {
        return respostaCache; // sem internet: usa o que já está em cache
      });

      // Mostra o cache na hora (rápido), atualiza em segundo plano
      return respostaCache || buscaRede;
    })
  );
});

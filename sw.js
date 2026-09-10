// Service Worker — BergWolf Craft Beer ERP
// 09/09/2026: desativado o cache por completo. O cache estava causando
// confusão real durante os testes (versões antigas persistindo mesmo após
// reenviar os arquivos). Esta versão se auto-remove e limpa qualquer
// cache antigo, deixando o site sempre buscar a versão mais recente
// direto do servidor, sem intermediário.

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (nomes) {
            return Promise.all(nomes.map(function (nome) { return caches.delete(nome); }));
        }).then(function () {
            return self.registration.unregister();
        }).then(function () {
            return self.clients.matchAll();
        }).then(function (clients) {
            clients.forEach(function (client) { client.navigate(client.url); });
        })
    );
});

// Sem 'fetch' handler: tudo passa direto pela rede, sem cache nenhum.

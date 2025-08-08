const SyncSystem = {
    async verificarAtualizacoes() {
        if (typeof CONFIG === 'undefined') {
            console.error('SyncSystem: CONFIG não definido. Sincronização abortada.');
            return false;
        }

        try {
            const url = `${CONFIG.CATALOGO_URL}?t=${new Date().getTime()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro de rede ao buscar catálogo: ${response.statusText}`);
            }

            const dadosServidor = await response.json();
            const versaoLocal = localStorage.getItem('versaoCatalogo');

            if (dadosServidor.versao && dadosServidor.versao !== versaoLocal) {
                console.log(`Nova versão encontrada. Atualizando de ${versaoLocal} para ${dadosServidor.versao}.`);
                
                window.produtos = dadosServidor.produtos;
                localStorage.setItem('estoqueProdutos', JSON.stringify(dadosServidor.produtos));
                localStorage.setItem('versaoCatalogo', dadosServidor.versao);
                localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
                
                window.dispatchEvent(new CustomEvent('produtosAtualizados'));
                console.log('Sincronização e atualização concluídas!');
            }
            return true;
        } catch (error) {
            console.error('Erro durante a sincronização:', error);
            return false;
        }
    },

    iniciarSincronizacaoAutomatica() {
        console.log("Serviço de sincronização automática iniciado.");
        this.verificarAtualizacoes();
        setInterval(() => this.verificarAtualizacoes(), 5 * 60 * 1000);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.verificarAtualizacoes();
            }
        });
    }
};

window.SyncSystem = SyncSystem;
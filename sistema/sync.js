const SyncSystem = {
    /**
     * Verifica se há uma nova versão do catálogo no servidor e atualiza os dados locais.
     */
    async verificarAtualizacoes() {
        if (typeof CONFIG === 'undefined') {
            console.error('SyncSystem: CONFIG não definido. Sincronização abortada.');
            return false;
        }

        try {
            const url = `${CONFIG.CATALOGO_URL}?t=${new Date().getTime()}`;
            // *** CORREÇÃO DEFINITIVA DO CORS ***
            // Fetch simplificado, sem as opções de 'cache' que causavam o bloqueio.
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

    /**
     * Inicia o processo de sincronização automática.
     */
    iniciarSincronizacaoAutomatica() {
        // Esta função é chamada pelo main.js uma única vez.
        console.log("Serviço de sincronização automática iniciado.");
        this.verificarAtualizacoes();

        // Sincroniza a cada 5 minutos.
        setInterval(() => this.verificarAtualizacoes(), 5 * 60 * 1000);

        // Sincroniza quando o usuário volta para a aba.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.verificarAtualizacoes();
            }
        });
    }
};

// Exporta o objeto para ser usado por outros scripts.
window.SyncSystem = SyncSystem;
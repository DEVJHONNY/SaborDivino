const SyncSystem = {
    /**
     * Verifica se há uma nova versão do catálogo no servidor e atualiza os dados locais.
     */
    async verificarAtualizacoes() {
        // Garante que o objeto CONFIG já foi carregado para evitar erros.
        if (typeof CONFIG === 'undefined') {
            console.error('SyncSystem: CONFIG não definido. Sincronização abortada.');
            return false;
        }

        try {
            // Adiciona um parâmetro de tempo para evitar o cache do navegador.
            const url = `${CONFIG.CATALOGO_URL}?t=${new Date().getTime()}`;

            // *** CORREÇÃO DEFINITIVA DO CORS ***
            // A chamada fetch foi feita sem opções extras que causavam o bloqueio.
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Erro de rede ao buscar catálogo: ${response.statusText}`);
            }

            const dadosServidor = await response.json();
            const versaoLocal = localStorage.getItem('versaoCatalogo');

            // Compara a versão do servidor com a local para decidir se atualiza.
            if (dadosServidor.versao && dadosServidor.versao !== versaoLocal) {
                console.log(`Nova versão encontrada. Atualizando de ${versaoLocal} para ${dadosServidor.versao}.`);
                
                // Atualiza os produtos no objeto global e no armazenamento local.
                window.produtos = dadosServidor.produtos;
                localStorage.setItem('estoqueProdutos', JSON.stringify(dadosServidor.produtos));
                localStorage.setItem('versaoCatalogo', dadosServidor.versao);
                localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
                
                // Avisa outras partes da aplicação que os produtos foram atualizados.
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
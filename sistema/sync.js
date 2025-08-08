const SyncSystem = {
    /**
     * Verifica se há uma nova versão do catálogo no servidor e atualiza os dados locais.
     */
    async verificarAtualizacoes() {
        // Verifica se o objeto CONFIG está disponível. Se não, interrompe para evitar erros.
        if (typeof CONFIG === 'undefined') {
            console.error('SyncSystem: Objeto CONFIG não está disponível. A sincronização foi abortada.');
            return false;
        }

        try {
            // Adiciona um parâmetro de tempo para evitar problemas com cache do navegador.
            const url = `${CONFIG.CATALOGO_URL}?t=${new Date().getTime()}`;

            // *** CORREÇÃO CRÍTICA ***
            // A chamada fetch foi simplificada para não enviar cabeçalhos que o servidor não permite.
            const response = await fetch(url);

            if (!response.ok) {
                // Lança um erro se a resposta da rede não for bem-sucedida.
                throw new Error(`Erro de rede ao buscar catálogo: ${response.statusText}`);
            }

            const dadosServidor = await response.json();
            const versaoLocal = localStorage.getItem('versaoCatalogo');

            // Compara a versão do servidor com a versão local para decidir se atualiza.
            if (dadosServidor.versao && dadosServidor.versao !== versaoLocal) {
                console.log(`Nova versão encontrada. Atualizando de ${versaoLocal} para ${dadosServidor.versao}.`);
                
                // Atualiza os produtos no objeto global 'window.produtos'.
                window.produtos = dadosServidor.produtos;
                
                // Salva os novos produtos e a nova versão no armazenamento local.
                localStorage.setItem('estoqueProdutos', JSON.stringify(dadosServidor.produtos));
                localStorage.setItem('versaoCatalogo', dadosServidor.versao);
                localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
                
                // Dispara um evento customizado para que outras partes da aplicação
                // saibam que os produtos foram atualizados (ex: a interface).
                window.dispatchEvent(new CustomEvent('produtosAtualizados'));
                
                console.log('Sincronização e atualização concluídas com sucesso!');
            } else {
                console.log('Nenhuma atualização necessária. Os dados locais já estão na última versão.');
            }

            return true;

        } catch (error) {
            console.error('Erro durante a sincronização:', error);
            // Em caso de falha na rede, o sistema continuará funcionando com os dados locais.
            return false;
        }
    },

    /**
     * Inicia o processo de sincronização automática em intervalos regulares e em eventos chave.
     */
    iniciarSincronizacaoAutomatica() {
        console.log("Iniciando serviço de sincronização automática.");

        // 1. Sincroniza imediatamente ao iniciar.
        this.verificarAtualizacoes();

        // 2. Sincroniza a cada 5 minutos (300.000 milissegundos).
        setInterval(() => {
            console.log("Verificação periódica de sincronização...");
            this.verificarAtualizacoes();
        }, 5 * 60 * 1000);

        // 3. Sincroniza quando o usuário volta para a aba do site.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log("Aba tornou-se visível. Verificando atualizações...");
                this.verificarAtualizacoes();
            }
        });

        // 4. Sincroniza se a conexão com a internet for restabelecida.
        window.addEventListener('online', () => {
            console.log("Conexão online. Verificando atualizações...");
            this.verificarAtualizacoes();
        });
    }
};
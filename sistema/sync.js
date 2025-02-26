const SyncSystem = {
    async verificarAtualizacoes() {
        try {
            if (CONFIG.USAR_CATALOGO_LOCAL) {
                return this.sincronizarCatalogoLocal();
            }

            const response = await fetch(CONFIG.CATALOGO_URL);
            if (!response.ok) {
                console.warn('Falha ao buscar catálogo remoto, usando local...');
                return this.sincronizarCatalogoLocal();
            }
            
            const catalogoRemoto = await response.json();
            
            if (this.precisaAtualizar(catalogoRemoto.versao)) {
                await this.atualizarCatalogo(catalogoRemoto);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return this.sincronizarCatalogoLocal();
        }
    },

    sincronizarCatalogoLocal() {
        const versaoAtual = localStorage.getItem('versaoCatalogo');
        
        if (!versaoAtual || versaoAtual < CONFIG.VERSAO_CATALOGO || CONFIG.FORCAR_SINCRONIZACAO) {
            console.log('Atualizando catálogo local...');
            localStorage.setItem('estoqueProdutos', JSON.stringify(PRODUTOS_PADRAO));
            localStorage.setItem('versaoCatalogo', CONFIG.VERSAO_CATALOGO);
            return true;
        }
        
        return false;
    },

    precisaAtualizar(versaoRemota) {
        const versaoLocal = localStorage.getItem('versaoCatalogo');
        return !versaoLocal || versaoLocal < versaoRemota || CONFIG.SYNC.FORCE_UPDATE;
    },

    async atualizarCatalogo(catalogoRemoto) {
        // Fazer backup antes de atualizar
        await BackupSystem.criarBackup();

        // Atualizar produtos
        localStorage.setItem('estoqueProdutos', JSON.stringify(catalogoRemoto.produtos));
        localStorage.setItem('versaoCatalogo', catalogoRemoto.versao);
        
        // Atualizar produtos em memória
        Object.assign(produtos, catalogoRemoto.produtos);
        
        // Atualizar interface se necessário
        if (typeof InterfaceController !== 'undefined') {
            InterfaceController.atualizarInterfaceEstoque();
        }

        CONFIG.SYNC.LAST_UPDATE = new Date().toISOString();
        
        console.log('Catálogo atualizado com sucesso!');
    },

    iniciarSincronizacaoAutomatica() {
        // Verificar atualizações imediatamente
        this.verificarAtualizacoes();

        // Configurar verificação periódica
        setInterval(() => {
            this.verificarAtualizacoes();
        }, CONFIG.SYNC.CHECK_INTERVAL);
    }
};

// Iniciar sincronização
SyncSystem.iniciarSincronizacaoAutomatica();

// Exportar para uso global
window.SyncSystem = SyncSystem;

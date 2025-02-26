const SyncSystem = {
    async verificarAtualizacoes() {
        try {
            const response = await fetch(CONFIG.CATALOGO_URL);
            if (!response.ok) throw new Error('Falha ao buscar catálogo');
            
            const catalogoRemoto = await response.json();
            
            if (this.precisaAtualizar(catalogoRemoto.versao)) {
                await this.atualizarCatalogo(catalogoRemoto);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return false;
        }
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

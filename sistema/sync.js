const SyncSystem = {
    async verificarAtualizacoes() {
        try {
            // Forçar sincronização a cada verificação
            const response = await fetch(CONFIG.CATALOGO_URL);
            if (!response.ok) {
                throw new Error('Erro ao buscar catálogo');
            }

            const dadosServidor = await response.json();
            
            // Sempre atualizar dados locais com dados do servidor
            localStorage.setItem('estoqueProdutos', JSON.stringify(dadosServidor.produtos));
            localStorage.setItem('historico_tickets', JSON.stringify(dadosServidor.tickets || []));
            localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
            
            // Atualizar objeto produtos global
            Object.assign(window.produtos, dadosServidor.produtos);
            
            console.log('Sincronização concluída:', dadosServidor);
            return true;
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return false;
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

    async atualizarCatalogo(catalogoRemoto, forcarAtualizacao = false) {
        try {
            // Atualizar produtos
            localStorage.setItem('estoqueProdutos', JSON.stringify(catalogoRemoto.produtos));
            localStorage.setItem('versaoCatalogo', catalogoRemoto.versao);
            
            // Atualizar produtos em memória
            Object.assign(produtos, catalogoRemoto.produtos);
            
            // Disparar evento de atualização
            window.dispatchEvent(new CustomEvent('produtosAtualizados', {
                detail: catalogoRemoto.produtos
            }));
            
            CONFIG.SYNC.LAST_UPDATE = new Date().toISOString();
            console.log('Catálogo atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar catálogo:', error);
            throw error;
        }
    },

    async atualizarCatalogoGitHub(produtos) {
        try {
            const novoConteudo = {
                versao: new Date().toISOString().split('T')[0] + '.1',
                produtos: produtos,
                ultima_atualizacao: new Date().toISOString(),
                meta: {
                    moeda: "BRL",
                    formato_preco: "0.00",
                    unidade_estoque: "unidades"
                }
            };

            // Salvar localmente primeiro
            localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));
            localStorage.setItem('versaoCatalogo', novoConteudo.versao);

            // Em produção, aqui você faria uma chamada para sua API
            // que atualizaria o arquivo no GitHub
            console.log('Novo catálogo para GitHub:', novoConteudo);

            return true;
        } catch (error) {
            console.error('Erro ao atualizar catálogo no GitHub:', error);
            return false;
        }
    },

    // Adicionar sincronização automática
    iniciarSincronizacaoAutomatica() {
        // Sincronizar ao carregar
        this.verificarAtualizacoes();

        // Sincronizar a cada 30 segundos
        setInterval(() => {
            this.verificarAtualizacoes();
        }, 30 * 1000);
    }
};

// Iniciar sincronização automática
document.addEventListener('DOMContentLoaded', () => {
    SyncSystem.iniciarSincronizacaoAutomatica();
});

// Exportar para uso global
window.SyncSystem = SyncSystem;

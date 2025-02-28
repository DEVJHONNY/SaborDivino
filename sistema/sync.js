const SyncSystem = {
    async verificarAtualizacoes() {
        try {
            // Forçar busca do GitHub ignorando cache
            const response = await fetch(CONFIG.CATALOGO_URL + '?t=' + new Date().getTime(), {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar catálogo');
            }

            const dadosServidor = await response.json();
            
            // Atualizar dados locais com dados do servidor
            if (dadosServidor.produtos) {
                // Atualizar produtos em memória primeiro
                window.produtos = dadosServidor.produtos;
                
                // Depois atualizar localStorage
                localStorage.setItem('estoqueProdutos', JSON.stringify(dadosServidor.produtos));
                localStorage.setItem('versaoCatalogo', dadosServidor.versao);
                localStorage.setItem('ultima_sincronizacao', new Date().toISOString());
                
                // Atualizar interface se estiver visível
                if (typeof carregarEstoque === 'function') {
                    carregarEstoque();
                }
                
                // Disparar evento de atualização
                window.dispatchEvent(new CustomEvent('produtosAtualizados', {
                    detail: dadosServidor.produtos
                }));
            }
            
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

    // Iniciar sincronização automática mais frequente
    iniciarSincronizacaoAutomatica() {
        // Primeira sincronização imediata
        this.verificarAtualizacoes();

        // Sincronizar a cada 15 segundos
        setInterval(() => {
            this.verificarAtualizacoes();
        }, 15 * 1000);

        // Sincronizar quando a aba voltar a ficar ativa
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.verificarAtualizacoes();
            }
        });

        // Sincronizar quando houver conexão de volta
        window.addEventListener('online', () => {
            this.verificarAtualizacoes();
        });
    }
};

// Garantir que a sincronização comece assim que possível
window.addEventListener('load', () => {
    SyncSystem.iniciarSincronizacaoAutomatica();
});

// Forçar sincronização quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    SyncSystem.verificarAtualizacoes();
});

// Exportar para uso global
window.SyncSystem = SyncSystem;

// Produtos padrão (catálogo oficial)
const PRODUTOS_PADRAO = {
    trufas: [
        { id: 1, nome: 'Trufa de Chocolate', preco: 4.50, estoque: 50 },
        { id: 2, nome: 'Trufa de Morango', preco: 4.50, estoque: 50 },
        { id: 3, nome: 'Trufa de Maracujá', preco: 4.50, estoque: 50 },
        { id: 4, nome: 'Trufa de Ninho', preco: 4.50, estoque: 50 },
        { id: 5, nome: 'Trufa de Prestígio', preco: 4.50, estoque: 50 }
    ],
    mousses: [
        { id: 6, nome: 'Mousse de Chocolate', preco: 8.00, estoque: 20 },
        { id: 7, nome: 'Mousse de Maracujá', preco: 8.00, estoque: 20 }
    ],
    empadas: [
        { id: 8, nome: 'Empada de Frango', preco: 6.00, estoque: 30 },
        { id: 9, nome: 'Empada de Palmito', preco: 6.00, estoque: 30 }
    ]
};

// Sistema de sincronização
const ProdutosManager = {
    async sincronizar() {
        try {
            // Versão do catálogo
            const versaoAtual = localStorage.getItem('versaoCatalogo');
            const versaoServidor = CONFIG.VERSAO_CATALOGO;

            if (!versaoAtual || versaoAtual < versaoServidor) {
                console.log('Atualizando catálogo de produtos...');
                localStorage.setItem('estoqueProdutos', JSON.stringify(PRODUTOS_PADRAO));
                localStorage.setItem('versaoCatalogo', versaoServidor);
                return PRODUTOS_PADRAO;
            }

            const produtosLocais = localStorage.getItem('estoqueProdutos');
            return produtosLocais ? JSON.parse(produtosLocais) : PRODUTOS_PADRAO;
        } catch (error) {
            console.error('Erro ao sincronizar produtos:', error);
            return PRODUTOS_PADRAO;
        }
    },

    async resetarParaPadrao() {
        localStorage.setItem('estoqueProdutos', JSON.stringify(PRODUTOS_PADRAO));
        localStorage.setItem('versaoCatalogo', CONFIG.VERSAO_CATALOGO);
        return PRODUTOS_PADRAO;
    }
};

// Inicialização dos produtos
let produtos = PRODUTOS_PADRAO;

// Sincronizar ao carregar
ProdutosManager.sincronizar().then(produtosSincronizados => {
    produtos = produtosSincronizados;
    console.log('Produtos sincronizados:', produtos);
    
    // Disparar evento de sincronização concluída
    window.dispatchEvent(new CustomEvent('produtosSincronizados'));
});

const EstoqueController = {
    atualizar(id, quantidade) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === id);
            if (produto) {
                produto.estoque = quantidade;
                this.salvarEstoque();
                return true;
            }
        }
        return false;
    },

    salvarEstoque() {
        localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));
    },

    verificarDisponibilidade(id, quantidade) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === id);
            if (produto) {
                return {
                    disponivel: produto.estoque >= quantidade,
                    estoque: produto.estoque,
                    mensagem: produto.estoque < quantidade ? 
                        `Apenas ${produto.estoque} unidades disponíveis` : 
                        'Produto disponível'
                };
            }
        }
        return { disponivel: false, estoque: 0, mensagem: 'Produto não encontrado' };
    }
};

// Exportar para uso global
window.produtos = produtos;
window.ProdutosManager = ProdutosManager;
window.PRODUTOS_PADRAO = PRODUTOS_PADRAO;
window.EstoqueController = EstoqueController;

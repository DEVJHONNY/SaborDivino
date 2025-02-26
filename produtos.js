// Produtos padrão (catálogo oficial)
const PRODUTOS_PADRAO = {
    trufas: [
        { id: 1, nome: 'Trufa de Brigadeiro', preco: 4.50, estoque: 0 },
        { id: 2, nome: 'Trufa de Ninho', preco: 4.50, estoque: 0},
        { id: 3, nome: 'Trufa de Ovomaltine', preco: 4.50, estoque: 0 },
        { id: 4, nome: 'Trufa de Ninho', preco: 4.50, estoque: 0 },
        { id: 5, nome: 'Trufa de Coco', preco: 4.50, estoque: 2 },
        { id: 6, nome: 'Trufa de Amendoim', preco: 4.50, estoque: 4 },
        { id: 7, nome: 'Trufa de Ferreiro', preco: 4.50, estoque: 3 },
        { id: 8, nome: 'Trufa de Castanha', preco: 4.50, estoque: 3 },
        
    ],
    mousses: [
        { id: 6, nome: 'Mousse de Limão', preco: 3.50, estoque: 3 },
        { id: 7, nome: 'Mousse de Maracujá', preco: 3.50, estoque: 3 }
    ],
    empadas: [
        { id: 8, nome: 'Empada de Frango', preco: 4.50, estoque: 0 },
        { id: 9, nome: 'Empada de Calabresa', preco: 4.50, estoque: 0 }
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

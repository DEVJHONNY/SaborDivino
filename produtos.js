const produtos = {
    trufas: [
        { id: 1, nome: "Trufa de Chocolate", preco: 5.00, estoque: 50 },
        { id: 2, nome: "Trufa de Morango", preco: 5.00, estoque: 50 },
        { id: 3, nome: "Trufa de Maracujá", preco: 5.00, estoque: 50 }
    ],
    mousses: [
        { id: 4, nome: "Mousse de Chocolate", preco: 8.00, estoque: 20 },
        { id: 5, nome: "Mousse de Maracujá", preco: 8.00, estoque: 20 },
        { id: 6, nome: "Mousse de Limão", preco: 8.00, estoque: 20 }
    ],
    empadas: [
        { id: 7, nome: "Empada de Frango", preco: 6.00, estoque: 30 },
        { id: 8, nome: "Empada de Palmito", preco: 6.00, estoque: 30 },
        { id: 9, nome: "Empada de Camarão", preco: 7.00, estoque: 20 }
    ]
};

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

window.produtos = produtos;
window.EstoqueController = EstoqueController;

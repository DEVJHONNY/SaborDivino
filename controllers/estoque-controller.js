const EstoqueController = {
    verificarDisponibilidade(produtoId, quantidade) {
        let produtoEncontrado = null;

        // Procurar o produto em todas as categorias
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === produtoId);
            if (produto) {
                produtoEncontrado = produto;
                break;
            }
        }

        if (!produtoEncontrado) {
            return {
                disponivel: false,
                mensagem: 'Produto não encontrado'
            };
        }

        if (produtoEncontrado.estoque < quantidade) {
            return {
                disponivel: false,
                mensagem: `Apenas ${produtoEncontrado.estoque} unidade(s) disponível(is)`
            };
        }

        return {
            disponivel: true,
            mensagem: 'Produto disponível',
            produto: produtoEncontrado
        };
    },

    atualizarEstoque(produtoId, quantidade) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === produtoId);
            if (produto) {
                produto.estoque -= quantidade;
                return true;
            }
        }
        return false;
    },

    reporEstoque(produtoId, quantidade) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === produtoId);
            if (produto) {
                produto.estoque += quantidade;
                return true;
            }
        }
        return false;
    }
};

// Exportar para uso global
window.EstoqueController = EstoqueController;

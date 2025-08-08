const InterfaceController = {

    // Função que é chamada para adicionar um novo bloco de item no pedido.
    adicionarItem() {
        const container = document.getElementById('itensPedido');
        const novoItem = document.createElement('div');
        novoItem.className = 'item-pedido';
        const numItems = container.children.length + 1;

        // Cria a estrutura HTML do novo item.
        novoItem.innerHTML = `
            <div class="form-group">
                <label for="categoria-${numItems}">Categoria:</label>
                <select class="categoria" id="categoria-${numItems}">
                    <option value="">Selecione uma categoria</option>
                    <option value="trufas">Trufas</option>
                    <option value="mousses">Mousses</option>
                    <option value="empadas">Empadas</option>
                </select>
            </div>
            <div class="form-group">
                <label for="produto-${numItems}">Produto:</label>
                <select class="produto" id="produto-${numItems}">
                    <option value="">Selecione um produto</option>
                </select>
            </div>
            <div class="form-group">
                <label for="quantidade-${numItems}">Quantidade:</label>
                <input type="number" class="quantidade" id="quantidade-${numItems}" min="1" value="1">
                <span class="estoque-info"></span>
            </div>
            <button type="button" class="remove-item">🗑️ Remover Item</button>
        `;

        // Adiciona o novo item à página.
        container.appendChild(novoItem);
        // Conecta os eventos para este novo item.
        this.conectarEventos(novoItem);
        // Recalcula o total do pedido.
        this.calcularTotal();
    },
    
    // Conecta os eventos de 'change' e 'click' aos elementos do item.
    conectarEventos(item) {
        const categoriaSelect = item.querySelector('.categoria');
        const produtoSelect = item.querySelector('.produto');
        const quantidadeInput = item.querySelector('.quantidade');
        const btnRemover = item.querySelector('.remove-item');

        // Usar 'addEventListener' garante que 'this' se refere ao objeto correto.
        categoriaSelect.addEventListener('change', () => this.atualizarProdutos(categoriaSelect));
        produtoSelect.addEventListener('change', () => this.atualizarPrecoEstoque(produtoSelect));
        quantidadeInput.addEventListener('input', () => this.validarQuantidade(quantidadeInput));
        btnRemover.addEventListener('click', () => this.removerItem(btnRemover));
    },

    // Remove um item do pedido.
    removerItem(botaoRemover) {
        const containerItens = document.getElementById('itensPedido');
        if (containerItens.children.length > 1) {
            botaoRemover.closest('.item-pedido').remove();
            this.calcularTotal();
        } else {
            alert('É necessário manter pelo menos um item no pedido.');
        }
    },

    // Atualiza a lista de produtos quando uma categoria é selecionada.
    atualizarProdutos(selectCategoria) {
        const categoria = selectCategoria.value;
        const selectProduto = selectCategoria.closest('.item-pedido').querySelector('.produto');
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>'; // Limpa opções antigas

        if (categoria && window.produtos[categoria]) {
            window.produtos[categoria].forEach(produto => {
                const disponivel = produto.estoque > 0;
                const statusTexto = disponivel ? `(Estoque: ${produto.estoque})` : '(Esgotado)';
                const option = new Option(`${produto.nome} ${statusTexto} - R$ ${produto.preco.toFixed(2)}`, `${categoria}-${produto.id}`);
                option.disabled = !disponivel;
                selectProduto.add(option);
            });
        }
        this.atualizarPrecoEstoque(selectProduto);
    },

    // Atualiza a informação de estoque e o preço quando um produto é selecionado.
    atualizarPrecoEstoque(selectProduto) {
        const itemPedido = selectProduto.closest('.item-pedido');
        const estoqueInfo = itemPedido.querySelector('.estoque-info');
        const inputQuantidade = itemPedido.querySelector('.quantidade');

        if (selectProduto.value) {
            const [categoria, produtoId] = selectProduto.value.split('-');
            const produto = window.produtos[categoria]?.find(p => p.id == produtoId);
            
            if (produto) {
                estoqueInfo.textContent = `Disponível: ${produto.estoque}`;
                inputQuantidade.max = produto.estoque;
                if (parseInt(inputQuantidade.value) > produto.estoque) {
                    inputQuantidade.value = produto.estoque; // Corrige a quantidade se for maior que o estoque
                }
            }
        } else {
            estoqueInfo.textContent = '';
        }
        this.calcularTotal();
    },

    // Valida a quantidade inserida para não exceder o estoque.
    validarQuantidade(inputQuantidade) {
        const max = parseInt(inputQuantidade.max);
        if (parseInt(inputQuantidade.value) > max) {
            inputQuantidade.value = max;
        }
        this.calcularTotal();
    },

    // Calcula e exibe o valor total do pedido.
    calcularTotal() {
        let total = 0;
        document.querySelectorAll('.item-pedido').forEach(item => {
            const selectProduto = item.querySelector('.produto');
            const quantidade = parseInt(item.querySelector('.quantidade').value) || 0;
            
            if (selectProduto.value) {
                const [categoria, produtoId] = selectProduto.value.split('-');
                const produto = window.produtos[categoria]?.find(p => p.id == produtoId);
                if (produto) {
                    total += produto.preco * quantidade;
                }
            }
        });
        document.getElementById('totalPedido').textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    },
    
    // Mostra as opções de pagamento PIX.
    mostrarOpcoesPix() {
        // Implemente a lógica para mostrar o PIX aqui, se necessário.
        console.log("Mostrar opções PIX");
    },

    // Oculta as opções de pagamento PIX.
    ocultarOpcoesPix() {
        // Implemente a lógica para ocultar o PIX aqui, se necessário.
        console.log("Ocultar opções PIX");
    }
};
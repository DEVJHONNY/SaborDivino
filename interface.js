const InterfaceController = {
    // ... (as outras funções como calcularTotal, etc., continuam as mesmas)

    adicionarItem() {
        const container = document.getElementById('itensPedido');
        const numItems = container.children.length + 1;

        // Criar elementos em vez de usar innerHTML
        const novoItem = document.createElement('div');
        novoItem.className = 'item-pedido';

        // Categoria
        const groupCategoria = document.createElement('div');
        groupCategoria.className = 'form-group';
        const labelCategoria = document.createElement('label');
        labelCategoria.setAttribute('for', `categoria-${numItems}`);
        labelCategoria.textContent = 'Categoria:';
        const selectCategoria = document.createElement('select');
        selectCategoria.className = 'categoria';
        selectCategoria.id = `categoria-${numItems}`;
        selectCategoria.innerHTML = `
            <option value="">Selecione uma categoria</option>
            <option value="trufas">Trufas</option>
            <option value="mousses">Mousses</option>
            <option value="empadas">Empadas</option>
        `;
        groupCategoria.append(labelCategoria, selectCategoria);

        // Produto
        const groupProduto = document.createElement('div');
        groupProduto.className = 'form-group';
        const labelProduto = document.createElement('label');
        labelProduto.setAttribute('for', `produto-${numItems}`);
        labelProduto.textContent = 'Produto:';
        const selectProduto = document.createElement('select');
        selectProduto.className = 'produto';
        selectProduto.id = `produto-${numItems}`;
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
        groupProduto.append(labelProduto, selectProduto);

        // Quantidade
        const groupQuantidade = document.createElement('div');
        groupQuantidade.className = 'form-group';
        const labelQuantidade = document.createElement('label');
        labelQuantidade.setAttribute('for', `quantidade-${numItems}`);
        labelQuantidade.textContent = 'Quantidade:';
        const inputQuantidade = document.createElement('input');
        inputQuantidade.type = 'number';
        inputQuantidade.className = 'quantidade';
        inputQuantidade.id = `quantidade-${numItems}`;
        inputQuantidade.min = '1';
        inputQuantidade.value = '1';
        const estoqueInfo = document.createElement('span');
        estoqueInfo.className = 'estoque-info';
        groupQuantidade.append(labelQuantidade, inputQuantidade, estoqueInfo);

        // Botão Remover
        const btnRemover = document.createElement('button');
        btnRemover.type = 'button';
        btnRemover.className = 'remove-item';
        btnRemover.textContent = '🗑️ Remover Item';
        
        // Adicionar o evento aqui no JS!
        btnRemover.addEventListener('click', () => this.removerItem(btnRemover));

        // Adicionar tudo ao novo item
        novoItem.append(groupCategoria, groupProduto, groupQuantidade, btnRemover);
        
        // Conectar eventos principais
        this.conectarEventos(novoItem);
        
        container.appendChild(novoItem);
        this.calcularTotal();
    },

    removerItem(button) {
        const item = button.closest('.item-pedido');
        if (document.querySelectorAll('.item-pedido').length > 1) {
            item.remove();
            this.calcularTotal();
        } else {
            alert('É necessário manter pelo menos um item no pedido');
        }
    },

    conectarEventos(container) {
        container.querySelector('.categoria').addEventListener('change', (e) => this.atualizarProdutos(e.target));
        container.querySelector('.produto').addEventListener('change', (e) => this.atualizarPrecoEstoque(e.target));
        container.querySelector('.quantidade').addEventListener('input', (e) => this.validarQuantidade(e.target));
    }
    
    // ... (resto do seu código do InterfaceController)
};

// ... (resto do arquivo com as exportações globais)
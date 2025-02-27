const InterfaceController = {
    atualizarInterfaceEstoque() {
        document.querySelectorAll('.categoria').forEach(select => {
            if (select.value) {
                this.atualizarProdutos(select);
            }
        });
    },

    atualizarProdutos(selectElement) {
        const categoria = selectElement.value;
        const produtoSelect = selectElement.parentElement.nextElementSibling.querySelector('.produto');
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';

        if (categoria && produtos[categoria]) {
            produtos[categoria].forEach(produto => {
                const disponivel = produto.estoque > 0;
                const statusText = disponivel ? '' : ' (Esgotado)';
                const option = document.createElement('option');
                option.value = `${categoria}-${produto.id}`;
                option.textContent = `${produto.nome}${statusText} - R$ ${produto.preco.toFixed(2)}`;
                option.disabled = !disponivel;
                produtoSelect.appendChild(option);
            });
        }

        // Atualizar total ao mudar categoria
        this.calcularTotal();
    },

    atualizarPrecoEstoque(select) {
        const itemPedido = select.closest('.item-pedido');
        const estoqueInfo = itemPedido.querySelector('.estoque-info');
        const quantidadeInput = itemPedido.querySelector('.quantidade');
        
        if (select.value) {
            const [categoria, produtoId] = select.value.split('-');
            const produto = produtos[categoria]?.find(p => p.id === parseInt(produtoId));
            
            if (produto) {
                estoqueInfo.textContent = `Disponível: ${produto.estoque} unidades`;
                quantidadeInput.max = produto.estoque;
                quantidadeInput.value = Math.min(parseInt(quantidadeInput.value) || 1, produto.estoque);
            }
        } else {
            estoqueInfo.textContent = '';
            quantidadeInput.removeAttribute('max');
        }
        
        // Sempre calcular o total quando mudar o produto
        this.calcularTotal();
    },

    calcularTotal() {
        let total = 0;
        document.querySelectorAll('.item-pedido').forEach(item => {
            const produtoSelect = item.querySelector('.produto');
            const quantidade = parseInt(item.querySelector('.quantidade').value) || 0;
            
            if (produtoSelect.value) {
                const [categoria, produtoId] = produtoSelect.value.split('-');
                const produto = produtos[categoria]?.find(p => p.id === parseInt(produtoId));
                if (produto) {
                    total += produto.preco * quantidade;
                }
            }
        });
        
        document.getElementById('totalPedido').innerText = 
            `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    },

    adicionarItem() {
        const container = document.getElementById('itensPedido');
        const novoItem = document.createElement('div');
        novoItem.className = 'item-pedido';
        const numItems = container.children.length + 1;

        novoItem.innerHTML = `
            <div class="form-group">
                <label for="categoria-${numItems}">Categoria:</label>
                <select class="categoria" id="categoria-${numItems}" name="categoria-${numItems}">
                    <option value="">Selecione uma categoria</option>
                    <option value="trufas">Trufas</option>
                    <option value="mousses">Mousses</option>
                    <option value="empadas">Empadas</option>
                </select>
            </div>
            <div class="form-group">
                <label for="produto-${numItems}">Produto:</label>
                <select class="produto" id="produto-${numItems}" name="produto-${numItems}">
                    <option value="">Selecione um produto</option>
                </select>
            </div>
            <div class="form-group">
                <label for="quantidade-${numItems}">Quantidade:</label>
                <input type="number" 
                       class="quantidade" 
                       id="quantidade-${numItems}" 
                       name="quantidade-${numItems}" 
                       min="1" 
                       value="1">
                <span class="estoque-info"></span>
            </div>
            <button type="button" class="remove-item" onclick="InterfaceController.removerItem(this)">
                🗑️ Remover Item
            </button>
        `;

        // Conectar eventos
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
        container.querySelector('.categoria').onchange = (e) => this.atualizarProdutos(e.target);
        container.querySelector('.produto').onchange = (e) => this.atualizarPrecoEstoque(e.target);
        container.querySelector('.quantidade').oninput = (e) => this.validarQuantidade(e.target);
    },

    validarQuantidade(input) {
        const [categoria, produtoId] = input.closest('.item-pedido')
            .querySelector('.produto').value.split('-');
        
        const produto = produtos[categoria]?.find(p => p.id === parseInt(produtoId));
        if (!produto) return;

        const quantidade = parseInt(input.value) || 0;
        const estoqueInfo = input.parentElement.querySelector('.estoque-info');
        
        if (quantidade > produto.estoque) {
            input.value = produto.estoque;
            estoqueInfo.textContent = `Máximo disponível: ${produto.estoque}`;
            estoqueInfo.style.color = 'red';
        } else {
            estoqueInfo.textContent = `Disponível: ${produto.estoque}`;
            estoqueInfo.style.color = 'green';
        }

        this.calcularTotal();
    },

    // Funções de PIX
    mostrarOpcoesPix() {
        document.getElementById('pix-container').style.display = 'block';
        document.getElementById('pix-banco').textContent = CONFIG.PIX.banco;
        document.getElementById('pix-nome').textContent = CONFIG.PIX.nome;
        document.getElementById('pix-chave').textContent = CONFIG.PIX.chave;
    },

    ocultarOpcoesPix() {
        document.getElementById('pix-container').style.display = 'none';
    },

    mostrarQRCode() {
        const qrCodeContainer = document.getElementById('qr-code');
        const qrCodeImage = document.getElementById('qr-code-image');
        qrCodeImage.src = CONFIG.PIX.qrcode_image;
        qrCodeContainer.style.display = 'block';
    },

    copiarChavePix() {
        navigator.clipboard.writeText(CONFIG.PIX.chave)
            .then(() => alert('Chave PIX copiada com sucesso!'))
            .catch(err => {
                console.error('Erro ao copiar:', err);
                alert('Erro ao copiar chave PIX');
            });
    }
};

// Exportar funções para o escopo global
window.atualizarInterfaceEstoque = InterfaceController.atualizarInterfaceEstoque.bind(InterfaceController);
window.atualizarProdutos = InterfaceController.atualizarProdutos.bind(InterfaceController);
window.atualizarPrecoEstoque = InterfaceController.atualizarPrecoEstoque.bind(InterfaceController);
window.adicionarItem = InterfaceController.adicionarItem.bind(InterfaceController);
window.removerItem = InterfaceController.removerItem.bind(InterfaceController);
window.mostrarOpcoesPix = InterfaceController.mostrarOpcoesPix.bind(InterfaceController);
window.ocultarOpcoesPix = InterfaceController.ocultarOpcoesPix.bind(InterfaceController);
window.mostrarQRCode = InterfaceController.mostrarQRCode.bind(InterfaceController);
window.copiarChavePix = InterfaceController.copiarChavePix.bind(InterfaceController);
window.validarQuantidade = InterfaceController.validarQuantidade.bind(InterfaceController);
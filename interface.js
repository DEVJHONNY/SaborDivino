const InterfaceController = {
    adicionarItem() {
        const container = document.getElementById('itensPedido');
        const novoItem = document.createElement('div');
        novoItem.className = 'item-pedido';
        const numItems = container.children.length + 1;

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
                <select class="produto" id="produto-${numItems}"><option value="">Selecione um produto</option></select>
            </div>
            <div class="form-group">
                <label for="quantidade-${numItems}">Quantidade:</label>
                <input type="number" class="quantidade" id="quantidade-${numItems}" min="1" value="1">
                <span class="estoque-info"></span>
            </div>
            <button type="button" class="remove-item">🗑️ Remover Item</button>
        `;

        container.appendChild(novoItem);
        this.conectarEventos(novoItem);
        this.calcularTotal();
    },
    
    conectarEventos(item) {
        item.querySelector('.categoria').addEventListener('change', (e) => this.atualizarProdutos(e.target));
        item.querySelector('.produto').addEventListener('change', (e) => this.atualizarPrecoEstoque(e.target));
        item.querySelector('.quantidade').addEventListener('input', (e) => this.validarQuantidade(e.target));
        item.querySelector('.remove-item').addEventListener('click', (e) => this.removerItem(e.target));
    },

    removerItem(botaoRemover) {
        if (document.getElementById('itensPedido').children.length > 1) {
            botaoRemover.closest('.item-pedido').remove();
            this.calcularTotal();
        } else {
            Swal.fire('Atenção', 'É necessário manter pelo menos um item no pedido.', 'warning');
        }
    },

    atualizarProdutos(selectCategoria) {
        const categoria = selectCategoria.value;
        const selectProduto = selectCategoria.closest('.item-pedido').querySelector('.produto');
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';

        if (categoria && window.produtos && window.produtos[categoria]) {
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

    atualizarPrecoEstoque(selectProduto) {
        const itemPedido = selectProduto.closest('.item-pedido');
        const estoqueInfo = itemPedido.querySelector('.estoque-info');
        const inputQuantidade = itemPedido.querySelector('.quantidade');

        if (selectProduto.value && window.produtos) {
            const [categoria, produtoId] = selectProduto.value.split('-');
            const produto = window.produtos[categoria]?.find(p => p.id == produtoId);
            if (produto) {
                estoqueInfo.textContent = `Disponível: ${produto.estoque}`;
                inputQuantidade.max = produto.estoque;
                if (parseInt(inputQuantidade.value) > produto.estoque) inputQuantidade.value = produto.estoque;
            }
        } else {
            estoqueInfo.textContent = '';
        }
        this.calcularTotal();
    },

    validarQuantidade(inputQuantidade) {
        const max = parseInt(inputQuantidade.max);
        if (max !== null && parseInt(inputQuantidade.value) > max) inputQuantidade.value = max;
        this.calcularTotal();
    },

    calcularTotal() {
        let total = 0;
        document.querySelectorAll('.item-pedido').forEach(item => {
            const selectProduto = item.querySelector('.produto');
            const quantidade = parseInt(item.querySelector('.quantidade').value) || 0;
            if (selectProduto.value && window.produtos) {
                const [categoria, produtoId] = selectProduto.value.split('-');
                const produto = window.produtos[categoria]?.find(p => p.id == produtoId);
                if (produto) total += produto.preco * quantidade;
            }
        });
        document.getElementById('totalPedido').textContent = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
    },
    
    limparCarrinho() {
        document.getElementById('pedidoForm').reset();
        this.ocultarOpcoesPix();
        document.getElementById('itensPedido').innerHTML = '';
        this.adicionarItem();
        this.calcularTotal();
        Swal.fire({ title: 'Pedido Enviado!', text: 'Você pode fazer um novo pedido agora.', icon: 'success', timer: 3000, showConfirmButton: false });
    },

    mostrarOpcoesPix() {
        const container = document.getElementById('pix-container');
        if (container && typeof CONFIG !== 'undefined') {
            document.getElementById('pix-banco').textContent = CONFIG.PIX.banco;
            document.getElementById('pix-nome').textContent = CONFIG.PIX.nome;
            document.getElementById('pix-chave').textContent = CONFIG.PIX.chave;
            document.getElementById('qr-code-image').src = CONFIG.PIX.qrcode_image;
            document.getElementById('btnMostrarQrCode').onclick = () => {
                const qrWrapper = document.getElementById('qr-code-wrapper');
                qrWrapper.style.display = qrWrapper.style.display === 'none' ? 'block' : 'none';
            };
            document.getElementById('btnCopiarChave').onclick = () => {
                navigator.clipboard.writeText(CONFIG.PIX.chave).then(() => Swal.fire('Sucesso!', 'Chave PIX copiada.', 'success'));
            };
            container.style.display = 'block';
        }
    },

    ocultarOpcoesPix() {
        const container = document.getElementById('pix-container');
        if (container) container.style.display = 'none';
    }
};

window.InterfaceController = InterfaceController;
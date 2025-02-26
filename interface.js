const InterfaceController = {
    atualizarInterfaceEstoque() {
        document.querySelectorAll('.categoria').forEach(select => {
            if (select.value) {
                this.atualizarProdutos(select);
            }
        });
    },

    atualizarProdutos(categoriaSelect) {
        const produtoSelect = categoriaSelect.parentElement.parentElement.querySelector('.produto');
        const categoria = categoriaSelect.value;
        
        produtoSelect.innerHTML = '<option value="">Selecione um produto</option>';
        
        if (!categoria || !produtos[categoria]) {
            console.warn('Categoria inválida ou não encontrada:', categoria);
            return;
        }

        produtos[categoria].forEach(produto => {
            if (produto.estoque > 0) {
                produtoSelect.innerHTML += `
                    <option value="${produto.id}">
                        ${produto.nome} - R$ ${produto.preco.toFixed(2)} 
                        (${produto.estoque} disponíveis)
                    </option>
                `;
            }
        });
    },

    atualizarPrecoEstoque(select) {
        const itemPedido = select.closest('.item-pedido');
        const estoqueInfo = itemPedido.querySelector('.estoque-info');
        const quantidadeInput = itemPedido.querySelector('.quantidade');
        const option = select.selectedOptions[0];
        
        if (option && option.dataset.estoque) {
            const estoqueDisponivel = parseInt(option.dataset.estoque);
            estoqueInfo.textContent = `Disponível: ${estoqueDisponivel} unidades`;
            quantidadeInput.max = estoqueDisponivel;
            quantidadeInput.value = Math.min(parseInt(quantidadeInput.value) || 1, estoqueDisponivel);
        } else {
            estoqueInfo.textContent = '';
            quantidadeInput.removeAttribute('max');
        }
        
        this.calcularTotal();
    },

    calcularTotal() {
        let total = 0;
        document.querySelectorAll('.item-pedido').forEach(item => {
            const produtoSelect = item.querySelector('.produto');
            const quantidade = parseInt(item.querySelector('.quantidade').value) || 0;
            
            if (produtoSelect.selectedOptions[0]) {
                const preco = parseFloat(produtoSelect.selectedOptions[0].dataset.preco) || 0;
                total += preco * quantidade;
            }
        });
        document.getElementById('totalPedido').innerText = `Total: R$ ${total.toFixed(2)}`;
    },

    adicionarItem() {
        const container = document.getElementById('itensPedido');
        const novoItem = container.children[0].cloneNode(true);
        const numItems = container.children.length + 1;

        // Atualizar IDs e labels
        ['categoria', 'produto', 'quantidade'].forEach(tipo => {
            const elemento = novoItem.querySelector(`.${tipo}`);
            if (elemento) {
                elemento.id = `${tipo}-${numItems}`;
                elemento.name = `${tipo}-${numItems}`;
                const label = elemento.previousElementSibling;
                if (label) label.setAttribute('for', `${tipo}-${numItems}`);
            }
        });

        // Limpar seleções
        novoItem.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
        novoItem.querySelector('.quantidade').value = 1;
        novoItem.querySelector('.estoque-info').textContent = '';

        // Reconectar eventos
        this.conectarEventos(novoItem);
        
        container.appendChild(novoItem);
    },

    conectarEventos(container) {
        container.querySelector('.categoria').onchange = (e) => this.atualizarProdutos(e.target);
        container.querySelector('.produto').onchange = (e) => this.atualizarPrecoEstoque(e.target);
        container.querySelector('.quantidade').oninput = (e) => this.validarQuantidade(e.target);
    },

    validarQuantidade(input) {
        const itemPedido = input.closest('.item-pedido');
        const produtoSelect = itemPedido.querySelector('.produto');
        const option = produtoSelect.selectedOptions[0];
        
        if (option && option.dataset.estoque) {
            const estoqueDisponivel = parseInt(option.dataset.estoque);
            let quantidade = parseInt(input.value) || 1;
            
            // Limitar a quantidade ao estoque disponível
            if (quantidade > estoqueDisponivel) {
                quantidade = estoqueDisponivel;
                PedidoController.mostrarErro(`Quantidade máxima disponível: ${estoqueDisponivel}`);
            }
            
            // Garantir valor mínimo de 1
            if (quantidade < 1) quantidade = 1;
            
            // Atualizar valor do input
            input.value = quantidade;
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
window.mostrarOpcoesPix = InterfaceController.mostrarOpcoesPix.bind(InterfaceController);
window.ocultarOpcoesPix = InterfaceController.ocultarOpcoesPix.bind(InterfaceController);
window.mostrarQRCode = InterfaceController.mostrarQRCode.bind(InterfaceController);
window.copiarChavePix = InterfaceController.copiarChavePix.bind(InterfaceController);
window.validarQuantidade = InterfaceController.validarQuantidade.bind(InterfaceController);

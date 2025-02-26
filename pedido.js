const PedidoController = {
    async enviarPedido() {
        console.log('Iniciando envio do pedido');
        
        try {
            if (!Validacoes.validarFormulario()) {
                console.log('Formulário inválido');
                return;
            }

            const dados = this.coletarDados();
            console.log('Dados coletados:', dados);

            // Verificar se é cliente recorrente
            if (dados.telefone) {
                const clienteExistente = await ClienteController.buscarClientePorTelefone(dados.telefone);
                if (clienteExistente) {
                    console.log('Cliente recorrente encontrado:', clienteExistente);
                    // Atualizar informações do cliente
                    await ClienteController.salvarHistorico({
                        ...clienteExistente,
                        ultimoSetor: dados.endereco,
                        ultimoPedido: new Date().toISOString()
                    });
                }
            }

            // Gerar ticket do pedido
            const ticket = await TicketController.gerarTicket(dados);

            // Confirmar envio
            const confirmacao = await Swal.fire({
                title: 'Confirmar Pedido',
                html: `Seu pedido:<br><pre>${ticket}</pre>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Enviar',
                cancelButtonText: 'Cancelar'
            });

            if (confirmacao.isConfirmed) {
                // Salvar pedido
                await TicketController.salvarTicket(dados, ticket);
                
                // Atualizar estoque
                this.atualizarEstoque(dados.itensPedido);
                
                // Limpar carrinho
                this.limparCarrinho();
                
                // Redirecionar para WhatsApp
                const mensagem = encodeURIComponent(ticket);
                const url = `https://wa.me/${CONFIG.WHATSAPP}?text=${mensagem}`;
                window.open(url, '_blank');
            }

        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            Swal.fire({
                title: 'Erro',
                text: 'Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.',
                icon: 'error'
            });
        }
    },

    coletarDados() {
        return {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            endereco: document.getElementById('endereco').value.trim(),
            itensPedido: this.coletarItens(),
            metodoPagamento: document.querySelector('input[name="metodo-pagamento"]:checked')?.value
        };
    },

    coletarItens() {
        const itens = [];
        document.querySelectorAll('.item-pedido').forEach(item => {
            const categoriaSelect = item.querySelector('.categoria');
            const produtoSelect = item.querySelector('.produto');
            const quantidadeInput = item.querySelector('.quantidade');
            
            if (!categoriaSelect || !produtoSelect || !quantidadeInput) {
                console.warn('Elementos do item não encontrados');
                return;
            }

            if (!produtoSelect.value) {
                console.warn('Nenhum produto selecionado');
                return;
            }

            const [categoria, produtoId] = produtoSelect.value.split('-');
            const quantidade = parseInt(quantidadeInput.value) || 0;

            if (!categoria || !produtoId || quantidade <= 0) {
                console.warn('Dados incompletos ou quantidade inválida');
                return;
            }

            const produtoInfo = produtos[categoria]?.find(p => p.id === parseInt(produtoId));
            if (produtoInfo) {
                // Verificar estoque
                if (produtoInfo.estoque < quantidade) {
                    throw new Error(`Estoque insuficiente para ${produtoInfo.nome}`);
                }

                itens.push({
                    id: produtoInfo.id,
                    nome: produtoInfo.nome,
                    preco: produtoInfo.preco,
                    quantidade: quantidade,
                    categoria: categoria
                });
            } else {
                console.warn(`Produto ${produtoId} não encontrado na categoria ${categoria}`);
            }
        });

        if (itens.length === 0) {
            throw new Error('Selecione pelo menos um produto para continuar');
        }

        return itens;
    },

    atualizarEstoque(itens) {
        itens.forEach(item => {
            const produto = this.encontrarProduto(item.id);
            if (produto) {
                produto.estoque -= item.quantidade;
            }
        });
        localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));
    },

    encontrarProduto(id) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === id);
            if (produto) return produto;
        }
        return null;
    },

    limparCarrinho() {
        document.getElementById('nome').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('endereco').value = '';
        document.querySelectorAll('input[name="metodo-pagamento"]').forEach(radio => radio.checked = false);
        document.getElementById('itensPedido').innerHTML = '';
        this.adicionarItemInicial();
    },

    adicionarItemInicial() {
        const itemHtml = `
            <div class="item-pedido">
                <div class="form-group">
                    <label for="categoria-1">Categoria:</label>
                    <select class="categoria" id="categoria-1" onchange="atualizarProdutos(this)">
                        <option value="">Selecione uma categoria</option>
                        <option value="trufas">Trufas</option>
                        <option value="mousses">Mousses</option>
                        <option value="empadas">Empadas</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="produto-1">Produto:</label>
                    <select class="produto" id="produto-1" onchange="atualizarPreco(this)">
                        <option value="">Selecione um produto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="quantidade-1">Quantidade:</label>
                    <input type="number" class="quantidade" id="quantidade-1" min="1" value="1">
                </div>
            </div>
        `;
        document.getElementById('itensPedido').innerHTML = itemHtml;
    }
};

// Exportar para uso global
window.PedidoController = PedidoController;

const PedidoController = {
    async enviarPedido() {
        try {
            if (!Validacoes.validarFormulario()) {
                console.log('Formulário inválido, envio cancelado.');
                return;
            }

            const dados = this.coletarDados();

            for (const item of dados.itensPedido) {
                const disponibilidade = EstoqueController.verificarDisponibilidade(item.id, item.quantidade);
                if (!disponibilidade.disponivel) {
                    throw new Error(`${item.nome}: ${disponibilidade.mensagem}`);
                }
            }

            const ticket = await TicketController.gerarTicket(dados);

            const confirmacao = await Swal.fire({
                title: 'Confirmar Pedido',
                html: `<pre style="text-align: left; white-space: pre-wrap;">${ticket}</pre>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: '✅ Enviar Pedido',
                cancelButtonText: '❌ Cancelar'
            });

            if (confirmacao.isConfirmed) {
                await this.atualizarEstoque(dados.itensPedido);
                await TicketController.salvarTicket(dados, ticket);
                
                // Delega a limpeza da tela para o InterfaceController
                InterfaceController.limparCarrinho();
                
                const mensagem = encodeURIComponent(ticket);
                const url = `https://wa.me/${CONFIG.WHATSAPP}?text=${mensagem}`;
                window.open(url, '_blank');
            }

        } catch (error) {
            console.error('Erro ao processar pedido:', error);
            Swal.fire({
                title: 'Erro!',
                text: error.message || 'Ocorreu um erro ao processar seu pedido.',
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
            metodoPagamento: document.querySelector('input[name="metodo-pagamento"]:checked')?.value || 'Não definido'
        };
    },

    coletarItens() {
        const itens = [];
        document.querySelectorAll('.item-pedido').forEach(item => {
            const produtoSelect = item.querySelector('.produto');
            const quantidade = parseInt(item.querySelector('.quantidade')?.value || '0');
            
            if (produtoSelect?.value && quantidade > 0) {
                const [categoria, produtoIdStr] = produtoSelect.value.split('-');
                const produtoInfo = window.produtos[categoria]?.find(p => p.id.toString() === produtoIdStr);

                if (produtoInfo) {
                    if (produtoInfo.estoque < quantidade) {
                        throw new Error(`Estoque insuficiente para ${produtoInfo.nome}. Disponível: ${produtoInfo.estoque}.`);
                    }
                    itens.push({
                        id: produtoInfo.id,
                        nome: produtoInfo.nome,
                        preco: produtoInfo.preco,
                        quantidade: quantidade,
                        categoria: categoria
                    });
                }
            }
        });

        if (itens.length === 0) {
            throw new Error('Adicione pelo menos um produto ao seu pedido.');
        }
        return itens;
    },

    async atualizarEstoque(itensPedido) {
        itensPedido.forEach(item => {
            const produto = window.produtos[item.categoria].find(p => p.id === item.id);
            if (produto) {
                produto.estoque = Math.max(0, produto.estoque - item.quantidade);
            }
        });
        localStorage.setItem('estoqueProdutos', JSON.stringify(window.produtos));

        // Tenta atualizar no GitHub apenas se houver token (modo admin)
        if (typeof GitHubAPI !== 'undefined' && CONFIG.GITHUB && CONFIG.GITHUB.token) {
            await GitHubAPI.atualizarCatalogo(window.produtos);
        }
    }
};

window.PedidoController = PedidoController;
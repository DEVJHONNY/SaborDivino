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

            // Verificar estoque antes de prosseguir
            for (const item of dados.itensPedido) {
                const disponibilidade = EstoqueController.verificarDisponibilidade(item.id, item.quantidade);
                if (!disponibilidade.disponivel) {
                    throw new Error(`${item.nome}: ${disponibilidade.mensagem}`);
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
                // Atualizar estoque
                await this.atualizarEstoque(dados.itensPedido);
                
                // Salvar pedido
                await TicketController.salvarTicket(dados, ticket);
                
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
            metodoPagamento: document.querySelector('input[name="metodo-pagamento"]:checked')?.value
        };
    },

    coletarItens() {
        const itens = [];
        let temProduto = false;

        document.querySelectorAll('.item-pedido').forEach(item => {
            const categoriaSelect = item.querySelector('.categoria');
            const produtoSelect = item.querySelector('.produto');
            const quantidadeInput = item.querySelector('.quantidade');
            
            // Debug mais detalhado
            console.log('Verificando item:', {
                categoria: categoriaSelect?.value,
                produto: produtoSelect?.value,
                quantidade: quantidadeInput?.value
            });
            
            if (!categoriaSelect?.value || !produtoSelect?.value) {
                console.warn('Item sem categoria ou produto selecionado');
                return;
            }

            const quantidade = parseInt(quantidadeInput?.value || '0');
            if (quantidade <= 0) {
                console.warn('Quantidade inválida');
                return;
            }

            const [categoria, produtoIdStr] = produtoSelect.value.split('-');
            if (!categoria || !produtoIdStr) {
                console.warn('Formato inválido do valor do produto:', produtoSelect.value);
                return;
            }

            console.log('Buscando produto:', categoria, produtoIdStr);
            const produtoInfo = produtos[categoria]?.find(p => p.id.toString() === produtoIdStr);

            if (!produtoInfo) {
                console.warn(`Produto não encontrado: ${categoria}-${produtoIdStr}`);
                return;
            }

            if (produtoInfo.estoque < quantidade) {
                throw new Error(`Estoque insuficiente para ${produtoInfo.nome}`);
            }

            temProduto = true;
            itens.push({
                id: produtoInfo.id,
                nome: produtoInfo.nome,
                preco: produtoInfo.preco,
                quantidade: quantidade,
                categoria: categoria
            });
            
            console.log('Item adicionado:', itens[itens.length - 1]);
        });

        if (!temProduto) {
            throw new Error('Selecione pelo menos um produto para continuar');
        }

        return itens;
    },

    async atualizarEstoque(itensPedido) {
        try {
            // Atualizar estoque local
            itensPedido.forEach(item => {
                const produto = produtos[item.categoria].find(p => p.id === item.id);
                if (produto) {
                    produto.estoque = Math.max(0, produto.estoque - item.quantidade);
                }
            });

            // Salvar no localStorage
            localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));

            // Em modo público, não tentar atualizar GitHub
            if (CONFIG.USAR_CATALOGO_LOCAL) {
                return true;
            }

            // Tentar atualizar GitHub apenas se houver token
            if (CONFIG.GITHUB.token) {
                return await GitHubAPI.atualizarCatalogo(produtos);
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar estoque:', error);
            return false;
        }
    },

    encontrarProduto(id) {
        for (const categoria in produtos) {
            const produto = produtos[categoria].find(p => p.id === id);
            if (produto) return produto;
        }
        return null;
    },

    limparCarrinho() {
        // Limpar dados do cliente
        document.getElementById('nome').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('endereco').value = '';
        
        // Limpar método de pagamento
        document.querySelectorAll('input[name="metodo-pagamento"]').forEach(radio => {
            radio.checked = false;
        });
        
        // Ocultar container do PIX
        document.getElementById('pix-container').style.display = 'none';
        
        // Limpar informações do PIX
        document.getElementById('qr-code').style.display = 'none';
        document.getElementById('pix-banco').textContent = '';
        document.getElementById('pix-nome').textContent = '';
        document.getElementById('pix-chave').textContent = '';
        
        // Limpar itens do pedido
        document.getElementById('itensPedido').innerHTML = '';
        this.adicionarItemInicial();
        
        // Resetar total
        document.getElementById('totalPedido').innerText = 'Total: R$ 0,00';
        
        // Limpar mensagens de erro
        document.querySelectorAll('.error').forEach(error => {
            error.style.display = 'none';
        });

        // Notificar o usuário
        LoadingSystem.show('Limpando formulário...');
        setTimeout(() => {
            LoadingSystem.hide();
            Swal.fire({
                title: 'Formulário Limpo',
                text: 'Você pode fazer um novo pedido agora!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }, 500);
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

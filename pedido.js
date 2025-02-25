const PedidoController = {
    async enviarPedido() {
        LoadingSystem.mostrar('Validando informações...');
        
        try {
            console.log('Iniciando envio do pedido');

            if (!this.validarFormulario()) {
                console.log('Formulário inválido');
                LoadingSystem.ocultar();
                return;
            }

            const dados = this.coletarDados();
            console.log('Dados coletados:', dados);

            // Verificar/cadastrar cliente
            let cliente = ClienteController.buscarClientePorTelefone(dados.telefone);
            if (!cliente) {
                await ClienteController.cadastrarCliente(dados);
            }

            // Verificar cupom
            if (dados.cupom) {
                const desconto = this.aplicarCupom(dados.cupom, cliente);
                if (desconto) {
                    dados.total = dados.total * (1 - desconto);
                }
            }

            // Perguntar se deseja tornar o pedido recorrente
            const tornarRecorrente = await this.perguntarRecorrencia();
            if (tornarRecorrente) {
                const frequencia = await this.escolherFrequencia();
                ClienteController.adicionarPedidoRecorrente(dados.telefone, {
                    itens: dados.itensPedido,
                    frequencia: frequencia,
                    proximaEntrega: this.calcularProximaEntrega(frequencia)
                });
            }

            const ticket = await this.gerarTicket(dados);
            console.log('Ticket gerado:', ticket);

            LoadingSystem.atualizarMensagem('Confirmando pedido...');
            const confirmacao = await this.confirmarPedido(ticket);
            
            if (confirmacao) {
                console.log('Pedido confirmado, redirecionando...');
                
                // Registrar pedido no histórico do cliente
                ClienteController.registrarPedido(dados.telefone, {
                    ticket: ticket,
                    itens: dados.itensPedido,
                    total: dados.total,
                    endereco: dados.endereco
                });

                this.redirecionarWhatsApp(ticket);
                this.mostrarSucesso();
                this.limparFormulario(); // Limpar formulário após sucesso
            } else {
                console.log('Pedido cancelado pelo usuário');
            }

        } catch (erro) {
            console.error('Erro ao processar pedido:', erro);
            this.mostrarErro(erro.message || 'Erro ao processar pedido');
        } finally {
            LoadingSystem.ocultar();
        }
    },

    validarFormulario() {
        const nome = document.getElementById('nome').value.trim();
        const telefone = document.getElementById('telefone').value.trim();
        const endereco = document.getElementById('endereco').value.trim();
        
        if (!nome) {
            this.mostrarErro('Por favor, preencha seu nome');
            return false;
        }
        if (!telefone || !Validacoes.validarTelefone(telefone)) {
            this.mostrarErro('Por favor, insira um número de WhatsApp válido');
            return false;
        }
        if (!endereco) {
            this.mostrarErro('Por favor, preencha seu endereço');
            return false;
        }
        
        const temItens = Array.from(document.querySelectorAll('.item-pedido')).some(item => {
            const produto = item.querySelector('.produto').value;
            const quantidade = parseInt(item.querySelector('.quantidade').value);
            return produto && quantidade > 0;
        });
        
        if (!temItens) {
            this.mostrarErro('Por favor, selecione pelo menos um produto');
            return false;
        }
        
        const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');
        if (!metodoPagamento) {
            this.mostrarErro('Por favor, selecione uma forma de pagamento');
            return false;
        }

        return true;
    },

    coletarDados() {
        const itensPedido = [];
        document.querySelectorAll('.item-pedido').forEach(item => {
            const produtoSelect = item.querySelector('.produto');
            const quantidade = item.querySelector('.quantidade').value;

            if (produtoSelect.value) {
                const produtoOption = produtoSelect.selectedOptions[0];
                itensPedido.push({
                    nome: produtoOption.text.split(' - ')[0],
                    quantidade: quantidade,
                    preco: produtoOption.dataset.preco
                });
            }
        });

        return {
            nome: document.getElementById('nome').value.trim(),
            telefone: Validacoes.formatarTelefone(document.getElementById('telefone').value.trim()),
            endereco: document.getElementById('endereco').value.trim(),
            itensPedido: itensPedido,
            metodoPagamento: document.querySelector('input[name="metodo-pagamento"]:checked').value
        };
    },

    async gerarTicket(dados) {
        const numeroTicket = TicketController.getNumeroTicket();
        const clienteIP = await TicketController.getClienteIP();

        let ticket = `🎂 Novo Pedido - Sabor Divino 🎂\n`;
        ticket += `📝 Ticket: #${numeroTicket}\n\n`;
        ticket += `👤 Dados do Cliente:\n`;
        ticket += `Nome: ${dados.nome}\n`;
        ticket += `Telefone: ${dados.telefone}\n`;
        ticket += `Endereço: ${dados.endereco}\n\n`;
        
        ticket += `🛍️ Itens do Pedido:\n`;
        let total = 0;
        dados.itensPedido.forEach(item => {
            const subtotal = item.quantidade * item.preco;
            total += subtotal;
            ticket += `• ${item.quantidade}x ${item.nome} - R$ ${subtotal.toFixed(2)}\n`;
        });

        ticket += `\n💰 Total: R$ ${total.toFixed(2)}\n`;
        ticket += `💳 Forma de Pagamento: ${dados.metodoPagamento.toUpperCase()}`;

        if (dados.metodoPagamento === 'pix') {
            ticket += `\n\n🏦 Dados do PIX:\n`;
            ticket += `Banco: ${CONFIG.PIX.banco}\n`;
            ticket += `Nome: ${CONFIG.PIX.nome}\n`;
            ticket += `Chave: ${CONFIG.PIX.chave}`;
        }

        // Salvar ticket no histórico
        TicketController.salvarTicket({
            numero: numeroTicket,
            ip: clienteIP
        }, dados);

        return ticket;
    },

    async confirmarPedido(ticket) {
        try {
            LoadingSystem.ocultar(); // Ocultar loading antes do Swal
            const result = await Swal.fire({
                title: 'Confirmar Pedido',
                html: ticket.replace(/\n/g, '<br>'),
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#ff758c',
                cancelButtonColor: '#d33'
            });
            return result.isConfirmed;
        } catch (error) {
            console.error('Erro ao confirmar pedido:', error);
            return false;
        }
    },

    redirecionarWhatsApp(ticket) {
        const texto = encodeURIComponent(ticket);
        window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${texto}`, '_blank');
    },

    mostrarSucesso() {
        Swal.fire({
            title: 'Sucesso!',
            text: 'Pedido enviado com sucesso!',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    },

    mostrarErro(mensagem) {
        Swal.fire({
            title: 'Erro',
            text: mensagem,
            icon: 'error',
            confirmButtonColor: '#ff758c'
        });
    },

    limparFormulario() {
        // Limpar dados do cliente
        document.getElementById('nome').value = '';
        document.getElementById('telefone').value = '';
        document.getElementById('endereco').value = '';

        // Limpar seleções de produtos
        document.querySelectorAll('.item-pedido').forEach((item, index) => {
            if (index === 0) {
                // Resetar primeiro item
                item.querySelector('.categoria').selectedIndex = 0;
                item.querySelector('.produto').innerHTML = '<option value="">Selecione um produto</option>';
                item.querySelector('.quantidade').value = '1';
                item.querySelector('.estoque-info').textContent = '';
            } else {
                // Remover itens adicionais
                item.remove();
            }
        });

        // Limpar seleção de pagamento
        document.querySelectorAll('input[name="metodo-pagamento"]').forEach(radio => {
            radio.checked = false;
        });
        document.getElementById('pix-container').style.display = 'none';

        // Resetar total
        document.getElementById('totalPedido').innerText = 'Total: R$ 0,00';
    },

    async perguntarRecorrencia() {
        const result = await Swal.fire({
            title: 'Pedido Recorrente',
            text: 'Deseja que este pedido se repita automaticamente?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não'
        });
        return result.isConfirmed;
    },

    async escolherFrequencia() {
        const { value: frequencia } = await Swal.fire({
            title: 'Frequência',
            input: 'select',
            inputOptions: {
                semanal: 'Semanal',
                quinzenal: 'Quinzenal',
                mensal: 'Mensal'
            },
            inputPlaceholder: 'Selecione a frequência',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Você precisa escolher uma frequência!';
                }
            }
        });
        return frequencia;
    },

    calcularProximaEntrega(frequencia) {
        const hoje = new Date();
        switch (frequencia) {
            case 'semanal':
                return new Date(hoje.setDate(hoje.getDate() + 7));
            case 'quinzenal':
                return new Date(hoje.setDate(hoje.getDate() + 15));
            case 'mensal':
                return new Date(hoje.setMonth(hoje.getMonth() + 1));
            default:
                return null;
        }
    }
};

// Exportar para uso global
window.PedidoController = PedidoController;

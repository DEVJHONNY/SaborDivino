const TicketController = {
    async gerarTicket(dados) {
        const cliente = ClienteController.sanitizarDados({
            nome: dados.nome,
            telefone: dados.telefone,
            endereco: dados.endereco
        });

        const total = dados.itensPedido.reduce((sum, item) => 
            sum + (item.quantidade * item.preco), 0);

        return `🎫 PEDIDO SABOR DIVINO
--------------------------
📋 DADOS DO CLIENTE
Nome: ${cliente.nome}
${cliente.telefone ? `WhatsApp: ${cliente.telefone}\n` : ''}${cliente.setor ? `Setor: ${cliente.setor}\n` : ''}
🛒 ITENS DO PEDIDO
${dados.itensPedido.map(item => 
    `${item.quantidade}x ${item.nome}
    R$ ${(item.quantidade * item.preco).toFixed(2)}`
).join('\n')}

💰 TOTAL: R$ ${total.toFixed(2)}
💳 FORMA DE PAGAMENTO: ${dados.metodoPagamento.toUpperCase()}

${dados.metodoPagamento === 'pix' ? 
    `📱 PIX: ${CONFIG.PIX.chave}
    Nome: ${CONFIG.PIX.nome}
    Banco: ${CONFIG.PIX.banco}` : ''}

⏰ Data: ${new Date().toLocaleString('pt-BR')}
--------------------------`;
    },

    async salvarTicket(dados, ticket) {
        try {
            let historico = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
            
            const novoTicket = {
                id: Date.now(),
                data: new Date().toISOString(),
                dados: dados,
                ticket: ticket,
                status: 'pendente'
            };

            historico.push(novoTicket);
            localStorage.setItem('historico_tickets', JSON.stringify(historico));

            // Atualizar dados do cliente
            await ClienteController.salvarHistorico({
                nome: dados.nome,
                telefone: dados.telefone,
                setor: dados.endereco,
                ultimoPedido: novoTicket.data
            });

            return novoTicket;
        } catch (error) {
            console.error('Erro ao salvar ticket:', error);
            throw new Error('Não foi possível salvar o pedido');
        }
    },

    buscarTickets(filtros = {}) {
        try {
            let tickets = JSON.parse(localStorage.getItem('historico_tickets') || '[]');

            if (filtros.status) {
                tickets = tickets.filter(t => t.status === filtros.status);
            }

            if (filtros.periodo) {
                const hoje = new Date();
                const diasAtras = {
                    'hoje': 1,
                    'semana': 7,
                    'mes': 30
                }[filtros.periodo];

                if (diasAtras) {
                    const dataLimite = new Date(hoje.setDate(hoje.getDate() - diasAtras));
                    tickets = tickets.filter(t => new Date(t.data) >= dataLimite);
                }
            }

            return tickets;
        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
            return [];
        }
    },

    atualizarStatus(ticketId, novoStatus) {
        try {
            let historico = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
            const index = historico.findIndex(t => t.id === ticketId);
            
            if (index >= 0) {
                historico[index].status = novoStatus;
                historico[index].atualizadoEm = new Date().toISOString();
                localStorage.setItem('historico_tickets', JSON.stringify(historico));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.TicketController = TicketController;

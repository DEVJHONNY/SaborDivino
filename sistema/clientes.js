const ClienteController = {
    clientes: {},

    async cadastrarCliente(dados) {
        // Usar telefone como ID único
        const id = dados.telefone.replace(/\D/g, '');
        
        this.clientes[id] = {
            nome: dados.nome,
            telefone: dados.telefone,
            enderecos: [dados.endereco],
            ultimoPedido: null,
            pedidosRecorrentes: [],
            cupons: [],
            historicoPedidos: []
        };

        this.salvarClientes();
        return id;
    },

    buscarClientePorTelefone(telefone) {
        const id = telefone.replace(/\D/g, '');
        return this.clientes[id];
    },

    adicionarPedidoRecorrente(telefone, pedido) {
        const cliente = this.buscarClientePorTelefone(telefone);
        if (cliente) {
            cliente.pedidosRecorrentes.push({
                itens: pedido.itens,
                frequencia: pedido.frequencia, // semanal, quinzenal, mensal
                proximaEntrega: pedido.proximaEntrega
            });
            this.salvarClientes();
        }
    },

    adicionarCupom(telefone, cupom) {
        const cliente = this.buscarClientePorTelefone(telefone);
        if (cliente) {
            cliente.cupons.push({
                codigo: cupom.codigo,
                desconto: cupom.desconto,
                validade: cupom.validade
            });
            this.salvarClientes();
        }
    },

    registrarPedido(telefone, pedido) {
        const cliente = this.buscarClientePorTelefone(telefone);
        if (cliente) {
            cliente.historicoPedidos.push({
                ...pedido,
                data: new Date().toISOString()
            });
            cliente.ultimoPedido = pedido;
            this.salvarClientes();
        }
    },

    salvarClientes() {
        localStorage.setItem('clientes', JSON.stringify(this.clientes));
    },

    carregarClientes() {
        const dados = localStorage.getItem('clientes');
        if (dados) {
            this.clientes = JSON.parse(dados);
        }
    },

    gerarRelatorio(periodo = 'mensal') {
        const relatorio = {
            totalVendas: 0,
            totalPedidos: 0,
            produtosMaisVendidos: {},
            clientesMaisFrequentes: {},
            vendasPorSetor: {}
        };

        // Processar histórico de pedidos
        Object.values(this.clientes).forEach(cliente => {
            cliente.historicoPedidos.forEach(pedido => {
                // Contabilizar apenas pedidos do período selecionado
                const dataPedido = new Date(pedido.data);
                if (this.pedidoNoPeriodo(dataPedido, periodo)) {
                    relatorio.totalVendas += pedido.total;
                    relatorio.totalPedidos++;

                    // Produtos mais vendidos
                    pedido.itens.forEach(item => {
                        relatorio.produtosMaisVendidos[item.nome] = 
                            (relatorio.produtosMaisVendidos[item.nome] || 0) + item.quantidade;
                    });

                    // Vendas por setor
                    const setor = this.identificarSetor(pedido.endereco);
                    relatorio.vendasPorSetor[setor] = 
                        (relatorio.vendasPorSetor[setor] || 0) + pedido.total;
                }
            });

            // Clientes mais frequentes
            relatorio.clientesMaisFrequentes[cliente.telefone] = 
                cliente.historicoPedidos.length;
        });

        return relatorio;
    },

    pedidoNoPeriodo(data, periodo) {
        const hoje = new Date();
        switch (periodo) {
            case 'diario':
                return data.toDateString() === hoje.toDateString();
            case 'semanal':
                const umaSemanaAtras = new Date(hoje - 7 * 24 * 60 * 60 * 1000);
                return data >= umaSemanaAtras;
            case 'mensal':
                return data.getMonth() === hoje.getMonth() && 
                       data.getFullYear() === hoje.getFullYear();
            default:
                return true;
        }
    },

    identificarSetor(endereco) {
        // Implemente a lógica de identificação de setor baseada no endereço
        // Exemplo simples:
        if (endereco.toLowerCase().includes('centro')) return 'Centro';
        if (endereco.toLowerCase().includes('norte')) return 'Zona Norte';
        return 'Outros';
    }
};

// Inicializar sistema
ClienteController.carregarClientes();

// Exportar para uso global
window.ClienteController = ClienteController;

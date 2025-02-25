const RelatoriosController = {
    async gerarRelatorioCompleto() {
        const historico = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
        return {
            vendas: this.formatarVendasDiarias(historico),
            produtos: this.formatarVendasPorProduto(historico),
            periodos: this.formatarVendasPorPeriodo(historico),
            clientes: this.formatarVendasPorCliente(historico)
        };
    },

    formatarVendasDiarias(historico) {
        return historico.map(pedido => ({
            data: new Date(pedido.data).toLocaleDateString(),
            cliente: pedido.dados.nome,
            produtos: pedido.dados.itensPedido,
            valorTotal: pedido.dados.itensPedido.reduce((total, item) => 
                total + (item.quantidade * item.preco), 0),
            formaPagamento: pedido.dados.metodoPagamento,
            status: pedido.status || 'Concluído'
        }));
    },

    formatarVendasPorProduto(historico) {
        const produtos = {};
        
        historico.forEach(pedido => {
            pedido.dados.itensPedido.forEach(item => {
                if (!produtos[item.nome]) {
                    produtos[item.nome] = {
                        quantidade: 0,
                        valor: 0
                    };
                }
                produtos[item.nome].quantidade += parseInt(item.quantidade);
                produtos[item.nome].valor += item.quantidade * item.preco;
            });
        });

        return Object.entries(produtos).map(([nome, dados]) => ({
            produto: nome,
            quantidade: dados.quantidade,
            valorTotal: dados.valor.toFixed(2)
        }));
    },

    formatarVendasPorPeriodo(historico) {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const inicioSemana = new Date(hoje - 7 * 24 * 60 * 60 * 1000);

        return {
            hoje: this.calcularTotalPeriodo(historico, hoje),
            semana: this.calcularTotalPeriodo(historico, inicioSemana),
            mes: this.calcularTotalPeriodo(historico, inicioMes),
            total: this.calcularTotalPeriodo(historico)
        };
    },

    formatarVendasPorCliente(historico) {
        const clientes = {};
        
        historico.forEach(pedido => {
            const telefone = pedido.dados.telefone;
            if (!clientes[telefone]) {
                clientes[telefone] = {
                    nome: pedido.dados.nome,
                    pedidos: 0,
                    valorTotal: 0,
                    produtos: {}
                };
            }

            clientes[telefone].pedidos++;
            const valorPedido = pedido.dados.itensPedido.reduce((total, item) => 
                total + (item.quantidade * item.preco), 0);
            clientes[telefone].valorTotal += valorPedido;

            // Contabilizar produtos favoritos
            pedido.dados.itensPedido.forEach(item => {
                if (!clientes[telefone].produtos[item.nome]) {
                    clientes[telefone].produtos[item.nome] = 0;
                }
                clientes[telefone].produtos[item.nome] += parseInt(item.quantidade);
            });
        });

        return Object.entries(clientes).map(([telefone, dados]) => ({
            cliente: dados.nome,
            telefone: telefone,
            totalPedidos: dados.pedidos,
            valorTotal: dados.valorTotal.toFixed(2),
            produtoFavorito: this.getProdutoFavorito(dados.produtos)
        }));
    },

    calcularTotalPeriodo(historico, dataInicio = null) {
        let total = 0;
        let pedidos = 0;

        historico.forEach(pedido => {
            const dataPedido = new Date(pedido.data);
            if (!dataInicio || dataPedido >= dataInicio) {
                pedidos++;
                total += pedido.dados.itensPedido.reduce((soma, item) => 
                    soma + (item.quantidade * item.preco), 0);
            }
        });

        return { pedidos, total: total.toFixed(2) };
    },

    getProdutoFavorito(produtos) {
        return Object.entries(produtos)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum';
    },

    exportarCSV(dados, tipo) {
        if (!dados || !dados.length) {
            alert('Não há dados para exportar');
            return;
        }

        const headers = Object.keys(dados[0]);
        const csv = [
            headers.join(','),
            ...dados.map(row => 
                headers.map(field => 
                    `"${row[field]}"`
                ).join(',')
            )
        ].join('\n');

        const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
};

// Exportar para uso global
window.RelatoriosController = RelatoriosController;

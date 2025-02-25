const RelatoriosController = {
    async gerarRelatorioCompleto() {
        const vendas = await this.carregarVendas();
        return {
            vendas: this.formatarVendas(vendas),
            produtos: this.formatarProdutos(vendas),
            periodos: this.formatarPeriodos(vendas),
            clientes: this.formatarClientes(vendas)
        };
    },

    async carregarVendas() {
        const historico = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
        return historico.map(ticket => ({
            data: new Date(ticket.data),
            cliente: ticket.dados.nome,
            produtos: ticket.dados.itensPedido,
            valorTotal: ticket.dados.itensPedido.reduce((total, item) => 
                total + (parseFloat(item.preco) * parseInt(item.quantidade)), 0),
            formaPagamento: ticket.dados.metodoPagamento,
            status: ticket.status || 'Concluído'
        }));
    },

    formatarVendas(vendas) {
        return vendas.map(venda => ({
            data: venda.data.toLocaleDateString(),
            cliente: venda.cliente,
            produtos: venda.produtos,
            valorTotal: venda.valorTotal,
            formaPagamento: venda.formaPagamento,
            status: venda.status
        }));
    },

    formatarProdutos(vendas) {
        const produtos = {};
        
        vendas.forEach(venda => {
            venda.produtos.forEach(produto => {
                if (!produtos[produto.nome]) {
                    produtos[produto.nome] = {
                        quantidade: 0,
                        valor: 0
                    };
                }
                produtos[produto.nome].quantidade += parseInt(produto.quantidade);
                produtos[produto.nome].valor += parseFloat(produto.preco) * parseInt(produto.quantidade);
            });
        });

        return Object.entries(produtos).map(([nome, dados]) => ({
            produto: nome,
            quantidadeVendida: dados.quantidade,
            valorTotal: dados.valor.toFixed(2)
        }));
    },

    formatarPeriodos(vendas) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const periodos = {
            hoje: { vendas: 0, valor: 0 },
            semana: { vendas: 0, valor: 0 },
            mes: { vendas: 0, valor: 0 },
            total: { vendas: vendas.length, valor: 0 }
        };

        vendas.forEach(venda => {
            const data = new Date(venda.data);
            periodos.total.valor += venda.valorTotal;

            if (data >= hoje) {
                periodos.hoje.vendas++;
                periodos.hoje.valor += venda.valorTotal;
            }

            const umaSemanaAtras = new Date(hoje);
            umaSemanaAtras.setDate(hoje.getDate() - 7);
            if (data >= umaSemanaAtras) {
                periodos.semana.vendas++;
                periodos.semana.valor += venda.valorTotal;
            }

            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            if (data >= inicioMes) {
                periodos.mes.vendas++;
                periodos.mes.valor += venda.valorTotal;
            }
        });

        return Object.entries(periodos).map(([periodo, dados]) => ({
            periodo,
            quantidadeVendas: dados.vendas,
            valorTotal: dados.valor.toFixed(2)
        }));
    },

    formatarClientes(vendas) {
        const clientes = {};
        
        vendas.forEach(venda => {
            if (!clientes[venda.cliente]) {
                clientes[venda.cliente] = {
                    compras: 0,
                    valorTotal: 0,
                    produtos: {}
                };
            }

            clientes[venda.cliente].compras++;
            clientes[venda.cliente].valorTotal += venda.valorTotal;

            venda.produtos.forEach(produto => {
                if (!clientes[venda.cliente].produtos[produto.nome]) {
                    clientes[venda.cliente].produtos[produto.nome] = 0;
                }
                clientes[venda.cliente].produtos[produto.nome] += parseInt(produto.quantidade);
            });
        });

        return Object.entries(clientes).map(([nome, dados]) => ({
            cliente: nome,
            totalCompras: dados.compras,
            valorTotal: dados.valorTotal.toFixed(2),
            produtoFavorito: Object.entries(dados.produtos)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
        }));
    },

    exportarCSV(dados, tipo) {
        if (!dados || !dados.length) {
            alert('Não há dados para exportar');
            return;
        }

        // Criar cabeçalho do Excel
        const excelHeader = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Relatório</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>';
        
        // Construir tabela HTML
        const headers = Object.keys(dados[0]);
        let table = '<table border="1">';
        
        // Cabeçalhos
        table += '<tr style="background-color: #ff758c; color: white; font-weight: bold;">';
        headers.forEach(header => {
            table += `<td style="padding: 8px;">${this.formatarCabecalho(header)}</td>`;
        });
        table += '</tr>';
        
        // Dados
        dados.forEach(row => {
            table += '<tr>';
            headers.forEach(header => {
                const valor = row[header] ?? '';
                table += `<td style="padding: 8px;">${
                    typeof valor === 'number' ? 
                        valor.toFixed(2).replace('.', ',') : 
                        valor
                }</td>`;
            });
            table += '</tr>';
        });
        
        table += '</table>';
        
        // Documento completo
        const excelDocument = excelHeader + table + '</body></html>';
        
        // Criar blob e download
        const blob = new Blob(["\uFEFF" + excelDocument], {
            type: 'application/vnd.ms-excel;charset=utf-8'
        });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${tipo}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xls`;
        link.click();
        URL.revokeObjectURL(link.href);
    },

    formatarCabecalho(texto) {
        // Converter camelCase para texto legível
        return texto
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/([A-Z])\s/g, (match, letra) => letra)
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/(^|\s)\w/g, letra => letra.toUpperCase());
    }
};

// Exportar para uso global
window.RelatoriosController = RelatoriosController;

const RelatoriosController = {
    async sincronizarDados() {
        try {
            // Identificar dispositivo atual
            const dispositivoId = localStorage.getItem('dispositivo_id') || this.gerarDispositivoId();
            const dispositivoNome = localStorage.getItem('dispositivo_nome') || 
                                  `Dispositivo ${dispositivoId.substr(-4)}`;

            // Coletar dados locais
            const dadosLocais = {
                dispositivo: {
                    id: dispositivoId,
                    nome: dispositivoNome,
                    tipo: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
                    ultimoAcesso: new Date().toISOString()
                },
                dados: {
                    tickets: JSON.parse(localStorage.getItem('historico_tickets') || '[]'),
                    clientes: JSON.parse(localStorage.getItem('historico_clientes') || '[]'),
                    produtos: JSON.parse(localStorage.getItem('estoqueProdutos') || '{}'),
                    vendas: JSON.parse(localStorage.getItem('historico_vendas') || '[]')
                }
            };

            // Salvar dados do dispositivo
            let todosDispositivos = JSON.parse(localStorage.getItem('dispositivos') || '[]');
            const indexDispositivo = todosDispositivos.findIndex(d => d.id === dispositivoId);
            
            if (indexDispositivo >= 0) {
                todosDispositivos[indexDispositivo] = {
                    ...todosDispositivos[indexDispositivo],
                    ...dadosLocais.dispositivo,
                    dados: dadosLocais.dados
                };
            } else {
                todosDispositivos.push({
                    ...dadosLocais.dispositivo,
                    dados: dadosLocais.dados
                });
            }

            localStorage.setItem('dispositivos', JSON.stringify(todosDispositivos));

            // Consolidar dados de todos os dispositivos
            const dadosConsolidados = this.consolidarDados(todosDispositivos);
            
            return {
                dispositivo: dadosLocais.dispositivo,
                dados: dadosConsolidados
            };
        } catch (error) {
            console.error('Erro na sincronização:', error);
            return null;
        }
    },

    async gerarRelatorioCompleto() {
        const dadosConsolidados = await this.sincronizarDados();
        
        return {
            vendas: this.processarVendas(dadosConsolidados?.dados.tickets || []),
            produtos: this.processarProdutos(dadosConsolidados?.dados.tickets || []),
            clientes: this.processarClientes(dadosConsolidados?.dados.clientes || []),
            periodos: this.processarPeriodos(dadosConsolidados?.dados.tickets || []),
            dispositivos: this.processarDispositivos(dadosConsolidados?.dispositivo || [])
        };
    },

    processarVendas(tickets) {
        return tickets.map(ticket => ({
            data: new Date(ticket.data).toLocaleString(),
            cliente: ticket.dados.nome,
            produtos: ticket.dados.itensPedido,
            valorTotal: ticket.dados.itensPedido.reduce((sum, item) => 
                sum + (item.preco * item.quantidade), 0),
            formaPagamento: ticket.dados.metodoPagamento,
            status: ticket.status,
            dispositivo: ticket.dispositivo
        }));
    },

    processarProdutos(tickets) {
        const produtos = {};
        
        tickets.forEach(ticket => {
            ticket.dados.itensPedido.forEach(item => {
                if (!produtos[item.id]) {
                    produtos[item.id] = {
                        produto: item.nome,
                        quantidadeVendida: 0,
                        valorTotal: 0
                    };
                }
                produtos[item.id].quantidadeVendida += item.quantidade;
                produtos[item.id].valorTotal += item.preco * item.quantidade;
            });
        });

        return Object.values(produtos).map(p => ({
            ...p,
            valorTotal: p.valorTotal.toFixed(2)
        }));
    },

    processarClientes(clientes) {
        return clientes.map(cliente => {
            const compras = this.buscarComprasCliente(cliente.telefone) || [];
            const produtoFavorito = this.identificarProdutoFavorito(compras) || 'Nenhum';
            const valorTotal = compras.reduce((sum, compra) => {
                return sum + (this.calcularTotalCompra(compra.dados) || 0);
            }, 0);

            return {
                cliente: cliente.nome || 'Cliente não identificado',
                telefone: cliente.telefone || 'Não informado',
                totalCompras: compras.length,
                valorTotal: valorTotal.toFixed(2),
                produtoFavorito,
                ultimaCompra: cliente.ultimoPedido || 'Não registrado',
                setor: cliente.setor || 'Não informado'
            };
        });
    },

    processarPeriodos(tickets) {
        const periodos = {
            hoje: { inicio: new Date().setHours(0,0,0,0) },
            semana: { inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            mes: { inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        };

        return Object.entries(periodos).map(([periodo, { inicio }]) => {
            const ticketsPeriodo = tickets.filter(t => new Date(t.data) >= inicio);
            const valorTotal = ticketsPeriodo.reduce((sum, t) => 
                sum + this.calcularTotalCompra(t.dados), 0);

            return {
                periodo,
                quantidadeVendas: ticketsPeriodo.length,
                valorTotal: valorTotal.toFixed(2)
            };
        });
    },

    processarDispositivos(dispositivos) {
        // Garantir que dispositivos seja um array
        const listaDispositivos = Array.isArray(dispositivos) ? dispositivos : [dispositivos];
        
        return listaDispositivos.filter(d => d).map(d => ({
            id: d.id || 'Desconhecido',
            nome: d.nome || 'Dispositivo sem nome',
            ultimaSincronizacao: new Date(d.ultimaSincronizacao || Date.now()).toLocaleString(),
            totalVendas: d.tickets?.length || 0,
            valorTotal: (d.tickets || []).reduce((sum, t) => 
                sum + (this.calcularTotalCompra(t.dados) || 0), 0).toFixed(2)
        }));
    },

    gerarDispositivoId() {
        const id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dispositivo_id', id);
        return id;
    },

    // Simulação de APIs para armazenamento remoto
    async salvarDadosRemoto(dados) {
        // Em produção, substituir por chamada real à API
        localStorage.setItem('dados_sincronizados', JSON.stringify(dados));
        return true;
    },

    async buscarDadosConsolidados() {
        // Em produção, substituir por chamada real à API
        return JSON.parse(localStorage.getItem('dados_sincronizados'));
    },

    consolidarDados(dispositivos) {
        const consolidado = {
            tickets: [],
            clientes: [],
            produtos: {},
            vendas: []
        };

        dispositivos.forEach(dispositivo => {
            // Consolidar tickets
            consolidado.tickets.push(...(dispositivo.dados?.tickets || []));
            
            // Consolidar clientes (evitar duplicatas por telefone)
            dispositivo.dados?.clientes.forEach(cliente => {
                if (!consolidado.clientes.find(c => c.telefone === cliente.telefone)) {
                    consolidado.clientes.push(cliente);
                }
            });

            // Consolidar vendas
            consolidado.vendas.push(...(dispositivo.dados?.vendas || []));

            // Consolidar produtos (manter estoque mais recente)
            if (dispositivo.dados?.produtos) {
                Object.entries(dispositivo.dados.produtos).forEach(([categoria, produtos]) => {
                    if (!consolidado.produtos[categoria]) {
                        consolidado.produtos[categoria] = [];
                    }
                    produtos.forEach(produto => {
                        const index = consolidado.produtos[categoria]
                            .findIndex(p => p.id === produto.id);
                        if (index >= 0) {
                            // Atualizar se for mais recente
                            if (new Date(produto.ultimaAtualizacao) > 
                                new Date(consolidado.produtos[categoria][index].ultimaAtualizacao)) {
                                consolidado.produtos[categoria][index] = produto;
                            }
                        } else {
                            consolidado.produtos[categoria].push(produto);
                        }
                    });
                });
            }
        });

        // Ordenar por data
        consolidado.tickets.sort((a, b) => new Date(b.data) - new Date(a.data));
        consolidado.vendas.sort((a, b) => new Date(b.data) - new Date(a.data));

        return consolidado;
    },

    // Funções auxiliares
    buscarComprasCliente(telefone) {
        const tickets = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
        return tickets.filter(t => t.dados.telefone === telefone);
    },

    calcularTotalCompra(dados) {
        if (!dados || !dados.itensPedido) return 0;
        
        return dados.itensPedido.reduce((sum, item) => {
            if (!item || !item.preco || !item.quantidade) return sum;
            return sum + (item.preco * item.quantidade);
        }, 0);
    },

    identificarProdutoFavorito(compras) {
        const produtos = {};
        compras.forEach(c => {
            c.dados.itensPedido.forEach(item => {
                produtos[item.nome] = (produtos[item.nome] || 0) + item.quantidade;
            });
        });
        return Object.entries(produtos)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Nenhum';
    },

    exportarCSV(dados, tipo) {
        const headers = {
            vendas: ['Data', 'Cliente', 'Produtos', 'Valor Total', 'Forma Pagamento', 'Status', 'Dispositivo'],
            produtos: ['Produto', 'Quantidade Vendida', 'Valor Total'],
            clientes: ['Cliente', 'Telefone', 'Total Compras', 'Valor Total', 'Produto Favorito', 'Última Compra', 'Setor'],
            periodos: ['Período', 'Quantidade Vendas', 'Valor Total'],
            dispositivos: ['ID', 'Nome', 'Última Sincronização', 'Total Vendas', 'Valor Total']
        };

        const csv = [
            headers[tipo].join(','),
            ...dados.map(item => Object.values(item).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_${tipo}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
};

// Executar sincronização periódica
setInterval(() => {
    RelatoriosController.sincronizarDados();
}, 30000); // A cada 30 segundos

// Exportar para uso global
window.RelatoriosController = RelatoriosController;

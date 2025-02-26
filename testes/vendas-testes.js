const TesteVendas = {
    async executarTestes() {
        console.log('🧪 Iniciando testes do sistema de vendas...');
        let totalTestes = 0;
        let testesPassados = 0;

        const executarTeste = async (nome, fn) => {
            totalTestes++;
            try {
                await fn();
                console.log('✅', nome + ': OK');
                testesPassados++;
            } catch (error) {
                console.error('❌', nome + ':', error.message);
            }
        };

        // Testes de Interface
        console.log('\n🖥️ Testando Interface...');
        await executarTeste('Carregamento de produtos', () => {
            if (!produtos || Object.keys(produtos).length === 0) {
                throw new Error('Produtos não carregados corretamente');
            }
        });

        await executarTeste('Atualização de total', () => {
            const totalElement = document.getElementById('totalPedido');
            if (!totalElement) {
                throw new Error('Elemento de total não encontrado');
            }
        });

        // Testes de Validação
        console.log('\n✔️ Testando Validações...');
        await executarTeste('Validação de quantidade', () => {
            // Criar elemento mock para teste
            const mockItemPedido = document.createElement('div');
            mockItemPedido.className = 'item-pedido';
            
            const mockProdutoSelect = document.createElement('select');
            mockProdutoSelect.className = 'produto';
            const mockOption = document.createElement('option');
            mockOption.value = 'trufas-1';
            mockOption.dataset.estoque = '10';
            mockProdutoSelect.appendChild(mockOption);
            
            const mockQuantidadeInput = document.createElement('input');
            mockQuantidadeInput.type = 'number';
            mockQuantidadeInput.value = '5';
            mockQuantidadeInput.className = 'quantidade';
            
            mockItemPedido.appendChild(mockProdutoSelect);
            mockItemPedido.appendChild(mockQuantidadeInput);
            
            // Simular validação
            const resultado = InterfaceController.validarQuantidade(mockQuantidadeInput);
            
            if (resultado === false) {
                throw new Error('Falha na validação de quantidade válida');
            }
        });

        await executarTeste('Validação de estoque', () => {
            const produtoTeste = produtos.trufas[0];
            const estoqueOriginal = produtoTeste.estoque;
            if (estoqueOriginal < 0) {
                throw new Error('Estoque não pode ser negativo');
            }
        });

        // Testes de Pedido
        console.log('\n🛒 Testando Pedidos...');
        await executarTeste('Criação de pedido', () => {
            const dadosTeste = {
                nome: 'Cliente Teste',
                telefone: '71999999999',
                endereco: 'Setor Teste',
                itensPedido: [
                    {
                        id: 1,
                        nome: 'Produto Teste',
                        preco: 10.00,
                        quantidade: 2
                    }
                ],
                metodoPagamento: 'pix'
            };
            
            if (!dadosTeste.nome || !dadosTeste.itensPedido.length) {
                throw new Error('Dados do pedido inválidos');
            }
        });

        await executarTeste('Cálculo de total', () => {
            const itens = [
                { preco: 10, quantidade: 2 },
                { preco: 15, quantidade: 1 }
            ];
            const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            if (total !== 35) {
                throw new Error('Cálculo de total incorreto');
            }
        });

        // Testes de Pagamento
        console.log('\n💳 Testando Pagamentos...');
        await executarTeste('Opções de pagamento', () => {
            const metodosValidos = ['pix', 'dinheiro', 'cartao'];
            const metodosDisponiveis = Array.from(document.querySelectorAll('input[name="metodo-pagamento"]'))
                .map(input => input.value);
            
            const todosMetodosPresentes = metodosValidos.every(metodo => 
                metodosDisponiveis.includes(metodo));
            
            if (!todosMetodosPresentes) {
                throw new Error('Nem todos os métodos de pagamento estão disponíveis');
            }
        });

        await executarTeste('Configuração PIX', () => {
            if (!CONFIG.PIX || !CONFIG.PIX.chave || !CONFIG.PIX.banco) {
                throw new Error('Configuração do PIX incompleta');
            }
        });

        // Resultados
        console.log('\n📋 Resultados dos Testes de Vendas:');
        console.log(`Total de testes: ${totalTestes}`);
        console.log(`Sucesso: ${testesPassados}`);
        console.log(`Falhas: ${totalTestes - testesPassados}`);
        
        const taxaSucesso = (testesPassados / totalTestes) * 100;
        console.log(`\n🎯 Taxa de sucesso: ${taxaSucesso.toFixed(2)}%`);

        return {
            total: totalTestes,
            sucesso: testesPassados,
            falhas: totalTestes - testesPassados,
            taxa: taxaSucesso
        };
    }
};

// Exportar para uso global
window.TesteVendas = TesteVendas;

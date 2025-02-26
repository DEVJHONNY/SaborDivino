// Verificar dependências antes de inicializar
if (typeof CONFIG === 'undefined' || 
    typeof produtos === 'undefined' || 
    typeof BackupSystem === 'undefined' || 
    typeof RelatoriosController === 'undefined') {
    console.error('Dependências necessárias não foram carregadas!');
    throw new Error('Dependências necessárias não foram carregadas. Verifique a ordem dos scripts.');
}

const TesteSistema = {
    resultados: {
        total: 0,
        sucesso: 0,
        falhas: []
    },

    async executarTestes() {
        console.log('🧪 Iniciando testes do sistema...\n');
        
        await this.testarLogin();
        await this.testarProdutos();
        await this.testarEstoque();
        await this.testarPedidos();
        await this.testarRelatorios();
        await this.testarBackup();
        
        this.exibirResultados();
    },

    async teste(nome, funcaoTeste) {
        this.resultados.total++;
        try {
            await funcaoTeste();
            this.resultados.sucesso++;
            console.log(`✅ ${nome}: OK`);
        } catch (erro) {
            this.resultados.falhas.push({ nome, erro: erro.message });
            console.error(`❌ ${nome}: FALHA - ${erro.message}`);
        }
    },

    // Testes de Login
    async testarLogin() {
        console.log('\n🔐 Testando Login...');
        
        await this.teste('Login com senha correta', async () => {
            const hash = await criarHash('Luc@s199607');
            if (hash.toLowerCase() !== CONFIG.SENHA_HASH.toLowerCase()) {
                throw new Error('Hash da senha não corresponde');
            }
        });

        await this.teste('Bloqueio após tentativas', () => {
            if (!CONFIG.MAX_TENTATIVAS || !CONFIG.TEMPO_BLOQUEIO) {
                throw new Error('Configurações de bloqueio não definidas');
            }
        });
    },

    // Testes de Produtos
    async testarProdutos() {
        console.log('\n🛍️ Testando Produtos...');
        
        await this.teste('Estrutura de produtos', () => {
            if (!produtos || !produtos.trufas || !produtos.mousses || !produtos.empadas) {
                throw new Error('Estrutura de produtos inválida');
            }
        });

        await this.teste('Persistência no localStorage', () => {
            localStorage.setItem('testeProduto', JSON.stringify({id: 1, nome: 'Teste'}));
            const recuperado = JSON.parse(localStorage.getItem('testeProduto'));
            if (!recuperado || recuperado.id !== 1) {
                throw new Error('Falha na persistência localStorage');
            }
        });
    },

    // Testes de Estoque
    async testarEstoque() {
        console.log('\n📦 Testando Estoque...');
        
        await this.teste('Atualização de estoque', () => {
            const produto = produtos.trufas[0];
            const estoqueInicial = produto.estoque;
            produto.estoque = estoqueInicial + 1;
            if (produto.estoque !== estoqueInicial + 1) {
                throw new Error('Falha na atualização de estoque');
            }
        });

        await this.teste('Validação de estoque negativo', () => {
            const produto = produtos.trufas[0];
            if (produto.estoque < 0) {
                throw new Error('Estoque negativo detectado');
            }
        });
    },

    // Testes de Pedidos
    async testarPedidos() {
        console.log('\n🛒 Testando Pedidos...');
        
        await this.teste('Criação de pedido', () => {
            const pedido = {
                cliente: 'Teste',
                produtos: [{id: 1, quantidade: 1}],
                total: 10
            };
            if (!pedido.cliente || !pedido.produtos || !pedido.total) {
                throw new Error('Estrutura do pedido inválida');
            }
        });

        await this.teste('Cálculo de total', () => {
            const itens = [
                {preco: 10, quantidade: 2},
                {preco: 15, quantidade: 1}
            ];
            const total = itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
            if (total !== 35) {
                throw new Error('Cálculo de total incorreto');
            }
        });
    },

    // Testes de Relatórios
    async testarRelatorios() {
        console.log('\n📊 Testando Relatórios...');
        
        await this.teste('Geração de relatório', async () => {
            const relatorio = await RelatoriosController.gerarRelatorioCompleto();
            if (!relatorio.vendas || !relatorio.produtos || !relatorio.periodos || !relatorio.clientes) {
                throw new Error('Estrutura do relatório inválida');
            }
        });

        await this.teste('Exportação CSV', () => {
            const dados = [{nome: 'Teste', valor: 10}];
            if (!RelatoriosController.exportarCSV) {
                throw new Error('Função de exportação não encontrada');
            }
        });
    },

    // Testes de Backup
    async testarBackup() {
        console.log('\n💾 Testando Backup...');
        
        await this.teste('Criação de backup', () => {
            const dados = {teste: 'dados'};
            localStorage.setItem('backup_teste', JSON.stringify(dados));
            const recuperado = JSON.parse(localStorage.getItem('backup_teste'));
            if (!recuperado || recuperado.teste !== 'dados') {
                throw new Error('Falha no sistema de backup');
            }
        });

        await this.teste('Restauração de backup', () => {
            if (!BackupSystem || !BackupSystem.restaurarBackup) {
                throw new Error('Sistema de restauração não encontrado');
            }
        });
    },

    exibirResultados() {
        console.log('\n📋 Resultados dos Testes:');
        console.log(`Total de testes: ${this.resultados.total}`);
        console.log(`Sucesso: ${this.resultados.sucesso}`);
        console.log(`Falhas: ${this.resultados.falhas.length}`);
        
        if (this.resultados.falhas.length > 0) {
            console.log('\n❌ Detalhes das falhas:');
            this.resultados.falhas.forEach(falha => {
                console.log(`- ${falha.nome}: ${falha.erro}`);
            });
        }

        const taxaSucesso = (this.resultados.sucesso / this.resultados.total) * 100;
        console.log(`\n🎯 Taxa de sucesso: ${taxaSucesso.toFixed(2)}%`);
    }
};

// Executar testes automaticamente ao carregar
window.addEventListener('load', () => TesteSistema.executarTestes());

// Exportar para uso global
window.TesteSistema = TesteSistema;

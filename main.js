// A função dentro deste listener só será executada quando toda a estrutura HTML da página estiver pronta.
document.addEventListener('DOMContentLoaded', () => {

    // Função principal que organiza e inicia a aplicação.
    function inicializarAplicacao() {
        // 1. VERIFICAÇÃO DE DEPENDÊNCIAS
        // Garante que os outros arquivos JS foram carregados antes de tentarmos usá-los.
        if (typeof InterfaceController === 'undefined' || typeof PedidoController === 'undefined' || typeof SyncSystem === 'undefined') {
            console.error('Erro Crítico: Scripts essenciais não foram carregados.');
            alert('Ocorreu um erro ao carregar a página. Por favor, recarregue.');
            return; // Interrompe a execução se algo estiver faltando.
        }

        // 2. INICIALIZAÇÃO DA INTERFACE E DADOS
        // Adiciona o primeiro campo de item de pedido na tela.
        InterfaceController.adicionarItem();
        
        // Inicia a sincronização automática de dados com o servidor de forma segura.
        SyncSystem.iniciarSincronizacaoAutomatica();

        // 3. CONEXÃO DE EVENTOS (EVENT LISTENERS)
        // Esta é a forma correta e moderna de fazer os botões e campos funcionarem.

        const formPedido = document.getElementById('pedidoForm');
        formPedido.addEventListener('submit', (event) => {
            event.preventDefault(); // Previne o recarregamento da página ao enviar o formulário.
            PedidoController.enviarPedido();
        });

        const btnAdicionarItem = document.getElementById('btnAdicionarItem');
        btnAdicionarItem.addEventListener('click', () => {
            InterfaceController.adicionarItem();
        });

        // Conecta os eventos para os botões de rádio de pagamento (PIX, Dinheiro, Cartão).
        document.querySelectorAll('input[name="metodo-pagamento"]').forEach(radio => {
            radio.addEventListener('click', (event) => {
                if (event.target.value === 'pix') {
                    InterfaceController.mostrarOpcoesPix();
                } else {
                    InterfaceController.ocultarOpcoesPix();
                }
            });
        });

        console.log("Aplicação Sabor Divino inicializada com sucesso!");
    }

    // Inicia a aplicação.
    inicializarAplicacao();
});
document.addEventListener('DOMContentLoaded', () => {

    function inicializarAplicacao() {
        if (typeof InterfaceController === 'undefined' || typeof PedidoController === 'undefined' || typeof SyncSystem === 'undefined') {
            console.error('Erro Crítico: Scripts essenciais não foram carregados.');
            alert('Ocorreu um erro ao carregar a página. Por favor, recarregue.');
            return;
        }

        InterfaceController.adicionarItem();
        SyncSystem.iniciarSincronizacaoAutomatica();

        const formPedido = document.getElementById('pedidoForm');
        formPedido.addEventListener('submit', (event) => {
            event.preventDefault();
            PedidoController.enviarPedido();
        });

        const btnAdicionarItem = document.getElementById('btnAdicionarItem');
        btnAdicionarItem.addEventListener('click', () => {
            InterfaceController.adicionarItem();
        });

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

    inicializarAplicacao();
});
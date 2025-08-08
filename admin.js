// Aguarda o DOM estar completamente carregado antes de executar qualquer código
document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    // Guardamos os elementos mais usados em variáveis para não ter que buscá-los toda hora
    const loginForm = document.getElementById('loginForm');
    const formLogin = document.getElementById('formLogin');
    const adminPanel = document.getElementById('adminPanel');
    const estoqueList = document.getElementById('estoqueList');
    const navButtons = document.querySelectorAll('.nav-btn');

    // --- ESTADO DA APLICAÇÃO ---
    let tentativasLogin = 0;
    let tempoBloqueioPag = 0;
    let produtosCarregados = {}; // Usar uma variável local em vez de depender da global

    // --- FUNÇÕES ---

    // Exemplo de refatoração da função de login
    async function login(event) {
        event.preventDefault(); // Impede o envio do formulário

        const senhaInput = document.getElementById('senha-login');
        const senha = senhaInput.value.trim();

        if (tempoBloqueioPag > Date.now()) {
            const minutosRestantes = Math.ceil((tempoBloqueioPag - Date.now()) / 60000);
            alert(`Muitas tentativas incorretas. Tente novamente em ${minutosRestantes} minutos.`);
            return;
        }

        try {
            // Supondo que você tenha uma função para criar hash
            const senhaHash = await criarHash(senha);

            if (senhaHash.toLowerCase() === CONFIG.SENHA_HASH.toLowerCase()) {
                console.log('Login bem-sucedido!');
                loginForm.style.display = 'none';
                adminPanel.style.display = 'block';

                carregarEstoque();
                carregarProdutos();
                tentativasLogin = 0;
            } else {
                // Lógica de senha incorreta...
                console.log('Senha incorreta');
                alert('Senha incorreta!');
            }
        } catch (error) {
            console.error('Erro ao processar login:', error);
            alert('Erro ao processar login. Tente novamente.');
        }
    }

    // Exemplo de refatoração do carregarEstoque (sem innerHTML +=)
    function carregarEstoque() {
        if (!estoqueList) {
            console.error('Elemento estoqueList não encontrado');
            return;
        }

        // Limpa a lista antes de adicionar novos itens
        estoqueList.innerHTML = '';

        // Usamos um DocumentFragment para performance. Ele é um "container" temporário.
        const fragment = document.createDocumentFragment();

        for (const [categoria, items] of Object.entries(produtosCarregados)) {
            const categoriaDiv = document.createElement('div');
            const categoriaTitle = document.createElement('h3');
            categoriaTitle.textContent = categoria.toUpperCase();
            categoriaDiv.appendChild(categoriaTitle);

            items.forEach(produto => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const label = document.createElement('label');
                const inputId = `estoque-${categoria}-${produto.id}`;
                label.setAttribute('for', inputId);
                label.textContent = `${produto.nome}:`;

                const input = document.createElement('input');
                input.type = 'number';
                input.id = inputId;
                input.value = produto.estoque;
                input.min = '0';

                // Adiciona o evento aqui, no JS!
                input.addEventListener('change', () => {
                    atualizarEstoque(categoria, produto.id, input.value);
                });

                formGroup.appendChild(label);
                formGroup.appendChild(input);
                categoriaDiv.appendChild(formGroup);
            });

            fragment.appendChild(categoriaDiv);
        }

        // Adiciona tudo ao DOM de uma única vez
        estoqueList.appendChild(fragment);
    }

    function inicializar() {
        // Carregar dados iniciais do localStorage
        const estoqueLocal = localStorage.getItem('estoqueProdutos');
        if (estoqueLocal) {
            // Usamos a variável local `produtosCarregados`
            // `window.produtos` ainda pode ser usado se outros scripts dependerem dela
            produtosCarregados = JSON.parse(estoqueLocal);
            Object.assign(window.produtos, produtosCarregados);
        } else {
            produtosCarregados = window.produtos;
        }

        // --- ADICIONAR EVENT LISTENERS ---
        // Forma moderna de lidar com eventos
        if (formLogin) {
            formLogin.addEventListener('submit', login);
        }

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const secao = button.getAttribute('data-secao');
                mostrarSecao(secao);
            });
        });

        // Adicione outros listeners aqui (ex: #btnSalvarEstoque, etc)
    }

    // --- INICIALIZAÇÃO ---
    // Chame a função principal que prepara tudo
    inicializar();

    // ... cole o resto das suas funções aqui (mostrarSecao, salvarEstoque, etc.) ...
});
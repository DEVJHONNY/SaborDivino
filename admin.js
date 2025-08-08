document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DE ELEMENTOS ---
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const allAdminSections = document.querySelectorAll('.secao-admin');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    // Elementos da Seção de Estoque
    const estoqueList = document.getElementById('estoqueList');
    const btnSalvarEstoque = document.getElementById('btnSalvarEstoque');

    // Elementos da Seção de Produtos
    const categoriaProdutoSelect = document.getElementById('categoriaProduto');
    const listaProdutosAdmin = document.getElementById('listaProdutosAdmin');
    const btnAdicionarProduto = document.getElementById('btnAdicionarProduto');
    const btnSalvarProdutos = document.getElementById('btnSalvarProdutos');

    // --- ESTADO DA APLICAÇÃO ---
    let tentativasLogin = 0;
    let tempoBloqueioPag = 0;
    // Usamos 'structuredClone' para criar uma cópia profunda, evitando que alterações
    // locais afetem o objeto original 'window.produtos' antes de salvar.
    let produtosEditaveis = structuredClone(window.produtos);

    // --- FUNÇÕES PRINCIPAIS ---

    async function handleLogin(event) {
        event.preventDefault();
        const senhaInput = document.getElementById('senha-login');
        const senha = senhaInput.value.trim();

        if (tempoBloqueioPag > Date.now()) {
            const minutosRestantes = Math.ceil((tempoBloqueioPag - Date.now()) / 60000);
            alert(`Muitas tentativas. Tente novamente em ${minutosRestantes} min.`);
            return;
        }

        try {
            const senhaHash = await criarHash(senha);
            if (senhaHash.toLowerCase() === CONFIG.SENHA_HASH.toLowerCase()) {
                loginForm.style.display = 'none';
                adminPanel.style.display = 'block';
                mostrarSecao('estoque'); // Mostrar a primeira seção por padrão
                tentativasLogin = 0;
            } else {
                tentativasLogin++;
                if (tentativasLogin >= CONFIG.MAX_TENTATIVAS) {
                    tempoBloqueioPag = Date.now() + (CONFIG.TEMPO_BLOQUEIO * 60 * 1000);
                    alert(`Sistema bloqueado por ${CONFIG.TEMPO_BLOQUEIO} minutos.`);
                } else {
                    alert(`Senha incorreta! Tentativas restantes: ${CONFIG.MAX_TENTATIVAS - tentativasLogin}`);
                }
            }
        } catch (error) {
            console.error('Erro no login:', error);
            alert('Erro ao processar login.');
        }
    }
    
    function mostrarSecao(secaoId) {
        allAdminSections.forEach(secao => {
            secao.style.display = secao.id === `${secaoId}Secao` ? 'block' : 'none';
        });

        // Lógica de carregamento de dados ao trocar de aba
        if (secaoId === 'estoque') {
            renderizarEstoque();
        } else if (secaoId === 'produtos') {
            renderizarProdutosAdmin();
        }
    }

    // --- FUNÇÕES DE ESTOQUE ---

    function renderizarEstoque() {
        if (!estoqueList) return;
        estoqueList.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (const [categoria, items] of Object.entries(produtosEditaveis)) {
            const categoriaTitle = document.createElement('h3');
            categoriaTitle.textContent = categoria.charAt(0).toUpperCase() + categoria.slice(1);
            fragment.appendChild(categoriaTitle);

            items.forEach(produto => {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group';

                const label = document.createElement('label');
                label.textContent = `${produto.nome}:`;

                const input = document.createElement('input');
                input.type = 'number';
                input.value = produto.estoque;
                input.min = '0';
                input.dataset.categoria = categoria;
                input.dataset.id = produto.id;
                
                input.addEventListener('change', (e) => {
                    const el = e.target;
                    const cat = el.dataset.categoria;
                    const id = parseInt(el.dataset.id);
                    const prod = produtosEditaveis[cat].find(p => p.id === id);
                    if (prod) {
                        prod.estoque = parseInt(el.value) || 0;
                    }
                });

                formGroup.appendChild(label);
                formGroup.appendChild(input);
                fragment.appendChild(formGroup);
            });
        }
        estoqueList.appendChild(fragment);
    }
    
    function handleSalvarEstoque() {
        // A edição já acontece em tempo real no objeto 'produtosEditaveis'
        // Apenas confirmamos e salvamos no localStorage
        window.produtos = structuredClone(produtosEditaveis);
        localStorage.setItem('estoqueProdutos', JSON.stringify(window.produtos));
        alert('Estoque salvo localmente com sucesso!');
        // Aqui você poderia adicionar a lógica para salvar no GitHub
    }


    // --- FUNÇÕES DE PRODUTOS ---

    function renderizarProdutosAdmin() {
        if (!listaProdutosAdmin) return;
        const categoriaSelecionada = categoriaProdutoSelect.value;
        listaProdutosAdmin.innerHTML = '';
        
        produtosEditaveis[categoriaSelecionada].forEach((produto, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'produto-item';
            
            itemDiv.innerHTML = `
                <div class="form-group">
                    <label>Nome:</label>
                    <input type="text" value="${produto.nome}" data-field="nome">
                </div>
                <div class="form-group">
                    <label>Preço (R$):</label>
                    <input type="number" step="0.01" value="${produto.preco.toFixed(2)}" data-field="preco">
                </div>
            `;
            
            const btnRemover = document.createElement('button');
            btnRemover.textContent = 'Remover';
            btnRemover.className = 'remove-btn';
            btnRemover.addEventListener('click', () => handleRemoverProduto(categoriaSelecionada, index));
            
            itemDiv.appendChild(btnRemover);
            listaProdutosAdmin.appendChild(itemDiv);
        });
    }

    function handleRemoverProduto(categoria, index) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            produtosEditaveis[categoria].splice(index, 1);
            renderizarProdutosAdmin(); // Re-renderiza a lista
        }
    }
    
    function handleAdicionarProduto() {
        const categoria = categoriaProdutoSelect.value;
        const novoProduto = {
            id: Date.now(), // ID único baseado no timestamp
            nome: 'Novo Produto',
            preco: 0.00,
            estoque: 0
        };
        produtosEditaveis[categoria].push(novoProduto);
        renderizarProdutosAdmin();
    }

    function handleSalvarProdutos() {
        const categoria = categoriaProdutoSelect.value;
        const itemsNaTela = listaProdutosAdmin.querySelectorAll('.produto-item');
        
        itemsNaTela.forEach((item, index) => {
            const produtoOriginal = produtosEditaveis[categoria][index];
            if (produtoOriginal) {
                produtoOriginal.nome = item.querySelector('input[data-field="nome"]').value;
                produtoOriginal.preco = parseFloat(item.querySelector('input[data-field="preco"]').value) || 0;
            }
        });
        
        window.produtos = structuredClone(produtosEditaveis);
        localStorage.setItem('estoqueProdutos', JSON.stringify(window.produtos));
        alert('Produtos salvos localmente com sucesso!');
        renderizarEstoque(); // Atualiza a lista de estoque com os novos nomes/produtos
    }


    // --- INICIALIZAÇÃO E EVENT LISTENERS ---

    function inicializar() {
        // Listeners do Painel
        if (formLogin) formLogin.addEventListener('submit', handleLogin);
        if (btnSalvarEstoque) btnSalvarEstoque.addEventListener('click', handleSalvarEstoque);
        if (btnSalvarProdutos) btnSalvarProdutos.addEventListener('click', handleSalvarProdutos);
        if (btnAdicionarProduto) btnAdicionarProduto.addEventListener('click', handleAdicionarProduto);
        if (categoriaProdutoSelect) categoriaProdutoSelect.addEventListener('change', renderizarProdutosAdmin);

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const secao = button.getAttribute('data-secao');
                mostrarSecao(secao);
            });
        });
    }

    inicializar();
});
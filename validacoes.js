window.addEventListener('error', function(e) {
    console.error('Erro não tratado:', {
        mensagem: e.error?.message,
        linha: e.lineno,
        coluna: e.colno,
        arquivo: e.filename,
        error: e.error
    });
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejeitada não tratada:', e.reason);
});

window.addEventListener('error', function(e) {
    console.error('Erro capturado:', e.error);
    
    // Salvar log do erro
    const log = {
        erro: e.error.message,
        data: new Date().toISOString(),
        pagina: window.location.href
    };
    
    let logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(log);
    localStorage.setItem('error_logs', JSON.stringify(logs));
    
    // Mostrar mensagem amigável
    if (typeof mostrarErro === 'function') {
        mostrarErro('Ocorreu um erro inesperado. Por favor, tente novamente.');
    }
});

// Validation functions
const Validacoes = {
    validarFormulario() {
        const nome = document.getElementById('nome').value.trim();
        const metodoPagamento = document.querySelector('input[name="metodo-pagamento"]:checked');

        if (!nome) {
            this.mostrarErro('Por favor, preencha seu nome');
            return false;
        }

        if (!metodoPagamento) {
            this.mostrarErro('Por favor, selecione um método de pagamento');
            return false;
        }

        // Validar telefone apenas se foi preenchido
        const telefone = document.getElementById('telefone').value.trim();
        if (telefone && !this.validarTelefone(telefone)) {
            this.mostrarErro('Formato de telefone inválido');
            return false;
        }

        return true;
    },

    validarNome(nome) {
        return nome.trim().length >= 3;
    },

    validarQuantidade(quantidade, estoqueDisponivel) {
        const qtd = parseInt(quantidade);
        return qtd > 0 && qtd <= estoqueDisponivel;
    },

    validarPreco(preco) {
        const valor = parseFloat(preco);
        return !isNaN(valor) && valor >= 0;
    },

    sanitizarInput(texto) {
        return texto.replace(/[<>]/g, '').trim();
    },

    validarPedido(dados) {
        if (!dados.nome?.trim()) {
            throw new Error('Nome é obrigatório');
        }

        if (!dados.itensPedido?.length) {
            throw new Error('Selecione pelo menos um item');
        }

        if (!dados.metodoPagamento) {
            throw new Error('Selecione uma forma de pagamento');
        }

        return true;
    },

    validarTelefone(telefone) {
        // Validar apenas se o campo foi preenchido
        if (!telefone) return true;
        return /^[0-9]{10,11}$/.test(telefone);
    },

    validarEndereco(endereco) {
        return endereco.trim().length >= 10;
    },

    formatarTelefone(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    },

    sanitizarEndereco(endereco) {
        return endereco
            .trim()
            .replace(/[<>]/g, '')
            .replace(/\s+/g, ' ');
    }
};

// Export to window for global access
window.Validacoes = Validacoes;

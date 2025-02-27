const Validacoes = {
    mostrarErro(elementoId, mensagem) {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.style.display = 'block';
            elemento.textContent = mensagem;
        }
    },

    ocultarErro(elementoId) {
        const elemento = document.getElementById(elementoId);
        if (elemento) {
            elemento.style.display = 'none';
        }
    },

    validarFormulario() {
        let valido = true;

        // Validar nome
        const nome = document.getElementById('nome').value.trim();
        if (!nome) {
            this.mostrarErro('nomeError', 'Por favor, insira seu nome');
            valido = false;
        } else {
            this.ocultarErro('nomeError');
        }

        // Validar telefone se preenchido
        const telefone = document.getElementById('telefone').value.trim();
        if (telefone && !this.validarTelefone(telefone)) {
            this.mostrarErro('telefoneError', 'Formato inválido: use apenas números com DDD');
            valido = false;
        } else {
            this.ocultarErro('telefoneError');
        }

        // Validar seleção de produto
        const produtos = document.querySelectorAll('.produto');
        let temProduto = false;
        produtos.forEach(select => {
            if (select.value) temProduto = true;
        });

        if (!temProduto) {
            valido = false;
            this.mostrarErro('produtoError', 'Selecione pelo menos um produto');
        }

        return valido;
    },

    validarTelefone(telefone) {
        const numero = telefone.replace(/\D/g, '');
        return /^[1-9]{2}[9]?[0-9]{8}$/.test(numero);
    }
};

// Exportar para uso global
window.Validacoes = Validacoes;

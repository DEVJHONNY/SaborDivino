const ClienteController = {
    async validarDados(dados) {
        if (!dados.nome?.trim()) {
            throw new Error('Nome é obrigatório');
        }

        // Validar telefone apenas se foi preenchido
        if (dados.telefone && !Validacoes.validarTelefone(dados.telefone)) {
            throw new Error('Formato de telefone inválido');
        }

        return true;
    },

    formatarDados(dados) {
        return {
            nome: dados.nome.trim(),
            telefone: dados.telefone?.trim() || 'Não informado',
            setor: dados.endereco?.trim() || 'Não informado'
        };
    },

    salvarHistorico(dadosCliente) {
        try {
            let historico = JSON.parse(localStorage.getItem('historico_clientes') || '[]');
            historico.push({
                ...dadosCliente,
                dataRegistro: new Date().toISOString()
            });
            localStorage.setItem('historico_clientes', JSON.stringify(historico));
            return true;
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.ClienteController = ClienteController;

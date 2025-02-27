const ClienteController = {
    async validarDados(dados) {
        if (!dados.nome?.trim()) {
            throw new Error('Nome é obrigatório');
        }

        // Validar telefone apenas se foi preenchido
        if (dados.telefone && !Validacoes.validarTelefone(dados.telefone.replace(/\D/g, ''))) {
            throw new Error('Formato de telefone inválido');
        }

        return true;
    },

    formatarDados(dados) {
        return {
            nome: dados.nome.trim(),
            telefone: dados.telefone?.replace(/\D/g, '') || 'Não informado',
            setor: dados.endereco?.trim() || 'Não informado'
        };
    },

    buscarClientePorTelefone(telefone) {
        try {
            const historico = JSON.parse(localStorage.getItem('historico_clientes') || '[]');
            const telefoneNumerico = telefone.replace(/\D/g, '');
            
            return historico.find(cliente => 
                cliente.telefone.replace(/\D/g, '') === telefoneNumerico
            );
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            return null;
        }
    },

    obterUltimoSetor(telefone) {
        const cliente = this.buscarClientePorTelefone(telefone);
        return cliente?.setor || '';
    },

    salvarHistorico(dadosCliente) {
        try {
            let historico = JSON.parse(localStorage.getItem('historico_clientes') || '[]');
            
            // Verificar se cliente já existe
            const telefoneNumerico = dadosCliente.telefone.replace(/\D/g, '');
            const clienteExistente = historico.findIndex(c => 
                c.telefone.replace(/\D/g, '') === telefoneNumerico
            );

            if (clienteExistente >= 0) {
                // Atualizar dados do cliente
                historico[clienteExistente] = {
                    ...historico[clienteExistente],
                    ...dadosCliente,
                    ultimaAtualizacao: new Date().toISOString()
                };
            } else {
                // Adicionar novo cliente
                historico.push({
                    ...dadosCliente,
                    dataCadastro: new Date().toISOString(),
                    ultimaAtualizacao: new Date().toISOString()
                });
            }

            localStorage.setItem('historico_clientes', JSON.stringify(historico));
            return true;
        } catch (error) {
            console.error('Erro ao salvar histórico:', error);
            return false;
        }
    },

    formatarTelefone(telefone) {
        const numeros = telefone.replace(/\D/g, '');
        if (numeros.length === 11) {
            return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
        }
        return telefone;
    },

    sanitizarDados(dados) {
        return {
            nome: dados.nome.replace(/[<>]/g, '').trim().toUpperCase(),
            telefone: this.formatarTelefone(dados.telefone || ''),
            setor: dados.endereco?.replace(/[<>]/g, '').trim() || 'Não informado'
        };
    }
};

// Exportar para uso global
window.ClienteController = ClienteController;

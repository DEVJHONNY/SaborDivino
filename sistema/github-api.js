const GitHubAPI = {
    async atualizarCatalogo(produtos) {
        try {
            // Verificar token
            if (!CONFIG.GITHUB.token) {
                throw new Error('Token do GitHub não configurado');
            }

            const novoConteudo = {
                versao: new Date().toISOString().split('T')[0] + '.1',
                produtos: produtos,
                ultima_atualizacao: new Date().toISOString(),
                meta: {
                    moeda: "BRL",
                    formato_preco: "0.00",
                    unidade_estoque: "unidades"
                }
            };

            // Primeiro, tentar validar o token
            const testResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!testResponse.ok) {
                throw new Error('Token inválido ou expirado');
            }

            // Debug
            console.log('Tentando atualizar GitHub...');
            console.log('URL:', `https://api.github.com/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.filepath}`);

            // Primeiro, obter o arquivo atual para pegar o SHA
            const response = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.filepath}`, {
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar arquivo: ${response.status} ${response.statusText}`);
            }

            const atual = await response.json();
            
            // Debug
            console.log('SHA atual:', atual.sha);

            // Atualizar o arquivo
            const updateResponse = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.filepath}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Atualização automática do catálogo - ${new Date().toISOString()}`,
                    content: btoa(unescape(encodeURIComponent(JSON.stringify(novoConteudo, null, 2)))),
                    sha: atual.sha,
                    branch: CONFIG.GITHUB.branch
                })
            });

            if (!updateResponse.ok) {
                const error = await updateResponse.json();
                throw new Error(`Falha ao atualizar: ${error.message}`);
            }

            console.log('Catálogo atualizado no GitHub com sucesso!');
            
            // Salvar localmente também
            localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));
            localStorage.setItem('versaoCatalogo', novoConteudo.versao);

            return true;
        } catch (error) {
            console.error('Erro detalhado:', error);
            
            // Salvar localmente
            localStorage.setItem('estoqueProdutos', JSON.stringify(produtos));
            
            // Mensagem mais específica
            let mensagem = 'Erro ao atualizar GitHub:\n';
            if (error.message.includes('Token')) {
                mensagem += 'Token inválido ou expirado. Por favor, gere um novo token.';
            } else {
                mensagem += error.message;
            }
            
            alert(mensagem);
            return false;
        }
    }
};

window.GitHubAPI = GitHubAPI;

const GitHubAPI = {
    async atualizarCatalogo(dados) {
        try {
            // Buscar dados atuais
            const response = await fetch(CONFIG.CATALOGO_URL);
            const dadosAtuais = await response.json();

            // Mesclar dados
            const catalogoAtualizado = {
                versao: new Date().toISOString(),
                produtos: dados,
                tickets: dadosAtuais.tickets || [],
                ultima_atualizacao: new Date().toISOString()
            };

            // Atualizar no GitHub se tivermos token
            if (CONFIG.GITHUB.token) {
                const url = `https://api.github.com/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.filepath}`;
                
                const file = await fetch(url, {
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }).then(r => r.json());

                await fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${CONFIG.GITHUB.token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Atualização automática do catálogo',
                        content: btoa(JSON.stringify(catalogoAtualizado, null, 2)),
                        sha: file.sha,
                        branch: CONFIG.GITHUB.branch
                    })
                });
            }

            return true;
        } catch (error) {
            console.error('Erro ao atualizar catálogo:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.GitHubAPI = GitHubAPI;

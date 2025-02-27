const GitHubAPI = {
    async atualizarCatalogo(dados) {
        try {
            // Verificar se está no modo público
            if (CONFIG.USAR_CATALOGO_LOCAL) {
                console.log('Usando catálogo local, pulando atualização GitHub');
                return true;
            }

            // Em produção, não atualizar se não houver token
            if (!CONFIG.GITHUB.token) {
                console.log('Modo público: atualizações desativadas');
                return true;
            }

            const url = `https://api.github.com/repos/${CONFIG.GITHUB.owner}/${CONFIG.GITHUB.repo}/contents/${CONFIG.GITHUB.filepath}`;
            
            // Buscar arquivo atual
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const file = await response.json();
            
            // Preparar novo conteúdo
            const content = JSON.stringify(dados, null, 2);
            const encodedContent = btoa(content);

            // Atualizar arquivo
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${CONFIG.GITHUB.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Atualização automática do catálogo',
                    content: encodedContent,
                    sha: file.sha,
                    branch: CONFIG.GITHUB.branch
                })
            });

            return true;
        } catch (error) {
            console.error('Erro ao atualizar catálogo:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.GitHubAPI = GitHubAPI;

/**
 * Converte uma string UTF-8 para Base64 de forma segura, lidando com caracteres especiais.
 * @param {string} str - A string a ser codificada.
 * @returns {string} A string codificada em Base64.
 */
function utf8_to_b64(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    let binary = '';
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i]);
    }
    return window.btoa(binary);
}

const GitHubAPI = {
    /**
     * Atualiza o arquivo catalogo.json no repositório do GitHub.
     * @param {object} dados - O objeto completo de produtos a ser salvo.
     * @returns {boolean} - Retorna true em caso de sucesso, false em caso de falha.
     */
    async atualizarCatalogo(dados) {
        // Verifica se há um token configurado antes de prosseguir.
        if (!CONFIG?.GITHUB?.token) {
            console.log("Token do GitHub não configurado. Atualização remota ignorada.");
            return false;
        }

        try {
            const { owner, repo, filepath, branch, token } = CONFIG.GITHUB;
            const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filepath}`;
            
            // 1. Obter o SHA do arquivo atual, que é necessário para atualizá-lo.
            const fileResponse = await fetch(url, {
                headers: { 'Authorization': `token ${token}` }
            });

            if (!fileResponse.ok) {
                throw new Error(`Não foi possível obter o arquivo do GitHub. Status: ${fileResponse.status}`);
            }
            const file = await fileResponse.json();

            // 2. Preparar o novo conteúdo do catálogo.
            const catalogoAtualizado = {
                versao: new Date().toISOString().split('T')[0] + '.' + new Date().getTime(), // Versão única
                produtos: dados,
                ultima_atualizacao: new Date().toISOString()
            };
            
            // Converte o JSON para string e depois para Base64 de forma segura.
            const conteudoBase64 = utf8_to_b64(JSON.stringify(catalogoAtualizado, null, 2));

            // 3. Enviar a requisição de atualização (PUT) para a API do GitHub.
            const updateResponse = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `[AUTO] Atualização de estoque/produtos - ${new Date().toLocaleString('pt-BR')}`,
                    content: conteudoBase64,
                    sha: file.sha, // O SHA do arquivo antigo é obrigatório.
                    branch: branch
                })
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`Falha ao atualizar o arquivo no GitHub: ${errorData.message}`);
            }

            console.log("Catálogo atualizado com sucesso no GitHub!");
            return true;
        } catch (error) {
            console.error('Erro em GitHubAPI.atualizarCatalogo:', error);
            // Notificar o usuário sobre a falha na sincronização com o GitHub.
            Swal.fire('Erro de Sincronização', 'Não foi possível salvar as alterações no servidor. As mudanças foram salvas apenas localmente.', 'error');
            return false;
        }
    }
};

window.GitHubAPI = GitHubAPI;
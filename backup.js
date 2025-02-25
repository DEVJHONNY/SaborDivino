const BackupSystem = {
    salvarBackupLocal() {
        try {
            const dados = {
                produtos: produtos,
                timestamp: new Date().toISOString(),
                versao: '1.0'
            };
            localStorage.setItem('backup_produtos', JSON.stringify(dados));
            console.log('Backup realizado:', new Date().toLocaleString());
            return true;
        } catch (error) {
            console.error('Erro ao fazer backup:', error);
            return false;
        }
    },

    restaurarBackup() {
        const backup = localStorage.getItem('backup_produtos');
        if (backup) {
            const dados = JSON.parse(backup);
            Object.assign(produtos, dados.produtos);
            localStorage.setItem('estoqueProdutos', JSON.stringify(dados.produtos));
            return true;
        }
        return false;
    },

    exportarBackup() {
        try {
            const dados = {
                produtos: produtos,
                config: CONFIG,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(dados, null, 2)], {type: 'application/json'});
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_sabor_divino_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            alert('Erro ao exportar backup. Verifique o console.');
        }
    }
};

// Backup automático a cada hora
setInterval(BackupSystem.salvarBackupLocal, 3600000);

// Criar backup antes de fechar a página
window.addEventListener('beforeunload', BackupSystem.salvarBackupLocal);

// Backup após alterações importantes
window.addEventListener('estoqueAtualizado', BackupSystem.salvarBackupLocal);

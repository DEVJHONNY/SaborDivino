const BackupSystem = {
    async criarBackup() {
        try {
            const backup = {
                data: new Date().toISOString(),
                versao: CONFIG.VERSAO_CATALOGO,
                produtos: JSON.parse(localStorage.getItem('estoqueProdutos') || '{}'),
                historico: {
                    tickets: JSON.parse(localStorage.getItem('historico_tickets') || '[]'),
                    clientes: JSON.parse(localStorage.getItem('historico_clientes') || '[]')
                }
            };

            localStorage.setItem('ultimo_backup', JSON.stringify(backup));
            console.log('Backup criado com sucesso:', backup);
            return backup;
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return null;
        }
    },

    async restaurarUltimoBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem('ultimo_backup'));
            if (!backup) throw new Error('Nenhum backup encontrado');

            localStorage.setItem('estoqueProdutos', JSON.stringify(backup.produtos));
            localStorage.setItem('historico_tickets', JSON.stringify(backup.historico.tickets));
            localStorage.setItem('historico_clientes', JSON.stringify(backup.historico.clientes));
            localStorage.setItem('versaoCatalogo', backup.versao);

            console.log('Backup restaurado com sucesso');
            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    },

    exportarBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem('ultimo_backup'));
            if (!backup) throw new Error('Nenhum backup para exportar');

            const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_sabordivino_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Erro ao exportar backup:', error);
            return false;
        }
    }
};

// Exportar para uso global
window.BackupSystem = BackupSystem;

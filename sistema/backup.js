const BackupSystem = {
    BACKUP_KEY: 'sabor_divino_backup',
    
    async criarBackup() {
        try {
            const dados = {
                produtos: localStorage.getItem('estoqueProdutos'),
                tickets: localStorage.getItem('historico_tickets'),
                clientes: localStorage.getItem('historico_clientes'),
                data: new Date().toISOString()
            };

            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(dados));
            return true;
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return false;
        }
    },

    async restaurarBackup() {
        try {
            const backup = JSON.parse(localStorage.getItem(this.BACKUP_KEY));
            if (!backup) {
                throw new Error('Nenhum backup encontrado');
            }

            if (backup.produtos) localStorage.setItem('estoqueProdutos', backup.produtos);
            if (backup.tickets) localStorage.setItem('historico_tickets', backup.tickets);
            if (backup.clientes) localStorage.setItem('historico_clientes', backup.clientes);

            return true;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    },

    verificarBackup() {
        const backup = localStorage.getItem(this.BACKUP_KEY);
        if (!backup) return null;

        try {
            const dados = JSON.parse(backup);
            return {
                data: new Date(dados.data),
                tamanho: backup.length,
                temProdutos: !!dados.produtos,
                temTickets: !!dados.tickets,
                temClientes: !!dados.clientes
            };
        } catch (error) {
            console.error('Erro ao verificar backup:', error);
            return null;
        }
    },

    backupAutomatico: {
        iniciar(intervaloMinutos = 30) {
            this.parar(); // Parar qualquer backup automático existente
            this.intervalo = setInterval(() => {
                BackupSystem.criarBackup()
                    .then(sucesso => {
                        if (sucesso) {
                            console.log('Backup automático realizado com sucesso');
                        }
                    });
            }, intervaloMinutos * 60 * 1000);
        },

        parar() {
            if (this.intervalo) {
                clearInterval(this.intervalo);
                this.intervalo = null;
            }
        }
    }
};

// Iniciar backup automático
BackupSystem.backupAutomatico.iniciar();

// Exportar para uso global
window.BackupSystem = BackupSystem;

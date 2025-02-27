const LoadingSystem = {
    init() {
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9999;
                justify-content: center;
                align-items: center;
                flex-direction: column;
            `;

            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 5px solid #f3f3f3;
                border-top: 5px solid #3498db;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            `;

            const message = document.createElement('div');
            message.id = 'loading-message';
            message.style.cssText = `
                color: white;
                margin-top: 20px;
                font-family: 'Poppins', sans-serif;
            `;

            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;

            overlay.appendChild(spinner);
            overlay.appendChild(message);
            document.head.appendChild(style);
            document.body.appendChild(overlay);
        }
    },

    show(mensagem = 'Carregando...') {
        this.init();
        const overlay = document.getElementById('loading-overlay');
        const messageEl = document.getElementById('loading-message');
        if (overlay && messageEl) {
            messageEl.textContent = mensagem;
            overlay.style.display = 'flex';
        }
    },

    hide() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
};

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    LoadingSystem.init();
});

// Exportar para uso global
window.LoadingSystem = LoadingSystem;

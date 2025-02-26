const LoadingSystem = {
    show(message = 'Carregando...') {
        let loadingEl = document.getElementById('loading-overlay');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'loading-overlay';
            loadingEl.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-message">${message}</div>
            `;
            document.body.appendChild(loadingEl);
        }
        loadingEl.style.display = 'flex';
    },

    hide() {
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
    },

    updateMessage(message) {
        const messageEl = document.querySelector('.loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
};

// Adicionar estilos necessários
const style = document.createElement('style');
style.textContent = `
    #loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        z-index: 9999;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid #ff758c;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-message {
        color: white;
        margin-top: 20px;
        font-family: 'Poppins', sans-serif;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Exportar para uso global
window.LoadingSystem = LoadingSystem;

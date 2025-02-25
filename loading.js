const LoadingSystem = {
    count: 0,
    timeoutId: null,
    
    mostrar(mensagem = 'Processando...') {
        this.count++;
        
        // Limpar timeout anterior se existir
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Configurar timeout de segurança
        this.timeoutId = setTimeout(() => {
            this.forceHide();
        }, 10000); // 10 segundos máximo
        
        if (this.count === 1) {
            const loading = document.createElement('div');
            loading.className = 'loading-overlay';
            loading.innerHTML = `
                <div class="loader"></div>
                <p id="loading-message">${mensagem}</p>
            `;
            document.body.appendChild(loading);
            document.body.style.overflow = 'hidden';
        }
    },

    atualizarMensagem(mensagem) {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) {
            messageEl.textContent = mensagem;
        }
    },

    ocultar() {
        this.count--;
        
        if (this.count <= 0) {
            this.forceHide();
        }
    },

    forceHide() {
        this.count = 0;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        const loading = document.querySelector('.loading-overlay');
        if (loading) {
            loading.remove();
            document.body.style.overflow = '';
        }
    }
};

// Adicionar estilos necessários
const style = document.createElement('style');
style.textContent = `
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    .loader {
        width: 48px;
        height: 48px;
        border: 5px solid #ff758c;
        border-bottom-color: transparent;
        border-radius: 50%;
        animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Adicionar ouvinte para forçar o fechamento se a página for fechada
window.addEventListener('beforeunload', () => {
    LoadingSystem.forceHide();
});

window.LoadingSystem = LoadingSystem;

const CONFIG = {
    // Hash para senha: Luc@s199607
    SENHA_HASH: '8d4d7507e73ae5f5f04088b2f49ae0a955947c6a63a46ced137332996e2511a9',
    MAX_TENTATIVAS: 3,
    TEMPO_BLOQUEIO: 15,
    WHATSAPP: "5571996457135", // Confirmar se este número está correto
    PIX: {
        nome: "Lucas dos anjos araujo rocha",
        banco: "Picpay",
        chave: "00020126330014br.gov.bcb.pix0111076140585265204000053039865802BR5925Lucas Dos Anjos Araujo Ro6009Sao Paulo62290525REC67AF4A30A9AEF471415507630428C5",
        tipo_chave: "Aleatório",
        qrcode_image: "https://i.ibb.co/m558LYPX/Whats-App-Image-2025-02-12-at-08-36-21.jpg"
    },
    DEBUG: true, // Adicionar modo debug para ajudar na identificação de erros

    // Atualizar versão do catálogo
    VERSAO_CATALOGO: "2024.02.27.1", // Formato: YYYY.MM.DD.versao

    // Força sincronização em todos os dispositivos
    FORCAR_SINCRONIZACAO: false, // Não forçar sincronização

    // Corrigir URL do catálogo - ajustar para site-oficial
    CATALOGO_URL: 'https://raw.githubusercontent.com/DEVJHONNY/SaborDivino/refs/heads/Site-Oficial/catalogo.json',
    // ou caso prefira usar o arquivo local:
    USAR_CATALOGO_LOCAL: false, // Usar local por padrão
    
    // Configurações de sincronização
    SYNC: {
        CHECK_INTERVAL: 5 * 60 * 1000, // Reduzir para 1 minuto para teste
        LAST_UPDATE: null,
        FORCE_UPDATE: false
    },

    GITHUB: {
        owner: 'DEVJHONNY',
        repo: 'SaborDivino',
        branch: 'site-oficial', // Atualizar para branch correta
        token: '', // Token vazio para uso público
        filepath: 'catalogo.json'
    }
};

// Função para criar hash (SHA-256)
async function criarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Adicionar função auxiliar de debug
function debug(message, data = null) {
    if (CONFIG.DEBUG) {
        console.log(`[Debug] ${message}`, data || '');
    }
}

// Melhorar detecção de ambiente
const IS_LOCAL = window.location.protocol === 'file:';
const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

// Ajustar configurações baseado no ambiente
if (IS_LOCAL) {
    CONFIG.USAR_CATALOGO_LOCAL = true;
} else if (IS_GITHUB_PAGES) {
    CONFIG.USAR_CATALOGO_LOCAL = false;
}

// Verificar config local
if (typeof CONFIG_LOCAL !== 'undefined' && CONFIG_LOCAL.GITHUB_TOKEN) {
    CONFIG.GITHUB.token = CONFIG_LOCAL.GITHUB_TOKEN;
    CONFIG.USAR_CATALOGO_LOCAL = false;
}

// Verificar modo de execução
const IS_PUBLIC = window.CONFIG_LOCAL?.IS_PUBLIC || true;

if (!IS_PUBLIC && window.CONFIG_LOCAL?.GITHUB_TOKEN) {
    CONFIG.GITHUB.token = window.CONFIG_LOCAL.GITHUB_TOKEN;
    CONFIG.USAR_CATALOGO_LOCAL = false;
}

// Adicionar verificação de ambiente
if (typeof CONFIG_LOCAL !== 'undefined') {
    CONFIG.GITHUB.token = CONFIG_LOCAL.GITHUB_TOKEN;
    CONFIG.USAR_CATALOGO_LOCAL = false;
}

// Exportar para uso global
window.CONFIG = CONFIG;
window.debug = debug;

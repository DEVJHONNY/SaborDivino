const CONFIG = {
    // Hash para senha: Luc@s199607
    SENHA_HASH: '8d4d7507e73ae5f5f04088b2f49ae0a955947c6a63a46ced137332996e2511a9',
    MAX_TENTATIVAS: 3,
    TEMPO_BLOQUEIO: 15, // minutos
    WHATSAPP: "5571996457135",
    PIX: {
        nome: "Lucas dos anjos araujo rocha",
        banco: "Picpay",
        chave: "00020126330014br.gov.bcb.pix0111076140585265204000053039865802BR5925Lucas Dos Anjos Araujo Ro6009Sao Paulo62290525REC67AF4A30A9AEF471415507630428C5",
        tipo_chave: "Aleatório",
        qrcode_image: "https://i.ibb.co/m558LYPX/Whats-App-Image-2025-02-12-at-08-36-21.jpg"
    },
    DEBUG: true,
    VERSAO_CATALOGO: "2024.02.27.1",

    // *** CORREÇÃO CRÍTICA (CORS) ***
    // Usando a URL do CDN jsDelivr que permite o acesso
    CATALOGO_URL: 'https://cdn.jsdelivr.net/gh/DEVJHONNY/SaborDivino@Site-Oficial/catalogo.json',

    GITHUB: {
        owner: 'DEVJHONNY',
        repo: 'SaborDivino',
        branch: 'site-oficial',
        filepath: 'catalogo.json',
        token: '' // O token será preenchido abaixo se disponível
    }
};

// --- Lógica de Ambiente Simplificada ---

// Verifica se há uma configuração local com um token (para o admin)
if (typeof CONFIG_LOCAL !== 'undefined' && CONFIG_LOCAL.GITHUB_TOKEN) {
    CONFIG.GITHUB.token = CONFIG_LOCAL.GITHUB_TOKEN;
    console.log("Token do GitHub carregado a partir de config.local.js");
}

// --- Funções Utilitárias ---

async function criarHash(texto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function debug(message, data = null) {
    if (CONFIG.DEBUG) {
        console.log(`[Debug] ${message}`, data || '');
    }
}

// Exportar para uso global
window.CONFIG = CONFIG;
window.debug = debug;
window.criarHash = criarHash;
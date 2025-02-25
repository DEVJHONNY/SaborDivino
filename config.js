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
    DEBUG: true // Adicionar modo debug para ajudar na identificação de erros
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

// Exportar para uso global
window.CONFIG = CONFIG;
window.debug = debug;

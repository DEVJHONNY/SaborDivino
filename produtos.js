// Definir objeto global de produtos
window.produtos = {
    trufas: [
        { id: 1, nome: 'Trufa de Brigadeiro', preco: 4.50, estoque: 0 },
        { id: 2, nome: 'Trufa de Ninho', preco: 4.50, estoque: 0 },
        { id: 3, nome: 'Trufa de Ovomaltine', preco: 4.50, estoque: 0 },
        { id: 4, nome: 'Trufa de Coco', preco: 4.50, estoque: 2 },
        { id: 5, nome: 'Trufa de Amendoim', preco: 4.50, estoque: 4 },
        { id: 6, nome: 'Trufa de Ferreiro', preco: 4.50, estoque: 3 },
        { id: 7, nome: 'Trufa de Castanha', preco: 4.50, estoque: 3 }
    ],
    mousses: [
        { id: 9, nome: 'Mousse de Limão', preco: 3.50, estoque: 3 },
        { id: 10, nome: 'Mousse de Maracujá', preco: 3.50, estoque: 3 }
    ],
    empadas: [
        { id: 11, nome: 'Empada de Frango', preco: 4.50, estoque: 0 },
        { id: 12, nome: 'Empada de Calabresa', preco: 4.50, estoque: 0 }
    ]
};

// Carregar dados salvos imediatamente
(function() {
    try {
        const savedData = localStorage.getItem('estoqueProdutos');
        if (savedData) {
            Object.assign(window.produtos, JSON.parse(savedData));
            console.log('Dados de produtos carregados com sucesso');
        }
    } catch (error) {
        console.error('Erro ao carregar dados dos produtos:', error);
    }
})();

// Confirmar que produtos foi definido
console.log('Módulo produtos carregado:', !!window.produtos);

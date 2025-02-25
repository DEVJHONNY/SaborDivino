const TicketController = {
    getNumeroTicket() {
        const dataAtual = new Date().toISOString().split('T')[0];
        const tickets = JSON.parse(localStorage.getItem('tickets') || '{}');
        
        // Resetar contagem se for um novo dia
        if (!tickets[dataAtual]) {
            tickets[dataAtual] = 0;
        }
        
        // Incrementar número do ticket
        tickets[dataAtual]++;
        localStorage.setItem('tickets', JSON.stringify(tickets));
        
        return `${dataAtual.replace(/-/g, '')}#${String(tickets[dataAtual]).padStart(3, '0')}`;
    },

    salvarTicket(ticket, dados) {
        const historico = JSON.parse(localStorage.getItem('historico_tickets') || '[]');
        const dadosTicket = {
            numero: ticket.numero,
            data: new Date().toISOString(),
            ip: ticket.ip,
            dados: dados,
            status: 'pendente'
        };
        
        historico.push(dadosTicket);
        localStorage.setItem('historico_tickets', JSON.stringify(historico));
    },

    async getClienteIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Erro ao obter IP:', error);
            return 'IP não identificado';
        }
    }
};

window.TicketController = TicketController;

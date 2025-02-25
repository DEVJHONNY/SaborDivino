// Analytics configuration
function initAnalytics() {
    try {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'UA-XXXXX-Y');
    } catch (error) {
        console.warn('Analytics não carregado:', error);
    }
}

// Initialize when ready
document.addEventListener('DOMContentLoaded', initAnalytics);

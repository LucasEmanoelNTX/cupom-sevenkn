// Configurações da aplicação
module.exports = {
    // URL do feed RSS a ser monitorado
    RSS_URL: 'https://www.prydwen.gg/seven-knights-rebirth/news/rss/',
    
    // URL do webhook do Discord
    WEBHOOK_URL: 'https://discord.com/api/webhooks/1431298007185227836/PTy5kzQOL45X9IZWNcfrbHVtQgWkG2IuRlm-HrZ9bGMAXu7tSnwuGG3IQLH_aPyuIMuw',
    
    // Intervalo de verificação em minutos
    CHECK_INTERVAL: 30,
    
    // Formato da mensagem
    MESSAGE_FORMAT: '🎁 Novo Cupom Seven Knights Re:Birth! 📰 {{title}} 🔗 {{link}}',
    
    // Arquivo para armazenar itens processados
    STORAGE_FILE: 'processed_items.json'
};
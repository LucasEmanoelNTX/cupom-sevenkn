const Parser = require('rss-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Carregar configurações de variáveis de ambiente ou arquivo config.js
const RSS_URL = process.env.RSS_URL || require('./config').RSS_URL;
const WEBHOOK_URL = process.env.WEBHOOK_URL || require('./config').WEBHOOK_URL;
const CHECK_INTERVAL = process.env.CHECK_INTERVAL || require('./config').CHECK_INTERVAL;
const MESSAGE_FORMAT = process.env.MESSAGE_FORMAT || require('./config').MESSAGE_FORMAT;
const STORAGE_FILE = path.join(__dirname, process.env.STORAGE_FILE || require('./config').STORAGE_FILE);

// Inicializar o parser RSS
const parser = new Parser();

// Função para carregar itens já processados
function loadProcessedItems() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Erro ao carregar itens processados:', error);
  }
  return { processedGuids: [] };
}

// Função para salvar itens processados
function saveProcessedItems(processedItems) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(processedItems, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar itens processados:', error);
  }
}

// Função para enviar mensagem para o Discord
async function sendToDiscord(title, link) {
  try {
    const message = MESSAGE_FORMAT
      .replace('{{title}}', title)
      .replace('{{link}}', link);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: message
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar para Discord: ${response.statusText}`);
    }

    console.log(`Mensagem enviada com sucesso: "${title}"`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar para Discord:', error);
    return false;
  }
}

// Função principal para verificar o feed RSS
async function checkRssFeed() {
  console.log(`Verificando feed RSS em ${new Date().toLocaleString()}...`);
  
  try {
    // Carregar itens já processados
    const processedItems = loadProcessedItems();
    
    // Buscar o feed RSS
    const feed = await parser.parseURL(RSS_URL);
    
    // Verificar se há novos itens
    let newItemsFound = false;
    
    for (const item of feed.items) {
      // Verificar se o item já foi processado
      if (!processedItems.processedGuids.includes(item.guid)) {
        console.log(`Novo item encontrado: ${item.title}`);
        
        // Enviar para o Discord
        const success = await sendToDiscord(item.title, item.link);
        
        if (success) {
          // Adicionar à lista de processados
          processedItems.processedGuids.push(item.guid);
          newItemsFound = true;
        }
      }
    }
    
    // Salvar itens processados se houver novos
    if (newItemsFound) {
      saveProcessedItems(processedItems);
    }
    
    console.log('Verificação concluída.');
  } catch (error) {
    console.error('Erro ao verificar feed RSS:', error);
  }
}

// Executar imediatamente na inicialização
console.log('Iniciando monitoramento do feed RSS...');
checkRssFeed();

// Agendar verificação com base no intervalo configurado
cron.schedule(`*/${CHECK_INTERVAL} * * * *`, checkRssFeed);

console.log(`Automação iniciada! Verificando feed RSS a cada ${CHECK_INTERVAL} minutos.`);
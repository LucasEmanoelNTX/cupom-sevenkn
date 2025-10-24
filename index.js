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
const SOURCE_PROVIDER = process.env.SOURCE_PROVIDER || 'rss';
const COUPONS_JSON_URL = process.env.COUPONS_JSON_URL || '';

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
    const processedItems = loadProcessedItems();
    const feed = await parser.parseURL(RSS_URL);
    let newItemsFound = false;
    
    for (const item of feed.items) {
      const id = item.guid || item.link || item.title;
      if (!processedItems.processedGuids.includes(id)) {
        console.log(`Novo item encontrado: ${item.title}`);
        const success = await sendToDiscord(item.title, item.link);
        if (success) {
          processedItems.processedGuids.push(id);
          newItemsFound = true;
        }
      }
    }
    
    if (newItemsFound) {
      saveProcessedItems(processedItems);
    }
    
    console.log('Verificação concluída.');
  } catch (error) {
    console.error('Erro ao verificar feed RSS:', error);
  }
}

// Nova função: verificar cupons via JSON remoto (ex.: arquivo no GitHub/Gist)
async function checkJsonSource() {
  console.log(`Verificando fonte JSON em ${new Date().toLocaleString()}...`);
  if (!COUPONS_JSON_URL) {
    console.error('COUPONS_JSON_URL não configurada. Defina a URL para um JSON público com cupons.');
    return;
  }
  try {
    const processedItems = loadProcessedItems();
    const resp = await fetch(COUPONS_JSON_URL);
    if (!resp.ok) {
      throw new Error(`Falha ao baixar JSON: ${resp.status} ${resp.statusText}`);
    }
    const items = await resp.json();
    if (!Array.isArray(items)) {
      throw new Error('Formato inválido: esperado um array de cupons.');
    }

    let newItemsFound = false;
    for (const item of items) {
      const id = item.id || item.code || item.link || item.title;
      const title = item.title || item.code || 'Cupom';
      const link = item.link || item.url || '';
      if (!processedItems.processedGuids.includes(id)) {
        console.log(`Novo cupom encontrado: ${title}`);
        const success = await sendToDiscord(title, link);
        if (success) {
          processedItems.processedGuids.push(id);
          newItemsFound = true;
        }
      }
    }

    if (newItemsFound) {
      saveProcessedItems(processedItems);
    }

    console.log('Verificação JSON concluída.');
  } catch (error) {
    console.error('Erro ao verificar fonte JSON:', error);
  }
}

// Executar imediatamente na inicialização
if (SOURCE_PROVIDER === 'json') {
  console.log('Iniciando monitoramento de cupons via JSON...');
  checkJsonSource();
  cron.schedule(`*/${CHECK_INTERVAL} * * * *`, checkJsonSource);
  console.log(`Automação iniciada! Verificando JSON a cada ${CHECK_INTERVAL} minutos.`);
} else {
  console.log('Iniciando monitoramento do feed RSS...');
  checkRssFeed();
  cron.schedule(`*/${CHECK_INTERVAL} * * * *`, checkRssFeed);
  console.log(`Automação iniciada! Verificando feed RSS a cada ${CHECK_INTERVAL} minutos.`);
}
# Automação de Cupons Seven Knights Re:Birth para Discord

Este projeto monitora o feed RSS do site Prydwen.gg para novos cupons do jogo Seven Knights Re:Birth e os envia automaticamente para um canal do Discord através de webhook.

## Funcionalidades

- Monitoramento automático do feed RSS do Prydwen.gg
- Envio de notificações para o Discord quando novos cupons são encontrados
- Armazenamento de itens já processados para evitar duplicações
- Verificação periódica a cada 30 minutos (configurável)
- Execução em serviço na nuvem (Railway) 24/7 sem necessidade de computador ligado

## Requisitos

- Node.js (versão 12 ou superior)
- PNPM (gerenciador de pacotes alternativo ao NPM)
- Conta no Railway (para hospedagem na nuvem)
- Conta no GitHub (opcional, para deploy via GitHub)

## Instalação Local

1. Clone este repositório ou baixe os arquivos
2. Navegue até a pasta do projeto
3. Instale as dependências:

```bash
pnpm install
```

## Configuração

As configurações podem ser definidas de duas formas:

### 1. Arquivo config.js (desenvolvimento local)

- `RSS_URL`: URL do feed RSS a ser monitorado
- `WEBHOOK_URL`: URL do webhook do Discord
- `CHECK_INTERVAL`: Intervalo de verificação em minutos
- `MESSAGE_FORMAT`: Formato da mensagem enviada ao Discord
- `STORAGE_FILE`: Arquivo para armazenar itens já processados

### 2. Variáveis de Ambiente (Railway)

Configure as seguintes variáveis de ambiente no Railway:

- `RSS_URL`: URL do feed RSS a ser monitorado
- `WEBHOOK_URL`: URL do webhook do Discord
- `CHECK_INTERVAL`: Intervalo de verificação em minutos
- `MESSAGE_FORMAT`: Formato da mensagem enviada ao Discord
- `STORAGE_FILE`: Nome do arquivo para armazenar itens processados

## Uso

### Execução Local

Para iniciar a automação localmente:

```bash
pnpm start
```

### Deploy no Railway (Recomendado)

O Railway é um serviço de hospedagem na nuvem que permite executar o bot 24/7 sem precisar manter seu computador ligado.

1. Crie uma conta no [Railway](https://railway.app/)
2. Instale a CLI do Railway (opcional):
   ```bash
   npm i -g @railway/cli
   ```
3. Faça login:
   ```bash
   railway login
   ```
4. Crie um novo projeto:
   ```bash
   railway init
   ```
5. Configure as variáveis de ambiente no dashboard do Railway:
   - `RSS_URL`
   - `WEBHOOK_URL`
   - `CHECK_INTERVAL`
   - `MESSAGE_FORMAT`
   - `STORAGE_FILE`
6. Deploy do projeto:
   ```bash
   railway up
   ```

Alternativamente, você pode conectar seu repositório GitHub ao Railway para deploy automático.

## Formato da Mensagem

As mensagens enviadas para o Discord seguem o formato configurado:

```
🎁 Novo Cupom Seven Knights Re:Birth! 📰 [Título do Item] 🔗 [Link do Item]
```

## Manutenção

O arquivo de armazenamento guarda os IDs dos itens já processados. No Railway, este arquivo é persistido entre reinicializações do serviço.
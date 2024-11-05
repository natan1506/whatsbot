// src/client.ts
import { create, Whatsapp, Message } from 'venom-bot';
import qrcode from 'qrcode';
import { broadcast } from './ws/websocket';
import fs from 'fs';
import path from 'path';

export let client: Whatsapp | null = null;
export let isClientReady = false;
export let chatList: [] = [];
let qrCodeUrl: string | null = null;

// Função para limpar a sessão
function clearSession() {
  const sessionPath = path.resolve(__dirname, '..', `.tokens`);
  if (fs.existsSync(sessionPath)) {
    fs.rm(sessionPath, { recursive: true, force: true }, (err) => {
      if (err) {
        console.error('Erro ao remover diretório:', err);
        return;
      }
      console.log('Diretório removido com sucesso.');
    });
  }
}

// Inicia o cliente do Venom-Bot
export async function initializeClient() {
  // clearSession()
  create(
    'session', // Nome da sessão para armazenar as credenciais
    (base64Qr, asciiQR) => {
      console.log('QR Code recebido:');
      qrCodeUrl = base64Qr;
      broadcast({ type: 'qrCode', qrCodeUrl }); // Envia o QR code via WebSocket
    },
    (statusSession) => {
      console.log('Status da sessão:', statusSession);
    },
    {
      multidevice: true, // Habilitar o modo multi-dispositivo
    }
  ).then((client) => {
    client = client;
    isClientReady = true
    setupMessageHandler(client);
    broadcast({ type: 'ready' });
    console.log('Venom Client pronto!');
  }).catch((error) => {
    console.error('Erro ao iniciar o Venom Client:', error);
  });
}
// Função para tratar mensagens recebidas
function setupMessageHandler(client: Whatsapp) {
  client.onMessage((message: Message) => {
    if (message.body === 'Oi') {
      client.sendText(message.from, 'Olá! Como posso ajudar?');
    }
    // Adicione mais casos de resposta aqui
  });
}


// export async function initializeClientOld() {
//   clearSession(); // Limpa a sessão antiga antes de inicializar
//   client = new Client({
//     authStrategy: new LocalAuth({
//       clientId: "client-one" // Mantém uma sessão persistente
//     })
//   });

//   generateQr()

//   client.on('loading_screen', (percent, message) => {
//     console.log(`Carregando ${percent}% - ${message}`);
//     broadcast({ type: 'loading', message: `Carregando ${percent}% - ${message}` });
//   });

//   client.on('ready', async () => {
//     isClientReady = true;
//     console.log('Client is ready!');
//     // broadcast({ type: 'ready', chatList });
//     broadcast({ type: 'ready' });
//     try {
//       const chats = await client.getChats();
//       const recentChats = chats.slice(0, 10);  // Limitar para os 10 chats mais recentes
//       console.log('Conversas recentes:', recentChats);
//     } catch (error) {
//       console.error('Erro ao buscar chats:', error);
//     }
//   });

//   client.on('authenticated', () => {
//     broadcast({ type: 'auth', code: 200 });
//     console.log('Authenticated!');
//   });

//   client.on('auth_failure', msg => {
//     console.error('Auth failure', msg);
//   });

//   client.initialize();
// }

export async function logoutClient() {
  if (client) {
    console.log('tem client', __dirname)
    await client.logout();  // Logout do cliente
    console.log('Cliente WhatsApp deslogado.');

    // Caminho onde a sessão é armazenada
    const sessionPath = path.resolve(__dirname, '..', `.wwebjs_auth/session-client-one`);
    console.log(sessionPath)
    // Verifique se o diretório existe e o remova
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
      console.log('Sessão removida com sucesso.');
    }
  }
}

export function waitForQRCode() {
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (qrCodeUrl) {
        clearInterval(checkInterval);
        resolve(qrCodeUrl);
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Timeout esperando QR Code.'));
    }, 30000);
  });
}

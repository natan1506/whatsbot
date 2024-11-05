// src/client.ts
import { Client, LocalAuth, Chat } from 'whatsapp-web.js';
import qrcode from 'qrcode';
// import qrcode from 'qrcode-terminal';
import { broadcast } from './ws/websocket';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export let client: Client;
export let isClientReady = false;
export let chatList: Chat[] = [];
let qrCodeUrl: string | null = null;

// Função para limpar a sessão
function clearSession() {
  const sessionPath = path.join(__dirname, './.wwebjs_auth/');
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

export function generateQr() {
  console.log('iniciou qr')
  client.on('qr', (qr) => {
    console.log('QR Code recebido:');
    // qrcode.generate(qr, { small: true }, (qrcode) => {
    //   qrCodeUrl = qrcode;
    //   // Verifique se o QR code foi gerado corretamente antes de enviar
    //   if (qrCodeUrl) {
    //     console.log('Enviando QR Code aos clientes conectados via WebSocket');
    //     broadcast({ type: 'qrCode', qrCodeUrl }); // Envia o QR code para os clientes conectados
    //   } else {
    //     console.error('QR Code não foi gerado corretamente');
    //   }
    //   console.log(qrcode)

    // });
    qrcode.toDataURL(qr, (err, url) => {
      if (err) {
        console.error('Erro ao gerar QR Code:', err);
        return;
      }
      qrCodeUrl = url;
      // Verifique se o QR code foi gerado corretamente antes de enviar
      if (qrCodeUrl) {
        console.log('Enviando QR Code aos clientes conectados via WebSocket');
        broadcast({ type: 'qrCode', qrCodeUrl }); // Envia o QR code para os clientes conectados
      } else {
        console.error('QR Code não foi gerado corretamente');
      }
    });
  });
}

export async function initializeClient() {
  // const userSessionId = uuidv4();
  const userSessionId = 'sessionAll'
  // clearSession(); // Limpa a sessão antiga antes de inicializar
  client = new Client({
    authStrategy: new LocalAuth({
      clientId: userSessionId, // Mantém uma sessão persistente
      dataPath: path.join(__dirname, './.wwebjs_auth/')
    })
  });

  generateQr()

  client.on('loading_screen', (percent, message) => {
    console.log(`Carregando ${percent}% - ${message}`);
    broadcast({ type: 'loading', message: `Carregando ${percent}% - ${message}` });
  });

  client.on('ready', async () => {
    isClientReady = true;
    console.log('Client is ready!');
    // broadcast({ type: 'ready', chatList });
    broadcast({ type: 'ready' });
    try {
      // const chats = await client.getChats();

      // const recentChats = chats.slice(0, 10);  // Limitar para os 10 chats mais recentes
      // console.log('Conversas recentes:', recentChats);
    } catch (error) {
      console.error('Erro ao buscar chats:', error);
    }
  });

  client.on('authenticated', (session) => {
    broadcast({ type: 'auth', code: 200 });
    console.log('Authenticated!', session);
  });

  client.on('auth_failure', msg => {
    console.error('Auth failure', msg);
    // Forçar remoção da sessão e reiniciar o cliente
    client.logout().then(() => {
      initializeClient(); // Reiniciar a inicialização do cliente
    });
  });


  client.on('message',  async (message) => {
    console.log(`Mensagem recebida de ${message.from}: ${message.body}`);

    broadcast({ type: 'newMessage', data: message });
  })  

  client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    client.initialize(); // Re-inicializa o cliente
  });

  client.initialize();
}

export async function restartClient() {
  await client.destroy();
  initializeClient(); // Função que inicializa o cliente
}

export async function logoutClient() {
  if (client) {
    console.log('tem client', __dirname)
    await client.logout();  // Logout do cliente
    console.log('Cliente WhatsApp deslogado.');

    // Caminho onde a sessão é armazenada
    const sessionPath = path.join(__dirname, './.wwebjs_auth/');
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
    }, 60000);
  });
}

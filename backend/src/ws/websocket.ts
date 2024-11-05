// src/ws/websocket.ts
import WebSocket from 'ws';
import { generateQr } from '../client';

export const wss = new WebSocket.Server({ noServer: true });

// Função para broadcast de mensagens para todos os clientes conectados
export function broadcast(data:any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}
wss.on('connection', async (ws) => {
  console.log('Novo cliente WebSocket conectado');
  generateQr()
  ws.on('message', (message) => {
    console.log('Mensagem recebida do cliente:', message);
  });

  // Envia uma mensagem ao cliente indicando que a conexão foi estabelecida
  ws.send(JSON.stringify({ type: 'connection', message: 'WebSocket conectado com sucesso' }));
});
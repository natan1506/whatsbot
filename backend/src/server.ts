// src/server.ts
import { app } from './app';
import { env } from './env';
import { whatsappRoutes } from './routes/whatsapp';
import { wss } from './ws/websocket';
import { initializeClient } from './client';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import WebSocket from 'ws';
import path from 'path';
import fastifyStatic from '@fastify/static';

// Configurar CORSd
app.register(fastifyCors, {
  origin: '*',
});

// Registrar o plugin para lidar com multipart/form-data
app.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de 10 MB
  },
});

// Servir a pasta de uploads para acessar as imagens salvas (caso necessário)
app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'temp'),
  prefix: '/temp/', 
});

// Registrar rotas
whatsappRoutes(app);

// Inicializar o cliente WhatsApp
console.log('Entrando no Initialize')
initializeClient();

// Configuração do WebSocket
app.server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
    wss.emit('connection', ws, request);
  });
});

// Iniciar servidor
app.listen({
  host: '0.0.0.0',
  port: env.PORT,
}).then(() => {
  console.log(`🚀 Server Running! PORT: ${env.PORT}`);
});

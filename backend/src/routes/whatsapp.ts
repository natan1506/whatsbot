// src/routes/whatsapp.ts
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { client, isClientReady, logoutClient, waitForQRCode, initializeClient,  } from '../client';
import { MessageMedia } from 'whatsapp-web.js';

import fs from 'fs';
import path from 'path';
import multer from 'fastify-multer';

interface SendInterface {
  chatId: string,
  message: string 
}

interface SendWhitImage extends SendInterface {
  image: File
}

async function verifySession() {
  if (!isClientReady && client.pupPage && client.pupPage.isClosed()) {
    await client.destroy();
    initializeClient();
  }
}


// Configurando o caminho absoluto para a pasta src/temp
const tempDir = path.join(process.cwd(), 'src', 'temp');

// Cria o diretório 'temp' se ele não existir
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configuração de armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Função para excluir arquivo com verificação
function deleteFileIfExists(filePath: string) {
  console.log('aqui',filePath)
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      }
    });
  } else {
    console.log('File not found, skipping deletion.');
  }
}


export async function whatsappRoutes(app: FastifyInstance) {
  // Rota para obter o status do WhatsApp
  app.get('/api/whatsapp/status', async (req: FastifyRequest, res: FastifyReply) => {
    console.log('Status', isClientReady)
    try {
      if (!isClientReady) {
        const qr = await waitForQRCode();
        return res.code(200).send({ qr });
      }else {
        initializeClient()
      }
      return res.code(200).send({ type:'ready', message: 'Client is ready!' });
    } catch (err) {
      console.error('Erro ao buscar detalhes do usuario:', err);
      return { err, status: 400 };
    }
  });

  // Rota para obter a lista de conversas
  app.get('/api/whatsapp/chats', {
    preHandler: async (request, reply) => {
     verifySession()
    }
  },async (request: FastifyRequest, reply: FastifyReply) => {
    console.log('chegou nos chats')
    if (!isClientReady) {
      return reply.status(503).send({ message: 'Client not ready. Please try again later.' });
    }
    try {
      console.log('entrou no trysdw')
      const chats = await client.getChats();
      console.log('pegou as conversas!')
      // const imageCache = {};

      // const chatListWithImages = await Promise.all(
      //   chats.map(async (chat) => {
      //     let profilePicUrl = imageCache[chat.id._serialized];

      //     // Caso a URL não esteja no cache, busca e armazena no cache
      //     if (!profilePicUrl) {
      //       try {
      //         profilePicUrl = await client.getProfilePicUrl(chat.id._serialized);
      //         imageCache[chat.id._serialized] = profilePicUrl;
      //       } catch (error) {
      //         console.warn(`Não foi possível obter a imagem para ${chat.name || chat.id.user}`);
      //       }
      //     }

      //     return {
      //       id: chat.id._serialized,
      //       name: chat.name || chat.id.user,
      //       isGroup: chat.isGroup,
      //       unreadCount: chat.unreadCount,
      //       profilePicUrl,
      //     };
      //   })
      // );

      // Filtrar a lista de chats
      // const chatList = chats.map(chat => ({
      //   id: chat.id._serialized,
      //   name: chat.name,
      //   isGroup: chat.isGroup,
      //   unreadCount: chat.unreadCount,
      // }));

      return reply.status(200).send(chats);
    } catch (err) {
      console.error('Erro ao buscar chats:', err);
      return reply.status(500).send({ message: 'Erro ao buscar chats.', error: err });
    }
  });

  // Rota para enviar mensagens
  app.post('/api/whatsapp/send',{
    preHandler: async (request, reply) => {
     verifySession()
    }
  }, async (req: FastifyRequest<{ Body: SendInterface }>, res: FastifyReply) => {
    console.log('Initial send message!')
    const { chatId, message } = req.body;
    if (!isClientReady) {
      return res.code(400).send({ error: 'Client not ready' });
    }

    try {
      const chat = await client.getChatById(chatId);
      await chat.sendMessage(message);
      res.code(200).send({ message: `Mensagem enviada para ${chatId}` });
    } catch (err) {
      res.code(500).send({ error: `Erro ao enviar mensagem: ${err}` });
    }
  });

  // Rota para upload de imagem com strings adicionais e exclusão da imagem
  // app.post('/api/whatsapp/send-image', { preHandler: upload.single('image') }, async (req: FastifyRequest, res: FastifyReply) => {
  //   console.log('Initial Image');
    
  //   if (!req.file) {
  //     return res.code(400).send({ message: 'No file uploaded.' });
  //   }

  //   // Extrair dados de `req.body`
  //   const { chatId, message: messageFromFront } = req.body;
  //   // Debug: Log os valores recebidos
  //   console.log('body:',  req.body, req);
  //   console.log('chatId:', chatId);
  //   console.log('message:', messageFromFront);
    
  //   if (!chatId || !messageFromFront) {
  //     return res.code(400).send({ message: 'chatId and message are required.' });
  //   }
    
  //   const filePath = path.join(tempDir, req.file.filename);
  //   console.log('File Path:', filePath);

  //   try {
  //     const media = MessageMedia.fromFilePath(filePath);
  //     console.log('Criou o media');

  //     // Envia a mensagem para o chat com a imagem
  //     await client.sendMessage(chatId, media, { caption: messageFromFront });
  //     console.log('Enviou a mensagem');

  //     // Excluir o arquivo de imagem após o envio
  //     setTimeout(() => deleteFileIfExists(filePath), 100);

  //     res.send({ message: 'Imagem enviada e excluída com sucesso', chatId, messageFromFront });
  //   } catch (err) {
  //     app.log.error('Error sending or deleting file:', err);
  //     res.code(500).send({ message: 'Error sending or deleting file', error: err });
  //   }
  // });

  app.post('/api/whatsapp/send-image', {
    preHandler: async (request, reply) => {
     verifySession()
    }
  }, async (req: FastifyRequest, res: FastifyReply) => {
    const data = await req.file(); // Recebe a imagem diretamente

    const { chatId, message } = data.fields; // Mensagem e chatId do formulário
  
    if (!data || !chatId) {
      return res.code(400).send({ error: 'Imagem ou chatId ausente' });
    }
  
    try {
      // Converte a imagem em buffer
      const imageBuffer = await data.toBuffer();
      const media = new MessageMedia(data.mimetype, imageBuffer.toString('base64'), data.filename);
      // Envia a imagem e a mensagem diretamente
      await client.sendMessage(chatId.value, media, { caption: message.value });
  
      res.code(200).send({ message: 'Imagem enviada com sucesso' });
    } catch (error) {
      console.error('Erro ao enviar a mensagem:', error.message);
      res.code(500).send({ error: error.message  });
    }
  });

  // Rota para buscar um chat completo
  app.get('/api/whatsapp/chat/:chatId',{
    preHandler: async (request, reply) => {
     verifySession()
    }
  }, async (req: FastifyRequest, res: FastifyReply) => {
    const chatId = req.params.chatId;

    try {
      const chat = await client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 100 });
        // Retorna as mensagens para o front-end
        res.send(messages)
      // res.send({
      //   messages: messages.map(msg => ({
      //       id: msg.id.id,
      //       from: msg.from,
      //       body: msg.body,
      //       timestamp: msg.timestamp,
      //   })),
      // });

      res.send({
        messages: messages.map(async (msg) => {
          if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            return {
              id: msg.id._serialized,
              body: msg.body,
              from: msg.from,
              timestamp: msg.timestamp,
              type: media.mimetype, // Tipo da mídia
              mediaData: media.data, // Conteúdo da mídia em base64
              isPtt: msg.type === 'ptt', // Verifica se é uma mensagem de áudio push-to-talk
            };
          } else {
            return {
              id: msg.id._serialized,
              body: msg.body,
              from: msg.from,
              timestamp: msg.timestamp,
            };
          })
      });
    } catch (error) {
        console.error('Erro ao buscar chat:', error.message);
        res.code(500).send({ error: 'Erro ao buscar o chat.' });
    }
  });

  // Rota para logout
  app.get('/api/whatsapp/logout',{
    preHandler: async (request, reply) => {
     verifySession()
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log('initial Logout')
      await logoutClient(); // Chama a função de logout
      return reply.code(200).send({ message: 'Logout efetuado com sucesso' });
    } catch (error) {
      console.error('Erro ao efetuar logout:', error);
      return reply.code(500).send({ message: 'Erro ao efetuar logout', error });
    }
  });
}

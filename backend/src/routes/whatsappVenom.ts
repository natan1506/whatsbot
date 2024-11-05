// src/routes/whatsapp.ts
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { client, isClientReady, logoutClient, waitForQRCode, initializeClient,  } from '../clientVenom';
import { MessageMedia } from 'whatsapp-web.js';

import fs from 'fs';
import path from 'path';

interface SendInterface {
  chatId: string,
   message: string 
}

interface SendWhitImage extends SendInterface {
  image: File
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
  app.get('/api/whatsapp/chats', async (request: FastifyRequest, res: FastifyReply) => {
    console.log('chegou nos chats')
    if (!isClientReady) {
      return res.status(503).send({ message: 'Client not ready. Please try again later.' });
    }
    try {
      console.log('entrou no trysdw')
      console.log('pegou as conversas')
      const chats = await client.getAllChats();
      res.send(chats);
      // const chatList = await Promise.all(
      //   chats.map(async (chat) => {
      //     let profilePicUrl = '';
      //     try {
      //       profilePicUrl = await client.getProfilePicUrl(chat.id._serialized); // Obtém a URL da imagem de perfil
      //       console.log('pegou a imagem')
      //     } catch (err) {
      //       console.error(`Erro ao obter a imagem do chat ${chat.name}:`, err);
      //     }
  
      //     return {
      //       id: chat.id._serialized,
      //       name: chat.name,
      //       isGroup: chat.isGroup,
      //       unreadCount: chat.unreadCount,
      //       imgUrl: profilePicUrl // Inclui a URL da imagem de perfil
      //     };
      //   })
      // )

      // Filtrar a lista de chats
      // const chatList = chats.map(chat => ({
      //   id: chat.id._serialized,
      //   name: chat.name,
      //   isGroup: chat.isGroup,
      //   unreadCount: chat.unreadCount,
      // }));

      return res.send(chats);
    } catch (err) {
      console.error('Erro ao buscar chats:', err);
      return res.status(500).send({ message: 'Erro ao buscar chats.', error: err });
    }
  });

  // Rota para enviar mensagens
  app.post('/api/whatsapp/send', async (req: FastifyRequest<{ Body: SendInterface }>, res: FastifyReply) => {
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

  // Endpoint para receber a imagem e o texto do front-end
  app.post('/api/whatsapp/send-image', async (req: FastifyRequest<{ Body: SendWhitImage  }>, res: FastifyReply) => {
    const data = await req.file(); // Usa Fastify's multipart plugin para pegar o arquivo
    const { message, chatId } = req.body; // Texto enviado pelo front-end
    console.log(data, message)
    if (!data || !message) {
      return res.code(400).send({ message: 'Imagem ou texto não enviados' });
    }

    // Salva a imagem recebida em um diretório temporário
    const imagePath = path.join(__dirname, 'uploads', data.filename);
    await data.toBuffer();
    fs.writeFileSync(imagePath, await data.toBuffer());

    try {
      // Cria o objeto MessageMedia para a imagem
      const media = MessageMedia.fromFilePath(imagePath);

      // Envia a mensagem com a imagem e o texto
      await client.sendMessage(chatId, media, { caption: message });

      // Deleta a imagem temporária após o envio
      fs.unlinkSync(imagePath);

      res.code(200).send({ message: 'Imagem enviada com sucesso!' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.code(500).send({ message: 'Erro ao enviar imagem', error });
    }
  });

  // Rota para buscar um chat completo
  app.get('/api/whatsapp/chat/:chatId', async (req: FastifyRequest, res: FastifyReply) => {
    const chatId = req.params.chatId;

    try {
      const chat = await client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 100 });

        // Retorna as mensagens para o front-end
      res.send({
        messages: messages.map(msg => ({
            id: msg.id.id,
            from: msg.from,
            body: msg.body,
            timestamp: msg.timestamp,
        })),
      });
    } catch (error) {
        console.error('Erro ao buscar chat:', error.message);
        res.code(500).send({ error: 'Erro ao buscar o chat.' });
    }
  });

  // Rota para logout
  app.get('/api/whatsapp/logout', async (request: FastifyRequest, reply: FastifyReply) => {
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

import { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchChats, fetchStatus } from './api';
import { QrCode } from './pages/Qrcode';
import { Loader2 } from 'lucide-react';
import { RouterProvider } from 'react-router-dom';
import { router } from "./router"

function App() {
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState('');
  const [messageLoading, setMessageLoading] = useState('');
  const [chatsList, setChatsList] = useState([]);
   
  const [isReady, setIsReady] = useState(true);

  // Função para buscar o status e QR Code


  // Função para enviar mensagem
  const sendMessage = async () => {
    try {
      const res = await axios.post('http://localhost:3001/api/whatsapp/send', {
        chatId,
        message,
      });
      alert(res.data.message);
    } catch (error) {
      alert('Erro ao enviar mensagem: ' + error.response.data.error);
    }
  };

  // useEffect(() => {
  //   async function consult() {
  //     const response = await fetchStatus();
  //     console.log(response)
  //     setQrCode(response.qr)
  //     setMessage(response.message)

  //     if(response.type === 'ready' && chatsList.length === 0) {
  //       const responseChats = await fetchChats();
  //       setChatsList(responseChats)
  //     }
  //   }
  //   consult()
  // }, []);

  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:3333');

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     if (data.type === 'qr') {
  //       console.log(data)
  //         setQrCode(data.qr); // Armazena o QR code para ser exibido
  //     } else if (data.type === 'ready') {
  //         console.log(data); 
  //         setIsReady(true); // Indica que o cliente está pronto
  //     }
  //     if (data.type === 'chatlists') {
  //       console.log(data); 
  //       setChatsList(data.chatList)
  //     }
  //     if(data.type === 'loading') {
  //       console.log(data); 
  //       setMessageLoading(data.message)
  //     }
  //   };

  //   return () => {
  //       ws.close(); // Fecha a conexão quando o componente é desmontado
  //   };
  // }, []);

  // if(!isReady && messageLoading) {
  //   return (
  //     <div className='flex flex-col w-screen h-screen items-center justify-center gap-2'>
  //       <Loader2 className='animate-spin'/>
  //       <span>{messageLoading}</span>
  //     </div>
  //   )
  // }

  return (
    <div className='w-full h-screen'>
      <RouterProvider router={router} />
      {/* {qrCode && !isReady && (
        <QrCode qrCode={qrCode} />
      )}
      {isReady && (
        <PageChats chats={chatsList}/>
      )} */}
    </div>
  );
}

export default App;

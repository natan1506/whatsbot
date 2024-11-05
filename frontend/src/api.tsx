import axios from "axios";

export const fetchStatus = async () => {
  try {
    const res = await axios.get('http://localhost:3333/api/whatsapp/status');
    console.log(res)
    if(res.data.type === 'ready') {
      return {type: 'ready', message: res.data.message}
    }
    if (res.data.qr) {
      return {qr: res.data.qr, message: 'Escaneie o QR Code com seu WhatsApp.' };
    } else {
      return {qr: '', message: res.data.message };
    }
  } catch (error) {

    return {qr: '', message: error };
  }
};

export const fetchChats = async () => {
  try {
    const res = await axios.get('http://localhost:3333/api/whatsapp/chats');
    console.log(res)
    return res.data
  } catch (error) {

    return {qr: '', message: error };
  }
};


export const fetchChat = async (chatId:string) => {
  try {
    const res = await axios.get(`http://localhost:3333/api/whatsapp/chat/${chatId}`);
    console.log(res)
    return res.data
  } catch (error) {

    return {qr: '', message: error };
  }
};


export const logout = async () => {
  try {
    const res = await axios.get('http://localhost:3333/api/whatsapp/logout');
    console.log(res)
    return res.data
  } catch (error) {

    return {qr: '', message: error };
  }
};


//Função para enviar mensagem
export const sendMessage = async (chatId: string, message: string) => {
  try {
    const res = await axios.post('http://localhost:3333/api/whatsapp/send'
      , {
      chatId,
      message,
    }
  );
    alert(res.data.message);
  } catch (error) {
    alert('Erro ao enviar mensagem: ' + error);
  }
};

//Função para enviar mensagem com imagme
export const sendMessageWithImage = async (FormData: FormData) => {
  try {
    const res = await axios.post('http://localhost:3333/api/whatsapp/send-image', 
      FormData,{
        headers: {
        // Não defina o Content-Type, o Axios irá fazer isso automaticamente
        }
      }
    );
    alert(res.data.message);
  } catch (error) {
    alert('Erro ao enviar mensagem: ' + error);
  }
};
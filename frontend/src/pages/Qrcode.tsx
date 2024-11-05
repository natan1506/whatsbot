import { fetchStatus } from "@/api"
import { useStore } from "@/store"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export function QrCode() {
  const {connection, setDataConnection} = useStore()
  const navigate = useNavigate()
  const [qrCode, setQrCode] = useState()
  const [loading, setLoading] = useState({
    isLoading: false,
    message: ''
  })

  useEffect(() => {
    if(!connection) {
    async function consult() {
      const response = await fetchStatus();
      console.log(response)
      setQrCode(response.qr)
    }
    consult()
    }

    const ws = new WebSocket('ws://localhost:3333');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'qrCode') {
        setQrCode(data.qrCodeUrl); // Armazena o QR code para ser exibido
      } 
      if (data.type === 'loading') {
        setLoading({
          isLoading: true,
          message: data.message
        });
      } 
      if (data.type === 'ready') {
        setDataConnection({ready: true})
        navigate('/chats')
      } 
    };

    return () => {
        ws.close(); // Fecha a conexão quando o componente é desmontado
    };
  }, [])

  return (
    <div className="w-full flex-1 h-full m-auto flex flex-col items-center justify-center gap-2">
      {!loading.isLoading ? (
        <>
          <h1 className="text-3xl text-green-500 animate-bounce">WhatsBot</h1>
          {qrCode ? (
            <>
              <div className="p-2 border rounded-md border-green-400">
                <img src={qrCode} alt="QR Code" className="rounded-md" />
              </div>
              <p>Escaneie o QrCode</p>
            </>
          ) : (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-green-500"/>
            </>
          )}
        </>
      ) : (
        <div className='flex flex-col w-screen h-screen items-center justify-center gap-2 text-green-500'>
          <Loader2 className='animate-spin'/>
          <span>{loading.message}</span>
        </div>
      )}
    </div>
  )
}
import { sendMessage, sendMessageWithImage } from "@/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/store"
import { ChevronLeft, XIcon } from "lucide-react"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Link } from "react-router-dom"

interface ImageProps {
  image: File,
  preview: string
}

export function Messages() {
  const {chatsSelected} = useStore()
  const [image, setImage] = useState<ImageProps | null>(null);
  const [textMessage, setTextMessage] = useState<string>("");

  function handleSendMessages(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(chatsSelected && chatsSelected?.length > 0) {
      chatsSelected.forEach((chat) => {
        console.log(chat)
        const formData = new FormData(e.currentTarget);
        
        formData.append('message', textMessage);
        formData.append('chatId', chat.id);
  
        // Log para verificar os dados
        for (const [key, value] of formData.entries()) {
          console.log(key, value);
        }
    
        if (image && image.image instanceof File) {
          formData.append('image', image.image); // Certifique-se que isso é um objeto File
          sendMessageWithImage(formData); // Envia o FormData com a imagem
        } else {
          sendMessage(chat.id, textMessage); // Envia apenas a mensagem se não houver imagem
        }
      });

    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    if(e.target.files) {
      const file = e.target.files[0]
      setImage({image: file, preview: URL.createObjectURL(file)});
    }
  };
  useEffect(() => {console.log(image)}, [image])

  function handleDeleteImage() {
    setImage(null)
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="px-3 py-4 flex justify-between border-b">
        <div>
          <h1>Boot</h1>
        </div>
        <div>
          <h2 className="text-xl font-thin">Chats Selecionados</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/chats">
              <ChevronLeft className="h-5 w-5"/>
            </Link>
          </Button>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex flex-col px-2 py-3 gap-3 min-w-[20%]">
          {chatsSelected && chatsSelected.map(chat => (
            <div className="flex justify-between border-b py-2" key={chat.id}>
              <span>{chat.name}</span>
              <button className="hover:text-red-500 transition-colors">
                <XIcon className="h-5 w-5"/>
              </button>
            </div>
          ))}
        </div>
        <div className="flex w-full border-l p-3">
          <form onSubmit={handleSendMessages} className="w-full flex flex-col gap-3">
            <Textarea 
              rows={5}
              id="text-message" 
              name="text-message"
              value={textMessage} 
              onChange={(e) => setTextMessage(e.target.value)}
             />
            <div>
              <label 
                htmlFor="image"
                className="cursor-pointer px-3 py-2 border rounded-md w-auto"
              >
                Clique para selecionar a Imagem!
              </label>
              <input type="file" id="image" onChange={handleImageChange} accept="image/*" required className="hidden"/>
            </div>
            {image && (
              <div className="flex pt-2">
                <div className="border p-2 rounded-md relative inline-block">
                  <button 
                    className="absolute top-[-0.7rem] right-[-0.8rem] rounded-full bg-red-700 p-1"
                    onClick={handleDeleteImage}
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                  <img src={image.preview} alt="" className="max-h-64 w-auto max-w-full" />
                  <span className="text-center block break-words whitespace-normal">{image.image.name}</span>
                </div>
              </div>
            
            )}
            <div className="flex justify-end">
              <Button>
                Enviar
              </Button>
            </div>
          </form>
        </div>
      </div>
     
    </div>
  )
}
import { fetchChat, fetchChats, logout } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatsProps, useStore } from "@/store";
import { LogOutIcon, SearchIcon, UserRound } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ListChatsProps {
  id: {
    _serialized: string
    user: string
  },
  name: string,
  lastMessage: {
    body: string 
  },
  imgUrl: string
}

interface MessagesProps {
  chat: string
  messages: MessagesFromChatProps[]
}

interface MessagesFromChatProps {
  body: string  
  from: string
  id: string
}


 
export function Chats () {
  const { setChatsSelected: setChatsForSend } = useStore()
  const navigate = useNavigate()
  const [chats, setChats] = useState([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chatsOrigianl, setChatsOrigianl] = useState([])
   
  const [chatsSelected, setChatsSelected] = useState<ChatsProps[] | []>([])
   
  const [messagesForChatSelected, setMessagesForChatSelected] = useState<MessagesProps>()

  const templateSkeletonList = useMemo(() => {
    const count = 5; // Defina o número X de vezes que deseja renderizar
    return Array.from({ length: count }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    ));
  }, [])

  useEffect(() => {
     console.log('iniciou')
    async function consult() {
      const responseChats = await fetchChats();
      console.log(responseChats)
      setChats(responseChats)
      if(responseChats.message.status === 503) {
         navigate('/')
      }
    }
    consult()

    const ws = new WebSocket('ws://localhost:3333');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'newMessage') {
        console.log(data)
      } 
    };

    return () => {
        ws.close(); // Fecha a conexão quando o componente é desmontado
    };
  }, []);

  useEffect(() => {console.log(chatsSelected)},[chatsSelected])

  async function handleLogout() {
    await logout()
  }

  function handleSelectedChat(e: ChangeEvent<HTMLInputElement>, name: string) {
    const isChecked = e.target.checked
    const value = e.target.value
    if(isChecked){
      setChatsSelected((prevValues: ChatsProps[]) => [...prevValues, {name, id:value}])
    }
    if(!isChecked) {
      const filteredSelected = chatsSelected?.filter((item: ChatsProps) => item.id !== value)
      setChatsSelected(filteredSelected)
    }
  }

  async function handleViewChat(chatId: string) {
    const response = await fetchChat(chatId)
    console.log(response)
    setMessagesForChatSelected({chat: chatId, messages:response.messages})
  }

  function handleChangeViewSendMessage() {
    console.log(chatsSelected)
    setChatsForSend(chatsSelected)
    navigate('/messages')
  }

  function handleFilterContact() {
    const input = document.getElementById("input-contact") as HTMLInputElement
    
    const chatsFiltered = chats.filter((item: ListChatsProps) => item.name.toLowerCase().includes(input?.value?.toLowerCase() || '') || item.id.user.includes(input?.value || ''))
    console.log(chatsFiltered)
    setChatsOrigianl(chats)
    setChats(chatsFiltered)
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="px-3 py-4 flex justify-between border-b">
        <div>
          <h1>Boot</h1>
        </div>
        <div className="flex items-center gap-2">
          {chatsSelected.length > 0 && (
            <Button variant="outline" onClick={handleChangeViewSendMessage}>
              Enviaar
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            <LogOutIcon className="h-5 w-5"/>
          </Button>
        </div>
      </div>
      <div className="flex flex-1">
        {chats.length > 0 && (
          <div className="flex flex-col gap-2 pt-1 overflow-auto h-[calc(100vh-5.5rem)] scrollbar-thumb-muted-foreground scrollbar-track-muted scrollbar-thin scrollbar-thumb-rounded-none min-w-80">
            <div className="p-2 flex gap-2 border-b">
              <Input placeholder="Search Contact" id="input-contact"/>
              <Button variant="outline" onClick={handleFilterContact}>
                <SearchIcon className="w-5 h-5"/>
              </Button>
            </div>
            {chats.map((chat: ListChatsProps) => (
              <div className="flex gap-1 px-2 w-full" key={chat.id._serialized}>
                <input 
                  type="checkbox" 
                  className="" 
                  onChange={(e) => handleSelectedChat(e, chat.name)} 
                  value={chat.id._serialized}
                />
                <div 
                  className="flex-1 group flex items-center space-x-4 border-b hover:bg-green-900 transition-colors p-2 py-2 cursor-pointer"
                  onClick={() =>handleViewChat(chat.id._serialized)}
                >
                  {chat.imgUrl ? (
                    <img src={chat.imgUrl} alt="" className="h-12 w-12 rounded-full" />
                  ) : (
                    <div className="bg-gray-800 p-2 rounded-full group-hover:bg-gray-900">
                      <UserRound className="group-hover:text-green-500"/>
                    </div>
                  )}
                  <div className="space-y-1 flex flex-col">
                    <span className="group-hover:text-green-500  transition-colors">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">{chat.lastMessage?.body.length >= 37 ? `${chat.lastMessage?.body.substring(0,37)}...` : chat.lastMessage?.body}</span>
                    {/* <Skeleton className="h-4 w-[200px]" /> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}    
        {chats.length === 0 && (
            <div className="flex flex-col gap-2 pt-1 h-[calc(100vh-5.5rem)]">
              {templateSkeletonList}
            </div>
          )}
        <div className="border-l w-full pt-2 flex flex-col overflow-auto h-[calc(100vh-5.5rem)] scrollbar-thumb-muted-foreground scrollbar-track-muted scrollbar-thin" id="teste">
          {messagesForChatSelected?.messages && messagesForChatSelected?.chat && messagesForChatSelected.messages.map((mes: MessagesFromChatProps) => (
            <div className="px-2">
              {mes.from === messagesForChatSelected.chat && (
                <div className="w-full flex justify-start py-2">
                  <div key={mes.id} className="bg-gray-800 max-w-[40%] px-2 rounded-md py-2 break-words">
                    {mes.body}
                  </div>
                </div>
              )}

              {mes.from !== messagesForChatSelected.chat && (
                <div className="w-full flex justify-end py-2">
                  <div key={mes.id} className="bg-green-600/60 max-w-[40%] px-2 rounded-md py-2 text-wrap break-words">
                    {mes.body}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
import { create } from 'zustand'

interface ConnectionState {
  ready: false,
}

interface UserState {
  allowed_output_formats: string[]
  created_at: string
  exp_date: string
  status: string
  username: string
  message: string
}


export interface ChatsProps {
  id: string
  name: string
}

interface DataState {
  connection: ConnectionState | null
  dataUser: UserState | null
  chatsSelected: ChatsProps[] | null
  isAuthenticated: boolean
  setDataConnection: (arg0: ConnectionState) => void
  setAuthenticated: (arg0: boolean) => void
  setDataUser: (arg0: UserState) => void
  setChatsSelected: (arg0: ChatsProps[]) => void
}

export const useStore = create<DataState>((set) => ({
  connection: null,
  dataUser: null,
  chatsSelected: null,
  isAuthenticated: false,

  setDataConnection: (dataConnection: ConnectionState) => {
    set({ connection: dataConnection })
  },
  setAuthenticated: (status: boolean) => {
    set({ isAuthenticated: status })
  },
  setDataUser: (dataUser: UserState) => {
    set({ dataUser })
  },
  setChatsSelected: (chatsSelected: ChatsProps[]) => {
    set({ chatsSelected })
  }
}))

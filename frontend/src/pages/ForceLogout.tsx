import { logout } from "@/api"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export function ForceLogout() {
  const navigate = useNavigate()
  useEffect(() => {
    async function forceLogout() {
      await logout().then(() => {
        navigate('/')
      })
    }
    forceLogout()
  }, [])

  return (<></>)
}
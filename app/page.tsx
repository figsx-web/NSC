"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // Usuário já está logado, redirecionar para dashboard
          router.push("/dashboard")
        } else {
          // Usuário não está logado, redirecionar para login
          router.push("/login")
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        // Em caso de erro, redirecionar para login
        router.push("/login")
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Verificando autenticação...</span>
      </div>
    </div>
  )
}

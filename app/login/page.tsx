"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogIn, Loader2, Eye, EyeOff, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          router.push("/dashboard")
          return
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Verificando autenticação...</span>
        </div>
      </div>
    )
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const supabase = createClient()

      if (isSignUp) {
        // Fluxo de Cadastro
        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        })

        if (error) {
          alert("Erro ao criar conta: " + error.message)
          return
        }

        if (data.user) {
          // Check if email confirmation is required
          if (data.user.identities && data.user.identities.length === 0) {
            alert("Esta conta já existe. Tente fazer login.")
            setIsSignUp(false)
          } else {
            alert("Conta criada com sucesso! Você pode fazer login agora.")
            setIsSignUp(false)
          }
        }
      } else {
        // Fluxo de Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) {
          alert("Erro ao fazer login: " + error.message)
          return
        }

        if (data.user) {
          router.push("/dashboard")
        }
      }
    } catch (error) {
      console.error("Erro na autenticação:", error)
      alert("Erro inesperado.")
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <Image src="/new-login-logo.png" alt="Cat InfoMedia Logo" width={300} height={300} className="mx-auto" />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8 bg-white">
            <div className="text-center mb-8">
              <div className="mb-4"></div>
              <div className="flex items-center justify-center gap-2 text-lg text-black">
                {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                <p>{isSignUp ? "Crie sua conta" : "Acesse o Dashboard do TikTok Shop"}</p>
              </div>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                disabled={false}
              >
                <>{isSignUp ? "Criar Conta" : "Entrar"}</>
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-blue-600">
                {isSignUp ? "Já tem uma conta? Faça login" : "Não tem conta? Crie uma agora"}
              </Button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-black">© 2025 New Scale Company. Todos os direitos reservados.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

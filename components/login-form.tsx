"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useLocale } from "@/components/providers/locale-provider"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") || "/"
  const { t } = useLocale()

  const [visibleId, setVisibleId] = useState("")
  const [parola, setParola] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleId, parola }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t.auth.loginError)
        return
      }

      router.push(redirect)
      router.refresh()
    } catch {
      setError(t.auth.genericError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="visibleId" className="text-gray-200">{t.auth.identityNumber}</Label>
          <Input
            id="visibleId"
            type="text"
            placeholder="123456"
            value={visibleId}
            onChange={(e) => setVisibleId(e.target.value)}
            required
            disabled={isLoading}
            className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="parola" className="text-gray-200">{t.auth.password}</Label>
          </div>
          <Input
            id="parola"
            type="password"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            required
            disabled={isLoading}
            className="bg-[#1a1a1a] border-gray-700 text-white placeholder:text-gray-500"
          />
        </div>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.auth.loggingIn}
            </>
          ) : (
            t.auth.login
          )}
        </Button>
      </div>
    </form>
  )
}

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Bir hata oluştu</CardTitle>
          <CardDescription>
            {error.message || "Beklenmeyen bir hata oluştu"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-xs overflow-auto max-h-40 p-2 bg-muted rounded">
              {error.stack}
            </pre>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset}>Tekrar Dene</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Ana Sayfa
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

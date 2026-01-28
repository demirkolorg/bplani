"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Dashboard Hatası</CardTitle>
          </div>
          <CardDescription>
            {error.message || "Dashboard yüklenirken bir hata oluştu"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {process.env.NODE_ENV === "development" && error.stack && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Hata Detayı:</p>
              <pre className="text-xs overflow-auto max-h-40 p-3 bg-muted rounded border">
                {error.stack}
              </pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={reset} variant="default">
            Tekrar Dene
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Ana Sayfa
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

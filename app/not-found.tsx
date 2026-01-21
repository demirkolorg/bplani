import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-4 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Sayfa Bulunamadı</h2>
        <p className="text-muted-foreground">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Ana Sayfaya Dön</Link>
      </Button>
    </div>
  )
}

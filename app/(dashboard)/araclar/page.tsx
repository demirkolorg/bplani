import { AracTable } from "@/components/araclar/vehicles"

export default function AraclarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Araçlar</h1>
          <p className="text-muted-foreground">Tüm araçları görüntüleyin ve yönetin</p>
        </div>
      </div>

      <AracTable />
    </div>
  )
}

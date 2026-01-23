import { NumaraTable } from "@/components/numaralar/numara-table"

export default function NumaralarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Numaralar</h1>
          <p className="text-muted-foreground">Tüm GSM numaralarını görüntüleyin</p>
        </div>
      </div>

      <NumaraTable />
    </div>
  )
}

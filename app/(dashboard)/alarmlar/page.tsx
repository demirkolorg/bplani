import { AlarmTable } from "@/components/alarmlar/alarm-table"

export default function AlarmlarPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Alarmlar</h1>
          <p className="text-muted-foreground">Tüm alarmları görüntüleyin ve yönetin</p>
        </div>
      </div>

      <AlarmTable />
    </div>
  )
}

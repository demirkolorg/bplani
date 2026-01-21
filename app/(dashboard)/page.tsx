export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz</h1>
        <p className="text-muted-foreground">
          BPlanı iş yönetim platformuna hoş geldiniz.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">Aktif Projeler</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-2xl font-bold">24</div>
          <p className="text-xs text-muted-foreground">Bekleyen Görevler</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-2xl font-bold">8</div>
          <p className="text-xs text-muted-foreground">Takım Üyeleri</p>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="text-2xl font-bold">95%</div>
          <p className="text-xs text-muted-foreground">Tamamlanma Oranı</p>
        </div>
      </div>
    </div>
  )
}
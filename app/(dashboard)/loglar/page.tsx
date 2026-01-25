"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  Activity,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLocale } from "@/components/providers/locale-provider"
import { interpolate } from "@/locales"
import {
  useLoglar,
  LoglarFilters,
  islemLabels,
  entityTypeLabels,
  getIslemColor,
} from "@/hooks/use-loglar"
import type { LogIslem } from "@prisma/client"

export default function LoglarPage() {
  const { t } = useLocale()
  const router = useRouter()

  const ISLEM_OPTIONS: { value: LogIslem; label: string }[] = [
    { value: "CREATE", label: t.loglar.create },
    { value: "UPDATE", label: t.loglar.update },
    { value: "DELETE", label: t.loglar.delete },
    { value: "LOGIN", label: t.loglar.login },
    { value: "LOGOUT", label: t.loglar.logout },
    { value: "LOGIN_FAIL", label: t.loglar.failedLogin },
    { value: "BULK_CREATE", label: t.loglar.bulkCreate },
    { value: "STATUS_CHANGE", label: t.loglar.statusChange },
  ]

  const ENTITY_OPTIONS = [
    { value: "Kisi", label: t.loglar.kisi },
    { value: "Gsm", label: t.loglar.gsm },
    { value: "Takip", label: t.loglar.takip },
    { value: "Tanitim", label: t.loglar.tanitim },
    { value: "Alarm", label: t.loglar.alarm },
    { value: "Personel", label: t.loglar.personel },
    { value: "Il", label: t.loglar.il },
    { value: "Ilce", label: t.loglar.ilce },
    { value: "Mahalle", label: t.loglar.mahalle },
  ]

  const [filters, setFilters] = useState<LoglarFilters>({
    page: 1,
    limit: 50,
  })
  const [searchInput, setSearchInput] = useState("")

  const { data, isLoading, refetch } = useLoglar(filters)

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
  }

  const handleFilterChange = (key: keyof LoglarFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === "all" ? undefined : value,
      page: 1,
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }))
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 50 })
    setSearchInput("")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t.loglar.pageTitle}</h1>
            <p className="text-muted-foreground">
              {t.loglar.pageDescription}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {t.loglar.refresh}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.loglar.filters}</span>
        </div>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Ara..."
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <Select
          value={filters.islem || "all"}
          onValueChange={(v) => handleFilterChange("islem", v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t.loglar.operationType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.loglar.allOperations}</SelectItem>
            {ISLEM_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.entityType || "all"}
          onValueChange={(v) => handleFilterChange("entityType", v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder={t.loglar.dataType} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.loglar.all}</SelectItem>
            {ENTITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          className="w-[150px]"
          value={filters.startDate || ""}
          onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
          placeholder={t.loglar.startDate}
        />

        <Input
          type="date"
          className="w-[150px]"
          value={filters.endDate || ""}
          onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
          placeholder={t.loglar.endDate}
        />

        <Button variant="ghost" size="sm" onClick={clearFilters}>
          {t.loglar.clear}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">{t.loglar.date}</TableHead>
              <TableHead className="w-[180px]">{t.loglar.user}</TableHead>
              <TableHead className="w-[140px]">{t.loglar.operation}</TableHead>
              <TableHead className="w-[120px]">{t.loglar.dataTypeColumn}</TableHead>
              <TableHead>{t.loglar.description}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {t.loglar.noRecords}
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((log) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/loglar/${log.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(log.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.user ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={log.user.fotograf || undefined} />
                            <AvatarFallback className="text-xs">
                              {log.userAd?.[0]}{log.userSoyad?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {log.userAd} {log.userSoyad}
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {log.userAd || t.loglar.system}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getIslemColor(log.islem)} variant="outline">
                      {islemLabels[log.islem]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {log.entityType ? entityTypeLabels[log.entityType] || log.entityType : "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm truncate max-w-[400px]">
                        {log.aciklama || "-"}
                      </span>
                      {log.entityAd && (
                        <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                          {log.entityAd}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <span className="text-sm text-muted-foreground">
              {interpolate(t.loglar.totalRecordsPage, {
                total: data.pagination.total,
                page: data.pagination.page,
                totalPages: data.pagination.totalPages,
              })}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page - 1)}
                disabled={data.pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t.loglar.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(data.pagination.page + 1)}
                disabled={data.pagination.page === data.pagination.totalPages}
              >
                {t.loglar.next}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

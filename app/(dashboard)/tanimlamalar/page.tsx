"use client"

import * as React from "react"
import { Plus, MapPin, Car } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IlTable } from "@/components/lokasyon/il-table"
import { IlceTable } from "@/components/lokasyon/ilce-table"
import { MahalleTable } from "@/components/lokasyon/mahalle-table"
import { IlFormModal } from "@/components/lokasyon/il-form-modal"
import { IlceFormModal } from "@/components/lokasyon/ilce-form-modal"
import { MahalleFormModal } from "@/components/lokasyon/mahalle-form-modal"
import { MarkaTable } from "@/components/araclar/marka-table"
import { ModelTable } from "@/components/araclar/model-table"
import { MarkaFormModal } from "@/components/araclar/marka-form-modal"
import { ModelFormModal } from "@/components/araclar/model-form-modal"

type MainTab = "lokasyonlar" | "marka-model"
type LokasyonSubTab = "iller" | "ilceler" | "mahalleler"
type MarkaModelSubTab = "markalar" | "modeller"

export default function TanimlamalarPage() {
  const [mainTab, setMainTab] = React.useState<MainTab>("lokasyonlar")
  const [lokasyonTab, setLokasyonTab] = React.useState<LokasyonSubTab>("iller")
  const [markaModelTab, setMarkaModelTab] = React.useState<MarkaModelSubTab>("markalar")

  // Lokasyon modals
  const [ilModalOpen, setIlModalOpen] = React.useState(false)
  const [ilceModalOpen, setIlceModalOpen] = React.useState(false)
  const [mahalleModalOpen, setMahalleModalOpen] = React.useState(false)

  // Marka/Model modals
  const [markaModalOpen, setMarkaModalOpen] = React.useState(false)
  const [modelModalOpen, setModelModalOpen] = React.useState(false)

  const handleAddNew = () => {
    if (mainTab === "lokasyonlar") {
      switch (lokasyonTab) {
        case "iller":
          setIlModalOpen(true)
          break
        case "ilceler":
          setIlceModalOpen(true)
          break
        case "mahalleler":
          setMahalleModalOpen(true)
          break
      }
    } else {
      switch (markaModelTab) {
        case "markalar":
          setMarkaModalOpen(true)
          break
        case "modeller":
          setModelModalOpen(true)
          break
      }
    }
  }

  const getButtonText = () => {
    if (mainTab === "lokasyonlar") {
      switch (lokasyonTab) {
        case "iller":
          return "Yeni İl"
        case "ilceler":
          return "Yeni İlçe"
        case "mahalleler":
          return "Yeni Mahalle"
      }
    } else {
      switch (markaModelTab) {
        case "markalar":
          return "Yeni Marka"
        case "modeller":
          return "Yeni Model"
      }
    }
    return "Yeni"
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tanımlamalar</h1>
          <p className="text-muted-foreground">Lokasyon ve araç tanımlarını yönetin</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          {getButtonText()}
        </Button>
      </div>

      {/* Ana Tablar */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="lokasyonlar" className="gap-2">
            <MapPin className="h-4 w-4" />
            Lokasyonlar
          </TabsTrigger>
          <TabsTrigger value="marka-model" className="gap-2">
            <Car className="h-4 w-4" />
            Marka Model
          </TabsTrigger>
        </TabsList>

        {/* Lokasyonlar İçeriği */}
        <TabsContent value="lokasyonlar">
          <Tabs value={lokasyonTab} onValueChange={(v) => setLokasyonTab(v as LokasyonSubTab)}>
            <TabsList>
              <TabsTrigger value="iller">İller</TabsTrigger>
              <TabsTrigger value="ilceler">İlçeler</TabsTrigger>
              <TabsTrigger value="mahalleler">Mahalleler</TabsTrigger>
            </TabsList>
            <TabsContent value="iller" className="mt-4">
              <IlTable />
            </TabsContent>
            <TabsContent value="ilceler" className="mt-4">
              <IlceTable />
            </TabsContent>
            <TabsContent value="mahalleler" className="mt-4">
              <MahalleTable />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Marka Model İçeriği */}
        <TabsContent value="marka-model">
          <Tabs value={markaModelTab} onValueChange={(v) => setMarkaModelTab(v as MarkaModelSubTab)}>
            <TabsList>
              <TabsTrigger value="markalar">Markalar</TabsTrigger>
              <TabsTrigger value="modeller">Modeller</TabsTrigger>
            </TabsList>
            <TabsContent value="markalar" className="mt-4">
              <MarkaTable />
            </TabsContent>
            <TabsContent value="modeller" className="mt-4">
              <ModelTable />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* Lokasyon Modals */}
      <IlFormModal open={ilModalOpen} onOpenChange={setIlModalOpen} />
      <IlceFormModal open={ilceModalOpen} onOpenChange={setIlceModalOpen} />
      <MahalleFormModal open={mahalleModalOpen} onOpenChange={setMahalleModalOpen} />

      {/* Marka/Model Modals */}
      <MarkaFormModal open={markaModalOpen} onOpenChange={setMarkaModalOpen} />
      <ModelFormModal open={modelModalOpen} onOpenChange={setModelModalOpen} />
    </div>
  )
}

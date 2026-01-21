"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IlTable } from "@/components/lokasyon/il-table"
import { IlceTable } from "@/components/lokasyon/ilce-table"
import { MahalleTable } from "@/components/lokasyon/mahalle-table"
import { IlFormModal } from "@/components/lokasyon/il-form-modal"
import { IlceFormModal } from "@/components/lokasyon/ilce-form-modal"
import { MahalleFormModal } from "@/components/lokasyon/mahalle-form-modal"

export default function LokasyonlarPage() {
  const [activeTab, setActiveTab] = React.useState("iller")
  const [ilModalOpen, setIlModalOpen] = React.useState(false)
  const [ilceModalOpen, setIlceModalOpen] = React.useState(false)
  const [mahalleModalOpen, setMahalleModalOpen] = React.useState(false)

  const handleAddNew = () => {
    switch (activeTab) {
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
  }

  const getButtonText = () => {
    switch (activeTab) {
      case "iller":
        return "Yeni İl"
      case "ilceler":
        return "Yeni İlçe"
      case "mahalleler":
        return "Yeni Mahalle"
      default:
        return "Yeni"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lokasyonlar</h1>
          <p className="text-muted-foreground">İl, ilçe ve mahalleleri yönetin</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          {getButtonText()}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

      <IlFormModal open={ilModalOpen} onOpenChange={setIlModalOpen} />
      <IlceFormModal open={ilceModalOpen} onOpenChange={setIlceModalOpen} />
      <MahalleFormModal open={mahalleModalOpen} onOpenChange={setMahalleModalOpen} />
    </div>
  )
}

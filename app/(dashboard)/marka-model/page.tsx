"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkaTable } from "@/components/araclar/marka-table"
import { ModelTable } from "@/components/araclar/model-table"
import { MarkaFormModal } from "@/components/araclar/marka-form-modal"
import { ModelFormModal } from "@/components/araclar/model-form-modal"

export default function MarkaModelPage() {
  const [activeTab, setActiveTab] = React.useState("markalar")
  const [markaModalOpen, setMarkaModalOpen] = React.useState(false)
  const [modelModalOpen, setModelModalOpen] = React.useState(false)

  const handleAddNew = () => {
    switch (activeTab) {
      case "markalar":
        setMarkaModalOpen(true)
        break
      case "modeller":
        setModelModalOpen(true)
        break
    }
  }

  const getButtonText = () => {
    switch (activeTab) {
      case "markalar":
        return "Yeni Marka"
      case "modeller":
        return "Yeni Model"
      default:
        return "Yeni"
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marka Model</h1>
          <p className="text-muted-foreground">Marka ve modelleri yönetin</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          {getButtonText()}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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

      <MarkaFormModal open={markaModalOpen} onOpenChange={setMarkaModalOpen} />
      <ModelFormModal open={modelModalOpen} onOpenChange={setModelModalOpen} />
    </div>
  )
}

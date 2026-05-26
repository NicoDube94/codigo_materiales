"use client"

import * as React from "react"
import { Camera, Plus, Upload, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { extractMaterialLabel } from "@/ai/flows/material-label-extractor"
import { ScannerOverlay } from "./ScannerOverlay"
import { addMaterialToProduct } from "@/lib/storage"

// Shadcn Drawer is actually in sheet.tsx or dialog? No, it's missing. I'll use Sheet as fallback or create one.
// Let's use Dialog/Sheet for the mobile interaction.
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function AddMaterialDrawer({ onAdded }: { onAdded: () => void }) {
  const [productCode, setProductCode] = React.useState("")
  const [materialCode, setMaterialCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [photoUrl, setPhotoUrl] = React.useState("")
  const [isScanning, setIsScanning] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    
    // Simulate reading file and data URI
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUri = event.target?.result as string
      setPhotoUrl(dataUri)
      
      try {
        const result = await extractMaterialLabel({ photoDataUri: dataUri })
        setMaterialCode(result.materialCode)
        setDescription(result.materialDescription)
      } catch (error) {
        console.error("AI scanning failed", error)
      } finally {
        setIsScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!productCode || !materialCode || !description) return
    addMaterialToProduct(productCode, {
      materialCode,
      description,
      photoUrl: photoUrl || `https://picsum.photos/seed/${materialCode}/300/200`
    })
    setIsOpen(false)
    reset()
    onAdded()
  }

  const reset = () => {
    setProductCode("")
    setMaterialCode("")
    setDescription("")
    setPhotoUrl("")
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
          <Plus className="h-8 w-8 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl border-t border-white/5 bg-background p-6">
        <ScannerOverlay isScanning={isScanning} />
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-headline tracking-tight flex items-center gap-2">
            <Plus className="h-6 w-6 text-accent" />
            Vincular Material
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código de Producto (Padre)</Label>
            <Input 
              placeholder="Ej: 43716VM" 
              value={productCode}
              onChange={(e) => setProductCode(e.target.value.toUpperCase())}
              className="bg-secondary/50 border-white/5 focus:border-primary font-headline"
            />
          </div>

          <div className="relative group aspect-video rounded-xl bg-secondary/30 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-accent/50">
            {photoUrl ? (
              <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <>
                <Camera className="h-10 w-10 text-muted-foreground mb-2 group-hover:text-accent transition-colors" />
                <p className="text-xs text-muted-foreground group-hover:text-accent transition-colors">Capturar Etiqueta</p>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileUpload}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código Material</Label>
              <Input 
                placeholder="Escaneado automáticamente..." 
                value={materialCode}
                onChange={(e) => setMaterialCode(e.target.value)}
                className="bg-secondary/50 border-white/5 font-headline"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Descripción</Label>
              <Input 
                placeholder="Escaneado automáticamente..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 border-white/5"
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={!productCode || !materialCode}
            className="w-full h-12 text-md font-headline tracking-wide uppercase bg-accent text-background hover:bg-accent/90"
          >
            Guardar en Catálogo
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

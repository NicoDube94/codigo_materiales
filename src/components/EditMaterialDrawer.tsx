// "use client"

// import * as React from "react"
// import { Camera, Pencil, Loader2, Check, AlertCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import { updateMaterial, type Material } from "@/lib/storage"

// interface EditMaterialDrawerProps {
//   material: Material
//   onUpdated: () => void
// }

// export function EditMaterialDrawer({ material, onUpdated }: EditMaterialDrawerProps) {
//   const [isOpen, setIsOpen] = React.useState(false)
//   const [materialCode, setMaterialCode] = React.useState("")
//   const [description, setDescription] = React.useState("")
//   const [photoUrl, setPhotoUrl] = React.useState("")
//   const [isSaving, setIsSaving] = React.useState(false)
//   const [success, setSuccess] = React.useState(false)
//   const [error, setError] = React.useState("")

//   // Precargar datos del material al abrir
//   React.useEffect(() => {
//     if (isOpen) {
//       setMaterialCode(material.materialCode)
//       setDescription(material.description)
//       setPhotoUrl(material.photoUrl)
//       setError("")
//       setSuccess(false)
//     }
//   }, [isOpen, material])

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     const reader = new FileReader()
//     reader.onload = (event) => {
//       setPhotoUrl(event.target?.result as string)
//     }
//     reader.readAsDataURL(file)
//   }

//   const handleSave = async () => {
//     setError("")
//     const normalizedCode = materialCode.trim().toUpperCase()
//     const normalizedDesc = description.trim()

//     if (!normalizedCode) { setError("El código de material es obligatorio."); return }
//     if (!normalizedDesc) { setError("La descripción es obligatoria."); return }

//     setIsSaving(true)
//     try {
//       const result = await updateMaterial(material.id, {
//         materialCode: normalizedCode,
//         description: normalizedDesc,
//         photoUrl: photoUrl || material.photoUrl,
//       })

//       if (!result.success) {
//         setError(result.error || "Error al guardar.")
//         return
//       }

//       setSuccess(true)
//       setTimeout(() => {
//         setIsOpen(false)
//         setSuccess(false)
//         onUpdated()
//       }, 1000)
//     } catch {
//       setError("Error inesperado al guardar.")
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const hasChanges =
//     materialCode.trim().toUpperCase() !== material.materialCode ||
//     description.trim() !== material.description ||
//     photoUrl !== material.photoUrl

//   return (
//     <Sheet open={isOpen} onOpenChange={setIsOpen}>
//       <SheetTrigger asChild>
//         <button
//           onClick={(e) => e.stopPropagation()}
//           className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/15 active:scale-95 transition-all duration-150"
//         >
//           <Pencil className="w-3 h-3" />
//           Editar
//         </button>
//       </SheetTrigger>

//       <SheetContent
//         side="bottom"
//         className="h-[92vh] rounded-t-3xl border-t border-white/5 bg-background p-6 overflow-y-auto"
//       >
//         <SheetHeader className="mb-6">
//           <SheetTitle className="text-2xl font-headline tracking-tight flex items-center gap-2">
//             <Pencil className="h-6 w-6 text-accent" />
//             Editar Material
//           </SheetTitle>
//           <p className="text-xs text-muted-foreground font-headline tracking-widest uppercase">
//             {material.materialCode}
//           </p>
//         </SheetHeader>

//         <div className="space-y-5 pb-8">
//           {/* Foto */}
//           <div className="space-y-2">
//             <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
//               Foto del Material
//             </Label>
//             <div className="relative group aspect-video rounded-xl bg-secondary/20 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-accent/50">
//               {photoUrl ? (
//                 <>
//                   <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
//                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
//                     <Camera className="h-8 w-8 text-white mr-2" />
//                     <span className="text-xs font-semibold text-white">Cambiar Foto</span>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <Camera className="h-8 w-8 text-muted-foreground mb-2" />
//                   <p className="text-xs text-muted-foreground">Subir nueva foto</p>
//                 </>
//               )}
//               <input
//                 type="file"
//                 accept="image/*"
//                 capture="environment"
//                 className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
//                 onChange={handleFileUpload}
//                 disabled={isSaving}
//               />
//             </div>
//           </div>

//           {/* Código material */}
//           <div className="space-y-2">
//             <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
//               Código del Material
//             </Label>
//             <Input
//               value={materialCode}
//               onChange={(e) => setMaterialCode(e.target.value.toUpperCase())}
//               className="bg-secondary/50 border-white/5 font-headline h-11 rounded-xl"
//               disabled={isSaving}
//             />
//           </div>

//           {/* Descripción */}
//           <div className="space-y-2">
//             <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
//               Descripción
//             </Label>
//             <Input
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="bg-secondary/50 border-white/5 h-11 rounded-xl"
//               disabled={isSaving}
//             />
//           </div>

//           {/* Error / Éxito */}
//           {error && (
//             <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-500/10 p-3.5 rounded-xl border border-red-500/10">
//               <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
//               <span>{error}</span>
//             </div>
//           )}
//           {success && (
//             <div className="flex items-center gap-2.5 text-green-400 text-xs bg-green-500/10 p-3.5 rounded-xl border border-green-500/10">
//               <Check className="h-4 w-4 shrink-0" />
//               <span>¡Material actualizado correctamente!</span>
//             </div>
//           )}

//           {/* Botón guardar */}
//           <Button
//             onClick={handleSave}
//             disabled={!hasChanges || isSaving || success}
//             className="w-full h-12 text-md font-headline tracking-wide uppercase bg-accent text-background hover:bg-accent/90 rounded-xl disabled:opacity-40"
//           >
//             {isSaving ? (
//               <>
//                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 Guardando...
//               </>
//             ) : success ? (
//               "¡Guardado!"
//             ) : (
//               "Guardar Cambios"
//             )}
//           </Button>
//         </div>
//       </SheetContent>
//     </Sheet>
//   )
// }

"use client"

import * as React from "react"
import { Camera, Pencil, Loader2, Check, AlertCircle, CheckSquare, Square, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { updateMaterial, linkMaterialToProducts, getStore, type Material } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"
import { MaterialImage } from "@/components/MaterialImage"

interface EditMaterialDrawerProps {
  material: Material
  onUpdated: () => void
}

export function EditMaterialDrawer({ material, onUpdated }: EditMaterialDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [materialCode, setMaterialCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [photoUrl, setPhotoUrl] = React.useState("")
  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([])
  const [productsList, setProductsList] = React.useState<any[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    if (!isOpen) return

    setMaterialCode(material.materialCode)
    setDescription(material.description)
    setPhotoUrl(material.photoUrl)
    setError("")
    setSuccess(false)

    const load = async () => {
      setIsLoading(true)
      try {
        const store = await getStore()
        setProductsList(store)
        const alreadyLinked = store
          .filter(p => p.materials.some(m => m.id === material.id))
          .map(p => p.id)
        setSelectedProductIds(alreadyLinked)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen, material])

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setPhotoUrl(event.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setError("")
    const normalizedCode = materialCode.trim().toUpperCase()
    const normalizedDesc = description.trim()

    if (!normalizedCode) { setError("El código de material es obligatorio."); return }
    if (!normalizedDesc) { setError("La descripción es obligatoria."); return }

    setIsSaving(true)
    try {
      const updateResult = await updateMaterial(material.id, {
        materialCode: normalizedCode,
        description: normalizedDesc,
        photoUrl: photoUrl || material.photoUrl,
      }) as { success: boolean; error?: string }

      if (!updateResult.success) {
        setError(updateResult.error || "Error al guardar.")
        return
      }

      if (selectedProductIds.length > 0) {
        const linkResult = await linkMaterialToProducts(material.id, selectedProductIds) as { success: boolean; error?: string }
        if (!linkResult.success) {
          setError(linkResult.error || "Material actualizado pero error al vincular productos.")
          return
        }
      }

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
        onUpdated()
      }, 1000)
    } catch {
      setError("Error inesperado al guardar.")
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges =
    materialCode.trim().toUpperCase() !== material.materialCode ||
    description.trim() !== material.description ||
    photoUrl !== material.photoUrl ||
    selectedProductIds.length > 0

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary border border-primary/20 bg-primary/5 hover:bg-primary/15 active:scale-95 transition-all duration-150"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl border-t border-white/5 bg-background p-6 overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-headline tracking-tight flex items-center gap-2">
            <Pencil className="h-6 w-6 text-accent" />
            Editar Material
          </SheetTitle>
          <p className="text-xs text-muted-foreground font-headline tracking-widest uppercase">
            {material.materialCode}
          </p>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
            <p className="text-xs font-headline uppercase tracking-widest">Cargando...</p>
          </div>
        ) : (
          <div className="space-y-5 pb-8">
            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Foto del Material</Label>
              <div className="relative group aspect-video rounded-xl bg-secondary/20 border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-accent/50">
                {photoUrl ? (
                  <>
                    <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="h-8 w-8 text-white mr-2" />
                      <span className="text-xs font-semibold text-white">Cambiar Foto</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 pointer-events-none">
                    <Settings2 className="h-10 w-10 text-muted-foreground/30" strokeWidth={1} />
                    <p className="text-xs text-muted-foreground">Sin foto — tocá para agregar</p>
                  </div>
                )}
                <input type="file" accept="image/*" capture="environment"
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={handleFileUpload} disabled={isSaving} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código del Material</Label>
              <Input value={materialCode} onChange={(e) => setMaterialCode(e.target.value.toUpperCase())}
                className="bg-secondary/50 border-white/5 font-headline h-11 rounded-xl" disabled={isSaving} />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Descripción</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 border-white/5 h-11 rounded-xl" disabled={isSaving} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Productos Vinculados</Label>
                {selectedProductIds.length > 0 && (
                  <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 text-[9px] h-4">
                    {selectedProductIds.length} producto{selectedProductIds.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-secondary/10 p-2">
                {productsList.map(p => {
                  const selected = selectedProductIds.includes(p.id)
                  return (
                    <button key={p.id} onClick={() => toggleProduct(p.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${selected ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/40"}`}>
                      {selected
                        ? <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                        : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                      <span className={`text-xs font-headline ${selected ? "text-primary" : "text-foreground"}`}>{p.productCode}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Los productos ya vinculados aparecen marcados. Podés agregar más sin quitar los existentes.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-500/10 p-3.5 rounded-xl border border-red-500/10">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 text-green-400 text-xs bg-green-500/10 p-3.5 rounded-xl border border-green-500/10">
                <Check className="h-4 w-4 shrink-0" /><span>¡Material actualizado correctamente!</span>
              </div>
            )}

            <Button onClick={handleSave} disabled={!hasChanges || isSaving || success}
              className="w-full h-12 text-md font-headline tracking-wide uppercase bg-accent text-background hover:bg-accent/90 rounded-xl disabled:opacity-40">
              {isSaving ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Guardando...</>)
                : success ? "¡Guardado!" : "Guardar Cambios"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
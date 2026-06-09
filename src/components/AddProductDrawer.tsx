// "use client"

// import * as React from "react"
// import { Camera, FolderPlus, AlertCircle, Check, Sparkles, Box, Info, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { addMaterialToProduct, getStore } from "@/lib/storage"
// import { Badge } from "@/components/ui/badge"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// interface AddProductDrawerProps {
//   onAdded: () => void;
//   trigger?: React.ReactNode;
// }

// export function AddProductDrawer({ onAdded, trigger }: AddProductDrawerProps) {
//   const [selectedProduct, setSelectedProduct] = React.useState("")
//   const [newProductCode, setNewProductCode] = React.useState("")
//   const [materialCode, setMaterialCode] = React.useState("")
//   const [description, setDescription] = React.useState("")
//   const [photoUrl, setPhotoUrl] = React.useState("")
  
//   const [error, setError] = React.useState("")
//   const [success, setSuccess] = React.useState(false)
//   const [isOpen, setIsOpen] = React.useState(false)
  
//   // Nuevos estados de carga para Supabase
//   const [isSaving, setIsSaving] = React.useState(false)
//   const [isLoadingProducts, setIsLoadingProducts] = React.useState(false)

//   // List of existing products in the store
//   const [productsList, setProductsList] = React.useState<any[]>([])

//   // Load existing products on drawer open (Ahora asíncrono)
//   React.useEffect(() => {
//     if (isOpen) {
//       const fetchProducts = async () => {
//         setIsLoadingProducts(true)
//         try {
//           const store = await getStore()
//           setProductsList(store)
          
//           // Pre-select first product if any exist, otherwise set to new product creation
//           if (store.length > 0) {
//             setSelectedProduct(store[0].productCode)
//           } else {
//             setSelectedProduct("__NEW_PRODUCT__")
//           }
//         } catch (err) {
//           console.error("Error al cargar productos", err)
//         } finally {
//           setIsLoadingProducts(false)
//         }
//       }
      
//       fetchProducts()
//     }
//   }, [isOpen])

//   // Check if new product code already exists in real-time
//   const newProductExistsAlready = React.useMemo(() => {
//     if (selectedProduct !== "__NEW_PRODUCT__") return null
//     const trimmed = newProductCode.trim().toUpperCase()
//     if (!trimmed) return null
//     return productsList.some(p => p.productCode === trimmed)
//   }, [selectedProduct, newProductCode, productsList])

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     setError("")
    
//     const reader = new FileReader()
//     reader.onload = (event) => {
//       const dataUri = event.target?.result as string
//       setPhotoUrl(dataUri)
//     }
//     reader.readAsDataURL(file)
//   }

//   // Ahora es una función asíncrona
//   const handleSave = async () => {
//     setError("")
//     setSuccess(false)

//     // Determine target product code
//     const isNew = selectedProduct === "__NEW_PRODUCT__"
//     const targetProductCode = isNew 
//       ? newProductCode.trim().toUpperCase() 
//       : selectedProduct.trim().toUpperCase()
      
//     const normalizedMat = materialCode.trim().toUpperCase()
//     const normalizedDesc = description.trim()

//     if (!targetProductCode) {
//       setError("El código de producto es obligatorio.")
//       return
//     }

//     if (isNew && newProductExistsAlready) {
//       setError("Este código de producto ya existe. Selecciónalo de la lista superior.")
//       return
//     }

//     if (!normalizedMat) {
//       setError("El código de material es obligatorio.")
//       return
//     }
//     if (!normalizedDesc) {
//       setError("La descripción del material es obligatoria.")
//       return
//     }

//     setIsSaving(true) // Iniciamos el spinner

//     try {
//       await addMaterialToProduct(targetProductCode, {
//         materialCode: normalizedMat,
//         description: normalizedDesc,
//         photoUrl: photoUrl || '/placeholder-material.svg'
//       })

//       setSuccess(true)
      
//       setTimeout(() => {
//         setIsOpen(false)
//         setSuccess(false)
//         setIsSaving(false)
//         reset()
//         onAdded()
//       }, 1200)
//     } catch (err) {
//       setError("Error al guardar en la base de datos.")
//       setIsSaving(false) // Quitamos el spinner si hay error
//     }
//   }

//   const reset = () => {
//     setSelectedProduct("")
//     setNewProductCode("")
//     setMaterialCode("")
//     setDescription("")
//     setPhotoUrl("")
//     setError("")
//   }

//   const handleOpenChange = (open: boolean) => {
//     setIsOpen(open)
//     if (!open) {
//       reset()
//     }
//   }

//   return (
//     <Sheet open={isOpen} onOpenChange={handleOpenChange}>
//       <SheetTrigger asChild>
//         {trigger || (
//           <Button variant="outline" size="sm" className="h-9 gap-1.5 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:text-accent font-headline text-[11px] tracking-wide uppercase rounded-lg">
//             <FolderPlus className="h-3.5 w-3.5 text-accent" />
//             Nuevo Registro
//           </Button>
//         )}
//       </SheetTrigger>
//       <SheetContent side="bottom" className="h-[92vh] rounded-t-3xl border-t border-white/5 bg-background p-6 overflow-y-auto">
//         <SheetHeader className="mb-6">
//           <SheetTitle className="text-2xl font-headline tracking-tight flex items-center gap-2">
//             <FolderPlus className="h-6 w-6 text-accent" />
//             Vincular Nuevo Material
//           </SheetTitle>
//         </SheetHeader>

//         <div className="space-y-5 pb-8">
//           {/* Selector de Producto */}
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Producto Padre</Label>
//               {selectedProduct !== "__NEW_PRODUCT__" && !isLoadingProducts && (
//                 <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5 text-[9px] font-medium py-0 h-4">
//                   <Box className="w-2.5 h-2.5 mr-1" /> Catálogo Existente
//                 </Badge>
//               )}
//             </div>

//             <Select 
//               value={selectedProduct} 
//               onValueChange={(val) => {
//                 setSelectedProduct(val)
//                 setError("")
//               }}
//               disabled={isLoadingProducts || isSaving}
//             >
//               <SelectTrigger className="bg-secondary/50 border-white/5 focus:border-primary font-headline h-11 rounded-xl w-full text-left">
//                 <SelectValue placeholder={isLoadingProducts ? "Cargando productos..." : "Seleccionar producto..."} />
//               </SelectTrigger>
//               <SelectContent className="bg-background border-white/10 rounded-xl max-h-60 overflow-y-auto z-[60]">
//                 {productsList.map((p) => (
//                   <SelectItem key={p.id} value={p.productCode} className="font-headline focus:bg-accent/10 focus:text-accent cursor-pointer">
//                     {p.productCode}
//                   </SelectItem>
//                 ))}
//                 <SelectItem value="__NEW_PRODUCT__" className="font-headline text-accent focus:bg-accent/10 focus:text-accent cursor-pointer font-semibold border-t border-white/5">
//                   🆕 + Registrar Nuevo Producto...
//                 </SelectItem>
//               </SelectContent>
//             </Select>
//           </div>

//           {/* Campo condicional para crear nuevo producto */}
//           {selectedProduct === "__NEW_PRODUCT__" && (
//             <div className="space-y-2 pt-1 animate-in slide-in-from-top-2 duration-200">
//               <div className="flex items-center justify-between">
//                 <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código del Nuevo Producto</Label>
//                 {newProductExistsAlready === true && (
//                   <span className="text-[9px] text-red-400 font-semibold">Ya existe en lista</span>
//                 )}
//                 {newProductExistsAlready === false && newProductCode.trim() !== "" && (
//                   <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/5 text-[9px] font-medium py-0 h-4">
//                     <Sparkles className="w-2.5 h-2.5 mr-1" /> Nuevo Producto
//                   </Badge>
//                 )}
//               </div>
//               <Input 
//                 placeholder="Ej: ECO-STOVE-100" 
//                 value={newProductCode}
//                 onChange={(e) => {
//                   setError("")
//                   setNewProductCode(e.target.value.toUpperCase())
//                 }}
//                 className="bg-secondary/50 border-white/5 focus:border-primary font-headline h-11 rounded-xl"
//                 disabled={isSaving}
//               />
//               <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
//                 <Info className="w-3.5 h-3.5 text-accent shrink-0" />
//                 Este código se dará de alta automáticamente como producto padre.
//               </p>
//             </div>
//           )}

//           {/* Captura de Foto (Cámara / Galería) */}
//           <div className="space-y-2">
//             <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Foto del Material (Identificación Visual)</Label>
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
//                   <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-2 group-hover:bg-accent/10 transition-colors">
//                     <Camera className="h-6 w-6 text-accent" />
//                   </div>
//                   <p className="text-xs font-medium text-muted-foreground">Tomar Foto o Subir Galería</p>
//                   <p className="text-[10px] text-muted-foreground/60 mt-1">Se guardará como identificación en el catálogo</p>
//                 </>
//               )}
//               <input 
//                 type="file" 
//                 accept="image/*" 
//                 capture="environment" 
//                 className="absolute inset-0 opacity-0 cursor-pointer animate-none disabled:cursor-not-allowed" 
//                 onChange={handleFileUpload}
//                 disabled={isSaving}
//               />
//             </div>
//           </div>

//           {/* Inputs del Material */}
//           <div className="grid grid-cols-1 gap-4">
//             <div className="space-y-2">
//               <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código del Material</Label>
//               <Input 
//                 placeholder="Ej: 25H00003662" 
//                 value={materialCode}
//                 onChange={(e) => setMaterialCode(e.target.value.toUpperCase())}
//                 className="bg-secondary/50 border-white/5 font-headline h-11 rounded-xl"
//                 disabled={isSaving}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Descripción del Material</Label>
//               <Input 
//                 placeholder="Ej: Rejilla de fundición superior" 
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 className="bg-secondary/50 border-white/5 h-11 rounded-xl"
//                 disabled={isSaving}
//               />
//             </div>
//           </div>

//           {error && (
//             <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-500/10 p-3.5 rounded-xl border border-red-500/10">
//               <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
//               <span>{error}</span>
//             </div>
//           )}

//           {success && (
//             <div className="flex items-center gap-2.5 text-green-400 text-xs bg-green-500/10 p-3.5 rounded-xl border border-green-500/10">
//               <Check className="h-4 w-4 shrink-0" />
//               <span>¡Registro guardado con éxito en el catálogo!</span>
//             </div>
//           )}

//           <Button 
//             onClick={handleSave} 
//             disabled={
//               (selectedProduct === "__NEW_PRODUCT__" && !newProductCode.trim()) || 
//               !materialCode.trim() || 
//               !description.trim() || 
//               isSaving ||
//               success || 
//               newProductExistsAlready === true
//             }
//             className="w-full h-12 text-md font-headline tracking-wide uppercase bg-accent text-background hover:bg-accent/90 rounded-xl"
//           >
//             {isSaving ? (
//               <>
//                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
//                 Guardando...
//               </>
//             ) : success ? (
//               "¡Guardado!"
//             ) : (
//               "Guardar en Catálogo"
//             )}
//           </Button>
//         </div>
//       </SheetContent>
//     </Sheet>
//   )
// }

"use client"

import * as React from "react"
import { Camera, FolderPlus, AlertCircle, Check, Info, Loader2, Search, CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMaterialToCatalog, getStore, getMaterialsCatalog, linkMaterialToProducts } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"

interface AddProductDrawerProps {
  onAdded: () => void;
  trigger?: React.ReactNode;
}

type Mode = "new_material" | "existing_material"

export function AddProductDrawer({ onAdded, trigger }: AddProductDrawerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [mode, setMode] = React.useState<Mode>("new_material")

  const [materialCode, setMaterialCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [photoUrl, setPhotoUrl] = React.useState("")

  const [selectedMaterialId, setSelectedMaterialId] = React.useState("")
  const [materialSearch, setMaterialSearch] = React.useState("")

  const [selectedProductIds, setSelectedProductIds] = React.useState<string[]>([])
  const [newProductCode, setNewProductCode] = React.useState("")

  const [productsList, setProductsList] = React.useState<any[]>([])
  const [materialsCatalog, setMaterialsCatalog] = React.useState<any[]>([])

  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoading(true)
      try {
        const [store, catalog] = await Promise.all([getStore(), getMaterialsCatalog()])
        setProductsList(store)
        setMaterialsCatalog(catalog)
      } catch {
        console.error("Error cargando datos")
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [isOpen])

  const toggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => setPhotoUrl(event.target?.result as string)
    reader.readAsDataURL(file)
  }

  const getEffectiveProductIds = async (): Promise<string[]> => {
    const ids = [...selectedProductIds]
    const trimmed = newProductCode.trim().toUpperCase()
    if (!trimmed) return ids

    let existing = productsList.find(p => p.productCode === trimmed)
    if (!existing) {
      const { data } = await (await import('@/lib/storage')).supabase
        .from('products')
        .insert([{ product_code: trimmed }])
        .select('id')
        .single()
      if (data) ids.push(data.id)
    } else {
      ids.push(existing.id)
    }
    return ids
  }

  const handleSave = async () => {
    setError("")

    if (mode === "new_material") {
      const normCode = materialCode.trim().toUpperCase()
      const normDesc = description.trim()
      if (!normCode) { setError("El código de material es obligatorio."); return }
      if (!normDesc) { setError("La descripción es obligatoria."); return }
      if (selectedProductIds.length === 0 && !newProductCode.trim()) {
        setError("Seleccioná al menos un producto o ingresá uno nuevo."); return
      }

      setIsSaving(true)
      try {
        const productIds = await getEffectiveProductIds()
        const result = await addMaterialToCatalog(
          { materialCode: normCode, description: normDesc, photoUrl: photoUrl || `` },
          productIds
        ) as { success: boolean; error?: string }

        if (!result.success) { setError(result.error || "Error al guardar."); return }
        setSuccess(true)
        setTimeout(() => { setIsOpen(false); setSuccess(false); reset(); onAdded() }, 1200)
      } catch {
        setError("Error inesperado al guardar.")
      } finally {
        setIsSaving(false)
      }
    } else {
      if (!selectedMaterialId) { setError("Seleccioná un material del catálogo."); return }
      if (selectedProductIds.length === 0 && !newProductCode.trim()) {
        setError("Seleccioná al menos un producto o ingresá uno nuevo."); return
      }

      setIsSaving(true)
      try {
        const productIds = await getEffectiveProductIds()
        const result = await linkMaterialToProducts(selectedMaterialId, productIds) as { success: boolean; error?: string }

        if (!result.success) { setError(result.error || "Error al vincular."); return }
        setSuccess(true)
        setTimeout(() => { setIsOpen(false); setSuccess(false); reset(); onAdded() }, 1200)
      } catch {
        setError("Error inesperado al guardar.")
      } finally {
        setIsSaving(false)
      }
    }
  }

  const reset = () => {
    setMode("new_material")
    setMaterialCode(""); setDescription(""); setPhotoUrl("")
    setSelectedMaterialId(""); setMaterialSearch("")
    setSelectedProductIds([]); setNewProductCode("")
    setError(""); setSuccess(false)
  }

  const filteredCatalog = materialsCatalog.filter(m =>
    m.materialCode.toLowerCase().includes(materialSearch.toLowerCase()) ||
    m.description.toLowerCase().includes(materialSearch.toLowerCase())
  )

  const selectedMaterial = materialsCatalog.find(m => m.id === selectedMaterialId)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="h-9 gap-1.5 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:text-accent font-headline text-[11px] tracking-wide uppercase rounded-lg">
            <FolderPlus className="h-3.5 w-3.5 text-accent" />
            Nuevo Registro
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl border-t border-white/5 bg-background p-6 overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-2xl font-headline tracking-tight flex items-center gap-2">
            <FolderPlus className="h-6 w-6 text-accent" />
            Vincular Material
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
            <p className="text-xs font-headline uppercase tracking-widest">Cargando catálogo...</p>
          </div>
        ) : (
          <div className="space-y-5 pb-8">

            {/* Selector de modo */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-xl">
              <button onClick={() => setMode("new_material")}
                className={`py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${mode === "new_material" ? "bg-accent text-background shadow" : "text-muted-foreground hover:text-foreground"}`}>
                Nuevo Material
              </button>
              <button onClick={() => setMode("existing_material")}
                className={`py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all ${mode === "existing_material" ? "bg-accent text-background shadow" : "text-muted-foreground hover:text-foreground"}`}>
                Del Catálogo
              </button>
            </div>

            {/* MODO: Nuevo Material */}
            {mode === "new_material" && (
              <>
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
                      <>
                        <div className="w-12 h-12 rounded-full bg-accent/5 flex items-center justify-center mb-2 group-hover:bg-accent/10 transition-colors">
                          <Camera className="h-6 w-6 text-accent" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground">Tomar Foto o Subir Galería</p>
                      </>
                    )}
                    <input type="file" accept="image/*" capture="environment"
                      className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      onChange={handleFileUpload} disabled={isSaving} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Código del Material</Label>
                  <Input placeholder="Ej: 25H00003662" value={materialCode}
                    onChange={(e) => setMaterialCode(e.target.value.toUpperCase())}
                    className="bg-secondary/50 border-white/5 font-headline h-11 rounded-xl" disabled={isSaving} />
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Descripción</Label>
                  <Input placeholder="Ej: Rejilla de fundición superior" value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-secondary/50 border-white/5 h-11 rounded-xl" disabled={isSaving} />
                </div>
              </>
            )}

            {/* MODO: Material del Catálogo */}
            {mode === "existing_material" && (
              <div className="space-y-3">
                <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Buscar en Catálogo</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Código o descripción..."
                    value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)}
                    className="pl-10 bg-secondary/50 border-white/5 h-11 rounded-xl" />
                </div>

                {selectedMaterial && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
                    <img src={selectedMaterial.photoUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div>
                      <p className="text-sm font-headline text-accent">{selectedMaterial.materialCode}</p>
                      <p className="text-xs text-muted-foreground uppercase">{selectedMaterial.description}</p>
                    </div>
                  </div>
                )}

                <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-secondary/10 p-2">
                  {filteredCatalog.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Sin resultados</p>
                  ) : filteredCatalog.map(m => (
                    <button key={m.id} onClick={() => setSelectedMaterialId(m.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${selectedMaterialId === m.id ? "bg-accent/10 border border-accent/20" : "hover:bg-secondary/40"}`}>
                      <img src={m.photoUrl} className="w-9 h-9 rounded-md object-cover flex-shrink-0" alt="" />
                      <div className="min-w-0">
                        <p className="text-xs font-headline text-accent truncate">{m.materialCode}</p>
                        <p className="text-[10px] text-muted-foreground uppercase truncate">{m.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Productos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">Productos Compatibles</Label>
                {selectedProductIds.length > 0 && (
                  <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 text-[9px] h-4">
                    {selectedProductIds.length} seleccionado{selectedProductIds.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/5 bg-secondary/10 p-2">
                {productsList.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">No hay productos en el catálogo</p>
                ) : productsList.map(p => {
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

              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3 text-accent" />
                  O ingresá un código nuevo para crear el producto
                </p>
                <Input placeholder="Ej: ECO-STOVE-200" value={newProductCode}
                  onChange={(e) => setNewProductCode(e.target.value.toUpperCase())}
                  className="bg-secondary/50 border-white/5 font-headline h-10 rounded-xl text-sm" disabled={isSaving} />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-red-400 text-xs bg-red-500/10 p-3.5 rounded-xl border border-red-500/10">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 text-green-400 text-xs bg-green-500/10 p-3.5 rounded-xl border border-green-500/10">
                <Check className="h-4 w-4 shrink-0" /><span>¡Guardado con éxito en el catálogo!</span>
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving || success}
              className="w-full h-12 text-md font-headline tracking-wide uppercase bg-accent text-background hover:bg-accent/90 rounded-xl">
              {isSaving ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Guardando...</>)
                : success ? "¡Guardado!" : "Guardar en Catálogo"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
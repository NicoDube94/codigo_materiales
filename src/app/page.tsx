"use client"

import * as React from "react"
import { Search, Package, Box, Filter, ArrowRight, ChevronDown, MoreVertical, X, Plus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getStore, type Product } from "@/lib/storage"
import { AddProductDrawer } from "@/components/AddProductDrawer"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function Dashboard() {
  const [search, setSearch] = React.useState("")
  const [products, setProducts] = React.useState<Product[]>([])
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [activePhoto, setActivePhoto] = React.useState<string | null>(null)
  
  // Nuevo estado para manejar la carga asíncrona de la base de datos
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        const storeData = await getStore()
        setProducts(storeData || [])
      } catch (error) {
        console.error("Error al cargar los productos de la base de datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [refreshKey])

  const filteredProducts = products.filter(p => 
    p.productCode.toLowerCase().includes(search.toLowerCase()) ||
    p.materials.some(m => m.materialCode.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="flex flex-col min-h-screen pb-24 max-w-md mx-auto relative bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-headline tracking-tighter">MateriLog</h1>
          </div>
          <div className="flex items-center gap-2">
            <AddProductDrawer onAdded={() => setRefreshKey(prev => prev + 1)} />
            <Badge variant="outline" className="border-accent/30 text-accent font-headline text-[10px] hidden sm:inline-flex">RELIABLE SYSTEM</Badge>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar producto o material..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/40 border-white/5 rounded-xl h-12 focus:ring-accent/50"
            disabled={isLoading}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground">
            <Loader2 className="w-10 h-10 mb-4 animate-spin text-accent" />
            <p className="font-headline uppercase tracking-widest text-sm text-accent/80">Sincronizando Catálogo...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Box className="w-16 h-16 mb-4" />
            <p className="font-headline uppercase tracking-widest text-sm">Sin Registros</p>
            <p className="text-xs mt-1">Usa el botón inferior para comenzar</p>
          </div>
        ) : (
          <Accordion type="multiple" defaultValue={filteredProducts.map(p => p.id)} className="space-y-3">
            {filteredProducts.map((product) => (
              <AccordionItem key={product.id} value={product.id} className="border-none">
                <Card className="overflow-hidden border-white/5 bg-secondary/20 rounded-2xl shadow-none">
                  <AccordionTrigger className="px-4 py-4 hover:no-underline">
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">PRODUCTO</span>
                        <span className="text-lg font-headline tracking-wide">{product.productCode}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-muted-foreground">
                        <span className="text-xs font-headline">{product.materials.length} ITEM</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-0 pt-1">
                    <div className="border-t border-white/5 divide-y divide-white/5">
                      {product.materials.map((material) => (
                        <div key={material.id} className="p-4 flex gap-4 bg-black/10 active:bg-accent/5 transition-colors">
                          <div 
                            onClick={() => setActivePhoto(material.photoUrl)}
                            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted cursor-zoom-in active:scale-95 hover:scale-105 transition-all duration-200 border border-white/5"
                            title="Ver en pantalla completa"
                          >
                            <img 
                              src={material.photoUrl} 
                              alt={material.materialCode}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col justify-center flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-headline tracking-tight text-accent truncate">{material.materialCode}</span>
                              <span className="text-[9px] text-muted-foreground tabular-nums">
                                {new Date(material.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-tight line-clamp-2 uppercase font-medium">
                              {material.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </main>

      {/* Botón flotante unificado para Nuevo Registro */}
      <AddProductDrawer 
        onAdded={() => setRefreshKey(prev => prev + 1)} 
        trigger={
          <Button className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 flex items-center justify-center">
            <Plus className="h-8 w-8 text-white" />
          </Button>
        }
      />

      {/* Lightbox / Visor de Fotos en Pantalla Completa */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300 animate-in fade-in cursor-zoom-out"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setActivePhoto(null)
            }}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={activePhoto} 
            alt="Material ampliado" 
            className="max-w-[90vw] max-h-[82vh] rounded-2xl object-contain shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  )
}
"use client"

import * as React from "react"
import { Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImportFileButtonProps {
  onImported?: () => void
}

export function ImportFileButton({ onImported }: ImportFileButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    setIsLoading(true)

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || "Error al importar el archivo.")
      }

      onImported?.()
      alert(`Importación correcta: ${data.imported ?? 0} registros cargados.`)
    } catch (error) {
      console.error("Error importando archivo:", error)
      alert(error instanceof Error ? error.message : "No se pudo importar el archivo.")
    } finally {
      setIsLoading(false)
      event.target.value = ""
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="h-9 gap-2 border-accent/20 bg-accent/5 hover:bg-accent/10 hover:text-accent font-headline text-[11px] tracking-wide uppercase rounded-lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <Upload className="h-3.5 w-3.5" />
            Excel/CSV
          </>
        )}
      </Button>
    </>
  )
}

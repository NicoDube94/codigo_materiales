import { Settings2 } from "lucide-react"

interface MaterialImageProps {
  photoUrl?: string | null
  className?: string
  iconSize?: number
}

export function MaterialImage({ photoUrl, className = "", iconSize = 24 }: MaterialImageProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt="material"
        className={`object-cover ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center bg-secondary/40 border border-white/5 ${className}`}>
      <Settings2
        style={{ width: iconSize, height: iconSize }}
        className="text-muted-foreground/40"
        strokeWidth={1.2}
      />
    </div>
  )
}
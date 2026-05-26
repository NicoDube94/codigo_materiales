"use client"

import { Cpu } from "lucide-react";

export function ScannerOverlay({ isScanning }: { isScanning: boolean }) {
  if (!isScanning) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-64 h-64 border-2 border-accent/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(68,216,216,0.2)]">
        <div className="absolute inset-0 scan-overlay" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <Cpu className="w-12 h-12 text-accent animate-pulse" />
          <p className="text-accent font-headline text-sm tracking-wider uppercase">Analizando Etiqueta</p>
        </div>
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent" />
      </div>
    </div>
  );
}

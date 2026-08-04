"use client";

import { useRef, useEffect } from "react";
import { Monitor, MonitorOff, Scan, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreenCaptureProps {
  isCapturing: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export default function ScreenCapture({
  isCapturing,
  error,
  onStart,
  onStop,
}: ScreenCaptureProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-chess-accent font-bold text-lg flex items-center gap-2">
          <Scan className="w-5 h-5" />
          Screen Capture
        </h2>
        <div
          className={cn(
            "px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5",
            isCapturing
              ? "bg-chess-green/20 text-chess-green"
              : "bg-gray-500/20 text-gray-400"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", isCapturing ? "bg-chess-green animate-pulse" : "bg-gray-500")} />
          {isCapturing ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Izinkan screen capture buat detect papan catur chess.com otomatis. 
        Engine bakal analyze tiap 2 detik dan kasih notif best move.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        onClick={isCapturing ? onStop : onStart}
        className={cn(
          "w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
          isCapturing
            ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
            : "bg-chess-accent hover:bg-chess-accent/90 text-white shadow-lg shadow-chess-accent/25"
        )}
      >
        {isCapturing ? (
          <>
            <MonitorOff className="w-5 h-5" />
            Stop Capture
          </>
        ) : (
          <>
            <Monitor className="w-5 h-5" />
            Start Screen Capture
          </>
        )}
      </button>

      {isCapturing && (
        <div className="mt-4 p-3 bg-chess-green/10 border border-chess-green/30 rounded-xl">
          <div className="flex items-center gap-2 text-chess-green text-sm">
            <Scan className="w-4 h-4 animate-pulse" />
            <span>Scanning screen tiap 2 detik...</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Pilih tab/window chess.com di dialog berikutnya
          </p>
        </div>
      )}
    </div>
  );
}

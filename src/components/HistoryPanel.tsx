"use client";

import { Clock, Trash2 } from "lucide-react";

interface HistoryEntry {
  fen: string;
  move: string;
  eval: number;
  time: string;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (fen: string) => void;
  onClear: () => void;
}

export default function HistoryPanel({ history, onSelect, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
        <p>Belum ada analisis</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-chess-accent font-bold text-lg">📜 Riwayat Analisis</h2>
        <button
          onClick={onClear}
          className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          title="Hapus semua"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {history.map((entry, i) => (
          <button
            key={i}
            onClick={() => onSelect(entry.fen)}
            className="w-full flex items-center justify-between bg-black/20 hover:bg-black/30 rounded-xl px-4 py-3 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <span className="text-chess-green font-bold font-mono">{entry.move}</span>
              <span className={entry.eval > 0 ? "text-chess-green text-sm" : "text-chess-accent text-sm"}>
                {entry.eval > 0 ? "+" : ""}{entry.eval.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock className="w-3 h-3" />
              {entry.time}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

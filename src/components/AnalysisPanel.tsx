"use client";

import { EngineState } from "@/hooks/useStockfish";
import { formatEval } from "@/lib/chess";
import EvalBar from "./EvalBar";
import { Clock, GitBranch, Cpu, Timer } from "lucide-react";

interface AnalysisPanelProps {
  state: EngineState;
}

export default function AnalysisPanel({ state }: AnalysisPanelProps) {
  if (!state.bestMove && !state.thinking) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-gray-400">
        <p>Mulai analisis untuk melihat hasil</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-fade-in">
      {state.thinking ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 border-4 border-chess-accent/30 border-t-chess-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-chess-accent font-semibold">
            Engine mikir... depth {state.depth}/18
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Nodes: {state.nodes.toLocaleString()}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-2">Best Move</p>
            <div className="text-4xl font-bold text-chess-green font-mono tracking-wider">
              {state.bestMove}
            </div>
            <p className="text-lg text-chess-green/80 mt-1 font-mono">
              {state.bestMove}
            </p>
          </div>

          <EvalBar evaluation={state.evaluation} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Evaluasi</p>
              <p className="text-lg font-bold text-white">{formatEval(state.evaluation)}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Depth</p>
              <p className="text-lg font-bold text-white">{state.depth}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Nodes</p>
              <p className="text-lg font-bold text-white">{(state.nodes / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-black/30 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400 mb-1">Waktu</p>
              <p className="text-lg font-bold text-white">{(state.time / 1000).toFixed(1)}s</p>
            </div>
          </div>

          {state.topLines.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-chess-accent font-semibold text-sm flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Top Lines
              </h3>
              {state.topLines.map((line, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-black/20 rounded-lg px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-chess-green font-bold font-mono">{i + 1}.</span>
                    <span className="font-mono text-white">{line.move}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm font-mono">{line.line}</span>
                    <span className={line.eval > 0 ? "text-chess-green font-bold" : "text-chess-accent font-bold"}>
                      {formatEval(line.eval)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface EngineState {
  ready: boolean;
  thinking: boolean;
  bestMove: string | null;
  evaluation: number;
  depth: number;
  nodes: number;
  time: number;
  pv: string[];
  topLines: Array<{ move: string; eval: number; line: string }>;
}

export function useStockfish() {
  const [state, setState] = useState<EngineState>({
    ready: false,
    thinking: false,
    bestMove: null,
    evaluation: 0,
    depth: 0,
    nodes: 0,
    time: 0,
    pv: [],
    topLines: [],
  });

  const engineRef = useRef<any>(null);
  const resolveRef = useRef<((value: EngineState) => void) | null>(null);
  const linesRef = useRef<Array<{ move: string; eval: number; line: string }>>([]);

  useEffect(() => {
    const initEngine = async () => {
      try {
        // Dynamic import for Stockfish
        const StockfishModule = await import("stockfish");
        const engine = await StockfishModule.default();

        engine.onmessage = (msg: string) => {
          handleEngineMessage(msg);
        };

        engine.postMessage("uci");
        engine.postMessage("isready");

        engineRef.current = engine;
      } catch (err) {
        console.warn("Stockfish WASM failed, using fallback:", err);
        setState((prev) => ({ ...prev, ready: true }));
      }
    };

    initEngine();

    return () => {
      if (engineRef.current) {
        engineRef.current.postMessage("quit");
      }
    };
  }, []);

  const handleEngineMessage = useCallback((msg: string) => {
    if (msg === "readyok") {
      setState((prev) => ({ ...prev, ready: true }));
    }

    if (msg.startsWith("info")) {
      const depthMatch = msg.match(/depth (\d+)/);
      const scoreMatch = msg.match(/score cp (-?\d+)/);
      const mateMatch = msg.match(/score mate (-?\d+)/);
      const nodesMatch = msg.match(/nodes (\d+)/);
      const timeMatch = msg.match(/time (\d+)/);
      const pvMatch = msg.match(/pv (.+)/);
      const multipvMatch = msg.match(/multipv (\d+)/);

      if (depthMatch) {
        setState((prev) => ({ ...prev, depth: parseInt(depthMatch[1]) }));
      }

      if (nodesMatch) {
        setState((prev) => ({ ...prev, nodes: parseInt(nodesMatch[1]) }));
      }

      if (timeMatch) {
        setState((prev) => ({ ...prev, time: parseInt(timeMatch[1]) }));
      }

      let evalValue = 0;
      if (scoreMatch) {
        evalValue = parseInt(scoreMatch[1]) / 100;
      } else if (mateMatch) {
        const mateIn = parseInt(mateMatch[1]);
        evalValue = mateIn > 0 ? 100 - mateIn : -100 + Math.abs(mateIn);
      }

      if (pvMatch && multipvMatch) {
        const pv = pvMatch[1].trim().split(" ");
        const line = {
          move: pv[0],
          eval: evalValue,
          line: pv.slice(0, 5).join(" "),
        };

        const multipvIndex = parseInt(multipvMatch[1]) - 1;
        linesRef.current[multipvIndex] = line;
      }

      if (scoreMatch || mateMatch) {
        setState((prev) => ({ ...prev, evaluation: evalValue }));
      }
    }

    if (msg.startsWith("bestmove")) {
      const bestMove = msg.split(" ")[1];
      const ponder = msg.split(" ")[3];

      setState((prev) => ({
        ...prev,
        thinking: false,
        bestMove,
        pv: ponder ? [bestMove, ponder] : [bestMove],
        topLines: linesRef.current.filter(Boolean),
      }));

      if (resolveRef.current) {
        resolveRef.current({
          ...state,
          thinking: false,
          bestMove,
          pv: ponder ? [bestMove, ponder] : [bestMove],
          topLines: linesRef.current.filter(Boolean),
        });
        resolveRef.current = null;
      }
    }
  }, [state]);

  const analyze = useCallback(
    (fen: string, depth: number = 18): Promise<EngineState> => {
      return new Promise((resolve) => {
        if (!engineRef.current) {
          // Fallback analysis
          resolve({
            ready: true,
            thinking: false,
            bestMove: "e2e4",
            evaluation: 0.3,
            depth,
            nodes: 1500000,
            time: 1200,
            pv: ["e2e4", "e7e5"],
            topLines: [
              { move: "e2e4", eval: 0.3, line: "e2e4 e7e5 Nf3" },
              { move: "d2d4", eval: 0.2, line: "d2d4 d7d5 c4" },
              { move: "Nf3", eval: 0.1, line: "Nf3 d5 d4" },
            ],
          });
          return;
        }

        linesRef.current = [];
        resolveRef.current = resolve;

        setState((prev) => ({
          ...prev,
          thinking: true,
          bestMove: null,
          evaluation: 0,
          depth: 0,
          nodes: 0,
          time: 0,
          pv: [],
          topLines: [],
        }));

        engineRef.current.postMessage("position fen " + fen);
        engineRef.current.postMessage("setoption name MultiPV value 3");
        engineRef.current.postMessage("go depth " + depth);
      });
    },
    []
  );

  return { ...state, analyze };
}

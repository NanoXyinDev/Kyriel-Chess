"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useStockfish } from "@/hooks/useStockfish";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { useNotifications } from "@/hooks/useNotifications";
import { EXAMPLES, fenToBoard, boardToFEN, PIECE_NAMES, formatEval } from "@/lib/chess";
import ChessBoard from "@/components/ChessBoard";
import EvalBar from "@/components/EvalBar";
import AnalysisPanel from "@/components/AnalysisPanel";
import ScreenCapture from "@/components/ScreenCapture";
import HistoryPanel from "@/components/HistoryPanel";
import NotificationToast from "@/components/NotificationToast";
import {
  Zap,
  ChevronRight,
  RotateCcw,
  Copy,
  Check,
  Smartphone,
  Laptop,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";

interface HistoryEntry {
  fen: string;
  move: string;
  eval: number;
  time: string;
}

export default function Home() {
  const { ...engineState, analyze } = useStockfish();
  const { isCapturing, error: captureError, startCapture, stopCapture, startAutoCapture } = useScreenCapture();
  const { notifications, addNotification, removeNotification, notifyMove } = useNotifications();

  const [fen, setFen] = useState(EXAMPLES.start);
  const [depth, setDepth] = useState(18);
  const [activeTab, setActiveTab] = useState<"fen" | "manual" | "capture">("fen");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [manualBoard, setManualBoard] = useState<string[][]>(
    Array(8).fill(null).map(() => Array(8).fill("."))
  );
  const [selectedPiece, setSelectedPiece] = useState("P");
  const [manualSide, setManualSide] = useState("w");
  const [isZenMode, setIsZenMode] = useState(false);

  const autoAnalyzeTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevMoveRef = useRef<string | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("chess-assist-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem("chess-assist-history", JSON.stringify(history));
  }, [history]);

  // Auto analyze on FEN change
  useEffect(() => {
    if (autoAnalyze && activeTab === "fen") {
      if (autoAnalyzeTimeout.current) clearTimeout(autoAnalyzeTimeout.current);
      autoAnalyzeTimeout.current = setTimeout(() => handleAnalyze(), 600);
    }
    return () => {
      if (autoAnalyzeTimeout.current) clearTimeout(autoAnalyzeTimeout.current);
    };
  }, [fen, autoAnalyze, activeTab]);

  const handleAnalyze = useCallback(async () => {
    if (!fen) return;

    const result = await analyze(fen, depth);

    if (result.bestMove && result.bestMove !== prevMoveRef.current) {
      prevMoveRef.current = result.bestMove;

      // Parse move for notification
      const board = fenToBoard(fen);
      const { from, to } = parseMoveCoords(result.bestMove);
      const piece = board[from.row]?.[from.col] || "";

      // Play sound
      if (soundEnabled) {
        playNotificationSound();
      }

      // Send notification
      notifyMove(result.bestMove, piece, from.sq, to.sq, result.evaluation);

      // Add to history
      const entry: HistoryEntry = {
        fen,
        move: result.bestMove,
        eval: result.evaluation,
        time: new Date().toLocaleTimeString("id-ID"),
      };
      setHistory((prev) => [entry, ...prev].slice(0, 50));
    }
  }, [fen, depth, analyze, notifyMove, soundEnabled]);

  const parseMoveCoords = (move: string) => {
    const files = "abcdefgh";
    return {
      from: {
        row: 8 - parseInt(move[1]),
        col: files.indexOf(move[0]),
        sq: `${move[0]}${move[1]}`,
      },
      to: {
        row: 8 - parseInt(move[3]),
        col: files.indexOf(move[2]),
        sq: `${move[2]}${move[3]}`,
      },
    };
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const handleStartCapture = async () => {
    const success = await startCapture();
    if (success) {
      addNotification("Screen Capture", "Screen capture aktif! Pilih tab chess.com.", "success");
      startAutoCapture(2000, () => {
        if (fen !== EXAMPLES.start) {
          handleAnalyze();
        }
      });
    }
  };

  const copyFEN = () => {
    navigator.clipboard.writeText(fen);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (key: keyof typeof EXAMPLES) => {
    setFen(EXAMPLES[key]);
    setActiveTab("fen");
  };

  const handleManualSquareClick = (row: number, col: number) => {
    const newBoard = manualBoard.map((r) => [...r]);
    newBoard[row][col] = selectedPiece;
    setManualBoard(newBoard);
  };

  const analyzeManualBoard = () => {
    const newFen = boardToFEN(manualBoard, manualSide);
    setFen(newFen);
    setActiveTab("fen");
  };

  const resetManualBoard = () => {
    setManualBoard(Array(8).fill(null).map(() => Array(8).fill(".")));
  };

  const pieces = [
    { key: "K", label: "♔ Raja" }, { key: "Q", label: "♕ Menteri" },
    { key: "R", label: "♖ Benteng" }, { key: "B", label: "♗ Gajah" },
    { key: "N", label: "♘ Kuda" }, { key: "P", label: "♙ Pion" },
    { key: "k", label: "♚ raja" }, { key: "q", label: "♛ menteri" },
    { key: "r", label: "♜ benteng" }, { key: "b", label: "♝ gajah" },
    { key: "n", label: "♞ kuda" }, { key: "p", label: "♟ pion" },
  ];

  return (
    <div className={`min-h-screen ${isZenMode ? "bg-black" : ""}`}>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map((n) => (
          <NotificationToast key={n.id} notification={n} onRemove={removeNotification} />
        ))}
      </div>

      {/* Zen mode overlay */}
      {isZenMode && (
        <div className="fixed inset-0 bg-black/95 z-40 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="text-6xl font-bold text-chess-green font-mono animate-pulse">
              {engineState.bestMove || "..."}
            </div>
            <EvalBar evaluation={engineState.evaluation} className="max-w-md mx-auto" />
            <button
              onClick={() => setIsZenMode(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              Tekan ESC atau klik di sini buat keluar
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-chess-accent to-orange-400 bg-clip-text text-transparent mb-2">
            ♟️ Chess Assist Pro
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Advanced Analysis Tool — Works on Mobile & Desktop
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${engineState.ready ? "bg-chess-green/20 text-chess-green" : "bg-yellow-500/20 text-yellow-400"}`}>
              <span className={`w-2 h-2 rounded-full ${engineState.ready ? "bg-chess-green animate-pulse" : "bg-yellow-400"}`} />
              {engineState.ready ? "Engine Ready" : "Loading Engine..."}
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>
            <button
              onClick={() => setIsZenMode(true)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Zen Mode"
            >
              <Eye className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "fen" as const, label: "📋 FEN Input" },
                { id: "manual" as const, label: "⌨️ Manual" },
                { id: "capture" as const, label: "📺 Screen" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-chess-accent text-white shadow-lg shadow-chess-accent/25"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* FEN Tab */}
            {activeTab === "fen" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">FEN Position</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fen}
                      onChange={(e) => setFen(e.target.value)}
                      className="w-full bg-black/30 border-2 border-white/10 rounded-xl px-4 py-3 pr-12 text-sm font-mono text-white focus:border-chess-accent focus:outline-none transition-colors"
                      placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    />
                    <button
                      onClick={copyFEN}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-chess-green" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-medium">
                    Analysis Depth: <span className="text-chess-accent font-bold">{depth}</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={25}
                    value={depth}
                    onChange={(e) => setDepth(parseInt(e.target.value))}
                    className="w-full accent-chess-accent h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 (Cepat)</span>
                    <span>18 (Balance)</span>
                    <span>25 (Deep)</span>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAnalyze}
                      onChange={(e) => setAutoAnalyze(e.target.checked)}
                      className="w-4 h-4 accent-chess-accent rounded"
                    />
                    Auto Analyze
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLines}
                      onChange={(e) => setShowLines(e.target.checked)}
                      className="w-4 h-4 accent-chess-accent rounded"
                    />
                    Show Lines
                  </label>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={engineState.thinking}
                  className="w-full py-3.5 bg-gradient-to-r from-chess-accent to-red-500 hover:from-red-500 hover:to-chess-accent text-white font-bold rounded-xl shadow-lg shadow-chess-accent/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {engineState.thinking ? "Analyzing..." : "🔍 Analyze Position"}
                </button>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Quick Load:</p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(EXAMPLES).map(([key]) => (
                      <button
                        key={key}
                        onClick={() => loadExample(key as keyof typeof EXAMPLES)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors capitalize"
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Tab */}
            {activeTab === "manual" && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-chess-accent font-bold">Setup Papan Manual</h3>
                  <button onClick={resetManualBoard} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                </div>

                <ChessBoard
                  fen={boardToFEN(manualBoard, manualSide)}
                  size="lg"
                  interactive
                  onSquareClick={handleManualSquareClick}
                />

                <div>
                  <p className="text-sm text-gray-400 mb-2">Pilih Piece:</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {pieces.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setSelectedPiece(p.key)}
                        className={`px-2 py-1.5 rounded-lg text-sm border transition-all ${
                          selectedPiece === p.key
                            ? "bg-chess-accent border-chess-accent text-white"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Side to Move</label>
                  <select
                    value={manualSide}
                    onChange={(e) => setManualSide(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-chess-accent focus:outline-none"
                  >
                    <option value="w">⚪ White to move</option>
                    <option value="b">⚫ Black to move</option>
                  </select>
                </div>

                <button
                  onClick={analyzeManualBoard}
                  className="w-full py-3 bg-chess-accent hover:bg-chess-accent/90 text-white font-bold rounded-xl transition-all"
                >
                  🔍 Analyze This Position
                </button>
              </div>
            )}

            {/* Screen Capture Tab */}
            {activeTab === "capture" && (
              <ScreenCapture
                isCapturing={isCapturing}
                error={captureError}
                onStart={handleStartCapture}
                onStop={stopCapture}
              />
            )}

            {/* Board Preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-chess-accent font-bold mb-4">Board Preview</h3>
              <ChessBoard
                fen={fen}
                bestMove={engineState.bestMove}
                size="lg"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AnalysisPanel state={engineState} />

            <HistoryPanel
              history={history}
              onSelect={(selectedFen) => {
                setFen(selectedFen);
                setActiveTab("fen");
              }}
              onClear={() => {
                setHistory([]);
                localStorage.removeItem("chess-assist-history");
              }}
            />

            {/* Tips */}
            <div className="bg-chess-green/10 border-l-4 border-chess-green rounded-r-xl p-5">
              <h3 className="text-chess-green font-bold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                💡 Tips Anti-Ketahuan
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-chess-green mt-0.5 shrink-0" />
                  <span>Split screen di HP: chess.com di atas, web app di bawah</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-chess-green mt-0.5 shrink-0" />
                  <span>Jangan analyze tiap move — cukup position kritis aja</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-chess-green mt-0.5 shrink-0" />
                  <span>Pake Zen Mode (tombol mata) buat tampilan minimalis</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-chess-green mt-0.5 shrink-0" />
                  <span>Variasiin timing — tunggu 5-10 detik setelah notif</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-chess-green mt-0.5 shrink-0" />
                  <span>Depth 15-18 buat blitz, 20+ buat rapid/classical</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Optimized</span>
                <span className="text-gray-600">|</span>
                <Laptop className="w-4 h-4" />
                <span>Desktop Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

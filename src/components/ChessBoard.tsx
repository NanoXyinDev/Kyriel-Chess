"use client";

import { PIECE_SYMBOLS, getMoveCoords } from "@/lib/chess";
import { cn } from "@/lib/utils";

interface ChessBoardProps {
  fen: string;
  bestMove?: string | null;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onSquareClick?: (row: number, col: number) => void;
  highlightedSquares?: number[];
}

export default function ChessBoard({
  fen,
  bestMove,
  size = "md",
  interactive = false,
  onSquareClick,
  highlightedSquares = [],
}: ChessBoardProps) {
  const position = fen.split(" ")[0];
  const rows = position.split("/");

  const moveCoords = bestMove ? getMoveCoords(bestMove) : null;

  const sizeClasses = {
    sm: "max-w-[200px]",
    md: "max-w-[320px]",
    lg: "max-w-[480px]",
  };

  // Parse board
  const board: string[][] = [];
  for (const rowStr of rows) {
    const row: string[] = [];
    for (const char of rowStr) {
      if (!isNaN(parseInt(char))) {
        for (let i = 0; i < parseInt(char); i++) row.push(".");
      } else {
        row.push(char);
      }
    }
    board.push(row);
  }

  const getSquareClass = (row: number, col: number): string => {
    const sqIndex = row * 8 + col;
    const isLight = (row + col) % 2 === 0;

    let classes = isLight ? "bg-[#f0d9b5] text-[#333]" : "bg-[#b58863] text-white";

    if (moveCoords) {
      if (sqIndex === moveCoords.from) {
        classes = "bg-[#4ecca3] text-[#333] shadow-[inset_0_0_0_3px_#2d8a6e]";
      } else if (sqIndex === moveCoords.to) {
        classes = "bg-[#ff6b6b] text-white shadow-[inset_0_0_0_3px_#c73e54]";
      }
    }

    if (highlightedSquares.includes(sqIndex)) {
      classes += " ring-2 ring-chess-accent ring-inset";
    }

    return classes;
  };

  return (
    <div className={cn("grid grid-cols-8 gap-[1px] border-2 border-[#555] rounded-lg overflow-hidden mx-auto", sizeClasses[size])}>
      {board.map((row, rowIdx) =>
        row.map((piece, colIdx) => (
          <button
            key={`${rowIdx}-${colIdx}`}
            className={cn(
              "aspect-square flex items-center justify-center text-2xl font-bold transition-all duration-200",
              getSquareClass(rowIdx, colIdx),
              interactive && "hover:brightness-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
            onClick={() => interactive && onSquareClick?.(rowIdx, colIdx)}
            disabled={!interactive}
          >
            {PIECE_SYMBOLS[piece] || ""}
          </button>
        ))
      )}
    </div>
  );
}

"use client";

// Chess piece symbols
export const PIECE_SYMBOLS: Record<string, string> = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

export const PIECE_NAMES: Record<string, string> = {
  K: "Raja", Q: "Menteri", R: "Benteng", B: "Gajah", N: "Kuda", P: "Pion",
  k: "raja", q: "menteri", r: "benteng", b: "gajah", n: "kuda", p: "pion",
};

// Convert FEN to board array
export function fenToBoard(fen: string): string[][] {
  const board: string[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill("."));

  const position = fen.split(" ")[0];
  const rows = position.split("/");

  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const char of rows[row]) {
      if (!isNaN(parseInt(char))) {
        col += parseInt(char);
      } else {
        board[row][col] = char;
        col++;
      }
    }
  }

  return board;
}

// Convert board array to FEN
export function boardToFEN(board: string[][], side: string = "w"): string {
  let fen = "";
  for (let row = 0; row < 8; row++) {
    let emptyCount = 0;
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === ".") {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          fen += emptyCount;
          emptyCount = 0;
        }
        fen += board[row][col];
      }
    }
    if (emptyCount > 0) fen += emptyCount;
    if (row < 7) fen += "/";
  }
  return `${fen} ${side} KQkq - 0 1`;
}

// Convert UCI move to SAN notation
export function uciToSan(move: string): string {
  if (!move || move.length < 4) return move;

  const files = "abcdefgh";
  const fromFile = files.indexOf(move[0]);
  const fromRank = parseInt(move[1]);
  const toFile = files.indexOf(move[2]);
  const toRank = parseInt(move[3]);

  const fromSq = `${files[fromFile]}${fromRank}`;
  const toSq = `${files[toFile]}${toRank}`;

  return `${fromSq} → ${toSq}`;
}

// Get piece from move
export function getPieceFromMove(board: string[][], move: string): string {
  if (!move || move.length < 4) return "";
  const files = "abcdefgh";
  const fromFile = files.indexOf(move[0]);
  const fromRank = 8 - parseInt(move[1]);
  return board[fromRank]?.[fromFile] || "";
}

// Get move coordinates for highlighting
export function getMoveCoords(move: string): { from: number; to: number } | null {
  if (!move || move.length < 4) return null;

  const files = "abcdefgh";
  const fromFile = files.indexOf(move[0]);
  const fromRank = 8 - parseInt(move[1]);
  const toFile = files.indexOf(move[2]);
  const toRank = 8 - parseInt(move[3]);

  return {
    from: fromRank * 8 + fromFile,
    to: toRank * 8 + toFile,
  };
}

// Format evaluation
export function formatEval(eval_: number): string {
  if (eval_ >= 100) return `M${Math.floor(100 - eval_)}`;
  if (eval_ <= -100) return `-M${Math.floor(100 + eval_)}`;
  return eval_ > 0 ? `+${eval_.toFixed(2)}` : eval_.toFixed(2);
}

// Get evaluation bar percentage
export function getEvalPercent(eval_: number): number {
  // Clamp between -10 and +10, map to 5-95%
  const clamped = Math.max(-10, Math.min(10, eval_));
  return ((clamped + 10) / 20) * 90 + 5;
}

// Example FENs
export const EXAMPLES = {
  start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  sicilian: "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
  fried: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
  checkmate: "r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
  endgame: "8/2k5/8/8/8/4K3/8/8 w - - 0 1",
  middlegame: "r1bq1rk1/ppp2ppp/2np1n2/1B2p3/1b2P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 1",
};

// Parse move to get from/to squares
export function parseMove(move: string): { from: string; to: string; piece: string } {
  if (!move || move.length < 4) return { from: "", to: "", piece: "" };

  const files = "abcdefgh";
  const from = `${move[0]}${move[1]}`;
  const to = `${move[2]}${move[3]}`;

  // Try to determine piece from context (simplified)
  const pieceMap: Record<string, string> = {
    a2: "P", b2: "P", c2: "P", d2: "P", e2: "P", f2: "P", g2: "P", h2: "P",
    a7: "p", b7: "p", c7: "p", d7: "p", e7: "p", f7: "p", g7: "p", h7: "p",
    g1: "N", b1: "N", g8: "n", b8: "n",
  };

  return { from, to, piece: pieceMap[from] || "" };
}

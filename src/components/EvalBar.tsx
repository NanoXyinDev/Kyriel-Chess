"use client";

import { getEvalPercent, formatEval } from "@/lib/chess";
import { cn } from "@/lib/utils";

interface EvalBarProps {
  evaluation: number;
  className?: string;
}

export default function EvalBar({ evaluation, className }: EvalBarProps) {
  const percent = getEvalPercent(evaluation);
  const isWhiteBetter = evaluation > 0;

  return (
    <div className={cn("relative h-8 bg-[#333] rounded-full overflow-hidden", className)}>
      <div
        className="h-full transition-all duration-700 ease-out rounded-full"
        style={{
          width: `${percent}%`,
          background: isWhiteBetter
            ? "linear-gradient(90deg, #4ecca3, #2d8a6e)"
            : "linear-gradient(90deg, #e94560, #c73e54)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-sm text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
          {formatEval(evaluation)}
        </span>
      </div>
    </div>
  );
}

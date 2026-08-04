"use client";

import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "move" | "warning" | "info" | "success";
  timestamp: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (title: string, message: string, type: Notification["type"] = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      const notif: Notification = {
        id,
        title,
        message,
        type,
        timestamp: Date.now(),
      };

      setNotifications((prev) => [notif, ...prev].slice(0, 20));

      // Auto remove after 8 seconds
      setTimeout(() => {
        removeNotification(id);
      }, 8000);

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper to create chess move notification
  const notifyMove = useCallback(
    (move: string, piece: string, from: string, to: string, eval_: number) => {
      const pieceNames: Record<string, string> = {
        K: "Raja", Q: "Menteri", R: "Benteng", B: "Gajah", N: "Kuda", P: "Pion",
        k: "raja", q: "menteri", r: "benteng", b: "gajah", n: "kuda", p: "pion",
      };

      const pieceName = pieceNames[piece] || piece;
      const evalText = eval_ > 0 ? `+${eval_.toFixed(1)}` : eval_.toFixed(1);

      const messages = [
        `Bang, lu harus jalan ${pieceName} ${from} ke ${to}!`,
        `Bro, pindahin ${pieceName} dari ${from} ke ${to}, mantep nih!`,
        `Boss, ${pieceName} ${from} → ${to}, eval ${evalText}`,
        `Gas ${pieceName} ${from} ke ${to} bang!`,
        `Move terbaik: ${pieceName} ${from} ke ${to}`,
      ];

      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      return addNotification(
        `🎯 Best Move (Eval: ${evalText})`,
        randomMsg,
        "move"
      );
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notifyMove,
  };
}

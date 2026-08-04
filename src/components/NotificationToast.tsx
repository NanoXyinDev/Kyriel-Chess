"use client";

import { useEffect, useState } from "react";
import { X, Move, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const typeConfig = {
  move: { icon: Move, color: "bg-chess-green/20 border-chess-green text-chess-green", iconColor: "text-chess-green" },
  warning: { icon: AlertTriangle, color: "bg-yellow-500/20 border-yellow-500 text-yellow-400", iconColor: "text-yellow-400" },
  info: { icon: Info, color: "bg-blue-500/20 border-blue-500 text-blue-400", iconColor: "text-blue-400" },
  success: { icon: CheckCircle, color: "bg-chess-green/20 border-chess-green text-chess-green", iconColor: "text-chess-green" },
};

export default function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(notification.id), 300);
    }, 7500);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={cn(
        "relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg max-w-sm",
        config.color,
        isExiting ? "toast-exit" : "toast-enter"
      )}
    >
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm mb-1">{notification.title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{notification.message}</p>
        <span className="text-xs opacity-50 mt-2 block">
          {new Date(notification.timestamp).toLocaleTimeString("id-ID")}
        </span>
      </div>
      <button
        onClick={handleRemove}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

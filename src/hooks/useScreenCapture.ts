"use client";

import { useState, useRef, useCallback } from "react";

interface CaptureState {
  isCapturing: boolean;
  stream: MediaStream | null;
  error: string | null;
  lastFrame: ImageData | null;
}

export function useScreenCapture() {
  const [state, setState] = useState<CaptureState>({
    isCapturing: false,
    stream: null,
    error: null,
    lastFrame: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "browser",
        } as any,
        audio: false,
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      const canvas = document.createElement("canvas");
      canvasRef.current = canvas;

      setState((prev) => ({ ...prev, isCapturing: true, stream, error: null }));

      // Auto-stop when user stops sharing
      stream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };

      return true;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "Failed to capture screen",
      }));
      return false;
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState({
      isCapturing: false,
      stream: null,
      error: null,
      lastFrame: null,
    });
  }, [state.stream]);

  const captureFrame = useCallback((): ImageData | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    setState((prev) => ({ ...prev, lastFrame: imageData }));
    return imageData;
  }, []);

  const startAutoCapture = useCallback(
    (intervalMs: number = 2000, callback?: (frame: ImageData) => void) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const frame = captureFrame();
        if (frame && callback) {
          callback(frame);
        }
      }, intervalMs);
    },
    [captureFrame]
  );

  const detectChessBoard = useCallback((): { x: number; y: number; width: number; height: number } | null => {
    const frame = state.lastFrame;
    if (!frame) return null;

    const { width, height, data } = frame;

    // Simple detection: look for checkerboard pattern
    // In real implementation, this would use more sophisticated CV
    // For now, return center of screen as approximation
    return {
      x: Math.floor(width * 0.2),
      y: Math.floor(height * 0.1),
      width: Math.floor(width * 0.6),
      height: Math.floor(height * 0.8),
    };
  }, [state.lastFrame]);

  return {
    ...state,
    startCapture,
    stopCapture,
    captureFrame,
    startAutoCapture,
    detectChessBoard,
  };
}

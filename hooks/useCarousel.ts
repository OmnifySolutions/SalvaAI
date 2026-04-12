"use client";

import { useState, useEffect } from "react";

const TRANSITION_MS = 650;

export function useCarousel(n: number, intervalMs = 6000) {
  const [position, setPosition] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setPosition((p) => p + 1);
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  useEffect(() => {
    if (position !== n) return;
    let rafId = 0;
    const timeout = setTimeout(() => {
      setAnimate(false);
      setPosition(0);
      rafId = requestAnimationFrame(() => setAnimate(true));
    }, TRANSITION_MS);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(rafId);
    };
  }, [position, n]);

  function jumpTo(i: number) {
    setAnimate(true);
    setPosition(i);
  }

  return { position, animate, jumpTo };
}

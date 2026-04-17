"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Props {
  text: string;
  /** Typing speed in ms per character */
  speed?: number;
  className?: string;
}

/**
 * Renders text character-by-character with a blinking cursor,
 * simulating a typewriter effect to sync with TTS narration.
 * Use with key={stageId} to reset on stage change.
 */
export function TypewriterText({ text, speed = 35, className = "" }: Props) {
  const [displayedCount, setDisplayedCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (displayedCount >= text.length) return;

    timerRef.current = setTimeout(() => {
      setDisplayedCount((prev) => prev + 1);
    }, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedCount, text.length, speed]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {text.slice(0, displayedCount)}
      {displayedCount < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle"
        />
      )}
    </motion.p>
  );
}

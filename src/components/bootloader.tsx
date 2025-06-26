"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReaderSettings } from "@/context/reader-settings-provider";

const bootSequence = [
  { text: "[ INITIATING BOOTLOADER ]", delay: 100 },
  { text: "> PAGEOS v1.0 — TERMINAL READER ENVIRONMENT", delay: 500 },
  { text: "> MEMLINK PROTOCOL: ACTIVE", delay: 300 },
  { text: "> LINKING NODE(S): GUTENDEX | STD_EBOOKS | OPENLIB |", delay: 300, isAccent: true },
  { text: "> MEMORY STREAM STATUS: ONLINE", delay: 300 },
  { text: "> DECODER ENGINE: READY", delay: 300, isAccent: true },
  { text: "progress", delay: 100 },
  { text: "> DECOMPRESSING SHELL ENVIRONMENT... OK", delay: 500 },
  { text: "> SESSION ID: CELERON-ALPHA-001", delay: 300 },
  { text: "> WELCOME TO PAGEOS", delay: 500, isAccent: true },
];

const ProgressBar = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500); // Give a moment to see 100%
          return 100;
        }
        return next;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  const filledChars = Math.floor(progress / 10);
  const emptyChars = 10 - filledChars;

  return (
    <p>
      {`> RETRIEVING BOOK INDEX [`}
      <span className="text-accent">{"▓".repeat(filledChars)}</span>
      <span>{"░".repeat(emptyChars)}</span>
      {`] ${Math.floor(progress)}%`}
    </p>
  );
};

const TypedLine = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    setTypedText('');
    const chars = text.split('');
    const typingInterval = setInterval(() => {
      if (chars.length > 0) {
        setTypedText(prev => prev + chars.shift());
      } else {
        clearInterval(typingInterval);
        onComplete();
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [text, onComplete]);

  return (
    <span>
      {typedText}
      <span className="cursor-blink ml-1 inline-block h-5 w-2.5 translate-y-1 bg-white" />
    </span>
  );
};

export function Bootloader({ onComplete }: { onComplete: () => void }) {
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [lines, setLines] = useState<{ text: string, isAccent?: boolean, isTyping?: boolean, id: number }[]>([]);
  const { showBootAnimation } = useReaderSettings();

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => e.key === "Escape" && handleSkip();
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    if (!showBootAnimation) {
      onComplete();
      return;
    }

    if (sequenceIndex >= bootSequence.length) {
      setTimeout(onComplete, 1000);
      return;
    }

    const currentItem = bootSequence[sequenceIndex];
    const timeoutId = setTimeout(() => {
      setLines(prev => {
        // remove typing flag from previous line
        const updated = prev.map(l => ({ ...l, isTyping: false }));
        // add new line with typing flag
        return [...updated, { ...currentItem, isTyping: true, id: Date.now() }];
      });
    }, currentItem.delay);

    return () => clearTimeout(timeoutId);
  }, [sequenceIndex, showBootAnimation, onComplete]);


  const handleLineComplete = () => {
    setSequenceIndex(prev => prev + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black font-body text-white cursor-pointer"
        onClick={handleSkip}
      >
        <div className="w-full max-w-3xl p-8">
          {lines.map(({ text, isAccent, isTyping, id }) => {
            if (text === "progress") {
              return <ProgressBar key={id} onComplete={handleLineComplete} />;
            }
            return (
              <p key={id} className={isAccent ? "text-accent" : ""}>
                {isTyping ? (
                  <TypedLine text={text} onComplete={handleLineComplete} />
                ) : (
                  text
                )}
              </p>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

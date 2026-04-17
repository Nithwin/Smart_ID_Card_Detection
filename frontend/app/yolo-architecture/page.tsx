"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { ScenarioToggle } from "./components/ScenarioToggle";
import { TimelineBar } from "./components/TimelineBar";
import { TypewriterText } from "./components/TypewriterText";

import { Stage1_InputPreprocessing } from "./components/stages/Stage1_InputPreprocessing";
import { Stage2_ConvFeatures } from "./components/stages/Stage2_ConvFeatures";
import { Stage3_C2fBottleneck } from "./components/stages/Stage3_C2fBottleneck";
import { Stage4_SPPF } from "./components/stages/Stage4_SPPF";
import { Stage5_CBAM } from "./components/stages/Stage5_CBAM";
import { Stage6_CoordAttention } from "./components/stages/Stage6_CoordAttention";
import { Stage7_NeckFusion } from "./components/stages/Stage7_NeckFusion";
import { Stage8_P2Head } from "./components/stages/Stage8_P2Head";
import { Stage9_DecoupledHead } from "./components/stages/Stage9_DecoupledHead";
import { Stage10_FinalOutput } from "./components/stages/Stage10_FinalOutput";

const TOTAL_STAGES = 10;
const TTS_RATE = 0.85;
// Avg English speech ≈ 150 WPM at rate=1. At 0.85 → ~128 WPM → ~2.13 words/sec.
// Avg word = ~5 chars + space = 6 → ~12.8 chars/sec → ~78ms per char at rate 0.85
const ESTIMATED_MS_PER_CHAR = 78;
const TRANSITION_DELAY_MS = 800; // wait for slide-in animation
const POST_SPEECH_PAUSE_MS = 3000; // pause after speech before next stage

const STAGE_TITLES = [
  "Input Preprocessing",
  "Convolutional Features",
  "C2f Bottleneck",
  "SPPF Pooling",
  "CBAM Attention ★",
  "Coordinate Attention ★",
  "Neck PANet Fusion",
  "P2 Micro-Head ★",
  "Decoupled Head",
  "Final Output",
];

const NARRATIONS = [
  "Stage one: Input Preprocessing. Imagine you take a photo from a security camera. Before our AI can understand it, we need to resize it into a perfect square, 640 by 640 pixels. Then we separate the image into its three color layers: Red, Green, and Blue. Think of it like splitting a color photo into three black and white photos, one for each color. This gives the AI a structured way to read the image, just like how your eyes process colors separately.",

  "Stage two: Feature Extraction with Convolutions. Now the AI scans the image using tiny sliding windows called filters. Imagine dragging a small magnifying glass across the image. At each position, the filter highlights patterns like edges, corners, and textures. After each scan, we shrink the image size in half but remember twice as many patterns. This is like taking notes: the image gets smaller, but the AI's understanding gets richer.",

  "Stage three: C2f Bottleneck. Here the data splits into two paths, like a highway fork. One path goes straight through unchanged, this is the shortcut, preserving the original information. The other path passes through extra processing blocks that extract deeper patterns. At the end, both paths merge back together. This clever design means the AI never forgets earlier details while still learning new ones.",

  "Stage four: Spatial Pyramid Pooling. The AI needs to understand the big picture, not just tiny details. SPPF runs three pooling operations back to back, each one looking at a wider area of the image. Think of it like zooming out three times: first you see a face, then a person, then the whole room. This helps the AI detect ID cards whether they are close up or far away in the frame.",

  "Stage five: CBAM Attention. This is our first custom upgrade to the standard model. CBAM works in two steps. First, Channel Attention asks: which types of features matter most? It boosts features related to ID card edges and suppresses irrelevant ones like wall textures. Then, Spatial Attention asks: where in the image should we focus? It creates a heat map highlighting the most important regions. Together, they act like a spotlight for the AI.",

  "Stage six: Coordinate Attention. This is our second custom upgrade. While CBAM looks at the image as a whole, Coordinate Attention scans horizontally and vertically separately, like reading a map with X and Y coordinates. The horizontal scan finds the left-right position, and the vertical scan finds the up-down position. Where these two scans intersect, the AI pinpoints exactly where the person and their ID card are located.",

  "Stage seven: Neck, Feature Fusion with PANet. The AI now has features at different zoom levels: small details from early layers and big-picture understanding from deep layers. The Neck merges all of these together. Features flow upward to add fine detail, then back downward to add context. Think of it like combining a close-up photo and a wide-angle photo into one super-detailed image that captures everything.",

  "Stage eight: P2 Small Object Head. This is our third custom upgrade. Standard YOLO only looks at three zoom levels. We added a fourth, extra-zoomed-in level called P2 that processes the image at 160 by 160 resolution. This is specifically designed to catch tiny objects that other detectors would miss, like a small ID card clipped to someone's belt or hanging from a lanyard. It is like adding a microscope to the system.",

  "Stage nine: Decoupled Detection Head. Now the AI needs to answer two questions: What is this object? And where exactly is it? Instead of trying to answer both with one brain, YOLOv8 uses two separate branches. The classification branch identifies if it is a person or an ID card. The regression branch calculates the precise bounding box coordinates. Splitting the work this way makes both answers more accurate.",

  "Stage ten: Final Output. All the predictions are collected and cleaned up. If multiple boxes overlap on the same object, we keep only the best one. This process is called Non-Maximum Suppression. The final result shows bounding boxes drawn on the original image with labels and confidence scores. If both a person and an ID card are detected together, the system marks them as Compliant. If no card is found, they are marked Non-Compliant and an alert is triggered.",
];

// Pre-calculate estimated TTS duration and matching typewriter speed for each narration
const STAGE_TIMING = NARRATIONS.map((text) => {
  const estimatedDurationMs = text.length * ESTIMATED_MS_PER_CHAR;
  // Typewriter should finish slightly before TTS (90% of duration)
  // Account for the 800ms transition delay
  const typingDurationMs = estimatedDurationMs * 0.9;
  const typewriterSpeed = Math.max(20, Math.floor(typingDurationMs / text.length));
  return {
    estimatedDurationMs,
    typewriterSpeed,
    // Fallback total time if no TTS: estimated duration + post-speech pause
    fallbackTotalMs: estimatedDurationMs + POST_SPEECH_PAUSE_MS,
  };
});

export default function YoloArchitecturePage() {
  const [currentStage, setCurrentStage] = useState(0);
  const [scenario, setScenario] = useState<"detected" | "not_detected">("detected");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speechActiveRef = useRef(false);

  // Reset to stage 0 when scenario changes
  const handleScenarioChange = useCallback((s: "detected" | "not_detected") => {
    setScenario(s);
    setCurrentStage(0);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Load voices (some browsers load them async)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoicesReady(true);
    };
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const advanceStage = useCallback(() => {
    setCurrentStage((prev) => (prev + 1) % TOTAL_STAGES);
  }, []);

  // Main autoplay engine — synced to TTS completion
  useEffect(() => {
    if (!isPlaying) return;

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    const timing = STAGE_TIMING[currentStage];

    // If muted or no TTS → use calculated fallback timing
    if (isMuted || typeof window === "undefined" || !window.speechSynthesis) {
      fallbackTimerRef.current = setTimeout(advanceStage, timing.fallbackTotalMs);
      return () => {
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      };
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    speechActiveRef.current = false;

    const utterance = new SpeechSynthesisUtterance(NARRATIONS[currentStage]);
    utterance.rate = TTS_RATE;
    utterance.pitch = 1;
    utterance.volume = 0.85;

    // Pick best available English voice
    if (voicesReady) {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google"))
                     || voices.find(v => v.lang.startsWith("en-US"))
                     || voices.find(v => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;
    }

    // When speech ends → pause → advance
    utterance.onend = () => {
      speechActiveRef.current = false;
      fallbackTimerRef.current = setTimeout(advanceStage, POST_SPEECH_PAUSE_MS);
    };

    utterance.onerror = () => {
      speechActiveRef.current = false;
      // Fallback if TTS fails entirely
      fallbackTimerRef.current = setTimeout(advanceStage, timing.fallbackTotalMs);
    };

    // Start after slide-in transition
    const startTimeout = setTimeout(() => {
      speechActiveRef.current = true;
      window.speechSynthesis.speak(utterance);
    }, TRANSITION_DELAY_MS);

    return () => {
      clearTimeout(startTimeout);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      window.speechSynthesis.cancel();
      speechActiveRef.current = false;
    };
  }, [currentStage, isPlaying, isMuted, advanceStage, voicesReady]);

  const handleJump = (stage: number) => {
    setCurrentStage(stage);
    setIsPlaying(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleTogglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (!next && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const renderStage = () => {
    switch (currentStage) {
      case 0: return <Stage1_InputPreprocessing scenario={scenario} />;
      case 1: return <Stage2_ConvFeatures scenario={scenario} />;
      case 2: return <Stage3_C2fBottleneck />;
      case 3: return <Stage4_SPPF />;
      case 4: return <Stage5_CBAM scenario={scenario} />;
      case 5: return <Stage6_CoordAttention scenario={scenario} />;
      case 6: return <Stage7_NeckFusion />;
      case 7: return <Stage8_P2Head scenario={scenario} />;
      case 8: return <Stage9_DecoupledHead />;
      case 9: return <Stage10_FinalOutput scenario={scenario} />;
      default: return null;
    }
  };

  const stageColors = [
    "bg-cyan-500", "bg-indigo-500", "bg-purple-500", "bg-orange-500",
    "bg-amber-500", "bg-pink-500", "bg-emerald-500", "bg-lime-500",
    "bg-rose-500", "bg-green-500",
  ];

  const currentTypewriterSpeed = STAGE_TIMING[currentStage].typewriterSpeed;

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-[1400px] mx-auto flex flex-col items-center gap-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
          CA-YOLOv8 Deep Pipeline
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Watch how our AI processes a security camera image step-by-step — from raw photo to final detection. Auto-plays with voice narration.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap justify-center">
        <ScenarioToggle scenario={scenario} onChange={handleScenarioChange} />
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
            isMuted
              ? "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
              : "bg-blue-500/20 text-blue-400 border-blue-500/50"
          }`}
        >
          {isMuted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          )}
          {isMuted ? "Unmute" : "Narration"}
        </button>
      </div>

      {/* Stage title */}
      <motion.div
        key={currentStage}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <span className="text-xs font-mono text-slate-500">STAGE {currentStage + 1}/{TOTAL_STAGES}</span>
        <h3 className="text-lg font-bold text-white">{STAGE_TITLES[currentStage]}</h3>
      </motion.div>

      {/* Main visualization area */}
      <div className="relative w-full flex-1 min-h-[520px] glass-panel rounded-3xl border border-slate-700/50 overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        {/* Ambient glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.07] pointer-events-none transition-colors duration-1000 ${stageColors[currentStage]}`} />

        {/* Stage content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -40, filter: "blur(8px)" }}
            transition={{ duration: 0.5 }}
            className="w-full h-full min-h-[520px] flex flex-col items-center justify-center"
          >
            {/* Animation */}
            <div className="flex-1 w-full flex items-center justify-center">
              {renderStage()}
            </div>

            {/* Synced typewriter narration at bottom */}
            <AnimatePresence>
              {!isMuted && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5 }}
                  className="w-full px-6 pb-6 pt-2"
                >
                  <div className="max-w-3xl mx-auto bg-black/40 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 min-h-[140px]">
                    <TypewriterText
                      key={currentStage}
                      text={NARRATIONS[currentStage]}
                      speed={currentTypewriterSpeed}
                      className="text-sm text-slate-300 leading-relaxed font-mono"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timeline bar */}
      <TimelineBar
        currentStage={currentStage}
        onJump={handleJump}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />
    </div>
  );
}

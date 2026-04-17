"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Activity } from "lucide-react";

export function BackboneView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col items-center justify-center space-y-12 py-10"
    >
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 drop-shadow-md">
          Backbone: Feature Extraction
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto">
          The Backbone (CSPDarknet modified) processes the raw image into a set of highly abstract feature maps. Standard Convolutions reduce spatial dimensions while increasing channel depth, looking for edges, corners, and textures.
        </p>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-center gap-10 w-full">
        {/* Raw Input */}
        <div className="relative group">
          <div className="w-32 h-32 border-2 border-slate-600 rounded-xl bg-slate-800 flex items-center justify-center shadow-lg relative overflow-hidden">
            <ImageIcon className="w-12 h-12 text-slate-500 opacity-50" />
            <motion.div 
              className="absolute inset-0 bg-blue-500/20 mix-blend-screen"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute top-0 w-full h-[2px] bg-blue-400 shadow-[0_0_10px_#60a5fa] animate-[scan_2s_linear_infinite]" />
          </div>
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-blue-400 font-bold whitespace-nowrap">Input: 640x640x3</span>
        </div>

        {/* Animated Tensor Flow */}
        <div className="hidden md:flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
        </div>

        {/* Feature Map Abstracting */}
        <div className="relative flex gap-1">
          {[64, 128, 256].map((channels, idx) => (
            <motion.div
              key={channels}
              className={`border border-indigo-500/40 bg-indigo-500/10 rounded-lg flex items-center justify-center drop-shadow-lg backdrop-blur-sm relative overflow-hidden`}
              style={{
                width: 100 - idx * 20,
                height: 100 - idx * 20,
                zIndex: 10 - idx
              }}
              initial={{ rotateY: 45, rotateX: 20 }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: idx * 0.5 }}
            >
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/40 to-transparent" />
              <span className="text-[10px] font-mono font-bold text-indigo-300 transform -skew-x-12 relative z-10">C{channels}</span>
            </motion.div>
          ))}
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-indigo-400 font-bold whitespace-nowrap">Feature Pyramids (P3, P4, P5)</span>
        </div>
      </div>
      
      <div className="glass-panel p-6 rounded-2xl border-indigo-500/20 max-w-2xl text-sm text-slate-300 flex items-start gap-4">
        <Activity className="w-8 h-8 text-indigo-400 shrink-0 mt-1" />
        <div>
          <p className="font-bold text-indigo-400 mb-1">Downsampling via Strided Conv</p>
          <p>YOLOv8 removes the old Focus layer and uses standard 3x3 convolutions with stride=2 to downsample the image. This progressively shrinks the grid size but expands the channel dimension, learning hierarchical object properties.</p>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles } from 'lucide-react';

interface AppLoaderProps {
  isLoading: boolean;
  message?: string;
  onClose?: () => void;
}

const HEARTH_STAGES = [
  'Igniting 450°C stone hearth & birch wood coals...',
  'Hand-stretching 48-hr slow-fermented Italian dough...',
  'Laying San Marzano DOP tomatoes & sweet basil...',
  'Melting fresh artisan mozzarella & Parmigiano-Reggiano...',
  'Baking with wood-fired stone craftsmanship...',
  'Readying your authentic Oasis Pizza experience...',
];

const EMBERS = [
  { id: 1, left: '20%', size: 4, delay: 0, duration: 2.8 },
  { id: 2, left: '28%', size: 3, delay: 0.6, duration: 3.2 },
  { id: 3, left: '38%', size: 5, delay: 1.2, duration: 2.5 },
  { id: 4, left: '46%', size: 3, delay: 0.3, duration: 3.0 },
  { id: 5, left: '54%', size: 6, delay: 0.9, duration: 2.7 },
  { id: 6, left: '62%', size: 4, delay: 1.5, duration: 3.4 },
  { id: 7, left: '72%', size: 3, delay: 0.4, duration: 2.9 },
  { id: 8, left: '80%', size: 5, delay: 1.1, duration: 3.1 },
  { id: 9, left: '33%', size: 4, delay: 1.8, duration: 2.6 },
  { id: 10, left: '67%', size: 4, delay: 2.1, duration: 2.8 },
];

export const AppLoader: React.FC<AppLoaderProps> = ({
  isLoading,
  message,
  onClose,
}) => {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    if (!isLoading) {
      setProgress(15);
      setStageIndex(0);
      return;
    }

    // Cycle stage messages
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % HEARTH_STAGES.length);
    }, 1800);

    // Smooth progress ticker
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return 96;
        const jump = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + jump, 96);
      });
    }, 400);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#140805] via-[#220E08] to-[#0D0403] text-white overflow-hidden select-none"
        >
          {/* Deep Ambient Fire Glow in Hearth Background */}
          <div className="absolute w-[620px] h-[620px] bg-gradient-to-tr from-[#D92D20]/25 via-[#F59E0B]/20 to-transparent rounded-full animate-hearth-glow pointer-events-none" />
          <div className="absolute -bottom-32 w-full h-80 bg-gradient-to-t from-[#D92D20]/20 via-[#F59E0B]/10 to-transparent blur-2xl pointer-events-none" />

          {/* Floating Rising Embers / Sparks */}
          <div className="absolute inset-x-0 bottom-1/4 h-80 pointer-events-none overflow-hidden max-w-xl mx-auto">
            {EMBERS.map((ember) => (
              <span
                key={ember.id}
                className="absolute rounded-full bg-gradient-to-t from-[#FF4500] to-[#FFD700] shadow-[0_0_8px_#FFA500] animate-ember"
                style={{
                  left: ember.left,
                  width: `${ember.size}px`,
                  height: `${ember.size}px`,
                  animationDelay: `${ember.delay}s`,
                  animationDuration: `${ember.duration}s`,
                  bottom: '10px',
                }}
              />
            ))}
          </div>

          {/* Central Logo & Orbital Rings Showcase */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-md px-6 space-y-7">
            {/* Logo Emblem Container with Orbital Glow Rings */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
              {/* Outer Counter-Clockwise Dotted Gold Ring */}
              <motion.svg
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="94"
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="1.5"
                  strokeDasharray="4 8"
                  opacity="0.6"
                />
              </motion.svg>

              {/* Inner Clockwise Segmented Golden Flame Ring */}
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 14, ease: 'linear' }}
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 200 200"
              >
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="#D92D20" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="86"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="2.5"
                  strokeDasharray="28 14"
                  strokeLinecap="round"
                  filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.45))"
                />
              </motion.svg>

              {/* Behind-Logo Fire Hearth Backlight */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-[#D92D20]/60 via-[#F59E0B]/50 to-transparent blur-xl pointer-events-none animate-pulse" />

              {/* The Official Oasis Pizza Logo Badge with Floating Breathing Physics */}
              <motion.div
                animate={{
                  y: [-4, 4, -4],
                  scale: [1, 1.025, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.6,
                  ease: 'easeInOut',
                }}
                className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-br from-[#F59E0B] via-[#D92D20] to-[#78350F] shadow-[0_12px_36px_rgba(217,45,32,0.5),0_0_24px_rgba(245,158,11,0.35)] overflow-hidden flex items-center justify-center group"
              >
                {/* Logo Image */}
                <img
                  src="/oasis-logo.png"
                  alt="Oasis Pizza Artisanal Logo"
                  className="w-full h-full object-cover rounded-full"
                />

                {/* Sweeping Metallic Glare Sheen across Logo */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
                  <div className="w-16 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent animate-sheen-sweep" />
                </div>
              </motion.div>
            </div>

            {/* Typography Header */}
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B] animate-spin-slow" />
                <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#F59E0B]">
                  Wood-Fired Artisanal Pizzeria
                </span>
                <Sparkles className="w-4 h-4 text-[#F59E0B] animate-spin-slow" />
              </motion.div>

              <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">
                OASIS <span className="text-[#D92D20]">PIZZA</span>
              </h1>

              <p className="text-xs tracking-wider text-amber-200/70 font-medium">
                FRESH PIZZA • HAPPIER PEOPLE
              </p>
            </div>

            {/* Staged Artisan Baking Message Ticker */}
            <div className="h-10 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stageIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="text-xs sm:text-sm text-slate-300 font-medium tracking-wide flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 text-[#D92D20] shrink-0 animate-bounce" />
                  <span>{message || HEARTH_STAGES[stageIndex]}</span>
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Glowing Oven Temperature & Progress Bar */}
            <div className="w-full space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#F59E0B]">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-ping" />
                  Wood-Stone Oven: 450°C
                </span>
                <span className="tabular-nums font-mono text-amber-300">{progress}%</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 rounded-full bg-black/50 p-0.5 border border-white/10 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#D92D20] via-[#F59E0B] to-[#FDE047] shadow-[0_0_12px_#F59E0B]"
                  initial={{ width: '15%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
            </div>

            {/* Optional dismiss button if triggered as preview */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-4 py-1.5 rounded-full text-xs font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              >
                Close Preview
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

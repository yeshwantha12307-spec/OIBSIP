import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppLoaderProps {
  isLoading: boolean;
  message?: string;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  isLoading,
  message = 'Preparing Wood-Fired Hearth...',
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF8EF] text-[#38251F] selection:bg-[#D92D20] selection:text-white"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-[#D92D20]/10 via-[#F59E0B]/15 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Central Logo & Pizza Animation */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#D92D20] to-[#A91F18] flex items-center justify-center shadow-glow-red"
            >
              <span className="text-5xl select-none">🍕</span>
            </motion.div>

            <div className="space-y-1.5">
              <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight text-[#38251F]">
                OASIS <span className="text-[#D92D20]">PIZZA</span>
              </h1>
              <p className="text-xs uppercase tracking-widest text-[#765747] font-semibold">
                Wood-Fired Artisanal Pizzeria
              </p>
            </div>

            {/* Spinner and Message */}
            <div className="flex items-center gap-3 pt-2 text-[#765747]">
              <div className="w-4 h-4 border-2 border-[#D92D20] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium tracking-wide">{message}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


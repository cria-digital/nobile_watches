"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
}

export function ErrorState({ title, description }: ErrorStateProps) {
  const [headerHeight, setHeaderHeight] = useState(96);

  useEffect(() => {
    const updateHeight = () => {
      const isMobile = window.innerWidth < 768;
      setHeaderHeight(isMobile ? 120 : 96);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      style={{ height: `calc(100vh - ${headerHeight}px)` }}
      className="flex w-full items-center justify-center px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="backdrop-blur-xl bg-white/30 dark:bg-neutral-900/30 shadow-lg rounded-3xl p-12 max-w-lg w-full border border-white/20 dark:border-neutral-700/30"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <h1 className="font-lato text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            {title}
          </h1>

          {description && (
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md">
              {description}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

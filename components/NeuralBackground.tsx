
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const NeuralBackground: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
      {/* Deep Atmosphere */}
      <div className="absolute inset-0 atmosphere-bg opacity-40" />
      
      {/* Sonar Grid */}
      <div className="absolute inset-0 sonar-grid opacity-10" />

      {/* Floating Acoustic Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold-main/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Radial Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-main/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full translate-x-1/2 translate-y-1/2" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent h-1 w-full animate-scanline pointer-events-none" />
    </div>
  );
};

export default NeuralBackground;

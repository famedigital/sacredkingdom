'use client';

import { motion } from 'framer-motion';

interface PrayerFlagProps {
  className?: string;
  count?: number;
}

export function PrayerFlags({ className = '', count = 5 }: PrayerFlagProps) {
  // Traditional prayer flag colors: blue, white, red, green, yellow
  const flagColors = [
    'var(--prayer-blue)',
    '#FFFFFF',
    'var(--prayer-red)',
    'var(--prayer-green)',
    'var(--prayer-yellow)',
  ];

  return (
    <div className={`flex gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="relative w-8 h-24 rounded-sm shadow-lg"
          style={{
            backgroundColor: flagColors[i % flagColors.length],
          }}
          animate={{
            rotate: [0, 3, -3, 0],
            y: [0, -5, 5, 0],
          }}
          transition={{
            duration: 2 + i * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        >
          {/* Wind ripple effect */}
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5 + Math.random(),
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.2,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface FloatingPrayerFlagsProps {
  className?: string;
}

export function FloatingPrayerFlags({ className = '' }: FloatingPrayerFlagsProps) {
  return (
    <div className={`relative ${className}`}>
      {[0, 1, 2].map((row) => (
        <motion.div
          key={row}
          className="flex gap-2 mb-2"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0],
          }}
          transition={{
            duration: 3 + row,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {[0, 1, 2, 3, 4].map((col) => (
            <motion.div
              key={col}
              className="w-12 h-20 rounded-sm shadow-md"
              style={{
                backgroundColor: ['var(--prayer-blue)', '#FFFFFF', 'var(--prayer-red)', 'var(--prayer-green)', 'var(--prayer-yellow)'][col],
              }}
              animate={{
                rotate: [0, Math.sin(col) * 5, 0],
              }}
              transition={{
                duration: 4 + col * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: col * 0.1,
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

interface PrayerFlagBorderProps {
  children: React.ReactNode;
  className?: string;
}

export function PrayerFlagBorder({ children, className = '' }: PrayerFlagBorderProps) {
  const colors = ['var(--prayer-blue)', '#FFFFFF', 'var(--prayer-red)', 'var(--prayer-green)', 'var(--prayer-yellow)'];

  return (
    <div className={`relative p-8 ${className}`}>
      {/* Animated border using prayer flag colors */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        {colors.map((color, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 border-4 rounded-lg"
            style={{
              borderColor: color,
              transform: `scale(${1 + i * 0.02})`,
              opacity: 1 - i * 0.15,
            }}
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { motion, useInView, useReducedMotion, type UseInViewOptions } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
  /** Positive values trigger earlier (before fully in view). */
  viewportMargin?: string;
}

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.28,
  once = true,
  // Expand root so items reveal as they approach the viewport (not after they're blank)
  viewportMargin = '100px 0px',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once,
    amount: 0.05,
    margin: viewportMargin,
  } as UseInViewOptions);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = 16;
  const variants = {
    hidden: {
      opacity: 0.01, // avoid fully invisible blank flash if detection lags
      x: direction === 'left' ? -offset : direction === 'right' ? offset : 0,
      y: direction === 'up' ? offset : direction === 'down' ? -offset : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{
        duration,
        delay: Math.min(delay, 0.15),
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerChildren({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.04,
  once = true,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isInView = useInView(ref, {
    once,
    amount: 0.02,
    margin: '100px 0px',
  } as UseInViewOptions);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: Math.min(delay, 0.08),
        staggerChildren: Math.min(staggerDelay, 0.06),
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0.01,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={containerVariants}
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  id?: string;
  'aria-label'?: string;
  'aria-disabled'?: boolean;
}

export function MagneticButton({
  children,
  variant = 'default',
  className = '',
  style,
  disabled = false,
  type = 'button',
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 300 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const backgroundImage = useMotionTemplate`
    radial-gradient(
      ${isHovered ? '150px' : '0px'} circle at ${springX}px ${springY}px,
      ${variant === 'outline' ? 'var(--primary)' : 'rgba(255,255,255,0.15)'},
      transparent
    )
  `;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseStyles = 'relative overflow-hidden rounded-lg px-8 py-4 font-medium transition-all duration-300';
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:scale-105',
    outline: 'border-2 border-gray-800 text-gray-900 dark:border-gray-200 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800',
    ghost: 'hover:bg-muted text-foreground',
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={{ backgroundImage, ...style }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">{children}</span>
    </motion.button>
  );
}

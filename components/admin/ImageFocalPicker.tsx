'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_FOCAL_POINT,
  normalizeFocalPoint,
  type ImageFocalPoint,
} from '@/lib/image-focal';

type PreviewAspect = 'hero' | 'card';

interface ImageFocalPickerProps {
  imageUrl: string;
  value?: Partial<ImageFocalPoint> | null;
  onChange: (focal: ImageFocalPoint) => void;
  /** Frame shape for the live preview */
  aspect?: PreviewAspect;
  className?: string;
  label?: string;
}

const ASPECT_CLASS: Record<PreviewAspect, string> = {
  hero: 'aspect-[16/9]',
  card: 'aspect-[4/3]',
};

export function ImageFocalPicker({
  imageUrl,
  value,
  onChange,
  aspect = 'hero',
  className,
  label = 'Adjust visible area',
}: ImageFocalPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const focal = normalizeFocalPoint(value?.x, value?.y);
  const [isDragging, setIsDragging] = useState(false);

  const setFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      onChange(normalizeFocalPoint(x, y));
    },
    [onChange]
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    setFromPointer(e.clientX, e.clientY);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  };

  const reset = () => onChange({ ...DEFAULT_FOCAL_POINT });

  if (!imageUrl) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            Drag to choose which part of the photo stays visible.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          Reset center
        </button>
      </div>

      <div
        ref={containerRef}
        role="slider"
        aria-label="Image focal point"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`Horizontal ${Math.round(focal.x)} percent, vertical ${Math.round(focal.y)} percent`}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 5 : 2;
          let next = { ...focal };
          if (e.key === 'ArrowLeft') next.x -= step;
          else if (e.key === 'ArrowRight') next.x += step;
          else if (e.key === 'ArrowUp') next.y -= step;
          else if (e.key === 'ArrowDown') next.y += step;
          else return;
          e.preventDefault();
          onChange(normalizeFocalPoint(next.x, next.y));
        }}
        className={cn(
          'relative w-full cursor-crosshair overflow-hidden rounded-lg border border-border bg-muted select-none touch-none',
          ASPECT_CLASS[aspect],
          isDragging && 'ring-2 ring-primary/40'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full object-cover"
          style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
        />

        {/* Focal pin */}
        <div
          className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
        >
          <span className="absolute inset-0 rounded-full border-2 border-white bg-primary/80 shadow-md ring-2 ring-black/20" />
          <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </div>

        {/* Crosshair guides while dragging */}
        {isDragging && (
          <>
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/50"
              style={{ left: `${focal.x}%` }}
            />
            <div
              className="pointer-events-none absolute right-0 left-0 h-px bg-white/50"
              style={{ top: `${focal.y}%` }}
            />
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Focus: {Math.round(focal.x)}% across, {Math.round(focal.y)}% down
      </p>
    </div>
  );
}

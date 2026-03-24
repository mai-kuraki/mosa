import React, { useState, useCallback, useRef } from "react";
import styles from "./CompareSlider.module.less";

interface CompareSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

const CompareSlider: React.FC<CompareSliderProps> = ({
  beforeSrc,
  afterSrc,
  beforeLabel = "RAW",
  afterLabel = "M9",
}) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePosition = useCallback((clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = Math.max(5, Math.min(95, (y / rect.height) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientY);
    },
    [updatePosition]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current) return;
      updatePosition(e.clientY);
    },
    [updatePosition]
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Bottom layer: RAW (before) */}
      <img src={beforeSrc} alt={beforeLabel} className={styles.imageLayer} />

      {/* Top layer: Processed (after), clipped from top */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className={styles.imageLayer}
        style={{ clipPath: `inset(0 0 ${100 - position}% 0)` }}
      />

      {/* Handle line */}
      <div className={styles.handle} style={{ top: `${position}%` }}>
        {/* Labels */}
        <span className={`${styles.label} ${styles.labelTop}`}>{afterLabel}</span>
        <span className={`${styles.label} ${styles.labelBottom}`}>{beforeLabel}</span>

        {/* Grip icon */}
        <div className={styles.handleGrip}>
          <svg className={styles.arrow} viewBox="0 0 8 5">
            <polyline points="0,4 4,0 8,4" />
          </svg>
          <svg className={styles.arrow} viewBox="0 0 8 5">
            <polyline points="0,1 4,5 8,1" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CompareSlider;

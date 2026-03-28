import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CompareSlider from "../components/home/CompareSlider";
import ActionPanel from "../components/home/ActionPanel";
import styles from "./home.module.less";

const beforeImg = "showcase/exp_before.jpg";
const afterImg = "showcase/exp_after.jpg";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const expandingRef = useRef(false);

  const handleStart = useCallback(
    (btnRect: DOMRect) => {
      if (expandingRef.current) return;
      expandingRef.current = true;

      const x = btnRect.left + btnRect.width / 2;
      const y = btnRect.top + btnRect.height / 2;
      setOrigin({ x, y });

      // Navigate after the clip-path transition finishes
      setTimeout(() => {
        navigate("/workspace");
      }, 850);
    },
    [navigate],
  );

  return (
    <div className={styles.page}>
      {/* Invisible drag region for native traffic lights */}
      <div className={styles.dragRegion} />

      <div className={styles.actionArea}>
        <ActionPanel onStart={handleStart} />
      </div>
      <div className={styles.compareArea}>
        <CompareSlider
          beforeSrc={beforeImg}
          afterSrc={afterImg}
          beforeLabel="RAW"
          afterLabel="M9"
        />
      </div>

      {origin && <TransitionOverlay x={origin.x} y={origin.y} />}
    </div>
  );
};

/**
 * Renders a fixed overlay that expands from (x, y) via clip-path circle.
 * Uses a two-frame trick: mount at radius 0, then expand to fill screen.
 */
const TransitionOverlay: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const [expanded, setExpanded] = useState(false);

  React.useEffect(() => {
    // Double rAF to ensure the initial clip-path is painted before transitioning
    const id1 = requestAnimationFrame(() => {
      const id2 = requestAnimationFrame(() => {
        setExpanded(true);
      });
      return () => cancelAnimationFrame(id2);
    });
    return () => cancelAnimationFrame(id1);
  }, []);

  return (
    <div
      className={styles.transitionOverlay}
      style={{
        clipPath: expanded
          ? `circle(150vmax at ${x}px ${y}px)`
          : `circle(0px at ${x}px ${y}px)`,
      }}
    />
  );
};

export default HomePage;

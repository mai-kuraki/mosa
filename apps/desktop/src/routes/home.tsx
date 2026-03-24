import React, { useState, useEffect } from "react";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";
import CompareSlider from "../components/home/CompareSlider";
import ActionPanel from "../components/home/ActionPanel";
import styles from "./home.module.less";

const beforeImg = "showcase/exp_before.jpg";
const afterImg = "showcase/exp_after.jpg";

const HomePage: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const unsub = window.mosaApi?.on("window:maximized-change", (data) => {
      setIsMaximized(data as boolean);
    });
    return () => {
      unsub?.();
    };
  }, []);

  const handleMinimize = () => {
    window.mosaApi?.invoke(IPC_CHANNELS.WINDOW_MINIMIZE);
  };
  const handleMaximize = () => {
    window.mosaApi?.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE);
  };
  const handleClose = () => {
    window.mosaApi?.invoke(IPC_CHANNELS.WINDOW_CLOSE);
  };

  return (
    <div className={styles.page}>
      {/* Invisible drag region */}
      <div className={styles.dragRegion} />

      {/* Floating window controls */}
      <div className={styles.windowControls}>
        <button className={styles.ctrlBtn} onClick={handleMinimize} title="Minimize">
          <svg className={styles.ctrlIcon} viewBox="0 0 10 10">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button className={styles.ctrlBtn} onClick={handleMaximize} title="Maximize">
          {isMaximized ? (
            <svg className={styles.ctrlIcon} viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" fill="#F5F5F5" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg className={styles.ctrlIcon} viewBox="0 0 10 10">
              <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button className={`${styles.ctrlBtn} ${styles.ctrlBtnClose}`} onClick={handleClose} title="Close">
          <svg className={styles.ctrlIcon} viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>

      <div className={styles.compareArea}>
        <CompareSlider
          beforeSrc={beforeImg}
          afterSrc={afterImg}
          beforeLabel="RAW"
          afterLabel="M9"
        />
      </div>
      <div className={styles.actionArea}>
        <ActionPanel />
      </div>
    </div>
  );
};

export default HomePage;

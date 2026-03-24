import React, { useState, useEffect } from "react";
import { IPC_CHANNELS } from "@mosa/ipc-bridge";
import styles from "./TitleBar.module.less";

const TitleBar: React.FC = () => {
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
    <div className={styles.titleBar}>
      <span className={styles.brand}>Mosa</span>
      <div className={styles.spacer} />
      <div className={styles.controls}>
        <button className={styles.btn} onClick={handleMinimize} title="Minimize">
          <svg className={styles.icon} viewBox="0 0 10 10">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
        <button className={styles.btn} onClick={handleMaximize} title="Maximize">
          {isMaximized ? (
            <svg className={styles.icon} viewBox="0 0 10 10">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="2" width="8" height="8" fill="var(--titlebar-bg)" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg className={styles.icon} viewBox="0 0 10 10">
              <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button className={`${styles.btn} ${styles.btnClose}`} onClick={handleClose} title="Close">
          <svg className={styles.icon} viewBox="0 0 10 10">
            <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" />
            <line x1="10" y1="0" x2="0" y2="10" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;

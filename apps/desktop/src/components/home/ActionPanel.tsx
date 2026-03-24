import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ActionPanel.module.less";

const ActionPanel: React.FC = () => {
  const navigate = useNavigate();

  const handleImport = () => {
    // TODO: Open folder dialog via IPC, then navigate to library
    navigate("/library");
  };

  return (
    <div className={styles.panel}>
      <div className={styles.branding}>
        <span className={styles.logo}>Mosa</span>
        <p className={styles.slogan}>
          Reconstruct the
          <br />
          Logic of Light.
        </p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleImport}>
          <svg className={styles.plusIcon} viewBox="0 0 14 14">
            <line x1="7" y1="0" x2="7" y2="14" />
            <line x1="0" y1="7" x2="14" y2="7" />
          </svg>
          Import
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => navigate("/library")}
        >
          Library
        </button>
        <button
          className={styles.btnSecondary}
          onClick={() => navigate("/settings")}
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default ActionPanel;

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
      <div className={styles.content}>
        {/* Hero: Logo + Product name */}
        <div className={styles.hero}>
          <img src="/logo.svg" alt="Mosa" className={styles.logo} />
          <h1 className={styles.productName}>osa</h1>
        </div>

        {/* Slogan */}
        <div className={styles.sloganBlock}>
          <p className={styles.sloganEn}>
            Reconstruct the<br/>Logic of Light.
          </p>
          <p className={styles.sloganCn}>重构光的逻辑，<br/>解构色彩边界，重新定义决定性瞬间。</p>
        </div>
        <div style={{ flex: 1 }}/>
        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleImport}>
            导入照片
          </button>
          <button
            className={styles.btnOutline}
            onClick={() => navigate("/library")}
            >
                图库
            </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;

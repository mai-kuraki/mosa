import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./settings.module.less";

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
      </header>
      <div className={styles.body}>
        <div className={styles.content}>
          <section>
            <h2 className={styles.sectionTitle}>Export Defaults</h2>
            <div className={styles.sectionBody}>
              <p>Format: JPEG</p>
              <p>Quality: 90</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>Watermark</h2>
            <div className={styles.sectionBody}>
              <p>Disabled</p>
            </div>
          </section>

          <section>
            <h2 className={styles.sectionTitle}>About</h2>
            <div className={styles.sectionBody}>
              <p>Mosa v0.1.0</p>
              <p>Apache License 2.0</p>
            </div>
          </section>

          {/* TODO: 临时调试按钮，后续移除 */}
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: 24,
              padding: "8px 20px",
              fontSize: 13,
              cursor: "pointer",
              border: "1px solid #ccc",
              borderRadius: 6,
              background: "#fff",
            }}
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

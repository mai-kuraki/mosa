import React from "react";
import { useNavigate } from "react-router-dom";
import TextType from "../reactbits/TextType";
import FocusIcon from '../../../resources/icons/focus.png';
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
          <TextType
            text={[
              "Reconstruct the Logic of Light.",
              "Deconstructing color, Redefining the moment",
            ]}
            className={styles.sloganEn}
            typingSpeed={60}
            deletingSpeed={30}
            pauseDuration={3000}
            initialDelay={500}
            loop
            showCursor
            cursorCharacter="_"
            cursorClassName={styles.sloganCursor}
          />
          <p className={styles.sloganCn}>重构光的逻辑，<br/>解构色彩边界，重新定义决定性瞬间。</p>
        </div>
        <div style={{ flex: 1 }}/>
        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleImport}>
            开始重构影调<img style={{ width: 22, marginLeft: 10 }} src="/icons/arrow-right.svg" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;

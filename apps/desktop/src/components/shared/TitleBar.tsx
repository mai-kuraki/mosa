import React from "react";
import styles from "./TitleBar.module.less";

const TitleBar: React.FC = () => {
  return (
    <div className={styles.titleBar}>
      <span className={styles.brand}>Mosa</span>
    </div>
  );
};

export default TitleBar;

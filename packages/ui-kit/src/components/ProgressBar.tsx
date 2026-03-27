import React from "react";
import classnames from "classnames";
import styles from "./ProgressBar.module.less";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, label, className }) => {
  const percent = Math.round((value / max) * 100);

  return (
    <div className={classnames(styles.container, className)}>
      {label && (
        <div className={styles.labelRow}>
          <span>{label}</span>
          <span className={styles.value}>{percent}%</span>
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;

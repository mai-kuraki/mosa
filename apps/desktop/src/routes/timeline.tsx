import React from "react";
import styles from "./timeline.module.less";

const TimelinePage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.empty}>
        <div>
          <p className={styles.emptyTitle}>时光</p>
          <p className={styles.emptyHint}>记录每一次影调重构的历程</p>
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;

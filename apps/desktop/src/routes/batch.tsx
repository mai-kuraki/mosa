import React from "react";
import styles from "./batch.module.less";

const BatchPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Batch Processing</h1>
      </header>
      <div className={styles.empty}>
        <div>
          <p className={styles.emptyTitle}>No batch jobs</p>
          <p className={styles.emptyHint}>Select images in Library and start batch processing</p>
        </div>
      </div>
    </div>
  );
};

export default BatchPage;
